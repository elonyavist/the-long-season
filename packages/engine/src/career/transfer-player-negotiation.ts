import {
  createNegotiationStageClock,
  isNegotiationStageExpired,
  playerSquadDepartment,
  transferNegotiationParties,
  type CareerState,
  type ClubId,
  type ContractOfferEvaluation,
  type ContractOfferTerms,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type PlayerContract,
  type PlayerWagePolicyConfig,
  type SeasonTransferWindows,
  type TransferCompletionFailureReason,
  type TransferNegotiation,
  type TransferNegotiationId,
} from "@game/domain";

import { evaluateMarketActionEligibility } from "../market/market-eligibility.ts";
import { derivePlayerWillingness } from "../market/player-willingness.ts";
import {
  applyCareerPermanentTransfer,
  type ApplyCareerPermanentTransferResult,
} from "./apply-career-transfer.ts";
import { deriveContractDemand, evaluateContractOffer } from "./contract-negotiation-demand.ts";
import { deriveNegotiationStageResponseDelayDays } from "./negotiation-response-delay.ts";
import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  MINIMUM_CAREER_SQUAD_SIZE,
} from "./squad-maintenance.ts";
import { upsertTransferNegotiation } from "./transfer-negotiation.ts";

/** Stable reason an explicit player-stage command was refused. */
export type TransferPlayerNegotiationCommandRejectionReason =
  | "negotiation_not_found"
  | "club_agreement_required"
  | "player_counter_required"
  | "player_contract_not_found"
  | "outside_transfer_window"
  | "decision_after_deadline";

/** Applied or refused result of one player-stage command. */
export type TransferPlayerNegotiationCommandResult =
  | {
      readonly status: "applied";
      readonly careerState: CareerState;
      readonly negotiation: TransferNegotiation;
    }
  | {
      readonly status: "rejected";
      readonly reason: TransferPlayerNegotiationCommandRejectionReason;
      readonly negotiationId: TransferNegotiationId;
    };

/** Starts the second transfer table from one accepted club agreement. */
export interface SubmitTransferPlayerOfferInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly negotiationId: TransferNegotiationId;
  readonly submittedOn: GameDate;
  readonly terms: ContractOfferTerms;
  readonly transferWindows: SeasonTransferWindows;
}

/**
 * Submits annual player terms without spending or reserving club money.
 *
 * The stage can only follow an accepted club fee and receives its own deadline,
 * capped at the active registration-window close. The accepted club fee is
 * retained as an immutable fact throughout the player table.
 */
export function submitTransferPlayerOffer(
  input: SubmitTransferPlayerOfferInput,
): TransferPlayerNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.negotiationId, "negotiation_not_found");
  if (negotiation.status !== "accepted") return rejected(input.negotiationId, "club_agreement_required");

  const eligibility = evaluateMarketActionEligibility({
    action: "permanent_transfer_offer",
    windows: input.transferWindows,
    asOf: input.submittedOn,
  });
  if (eligibility.status === "blocked") return rejected(input.negotiationId, "outside_transfer_window");

  const currentContract = activeContractFor(
    input.careerState,
    negotiation.playerId,
    negotiation.sellingClubId,
  );
  if (currentContract === undefined) return rejected(input.negotiationId, "player_contract_not_found");

  const demand = deriveContractDemand({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    playerId: negotiation.playerId,
    clubId: negotiation.buyingClubId,
    evaluatedOn: input.submittedOn,
    currentContract,
    isFreeAgent: false,
  });
  const next: TransferNegotiation = {
    ...transferNegotiationParties(negotiation),
    status: "player_offer_submitted",
    agreedFee: negotiation.agreedFee,
    clubAcceptedOn: negotiation.acceptedOn,
    submittedOn: input.submittedOn,
    offeredTerms: input.terms,
    demand,
    clock: createNegotiationStageClock({
      submittedOn: input.submittedOn,
      responseDelayDays: responseDelayDays(input.careerState, input.negotiationId, input.submittedOn),
      ...(eligibility.closesOn === undefined ? {} : { windowClosesOn: eligibility.closesOn }),
    }),
  };
  return applied(input.careerState, next);
}

/** Input for advancing every due player-contract table. */
export interface AdvanceTransferPlayerNegotiationsInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly throughDate: GameDate;
  readonly transferWindows: SeasonTransferWindows;
  /** Buyers whose player-stage decisions remain under human control. */
  readonly protectedBuyingClubIds?: readonly ClubId[];
  /** Rechecks AI seller structure when concurrent agreements reach completion. */
  readonly protectSellerSquadDepth?: boolean;
}

/** One player-stage outcome produced by a deterministic advancement pass. */
export interface AdvancedTransferPlayerNegotiation {
  readonly negotiationId: TransferNegotiationId;
  readonly status: TransferNegotiation["status"];
}

/** Result of resolving all due or expired player stages. */
export interface AdvanceTransferPlayerNegotiationsResult {
  readonly careerState: CareerState;
  readonly resolved: readonly AdvancedTransferPlayerNegotiation[];
}

/**
 * Resolves submitted player terms and expires unanswered player counters.
 *
 * Already terminal negotiations are ignored, making repeated advancement
 * idempotent. An accepted offer immediately enters the single atomic permanent
 * transfer boundary; no ownership or finance mutation exists before that call.
 */
export function advanceTransferPlayerNegotiations(
  input: AdvanceTransferPlayerNegotiationsInput,
): AdvanceTransferPlayerNegotiationsResult {
  const state = input.careerState.transferNegotiationState;
  if (state === undefined) return { careerState: input.careerState, resolved: [] };

  let careerState = input.careerState;
  const resolved: AdvancedTransferPlayerNegotiation[] = [];
  const protectedBuyingClubIds = new Set(input.protectedBuyingClubIds ?? []);
  const dueStageIds = state.negotiationIds
    .filter((negotiationId) => {
      const negotiation = state.negotiations[negotiationId];
      return negotiation?.status === "player_offer_submitted"
        || negotiation?.status === "player_countered";
    })
    .sort((leftId, rightId) => {
      const left = state.negotiations[leftId];
      const right = state.negotiations[rightId];
      if (
        left === undefined
        || right === undefined
        || (left.status !== "player_offer_submitted" && left.status !== "player_countered")
        || (right.status !== "player_offer_submitted" && right.status !== "player_countered")
      ) return String(leftId).localeCompare(String(rightId));
      return left.clock.submittedOn - right.clock.submittedOn
        || String(leftId).localeCompare(String(rightId));
    });

  for (const negotiationId of dueStageIds) {
    const current = findNegotiation(careerState, negotiationId);
    if (current !== undefined && protectedBuyingClubIds.has(current.buyingClubId)) continue;
    if (current?.status === "player_countered") {
      if (isNegotiationStageExpired(current.clock, input.throughDate)) {
        const expired: TransferNegotiation = {
          ...transferNegotiationParties(current),
          status: "player_expired",
          agreedFee: current.agreedFee,
          expiredOn: current.clock.deadline,
        };
        careerState = upsertTransferNegotiation(careerState, expired);
        resolved.push({ negotiationId, status: expired.status });
      }
      continue;
    }
    if (current?.status !== "player_offer_submitted") continue;
    if (isNegotiationStageExpired(current.clock, input.throughDate)) {
      const expired: TransferNegotiation = {
        ...transferNegotiationParties(current),
        status: "player_expired",
        agreedFee: current.agreedFee,
        expiredOn: current.clock.deadline,
      };
      careerState = upsertTransferNegotiation(careerState, expired);
      resolved.push({ negotiationId, status: expired.status });
      continue;
    }
    if (input.throughDate < current.clock.responseDueOn) continue;

    const resolution = resolveSubmittedOffer(
      careerState,
      current,
      input.transferWindows,
      input.protectSellerSquadDepth === true,
      input.wagePolicy,
      input.marketBehaviorPolicy,
    );
    careerState = resolution.careerState;
    resolved.push({ negotiationId, status: resolution.negotiation.status });
  }
  return resolved.length === 0
    ? { careerState: input.careerState, resolved: [] }
    : { careerState, resolved };
}

/** Input for accepting or rejecting a player's counteroffer. */
export interface ResolveTransferPlayerCounterInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly negotiationId: TransferNegotiationId;
  readonly decidedOn: GameDate;
  readonly transferWindows: SeasonTransferWindows;
  /** Rechecks AI seller structure when concurrent agreements reach completion. */
  readonly protectSellerSquadDepth?: boolean;
}

/** Accepts a live player counter and attempts the atomic transfer once. */
export function acceptTransferPlayerCounter(
  input: ResolveTransferPlayerCounterInput,
): TransferPlayerNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.negotiationId, "negotiation_not_found");
  if (negotiation.status !== "player_countered") return rejected(input.negotiationId, "player_counter_required");
  if (input.decidedOn > negotiation.clock.deadline) return rejected(input.negotiationId, "decision_after_deadline");
  return completeTransfer({
    careerState: input.careerState,
    negotiation,
    acceptedTerms: negotiation.counterTerms,
    acceptedSource: "counter_offer",
    evaluation: negotiation.evaluation,
    completedOn: input.decidedOn,
    transferWindows: input.transferWindows,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    protectSellerSquadDepth: input.protectSellerSquadDepth === true,
  });
}

/** Rejects a live player counter without changing ownership or finances. */
export function rejectTransferPlayerCounter(
  input: ResolveTransferPlayerCounterInput,
): TransferPlayerNegotiationCommandResult {
  const negotiation = findNegotiation(input.careerState, input.negotiationId);
  if (negotiation === undefined) return rejected(input.negotiationId, "negotiation_not_found");
  if (negotiation.status !== "player_countered") return rejected(input.negotiationId, "player_counter_required");
  const withdrawn: TransferNegotiation = {
    ...transferNegotiationParties(negotiation),
    status: "withdrawn",
    withdrawnOn: input.decidedOn,
  };
  return applied(input.careerState, withdrawn);
}

function resolveSubmittedOffer(
  careerState: CareerState,
  negotiation: Extract<TransferNegotiation, { readonly status: "player_offer_submitted" }>,
  transferWindows: SeasonTransferWindows,
  protectSellerSquadDepth: boolean,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): Extract<TransferPlayerNegotiationCommandResult, { readonly status: "applied" }> {
  const decidedOn = negotiation.clock.responseDueOn;
  const player = careerState.gameState.players[negotiation.playerId];
  const sellingClub = careerState.gameState.clubs[negotiation.sellingClubId];
  const buyingClub = careerState.gameState.clubs[negotiation.buyingClubId];
  const currentContract = activeContractFor(careerState, negotiation.playerId, negotiation.sellingClubId);
  if (player === undefined || sellingClub === undefined || buyingClub === undefined || currentContract === undefined) {
    return failed(careerState, negotiation, decidedOn, "stale_contract");
  }

  const willingness = derivePlayerWillingness({
    player,
    sellingClub,
    buyingClub,
    currentTier: sellingClub.category,
    destinationTier: buyingClub.category,
    currentDate: decidedOn,
    currentContract,
    proposedTerms: negotiation.offeredTerms,
    marketBehaviorPolicy,
    ratingScale: wagePolicy.ratingScale,
  });
  if (willingness.status === "rejected") {
    const playerRejected: TransferNegotiation = {
      ...transferNegotiationParties(negotiation),
      status: "player_rejected",
      agreedFee: negotiation.agreedFee,
      rejectedOn: decidedOn,
      reason: "player_unwilling",
    };
    return applied(careerState, playerRejected);
  }

  const evaluation = evaluateContractOffer({
    worldSeed: careerState.gameState.meta.seed,
    negotiationId: negotiation.id,
    evaluatedOn: decidedOn,
    offer: negotiation.offeredTerms,
    demand: negotiation.demand,
  });
  if (evaluation.decision === "rejected") {
    const playerRejected: TransferNegotiation = {
      ...transferNegotiationParties(negotiation),
      status: "player_rejected",
      agreedFee: negotiation.agreedFee,
      rejectedOn: decidedOn,
      reason: "contract_terms_rejected",
      evaluation,
    };
    return applied(careerState, playerRejected);
  }
  if (evaluation.decision === "countered") {
    const countered: TransferNegotiation = {
      ...transferNegotiationParties(negotiation),
      status: "player_countered",
      agreedFee: negotiation.agreedFee,
      clubAcceptedOn: negotiation.clubAcceptedOn,
      submittedOn: negotiation.submittedOn,
      offeredTerms: negotiation.offeredTerms,
      counterIssuedOn: decidedOn,
      counterTerms: negotiation.demand.preferredTerms,
      evaluation,
      clock: negotiation.clock,
    };
    return applied(careerState, countered);
  }
  return completeTransfer({
    careerState,
    negotiation,
    acceptedTerms: negotiation.offeredTerms,
    acceptedSource: "submitted_offer",
    evaluation,
    completedOn: decidedOn,
    transferWindows,
    protectSellerSquadDepth,
    wagePolicy,
    marketBehaviorPolicy,
  });
}

function completeTransfer(input: {
  readonly careerState: CareerState;
  readonly negotiation: Extract<
    TransferNegotiation,
    { readonly status: "player_offer_submitted" | "player_countered" }
  >;
  readonly acceptedTerms: ContractOfferTerms;
  readonly acceptedSource: "submitted_offer" | "counter_offer";
  readonly evaluation: ContractOfferEvaluation;
  readonly completedOn: GameDate;
  readonly transferWindows: SeasonTransferWindows;
  readonly protectSellerSquadDepth: boolean;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): Extract<TransferPlayerNegotiationCommandResult, { readonly status: "applied" }> {
  if (
    input.protectSellerSquadDepth
    && !sellerPreservesSquadStructure(input.careerState, input.negotiation)
  ) {
    return failed(
      input.careerState,
      input.negotiation,
      input.completedOn,
      "stale_ownership",
    );
  }
  const transfer = applyCareerPermanentTransfer({
    careerState: input.careerState,
    intent: {
      buyingClubId: input.negotiation.buyingClubId,
      sellingClubId: input.negotiation.sellingClubId,
      playerId: input.negotiation.playerId,
    },
    occurredOn: input.completedOn,
    transferWindows: input.transferWindows,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    acceptedDeal: {
      publicValue: input.negotiation.publicValue,
      initialAskingPrice: input.negotiation.initialAskingPrice,
      offeredFee: input.negotiation.offeredFee,
      ...(input.negotiation.counterFee === undefined
        ? {}
        : { counterFee: input.negotiation.counterFee }),
      agreedFee: input.negotiation.agreedFee,
      contractTerms: input.acceptedTerms,
      playerAgreementConfirmed: true,
    },
  });
  if (
    transfer.status === "rejected"
    || transfer.activatedContractId === undefined
    || transfer.transferHistorySequence === undefined
  ) {
    return failed(
      input.careerState,
      input.negotiation,
      input.completedOn,
      completionFailureReason(transfer),
    );
  }
  const completed: TransferNegotiation = {
    ...transferNegotiationParties(input.negotiation),
    status: "completed",
    agreedFee: input.negotiation.agreedFee,
    completedFee: input.negotiation.agreedFee,
    completedOn: input.completedOn,
    acceptedTerms: input.acceptedTerms,
    acceptedSource: input.acceptedSource,
    evaluation: input.evaluation,
    activatedContractId: transfer.activatedContractId,
    transferHistorySequence: transfer.transferHistorySequence,
  };
  return applied(transfer.careerState, completed);
}

/**
 * Rechecks seller floors against current ownership because provisional club
 * agreements do not reserve players or squad slots from concurrent talks.
 */
function sellerPreservesSquadStructure(
  careerState: CareerState,
  negotiation: TransferNegotiation,
): boolean {
  const sellingClub = careerState.gameState.clubs[negotiation.sellingClubId];
  const player = careerState.gameState.players[negotiation.playerId];
  if (sellingClub === undefined || player === undefined) return false;

  const department = playerSquadDepartment(player);
  const departmentCount = sellingClub.playerIds.reduce((count, playerId) => {
    const squadPlayer = careerState.gameState.players[playerId];
    return squadPlayer !== undefined && playerSquadDepartment(squadPlayer) === department
      ? count + 1
      : count;
  }, 0);
  return sellingClub.playerIds.length - 1 >= MINIMUM_CAREER_SQUAD_SIZE
    && departmentCount - 1 >= MINIMUM_CAREER_DEPARTMENT_DEPTH[department];
}

function completionFailureReason(
  transfer: ApplyCareerPermanentTransferResult,
): TransferCompletionFailureReason {
  const codes = new Set(transfer.reasons.map((reason) => reason.code));
  if (codes.has("outside_transfer_window")) return "outside_transfer_window";
  if (codes.has("seller_contract_not_found")) return "stale_contract";
  if (codes.has("registration_unavailable") || codes.has("senior_squad_state_missing")) {
    return "registration_unavailable";
  }
  if (
    codes.has("missing_buying_budget")
    || codes.has("insufficient_transfer_budget")
    || codes.has("insufficient_wage_budget")
    || codes.has("insufficient_cash")
  ) {
    return "unaffordable";
  }
  return "stale_ownership";
}

function failed(
  careerState: CareerState,
  negotiation: TransferNegotiation,
  failedOn: GameDate,
  reason: TransferCompletionFailureReason,
): Extract<TransferPlayerNegotiationCommandResult, { readonly status: "applied" }> {
  const agreedFee = "agreedFee" in negotiation ? negotiation.agreedFee : undefined;
  if (agreedFee === undefined) {
    throw new Error(`Completion failure requires an agreed fee: ${negotiation.id}`);
  }
  return applied(careerState, {
    ...transferNegotiationParties(negotiation),
    status: "completion_failed",
    agreedFee,
    failedOn,
    reason,
  });
}

function activeContractFor(
  careerState: CareerState,
  playerId: TransferNegotiation["playerId"],
  clubId: TransferNegotiation["sellingClubId"],
): PlayerContract | undefined {
  const senior = careerState.seniorSquadState;
  if (senior === undefined) return undefined;
  for (const contractId of senior.activeContractIds) {
    const contract = senior.contracts[contractId];
    if (contract?.playerId === playerId && contract.clubId === clubId) return contract;
  }
  return undefined;
}

function responseDelayDays(
  careerState: CareerState,
  negotiationId: TransferNegotiationId,
  submittedOn: GameDate,
): number {
  return deriveNegotiationStageResponseDelayDays({
    seed: careerState.gameState.meta.seed,
    streamKey: "transfer-player-response-delay",
    negotiationId,
    submittedOn,
  });
}

function findNegotiation(
  careerState: CareerState,
  negotiationId: TransferNegotiationId,
): TransferNegotiation | undefined {
  return careerState.transferNegotiationState?.negotiations[negotiationId];
}

function applied(
  careerState: CareerState,
  negotiation: TransferNegotiation,
): Extract<TransferPlayerNegotiationCommandResult, { readonly status: "applied" }> {
  return { status: "applied", careerState: upsertTransferNegotiation(careerState, negotiation), negotiation };
}

function rejected(
  negotiationId: TransferNegotiationId,
  reason: TransferPlayerNegotiationCommandRejectionReason,
): Extract<TransferPlayerNegotiationCommandResult, { readonly status: "rejected" }> {
  return { status: "rejected", reason, negotiationId };
}
