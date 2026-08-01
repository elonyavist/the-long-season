import type {
  AgreedSquadStatus,
  Club,
  ClubCategory,
  ContractOfferTerms,
  MarketBehaviorCalibrationConfig,
  PlayerContract,
} from "@game/domain";

import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";

/** Stable machine codes explaining a player willingness rejection. */
export type PlayerWillingnessReasonCode =
  | "sporting_level_too_low"
  | "reputation_drop_too_large"
  | "prime_player_downward_move"
  | "annual_wage_regression"
  | "squad_status_regression"
  | "contract_security_regression";

/** One structured player willingness reason. */
export interface PlayerWillingnessReason {
  /** Stable language-agnostic reason code. */
  readonly code: PlayerWillingnessReasonCode;
  /** Numeric category gap from selling club to buying club. */
  readonly categoryDrop: number;
  /** Numeric reputation gap from selling club to buying club. */
  readonly reputationDrop: number;
}

/** Deterministic output of the player willingness model. */
export interface PlayerWillingness {
  /** Final willingness status. */
  readonly status: "accepted" | "rejected";
  /** Empty when accepted; populated when rejected. */
  readonly reasons: readonly PlayerWillingnessReason[];
  /** Player age in whole years at the current date. */
  readonly age: number;
  /** Canonical public current ability used by the model. */
  readonly currentAbility: number;
  /** Numeric category gap from current club to destination club. */
  readonly categoryDrop: number;
  /** Numeric reputation gap from current club to destination club. */
  readonly reputationDrop: number;
  /** Auditable configured score used for the final acceptance boundary. */
  readonly score: number;
}

/** Inputs needed to derive one player willingness result. */
export interface DerivePlayerWillingnessInput {
  /** Canonical public facts for the player being asked to move. */
  readonly publicAssessment: PublicPlayerAssessment;
  /** Current club. */
  readonly sellingClub: Club;
  /** Destination club. */
  readonly buyingClub: Club;
  /** Persisted current competition tier at the time of the decision. */
  readonly currentTier: ClubCategory;
  /** Persisted destination competition tier at the time of the decision. */
  readonly destinationTier: ClubCategory;
  /** Current active agreement used to assess what the player gives up. */
  readonly currentContract?: PlayerContract;
  /** Terms already accepted in principle at the destination. */
  readonly proposedTerms?: ContractOfferTerms;
  /** Exact version-selected sporting-willingness policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}

/**
 * Derives deterministic player willingness for a permanent move.
 *
 * The structural facts are explicit at the call boundary: competition tiers,
 * supported club reputation, expected squad status and proposed contract
 * terms. User-facing wording belongs to CLI/UI localization.
 */
export function derivePlayerWillingness(input: DerivePlayerWillingnessInput): PlayerWillingness {
  const age = input.publicAssessment.age;
  const currentAbility = input.publicAssessment.currentAbility;
  const categoryDrop = categoryRank(input.currentTier) - categoryRank(input.destinationTier);
  const reputationDrop = input.sellingClub.reputation - input.buyingClub.reputation;
  const policy = input.marketBehaviorPolicy.sportingWillingness;
  const hasPublicSixStarUpper = input.publicAssessment.upperRating.stars === 6;
  const reasons: PlayerWillingnessReason[] = [];
  let score = transitionScore(categoryDrop, policy)
    + (input.buyingClub.reputation - input.sellingClub.reputation)
      * policy.reputationScorePerPoint;

  if (
    categoryDrop >= 2
    && (currentAbility >= policy.strongAbilityMinimum || hasPublicSixStarUpper)
  ) {
    reasons.push(reason("sporting_level_too_low", categoryDrop, reputationDrop));
    score -= policy.twoDivisionStrongPenalty;
  } else if (categoryDrop >= 1 && hasPublicSixStarUpper) {
    reasons.push(reason("sporting_level_too_low", categoryDrop, reputationDrop));
    score -= policy.oneDivisionStrongPenalty;
  } else if (categoryDrop >= 1 && currentAbility >= policy.strongAbilityMinimum) {
    score -= policy.oneDivisionStrongPenalty;
  }

  if (
    categoryDrop >= 1
    && reputationDrop >= policy.reputationDropMinimum
    && currentAbility >= policy.strongAbilityMinimum
  ) {
    reasons.push(reason("reputation_drop_too_large", categoryDrop, reputationDrop));
    score -= policy.reputationDropPenalty;
  }

  if (
    categoryDrop >= 1
    && age >= policy.primeMinimumAge
    && age <= policy.primeMaximumAge
    && currentAbility >= policy.eliteAbilityMinimum
  ) {
    reasons.push(reason("prime_player_downward_move", categoryDrop, reputationDrop));
    score -= policy.primeDownwardPenalty;
  }

  if (input.currentContract !== undefined && input.proposedTerms !== undefined) {
    const wageRatioBasisPoints = input.currentContract.annualWage <= 0
      ? 10_000
      : Math.round(
          (input.proposedTerms.annualWage * 10_000)
            / input.currentContract.annualWage,
        );
    score += Math.max(
      -policy.maximumAbsoluteWageScore,
      Math.min(
        policy.maximumAbsoluteWageScore,
        ((wageRatioBasisPoints - 10_000) / 1_000)
          * policy.wageScorePerTenPercent,
      ),
    );
    const statusChange = statusRank(input.proposedTerms.squadStatus)
      - statusRank(input.currentContract.squadStatus);
    score += statusChange * policy.squadStatusScorePerStep;
    const remainingDays = Math.max(
      0,
      input.currentContract.endsOn - input.publicAssessment.assessedOn,
    );
    score += (
      input.proposedTerms.durationYears - remainingDays / 365
    ) * policy.contractYearScore;

    if (
      categoryDrop >= 0
      && wageRatioBasisPoints < policy.annualWageRegressionThresholdBasisPoints
    ) {
      reasons.push(reason("annual_wage_regression", categoryDrop, reputationDrop));
      score -= policy.annualWageRegressionPenalty;
    }
    if (categoryDrop >= 0 && statusChange < 0) {
      reasons.push(reason("squad_status_regression", categoryDrop, reputationDrop));
      score -= policy.squadStatusRegressionPenalty;
    }
    if (
      categoryDrop >= 0
      && age <= policy.primeMaximumAge + 1
      && input.proposedTerms.durationYears * 365
        + policy.contractSecurityGraceDays < remainingDays
    ) {
      reasons.push(reason("contract_security_regression", categoryDrop, reputationDrop));
      score -= policy.contractSecurityRegressionPenalty;
    }
  }

  const finalScore = Math.round(score * 100) / 100;
  if (
    finalScore < policy.acceptanceScoreMinimum
    && reasons.length === 0
  ) {
    reasons.unshift(reason("sporting_level_too_low", categoryDrop, reputationDrop));
  }
  return {
    status: finalScore >= policy.acceptanceScoreMinimum && reasons.length === 0
      ? "accepted"
      : "rejected",
    reasons,
    age,
    currentAbility,
    categoryDrop,
    reputationDrop,
    score: finalScore,
  };
}

function transitionScore(
  categoryDrop: number,
  policy: MarketBehaviorCalibrationConfig["sportingWillingness"],
): number {
  if (categoryDrop >= 2) return policy.twoDivisionsDownScore;
  if (categoryDrop === 1) return policy.oneDivisionDownScore;
  if (categoryDrop === 0) return policy.sameDivisionScore;
  if (categoryDrop === -1) return policy.oneDivisionUpScore;
  return policy.twoDivisionsUpScore;
}

function reason(
  code: PlayerWillingnessReasonCode,
  categoryDrop: number,
  reputationDrop: number,
): PlayerWillingnessReason {
  return {
    code,
    categoryDrop,
    reputationDrop,
  };
}

function categoryRank(category: ClubCategory): number {
  if (category === "first_division") return 3;
  if (category === "second_division") return 2;
  return 1;
}

function statusRank(status: AgreedSquadStatus): number {
  if (status === "key_player") return 5;
  if (status === "regular_starter") return 4;
  if (status === "squad_player") return 3;
  if (status === "fringe_player") return 2;
  return 1;
}
