import type { PlayerParticipationRow } from "@game/domain";

/** Broad position bucket used by the development lifecycle. */
export type BroadPositionGroup = "goalkeeper" | "defender" | "midfielder" | "attacker";

const REALISTIC_MONTHLY_MINUTES = 270;
const REGULAR_MONTHLY_MINUTES = 180;
const PERFORMANCE_MODIFIER_LIMIT = 0.15;
const NEUTRAL_RATING = 6.5;
const STRONG_RATING_DISTANCE = 1.5;

/** Input facts used to derive one monthly development multiplier. */
export interface MonthlyDevelopmentPolicyInput {
  /** Broad football bucket for the player's natural role. */
  readonly positionGroup: BroadPositionGroup;
  /** Whole-year age at the month being processed. */
  readonly age: number;
  /** Durable participation row for the month being processed. */
  readonly participation: PlayerParticipationRow;
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

function averageRating(row: PlayerParticipationRow): number | undefined {
  return row.ratingSamples === 0 ? undefined : row.ratingTotal / row.ratingSamples;
}

function roundPolicy(value: number): number {
  return Math.round(value * 100) / 100;
}
