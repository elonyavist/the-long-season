import {
  addMoney,
  nonNegativeMoney,
  type CareerState,
  type ClubId,
  type ContractNegotiation,
  type Money,
} from "@game/domain";

/**
 * Informational, non-committing pending-money exposure for one club.
 *
 * This is a derived read result, never a second budget. It answers "how much
 * would I owe if every unresolved offer were accepted right now" so the manager
 * can see combined risk. It does not touch finance accounts or ledgers, and it
 * never reduces the affordability headroom in `evaluateCareerContractCapacity`.
 */
export interface MarketPendingExposure {
  /** Extra annual wage that unresolved offers would add if all accepted. */
  readonly pendingAnnualWageExposure: Money;
  /** Signing bonus cash that unresolved offers would spend if all accepted. */
  readonly pendingSigningExposure: Money;
}

/**
 * Derives one club's aggregate pending exposure from durable negotiation facts.
 *
 * Only unresolved offers (`awaiting_response`, `countered`) contribute. A raise
 * contributes the wage increase over the current contract; an unresolved wage
 * cut contributes nothing (it is not a saving until accepted). Signing bonuses
 * contribute their full cash amount.
 *
 * @example
 * const exposure = deriveMarketPendingExposure(careerState, clubId);
 * // { pendingAnnualWageExposure, pendingSigningExposure }
 */
export function deriveMarketPendingExposure(
  careerState: CareerState,
  clubId: ClubId,
): MarketPendingExposure {
  let pendingAnnualWageExposure = nonNegativeMoney(0);
  let pendingSigningExposure = nonNegativeMoney(0);

  for (const negotiationId of careerState.contractNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.contractNegotiationState?.negotiations[negotiationId];
    if (negotiation?.clubId !== clubId) continue;
    const terms = unresolvedOfferTerms(negotiation);
    const currentContract = careerState.seniorSquadState?.contracts[negotiation.currentContractId];
    if (terms === undefined || currentContract === undefined) continue;

    const raise = nonNegativeMoney(Math.max(0, terms.annualWage - currentContract.annualWage));
    pendingAnnualWageExposure = addMoney(pendingAnnualWageExposure, raise);
    pendingSigningExposure = addMoney(pendingSigningExposure, terms.bonuses.signingBonus);
  }

  return { pendingAnnualWageExposure, pendingSigningExposure };
}

/** Returns the live offered terms of an unresolved negotiation, else undefined. */
function unresolvedOfferTerms(negotiation: ContractNegotiation) {
  if (negotiation.status === "awaiting_response") return negotiation.submittedOffer.terms;
  if (negotiation.status === "countered") return negotiation.counterOffer.terms;
  return undefined;
}
