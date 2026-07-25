import {
  addMoney,
  findClubFinanceAccount,
  nonNegativeMoney,
  type CareerState,
  type ClubId,
  type Money,
} from "@game/domain";

/** Stable reason why a new contract commitment cannot be funded. */
export type CareerContractCapacityReason =
  | "club_finance_account_missing"
  | "wage_budget_exceeded"
  | "insufficient_cash";

/**
 * Input for evaluating one new contract against committed funds only.
 *
 * Only committed contracts and the terms being evaluated count. Unresolved
 * offers do not reserve or spend budget (Phase 79 locked rule); affordability
 * is rechecked at acceptance/completion against then-current committed facts.
 */
export interface EvaluateCareerContractCapacityInput {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
  readonly addedAnnualWage: Money;
  /** Validated active wage replaced atomically by the proposed agreement. */
  readonly replacedAnnualWage?: Money;
  readonly addedSigningBonus: Money;
  /** Immediate non-contract cash cost, such as a permanent-transfer fee. */
  readonly additionalImmediateCost?: Money;
}

/** Structured result of one contract-capacity evaluation. */
export type CareerContractCapacityEvaluation =
  | {
      readonly status: "affordable";
      readonly requiredAnnualWage: Money;
      readonly availableAnnualWageBudget: Money;
      readonly requiredCash: Money;
      readonly availableCash: Money;
    }
  | {
      readonly status: "unaffordable";
      readonly reason: CareerContractCapacityReason;
      readonly requiredAmount?: Money;
      readonly availableAmount?: Money;
    };

/**
 * Evaluates new terms against the club's committed contracts and cash only.
 *
 * Signing, promotion, and transfer use cases share this one affordability
 * policy. It never counts another unresolved offer as spent: pending offers are
 * informational exposure, not budget (see `deriveMarketPendingExposure`). Every
 * acceptance/completion calls this again so no stale cash or wage room can be
 * bypassed while offers were pending.
 */
export function evaluateCareerContractCapacity(
  input: EvaluateCareerContractCapacityInput,
): CareerContractCapacityEvaluation {
  const financeState = input.careerState.clubFinanceState;
  const account = financeState === undefined
    ? undefined
    : findClubFinanceAccount(financeState, input.clubId);
  if (account === undefined) {
    return { status: "unaffordable", reason: "club_finance_account_missing" };
  }

  const requiredAnnualWage = addMoney(
    nonNegativeMoney(
      account.committedAnnualWage - (input.replacedAnnualWage ?? nonNegativeMoney(0)),
    ),
    input.addedAnnualWage,
  );
  if (requiredAnnualWage > account.annualWageBudget) {
    return {
      status: "unaffordable",
      reason: "wage_budget_exceeded",
      requiredAmount: requiredAnnualWage,
      availableAmount: account.annualWageBudget,
    };
  }

  const requiredCash = addMoney(
    input.addedSigningBonus,
    input.additionalImmediateCost ?? nonNegativeMoney(0),
  );
  if (requiredCash > account.cashBalance) {
    return {
      status: "unaffordable",
      reason: "insufficient_cash",
      requiredAmount: requiredCash,
      availableAmount: account.cashBalance,
    };
  }

  return {
    status: "affordable",
    requiredAnnualWage,
    availableAnnualWageBudget: account.annualWageBudget,
    requiredCash,
    availableCash: account.cashBalance,
  };
}

/** Stable reason a transfer fee cannot be funded. */
export type TransferFeeCapacityReason =
  | "club_finance_account_missing"
  | "insufficient_transfer_budget"
  | "insufficient_cash";

/** Structured result of previewing one club-stage transfer fee. */
export type TransferFeeCapacityEvaluation =
  | {
      readonly status: "affordable";
      readonly availableTransferBudget: Money;
      readonly projectedTransferBudget: Money;
      readonly availableCash: Money;
      readonly projectedCash: Money;
    }
  | {
      readonly status: "unaffordable";
      readonly reason: TransferFeeCapacityReason;
      readonly requiredAmount: Money;
      readonly availableAmount: Money;
    };

/**
 * Previews one manager-chosen fee against the buyer's transfer budget and cash.
 *
 * This is a pure read: it never mutates finance state and never runs seller
 * willingness. Both club-stage offer drafting and the final atomic transfer
 * commit derive affordability from the same two account facts, so a preview
 * can never promise more than completion later honors.
 */
export function evaluateTransferFeeCapacity(input: {
  readonly careerState: CareerState;
  readonly buyingClubId: ClubId;
  readonly fee: Money;
}): TransferFeeCapacityEvaluation {
  const financeState = input.careerState.clubFinanceState;
  const account = financeState === undefined
    ? undefined
    : findClubFinanceAccount(financeState, input.buyingClubId);
  if (account === undefined) {
    return {
      status: "unaffordable",
      reason: "club_finance_account_missing",
      requiredAmount: input.fee,
      availableAmount: nonNegativeMoney(0),
    };
  }

  if (input.fee > account.availableTransferBudget) {
    return {
      status: "unaffordable",
      reason: "insufficient_transfer_budget",
      requiredAmount: input.fee,
      availableAmount: account.availableTransferBudget,
    };
  }
  if (input.fee > account.cashBalance) {
    return {
      status: "unaffordable",
      reason: "insufficient_cash",
      requiredAmount: input.fee,
      availableAmount: account.cashBalance,
    };
  }

  return {
    status: "affordable",
    availableTransferBudget: account.availableTransferBudget,
    projectedTransferBudget: nonNegativeMoney(account.availableTransferBudget - input.fee),
    availableCash: account.cashBalance,
    projectedCash: nonNegativeMoney(account.cashBalance - input.fee),
  };
}
