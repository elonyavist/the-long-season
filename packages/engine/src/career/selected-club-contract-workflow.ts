import {
  careerInboxMessageId,
  createCareerInboxMessage,
  createContractAttentionEvent,
  type CareerAttentionEvent,
  type CareerInboxMessage,
  type CareerInboxMessageId,
  type CareerState,
  type ContractNegotiation,
  type GameDate,
  type PlayerContract,
  type SeasonTransferWindows,
} from "@game/domain";

import {
  deliverCareerInboxMessages,
  reconcileCareerInboxResolution,
} from "./career-inbox-lifecycle.ts";
import {
  continueCareerUntilAttention,
  type ContinueCareerUntilAttentionResult,
} from "./continue-career.ts";
import { advanceContractNegotiations } from "./contract-negotiation.ts";
import {
  advanceSelectedClubMarketLifecycles,
  isSelectedClubMarketMessageResolved,
  nextSelectedClubMarketDueDate,
  projectSelectedClubMarketAttention,
} from "./selected-club-market-workflow.ts";

const RENEWAL_REMINDER_DAYS = 243;
const FINAL_EXPIRY_DECISION_DAYS = 30;

/** One contract attention fact and its durable Posta projection. */
export interface SelectedClubContractAttention {
  readonly event: CareerAttentionEvent;
  readonly message: CareerInboxMessage;
}

/** Result of advancing selected-club talks through the canonical stop rule. */
export interface AdvanceSelectedClubWorkflowsToAttentionResult {
  readonly careerState: CareerState;
  readonly result: ContinueCareerUntilAttentionResult;
}

/**
 * Projects every selected-club contract fact due through one explicit date.
 *
 * The projection is derived from contracts and negotiations; Posta never owns
 * the underlying renewal or release decision.
 */
export function projectSelectedClubContractAttention(
  careerState: CareerState,
  throughDate: GameDate,
): readonly SelectedClubContractAttention[] {
  const senior = careerState.seniorSquadState;
  if (senior === undefined) return [];

  const projected: SelectedClubContractAttention[] = [];
  for (const contractId of senior.activeContractIds) {
    const contract = senior.contracts[contractId];
    if (contract?.clubId !== careerState.selectedClubId) continue;
    const reminderDate = (contract.endsOn - RENEWAL_REMINDER_DAYS) as GameDate;
    if (reminderDate <= throughDate) projected.push(createRenewalReminder(contract, reminderDate));

    const decisionDate = (contract.endsOn - FINAL_EXPIRY_DECISION_DAYS) as GameDate;
    if (decisionDate <= throughDate) {
      projected.push(createExpiryDecision(careerState, contract, decisionDate));
    }
  }

  for (const negotiationId of careerState.contractNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.contractNegotiationState?.negotiations[negotiationId];
    if (negotiation?.clubId !== careerState.selectedClubId) continue;
    const attention = createNegotiationAttention(negotiation, throughDate);
    if (attention !== undefined) projected.push(attention);
  }

  return projected.sort((left, right) => compareMessages(left.message, right.message));
}

/**
 * Advances delayed selected-club responses without crossing an earlier stop.
 *
 * Contract and market responses are previewed one due date at a time. Only
 * state reached on or before the resulting stop date is returned and delivered
 * to Posta. Market lifecycles that need the resolved window catalog stay
 * untouched when `transferWindows` is not supplied.
 */
export function advanceSelectedClubWorkflowsToAttention(input: {
  readonly careerState: CareerState;
  readonly boundaryDate: GameDate;
  readonly additionalMessages?: readonly CareerInboxMessage[];
  readonly transferWindows?: SeasonTransferWindows;
}): AdvanceSelectedClubWorkflowsToAttentionResult {
  const startDate = input.careerState.gameState.calendar.currentDate;
  const boundaryDate = input.boundaryDate < startDate ? startDate : input.boundaryDate;
  let working = reconcileCareerInboxResolution(input.careerState);
  let messages = mergeMessages(
    working.currentSeasonInbox ?? [],
    input.additionalMessages ?? [],
    projectSelectedClubContractAttention(working, boundaryDate).map(({ message }) => message),
    projectSelectedClubMarketAttention(working, boundaryDate),
  );

  while (true) {
    const nextContractDueDate = nextSelectedClubNegotiationDueDate(working, boundaryDate);
    const nextMarketDueDate = nextSelectedClubMarketDueDate(working, boundaryDate);
    const nextDueDate = nextContractDueDate === undefined
      ? nextMarketDueDate
      : nextMarketDueDate === undefined
        ? nextContractDueDate
        : nextContractDueDate < nextMarketDueDate
          ? nextContractDueDate
          : nextMarketDueDate;
    if (nextDueDate === undefined) {
      return finish(working, continueCareerUntilAttention({ currentDate: startDate, boundaryDate, messages }));
    }

    if (nextDueDate > startDate) {
      const beforeDueDate = (nextDueDate - 1) as GameDate;
      const beforeDue = continueCareerUntilAttention({
        currentDate: startDate,
        boundaryDate: beforeDueDate,
        messages,
      });
      if (beforeDue.stopReason === "attention") return finish(working, beforeDue);
    }

    working = advanceContractNegotiations(working, nextDueDate, working.selectedClubId).careerState;
    working = advanceSelectedClubMarketLifecycles({
      careerState: working,
      throughDate: nextDueDate,
      ...(input.transferWindows === undefined ? {} : { transferWindows: input.transferWindows }),
    });
    messages = mergeMessages(
      messages,
      projectSelectedClubContractAttention(working, boundaryDate).map(({ message }) => message),
      projectSelectedClubMarketAttention(working, boundaryDate),
    );
    messages = refreshProjectedContractResolution(working, messages);
    messages = refreshProjectedMarketResolution(working, messages);
    const onDueDate = continueCareerUntilAttention({
      currentDate: startDate,
      boundaryDate: nextDueDate,
      messages,
    });
    if (onDueDate.stopReason === "attention") return finish(working, onDueDate);
  }
}

function createRenewalReminder(
  contract: PlayerContract,
  date: GameDate,
): SelectedClubContractAttention {
  const event = createContractAttentionEvent({
    contractId: contract.id,
    clubId: contract.clubId,
    playerId: contract.playerId,
    date,
    level: "important",
    reason: "contract_reminder",
    continuePolicy: "never",
  });
  return {
    event,
    message: createCareerInboxMessage({
      id: careerInboxMessageId(`inbox:contract-reminder:${contract.id}`),
      date,
      category: "contract_reminder",
      source: "contract_office",
      level: "important",
      continuePolicy: "never",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: event.related,
      actionIds: ["open_contract_negotiation"],
    }),
  };
}

function createExpiryDecision(
  careerState: CareerState,
  contract: PlayerContract,
  date: GameDate,
): SelectedClubContractAttention {
  const releaseDecision = selectedContractNegotiations(careerState).find((negotiation) =>
    negotiation.currentContractId === contract.id && negotiation.status === "release_at_expiry",
  );
  const resolved = releaseDecision !== undefined;
  const event = createContractAttentionEvent({
    contractId: contract.id,
    ...(releaseDecision === undefined ? {} : { contractNegotiationId: releaseDecision.id }),
    clubId: contract.clubId,
    playerId: contract.playerId,
    date,
    level: "blocking",
    reason: "contract_expiry_decision",
    continuePolicy: "until_resolved",
  });
  return {
    event,
    message: createCareerInboxMessage({
      id: careerInboxMessageId(`inbox:contract-expiry-decision:${contract.id}`),
      date,
      category: "contract_expiry_decision",
      source: "contract_office",
      level: "blocking",
      continuePolicy: "until_resolved",
      lifecycle: { read: false, acknowledged: false, resolved },
      related: event.related,
      actionIds: resolved ? [] : ["open_contract_negotiation", "release_player_at_expiry"],
    }),
  };
}

function createNegotiationAttention(
  negotiation: ContractNegotiation,
  throughDate: GameDate,
): SelectedClubContractAttention | undefined {
  if (negotiation.status === "countered" && negotiation.counterOffer.issuedOn <= throughDate) {
    return createNegotiationMessage(negotiation, {
      date: negotiation.counterOffer.issuedOn,
      category: "contract_counteroffer",
      reason: "contract_counteroffer",
      level: "blocking",
      continuePolicy: "until_resolved",
      resolved: false,
      actionIds: ["open_contract_negotiation"],
    });
  }
  if (negotiation.status === "accepted" && negotiation.acceptedOn <= throughDate) {
    return createNegotiationMessage(negotiation, {
      date: negotiation.acceptedOn,
      category: "contract_accepted",
      reason: "contract_accepted",
      level: "important",
      continuePolicy: "never",
      resolved: true,
      actionIds: [],
    });
  }
  if (negotiation.status === "rejected" && negotiation.rejectedOn <= throughDate) {
    return createNegotiationMessage(negotiation, {
      date: negotiation.rejectedOn,
      category: "contract_rejected",
      reason: "contract_rejected",
      level: "important",
      continuePolicy: "never",
      resolved: true,
      actionIds: [],
    });
  }
  return undefined;
}

function createNegotiationMessage(
  negotiation: ContractNegotiation,
  input: {
    readonly date: GameDate;
    readonly category: "contract_counteroffer" | "contract_accepted" | "contract_rejected";
    readonly reason: "contract_counteroffer" | "contract_accepted" | "contract_rejected";
    readonly level: "blocking" | "important";
    readonly continuePolicy: "never" | "until_resolved";
    readonly resolved: boolean;
    readonly actionIds: CareerInboxMessage["actionIds"];
  },
): SelectedClubContractAttention {
  const event = createContractAttentionEvent({
    contractId: negotiation.currentContractId,
    contractNegotiationId: negotiation.id,
    clubId: negotiation.clubId,
    playerId: negotiation.playerId,
    date: input.date,
    level: input.level,
    reason: input.reason,
    continuePolicy: input.continuePolicy,
  });
  return {
    event,
    message: createCareerInboxMessage({
      id: careerInboxMessageId(`inbox:${input.category}:${negotiation.id}`),
      date: input.date,
      category: input.category,
      source: "contract_office",
      level: input.level,
      continuePolicy: input.continuePolicy,
      lifecycle: { read: false, acknowledged: false, resolved: input.resolved },
      related: event.related,
      actionIds: input.actionIds,
    }),
  };
}

function nextSelectedClubNegotiationDueDate(
  careerState: CareerState,
  boundaryDate: GameDate,
): GameDate | undefined {
  const currentDate = careerState.gameState.calendar.currentDate;
  let earliest: GameDate | undefined;
  for (const negotiation of selectedContractNegotiations(careerState)) {
    const candidate = negotiation.status === "awaiting_response"
      ? negotiation.submittedOffer.responseDueOn
      : negotiation.status === "countered"
        ? negotiation.counterOffer.expiresOn
        : undefined;
    if (candidate === undefined || candidate > boundaryDate) continue;
    const dueDate = candidate < currentDate ? currentDate : candidate;
    if (earliest === undefined || dueDate < earliest) earliest = dueDate;
  }
  return earliest;
}

function selectedContractNegotiations(careerState: CareerState): readonly ContractNegotiation[] {
  return (careerState.contractNegotiationState?.negotiationIds ?? []).flatMap((id) => {
    const negotiation = careerState.contractNegotiationState?.negotiations[id];
    return negotiation?.clubId === careerState.selectedClubId ? [negotiation] : [];
  });
}

function refreshProjectedMarketResolution(
  careerState: CareerState,
  messages: readonly CareerInboxMessage[],
): readonly CareerInboxMessage[] {
  return messages.map((message) => {
    if (!message.category.startsWith("market_") || message.lifecycle.resolved) return message;
    return isSelectedClubMarketMessageResolved(careerState, message)
      ? createCareerInboxMessage({ ...message, lifecycle: { ...message.lifecycle, resolved: true } })
      : message;
  });
}

function finish(
  careerState: CareerState,
  result: ContinueCareerUntilAttentionResult,
): AdvanceSelectedClubWorkflowsToAttentionResult {
  return {
    careerState: reconcileCareerInboxResolution(
      deliverCareerInboxMessages(careerState, result.inboxMessages),
    ),
    result,
  };
}

function mergeMessages(
  ...collections: readonly (readonly CareerInboxMessage[])[]
): readonly CareerInboxMessage[] {
  const byId = new Map<CareerInboxMessageId, CareerInboxMessage>();
  for (const messages of collections) {
    for (const message of messages) byId.set(message.id, message);
  }
  return [...byId.values()].sort(compareMessages);
}

function refreshProjectedContractResolution(
  careerState: CareerState,
  messages: readonly CareerInboxMessage[],
): readonly CareerInboxMessage[] {
  const activeContractIds = new Set(careerState.seniorSquadState?.activeContractIds ?? []);
  return messages.map((message) => {
    if (!message.category.startsWith("contract_") || message.lifecycle.resolved) return message;
    const negotiationId = message.related.contractNegotiationId;
    const negotiation = negotiationId === undefined
      ? undefined
      : careerState.contractNegotiationState?.negotiations[negotiationId];
    const contractId = message.related.contractId;
    const contractNegotiation = negotiation
      ?? (contractId === undefined
        ? undefined
        : selectedContractNegotiations(careerState).find((candidate) =>
            candidate.currentContractId === contractId,
          ));
    const resolved = message.category === "contract_counteroffer"
      ? contractNegotiation !== undefined && contractNegotiation.status !== "countered"
      : message.category === "contract_expiry_decision"
        ? contractId === undefined
          || !activeContractIds.has(contractId)
          || contractNegotiation?.status === "release_at_expiry"
        : message.category === "contract_reminder"
          ? contractId === undefined || !activeContractIds.has(contractId)
          : true;
    return resolved
      ? createCareerInboxMessage({ ...message, lifecycle: { ...message.lifecycle, resolved: true } })
      : message;
  });
}

function compareMessages(left: CareerInboxMessage, right: CareerInboxMessage): number {
  if (left.date !== right.date) return left.date - right.date;
  const rank = { blocking: 0, important: 1, informational: 2 } as const;
  const levelDifference = rank[left.level] - rank[right.level];
  return levelDifference !== 0
    ? levelDifference
    : String(left.id).localeCompare(String(right.id));
}
