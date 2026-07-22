import {
  addMoney,
  clubFinanceLedgerEntryId,
  findClubFinanceAccount,
  nextTransferHistorySequence,
  postClubFinanceLedgerEntries,
  replaceClubFinanceAccounts,
  subtractMoney,
  type AgreedSquadStatus,
  type CareerState,
  type ClubFinanceState,
  type ClubId,
  type ContractOfferTerms,
  type GameDate,
  type GameState,
  type Money,
  type PlayerContract,
  type PermanentTransferIntent,
  type TransferRejectionReason,
} from "@game/domain";

import { evaluatePermanentTransfer } from "../market/transfer-feasibility.ts";
import type { PlayerValuation, PlayerValuationConfig } from "../market/player-valuation.ts";
import type { PlayerWillingness } from "../market/player-willingness.ts";
import { applyContractActivationFinance } from "./career-finance-lifecycle.ts";
import {
  evaluateCareerContractCapacity,
  type CareerContractCapacityEvaluation,
} from "./career-contract-reservations.ts";
import { reconcileClosedContractNegotiations } from "./contract-negotiation.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import { prepareSeniorSquadPermanentTransfer } from "./senior-squad-transfer.ts";

/** Inputs needed to apply one permanent transfer to durable career state. */
export interface ApplyCareerPermanentTransferInput {
  /** Current durable career state. */
  readonly careerState: CareerState;
  /** Manager-declared permanent transfer request. */
  readonly intent: PermanentTransferIntent;
  /** Optional valuation tuning; defaults to the market MVP config. */
  readonly valuationConfig?: PlayerValuationConfig;
  /** Effective football date for season-boundary transfers. */
  readonly occurredOn?: GameDate;
}

/** Result of applying or rejecting one durable permanent-transfer attempt. */
export interface ApplyCareerPermanentTransferResult {
  /** Original manager request. */
  readonly intent: PermanentTransferIntent;
  /** Final transfer application status. */
  readonly status: "accepted" | "rejected";
  /** Empty when accepted; populated when rejected. */
  readonly reasons: readonly TransferRejectionReason[];
  /** Transfer fee used by the market evaluation when available. */
  readonly transferFee?: Money;
  /** Valuation details when the target player and selling club are known. */
  readonly valuation?: PlayerValuation;
  /** Player willingness details when both clubs and the player are known. */
  readonly willingness?: PlayerWillingness;
  /** Original career state when rejected; copied updated state when accepted. */
  readonly careerState: CareerState;
}

/**
 * Applies an accepted permanent transfer to a copied durable career state.
 *
 * Rejected transfer attempts return the original `CareerState` reference. This
 * keeps save-writing callers simple: only accepted results should be persisted.
 */
export function applyCareerPermanentTransfer(
  input: ApplyCareerPermanentTransferInput,
): ApplyCareerPermanentTransferResult {
  if (input.careerState.clubFinanceState === undefined) {
    return {
      intent: input.intent,
      status: "rejected",
      reasons: [{
        code: "missing_buying_budget",
        clubId: input.intent.buyingClubId,
      }],
      careerState: input.careerState,
    };
  }

  if (input.careerState.seniorSquadState === undefined) {
    throw new Error("A durable permanent transfer requires canonical senior-squad state");
  }

  const currentContract = activeContractFor(
    input.careerState,
    input.intent.playerId,
    input.intent.sellingClubId,
  );
  if (currentContract === undefined) {
    throw new Error(`Active seller contract not found for transfer player: ${input.intent.playerId}`);
  }
  const occurredOn = input.occurredOn ?? input.careerState.gameState.calendar.currentDate;
  const acceptedTerms = deriveTransferContractTerms({
    careerState: input.careerState,
    playerId: input.intent.playerId,
    buyingClubId: input.intent.buyingClubId,
    evaluatedOn: occurredOn,
    currentContract,
  });
  const currentForm = input.careerState.gameState.playerStates[input.intent.playerId]?.form;

  const feasibility = evaluatePermanentTransfer({
    gameState: input.careerState.gameState,
    clubFinanceState: input.careerState.clubFinanceState,
    intent: input.intent,
    currentContract,
    proposedTerms: acceptedTerms,
    ...(currentForm === undefined ? {} : { currentForm: Number(currentForm) }),
    ...(input.valuationConfig === undefined ? {} : { valuationConfig: input.valuationConfig }),
  });

  if (feasibility.status === "rejected" || feasibility.transferFee === undefined) {
    return {
      intent: feasibility.intent,
      status: "rejected",
      reasons: feasibility.reasons,
      ...(feasibility.transferFee === undefined ? {} : { transferFee: feasibility.transferFee }),
      ...(feasibility.valuation === undefined ? {} : { valuation: feasibility.valuation }),
      ...(feasibility.willingness === undefined ? {} : { willingness: feasibility.willingness }),
      careerState: input.careerState,
    };
  }

  const capacity = evaluateCareerContractCapacity({
    careerState: input.careerState,
    clubId: feasibility.intent.buyingClubId,
    addedAnnualWage: acceptedTerms.annualWage,
    addedSigningBonus: acceptedTerms.bonuses.signingBonus,
    additionalImmediateCost: feasibility.transferFee,
  });
  if (capacity.status === "unaffordable") {
    return {
      intent: feasibility.intent,
      status: "rejected",
      reasons: [capacityTransferRejection(feasibility.intent.buyingClubId, capacity)],
      transferFee: feasibility.transferFee,
      ...(feasibility.valuation === undefined ? {} : { valuation: feasibility.valuation }),
      ...(feasibility.willingness === undefined ? {} : { willingness: feasibility.willingness }),
      careerState: input.careerState,
    };
  }

  const transferSequence = nextTransferHistorySequence(input.careerState);
  const seniorTransition = prepareSeniorSquadPermanentTransfer({
    gameState: input.careerState.gameState,
    seniorSquadState: input.careerState.seniorSquadState,
    playerId: feasibility.intent.playerId,
    buyingClubId: feasibility.intent.buyingClubId,
    occurredOn,
    transferSequence,
    acceptedTerms,
  });
  const feeFinanceState = applyPermanentTransferFeeFinance(
    input.careerState.clubFinanceState,
    feasibility.intent,
    feasibility.transferFee,
    occurredOn,
  );
  const contractNegotiationState = reconcileClosedContractNegotiations({
    gameState: seniorTransition.gameState,
    seniorSquadState: seniorTransition.seniorSquadState,
    contractNegotiationState: input.careerState.contractNegotiationState,
    closedContractIds: [currentContract.id],
  });
  const {
    contractNegotiationState: _previousContractNegotiationState,
    ...careerWithoutPreviousNegotiations
  } = input.careerState;
  const transferHistory = [
    ...input.careerState.transferHistory,
    {
      sequenceNumber: transferSequence,
      occurredOn,
      buyingClubId: feasibility.intent.buyingClubId,
      sellingClubId: feasibility.intent.sellingClubId,
      playerId: feasibility.intent.playerId,
      transferFee: feasibility.transferFee,
    },
  ];
  const acceptedBase: CareerState = {
    ...careerWithoutPreviousNegotiations,
    gameState: seniorTransition.gameState,
    seniorSquadState: seniorTransition.seniorSquadState,
    clubFinanceState: feeFinanceState,
    transferHistory,
    ...(contractNegotiationState === undefined ? {} : { contractNegotiationState }),
  };
  const financeResult = applyContractActivationFinance({
    careerState: acceptedBase,
    seniorSquadState: seniorTransition.seniorSquadState,
    activatedContractIds: [seniorTransition.activatedContractId],
    occurredOn,
  });
  if (financeResult.status === "rejected") {
    return {
      intent: feasibility.intent,
      status: "rejected",
      reasons: [financeTransferRejection(feasibility.intent.buyingClubId, financeResult)],
      transferFee: feasibility.transferFee,
      ...(feasibility.valuation === undefined ? {} : { valuation: feasibility.valuation }),
      ...(feasibility.willingness === undefined ? {} : { willingness: feasibility.willingness }),
      careerState: input.careerState,
    };
  }

  return {
    intent: feasibility.intent,
    status: "accepted",
    reasons: [],
    transferFee: feasibility.transferFee,
    ...(feasibility.valuation === undefined ? {} : { valuation: feasibility.valuation }),
    ...(feasibility.willingness === undefined ? {} : { willingness: feasibility.willingness }),
    careerState: financeResult.careerState,
  };
}

/**
 * Posts both sides of one already-feasible fee inside the career transaction.
 *
 * This helper intentionally lives beside the only ownership-changing transfer
 * use case. Market evaluation cannot mutate copied rosters or budgets through
 * a second path.
 */
function applyPermanentTransferFeeFinance(
  financeState: ClubFinanceState,
  intent: PermanentTransferIntent,
  transferFee: Money,
  occurredOn: GameDate,
): ClubFinanceState {
  const buyingAccount = findClubFinanceAccount(financeState, intent.buyingClubId);
  const sellingAccount = findClubFinanceAccount(financeState, intent.sellingClubId);

  if (buyingAccount === undefined || sellingAccount === undefined) return financeState;

  const transferReference = [
    "transfer",
    occurredOn,
    intent.playerId,
    intent.sellingClubId,
    intent.buyingClubId,
  ].join(":");
  const buyerEntryId = clubFinanceLedgerEntryId(`finance-ledger:${transferReference}:paid`);
  const sellerEntryId = clubFinanceLedgerEntryId(`finance-ledger:${transferReference}:received`);
  const posted = postClubFinanceLedgerEntries(financeState, [
    {
      id: buyerEntryId,
      clubId: buyingAccount.clubId,
      occurredOn,
      currency: financeState.currency,
      reason: "transfer_fee_paid",
      direction: "debit",
      amount: transferFee,
      referenceId: transferReference,
    },
    {
      id: sellerEntryId,
      clubId: sellingAccount.clubId,
      occurredOn,
      currency: financeState.currency,
      reason: "transfer_fee_received",
      direction: "credit",
      amount: transferFee,
      referenceId: transferReference,
    },
  ]);
  const buyerAfterPosting = findClubFinanceAccount(posted, buyingAccount.clubId);
  const sellerAfterPosting = findClubFinanceAccount(posted, sellingAccount.clubId);
  if (buyerAfterPosting === undefined || sellerAfterPosting === undefined) return financeState;

  return replaceClubFinanceAccounts(posted, [
    {
      ...buyerAfterPosting,
      availableTransferBudget: subtractMoney(buyingAccount.availableTransferBudget, transferFee),
    },
    {
      ...sellerAfterPosting,
      availableTransferBudget: addMoney(sellerAfterPosting.availableTransferBudget, transferFee),
    },
  ]);
}

function activeContractFor(
  careerState: CareerState,
  playerId: PermanentTransferIntent["playerId"],
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

/**
 * Derives credible destination terms without silently weakening an agreement.
 *
 * A permanent move is evaluated as an already-negotiated transaction. The
 * destination demand can improve the terms, while the current wage, squad
 * standing, and remaining security remain the deterministic lower bounds.
 */
function deriveTransferContractTerms(input: {
  readonly careerState: CareerState;
  readonly playerId: PermanentTransferIntent["playerId"];
  readonly buyingClubId: ClubId;
  readonly evaluatedOn: GameState["calendar"]["currentDate"];
  readonly currentContract: PlayerContract;
}): ContractOfferTerms {
  const preferred = deriveContractDemand({
    careerState: input.careerState,
    playerId: input.playerId,
    clubId: input.buyingClubId,
    evaluatedOn: input.evaluatedOn,
    currentContract: input.currentContract,
    isFreeAgent: false,
  }).preferredTerms;
  const remainingDays = Math.max(0, input.currentContract.endsOn - input.evaluatedOn);
  const protectedDurationYears = Math.min(
    5,
    Math.max(1, Math.ceil(Math.max(0, remainingDays - 90) / 365)),
  );

  return {
    ...preferred,
    durationYears: Math.max(preferred.durationYears, protectedDurationYears),
    squadStatus: strongerSquadStatus(preferred.squadStatus, input.currentContract.squadStatus),
  };
}

function strongerSquadStatus(
  proposed: AgreedSquadStatus,
  current: AgreedSquadStatus,
): AgreedSquadStatus {
  return SQUAD_STATUS_RANK[proposed] >= SQUAD_STATUS_RANK[current] ? proposed : current;
}

const SQUAD_STATUS_RANK: Readonly<Record<AgreedSquadStatus, number>> = {
  prospect: 1,
  fringe_player: 2,
  squad_player: 3,
  regular_starter: 4,
  key_player: 5,
};

function financeTransferRejection(
  clubId: PermanentTransferIntent["buyingClubId"],
  result: Extract<ReturnType<typeof applyContractActivationFinance>, { readonly status: "rejected" }>,
): TransferRejectionReason {
  if (result.reason === "wage_budget_exceeded") {
    return {
      code: "insufficient_wage_budget",
      clubId,
      ...(result.requiredAmount === undefined ? {} : { requiredBudget: result.requiredAmount }),
      ...(result.availableAmount === undefined ? {} : { availableBudget: result.availableAmount }),
    };
  }
  return {
    code: result.reason === "insufficient_cash" ? "insufficient_cash" : "missing_buying_budget",
    clubId,
    ...(result.requiredAmount === undefined ? {} : { requiredBudget: result.requiredAmount }),
    ...(result.availableAmount === undefined ? {} : { availableBudget: result.availableAmount }),
  };
}

function capacityTransferRejection(
  clubId: PermanentTransferIntent["buyingClubId"],
  result: Extract<CareerContractCapacityEvaluation, { readonly status: "unaffordable" }>,
): TransferRejectionReason {
  const code = result.reason === "wage_budget_exceeded"
    ? "insufficient_wage_budget"
    : result.reason === "insufficient_cash"
      ? "insufficient_cash"
      : "missing_buying_budget";
  return {
    code,
    clubId,
    ...(result.requiredAmount === undefined ? {} : { requiredBudget: result.requiredAmount }),
    ...(result.availableAmount === undefined ? {} : { availableBudget: result.availableAmount }),
  };
}
