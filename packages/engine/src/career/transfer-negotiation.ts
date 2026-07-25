import {
  createNegotiationStageClock,
  createTransferNegotiationState,
  isNegotiationStageExpired,
  isOpenTransferNegotiation,
  playerSquadDepartment,
  transferNegotiationId,
  transferNegotiationParties,
  type CareerState,
  type ClubId,
  type GameDate,
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
  DEFAULT_PLAYER_VALUATION_CONFIG,
  derivePlayerValuation,
  type PlayerValuationConfig,
} from "../market/player-valuation.ts";
import { deriveNegotiationStageResponseDelayDays } from "./negotiation-response-delay.ts";
import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  MINIMUM_CAREER_SQUAD_SIZE,
} from "./squad-maintenance.ts";

/** A counter is offered when the bid reaches this fraction of the asking fee. */
const COUNTER_OFFER_THRESHOLD = 0.75;

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
  | "negotiation_not_countered";

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
  readonly valuationConfig?: PlayerValuationConfig;
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
  const negotiation: TransferNegotiation = {
    id: input.negotiationId,
    status: "submitted",
    buyingClubId: input.buyingClubId,
    sellingClubId: input.sellingClubId,
    playerId: input.playerId,
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
  readonly valuationConfig?: PlayerValuationConfig;
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

  const config = input.valuationConfig ?? DEFAULT_PLAYER_VALUATION_CONFIG;
  const nextNegotiations: Record<TransferNegotiationId, TransferNegotiation> = { ...state.negotiations };
  const resolved: AdvancedTransferNegotiation[] = [];
  const protectedSellingClubIds = new Set(input.protectedSellingClubIds ?? []);

  for (const negotiationId of [...state.negotiationIds].sort()) {
    const negotiation = state.negotiations[negotiationId];
    if (negotiation === undefined || negotiation.status !== "submitted") continue;
    if (protectedSellingClubIds.has(negotiation.sellingClubId)) continue;
    if (isNegotiationStageExpired(negotiation.clock, input.throughDate)) {
      nextNegotiations[negotiationId] = {
        ...transferNegotiationParties(negotiation),
        status: "expired",
        expiredOn: negotiation.clock.deadline,
      };
      resolved.push({ negotiationId, status: "expired" });
      continue;
    }
    if (input.throughDate < negotiation.clock.responseDueOn) continue;

    const decided = resolveSellerReply(
      input.careerState,
      negotiation,
      config,
      input.protectSquadDepth ?? false,
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

/**
 * Accepts the selling club's counteroffer at its countered fee.
 *
 * The agreed fee is rechecked for buyer affordability; if the buyer can no
 * longer fund it, the negotiation is cancelled as `unaffordable` instead.
 * Acceptance transfers no ownership and spends no money.
 */
export function acceptTransferCounter(
  input: ResolveTransferNegotiationInput,
): TransferNegotiationCommandResult {
  const negotiation = input.careerState.transferNegotiationState?.negotiations[input.negotiationId];
  if (negotiation === undefined) return { status: "rejected", reason: "negotiation_not_found" };
  if (negotiation.status !== "countered") {
    return { status: "rejected", reason: "negotiation_not_countered", negotiationId: input.negotiationId };
  }

  const resolved: TransferNegotiation = buyerCanAffordFee(input.careerState, negotiation.buyingClubId, negotiation.counterFee)
    ? { ...transferNegotiationParties(negotiation), status: "accepted", agreedFee: negotiation.counterFee, acceptedOn: input.decidedOn }
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
  readonly config?: PlayerValuationConfig;
  /** Rejects a sale that would break canonical senior-squad floors. */
  readonly protectSquadDepth?: boolean;
}): SellerTransferDecision {
  const { careerState, negotiation } = input;
  const config = input.config ?? DEFAULT_PLAYER_VALUATION_CONFIG;
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


  const currentForm = careerState.gameState.playerStates[negotiation.playerId]?.form;
  const valuation = derivePlayerValuation({
    player,
    club: sellingClub,
    currentDate: negotiation.submittedOn,
    contract,
    config,
    ...(currentForm === undefined ? {} : { currentForm: Number(currentForm) }),
  });
  const askingFee = sellerAskingFee(
    valuation.value,
    contract.squadStatus,
    Math.max(0, contract.endsOn - negotiation.submittedOn),
    careerState.clubFinanceState?.accounts[negotiation.sellingClubId]?.cashBalance ?? valuation.value,
  );

  if (negotiation.offeredFee >= askingFee) return { decision: "accept", askingFee };
  if (negotiation.offeredFee >= Math.round(askingFee * COUNTER_OFFER_THRESHOLD)) {
    return { decision: "counter", askingFee, counterFee: askingFee };
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
}

/** Converts a due seller decision into the next negotiation state. */
function resolveSellerReply(
  careerState: CareerState,
  negotiation: Extract<TransferNegotiation, { status: "submitted" }>,
  config: PlayerValuationConfig,
  protectSquadDepth: boolean,
): TransferNegotiation {
  const decision = deriveSellerTransferWillingness({
    careerState,
    negotiation,
    config,
    protectSquadDepth,
  });
  const decidedOn = negotiation.clock.responseDueOn;
  if (decision.decision === "accept") {
    return buyerCanAffordFee(careerState, negotiation.buyingClubId, negotiation.offeredFee)
      ? { ...transferNegotiationParties(negotiation), status: "accepted", agreedFee: negotiation.offeredFee, acceptedOn: decidedOn }
      : { ...transferNegotiationParties(negotiation), status: "unaffordable", cancelledOn: decidedOn };
  }
  if (decision.decision === "counter") {
    return {
      ...transferNegotiationParties(negotiation),
      status: "countered",
      submittedOn: negotiation.submittedOn,
      offeredFee: negotiation.offeredFee,
      counterFee: decision.counterFee,
      counterIssuedOn: decidedOn,
      clock: negotiation.clock,
    };
  }
  return { ...transferNegotiationParties(negotiation), status: "rejected", rejectedOn: decidedOn, reason: decision.reason };
}

/** Reports whether the buyer's transfer budget and cash both cover the fee. */
function buyerCanAffordFee(careerState: CareerState, buyingClubId: ClubId, fee: Money): boolean {
  const account = careerState.clubFinanceState?.accounts[buyingClubId];
  if (account === undefined) return false;
  return account.availableTransferBudget >= fee && account.cashBalance >= fee;
}

/** Computes the seller's asking fee from valuation, status, security, and cash. */
function sellerAskingFee(
  value: Money,
  squadStatus: PlayerContract["squadStatus"],
  remainingDays: number,
  sellerCash: Money,
): Money {
  const statusMultiplier = squadStatus === "key_player"
    ? 1.6
    : squadStatus === "regular_starter"
      ? 1.3
      : squadStatus === "squad_player"
        ? 1.1
        : squadStatus === "fringe_player"
          ? 0.9
          : 1.0;
  const securityMultiplier = remainingDays > 730
    ? 1.3
    : remainingDays > 365
      ? 1.15
      : remainingDays > 183
        ? 1.0
        : 0.85;
  const financeMultiplier = sellerCash < value ? 0.9 : 1.0;
  return Math.max(1, Math.round(value * statusMultiplier * securityMultiplier * financeMultiplier)) as Money;
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
