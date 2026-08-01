import {
  activateRenewedPlayerContract,
  activateRenewedPlayerContracts,
  contractNegotiationId,
  createContractNegotiationState,
  createEmptyContractNegotiationState,
  ContractNegotiationStateError,
  gameDate,
  isOpenContractNegotiation,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  publishContractNegotiation as publishContractNegotiationState,
  type AcceptedContractNegotiation,
  type ActivateRenewedPlayerContractInput,
  type CareerState,
  type ClubId,
  type ContractNegotiation,
  type ContractNegotiationId,
  type ContractNegotiationState,
  type ContractOfferEvaluation,
  type ContractOfferTerms,
  type GameDate,
  type GameState,
  type PlayerContract,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type SeniorSquadState,
} from "@game/domain";
import { addDays, deriveRng, fromISO, toISO } from "@game/shared";

import {
  applyContractActivationFinance,
  applyContractActivationsFinance,
  checkContractOfferAffordability,
  type CareerFinanceRejectionReason,
} from "./career-finance-lifecycle.ts";
import { deriveContractDemand, evaluateContractOffer } from "./contract-negotiation-demand.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import { derivePublicPlayerAssessment } from "../squad/public-player-assessment.ts";

const RESPONSE_DELAY_MIN_DAYS = 2;
const RESPONSE_DELAY_MAX_DAYS = 6;
const COUNTER_OFFER_VALID_DAYS = 14;

/** Input for removing completed operational talks after agreements close. */
export interface ReconcileClosedContractNegotiationsInput {
  /** World snapshot after the ownership or registration transition. */
  readonly gameState: Pick<GameState, "players" | "clubs">;
  /** Senior-squad snapshot where the supplied contracts are no longer active. */
  readonly seniorSquadState: SeniorSquadState;
  /** Existing operational negotiation collection, when the career has one. */
  readonly contractNegotiationState?: ContractNegotiationState | undefined;
  /** Agreements closed by the same atomic career transition. */
  readonly closedContractIds: readonly PlayerContract["id"][];
}

/**
 * Removes talks that cannot remain actionable after their contracts close.
 *
 * Contract history remains the canonical immutable record of signings,
 * renewals, transfers, expiries, and releases. The negotiation collection is
 * the operational workflow: an accepted row tied to a now-ended agreement, or
 * an open row negotiating that ended agreement, must not survive the same
 * transition and invalidate the next career snapshot.
 */
export function reconcileClosedContractNegotiations(
  input: ReconcileClosedContractNegotiationsInput,
): ContractNegotiationState | undefined {
  const state = input.contractNegotiationState;
  if (state === undefined || input.closedContractIds.length === 0) return state;

  const closedContractIds = new Set(input.closedContractIds);
  const negotiations: Record<ContractNegotiationId, ContractNegotiation> = {};
  const negotiationIds: ContractNegotiationId[] = [];
  let changed = false;

  for (const negotiationId of state.negotiationIds) {
    const negotiation = state.negotiations[negotiationId];
    if (negotiation === undefined) continue;
    const acceptedAgreementClosed = negotiation.status === "accepted"
      && closedContractIds.has(negotiation.activatedContractId);
    const negotiatedAgreementClosed = isOpenContractNegotiation(negotiation)
      && closedContractIds.has(negotiation.currentContractId);
    if (acceptedAgreementClosed || negotiatedAgreementClosed) {
      changed = true;
      continue;
    }
    negotiations[negotiationId] = negotiation;
    negotiationIds.push(negotiationId);
  }

  return changed
    ? createContractNegotiationState(input.gameState, input.seniorSquadState, {
        negotiations,
        negotiationIds,
      })
    : state;
}

/** Reasons a contract command can reject without changing career state. */
export type ContractNegotiationRejectionReason =
  | CareerFinanceRejectionReason
  | "senior_squad_state_missing"
  | "negotiation_not_found"
  | "negotiation_not_actionable"
  | "active_contract_not_found"
  | "current_contract_expired"
  | "duplicate_open_negotiation"
  | "not_selected_club"
  | "selected_club_requires_user_decision"
  | "invalid_command_date"
  | "invalid_offer_terms";

/** Stable structured fact emitted by a successful negotiation command. */
export interface ContractNegotiationFact {
  readonly negotiationId: ContractNegotiationId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  readonly event:
    | "draft_created"
    | "offer_submitted"
    | "player_accepted"
    | "player_countered"
    | "player_rejected"
    | "club_accepted_counter"
    | "club_rejected_counter"
    | "club_could_not_complete"
    | "club_withdrew"
    | "club_revised_offer"
    | "club_chose_release_at_expiry"
    | "negotiation_expired";
  /** Present when the event was caused by a stable command rejection. */
  readonly reason?: ContractNegotiationRejectionReason;
}

/** Applied contract command with the new immutable career snapshot. */
export interface ContractNegotiationApplied {
  readonly status: "applied";
  readonly careerState: CareerState;
  readonly negotiation: ContractNegotiation;
  readonly facts: readonly ContractNegotiationFact[];
}

/** Rejected contract command preserving the exact input career reference. */
export interface ContractNegotiationRejected {
  readonly status: "rejected";
  readonly careerState: CareerState;
  readonly reason: ContractNegotiationRejectionReason;
  readonly negotiationId?: ContractNegotiationId;
}

/** Result shared by every explicit negotiation command. */
export type ContractNegotiationCommandResult = ContractNegotiationApplied | ContractNegotiationRejected;

/** Input for opening one editable renewal draft. */
export interface CreateContractNegotiationDraftInput {
  readonly careerState: CareerState;
  readonly negotiationId: ContractNegotiationId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly createdOn: GameDate;
  readonly terms: ContractOfferTerms;
}

/** Opens one editable renewal against the player's current active agreement. */
export function createContractNegotiationDraft(
  input: CreateContractNegotiationDraftInput,
): ContractNegotiationCommandResult {
  const seniorSquadState = input.careerState.seniorSquadState;
  if (seniorSquadState === undefined) return rejected(input.careerState, "senior_squad_state_missing");
  if (hasOpenNegotiation(input.careerState, input.playerId, input.clubId)) {
    return rejected(input.careerState, "duplicate_open_negotiation", input.negotiationId);
  }
  const currentContract = activeContractFor(seniorSquadState, input.playerId, input.clubId);
  if (currentContract === undefined) return rejected(input.careerState, "active_contract_not_found", input.negotiationId);
  if (currentContract.endsOn <= input.createdOn) {
    return rejected(input.careerState, "current_contract_expired", input.negotiationId);
  }

  const negotiation: ContractNegotiation = {
    id: input.negotiationId,
    playerId: input.playerId,
    clubId: input.clubId,
    currentContractId: currentContract.id,
    createdOn: input.createdOn,
    status: "draft",
    draft: { createdOn: input.createdOn, terms: input.terms },
  };
  const next = publishNegotiation(input.careerState, negotiation, true);
  if (next === undefined) return rejected(input.careerState, "invalid_offer_terms", input.negotiationId);
  return applied(next, negotiation, fact(negotiation, input.createdOn, "draft_created"));
}

/** Input for changing an editable draft or responding to a player counter. */
export interface ReviseContractOfferInput {
  readonly careerState: CareerState;
  readonly negotiationId: ContractNegotiationId;
  readonly revisedOn: GameDate;
  readonly terms: ContractOfferTerms;
}

/**
 * Reopens the current discussion as an editable club offer.
 *
 * Submitted offers cannot be changed while the player response is pending;
 * a counteroffer can be answered with one explicit revised proposal.
 */
export function reviseContractOffer(input: ReviseContractOfferInput): ContractNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.careerState, "negotiation_not_found", input.negotiationId);
  if (negotiation.status !== "draft" && negotiation.status !== "countered") {
    return rejected(input.careerState, "negotiation_not_actionable", input.negotiationId);
  }
  if (input.revisedOn < negotiation.createdOn) {
    return rejected(input.careerState, "invalid_command_date", input.negotiationId);
  }

  const revised: ContractNegotiation = {
    id: negotiation.id,
    playerId: negotiation.playerId,
    clubId: negotiation.clubId,
    currentContractId: negotiation.currentContractId,
    createdOn: negotiation.createdOn,
    status: "draft",
    draft: { createdOn: input.revisedOn, terms: input.terms },
  };
  const next = publishNegotiation(input.careerState, revised);
  if (next === undefined) return rejected(input.careerState, "invalid_offer_terms", input.negotiationId);
  return applied(next, revised, fact(revised, input.revisedOn, "club_revised_offer"));
}

/** Input for one explicit selected-club renewal proposal. */
export interface OfferSelectedClubRenewalInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly negotiationId: ContractNegotiationId;
  readonly playerId: PlayerId;
  readonly offeredOn: GameDate;
  readonly terms: ContractOfferTerms;
}

/** Input for atomically creating and submitting one explicit club renewal. */
export interface OfferContractRenewalInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly negotiationId: ContractNegotiationId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly offeredOn: GameDate;
  readonly terms: ContractOfferTerms;
}

/**
 * Builds one submitted renewal without publishing a career snapshot.
 *
 * The explicit command and deterministic AI batch share this constructor so
 * response timing and durable negotiation shape cannot drift apart.
 */
export function prepareSubmittedContractRenewal(
  input: OfferContractRenewalInput,
): Extract<ContractNegotiation, { readonly status: "awaiting_response" }> | undefined {
  const seniorSquadState = input.careerState.seniorSquadState;
  if (seniorSquadState === undefined) return undefined;
  const currentContract = activeContractFor(seniorSquadState, input.playerId, input.clubId);
  if (currentContract === undefined || currentContract.endsOn <= input.offeredOn) return undefined;

  const delayDays = responseDelayDays(
    input.careerState,
    input.negotiationId,
    input.offeredOn,
  );
  return {
    id: input.negotiationId,
    playerId: input.playerId,
    clubId: input.clubId,
    currentContractId: currentContract.id,
    createdOn: input.offeredOn,
    status: "awaiting_response",
    submittedOffer: {
      submittedOn: input.offeredOn,
      responseDueOn: gameDate(addDays(input.offeredOn, delayDays)),
      terms: input.terms,
    },
  };
}

/**
 * Creates and submits one renewal through a single validated state publication.
 *
 * The command preserves the editable draft and submit facts while avoiding an
 * intermediate career snapshot that no caller can observe.
 */
export function offerContractRenewal(input: OfferContractRenewalInput): ContractNegotiationCommandResult {
  const seniorSquadState = input.careerState.seniorSquadState;
  if (seniorSquadState === undefined) return rejected(input.careerState, "senior_squad_state_missing");
  if (hasOpenNegotiation(input.careerState, input.playerId, input.clubId)) {
    return rejected(input.careerState, "duplicate_open_negotiation", input.negotiationId);
  }
  const currentContract = activeContractFor(seniorSquadState, input.playerId, input.clubId);
  if (currentContract === undefined) return rejected(input.careerState, "active_contract_not_found", input.negotiationId);
  if (currentContract.endsOn <= input.offeredOn) {
    return rejected(input.careerState, "current_contract_expired", input.negotiationId);
  }
  const affordability = checkContractOfferAffordability({
    careerState: input.careerState,
    clubId: input.clubId,
    wagePolicy: input.wagePolicy,
    replacedContractId: currentContract.id,
    terms: input.terms,
  });
  if (affordability.status === "rejected") {
    return rejected(input.careerState, affordability.reason, input.negotiationId);
  }

  const negotiation = prepareSubmittedContractRenewal(input);
  if (negotiation === undefined) {
    return rejected(input.careerState, "active_contract_not_found", input.negotiationId);
  }
  const next = publishNegotiation(input.careerState, negotiation, true);
  if (next === undefined) return rejected(input.careerState, "invalid_offer_terms", input.negotiationId);
  return applied(
    next,
    negotiation,
    fact(negotiation, input.offeredOn, "draft_created"),
    fact(negotiation, input.offeredOn, "offer_submitted"),
  );
}

/** Creates and submits one selected-club renewal without hidden defaults. */
export function offerSelectedClubRenewal(input: OfferSelectedClubRenewalInput): ContractNegotiationCommandResult {
  return offerContractRenewal({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    negotiationId: input.negotiationId,
    playerId: input.playerId,
    clubId: input.careerState.selectedClubId,
    offeredOn: input.offeredOn,
    terms: input.terms,
  });
}

/** Input for committing a draft to a delayed player response. */
export interface SubmitContractOfferInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly negotiationId: ContractNegotiationId;
  readonly submittedOn: GameDate;
}

/** Submits one affordable offer and schedules its deterministic response. */
export function submitContractOffer(input: SubmitContractOfferInput): ContractNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.careerState, "negotiation_not_found", input.negotiationId);
  if (negotiation.status !== "draft") return rejected(input.careerState, "negotiation_not_actionable", input.negotiationId);
  if (input.submittedOn < negotiation.createdOn) {
    return rejected(input.careerState, "invalid_command_date", input.negotiationId);
  }
  const currentContract = input.careerState.seniorSquadState?.contracts[negotiation.currentContractId];
  if (currentContract === undefined || currentContract.endsOn <= input.submittedOn) {
    return rejected(input.careerState, "current_contract_expired", input.negotiationId);
  }
  const affordability = checkContractOfferAffordability({
    careerState: input.careerState,
    clubId: negotiation.clubId,
    wagePolicy: input.wagePolicy,
    replacedContractId: negotiation.currentContractId,
    terms: negotiation.draft.terms,
  });
  if (affordability.status === "rejected") {
    return rejected(input.careerState, affordability.reason, input.negotiationId);
  }

  const delayDays = responseDelayDays(input.careerState, input.negotiationId, input.submittedOn);
  const awaiting: ContractNegotiation = {
    ...negotiation,
    status: "awaiting_response",
    submittedOffer: {
      submittedOn: input.submittedOn,
      responseDueOn: gameDate(addDays(input.submittedOn, delayDays)),
      terms: negotiation.draft.terms,
    },
  };
  const next = publishNegotiation(input.careerState, awaiting);
  if (next === undefined) return rejected(input.careerState, "invalid_offer_terms", input.negotiationId);
  return applied(next, awaiting, fact(awaiting, input.submittedOn, "offer_submitted"));
}

/** Result of resolving every response or expiry due through one career date. */
export interface AdvanceContractNegotiationsResult {
  readonly careerState: CareerState;
  readonly facts: readonly ContractNegotiationFact[];
}

/**
 * Resolves due responses in stable negotiation order.
 *
 * Multiple acceptances share one evolving finance snapshot, so an earlier
 * signing can make a later offer unaffordable without any partial mutation.
 */
export function advanceContractNegotiations(
  careerState: CareerState,
  throughDate: GameDate,
  wagePolicy: PlayerWagePolicyConfig,
  valuationConfig: PlayerValuationConfig,
  clubFilter?: ClubId | ReadonlySet<ClubId>,
): AdvanceContractNegotiationsResult {
  const initialState = careerState.contractNegotiationState;
  if (initialState === undefined || initialState.negotiationIds.length === 0) {
    return { careerState, facts: [] };
  }

  const baseSenior = careerState.seniorSquadState;
  const baseFinance = careerState.clubFinanceState;
  const negotiations: Record<ContractNegotiationId, ContractNegotiation> = {
    ...initialState.negotiations,
  };
  let negotiationIds = [...initialState.negotiationIds];
  const seniorContracts = baseSenior === undefined ? undefined : { ...baseSenior.contracts };
  const seniorContractIds = baseSenior === undefined ? undefined : [...baseSenior.contractIds];
  const activeContractIds = baseSenior === undefined ? undefined : [...baseSenior.activeContractIds];
  const contractHistory = baseSenior === undefined ? undefined : { ...baseSenior.contractHistory };
  const contractHistoryEntryIds = baseSenior === undefined
    ? undefined
    : [...baseSenior.contractHistoryEntryIds];
  const activeContractIndex = new Map(
    (activeContractIds ?? []).map((contractId, index) => [contractId, index] as const),
  );
  const financeAccounts = baseFinance === undefined ? undefined : { ...baseFinance.accounts };
  const activations: Array<{
    readonly input: ActivateRenewedPlayerContractInput;
    readonly occurredOn: GameDate;
  }> = [];
  const facts: ContractNegotiationFact[] = [];
  const orderedIds = [...initialState.negotiationIds];
  let changed = false;

  const seniorSnapshot = (): SeniorSquadState | undefined => baseSenior === undefined
    || seniorContracts === undefined
    || seniorContractIds === undefined
    || activeContractIds === undefined
    || contractHistory === undefined
    || contractHistoryEntryIds === undefined
    ? undefined
    : {
        ...baseSenior,
        contracts: seniorContracts,
        contractIds: seniorContractIds,
        activeContractIds,
        contractHistory,
        contractHistoryEntryIds,
      };
  const careerSnapshot = (): CareerState => {
    const seniorSquadState = seniorSnapshot();
    const clubFinanceState = baseFinance === undefined || financeAccounts === undefined
      ? undefined
      : { ...baseFinance, accounts: financeAccounts };
    return {
      ...careerState,
      ...(seniorSquadState === undefined ? {} : { seniorSquadState }),
      ...(clubFinanceState === undefined ? {} : { clubFinanceState }),
      contractNegotiationState: { negotiations, negotiationIds },
    };
  };

  const replaceNegotiation = (negotiation: ContractNegotiation): void => {
    negotiations[negotiation.id] = negotiation;
    changed = true;
  };

  const publishAccepted = (
    replacedContractId: PlayerContract["id"],
    accepted: AcceptedContractNegotiation,
  ): void => {
    const retainedIds: ContractNegotiationId[] = [];
    for (const negotiationId of negotiationIds) {
      const existing = negotiations[negotiationId];
      if (existing === undefined) continue;
      const acceptedAgreementClosed = existing.status === "accepted"
        && existing.activatedContractId === replacedContractId;
      const negotiatedAgreementClosed = isOpenContractNegotiation(existing)
        && existing.currentContractId === replacedContractId;
      if (acceptedAgreementClosed || negotiatedAgreementClosed) {
        delete negotiations[negotiationId];
        continue;
      }
      retainedIds.push(negotiationId);
    }
    negotiations[accepted.id] = accepted;
    negotiationIds = [...retainedIds, accepted.id];
    changed = true;
  };

  for (const negotiationId of orderedIds) {
    const negotiation = negotiations[negotiationId];
    if (negotiation === undefined) continue;
    if (!includesClub(clubFilter, negotiation.clubId)) continue;
    if (negotiation.status === "countered" && negotiation.counterOffer.expiresOn <= throughDate) {
      const expired: ContractNegotiation = {
        id: negotiation.id,
        playerId: negotiation.playerId,
        clubId: negotiation.clubId,
        currentContractId: negotiation.currentContractId,
        createdOn: negotiation.createdOn,
        status: "expired",
        expiredOn: negotiation.counterOffer.expiresOn,
        reason: "counter_offer_expired",
      };
      replaceNegotiation(expired);
      facts.push(fact(expired, expired.expiredOn, "negotiation_expired"));
      continue;
    }
    if (negotiation.status !== "awaiting_response" || negotiation.submittedOffer.responseDueOn > throughDate) continue;

    const responseDate = negotiation.submittedOffer.responseDueOn;
    const currentContract = seniorContracts?.[negotiation.currentContractId];
    if (currentContract === undefined || currentContract.endsOn <= responseDate) {
      const expired: ContractNegotiation = {
        id: negotiation.id,
        playerId: negotiation.playerId,
        clubId: negotiation.clubId,
        currentContractId: negotiation.currentContractId,
        createdOn: negotiation.createdOn,
        status: "expired",
        expiredOn: responseDate,
        reason: "current_contract_expired",
      };
      replaceNegotiation(expired);
      facts.push(fact(expired, responseDate, "negotiation_expired"));
      continue;
    }

    const snapshot = careerSnapshot();
    const player = snapshot.gameState.players[negotiation.playerId];
    if (player === undefined) {
      throw new Error(`contract negotiation player not found: ${negotiation.playerId}`);
    }
    const demand = deriveContractDemand({
      careerState: snapshot,
      wagePolicy,
      playerId: negotiation.playerId,
      clubId: negotiation.clubId,
      evaluatedOn: responseDate,
      publicAssessment: derivePublicPlayerAssessment({
        player,
        currentDate: responseDate,
        ratingScale: valuationConfig.ratingScale,
        potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      }),
    });
    const evaluation = evaluateContractOffer({
      worldSeed: careerState.gameState.meta.seed,
      negotiationId: negotiation.id,
      evaluatedOn: responseDate,
      offer: negotiation.submittedOffer.terms,
      demand,
    });

    if (evaluation.decision === "countered") {
      const countered: ContractNegotiation = {
        ...negotiation,
        status: "countered",
        counterOffer: {
          issuedOn: responseDate,
          expiresOn: gameDate(addDays(responseDate, COUNTER_OFFER_VALID_DAYS)),
          terms: demand.preferredTerms,
          evaluation,
        },
      };
      replaceNegotiation(countered);
      facts.push(fact(countered, responseDate, "player_countered"));
      continue;
    }

    if (evaluation.decision === "rejected") {
      const playerRejected: ContractNegotiation = {
        ...negotiation,
        status: "rejected",
        rejectedOn: responseDate,
        rejectedBy: "player",
        evaluation,
      };
      replaceNegotiation(playerRejected);
      facts.push(fact(playerRejected, responseDate, "player_rejected"));
      continue;
    }

    const affordability = checkContractOfferAffordability({
      careerState: snapshot,
      clubId: negotiation.clubId,
      wagePolicy,
      replacedContractId: negotiation.currentContractId,
      terms: negotiation.submittedOffer.terms,
    });
    if (affordability.status === "rejected") {
      const unaffordableEvaluation: ContractOfferEvaluation = {
        ...evaluation,
        decision: "rejected",
        reasons: [...new Set([...evaluation.reasons, "club_terms_unaffordable" as const])],
      };
      const clubRejected: ContractNegotiation = {
        id: negotiation.id,
        playerId: negotiation.playerId,
        clubId: negotiation.clubId,
        currentContractId: negotiation.currentContractId,
        createdOn: negotiation.createdOn,
        status: "rejected",
        submittedOffer: negotiation.submittedOffer,
        rejectedOn: responseDate,
        rejectedBy: "club",
        evaluation: unaffordableEvaluation,
      };
      replaceNegotiation(clubRejected);
      facts.push(fact(clubRejected, responseDate, "club_could_not_complete", affordability.reason));
      continue;
    }

    const currentSenior = seniorSnapshot();
    if (currentSenior === undefined || contractHistoryEntryIds === undefined) continue;
    const prepared = prepareRenewalContractInput({
      gameState: careerState.gameState,
      seniorSquadState: currentSenior,
      negotiation,
      acceptedOn: responseDate,
      acceptedTerms: negotiation.submittedOffer.terms,
      historySequence: contractHistoryEntryIds.length + 1,
    });
    const activeIndex = activeContractIndex.get(negotiation.currentContractId);
    if (
      prepared === undefined
      || activeIndex === undefined
      || seniorContracts === undefined
      || seniorContractIds === undefined
      || activeContractIds === undefined
      || contractHistory === undefined
    ) continue;

    seniorContracts[prepared.contract.id] = prepared.contract;
    seniorContractIds.push(prepared.contract.id);
    activeContractIds[activeIndex] = prepared.contract.id;
    activeContractIndex.delete(negotiation.currentContractId);
    activeContractIndex.set(prepared.contract.id, activeIndex);
    contractHistory[prepared.activation.historyEntry.id] = prepared.activation.historyEntry;
    contractHistoryEntryIds.push(prepared.activation.historyEntry.id);
    activations.push({ input: prepared.activation, occurredOn: responseDate });

    const account = financeAccounts?.[prepared.contract.clubId];
    if (account !== undefined && financeAccounts !== undefined) {
      const cashBalance = nonNegativeMoney(account.cashBalance - prepared.contract.bonuses.signingBonus);
      financeAccounts[prepared.contract.clubId] = {
        ...account,
        cashBalance,
        availableTransferBudget: nonNegativeMoney(Math.min(account.availableTransferBudget, cashBalance)),
        committedAnnualWage: nonNegativeMoney(
          account.committedAnnualWage - currentContract.annualWage + prepared.contract.annualWage,
        ),
        seasonExpenses: nonNegativeMoney(account.seasonExpenses + prepared.contract.bonuses.signingBonus),
      };
    }

    const accepted: AcceptedContractNegotiation = {
      id: negotiation.id,
      playerId: negotiation.playerId,
      clubId: negotiation.clubId,
      currentContractId: negotiation.currentContractId,
      createdOn: negotiation.createdOn,
      status: "accepted",
      submittedOffer: negotiation.submittedOffer,
      acceptedOn: responseDate,
      acceptedTerms: negotiation.submittedOffer.terms,
      acceptedSource: "submitted_offer",
      evaluation,
      activatedContractId: prepared.contract.id,
    };
    publishAccepted(negotiation.currentContractId, accepted);
    facts.push(fact(accepted, responseDate, "player_accepted"));
  }

  if (!changed) return { careerState, facts };

  const seniorSquadState = baseSenior === undefined
    ? undefined
    : activateRenewedPlayerContracts(
        careerState.gameState,
        baseSenior,
        activations.map((activation) => activation.input),
      );
  const contractNegotiationState = createContractNegotiationState(
    careerState.gameState,
    seniorSquadState,
    { negotiations, negotiationIds },
  );
  if (seniorSquadState === undefined || activations.length === 0) {
    return {
      careerState: { ...careerState, contractNegotiationState },
      facts,
    };
  }

  const financed = applyContractActivationsFinance({
    careerState: {
      ...careerState,
      seniorSquadState,
      contractNegotiationState,
    },
    seniorSquadState,
    activations: activations.map((activation) => ({
      contractId: activation.input.contract.id,
      occurredOn: activation.occurredOn,
    })),
  });
  if (financed.status === "rejected") {
    throw new Error(`accepted contract batch failed finance validation: ${financed.reason}`);
  }
  return { careerState: financed.careerState, facts };
}

function includesClub(filter: ClubId | ReadonlySet<ClubId> | undefined, clubId: ClubId): boolean {
  if (filter === undefined) return true;
  return typeof filter === "string" ? filter === clubId : filter.has(clubId);
}

function responseDelayDays(
  careerState: CareerState,
  negotiationId: ContractNegotiationId,
  submittedOn: GameDate,
): number {
  return deriveRng(
    careerState.gameState.meta.seed,
    "contract-negotiation-response-delay",
    negotiationId,
    submittedOn,
  ).nextInt(RESPONSE_DELAY_MIN_DAYS, RESPONSE_DELAY_MAX_DAYS + 1);
}

/** Input for accepting or rejecting a player's current counteroffer. */
export interface ResolveContractCounterInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly negotiationId: ContractNegotiationId;
  readonly decidedOn: GameDate;
}

/** Accepts an in-date counteroffer and activates its replacement agreement. */
export function acceptContractCounterOffer(input: ResolveContractCounterInput): ContractNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.careerState, "negotiation_not_found", input.negotiationId);
  if (negotiation.status !== "countered") return rejected(input.careerState, "negotiation_not_actionable", input.negotiationId);
  if (input.decidedOn < negotiation.counterOffer.issuedOn) {
    return rejected(input.careerState, "invalid_command_date", input.negotiationId);
  }
  if (input.decidedOn >= negotiation.counterOffer.expiresOn) {
    const expired: ContractNegotiation = {
      id: negotiation.id,
      playerId: negotiation.playerId,
      clubId: negotiation.clubId,
      currentContractId: negotiation.currentContractId,
      createdOn: negotiation.createdOn,
      status: "expired",
      expiredOn: negotiation.counterOffer.expiresOn,
      reason: "counter_offer_expired",
    };
    const next = publishNegotiation(input.careerState, expired) ?? input.careerState;
    return applied(next, expired, fact(expired, expired.expiredOn, "negotiation_expired"));
  }
  return activateAcceptedTerms({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    negotiation,
    acceptedOn: input.decidedOn,
    acceptedTerms: negotiation.counterOffer.terms,
    acceptedSource: "counter_offer",
    evaluation: negotiation.counterOffer.evaluation,
    factEvent: "club_accepted_counter",
  });
}

/** Rejects the current player counter without mutating contract or finances. */
export function rejectContractCounterOffer(input: ResolveContractCounterInput): ContractNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.careerState, "negotiation_not_found", input.negotiationId);
  if (negotiation.status !== "countered") return rejected(input.careerState, "negotiation_not_actionable", input.negotiationId);
  if (input.decidedOn < negotiation.counterOffer.issuedOn) {
    return rejected(input.careerState, "invalid_command_date", input.negotiationId);
  }
  const rejectedNegotiation: ContractNegotiation = {
    id: negotiation.id,
    playerId: negotiation.playerId,
    clubId: negotiation.clubId,
    currentContractId: negotiation.currentContractId,
    createdOn: negotiation.createdOn,
    status: "rejected",
    submittedOffer: negotiation.submittedOffer,
    rejectedOn: input.decidedOn,
    rejectedBy: "club",
    evaluation: negotiation.counterOffer.evaluation,
  };
  const next = publishNegotiation(input.careerState, rejectedNegotiation) ?? input.careerState;
  return applied(next, rejectedNegotiation, fact(rejectedNegotiation, input.decidedOn, "club_rejected_counter"));
}

/** Withdraws a draft, submitted offer, or player counter before completion. */
export function withdrawContractNegotiation(input: ResolveContractCounterInput): ContractNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.careerState, "negotiation_not_found", input.negotiationId);
  if (negotiation.status !== "draft" && negotiation.status !== "awaiting_response" && negotiation.status !== "countered") {
    return rejected(input.careerState, "negotiation_not_actionable", input.negotiationId);
  }
  if (input.decidedOn < negotiation.createdOn) {
    return rejected(input.careerState, "invalid_command_date", input.negotiationId);
  }
  const withdrawn: ContractNegotiation = {
    id: negotiation.id,
    playerId: negotiation.playerId,
    clubId: negotiation.clubId,
    currentContractId: negotiation.currentContractId,
    createdOn: negotiation.createdOn,
    status: "withdrawn",
    withdrawnOn: input.decidedOn,
  };
  const next = publishNegotiation(input.careerState, withdrawn) ?? input.careerState;
  return applied(next, withdrawn, fact(withdrawn, input.decidedOn, "club_withdrew"));
}

/** Input for explicitly retaining no replacement contract at expiry. */
export interface ChooseReleaseAtContractExpiryInput {
  readonly careerState: CareerState;
  readonly negotiationId: ContractNegotiationId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly decidedOn: GameDate;
}

/**
 * Records a selected-club release decision while leaving the agreement active.
 *
 * The expiry lifecycle removes ownership only when the contract actually ends.
 */
export function chooseReleaseAtContractExpiry(
  input: ChooseReleaseAtContractExpiryInput,
): ContractNegotiationCommandResult {
  if (input.clubId !== input.careerState.selectedClubId) {
    return rejected(input.careerState, "not_selected_club", input.negotiationId);
  }
  return recordReleaseAtContractExpiry(input);
}

/** Input for an AI club's explicit decision not to renew one active contract. */
export type ChooseAiReleaseAtContractExpiryInput = ChooseReleaseAtContractExpiryInput;

/**
 * Records an AI release-at-expiry decision through the canonical negotiation aggregate.
 *
 * This command cannot touch the manager's club. Keeping the AI decision in the
 * negotiation state makes repeated calendar advancement and save/load idempotent.
 */
export function chooseAiReleaseAtContractExpiry(
  input: ChooseAiReleaseAtContractExpiryInput,
): ContractNegotiationCommandResult {
  if (input.clubId === input.careerState.selectedClubId) {
    return rejected(
      input.careerState,
      "selected_club_requires_user_decision",
      input.negotiationId,
    );
  }

  return recordReleaseAtContractExpiry(input);
}

function recordReleaseAtContractExpiry(
  input: ChooseReleaseAtContractExpiryInput,
): ContractNegotiationCommandResult {
  const senior = input.careerState.seniorSquadState;
  if (senior === undefined) return rejected(input.careerState, "senior_squad_state_missing", input.negotiationId);
  const currentContract = activeContractFor(senior, input.playerId, input.clubId);
  if (currentContract === undefined) return rejected(input.careerState, "active_contract_not_found", input.negotiationId);
  if (currentContract.endsOn <= input.decidedOn) {
    return rejected(input.careerState, "current_contract_expired", input.negotiationId);
  }

  const existing = findNegotiation(input.careerState, input.negotiationId);
  if (
    existing !== undefined
    && (existing.playerId !== input.playerId || existing.clubId !== input.clubId || !isActionable(existing))
  ) {
    return rejected(input.careerState, "negotiation_not_actionable", input.negotiationId);
  }
  if (existing === undefined && hasOpenNegotiation(input.careerState, input.playerId, input.clubId)) {
    return rejected(input.careerState, "duplicate_open_negotiation", input.negotiationId);
  }

  const release: ContractNegotiation = {
    id: input.negotiationId,
    playerId: input.playerId,
    clubId: input.clubId,
    currentContractId: currentContract.id,
    createdOn: existing?.createdOn ?? input.decidedOn,
    status: "release_at_expiry",
    decidedOn: input.decidedOn,
  };
  const next = publishNegotiation(input.careerState, release, existing === undefined);
  if (next === undefined) return rejected(input.careerState, "invalid_command_date", input.negotiationId);
  return applied(next, release, fact(release, input.decidedOn, "club_chose_release_at_expiry"));
}

function activateAcceptedTerms(input: {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly negotiation: Extract<ContractNegotiation, { readonly status: "awaiting_response" | "countered" }>;
  readonly acceptedOn: GameDate;
  readonly acceptedTerms: ContractOfferTerms;
  readonly acceptedSource: AcceptedContractNegotiation["acceptedSource"];
  readonly evaluation: ContractOfferEvaluation;
  readonly factEvent: ContractNegotiationFact["event"];
}): ContractNegotiationCommandResult {
  const affordability = checkContractOfferAffordability({
    careerState: input.careerState,
    clubId: input.negotiation.clubId,
    wagePolicy: input.wagePolicy,
    replacedContractId: input.negotiation.currentContractId,
    terms: input.acceptedTerms,
  });
  if (affordability.status === "rejected") {
    const unaffordableEvaluation: ContractOfferEvaluation = {
      ...input.evaluation,
      decision: "rejected",
      reasons: [...new Set([...input.evaluation.reasons, "club_terms_unaffordable" as const])],
    };
    const clubRejected: ContractNegotiation = {
      id: input.negotiation.id,
      playerId: input.negotiation.playerId,
      clubId: input.negotiation.clubId,
      currentContractId: input.negotiation.currentContractId,
      createdOn: input.negotiation.createdOn,
      status: "rejected",
      submittedOffer: input.negotiation.submittedOffer,
      rejectedOn: input.acceptedOn,
      rejectedBy: "club",
      evaluation: unaffordableEvaluation,
    };
    const next = publishNegotiation(input.careerState, clubRejected) ?? input.careerState;
    return applied(
      next,
      clubRejected,
      fact(clubRejected, input.acceptedOn, "club_could_not_complete", affordability.reason),
    );
  }

  const prepared = prepareRenewalContract({
    careerState: input.careerState,
    negotiation: input.negotiation,
    acceptedOn: input.acceptedOn,
    acceptedTerms: input.acceptedTerms,
  });
  if (prepared === undefined) {
    return rejected(input.careerState, "active_contract_not_found", input.negotiation.id);
  }
  const accepted: AcceptedContractNegotiation = {
    id: input.negotiation.id,
    playerId: input.negotiation.playerId,
    clubId: input.negotiation.clubId,
    currentContractId: input.negotiation.currentContractId,
    createdOn: input.negotiation.createdOn,
    status: "accepted",
    submittedOffer: input.negotiation.submittedOffer,
    acceptedOn: input.acceptedOn,
    acceptedTerms: input.acceptedTerms,
    acceptedSource: input.acceptedSource,
    evaluation: input.evaluation,
    activatedContractId: prepared.contract.id,
  };
  const activationBase = prepareContractActivationState(
    input.careerState,
    prepared.seniorSquadState,
    input.negotiation.currentContractId,
    accepted,
  );
  const financed = applyContractActivationFinance({
    careerState: activationBase,
    seniorSquadState: prepared.seniorSquadState,
    activatedContractIds: [prepared.contract.id],
    occurredOn: input.acceptedOn,
  });
  if (financed.status === "rejected") {
    return rejected(input.careerState, financed.reason, input.negotiation.id);
  }
  return applied(financed.careerState, accepted, fact(accepted, input.acceptedOn, input.factEvent));
}

function prepareRenewalContract(input: {
  readonly careerState: CareerState;
  readonly negotiation: ContractNegotiation;
  readonly acceptedOn: GameDate;
  readonly acceptedTerms: ContractOfferTerms;
}): { readonly seniorSquadState: SeniorSquadState; readonly contract: PlayerContract } | undefined {
  const senior = input.careerState.seniorSquadState;
  if (senior === undefined) return undefined;
  const prepared = prepareRenewalContractInput({
    gameState: input.careerState.gameState,
    seniorSquadState: senior,
    negotiation: input.negotiation,
    acceptedOn: input.acceptedOn,
    acceptedTerms: input.acceptedTerms,
    historySequence: nextHistorySequence(senior),
  });
  if (prepared === undefined) return undefined;
  const seniorSquadState = activateRenewedPlayerContract(
    input.careerState.gameState,
    senior,
    prepared.activation,
  );
  return { seniorSquadState, contract: prepared.contract };
}

/**
 * Builds one renewal payload without copying or publishing aggregate state.
 *
 * Both explicit counter acceptance and calendar batches use this constructor,
 * so contract identity, dates, type transitions, and history stay identical.
 */
function prepareRenewalContractInput(input: {
  readonly gameState: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly negotiation: ContractNegotiation;
  readonly acceptedOn: GameDate;
  readonly acceptedTerms: ContractOfferTerms;
  readonly historySequence: number;
}): {
  readonly activation: ActivateRenewedPlayerContractInput;
  readonly contract: PlayerContract;
} | undefined {
  const previous = input.seniorSquadState.contracts[input.negotiation.currentContractId];
  if (
    previous === undefined
    || !input.seniorSquadState.activeContractIds.includes(previous.id)
  ) return undefined;
  const player = input.gameState.players[previous.playerId];
  if (player === undefined) return undefined;
  const identity = `${String(input.negotiation.id).slice("contract-negotiation:".length)}:${toISO(input.acceptedOn)}`;
  const contract: PlayerContract = {
    id: playerContractId(`contract:renewal:${identity}`),
    playerId: previous.playerId,
    clubId: previous.clubId,
    type: previous.type === "youth" && Math.floor((input.acceptedOn - player.birthDate) / 365) >= 18
      ? "professional"
      : previous.type,
    startsOn: input.acceptedOn,
    // A renewal starts a fresh term from acceptance but never shortens the
    // agreement already held. It must not stack a full new term after the old
    // expiry, which could create six-to-ten-year contracts after early talks.
    endsOn: Math.max(
      previous.endsOn,
      addCalendarYears(input.acceptedOn, input.acceptedTerms.durationYears),
    ) as GameDate,
    annualWage: input.acceptedTerms.annualWage,
    squadStatus: input.acceptedTerms.squadStatus,
    bonuses: input.acceptedTerms.bonuses,
  };
  const historyId = playerContractHistoryEntryId(`contract-history:renewal:${identity}`);
  return {
    contract,
    activation: {
      previousContractId: previous.id,
      contract,
      historyEntry: {
        id: historyId,
        sequenceNumber: input.historySequence,
        occurredOn: input.acceptedOn,
        event: "renewed",
        contractId: contract.id,
        playerId: contract.playerId,
        clubId: contract.clubId,
      },
    },
  };
}

function prepareContractActivationState(
  careerState: CareerState,
  seniorSquadState: SeniorSquadState,
  replacedContractId: PlayerContract["id"],
  acceptedNegotiation: AcceptedContractNegotiation,
): CareerState {
  const state = reconcileClosedContractNegotiations({
    gameState: careerState.gameState,
    seniorSquadState,
    contractNegotiationState: careerState.contractNegotiationState,
    closedContractIds: [replacedContractId],
  }) ?? createEmptyContractNegotiationState();
  const negotiations: Record<ContractNegotiationId, ContractNegotiation> = {
    ...state.negotiations,
    [acceptedNegotiation.id]: acceptedNegotiation,
  };
  const negotiationIds = [...state.negotiationIds, acceptedNegotiation.id];
  const contractNegotiationState = createContractNegotiationState(
    careerState.gameState,
    seniorSquadState,
    {
      negotiations,
      negotiationIds,
    },
  );
  return {
    ...careerState,
    seniorSquadState,
    contractNegotiationState,
  };
}

function publishNegotiation(
  careerState: CareerState,
  negotiation: ContractNegotiation,
  append = false,
): CareerState | undefined {
  const state = careerState.contractNegotiationState ?? createEmptyContractNegotiationState();
  try {
    const contractNegotiationState = publishContractNegotiationState(
      careerState.gameState,
      careerState.seniorSquadState,
      state,
      negotiation,
      append,
    );
    return {
      ...careerState,
      contractNegotiationState,
    };
  } catch (error) {
    if (error instanceof ContractNegotiationStateError) return undefined;
    throw error;
  }
}

function findNegotiation(careerState: CareerState, id: ContractNegotiationId): ContractNegotiation | undefined {
  return careerState.contractNegotiationState?.negotiations[id];
}

function hasOpenNegotiation(careerState: CareerState, playerId: PlayerId, clubId: ClubId): boolean {
  for (const id of careerState.contractNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.contractNegotiationState?.negotiations[id];
    if (
      negotiation?.playerId === playerId
      && negotiation.clubId === clubId
      && (negotiation.status === "draft" || negotiation.status === "awaiting_response" || negotiation.status === "countered")
    ) return true;
  }
  return false;
}

function isActionable(negotiation: ContractNegotiation): boolean {
  return negotiation.status === "draft"
    || negotiation.status === "awaiting_response"
    || negotiation.status === "countered";
}

function activeContractFor(state: SeniorSquadState, playerId: PlayerId, clubId: ClubId): PlayerContract | undefined {
  for (const contractId of state.activeContractIds) {
    const contract = state.contracts[contractId];
    if (contract?.playerId === playerId && contract.clubId === clubId) return contract;
  }
  return undefined;
}

function nextHistorySequence(state: SeniorSquadState): number {
  return state.contractHistoryEntryIds.length + 1;
}

function addCalendarYears(date: GameDate, years: number): GameDate {
  const [yearText, month, day] = toISO(date).split("-");
  const year = Number(yearText) + years;
  const candidate = `${String(year).padStart(4, "0")}-${month}-${day}`;
  try {
    return gameDate(fromISO(candidate));
  } catch {
    return gameDate(fromISO(`${String(year).padStart(4, "0")}-02-28`));
  }
}

function fact(
  negotiation: Pick<ContractNegotiation, "id" | "playerId" | "clubId">,
  occurredOn: GameDate,
  event: ContractNegotiationFact["event"],
  reason?: ContractNegotiationRejectionReason,
): ContractNegotiationFact {
  return {
    negotiationId: negotiation.id,
    playerId: negotiation.playerId,
    clubId: negotiation.clubId,
    occurredOn,
    event,
    ...(reason === undefined ? {} : { reason }),
  };
}

function applied(
  careerState: CareerState,
  negotiation: ContractNegotiation,
  ...facts: readonly ContractNegotiationFact[]
): ContractNegotiationApplied {
  return { status: "applied", careerState, negotiation, facts };
}

function rejected(
  careerState: CareerState,
  reason: ContractNegotiationRejectionReason,
  negotiationId?: ContractNegotiationId,
): ContractNegotiationRejected {
  return {
    status: "rejected",
    reason,
    careerState,
    ...(negotiationId === undefined ? {} : { negotiationId }),
  };
}

/** Creates a stable negotiation ID for lifecycle callers that own the sequence. */
export function createRenewalNegotiationId(playerId: PlayerId, sequence: number): ContractNegotiationId {
  return contractNegotiationId(`contract-negotiation:renewal:${String(playerId).slice(7)}:${sequence}`);
}
