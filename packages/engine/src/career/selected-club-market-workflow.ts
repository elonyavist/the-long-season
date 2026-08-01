import {
  careerInboxMessageId,
  createCareerInboxMessage,
  type CareerInboxMessage,
  type CareerState,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type PreliminaryAgreement,
  type SeasonTransferWindows,
  type PlayerWagePolicyConfig,
  type TransferNegotiation,
} from "@game/domain";

import { advancePreliminaryAgreementLifecycle } from "./preliminary-agreement.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import { advanceTransferNegotiations } from "./transfer-negotiation.ts";
import { advanceTransferPlayerNegotiations } from "./transfer-player-negotiation.ts";

/** One dated selected-club market fact ready for Posta delivery. */
interface ProjectedMarketMessage {
  readonly date: GameDate;
  readonly category:
    | "market_club_accepted"
    | "market_club_counteroffer"
    | "market_club_rejected"
    | "market_player_counteroffer"
    | "market_player_rejected"
    | "market_offer_expired"
    | "market_transfer_completed"
    | "market_agreement_failed"
    | "market_offer_withdrawn"
    | "market_preliminary_agreed"
    | "market_preliminary_activated";
  readonly level: "blocking" | "important" | "informational";
}

/**
 * Projects every selected-club market fact due through one explicit date.
 *
 * Facts are derived only from durable transfer-negotiation and
 * preliminary-agreement state, never from a UI flag. AI-to-AI market traffic is
 * intentionally excluded: only negotiations the selected club started produce
 * Posta messages, so routine market activity cannot interrupt the manager.
 */
export function projectSelectedClubMarketAttention(
  careerState: CareerState,
  throughDate: GameDate,
): readonly CareerInboxMessage[] {
  const messages: CareerInboxMessage[] = [];

  for (const negotiationId of careerState.transferNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.transferNegotiationState?.negotiations[negotiationId];
    if (negotiation?.buyingClubId !== careerState.selectedClubId) continue;
    const projected = projectTransferNegotiation(negotiation);
    if (projected === undefined || projected.date > throughDate) continue;
    messages.push(buildMarketMessage(projected, {
      identity: String(negotiation.id),
      playerId: negotiation.playerId,
      clubId: negotiation.buyingClubId,
      transferNegotiationId: negotiation.id,
    }));
  }

  for (const agreementId of careerState.preliminaryAgreementState?.agreementIds ?? []) {
    const agreement = careerState.preliminaryAgreementState?.agreements[agreementId];
    if (agreement?.offeringClubId !== careerState.selectedClubId) continue;
    const projected = projectPreliminaryAgreement(agreement);
    if (projected === undefined || projected.date > throughDate) continue;
    messages.push(buildMarketMessage(projected, {
      identity: String(agreement.id),
      playerId: agreement.playerId,
      clubId: agreement.offeringClubId,
      preliminaryAgreementId: agreement.id,
    }));
  }

  return messages;
}

/**
 * Returns the earliest market date on which engine advancement can change a
 * selected-club negotiation: a due reply, a stage expiry, or a future-contract
 * activation. Dates already in the past are clamped to the current date.
 */
export function nextSelectedClubMarketDueDate(
  careerState: CareerState,
  boundaryDate: GameDate,
): GameDate | undefined {
  const currentDate = careerState.gameState.calendar.currentDate;
  let earliest: GameDate | undefined;
  const consider = (candidate: GameDate): void => {
    if (candidate > boundaryDate) return;
    const dueDate = candidate < currentDate ? currentDate : candidate;
    if (earliest === undefined || dueDate < earliest) earliest = dueDate;
  };

  for (const negotiationId of careerState.transferNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.transferNegotiationState?.negotiations[negotiationId];
    if (negotiation?.buyingClubId !== careerState.selectedClubId) continue;
    if (negotiation.status === "submitted" || negotiation.status === "player_offer_submitted") {
      consider(negotiation.clock.responseDueOn);
      consider((negotiation.clock.deadline + 1) as GameDate);
    }
    if (negotiation.status === "countered" || negotiation.status === "accepted") {
      consider((negotiation.clock.deadline + 1) as GameDate);
    }
    if (negotiation.status === "player_countered") {
      consider((negotiation.clock.deadline + 1) as GameDate);
    }
  }

  for (const agreementId of careerState.preliminaryAgreementState?.agreementIds ?? []) {
    const agreement = careerState.preliminaryAgreementState?.agreements[agreementId];
    if (agreement?.offeringClubId !== careerState.selectedClubId) continue;
    if (agreement.status === "offer_submitted") {
      consider(agreement.clock.responseDueOn);
      consider((agreement.clock.deadline + 1) as GameDate);
      consider(agreement.futureStartsOn);
    }
    if (agreement.status === "countered") {
      consider((agreement.clock.deadline + 1) as GameDate);
      consider(agreement.futureStartsOn);
    }
    if (agreement.status === "agreed") consider(agreement.futureStartsOn);
  }

  return earliest;
}

/**
 * Advances every deterministic market lifecycle due by `throughDate`.
 *
 * Seller replies never resolve on the selected club's behalf, player replies
 * resolve on their canonical stage clock, and agreed future contracts activate
 * on their exact start date. All three passes are idempotent; visual timing
 * never controls this progression.
 */
export function advanceSelectedClubMarketLifecycles(input: {
  readonly careerState: CareerState;
  readonly throughDate: GameDate;
  readonly transferWindows?: SeasonTransferWindows;
  /** Explicit versioned public-value content for seller replies. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Explicit wage policy used by player and preliminary tables. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): CareerState {
  let working = advanceTransferNegotiations({
    careerState: input.careerState,
    throughDate: input.throughDate,
    protectedSellingClubIds: [input.careerState.selectedClubId],
    protectSquadDepth: true,
    valuationConfig: input.valuationConfig,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  }).careerState;
  if (input.transferWindows !== undefined) {
    working = advanceTransferPlayerNegotiations({
      careerState: working,
      wagePolicy: input.wagePolicy,
      valuationConfig: input.valuationConfig,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
      throughDate: input.throughDate,
      transferWindows: input.transferWindows,
    }).careerState;
  }
  return advancePreliminaryAgreementLifecycle({
    careerState: working,
    throughDate: input.throughDate,
    wagePolicy: input.wagePolicy,
    valuationConfig: input.valuationConfig,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  }).careerState;
}

/**
 * Resolves one delivered market message exclusively from negotiation state.
 *
 * Only the three actionable stages stay unresolved while their decision is
 * open; every terminal market fact is born resolved.
 */
export function isSelectedClubMarketMessageResolved(
  careerState: CareerState,
  message: CareerInboxMessage,
): boolean {
  const negotiationId = message.related.transferNegotiationId;
  const negotiation = negotiationId === undefined
    ? undefined
    : careerState.transferNegotiationState?.negotiations[negotiationId];
  const agreementId = message.related.preliminaryAgreementId;
  const agreement = agreementId === undefined
    ? undefined
    : careerState.preliminaryAgreementState?.agreements[agreementId];

  if (message.category === "market_club_counteroffer") {
    return negotiation === undefined || negotiation.status !== "countered";
  }
  if (message.category === "market_club_accepted") {
    return negotiation === undefined || negotiation.status !== "accepted";
  }
  if (message.category === "market_player_counteroffer") {
    if (negotiationId !== undefined) {
      return negotiation === undefined || negotiation.status !== "player_countered";
    }
    return agreement === undefined || agreement.status !== "countered";
  }
  return true;
}

function projectTransferNegotiation(
  negotiation: TransferNegotiation,
): ProjectedMarketMessage | undefined {
  switch (negotiation.status) {
    case "submitted":
    case "player_offer_submitted":
      return undefined;
    case "countered":
      return { date: negotiation.counterIssuedOn, category: "market_club_counteroffer", level: "blocking" };
    case "accepted":
      return { date: negotiation.acceptedOn, category: "market_club_accepted", level: "blocking" };
    case "rejected":
      return { date: negotiation.rejectedOn, category: "market_club_rejected", level: "important" };
    case "player_countered":
      return { date: negotiation.counterIssuedOn, category: "market_player_counteroffer", level: "blocking" };
    case "player_rejected":
      return { date: negotiation.rejectedOn, category: "market_player_rejected", level: "important" };
    case "player_expired":
      return { date: negotiation.expiredOn, category: "market_offer_expired", level: "important" };
    case "expired":
      return { date: negotiation.expiredOn, category: "market_offer_expired", level: "important" };
    case "completed":
      return { date: negotiation.completedOn, category: "market_transfer_completed", level: "important" };
    case "completion_failed":
      return { date: negotiation.failedOn, category: "market_agreement_failed", level: "important" };
    case "unaffordable":
      return { date: negotiation.cancelledOn, category: "market_agreement_failed", level: "important" };
    case "withdrawn":
      return { date: negotiation.withdrawnOn, category: "market_offer_withdrawn", level: "informational" };
  }
}

function projectPreliminaryAgreement(
  agreement: PreliminaryAgreement,
): ProjectedMarketMessage | undefined {
  switch (agreement.status) {
    case "offer_submitted":
      return undefined;
    case "countered":
      return { date: agreement.counterIssuedOn, category: "market_player_counteroffer", level: "blocking" };
    case "agreed":
      return { date: agreement.agreedOn, category: "market_preliminary_agreed", level: "important" };
    case "rejected":
      return { date: agreement.rejectedOn, category: "market_player_rejected", level: "important" };
    case "expired":
      return { date: agreement.expiredOn, category: "market_offer_expired", level: "important" };
    case "withdrawn":
      return { date: agreement.withdrawnOn, category: "market_offer_withdrawn", level: "informational" };
    case "activation_cancelled":
      return { date: agreement.cancelledOn, category: "market_agreement_failed", level: "important" };
    case "activated":
      return { date: agreement.activatedOn, category: "market_preliminary_activated", level: "important" };
  }
}

function buildMarketMessage(
  projected: ProjectedMarketMessage,
  related: {
    readonly identity: string;
    readonly playerId: CareerInboxMessage["related"]["playerId"];
    readonly clubId: CareerInboxMessage["related"]["clubId"];
    readonly transferNegotiationId?: CareerInboxMessage["related"]["transferNegotiationId"];
    readonly preliminaryAgreementId?: CareerInboxMessage["related"]["preliminaryAgreementId"];
  },
): CareerInboxMessage {
  const blocking = projected.level === "blocking";
  return createCareerInboxMessage({
    id: careerInboxMessageId(
      `inbox:${projected.category.replaceAll("_", "-")}:${related.identity}`,
    ),
    date: projected.date,
    category: projected.category,
    source: "transfer_office",
    level: projected.level,
    continuePolicy: blocking
      ? "until_resolved"
      : projected.level === "important"
        ? "until_acknowledged"
        : "never",
    lifecycle: { read: false, acknowledged: false, resolved: !blocking },
    related: {
      ...(related.playerId === undefined ? {} : { playerId: related.playerId }),
      ...(related.clubId === undefined ? {} : { clubId: related.clubId }),
      ...(related.transferNegotiationId === undefined
        ? {}
        : { transferNegotiationId: related.transferNegotiationId }),
      ...(related.preliminaryAgreementId === undefined
        ? {}
        : { preliminaryAgreementId: related.preliminaryAgreementId }),
    },
    actionIds: blocking ? ["open_market_negotiation"] : [],
  });
}
