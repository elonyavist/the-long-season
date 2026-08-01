import {
  createNegotiationStageClock,
  createTransferNegotiationState,
  isNegotiationStageExpired,
  isOpenTransferNegotiation,
  nonNegativeMoney,
  playerSquadDepartment,
  transferNegotiationId,
  transferNegotiationParties,
  type CareerState,
  type AskingPriceCurvesConfig,
  type ClubId,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type Money,
  type PlayerContract,
  type PlayerId,
  type PlayerSquadDepartment,
  type SeasonTransferWindows,
  type TransferNegotiation,
  type TransferNegotiationId,
  type TransferNegotiationRejectionReason,
  type TransferNegotiationState,
} from "@game/domain";

import { evaluateMarketActionEligibility } from "../market/market-eligibility.ts";
import {
  derivePlayerValuation,
  type PlayerValuationConfig,
} from "../market/player-valuation.ts";
import {
  derivePublicPlayerAssessment,
  type PublicPlayerAssessment,
} from "../squad/public-player-assessment.ts";
import {
  deriveSellerAskingPrice,
  type SellerReplacementNeed,
} from "../market/seller-asking-price.ts";
import { deriveNegotiationStageResponseDelayDays } from "./negotiation-response-delay.ts";
import { evaluateTransferFeeCapacity } from "./career-contract-capacity.ts";
import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  MINIMUM_CAREER_SQUAD_SIZE,
} from "./squad-maintenance.ts";

/** Stable reason a transfer-negotiation command was refused. */
export type TransferNegotiationCommandRejectionReason =
  | "unknown_selling_club"
  | "unknown_buying_club"
  | "same_club"
  | "player_not_owned_by_selling_club"
  | "player_already_owned_by_buying_club"
  | "player_contract_not_found"
  | "outside_transfer_window"
  | "duplicate_open_negotiation"
  | "invalid_offer_fee"
  | "negotiation_not_found"
  | "negotiation_not_open"
  | "negotiation_not_countered"
  | "decision_after_deadline";

/** Applied or refused result of one explicit transfer-negotiation command. */
export type TransferNegotiationCommandResult =
  | {
      readonly status: "applied";
      readonly careerState: CareerState;
      readonly negotiation: TransferNegotiation;
    }
  | {
      readonly status: "rejected";
      readonly reason: TransferNegotiationCommandRejectionReason;
      readonly negotiationId?: TransferNegotiationId;
    };

/** Input for submitting one up-front permanent-transfer fee offer. */
export interface SubmitTransferOfferInput {
  readonly careerState: CareerState;
  readonly negotiationId: TransferNegotiationId;
  readonly buyingClubId: ClubId;
  readonly sellingClubId: ClubId;
  readonly playerId: PlayerId;
  readonly offeredFee: Money;
  readonly submittedOn: GameDate;
  readonly transferWindows: SeasonTransferWindows;
  /** Explicit versioned public-value content frozen at submission. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Explicit versioned seller asking-price content frozen at submission. */
  readonly askingPriceConfig: AskingPriceCurvesConfig;
  /** Exact version-selected seller, willingness, affordability, and AI policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}

/** Immutable commercial facts frozen when a permanent-transfer offer starts. */
export interface TransferCommercialSnapshot {
  readonly publicValue: Money;
  readonly initialAskingPrice: Money;
  readonly currentAskingPrice: Money;
}

/**
 * Derives the public value and seller asking price shown before submission.
 *
 * The same function is reused by the command, AI target selection, and adapters
 * so the preview cannot disagree with the durable negotiation snapshot.
 */
export function deriveTransferCommercialSnapshot(input: {
  readonly careerState: CareerState;
  readonly sellingClubId: ClubId;
  readonly playerId: PlayerId;
  readonly asOf: GameDate;
  /** Canonical dated public facts already derived by the calling workflow. */
  readonly publicAssessment: PublicPlayerAssessment;
  readonly valuationConfig: PlayerValuationConfig;
  readonly askingPriceConfig: AskingPriceCurvesConfig;
}): TransferCommercialSnapshot | undefined {
  const sellingClub = input.careerState.gameState.clubs[input.sellingClubId];
  const player = input.careerState.gameState.players[input.playerId];
  const contract = activeContractFor(
    input.careerState,
    input.playerId,
    input.sellingClubId,
  );
  if (sellingClub === undefined || player === undefined || contract === undefined) {
    return undefined;
  }
  if (
    input.publicAssessment.playerId !== input.playerId
    || input.publicAssessment.assessedOn !== input.asOf
  ) {
    throw new Error(
      `Transfer commercial assessment does not match player/date: ${String(input.playerId)}`,
    );
  }
  const primaryPosition = player.naturalPositions[0];
  if (primaryPosition === undefined) {
    throw new Error(`Transfer target has no primary position: ${String(player.id)}`);
  }
  const publicValue = derivePlayerValuation({
    assessment: input.publicAssessment,
    primaryPosition,
    config: input.valuationConfig,
  }).value;
  const asking = deriveSellerAskingPrice({
    publicValue,
    remainingContractDays: Math.max(0, contract.endsOn - input.asOf),
    squadStatus: contract.squadStatus,
    replacementNeed: deriveReplacementNeed(
      input.careerState,
      input.sellingClubId,
      input.playerId,
    ),
    sellerPressure: (
      input.careerState.clubFinanceState?.accounts[input.sellingClubId]?.cashBalance
        ?? publicValue
    ) < publicValue
      ? "strained"
      : "healthy",
    // No durable transfer-request state exists yet, so content receives the
    // supported neutral disposition rather than an invented morale threshold.
    playerDesire: "content",
    config: input.askingPriceConfig,
  });
  return {
    publicValue,
    initialAskingPrice: asking.askingPrice,
    currentAskingPrice: asking.askingPrice,
  };
}

/** Creates deterministic IDs for AI or adapter-owned transfer negotiations. */
export function createTransferNegotiationId(
  buyingClubId: ClubId,
  playerId: PlayerId,
  sequence: number,
): TransferNegotiationId {
  return transferNegotiationId(
    `transfer-negotiation:${String(buyingClubId).slice(5)}:${String(playerId).slice(7)}:${sequence}`,
  );
}

/**
 * Submits a fee offer to the selling club and schedules its deterministic reply.
 *
 * Validates buyer/seller distinctness, ownership, an open window, no duplicate
 * open talk for the same buyer/player, and a positive integer-minor-unit fee.
 * Submission reserves no money (Phase 79 locked rule); affordability is only
 * rechecked when the club stage is accepted.
 */
export function submitTransferOffer(
  input: SubmitTransferOfferInput,
): TransferNegotiationCommandResult {
  if (input.buyingClubId === input.sellingClubId) {
    return { status: "rejected", reason: "same_club" };
  }
  if (input.offeredFee <= 0) {
    return { status: "rejected", reason: "invalid_offer_fee" };
  }
  const buyingClub = input.careerState.gameState.clubs[input.buyingClubId];
  const sellingClub = input.careerState.gameState.clubs[input.sellingClubId];
  if (buyingClub === undefined) return { status: "rejected", reason: "unknown_buying_club" };
  if (sellingClub === undefined) return { status: "rejected", reason: "unknown_selling_club" };
  if (!sellingClub.playerIds.includes(input.playerId)) {
    return { status: "rejected", reason: "player_not_owned_by_selling_club" };
  }
  if (buyingClub.playerIds.includes(input.playerId)) {
    return { status: "rejected", reason: "player_already_owned_by_buying_club" };
  }
  const player = input.careerState.gameState.players[input.playerId];
  const contract = activeContractFor(input.careerState, input.playerId, input.sellingClubId);
  if (player === undefined || contract === undefined) {
    return { status: "rejected", reason: "player_contract_not_found" };
  }

  const eligibility = evaluateMarketActionEligibility({
    action: "permanent_transfer_offer",
    windows: input.transferWindows,
    asOf: input.submittedOn,
  });
  if (eligibility.status === "blocked") {
    return { status: "rejected", reason: "outside_transfer_window" };
  }
  if (hasOpenNegotiationForPair(input.careerState, input.buyingClubId, input.playerId)) {
    return { status: "rejected", reason: "duplicate_open_negotiation" };
  }

  const clock = createNegotiationStageClock({
    submittedOn: input.submittedOn,
    responseDelayDays: responseDelayDays(input.careerState, input.negotiationId, input.submittedOn),
    ...(eligibility.closesOn === undefined ? {} : { windowClosesOn: eligibility.closesOn }),
  });
  const publicAssessment = derivePublicPlayerAssessment({
    player,
    currentDate: input.submittedOn,
    potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
    ratingScale: input.valuationConfig.ratingScale,
  });
  const commercial = deriveTransferCommercialSnapshot({
    careerState: input.careerState,
    sellingClubId: input.sellingClubId,
    playerId: input.playerId,
    asOf: input.submittedOn,
    publicAssessment,
    valuationConfig: input.valuationConfig,
    askingPriceConfig: input.askingPriceConfig,
  });
  if (commercial === undefined) {
    return { status: "rejected", reason: "player_contract_not_found" };
  }
  const negotiation: TransferNegotiation = {
    id: input.negotiationId,
    status: "submitted",
    buyingClubId: input.buyingClubId,
    sellingClubId: input.sellingClubId,
    playerId: input.playerId,
    ...commercial,
    submittedOn: input.submittedOn,
    offeredFee: input.offeredFee,
    clock,
  };
  return applied(input.careerState, negotiation);
}

/** Input for advancing the seller side of every open transfer negotiation. */
export interface AdvanceTransferNegotiationsInput {
  readonly careerState: CareerState;
  readonly throughDate: GameDate;
  /** Retained at the lifecycle boundary for one explicit economy composition. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Exact version-selected seller and affordability policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Sellers whose replies require a human decision and must remain untouched. */
  readonly protectedSellingClubIds?: readonly ClubId[];
  /** Applies canonical senior-squad floors to autonomous seller replies. */
  readonly protectSquadDepth?: boolean;
}

/** One structured outcome produced by advancing a transfer negotiation. */
export interface AdvancedTransferNegotiation {
  readonly negotiationId: TransferNegotiationId;
  readonly status: TransferNegotiation["status"];
}

/** Result of advancing every due or expired open transfer negotiation. */
export interface AdvanceTransferNegotiationsResult {
  readonly careerState: CareerState;
  readonly resolved: readonly AdvancedTransferNegotiation[];
}

/**
 * Resolves every open seller reply that is due or expired by `throughDate`.
 *
 * A stage past its deadline (already capped at the window close) expires. A due
 * stage is answered deterministically from the seller's willingness. The pass
 * is idempotent: already-resolved negotiations are never touched again.
 */
export function advanceTransferNegotiations(
  input: AdvanceTransferNegotiationsInput,
): AdvanceTransferNegotiationsResult {
  const state = input.careerState.transferNegotiationState;
  if (state === undefined) return { careerState: input.careerState, resolved: [] };

  const nextNegotiations: Record<TransferNegotiationId, TransferNegotiation> = { ...state.negotiations };
  const resolved: AdvancedTransferNegotiation[] = [];
  const protectedSellingClubIds = new Set(input.protectedSellingClubIds ?? []);

  const dueStageIds = state.negotiationIds
    .filter((negotiationId) => {
      const negotiation = state.negotiations[negotiationId];
      return negotiation?.status === "submitted"
        || negotiation?.status === "countered"
        || negotiation?.status === "accepted";
    })
    .sort((leftId, rightId) => {
      const left = state.negotiations[leftId];
      const right = state.negotiations[rightId];
      if (
        left === undefined
        || right === undefined
        || (left.status !== "submitted" && left.status !== "countered" && left.status !== "accepted")
        || (right.status !== "submitted" && right.status !== "countered" && right.status !== "accepted")
      ) return String(leftId).localeCompare(String(rightId));
      return left.clock.submittedOn - right.clock.submittedOn
        || String(leftId).localeCompare(String(rightId));
    });

  for (const negotiationId of dueStageIds) {
    const negotiation = state.negotiations[negotiationId];
    if (
      negotiation === undefined
      || (negotiation.status !== "submitted"
        && negotiation.status !== "countered"
        && negotiation.status !== "accepted")
    ) continue;
    if (isNegotiationStageExpired(negotiation.clock, input.throughDate)) {
      nextNegotiations[negotiationId] = {
        ...transferNegotiationParties(negotiation),
        status: "expired",
        expiredOn: negotiation.clock.deadline,
      };
      resolved.push({ negotiationId, status: "expired" });
      continue;
    }
    if (
      negotiation.status !== "submitted"
      || protectedSellingClubIds.has(negotiation.sellingClubId)
    ) continue;
    if (input.throughDate < negotiation.clock.responseDueOn) continue;

    const decided = resolveSellerReply(
      input.careerState,
      negotiation,
      input.protectSquadDepth ?? false,
      input.marketBehaviorPolicy,
    );
    nextNegotiations[negotiationId] = decided;
    resolved.push({ negotiationId, status: decided.status });
  }

  if (resolved.length === 0) return { careerState: input.careerState, resolved: [] };
  return {
    careerState: withTransferNegotiations(input.careerState, {
      negotiations: nextNegotiations,
      negotiationIds: state.negotiationIds,
    }),
    resolved,
  };
}

/** Input for a buyer decision on an existing transfer negotiation. */
export interface ResolveTransferNegotiationInput {
  readonly careerState: CareerState;
  readonly negotiationId: TransferNegotiationId;
  readonly decidedOn: GameDate;
}

/** Buyer counter decision that must recheck the configured affordability cap. */
export interface AcceptTransferCounterInput extends ResolveTransferNegotiationInput {
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}

/**
 * Accepts the selling club's counteroffer at its countered fee.
 *
 * The agreed fee is rechecked for buyer affordability; if the buyer can no
 * longer fund it, the negotiation is cancelled as `unaffordable` instead.
 * Acceptance transfers no ownership and spends no money.
 */
export function acceptTransferCounter(
  input: AcceptTransferCounterInput,
): TransferNegotiationCommandResult {
  const negotiation = input.careerState.transferNegotiationState?.negotiations[input.negotiationId];
  if (negotiation === undefined) return { status: "rejected", reason: "negotiation_not_found" };
  if (negotiation.status !== "countered") {
    return { status: "rejected", reason: "negotiation_not_countered", negotiationId: input.negotiationId };
  }
  if (input.decidedOn > negotiation.clock.deadline) {
    return {
      status: "rejected",
      reason: "decision_after_deadline",
      negotiationId: input.negotiationId,
    };
  }

  const resolved: TransferNegotiation = buyerCanAffordFee(
    input.careerState,
    negotiation.buyingClubId,
    negotiation.counterFee,
    input.marketBehaviorPolicy,
  )
    ? {
        ...transferNegotiationParties(negotiation),
        status: "accepted",
        agreedFee: negotiation.counterFee,
        acceptedOn: input.decidedOn,
        clock: negotiation.clock,
      }
    : { ...transferNegotiationParties(negotiation), status: "unaffordable", cancelledOn: input.decidedOn };
  return applied(input.careerState, resolved);
}

/** Withdraws an open transfer negotiation before it resolves. */
export function withdrawTransferNegotiation(
  input: ResolveTransferNegotiationInput,
): TransferNegotiationCommandResult {
  const negotiation = input.careerState.transferNegotiationState?.negotiations[input.negotiationId];
  if (negotiation === undefined) return { status: "rejected", reason: "negotiation_not_found" };
  if (!isOpenTransferNegotiation(negotiation)) {
    return { status: "rejected", reason: "negotiation_not_open", negotiationId: input.negotiationId };
  }
  const withdrawn: TransferNegotiation = {
    ...transferNegotiationParties(negotiation),
    status: "withdrawn",
    withdrawnOn: input.decidedOn,
  };
  return applied(input.careerState, withdrawn);
}

/** Football department used to protect squad depth before a sale. */
export type TransferDepartment = PlayerSquadDepartment;

/**
 * Structured seller decision produced deterministically from career facts.
 *
 * `askingFee` is the seller's computed valuation-based price. It is absent only
 * when the player is not for sale on squad-depth grounds (no price is derived).
 */
export type SellerTransferDecision =
  | { readonly decision: "accept"; readonly askingFee: Money }
  | { readonly decision: "counter"; readonly askingFee: Money; readonly counterFee: Money }
  | {
      readonly decision: "reject";
      readonly reason: TransferNegotiationRejectionReason;
      readonly askingFee?: Money;
    };

/**
 * Derives the selling club's deterministic reply to a submitted fee offer.
 *
 * The asking fee scales the market valuation by squad status, contract
 * security, and the seller's cash pressure. No player is for sale when the
 * move would leave the senior squad or one department below its canonical
 * structural floor.
 */
export function deriveSellerTransferWillingness(input: {
  readonly careerState: CareerState;
  readonly negotiation: SubmittedTransferParties;
  /** Rejects a sale that would break canonical senior-squad floors. */
  readonly protectSquadDepth?: boolean;
  /** Exact version-selected seller reply policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): SellerTransferDecision {
  const { careerState, negotiation } = input;
  const sellingClub = careerState.gameState.clubs[negotiation.sellingClubId];
  const player = careerState.gameState.players[negotiation.playerId];
  const contract = activeContractFor(careerState, negotiation.playerId, negotiation.sellingClubId);
  if (sellingClub === undefined || player === undefined || contract === undefined) {
    return { decision: "reject", reason: "player_not_for_sale" };
  }

  const department = playerSquadDepartment(player);
  const departmentCount = countDepartment(careerState, negotiation.sellingClubId, department);
  if (input.protectSquadDepth === true && (
    sellingClub.playerIds.length - 1 < MINIMUM_CAREER_SQUAD_SIZE
    || departmentCount - 1 < MINIMUM_CAREER_DEPARTMENT_DEPTH[department]
  )) {
    return { decision: "reject", reason: "player_not_for_sale" };
  }


  const askingFee = negotiation.currentAskingPrice;

  if (negotiation.offeredFee >= askingFee) return { decision: "accept", askingFee };
  const counterThreshold = percentageMoney(
    askingFee,
    input.marketBehaviorPolicy.sellerNegotiation.counterOfferMinimumAskingBasisPoints,
  );
  if (negotiation.offeredFee >= counterThreshold) {
    const askingOfferGap = nonNegativeMoney(
      askingFee - negotiation.offeredFee,
    );
    const concession = percentageMoney(
      askingOfferGap,
      input.marketBehaviorPolicy.sellerNegotiation
        .counterOfferConcessionBasisPoints,
    );
    return {
      decision: "counter",
      askingFee,
      counterFee: nonNegativeMoney(askingFee - concession),
    };
  }
  return { decision: "reject", reason: "fee_below_valuation", askingFee };
}

/** Minimum submitted-negotiation shape the seller policy reads. */
export interface SubmittedTransferParties {
  readonly buyingClubId: ClubId;
  readonly sellingClubId: ClubId;
  readonly playerId: PlayerId;
  readonly offeredFee: Money;
  readonly submittedOn: GameDate;
  readonly publicValue: Money;
  readonly initialAskingPrice: Money;
  readonly currentAskingPrice: Money;
  readonly counterFee?: Money;
}

/** Converts a due seller decision into the next negotiation state. */
function resolveSellerReply(
  careerState: CareerState,
  negotiation: Extract<TransferNegotiation, { status: "submitted" }>,
  protectSquadDepth: boolean,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): TransferNegotiation {
  const decision = deriveSellerTransferWillingness({
    careerState,
    negotiation,
    protectSquadDepth,
    marketBehaviorPolicy,
  });
  const decidedOn = negotiation.clock.responseDueOn;
  if (decision.decision === "accept") {
    return buyerCanAffordFee(
      careerState,
      negotiation.buyingClubId,
      negotiation.offeredFee,
      marketBehaviorPolicy,
    )
      ? {
          ...transferNegotiationParties(negotiation),
          status: "accepted",
          agreedFee: negotiation.offeredFee,
          acceptedOn: decidedOn,
          clock: negotiation.clock,
        }
      : { ...transferNegotiationParties(negotiation), status: "unaffordable", cancelledOn: decidedOn };
  }
  if (decision.decision === "counter") {
    return {
      ...transferNegotiationParties(negotiation),
      status: "countered",
      submittedOn: negotiation.submittedOn,
      offeredFee: negotiation.offeredFee,
      counterFee: decision.counterFee,
      currentAskingPrice: decision.counterFee,
      counterIssuedOn: decidedOn,
      clock: negotiation.clock,
    };
  }
  return { ...transferNegotiationParties(negotiation), status: "rejected", rejectedOn: decidedOn, reason: decision.reason };
}

/** Reports whether the buyer's transfer budget and cash both cover the fee. */
function buyerCanAffordFee(
  careerState: CareerState,
  buyingClubId: ClubId,
  fee: Money,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): boolean {
  return evaluateTransferFeeCapacity({
    careerState,
    buyingClubId,
    fee,
    marketBehaviorPolicy,
  }).status === "affordable";
}

/** Applies one integer basis-point percentage without floating-point drift. */
function percentageMoney(value: Money, basisPoints: number): Money {
  return Number((BigInt(value) * BigInt(basisPoints)) / 10_000n) as Money;
}

/** Counts the selling club's owned players in one department. */
function countDepartment(careerState: CareerState, clubId: ClubId, department: TransferDepartment): number {
  const club = careerState.gameState.clubs[clubId];
  if (club === undefined) return 0;
  let count = 0;
  for (const playerId of club.playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player !== undefined && playerSquadDepartment(player) === department) count += 1;
  }
  return count;
}

/** Classifies seller cover without adding another hidden asking-price constant. */
function deriveReplacementNeed(
  careerState: CareerState,
  clubId: ClubId,
  playerId: PlayerId,
): SellerReplacementNeed {
  const club = careerState.gameState.clubs[clubId];
  const player = careerState.gameState.players[playerId];
  if (club === undefined || player === undefined) return "critical";
  const department = playerSquadDepartment(player);
  const remainingSquadSize = club.playerIds.length - 1;
  const remainingDepartmentSize = countDepartment(careerState, clubId, department) - 1;
  if (
    remainingSquadSize < MINIMUM_CAREER_SQUAD_SIZE
    || remainingDepartmentSize < MINIMUM_CAREER_DEPARTMENT_DEPTH[department]
  ) {
    return "critical";
  }
  if (
    remainingSquadSize === MINIMUM_CAREER_SQUAD_SIZE
    || remainingDepartmentSize === MINIMUM_CAREER_DEPARTMENT_DEPTH[department]
  ) {
    return "thin";
  }
  return "covered";
}

/** Finds the active seller contract for the transfer target. */
function activeContractFor(
  careerState: CareerState,
  playerId: PlayerId,
  clubId: ClubId,
): PlayerContract | undefined {
  const senior = careerState.seniorSquadState;
  if (senior === undefined) return undefined;
  for (const contractId of senior.activeContractIds) {
    const contract = senior.contracts[contractId];
    if (contract?.playerId === playerId && contract.clubId === clubId) return contract;
  }
  return undefined;
}

/** Reports whether an open negotiation already exists for one buyer/player pair. */
function hasOpenNegotiationForPair(careerState: CareerState, buyingClubId: ClubId, playerId: PlayerId): boolean {
  const state = careerState.transferNegotiationState;
  if (state === undefined) return false;
  return state.negotiationIds.some((id) => {
    const negotiation = state.negotiations[id];
    return negotiation !== undefined
      && isOpenTransferNegotiation(negotiation)
      && negotiation.buyingClubId === buyingClubId
      && negotiation.playerId === playerId;
  });
}

/**
 * Upserts one negotiation into the durable collection and revalidates it.
 *
 * A new negotiation appends its ID; a status transition on an existing one
 * keeps the ordered ID array unchanged. Shared by the club and player stage
 * modules so both write the collection through exactly one validated path.
 */
export function upsertTransferNegotiation(
  careerState: CareerState,
  negotiation: TransferNegotiation,
): CareerState {
  const state = careerState.transferNegotiationState
    ?? { negotiations: {}, negotiationIds: [] };
  return withTransferNegotiations(careerState, {
    negotiations: { ...state.negotiations, [negotiation.id]: negotiation },
    negotiationIds: state.negotiationIds.includes(negotiation.id)
      ? state.negotiationIds
      : [...state.negotiationIds, negotiation.id],
  });
}

/** Wraps one upserted negotiation in the applied command result. */
function applied(
  careerState: CareerState,
  negotiation: TransferNegotiation,
): TransferNegotiationCommandResult {
  return {
    status: "applied",
    careerState: upsertTransferNegotiation(careerState, negotiation),
    negotiation,
  };
}

/** Returns a career copy carrying one validated transfer-negotiation collection. */
function withTransferNegotiations(
  careerState: CareerState,
  state: TransferNegotiationState,
): CareerState {
  return { ...careerState, transferNegotiationState: createTransferNegotiationState(state) };
}

/** Deterministically seeds a stage response delay in `0..NEGOTIATION_STAGE_MAX_DAYS`. */
function responseDelayDays(
  careerState: CareerState,
  negotiationId: TransferNegotiationId,
  submittedOn: GameDate,
): number {
  return deriveNegotiationStageResponseDelayDays({
    seed: careerState.gameState.meta.seed,
    streamKey: "transfer-negotiation-response-delay",
    negotiationId,
    submittedOn,
  });
}
