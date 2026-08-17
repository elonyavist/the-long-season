import type { PlayerParticipationRow, PlayerPosition } from "@game/domain";

/** Broad position bucket used by the development lifecycle. */
export type BroadPositionGroup = "goalkeeper" | "defender" | "midfielder" | "attacker";

/**
 * Maps one natural football position onto its development bucket.
 *
 * The single owner of this mapping. It lives beside the age curve it feeds,
 * because a consumer that knows a player's position must never restate how the
 * curve groups it. Two byte-identical private copies existed before this, and a
 * third was about to be written the moment a report needed the group.
 */
export function broadPositionGroup(
  position: PlayerPosition | undefined,
): BroadPositionGroup {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "cb":
    case "lb":
    case "rwb":
    case "lwb":
      return "defender";
    case "dm":
    case "cm":
    case "am":
    case "rm":
    case "lm":
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}

const REALISTIC_MONTHLY_MINUTES = 270;
const REGULAR_MONTHLY_MINUTES = 180;
const PERFORMANCE_MODIFIER_LIMIT = 0.15;
const NEUTRAL_RATING = 6.5;
const STRONG_RATING_DISTANCE = 1.5;

/**
 * The only participation evidence this policy reads.
 *
 * Declared structurally rather than as the whole ledger row so a diagnostic can
 * retain these three numbers instead of a row carrying fixture-idempotency
 * bookkeeping it never uses. A `PlayerParticipationRow` satisfies it as is, and
 * widening what the policy reads becomes a typed change here that every caller
 * and every observer must answer.
 */
export interface MonthlyDevelopmentParticipationFacts {
  /** Total minutes played in the month being processed. */
  readonly minutes: PlayerParticipationRow["minutes"];
  /** Sum of structured match ratings sampled for this player. */
  readonly ratingTotal: PlayerParticipationRow["ratingTotal"];
  /** Number of match-rating samples included in `ratingTotal`. */
  readonly ratingSamples: PlayerParticipationRow["ratingSamples"];
}

/** Input facts used to derive one monthly development multiplier. */
export interface MonthlyDevelopmentPolicyInput {
  /** Broad football bucket for the player's natural role. */
  readonly positionGroup: BroadPositionGroup;
  /** Whole-year age at the month being processed. */
  readonly age: number;
  /** Participation evidence for the month being processed. */
  readonly participation: MonthlyDevelopmentParticipationFacts;
  /** Club environment weighted by the row's exact played minutes. */
  readonly positiveGrowthEnvironmentBasisPoints: number;
}

/** Deterministic multipliers applied by one monthly development pass. */
export interface MonthlyDevelopmentPolicy {
  /** Age curve before minutes and performance are considered. */
  readonly ageMultiplier: number;
  /** Minutes opportunity multiplier on a `0..1` scale. */
  readonly opportunityMultiplier: number;
  /** Match-performance modifier clamped to roughly `+/-15%`. */
  readonly performanceModifier: number;
  /** Bounded club-environment multiplier applied after performance. */
  readonly environmentMultiplier: number;
  /** Final positive-development multiplier for this player/month. */
  readonly growthMultiplier: number;
}

/** Builds the bounded monthly development policy for one player/month. */
export function monthlyDevelopmentPolicy(input: MonthlyDevelopmentPolicyInput): MonthlyDevelopmentPolicy {
  const ageMultiplier = monthlyGrowthAgeMultiplier(input.positionGroup, input.age);
  const opportunityMultiplier = monthlyOpportunityMultiplier(input.participation.minutes);
  const performanceModifier = monthlyPerformanceModifier(averageRating(input.participation));
  const environmentMultiplier = environmentMultiplierFromBasisPoints(
    input.positiveGrowthEnvironmentBasisPoints,
  );

  return {
    ageMultiplier,
    opportunityMultiplier,
    performanceModifier,
    environmentMultiplier,
    growthMultiplier:
      ageMultiplier
      * opportunityMultiplier
      * performanceModifier
      * environmentMultiplier,
  };
}

/** Converts explicit basis points into the positive-development multiplier. */
export function environmentMultiplierFromBasisPoints(basisPoints: number): number {
  if (!Number.isFinite(basisPoints) || basisPoints <= 0) {
    throw new RangeError(
      `development environment basis points must be positive and finite: ${basisPoints}`,
    );
  }

  return basisPoints / 10_000;
}

/** Converts real monthly minutes into a bounded development opportunity. */
export function monthlyOpportunityMultiplier(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 90) return 0.15;
  if (minutes < REGULAR_MONTHLY_MINUTES) return 0.45;
  if (minutes < REALISTIC_MONTHLY_MINUTES) return 0.75;
  return 1;
}

/** Converts structured ratings into a small bounded performance modifier. */
export function monthlyPerformanceModifier(rating: number | undefined): number {
  if (rating === undefined) {
    return 1;
  }

  const normalized = Math.max(-1, Math.min(1, (rating - NEUTRAL_RATING) / STRONG_RATING_DISTANCE));
  return roundPolicy(1 + normalized * PERFORMANCE_MODIFIER_LIMIT);
}

/** Age curve for positive monthly development. */
export function monthlyGrowthAgeMultiplier(group: BroadPositionGroup, age: number): number {
  if (group === "goalkeeper") {
    if (age >= 18 && age <= 21) return 0.6;
    if (age >= 22 && age <= 24) return 0.75;
    if (age >= 25 && age <= 27) return 0.45;
    if (age >= 16 && age <= 17) return 0.3;
    return 0;
  }

  if (age >= 17 && age <= 20) return 0.85;
  if (age >= 21 && age <= 23) return 0.65;
  if (age >= 24 && age <= 25) return 0.35;
  if (group === "midfielder" && age === 26) return 0.2;
  if (age === 16) return 0.25;
  return 0;
}

function averageRating(row: MonthlyDevelopmentParticipationFacts): number | undefined {
  return row.ratingSamples === 0 ? undefined : row.ratingTotal / row.ratingSamples;
}

function roundPolicy(value: number): number {
  return Math.round(value * 100) / 100;
}
