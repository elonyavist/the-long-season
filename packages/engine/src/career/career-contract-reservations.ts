import {
  addMoney,
  findClubFinanceAccount,
  nonNegativeMoney,
  type CareerState,
  type ClubId,
  type ContractNegotiation,
  type ContractNegotiationId,
  type ContractOfferTerms,
  type Money,
  type PlayerContract,
} from "@game/domain";

/** Stable reason why a new contract commitment cannot be funded. */
export type CareerContractCapacityReason =
  | "club_finance_account_missing"
  | "wage_budget_exceeded"
  | "insufficient_cash";

/** Input for evaluating one new contract against actual and promised funds. */
export interface EvaluateCareerContractCapacityInput {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
  readonly addedAnnualWage: Money;
  /** Validated active wage replaced atomically by the proposed agreement. */
  readonly replacedAnnualWage?: Money;
  readonly addedSigningBonus: Money;
  /** Immediate non-contract cash cost, such as a permanent-transfer fee. */
  readonly additionalImmediateCost?: Money;
  /** Open negotiation replaced by the terms currently being evaluated. */
  readonly excludedNegotiationId?: ContractNegotiationId;
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

/** Financial commitments already promised by unresolved contract offers. */
export interface CareerContractOfferReservations {
  readonly projectedCommittedAnnualWage: Money;
  readonly reservedSigningBonus: Money;
}

/**
 * Derives one club's effective commitments including unresolved offers.
 *
 * Open renewals replace the current contract wage in the projection and add
 * their signing bonus to reserved cash. The values are derived from durable
 * negotiation facts so every later finance command sees the same promises.
 */
export function deriveCareerContractOfferReservations(
  careerState: CareerState,
  clubId: ClubId,
  options: {
    /** Open negotiation omitted while evaluating its replacement terms. */
    readonly excludedNegotiationId?: ContractNegotiationId;
  } = {},
): CareerContractOfferReservations {
  const account = careerState.clubFinanceState?.accounts[clubId];
  let projectedCommittedAnnualWage = account?.committedAnnualWage
    ?? nonNegativeMoney(0);
  let reservedSigningBonus = nonNegativeMoney(0);

  for (const negotiationId of careerState.contractNegotiationState?.negotiationIds ?? []) {
    if (negotiationId === options.excludedNegotiationId) continue;
    const negotiation = careerState.contractNegotiationState?.negotiations[negotiationId];
    if (negotiation?.clubId !== clubId) continue;
    const terms = reservedTerms(negotiation);
    const currentContract = careerState.seniorSquadState?.contracts[
      negotiation.currentContractId
    ];
    if (terms === undefined || currentContract === undefined) continue;

    projectedCommittedAnnualWage = replaceReservedContractWage(
      projectedCommittedAnnualWage,
      currentContract,
      terms,
    );
    reservedSigningBonus = addMoney(
      reservedSigningBonus,
      terms.bonuses.signingBonus,
    );
  }

  return { projectedCommittedAnnualWage, reservedSigningBonus };
}

/**
 * Evaluates new terms against committed contracts and every unresolved offer.
 *
 * The calculation is deliberately derived from durable career facts. Signing,
 * promotion, and transfer use cases can therefore share one affordability
 * policy without persisting a second balance or silently spending funds that
 * have already been promised to another player.
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

  const reservations = deriveCareerContractOfferReservations(
    input.careerState,
    input.clubId,
    input.excludedNegotiationId === undefined
      ? {}
      : { excludedNegotiationId: input.excludedNegotiationId },
  );
  const requiredAnnualWage = addMoney(
    nonNegativeMoney(
      reservations.projectedCommittedAnnualWage
      - (input.replacedAnnualWage ?? nonNegativeMoney(0)),
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
    addMoney(
      reservations.reservedSigningBonus,
      input.addedSigningBonus,
    ),
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

function reservedTerms(
  negotiation: ContractNegotiation,
): ContractOfferTerms | undefined {
  if (negotiation.status === "awaiting_response") {
    return negotiation.submittedOffer.terms;
  }
  if (negotiation.status === "countered") {
    return negotiation.counterOffer.terms;
  }
  return undefined;
}

/** Reserves raises immediately without treating an unresolved wage cut as available budget. */
function replaceReservedContractWage(
  committed: Money,
  currentContract: PlayerContract,
  terms: ContractOfferTerms,
): Money {
  return nonNegativeMoney(
    committed
      - currentContract.annualWage
      + Math.max(currentContract.annualWage, terms.annualWage),
  );
}
