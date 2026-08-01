import {
  PLAYER_STAR_RATINGS,
  type PlayerStarRating,
} from "@game/domain";
import {
  monthlyOpportunityMultiplier,
  monthlyPerformanceModifier,
} from "@game/engine";

import type { PlayerGenerationPopulation } from "./player-generation-economy-audit.ts";
import {
  LONG_RUN_ANOMALY_KEYS,
  projectLongRunAnomalyCheckForWorldGate,
  worstLongRunAnomalyStatus,
  type LongRunAnomalyCheck,
  type LongRunAnomalyStatus,
  type ProjectedLongRunAnomalyCheck,
} from "./long-run/anomaly-scoring.ts";

/** Stable contract version of the compact Phase 80A development diagnostic. */
export const PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION =
  "player-development-cohort-750x3-v1" as const;

/** Opening-age cohorts retained by the bounded three-season diagnostic. */
export const PLAYER_DEVELOPMENT_AGE_BANDS = [
  "15_17",
  "18_20",
  "21_23",
] as const;

/** Stable active-population order used in checkpoints and reports. */
export const PLAYER_DEVELOPMENT_POPULATIONS = [
  "senior",
  "academy",
  "promotion_candidate",
  "free_agent",
  "loaned",
] as const satisfies readonly PlayerGenerationPopulation[];

/** Canonical development-opportunity labels derived from engine policy. */
export const PLAYER_DEVELOPMENT_OPPORTUNITY_BANDS = [
  "zero",
  "cameo",
  "rotation",
  "regular",
  "full",
] as const;

/** Performance labels preserve unobserved and both saturation endpoints. */
export const PLAYER_DEVELOPMENT_PERFORMANCE_BANDS = [
  "unobserved",
  "negative_saturated",
  "negative",
  "neutral",
  "positive",
  "positive_saturated",
] as const;

/** Environment evidence is separated from a missing source. */
export const PLAYER_DEVELOPMENT_ENVIRONMENT_EFFECTS = [
  "unobserved",
  "negative",
  "neutral",
  "positive",
] as const;

/** Fixed pre-run buckets for exact ability gaps. */
export const PLAYER_DEVELOPMENT_ABILITY_GAP_BUCKETS = [
  "non_positive",
  "up_to_0_25",
  "up_to_0_5",
  "up_to_1",
  "up_to_2",
  "up_to_4",
  "above_4",
] as const;

/** Fixed pre-run buckets for the share of opening room realized. */
export const PLAYER_DEVELOPMENT_ROOM_REALIZATION_BUCKETS = [
  "non_positive_growth",
  "up_to_0_25",
  "up_to_0_5",
  "up_to_0_75",
  "up_to_1",
  "above_1",
] as const;

/** Every possible half-star delta on the closed public 1..6 scale. */
export const PLAYER_DEVELOPMENT_STAR_DELTAS = [
  -5, -4.5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5,
  0,
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
] as const;

/** Stable ordered structural/non-vacuity keys serialized in every shard. */
export const PLAYER_DEVELOPMENT_COHORT_GATE_KEYS = [
  "opening_checkpoint",
  "closing_checkpoint",
  "three_completed_rollovers",
  "opening_age_15_17",
  "closing_age_15_17",
  "matched_trajectory_15_17",
  "trajectory_partition_15_17",
  "opening_age_18_20",
  "closing_age_18_20",
  "matched_trajectory_18_20",
  "trajectory_partition_18_20",
  "opening_age_21_23",
  "closing_age_21_23",
  "matched_trajectory_21_23",
  "trajectory_partition_21_23",
  "unique_checkpoint_and_participation_identity",
  "exact_projection_order",
  "rating_projection_order",
  "stored_ceiling_breach",
  "generation_room",
  "public_projection_room",
  "star_quantization",
  "young_stored_ceiling_six_public_value_hard_cap",
  "positive_opportunity_evidence",
  "zero_minute_evidence",
  "observed_performance_evidence",
  "unobserved_performance_evidence",
  "environment_negative_evidence",
  "environment_neutral_evidence",
  "environment_positive_evidence",
  "visible_plateau_denominator_15_17",
  "visible_plateau_denominator_18_20",
] as const;

/** Frozen minor-unit buckets for rare young-prospect valuation evidence. */
export const PLAYER_DEVELOPMENT_MONEY_BUCKETS = [
  "up_to_eur_500k",
  "up_to_eur_1m",
  "up_to_eur_2_5m",
  "up_to_eur_5m",
  "up_to_eur_10m",
  "up_to_eur_25m",
  "up_to_eur_50m",
  "up_to_eur_100m",
  "up_to_eur_150m",
  "above_eur_150m",
] as const;

/** Exact inclusive upper bounds behind the named minor-unit buckets. */
export const PLAYER_DEVELOPMENT_MONEY_BUCKET_UPPER_BOUNDS_MINOR_UNITS = {
  up_to_eur_500k: 50_000_000,
  up_to_eur_1m: 100_000_000,
  up_to_eur_2_5m: 250_000_000,
  up_to_eur_5m: 500_000_000,
  up_to_eur_10m: 1_000_000_000,
  up_to_eur_25m: 2_500_000_000,
  up_to_eur_50m: 5_000_000_000,
  up_to_eur_100m: 10_000_000_000,
  up_to_eur_150m: 15_000_000_000,
  above_eur_150m: null,
} as const satisfies Readonly<Record<PlayerDevelopmentMoneyBucket, number | null>>;

/** Age cohort fixed by the player's opening checkpoint age. */
export type PlayerDevelopmentAgeBand =
  (typeof PLAYER_DEVELOPMENT_AGE_BANDS)[number];

/** Canonical opportunity label for one monthly evidence row. */
export type PlayerDevelopmentOpportunityBand =
  (typeof PLAYER_DEVELOPMENT_OPPORTUNITY_BANDS)[number];

/** Canonical performance label for one monthly evidence row. */
export type PlayerDevelopmentPerformanceBand =
  (typeof PLAYER_DEVELOPMENT_PERFORMANCE_BANDS)[number];

/** Sign of the exact minute-weighted environment evidence. */
export type PlayerDevelopmentEnvironmentEffect =
  (typeof PLAYER_DEVELOPMENT_ENVIRONMENT_EFFECTS)[number];

/** Fixed exact-ability-gap bucket. */
export type PlayerDevelopmentAbilityGapBucket =
  (typeof PLAYER_DEVELOPMENT_ABILITY_GAP_BUCKETS)[number];

/** Fixed opening-room-realization bucket. */
export type PlayerDevelopmentRoomRealizationBucket =
  (typeof PLAYER_DEVELOPMENT_ROOM_REALIZATION_BUCKETS)[number];

/** Exact half-star delta supported by the closed rating scale. */
export type PlayerDevelopmentStarDelta =
  (typeof PLAYER_DEVELOPMENT_STAR_DELTAS)[number];

/** Fixed public-value/asking bucket expressed in integer minor units. */
export type PlayerDevelopmentMoneyBucket =
  (typeof PLAYER_DEVELOPMENT_MONEY_BUCKETS)[number];

/** A compact count for every supported active-player population. */
export type PlayerDevelopmentPopulationCounts = Readonly<
  Record<PlayerGenerationPopulation, number>
>;

/** A compact count for every supported public half-star value. */
export type PlayerDevelopmentRatingHistogram = Readonly<
  Record<PlayerStarRating, number>
>;

/** A compact count for every possible half-star delta. */
export type PlayerDevelopmentStarDeltaHistogram = Readonly<
  Record<PlayerDevelopmentStarDelta, number>
>;

/** Mergeable exact-number summary that never stores raw player rows. */
export interface PlayerDevelopmentNumericSummary {
  readonly observationCount: number;
  readonly sum: number;
  readonly minimum: number | null;
  readonly maximum: number | null;
}

/** Mergeable exact-gap summary plus fixed pre-run buckets. */
export interface PlayerDevelopmentExactGapSummary
  extends PlayerDevelopmentNumericSummary {
  readonly buckets: Readonly<Record<PlayerDevelopmentAbilityGapBucket, number>>;
}

/** Four distinct current/projection/ceiling facts at one checkpoint. */
export interface PlayerDevelopmentProjectionFacts {
  readonly currentAbility: number;
  readonly publicP50Ability: number;
  readonly publicUpperAbility: number;
  readonly storedCeilingAbility: number;
  readonly currentRating: PlayerStarRating;
  readonly publicP50Rating: PlayerStarRating;
  readonly publicUpperRating: PlayerStarRating;
  readonly storedCeilingRating: PlayerStarRating;
}

/** One active-player fact supplied at the opening or closing checkpoint. */
export interface PlayerDevelopmentCheckpointObservation
  extends PlayerDevelopmentProjectionFacts {
  readonly observationId: string;
  readonly playerId: string;
  readonly age: number;
  readonly population: PlayerGenerationPopulation;
  /** Canonical observer-independent public value in integer minor units. */
  readonly publicValueMinorUnits: number;
  /** Seller asking fee when one exists; unattached/non-actionable stock is null. */
  readonly askingFeeMinorUnits: number | null;
}

/** Compact rare-prospect valuation evidence for one age/current-rating slice. */
export interface PlayerDevelopmentYoungCeilingSixValueSlice {
  readonly ageBand: "15_17" | "18_20";
  readonly currentRating: PlayerStarRating;
  /** Publicly visible upside kept separate from the hidden stock criterion. */
  readonly publicUpperRating: PlayerStarRating;
  readonly observationCount: number;
  readonly publicValue: PlayerDevelopmentNumericSummary;
  readonly publicValueBuckets: Readonly<Record<PlayerDevelopmentMoneyBucket, number>>;
  readonly askingFee: PlayerDevelopmentNumericSummary;
  readonly askingFeeBuckets: Readonly<Record<PlayerDevelopmentMoneyBucket, number>>;
  readonly publicValueHardCapBreachCount: number;
}

/**
 * One canonical monthly participation fact captured before season reset.
 *
 * A zero-minute row has no environment evidence. Positive minutes require the
 * exact engine-derived, minute-weighted basis-point multiplier.
 */
export interface PlayerDevelopmentParticipationObservation {
  readonly observationId: string;
  readonly playerId: string;
  readonly seasonIndex: number;
  readonly monthKey: string;
  readonly minutes: number;
  readonly ratingTotal: number;
  readonly ratingSamples: number;
  readonly positiveGrowthEnvironmentBasisPoints: number | null;
}

/** Four half-star lanes and their distinct exact room diagnoses. */
export interface PlayerDevelopmentCheckpointAgeBandSummary {
  readonly ageBand: PlayerDevelopmentAgeBand;
  readonly observationCount: number;
  readonly populationCounts: PlayerDevelopmentPopulationCounts;
  readonly currentRatingHistogram: PlayerDevelopmentRatingHistogram;
  readonly publicP50RatingHistogram: PlayerDevelopmentRatingHistogram;
  readonly publicUpperRatingHistogram: PlayerDevelopmentRatingHistogram;
  readonly storedCeilingRatingHistogram: PlayerDevelopmentRatingHistogram;
  readonly publicP50FromCurrent: PlayerDevelopmentExactGapSummary;
  readonly publicUpperFromCurrent: PlayerDevelopmentExactGapSummary;
  readonly storedCeilingFromUpper: PlayerDevelopmentExactGapSummary;
  readonly storedCeilingFromCurrent: PlayerDevelopmentExactGapSummary;
  readonly publicP50FromCurrentRatingHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly publicUpperFromCurrentRatingHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly storedCeilingFromUpperRatingHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly storedCeilingFromCurrentRatingHistogram: PlayerDevelopmentStarDeltaHistogram;
  /** Positive exact public room hidden by the same displayed current/upper bucket. */
  readonly quantizedPublicRoomCount: number;
}

/** Compact cross-section at one exact world checkpoint. */
export interface PlayerDevelopmentCheckpointSummary {
  readonly checkpoint: "opening" | "closing";
  readonly observationCount: number;
  readonly populationCounts: PlayerDevelopmentPopulationCounts;
  readonly outsideTargetAgeBandCount: number;
  readonly ageBands: readonly PlayerDevelopmentCheckpointAgeBandSummary[];
  /** Ages 15..20 with a hidden six-star ceiling, never raw player rows. */
  readonly youngStoredCeilingSixValueSlices:
    readonly PlayerDevelopmentYoungCeilingSixValueSlice[];
}

/** Descriptive plateau numerators and denominators; none is a pass band. */
export interface PlayerDevelopmentPlateauSummary {
  readonly genuineUpsideDenominator: number;
  readonly visibleEarlyPlateauCount: number;
  readonly genuineUpsideExactNonGrowthCount: number;
  readonly belowOneStarRoomDenominator: number;
  readonly belowOneStarVisiblePlateauCount: number;
  readonly belowOneStarExactNonGrowthCount: number;
}

/** Three-season matched-trajectory evidence fixed by opening age. */
export interface PlayerDevelopmentTrajectoryAgeBandSummary {
  readonly ageBand: PlayerDevelopmentAgeBand;
  readonly openingCount: number;
  readonly matchedClosingCount: number;
  readonly attritionCount: number;
  readonly openingPopulationCounts: PlayerDevelopmentPopulationCounts;
  readonly currentAbilityDelta: PlayerDevelopmentNumericSummary;
  readonly currentRatingDeltaHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly publicP50RatingDeltaHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly publicUpperRatingDeltaHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly storedCeilingRatingDeltaHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly openingStoredRoom: PlayerDevelopmentExactGapSummary;
  readonly openingStoredRoomRatingHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly roomRealization: PlayerDevelopmentNumericSummary;
  readonly roomRealizationBuckets: Readonly<
    Record<PlayerDevelopmentRoomRealizationBucket, number>
  >;
  readonly totalMinutes: number;
  readonly ratingTotal: number;
  readonly ratingSamples: number;
  readonly environmentSourceMinutes: number;
  readonly weightedEnvironmentBasisPointMinutes: number;
  readonly plateau: PlayerDevelopmentPlateauSummary;
}

/** One associative natural-world conditioning cell. */
export interface PlayerDevelopmentGrowthCell {
  readonly ageBand: PlayerDevelopmentAgeBand;
  readonly opportunity: PlayerDevelopmentOpportunityBand;
  readonly performance: PlayerDevelopmentPerformanceBand;
  readonly environmentEffect: PlayerDevelopmentEnvironmentEffect;
  /** A player may appear in multiple cells; totals across cells are non-additive. */
  readonly associationKind: "overlapping_ever_exposed";
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly observationCount: number;
  readonly playerCount: number;
  readonly minutes: number;
  readonly ratingSamples: number;
  readonly currentAbilityGrowth: PlayerDevelopmentNumericSummary;
  readonly currentRatingDeltaHistogram: PlayerDevelopmentStarDeltaHistogram;
  readonly visibleEarlyPlateauCount: number;
  readonly visibleEarlyPlateauDenominator: number;
  readonly exactNonGrowthCount: number;
  readonly exactNonGrowthDenominator: number;
}

/** Closing players absent from the opening trajectory denominator. */
export interface PlayerDevelopmentNewEntrantSummary {
  readonly totalCount: number;
  readonly outsideTargetAgeBandCount: number;
  readonly ageBandPopulationCounts: readonly Readonly<{
    ageBand: PlayerDevelopmentAgeBand;
    populationCounts: PlayerDevelopmentPopulationCounts;
  }>[];
}

/** Stable non-vacuous gate result; zero observations never produce `pass`. */
export interface PlayerDevelopmentCohortGate {
  readonly key: string;
  readonly observationCount: number;
  readonly violationCount: number;
  /** Worlds where positive evidence existed and at least one invariant failed. */
  readonly failedWorldCount: number;
  /** Worlds where the gate had no denominator and therefore could not pass. */
  readonly notEvaluatedWorldCount: number;
  readonly status: "pass" | "fail" | "not_evaluated";
}

/** Bounded trace retained only for a structural invariant breach. */
export interface PlayerDevelopmentStructuralViolationExample {
  readonly worldId: string;
  readonly checkpoint: "opening" | "closing" | "trajectory" | "participation";
  readonly playerId: string;
  readonly kind:
    | "duplicate_identity"
    | "duplicate_observation_id"
    | "exact_projection_order"
    | "rating_projection_order"
    | "stored_ceiling_breach";
}

/** Complete compact one-world payload suitable for an atomic shard. */
export interface PlayerDevelopmentCohortWorldSummary {
  readonly contractVersion: typeof PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION;
  readonly worldId: string;
  readonly completedRolloverCount: number;
  readonly openingCheckpoint: PlayerDevelopmentCheckpointSummary;
  readonly closingCheckpoint: PlayerDevelopmentCheckpointSummary;
  readonly trajectories: readonly PlayerDevelopmentTrajectoryAgeBandSummary[];
  readonly newEntrants: PlayerDevelopmentNewEntrantSummary;
  readonly growthCells: readonly PlayerDevelopmentGrowthCell[];
  readonly gates: readonly PlayerDevelopmentCohortGate[];
  readonly structuralViolationExamples:
    readonly PlayerDevelopmentStructuralViolationExample[];
  /** Raw result, semantic class, and separate world-gate projection. */
  readonly anomalyChecks: readonly ProjectedLongRunAnomalyCheck[];
  readonly rawAnomalyStatus: LongRunAnomalyStatus;
  readonly worldGateAnomalyStatus: LongRunAnomalyStatus;
}

/** Raw facts required to build one compact world summary. */
export interface CreatePlayerDevelopmentCohortWorldSummaryInput {
  readonly worldId: string;
  readonly completedRolloverCount: number;
  readonly opening: readonly PlayerDevelopmentCheckpointObservation[];
  readonly closing: readonly PlayerDevelopmentCheckpointObservation[];
  readonly participation: readonly PlayerDevelopmentParticipationObservation[];
  readonly anomalyChecks: readonly LongRunAnomalyCheck[];
}

/** Cohort aggregate produced without retaining raw player observations. */
export interface PlayerDevelopmentCohortAggregateSummary {
  readonly contractVersion: typeof PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION;
  readonly worldCount: number;
  readonly completedRolloverCount: PlayerDevelopmentNumericSummary;
  readonly openingCheckpoint: PlayerDevelopmentCheckpointSummary;
  readonly closingCheckpoint: PlayerDevelopmentCheckpointSummary;
  readonly trajectories: readonly PlayerDevelopmentTrajectoryAgeBandSummary[];
  readonly newEntrants: PlayerDevelopmentNewEntrantSummary;
  readonly growthCells: readonly PlayerDevelopmentGrowthCell[];
  readonly gates: readonly PlayerDevelopmentCohortGate[];
  readonly structuralViolationExamples:
    readonly PlayerDevelopmentStructuralViolationExample[];
  readonly rawAnomalyStatusCounts: Readonly<Record<LongRunAnomalyStatus, number>>;
  readonly worldGateAnomalyStatusCounts: Readonly<Record<LongRunAnomalyStatus, number>>;
}

const MAXIMUM_STRUCTURAL_EXAMPLES = 8;
const NEUTRAL_ENVIRONMENT_BASIS_POINTS = 10_000;
const PUBLIC_VALUE_HARD_CAP_MINOR_UNITS = 15_000_000_000;
const YOUNG_VALUE_AGE_BANDS = ["15_17", "18_20"] as const;

/**
 * Builds one compact player-development world summary from canonical facts.
 *
 * Raw checkpoint players and monthly rows are consumed only while this pure
 * function runs. The returned value contains mergeable counters, histograms,
 * and bounded structural examples, never a player-history ledger.
 */
export function createPlayerDevelopmentCohortWorldSummary(
  input: CreatePlayerDevelopmentCohortWorldSummaryInput,
): PlayerDevelopmentCohortWorldSummary {
  validateWorldIdentity(input.worldId, input.completedRolloverCount);
  const structuralViolationExamples: PlayerDevelopmentStructuralViolationExample[] = [];
  const opening = normalizeCheckpointObservations(
    input.worldId,
    "opening",
    input.opening,
    structuralViolationExamples,
  );
  const closing = normalizeCheckpointObservations(
    input.worldId,
    "closing",
    input.closing,
    structuralViolationExamples,
  );
  const participation = normalizeParticipationObservations(
    input.worldId,
    input.completedRolloverCount,
    input.participation,
    structuralViolationExamples,
  );
  const openingByPlayerId = new Map(opening.map((row) => [row.playerId, row]));
  const closingByPlayerId = new Map(closing.map((row) => [row.playerId, row]));
  const participationByPlayerId = groupParticipationByPlayer(participation);
  const trajectories = summarizeTrajectories(
    opening,
    closingByPlayerId,
    participationByPlayerId,
  );
  const growthCells = summarizeGrowthCells(
    openingByPlayerId,
    closingByPlayerId,
    participationByPlayerId,
  );
  const openingCheckpoint = summarizeCheckpoint("opening", opening);
  const closingCheckpoint = summarizeCheckpoint("closing", closing);
  const newEntrants = summarizeNewEntrants(openingByPlayerId, closing);
  const gates = createCohortGates({
    completedRolloverCount: input.completedRolloverCount,
    rawOpening: input.opening,
    rawClosing: input.closing,
    rawParticipation: input.participation,
    opening,
    closing,
    trajectories,
    participation,
    growthCells,
  });
  const anomalyChecks = input.anomalyChecks.map(
    projectLongRunAnomalyCheckForWorldGate,
  );

  const summary: PlayerDevelopmentCohortWorldSummary = {
    contractVersion: PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
    worldId: input.worldId,
    completedRolloverCount: input.completedRolloverCount,
    openingCheckpoint,
    closingCheckpoint,
    trajectories,
    newEntrants,
    growthCells,
    gates,
    structuralViolationExamples,
    anomalyChecks,
    rawAnomalyStatus: worstLongRunAnomalyStatus(
      anomalyChecks.map(({ status }) => status),
    ),
    worldGateAnomalyStatus: worstLongRunAnomalyStatus(
      anomalyChecks.map(({ worldGateStatus }) => worldGateStatus),
    ),
  };
  validatePlayerDevelopmentCohortWorldSummary(summary);
  return summary;
}

/**
 * Validates compact shard shape and stable ordering without raw source facts.
 *
 * Checkpoint loaders should call this after their own hash and metadata checks;
 * a malformed summary is incompatible evidence, never a partially usable row.
 */
export function validatePlayerDevelopmentCohortWorldSummary(
  summary: PlayerDevelopmentCohortWorldSummary,
): void {
  assertExactObjectKeys(summary, [
    "contractVersion",
    "worldId",
    "completedRolloverCount",
    "openingCheckpoint",
    "closingCheckpoint",
    "trajectories",
    "newEntrants",
    "growthCells",
    "gates",
    "structuralViolationExamples",
    "anomalyChecks",
    "rawAnomalyStatus",
    "worldGateAnomalyStatus",
  ], "player-development world summary");
  if (summary.contractVersion !== PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION) {
    throw new Error(`Unsupported player-development cohort contract: ${String(summary.contractVersion)}`);
  }
  validateWorldIdentity(summary.worldId, summary.completedRolloverCount);
  if (summary.completedRolloverCount !== 3) {
    throw new Error("The player-development cohort requires exactly three rollovers");
  }
  if (summary.openingCheckpoint.checkpoint !== "opening") {
    throw new Error("Player-development cohort opening checkpoint is missing");
  }
  if (summary.closingCheckpoint.checkpoint !== "closing") {
    throw new Error("Player-development cohort closing checkpoint is missing");
  }
  assertOrderedAgeBands(summary.openingCheckpoint.ageBands);
  assertOrderedAgeBands(summary.closingCheckpoint.ageBands);
  assertOrderedValueSlices(summary.openingCheckpoint.youngStoredCeilingSixValueSlices);
  assertOrderedValueSlices(summary.closingCheckpoint.youngStoredCeilingSixValueSlices);
  assertOrderedTrajectories(summary.trajectories);
  assertOrderedGrowthCells(summary.growthCells);
  validateCheckpointSummary(summary.openingCheckpoint);
  validateCheckpointSummary(summary.closingCheckpoint);
  validateNewEntrantSummary(summary.newEntrants);
  validateGateSummaries(summary.gates, 1);
  validateAnomalySummaries(summary);
  for (const trajectory of summary.trajectories) {
    validateTrajectorySummary(trajectory);
    if (trajectory.matchedClosingCount + trajectory.attritionCount !== trajectory.openingCount) {
      throw new Error(`Player-development trajectory partition is invalid: ${trajectory.ageBand}`);
    }
  }
  for (const cell of summary.growthCells) validateGrowthCell(cell);
  if (summary.structuralViolationExamples.length > MAXIMUM_STRUCTURAL_EXAMPLES) {
    throw new Error("Player-development cohort retained too many structural examples");
  }
  validateStructuralExamples(summary);
}

/** Validates one compact aggregate before or after an associative merge. */
export function validatePlayerDevelopmentCohortAggregateSummary(
  summary: PlayerDevelopmentCohortAggregateSummary,
): void {
  assertExactObjectKeys(summary, [
    "contractVersion",
    "worldCount",
    "completedRolloverCount",
    "openingCheckpoint",
    "closingCheckpoint",
    "trajectories",
    "newEntrants",
    "growthCells",
    "gates",
    "structuralViolationExamples",
    "rawAnomalyStatusCounts",
    "worldGateAnomalyStatusCounts",
  ], "player-development aggregate summary");
  if (summary.contractVersion !== PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION) {
    throw new Error(`Unsupported player-development cohort contract: ${String(summary.contractVersion)}`);
  }
  assertCount(summary.worldCount, "aggregate worlds");
  if (summary.worldCount === 0) {
    throw new Error("Player-development aggregate requires at least one world");
  }
  validateNumericSummary(summary.completedRolloverCount, "completed rollovers");
  if (
    summary.completedRolloverCount.observationCount !== summary.worldCount
    || summary.completedRolloverCount.minimum !== 3
    || summary.completedRolloverCount.maximum !== 3
    || summary.completedRolloverCount.sum !== summary.worldCount * 3
  ) {
    throw new Error("Player-development aggregate rollover evidence is inconsistent");
  }
  if (
    summary.openingCheckpoint.checkpoint !== "opening"
    || summary.closingCheckpoint.checkpoint !== "closing"
  ) {
    throw new Error("Player-development aggregate checkpoints are inconsistent");
  }
  assertOrderedAgeBands(summary.openingCheckpoint.ageBands);
  assertOrderedAgeBands(summary.closingCheckpoint.ageBands);
  assertOrderedValueSlices(summary.openingCheckpoint.youngStoredCeilingSixValueSlices);
  assertOrderedValueSlices(summary.closingCheckpoint.youngStoredCeilingSixValueSlices);
  assertOrderedTrajectories(summary.trajectories);
  assertOrderedGrowthCells(summary.growthCells);
  validateCheckpointSummary(summary.openingCheckpoint);
  validateCheckpointSummary(summary.closingCheckpoint);
  for (const trajectory of summary.trajectories) {
    validateTrajectorySummary(trajectory);
    if (trajectory.matchedClosingCount + trajectory.attritionCount !== trajectory.openingCount) {
      throw new Error(`Player-development trajectory partition is invalid: ${trajectory.ageBand}`);
    }
  }
  validateNewEntrantSummary(summary.newEntrants);
  for (const cell of summary.growthCells) validateGrowthCell(cell);
  validateGateSummaries(summary.gates, summary.worldCount);
  if (summary.structuralViolationExamples.length > MAXIMUM_STRUCTURAL_EXAMPLES) {
    throw new Error("Player-development aggregate retained too many structural examples");
  }
  validateStructuralExampleRows(summary.structuralViolationExamples);
  validateCountRecord(
    ["pass", "warn", "fail"] as const,
    summary.rawAnomalyStatusCounts,
    summary.worldCount,
    "raw anomaly statuses",
  );
  validateCountRecord(
    ["pass", "warn", "fail"] as const,
    summary.worldGateAnomalyStatusCounts,
    summary.worldCount,
    "world-gate anomaly statuses",
  );
}

function normalizeCheckpointObservations(
  worldId: string,
  checkpoint: "opening" | "closing",
  observations: readonly PlayerDevelopmentCheckpointObservation[],
  examples: PlayerDevelopmentStructuralViolationExample[],
): readonly PlayerDevelopmentCheckpointObservation[] {
  const seenPlayerIds = new Set<string>();
  const seenObservationIds = new Set<string>();
  const unique: PlayerDevelopmentCheckpointObservation[] = [];

  for (const observation of observations) {
    validateCheckpointObservation(observation);
    if (seenObservationIds.has(observation.observationId)) {
      addStructuralExample(examples, {
        worldId,
        checkpoint,
        playerId: observation.playerId,
        kind: "duplicate_observation_id",
      });
    } else {
      seenObservationIds.add(observation.observationId);
    }
    if (seenPlayerIds.has(observation.playerId)) {
      addStructuralExample(examples, {
        worldId,
        checkpoint,
        playerId: observation.playerId,
        kind: "duplicate_identity",
      });
      continue;
    }
    seenPlayerIds.add(observation.playerId);
    unique.push(observation);

    if (!isExactProjectionOrdered(observation)) {
      addStructuralExample(examples, {
        worldId,
        checkpoint,
        playerId: observation.playerId,
        kind: "exact_projection_order",
      });
    }
    if (!isRatingProjectionOrdered(observation)) {
      addStructuralExample(examples, {
        worldId,
        checkpoint,
        playerId: observation.playerId,
        kind: "rating_projection_order",
      });
    }
    if (observation.currentAbility > observation.storedCeilingAbility) {
      addStructuralExample(examples, {
        worldId,
        checkpoint,
        playerId: observation.playerId,
        kind: "stored_ceiling_breach",
      });
    }
  }

  return unique.sort((left, right) =>
    left.playerId.localeCompare(right.playerId)
      || left.observationId.localeCompare(right.observationId),
  );
}

function normalizeParticipationObservations(
  worldId: string,
  completedRolloverCount: number,
  observations: readonly PlayerDevelopmentParticipationObservation[],
  examples: PlayerDevelopmentStructuralViolationExample[],
): readonly PlayerDevelopmentParticipationObservation[] {
  const seenObservationIds = new Set<string>();
  const unique: PlayerDevelopmentParticipationObservation[] = [];
  for (const observation of observations) {
    validateParticipationObservation(observation, completedRolloverCount);
    if (seenObservationIds.has(observation.observationId)) {
      addStructuralExample(examples, {
        worldId,
        checkpoint: "participation",
        playerId: observation.playerId,
        kind: "duplicate_observation_id",
      });
      continue;
    }
    seenObservationIds.add(observation.observationId);
    unique.push(observation);
  }
  return unique.sort((left, right) =>
    left.seasonIndex - right.seasonIndex
      || left.monthKey.localeCompare(right.monthKey)
      || left.playerId.localeCompare(right.playerId)
      || left.observationId.localeCompare(right.observationId),
  );
}

function validateCheckpointObservation(
  observation: PlayerDevelopmentCheckpointObservation,
): void {
  if (observation.observationId.length === 0 || observation.playerId.length === 0) {
    throw new Error("Player-development checkpoint identity must not be empty");
  }
  if (!Number.isSafeInteger(observation.age) || observation.age < 0) {
    throw new Error(`Invalid player-development checkpoint age: ${observation.age}`);
  }
  for (const value of [
    observation.currentAbility,
    observation.publicP50Ability,
    observation.publicUpperAbility,
    observation.storedCeilingAbility,
  ]) {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid player-development ability: ${value}`);
    }
  }
  if (
    !Number.isSafeInteger(observation.publicValueMinorUnits)
    || observation.publicValueMinorUnits < 0
  ) {
    throw new Error(`Invalid player-development public value: ${observation.publicValueMinorUnits}`);
  }
  if (
    observation.askingFeeMinorUnits !== null
    && (
      !Number.isSafeInteger(observation.askingFeeMinorUnits)
      || observation.askingFeeMinorUnits < 0
    )
  ) {
    throw new Error(`Invalid player-development asking fee: ${String(observation.askingFeeMinorUnits)}`);
  }
}

function validateParticipationObservation(
  observation: PlayerDevelopmentParticipationObservation,
  completedRolloverCount: number,
): void {
  if (observation.observationId.length === 0 || observation.playerId.length === 0) {
    throw new Error("Player-development participation identity must not be empty");
  }
  if (
    !Number.isSafeInteger(observation.seasonIndex)
    || observation.seasonIndex < 1
    || observation.seasonIndex > completedRolloverCount
  ) {
    throw new Error(`Invalid player-development participation season: ${observation.seasonIndex}`);
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(observation.monthKey)) {
    throw new Error(`Invalid player-development participation month: ${observation.monthKey}`);
  }
  if (!Number.isSafeInteger(observation.minutes) || observation.minutes < 0) {
    throw new Error(`Invalid player-development participation minutes: ${observation.minutes}`);
  }
  if (!Number.isSafeInteger(observation.ratingSamples) || observation.ratingSamples < 0) {
    throw new Error(`Invalid player-development rating sample count: ${observation.ratingSamples}`);
  }
  if (!Number.isFinite(observation.ratingTotal) || observation.ratingTotal < 0) {
    throw new Error(`Invalid player-development rating total: ${observation.ratingTotal}`);
  }
  if (observation.ratingSamples === 0 && observation.ratingTotal !== 0) {
    throw new Error("Unobserved player-development performance must have zero rating total");
  }
  if (
    observation.minutes > 0
    && (
      observation.positiveGrowthEnvironmentBasisPoints === null
      || !Number.isFinite(observation.positiveGrowthEnvironmentBasisPoints)
      || observation.positiveGrowthEnvironmentBasisPoints <= 0
    )
  ) {
    throw new Error("Positive participation requires exact environment evidence");
  }
  if (
    observation.minutes === 0
    && observation.positiveGrowthEnvironmentBasisPoints !== null
  ) {
    throw new Error("Zero-minute participation must keep environment unobserved");
  }
}

function summarizeCheckpoint(
  checkpoint: "opening" | "closing",
  observations: readonly PlayerDevelopmentCheckpointObservation[],
): PlayerDevelopmentCheckpointSummary {
  return {
    checkpoint,
    observationCount: observations.length,
    populationCounts: countPopulations(observations),
    outsideTargetAgeBandCount: observations.filter(
      ({ age }) => ageBandFor(age) === undefined,
    ).length,
    ageBands: PLAYER_DEVELOPMENT_AGE_BANDS.map((ageBand) =>
      summarizeCheckpointAgeBand(
        ageBand,
        observations.filter(({ age }) => ageBandFor(age) === ageBand),
      ),
    ),
    youngStoredCeilingSixValueSlices:
      summarizeYoungStoredCeilingSixValueSlices(observations),
  };
}

function summarizeYoungStoredCeilingSixValueSlices(
  observations: readonly PlayerDevelopmentCheckpointObservation[],
): readonly PlayerDevelopmentYoungCeilingSixValueSlice[] {
  const slices: PlayerDevelopmentYoungCeilingSixValueSlice[] = [];
  for (const ageBand of YOUNG_VALUE_AGE_BANDS) {
    for (const currentRating of PLAYER_STAR_RATINGS) {
      for (const publicUpperRating of PLAYER_STAR_RATINGS) {
        const rows = observations.filter(
          (row) =>
            ageBandFor(row.age) === ageBand
            && row.currentRating === currentRating
            && row.publicUpperRating === publicUpperRating
            && row.storedCeilingRating === 6,
        );
        const publicValues = rows.map(({ publicValueMinorUnits }) => publicValueMinorUnits);
        const askingFees = rows.flatMap(({ askingFeeMinorUnits }) =>
          askingFeeMinorUnits === null ? [] : [askingFeeMinorUnits],
        );
        if (rows.length === 0) continue;
        slices.push({
          ageBand,
          currentRating,
          publicUpperRating,
          observationCount: rows.length,
          publicValue: numericSummary(publicValues),
          publicValueBuckets: countByKeys(
            PLAYER_DEVELOPMENT_MONEY_BUCKETS,
            publicValues.map(moneyBucket),
          ),
          askingFee: numericSummary(askingFees),
          askingFeeBuckets: countByKeys(
            PLAYER_DEVELOPMENT_MONEY_BUCKETS,
            askingFees.map(moneyBucket),
          ),
          publicValueHardCapBreachCount: publicValues.filter(
            (value) => value > PUBLIC_VALUE_HARD_CAP_MINOR_UNITS,
          ).length,
        });
      }
    }
  }
  return slices;
}

function summarizeCheckpointAgeBand(
  ageBand: PlayerDevelopmentAgeBand,
  observations: readonly PlayerDevelopmentCheckpointObservation[],
): PlayerDevelopmentCheckpointAgeBandSummary {
  const p50Current = observations.map(
    (row) => row.publicP50Ability - row.currentAbility,
  );
  const upperCurrent = observations.map(
    (row) => row.publicUpperAbility - row.currentAbility,
  );
  const storedUpper = observations.map(
    (row) => row.storedCeilingAbility - row.publicUpperAbility,
  );
  const storedCurrent = observations.map(
    (row) => row.storedCeilingAbility - row.currentAbility,
  );

  return {
    ageBand,
    observationCount: observations.length,
    populationCounts: countPopulations(observations),
    currentRatingHistogram: ratingHistogram(
      observations.map(({ currentRating }) => currentRating),
    ),
    publicP50RatingHistogram: ratingHistogram(
      observations.map(({ publicP50Rating }) => publicP50Rating),
    ),
    publicUpperRatingHistogram: ratingHistogram(
      observations.map(({ publicUpperRating }) => publicUpperRating),
    ),
    storedCeilingRatingHistogram: ratingHistogram(
      observations.map(({ storedCeilingRating }) => storedCeilingRating),
    ),
    publicP50FromCurrent: exactGapSummary(p50Current),
    publicUpperFromCurrent: exactGapSummary(upperCurrent),
    storedCeilingFromUpper: exactGapSummary(storedUpper),
    storedCeilingFromCurrent: exactGapSummary(storedCurrent),
    publicP50FromCurrentRatingHistogram: starDeltaHistogram(
      observations.map((row) => row.publicP50Rating - row.currentRating),
    ),
    publicUpperFromCurrentRatingHistogram: starDeltaHistogram(
      observations.map((row) => row.publicUpperRating - row.currentRating),
    ),
    storedCeilingFromUpperRatingHistogram: starDeltaHistogram(
      observations.map((row) => row.storedCeilingRating - row.publicUpperRating),
    ),
    storedCeilingFromCurrentRatingHistogram: starDeltaHistogram(
      observations.map((row) => row.storedCeilingRating - row.currentRating),
    ),
    quantizedPublicRoomCount: observations.filter(
      (row) =>
        row.publicUpperAbility > row.currentAbility
        && row.publicUpperRating === row.currentRating,
    ).length,
  };
}

function summarizeTrajectories(
  opening: readonly PlayerDevelopmentCheckpointObservation[],
  closingByPlayerId: ReadonlyMap<string, PlayerDevelopmentCheckpointObservation>,
  participationByPlayerId: ReadonlyMap<
    string,
    readonly PlayerDevelopmentParticipationObservation[]
  >,
): readonly PlayerDevelopmentTrajectoryAgeBandSummary[] {
  return PLAYER_DEVELOPMENT_AGE_BANDS.map((ageBand) => {
    const openingRows = opening.filter(({ age }) => ageBandFor(age) === ageBand);
    const matched = openingRows.flatMap((openingRow) => {
      const closingRow = closingByPlayerId.get(openingRow.playerId);
      return closingRow === undefined ? [] : [{ openingRow, closingRow }];
    });
    const currentAbilityDeltas = matched.map(
      ({ openingRow, closingRow }) =>
        closingRow.currentAbility - openingRow.currentAbility,
    );
    const openingRooms = matched.map(
      ({ openingRow }) =>
        openingRow.storedCeilingAbility - openingRow.currentAbility,
    );
    const roomRealizations = matched.flatMap((pair, index) => {
      const room = openingRooms[index]!;
      return room > 0 ? [currentAbilityDeltas[index]! / room] : [];
    });
    const participation = matched.flatMap(({ openingRow }) =>
      participationByPlayerId.get(openingRow.playerId) ?? [],
    );
    const plateau = summarizePlateaus(matched);

    return {
      ageBand,
      openingCount: openingRows.length,
      matchedClosingCount: matched.length,
      attritionCount: openingRows.length - matched.length,
      openingPopulationCounts: countPopulations(openingRows),
      currentAbilityDelta: numericSummary(currentAbilityDeltas),
      currentRatingDeltaHistogram: starDeltaHistogram(
        matched.map(({ openingRow, closingRow }) =>
          closingRow.currentRating - openingRow.currentRating,
        ),
      ),
      publicP50RatingDeltaHistogram: starDeltaHistogram(
        matched.map(({ openingRow, closingRow }) =>
          closingRow.publicP50Rating - openingRow.publicP50Rating,
        ),
      ),
      publicUpperRatingDeltaHistogram: starDeltaHistogram(
        matched.map(({ openingRow, closingRow }) =>
          closingRow.publicUpperRating - openingRow.publicUpperRating,
        ),
      ),
      storedCeilingRatingDeltaHistogram: starDeltaHistogram(
        matched.map(({ openingRow, closingRow }) =>
          closingRow.storedCeilingRating - openingRow.storedCeilingRating,
        ),
      ),
      openingStoredRoom: exactGapSummary(openingRooms),
      openingStoredRoomRatingHistogram: starDeltaHistogram(
        matched.map(({ openingRow }) =>
          openingRow.storedCeilingRating - openingRow.currentRating,
        ),
      ),
      roomRealization: numericSummary(roomRealizations),
      roomRealizationBuckets: countByKeys(
        PLAYER_DEVELOPMENT_ROOM_REALIZATION_BUCKETS,
        roomRealizations.map(roomRealizationBucket),
      ),
      totalMinutes: participation.reduce((sum, row) => sum + row.minutes, 0),
      ratingTotal: participation.reduce((sum, row) => sum + row.ratingTotal, 0),
      ratingSamples: participation.reduce((sum, row) => sum + row.ratingSamples, 0),
      environmentSourceMinutes: participation.reduce(
        (sum, row) => sum + (row.minutes > 0 ? row.minutes : 0),
        0,
      ),
      weightedEnvironmentBasisPointMinutes: participation.reduce(
        (sum, row) =>
          sum + row.minutes * (row.positiveGrowthEnvironmentBasisPoints ?? 0),
        0,
      ),
      plateau,
    };
  });
}

function summarizePlateaus(
  matched: readonly Readonly<{
    openingRow: PlayerDevelopmentCheckpointObservation;
    closingRow: PlayerDevelopmentCheckpointObservation;
  }>[],
): PlayerDevelopmentPlateauSummary {
  let genuineUpsideDenominator = 0;
  let visibleEarlyPlateauCount = 0;
  let genuineUpsideExactNonGrowthCount = 0;
  let belowOneStarRoomDenominator = 0;
  let belowOneStarVisiblePlateauCount = 0;
  let belowOneStarExactNonGrowthCount = 0;

  for (const { openingRow, closingRow } of matched) {
    const exactRoom = openingRow.storedCeilingAbility - openingRow.currentAbility;
    if (exactRoom <= 0) continue;
    const starRoom = openingRow.storedCeilingRating - openingRow.currentRating;
    const starGrowth = closingRow.currentRating - openingRow.currentRating;
    const exactGrowth = closingRow.currentAbility - openingRow.currentAbility;
    if (starRoom >= 1) {
      genuineUpsideDenominator += 1;
      if (openingRow.age <= 20 && starGrowth < 0.5) {
        visibleEarlyPlateauCount += 1;
      }
      if (exactGrowth <= 0) genuineUpsideExactNonGrowthCount += 1;
    } else {
      belowOneStarRoomDenominator += 1;
      if (openingRow.age <= 20 && starGrowth < 0.5) {
        belowOneStarVisiblePlateauCount += 1;
      }
      if (exactGrowth <= 0) belowOneStarExactNonGrowthCount += 1;
    }
  }
  return {
    genuineUpsideDenominator,
    visibleEarlyPlateauCount,
    genuineUpsideExactNonGrowthCount,
    belowOneStarRoomDenominator,
    belowOneStarVisiblePlateauCount,
    belowOneStarExactNonGrowthCount,
  };
}

interface MutableGrowthCell {
  observationCount: number;
  readonly playerIds: Set<string>;
  minutes: number;
  ratingSamples: number;
  readonly currentAbilityGrowth: number[];
  readonly currentRatingDeltas: number[];
  visibleEarlyPlateauCount: number;
  visibleEarlyPlateauDenominator: number;
  exactNonGrowthCount: number;
  exactNonGrowthDenominator: number;
}

function summarizeGrowthCells(
  openingByPlayerId: ReadonlyMap<string, PlayerDevelopmentCheckpointObservation>,
  closingByPlayerId: ReadonlyMap<string, PlayerDevelopmentCheckpointObservation>,
  participationByPlayerId: ReadonlyMap<
    string,
    readonly PlayerDevelopmentParticipationObservation[]
  >,
): readonly PlayerDevelopmentGrowthCell[] {
  const accumulators = new Map<string, MutableGrowthCell>();

  for (const [playerId, opening] of openingByPlayerId) {
    const ageBand = ageBandFor(opening.age);
    const closing = closingByPlayerId.get(playerId);
    if (ageBand === undefined || closing === undefined) continue;
    const rows = participationByPlayerId.get(playerId) ?? [];
    const contexts = new Map<string, {
      readonly opportunity: PlayerDevelopmentOpportunityBand;
      readonly performance: PlayerDevelopmentPerformanceBand;
      readonly environmentEffect: PlayerDevelopmentEnvironmentEffect;
      observationCount: number;
      minutes: number;
      ratingSamples: number;
    }>();

    if (rows.length === 0) {
      const emptyContext = {
        opportunity: "zero" as const,
        performance: "unobserved" as const,
        environmentEffect: "unobserved" as const,
        observationCount: 1,
        minutes: 0,
        ratingSamples: 0,
      };
      contexts.set(growthCellKey(ageBand, emptyContext), emptyContext);
    } else {
      for (const row of rows) {
        const context = {
          opportunity: opportunityBand(row.minutes),
          performance: performanceBand(row),
          environmentEffect: environmentEffect(row),
        };
        const key = growthCellKey(ageBand, context);
        const existing = contexts.get(key);
        if (existing === undefined) {
          contexts.set(key, {
            ...context,
            observationCount: 1,
            minutes: row.minutes,
            ratingSamples: row.ratingSamples,
          });
        } else {
          existing.observationCount += 1;
          existing.minutes += row.minutes;
          existing.ratingSamples += row.ratingSamples;
        }
      }
    }

    const exactGrowth = closing.currentAbility - opening.currentAbility;
    const starGrowth = closing.currentRating - opening.currentRating;
    const starRoom = opening.storedCeilingRating - opening.currentRating;
    const exactRoom = opening.storedCeilingAbility - opening.currentAbility;
    for (const context of contexts.values()) {
      const key = growthCellKey(ageBand, context);
      const accumulator = accumulators.get(key) ?? emptyMutableGrowthCell();
      accumulator.observationCount += context.observationCount;
      accumulator.playerIds.add(playerId);
      accumulator.minutes += context.minutes;
      accumulator.ratingSamples += context.ratingSamples;
      accumulator.currentAbilityGrowth.push(exactGrowth);
      accumulator.currentRatingDeltas.push(starGrowth);
      if (exactRoom > 0) {
        accumulator.exactNonGrowthDenominator += 1;
        if (exactGrowth <= 0) accumulator.exactNonGrowthCount += 1;
      }
      if (opening.age <= 20 && starRoom >= 1) {
        accumulator.visibleEarlyPlateauDenominator += 1;
        if (starGrowth < 0.5) accumulator.visibleEarlyPlateauCount += 1;
      }
      accumulators.set(key, accumulator);
    }
  }

  const cells: PlayerDevelopmentGrowthCell[] = [];
  for (const ageBand of PLAYER_DEVELOPMENT_AGE_BANDS) {
    for (const opportunity of PLAYER_DEVELOPMENT_OPPORTUNITY_BANDS) {
      for (const performance of PLAYER_DEVELOPMENT_PERFORMANCE_BANDS) {
        for (const environmentEffect of PLAYER_DEVELOPMENT_ENVIRONMENT_EFFECTS) {
          const key = growthCellKey(ageBand, {
            opportunity,
            performance,
            environmentEffect,
          });
          const accumulator = accumulators.get(key) ?? emptyMutableGrowthCell();
          cells.push({
            ageBand,
            opportunity,
            performance,
            environmentEffect,
            associationKind: "overlapping_ever_exposed",
            evaluationStatus:
              accumulator.observationCount === 0 ? "not_evaluated" : "evaluated",
            observationCount: accumulator.observationCount,
            playerCount: accumulator.playerIds.size,
            minutes: accumulator.minutes,
            ratingSamples: accumulator.ratingSamples,
            currentAbilityGrowth: numericSummary(
              accumulator.currentAbilityGrowth,
            ),
            currentRatingDeltaHistogram: starDeltaHistogram(
              accumulator.currentRatingDeltas,
            ),
            visibleEarlyPlateauCount: accumulator.visibleEarlyPlateauCount,
            visibleEarlyPlateauDenominator:
              accumulator.visibleEarlyPlateauDenominator,
            exactNonGrowthCount: accumulator.exactNonGrowthCount,
            exactNonGrowthDenominator: accumulator.exactNonGrowthDenominator,
          });
        }
      }
    }
  }
  return cells;
}

function summarizeNewEntrants(
  openingByPlayerId: ReadonlyMap<string, PlayerDevelopmentCheckpointObservation>,
  closing: readonly PlayerDevelopmentCheckpointObservation[],
): PlayerDevelopmentNewEntrantSummary {
  const entrants = closing.filter(({ playerId }) => !openingByPlayerId.has(playerId));
  return {
    totalCount: entrants.length,
    outsideTargetAgeBandCount: entrants.filter(
      ({ age }) => ageBandFor(age) === undefined,
    ).length,
    ageBandPopulationCounts: PLAYER_DEVELOPMENT_AGE_BANDS.map((ageBand) => ({
      ageBand,
      populationCounts: countPopulations(
        entrants.filter(({ age }) => ageBandFor(age) === ageBand),
      ),
    })),
  };
}

function createCohortGates(input: {
  readonly completedRolloverCount: number;
  readonly rawOpening: readonly PlayerDevelopmentCheckpointObservation[];
  readonly rawClosing: readonly PlayerDevelopmentCheckpointObservation[];
  readonly rawParticipation: readonly PlayerDevelopmentParticipationObservation[];
  readonly opening: readonly PlayerDevelopmentCheckpointObservation[];
  readonly closing: readonly PlayerDevelopmentCheckpointObservation[];
  readonly trajectories: readonly PlayerDevelopmentTrajectoryAgeBandSummary[];
  readonly participation: readonly PlayerDevelopmentParticipationObservation[];
  readonly growthCells: readonly PlayerDevelopmentGrowthCell[];
}): readonly PlayerDevelopmentCohortGate[] {
  const allCheckpointRows = [...input.opening, ...input.closing];
  const closingPlayerIds = new Set(input.closing.map(({ playerId }) => playerId));
  const participationPlayerIds = new Set(
    input.participation.map(({ playerId }) => playerId),
  );
  const missingParticipationPlayerCount = input.opening.filter(
    ({ playerId }) =>
      closingPlayerIds.has(playerId) && !participationPlayerIds.has(playerId),
  ).length;
  const rawDuplicateCount =
    duplicateValueCount(input.rawOpening.map(({ playerId }) => playerId))
    + duplicateValueCount(input.rawClosing.map(({ playerId }) => playerId))
    + duplicateValueCount([
      ...input.rawOpening.map(({ observationId }) => `opening|${observationId}`),
      ...input.rawClosing.map(({ observationId }) => `closing|${observationId}`),
      ...input.rawParticipation.map(({ observationId }) => `participation|${observationId}`),
    ]);
  const exactOrderingViolationCount = allCheckpointRows.filter(
    (row) => !isExactProjectionOrdered(row),
  ).length;
  const ratingOrderingViolationCount = allCheckpointRows.filter(
    (row) => !isRatingProjectionOrdered(row),
  ).length;

  const gates: PlayerDevelopmentCohortGate[] = [
    gate("opening_checkpoint", 1, 0),
    gate("closing_checkpoint", 1, 0),
    gate(
      "three_completed_rollovers",
      1,
      input.completedRolloverCount === 3 ? 0 : 1,
    ),
  ];
  for (const ageBand of PLAYER_DEVELOPMENT_AGE_BANDS) {
    const opening = input.opening.filter(({ age }) => ageBandFor(age) === ageBand);
    const closing = input.closing.filter(({ age }) => ageBandFor(age) === ageBand);
    const trajectory = input.trajectories.find((row) => row.ageBand === ageBand)!;
    gates.push(
      gate(`opening_age_${ageBand}`, opening.length, 0),
      gate(`closing_age_${ageBand}`, closing.length, 0),
      gate(`matched_trajectory_${ageBand}`, trajectory.matchedClosingCount, 0),
      gate(
        `trajectory_partition_${ageBand}`,
        trajectory.openingCount,
        trajectory.matchedClosingCount + trajectory.attritionCount
          === trajectory.openingCount
          ? 0
          : 1,
      ),
    );
  }
  gates.push(
    gate(
      "unique_checkpoint_and_participation_identity",
      input.rawOpening.length + input.rawClosing.length + input.rawParticipation.length,
      rawDuplicateCount,
    ),
    gate("exact_projection_order", allCheckpointRows.length, exactOrderingViolationCount),
    gate("rating_projection_order", allCheckpointRows.length, ratingOrderingViolationCount),
    gate(
      "stored_ceiling_breach",
      allCheckpointRows.length,
      allCheckpointRows.filter(
        (row) => row.currentAbility > row.storedCeilingAbility,
      ).length,
    ),
    gate(
      "generation_room",
      allCheckpointRows.filter(
        (row) => row.storedCeilingAbility > row.currentAbility,
      ).length,
      0,
    ),
    gate(
      "public_projection_room",
      allCheckpointRows.filter(
        (row) => row.publicUpperAbility > row.currentAbility,
      ).length,
      0,
    ),
    gate(
      "star_quantization",
      allCheckpointRows.filter(
        (row) =>
          row.publicUpperAbility > row.currentAbility
          && row.publicUpperRating === row.currentRating,
      ).length,
      0,
    ),
    gate(
      "young_stored_ceiling_six_public_value_hard_cap",
      allCheckpointRows.filter(
        (row) => row.age <= 20 && row.storedCeilingRating === 6,
      ).length,
      allCheckpointRows.filter(
        (row) =>
          row.age <= 20
          && row.storedCeilingRating === 6
          && row.publicValueMinorUnits > PUBLIC_VALUE_HARD_CAP_MINOR_UNITS,
      ).length,
    ),
    gate(
      "positive_opportunity_evidence",
      input.participation.filter(({ minutes }) => minutes > 0).length,
      0,
    ),
    gate(
      "zero_minute_evidence",
      input.participation.filter(({ minutes }) => minutes === 0).length
        + Math.max(0, missingParticipationPlayerCount),
      0,
    ),
    gate(
      "observed_performance_evidence",
      input.participation.filter(({ ratingSamples }) => ratingSamples > 0).length,
      0,
    ),
    gate(
      "unobserved_performance_evidence",
      input.participation.filter(({ ratingSamples }) => ratingSamples === 0).length
        + Math.max(0, missingParticipationPlayerCount),
      0,
    ),
  );
  for (const effect of ["negative", "neutral", "positive"] as const) {
    gates.push(gate(
      `environment_${effect}_evidence`,
      input.participation.filter((row) => environmentEffect(row) === effect).length,
      0,
    ));
  }
  for (const ageBand of YOUNG_VALUE_AGE_BANDS) {
    const trajectory = input.trajectories.find((row) => row.ageBand === ageBand)!;
    gates.push(gate(
      `visible_plateau_denominator_${ageBand}`,
      trajectory.plateau.genuineUpsideDenominator,
      0,
    ));
  }
  return gates;
}

/**
 * Merges stable one-world summaries without loading their raw source rows.
 *
 * Callers may merge shard batches independently and combine those aggregates
 * with `mergePlayerDevelopmentCohortAggregates`; every field is additive or a
 * fixed-key histogram, so grouping does not change the result.
 */
export function mergePlayerDevelopmentCohortWorldSummaries(
  worlds: readonly PlayerDevelopmentCohortWorldSummary[],
): PlayerDevelopmentCohortAggregateSummary {
  if (worlds.length === 0) {
    throw new Error("A player-development cohort requires at least one world summary");
  }
  const ordered = [...worlds].sort((left, right) =>
    left.worldId.localeCompare(right.worldId),
  );
  for (const world of ordered) validatePlayerDevelopmentCohortWorldSummary(world);
  return mergePlayerDevelopmentCohortAggregates(
    ordered.map(playerDevelopmentWorldAggregate),
  );
}

/** Combines already-compact partial aggregates in deterministic input order. */
export function mergePlayerDevelopmentCohortAggregates(
  aggregates: readonly PlayerDevelopmentCohortAggregateSummary[],
): PlayerDevelopmentCohortAggregateSummary {
  if (aggregates.length === 0) {
    throw new Error("A player-development cohort merge requires evidence");
  }
  for (const aggregate of aggregates) {
    validatePlayerDevelopmentCohortAggregateSummary(aggregate);
  }
  let merged = aggregates[0]!;
  for (const aggregate of aggregates.slice(1)) {
    if (
      aggregate.contractVersion !== PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION
      || merged.contractVersion !== PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION
    ) {
      throw new Error("Cannot merge incompatible player-development cohort contracts");
    }
    merged = {
      contractVersion: PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
      worldCount: merged.worldCount + aggregate.worldCount,
      completedRolloverCount: mergeNumericSummaries(
        merged.completedRolloverCount,
        aggregate.completedRolloverCount,
      ),
      openingCheckpoint: mergeCheckpointSummaries(
        merged.openingCheckpoint,
        aggregate.openingCheckpoint,
      ),
      closingCheckpoint: mergeCheckpointSummaries(
        merged.closingCheckpoint,
        aggregate.closingCheckpoint,
      ),
      trajectories: mergeTrajectorySummaries(
        merged.trajectories,
        aggregate.trajectories,
      ),
      newEntrants: mergeNewEntrantSummaries(
        merged.newEntrants,
        aggregate.newEntrants,
      ),
      growthCells: mergeGrowthCells(merged.growthCells, aggregate.growthCells),
      gates: mergeGates(merged.gates, aggregate.gates),
      structuralViolationExamples: [
        ...merged.structuralViolationExamples,
        ...aggregate.structuralViolationExamples,
      ].sort(compareStructuralExample).slice(0, MAXIMUM_STRUCTURAL_EXAMPLES),
      rawAnomalyStatusCounts: sumRecords(
        ["pass", "warn", "fail"] as const,
        merged.rawAnomalyStatusCounts,
        aggregate.rawAnomalyStatusCounts,
      ),
      worldGateAnomalyStatusCounts: sumRecords(
        ["pass", "warn", "fail"] as const,
        merged.worldGateAnomalyStatusCounts,
        aggregate.worldGateAnomalyStatusCounts,
      ),
    };
  }
  validatePlayerDevelopmentCohortAggregateSummary(merged);
  return merged;
}

function playerDevelopmentWorldAggregate(
  world: PlayerDevelopmentCohortWorldSummary,
): PlayerDevelopmentCohortAggregateSummary {
  return {
    contractVersion: PLAYER_DEVELOPMENT_COHORT_CONTRACT_VERSION,
    worldCount: 1,
    completedRolloverCount: numericSummary([world.completedRolloverCount]),
    openingCheckpoint: world.openingCheckpoint,
    closingCheckpoint: world.closingCheckpoint,
    trajectories: world.trajectories,
    newEntrants: world.newEntrants,
    growthCells: world.growthCells,
    gates: world.gates,
    structuralViolationExamples: world.structuralViolationExamples,
    rawAnomalyStatusCounts: countByKeys(
      ["pass", "warn", "fail"] as const,
      [world.rawAnomalyStatus],
    ),
    worldGateAnomalyStatusCounts: countByKeys(
      ["pass", "warn", "fail"] as const,
      [world.worldGateAnomalyStatus],
    ),
  };
}

function mergeCheckpointSummaries(
  left: PlayerDevelopmentCheckpointSummary,
  right: PlayerDevelopmentCheckpointSummary,
): PlayerDevelopmentCheckpointSummary {
  if (left.checkpoint !== right.checkpoint) {
    throw new Error("Cannot merge different player-development checkpoints");
  }
  assertOrderedAgeBands(left.ageBands);
  assertOrderedAgeBands(right.ageBands);
  return {
    checkpoint: left.checkpoint,
    observationCount: left.observationCount + right.observationCount,
    populationCounts: sumRecords(
      PLAYER_DEVELOPMENT_POPULATIONS,
      left.populationCounts,
      right.populationCounts,
    ),
    outsideTargetAgeBandCount:
      left.outsideTargetAgeBandCount + right.outsideTargetAgeBandCount,
    ageBands: left.ageBands.map((leftBand, index) =>
      mergeCheckpointAgeBand(leftBand, right.ageBands[index]!),
    ),
    youngStoredCeilingSixValueSlices: mergeValueSlices(
      left.youngStoredCeilingSixValueSlices,
      right.youngStoredCeilingSixValueSlices,
    ),
  };
}

function mergeValueSlices(
  left: readonly PlayerDevelopmentYoungCeilingSixValueSlice[],
  right: readonly PlayerDevelopmentYoungCeilingSixValueSlice[],
): readonly PlayerDevelopmentYoungCeilingSixValueSlice[] {
  assertOrderedValueSlices(left);
  assertOrderedValueSlices(right);
  const slicesByKey = new Map<string, PlayerDevelopmentYoungCeilingSixValueSlice>();
  for (const slice of [...left, ...right]) {
    const key = valueSliceKey(slice);
    const existing = slicesByKey.get(key);
    slicesByKey.set(key, existing === undefined
      ? slice
      : mergeValueSlice(existing, slice));
  }
  return [...slicesByKey.values()].sort(compareValueSlices);
}

function mergeValueSlice(
  left: PlayerDevelopmentYoungCeilingSixValueSlice,
  right: PlayerDevelopmentYoungCeilingSixValueSlice,
): PlayerDevelopmentYoungCeilingSixValueSlice {
  if (valueSliceKey(left) !== valueSliceKey(right)) {
    throw new Error("Cannot merge different rare-prospect value slices");
  }
  return {
    ageBand: left.ageBand,
    currentRating: left.currentRating,
    publicUpperRating: left.publicUpperRating,
    observationCount: left.observationCount + right.observationCount,
    publicValue: mergeNumericSummaries(left.publicValue, right.publicValue),
    publicValueBuckets: sumRecords(
      PLAYER_DEVELOPMENT_MONEY_BUCKETS,
      left.publicValueBuckets,
      right.publicValueBuckets,
    ),
    askingFee: mergeNumericSummaries(left.askingFee, right.askingFee),
    askingFeeBuckets: sumRecords(
      PLAYER_DEVELOPMENT_MONEY_BUCKETS,
      left.askingFeeBuckets,
      right.askingFeeBuckets,
    ),
    publicValueHardCapBreachCount:
      left.publicValueHardCapBreachCount + right.publicValueHardCapBreachCount,
  };
}

function valueSliceKey(
  slice: Pick<
    PlayerDevelopmentYoungCeilingSixValueSlice,
    "ageBand" | "currentRating" | "publicUpperRating"
  >,
): string {
  return `${slice.ageBand}:${slice.currentRating}:${slice.publicUpperRating}`;
}

function compareValueSlices(
  left: PlayerDevelopmentYoungCeilingSixValueSlice,
  right: PlayerDevelopmentYoungCeilingSixValueSlice,
): number {
  const ageDifference = YOUNG_VALUE_AGE_BANDS.indexOf(left.ageBand)
    - YOUNG_VALUE_AGE_BANDS.indexOf(right.ageBand);
  if (ageDifference !== 0) return ageDifference;
  const currentDifference = left.currentRating - right.currentRating;
  return currentDifference !== 0
    ? currentDifference
    : left.publicUpperRating - right.publicUpperRating;
}

function mergeCheckpointAgeBand(
  left: PlayerDevelopmentCheckpointAgeBandSummary,
  right: PlayerDevelopmentCheckpointAgeBandSummary,
): PlayerDevelopmentCheckpointAgeBandSummary {
  if (left.ageBand !== right.ageBand) {
    throw new Error("Cannot merge different checkpoint age bands");
  }
  return {
    ageBand: left.ageBand,
    observationCount: left.observationCount + right.observationCount,
    populationCounts: sumRecords(
      PLAYER_DEVELOPMENT_POPULATIONS,
      left.populationCounts,
      right.populationCounts,
    ),
    currentRatingHistogram: sumRecords(
      PLAYER_STAR_RATINGS,
      left.currentRatingHistogram,
      right.currentRatingHistogram,
    ),
    publicP50RatingHistogram: sumRecords(
      PLAYER_STAR_RATINGS,
      left.publicP50RatingHistogram,
      right.publicP50RatingHistogram,
    ),
    publicUpperRatingHistogram: sumRecords(
      PLAYER_STAR_RATINGS,
      left.publicUpperRatingHistogram,
      right.publicUpperRatingHistogram,
    ),
    storedCeilingRatingHistogram: sumRecords(
      PLAYER_STAR_RATINGS,
      left.storedCeilingRatingHistogram,
      right.storedCeilingRatingHistogram,
    ),
    publicP50FromCurrent: mergeExactGapSummaries(
      left.publicP50FromCurrent,
      right.publicP50FromCurrent,
    ),
    publicUpperFromCurrent: mergeExactGapSummaries(
      left.publicUpperFromCurrent,
      right.publicUpperFromCurrent,
    ),
    storedCeilingFromUpper: mergeExactGapSummaries(
      left.storedCeilingFromUpper,
      right.storedCeilingFromUpper,
    ),
    storedCeilingFromCurrent: mergeExactGapSummaries(
      left.storedCeilingFromCurrent,
      right.storedCeilingFromCurrent,
    ),
    publicP50FromCurrentRatingHistogram: sumRecords(
      PLAYER_DEVELOPMENT_STAR_DELTAS,
      left.publicP50FromCurrentRatingHistogram,
      right.publicP50FromCurrentRatingHistogram,
    ),
    publicUpperFromCurrentRatingHistogram: sumRecords(
      PLAYER_DEVELOPMENT_STAR_DELTAS,
      left.publicUpperFromCurrentRatingHistogram,
      right.publicUpperFromCurrentRatingHistogram,
    ),
    storedCeilingFromUpperRatingHistogram: sumRecords(
      PLAYER_DEVELOPMENT_STAR_DELTAS,
      left.storedCeilingFromUpperRatingHistogram,
      right.storedCeilingFromUpperRatingHistogram,
    ),
    storedCeilingFromCurrentRatingHistogram: sumRecords(
      PLAYER_DEVELOPMENT_STAR_DELTAS,
      left.storedCeilingFromCurrentRatingHistogram,
      right.storedCeilingFromCurrentRatingHistogram,
    ),
    quantizedPublicRoomCount:
      left.quantizedPublicRoomCount + right.quantizedPublicRoomCount,
  };
}

function mergeTrajectorySummaries(
  left: readonly PlayerDevelopmentTrajectoryAgeBandSummary[],
  right: readonly PlayerDevelopmentTrajectoryAgeBandSummary[],
): readonly PlayerDevelopmentTrajectoryAgeBandSummary[] {
  assertOrderedTrajectories(left);
  assertOrderedTrajectories(right);
  return left.map((leftRow, index) => {
    const rightRow = right[index]!;
    if (leftRow.ageBand !== rightRow.ageBand) {
      throw new Error("Cannot merge different trajectory age bands");
    }
    return {
      ageBand: leftRow.ageBand,
      openingCount: leftRow.openingCount + rightRow.openingCount,
      matchedClosingCount:
        leftRow.matchedClosingCount + rightRow.matchedClosingCount,
      attritionCount: leftRow.attritionCount + rightRow.attritionCount,
      openingPopulationCounts: sumRecords(
        PLAYER_DEVELOPMENT_POPULATIONS,
        leftRow.openingPopulationCounts,
        rightRow.openingPopulationCounts,
      ),
      currentAbilityDelta: mergeNumericSummaries(
        leftRow.currentAbilityDelta,
        rightRow.currentAbilityDelta,
      ),
      currentRatingDeltaHistogram: sumRecords(
        PLAYER_DEVELOPMENT_STAR_DELTAS,
        leftRow.currentRatingDeltaHistogram,
        rightRow.currentRatingDeltaHistogram,
      ),
      publicP50RatingDeltaHistogram: sumRecords(
        PLAYER_DEVELOPMENT_STAR_DELTAS,
        leftRow.publicP50RatingDeltaHistogram,
        rightRow.publicP50RatingDeltaHistogram,
      ),
      publicUpperRatingDeltaHistogram: sumRecords(
        PLAYER_DEVELOPMENT_STAR_DELTAS,
        leftRow.publicUpperRatingDeltaHistogram,
        rightRow.publicUpperRatingDeltaHistogram,
      ),
      storedCeilingRatingDeltaHistogram: sumRecords(
        PLAYER_DEVELOPMENT_STAR_DELTAS,
        leftRow.storedCeilingRatingDeltaHistogram,
        rightRow.storedCeilingRatingDeltaHistogram,
      ),
      openingStoredRoom: mergeExactGapSummaries(
        leftRow.openingStoredRoom,
        rightRow.openingStoredRoom,
      ),
      openingStoredRoomRatingHistogram: sumRecords(
        PLAYER_DEVELOPMENT_STAR_DELTAS,
        leftRow.openingStoredRoomRatingHistogram,
        rightRow.openingStoredRoomRatingHistogram,
      ),
      roomRealization: mergeNumericSummaries(
        leftRow.roomRealization,
        rightRow.roomRealization,
      ),
      roomRealizationBuckets: sumRecords(
        PLAYER_DEVELOPMENT_ROOM_REALIZATION_BUCKETS,
        leftRow.roomRealizationBuckets,
        rightRow.roomRealizationBuckets,
      ),
      totalMinutes: leftRow.totalMinutes + rightRow.totalMinutes,
      ratingTotal: leftRow.ratingTotal + rightRow.ratingTotal,
      ratingSamples: leftRow.ratingSamples + rightRow.ratingSamples,
      environmentSourceMinutes:
        leftRow.environmentSourceMinutes + rightRow.environmentSourceMinutes,
      weightedEnvironmentBasisPointMinutes:
        leftRow.weightedEnvironmentBasisPointMinutes
        + rightRow.weightedEnvironmentBasisPointMinutes,
      plateau: mergePlateauSummaries(leftRow.plateau, rightRow.plateau),
    };
  });
}

function mergeGrowthCells(
  left: readonly PlayerDevelopmentGrowthCell[],
  right: readonly PlayerDevelopmentGrowthCell[],
): readonly PlayerDevelopmentGrowthCell[] {
  assertOrderedGrowthCells(left);
  assertOrderedGrowthCells(right);
  return left.map((leftCell, index) => {
    const rightCell = right[index]!;
    if (growthCellKey(leftCell.ageBand, leftCell) !== growthCellKey(rightCell.ageBand, rightCell)) {
      throw new Error("Cannot merge different player-development growth cells");
    }
    const observationCount = leftCell.observationCount + rightCell.observationCount;
    return {
      ageBand: leftCell.ageBand,
      opportunity: leftCell.opportunity,
      performance: leftCell.performance,
      environmentEffect: leftCell.environmentEffect,
      associationKind: "overlapping_ever_exposed",
      evaluationStatus: observationCount === 0 ? "not_evaluated" : "evaluated",
      observationCount,
      playerCount: leftCell.playerCount + rightCell.playerCount,
      minutes: leftCell.minutes + rightCell.minutes,
      ratingSamples: leftCell.ratingSamples + rightCell.ratingSamples,
      currentAbilityGrowth: mergeNumericSummaries(
        leftCell.currentAbilityGrowth,
        rightCell.currentAbilityGrowth,
      ),
      currentRatingDeltaHistogram: sumRecords(
        PLAYER_DEVELOPMENT_STAR_DELTAS,
        leftCell.currentRatingDeltaHistogram,
        rightCell.currentRatingDeltaHistogram,
      ),
      visibleEarlyPlateauCount:
        leftCell.visibleEarlyPlateauCount + rightCell.visibleEarlyPlateauCount,
      visibleEarlyPlateauDenominator:
        leftCell.visibleEarlyPlateauDenominator
        + rightCell.visibleEarlyPlateauDenominator,
      exactNonGrowthCount:
        leftCell.exactNonGrowthCount + rightCell.exactNonGrowthCount,
      exactNonGrowthDenominator:
        leftCell.exactNonGrowthDenominator + rightCell.exactNonGrowthDenominator,
    };
  });
}

function mergeNewEntrantSummaries(
  left: PlayerDevelopmentNewEntrantSummary,
  right: PlayerDevelopmentNewEntrantSummary,
): PlayerDevelopmentNewEntrantSummary {
  return {
    totalCount: left.totalCount + right.totalCount,
    outsideTargetAgeBandCount:
      left.outsideTargetAgeBandCount + right.outsideTargetAgeBandCount,
    ageBandPopulationCounts: PLAYER_DEVELOPMENT_AGE_BANDS.map((ageBand, index) => {
      const leftRow = left.ageBandPopulationCounts[index]!;
      const rightRow = right.ageBandPopulationCounts[index]!;
      if (leftRow.ageBand !== ageBand || rightRow.ageBand !== ageBand) {
        throw new Error("Cannot merge unordered new-entrant age bands");
      }
      return {
        ageBand,
        populationCounts: sumRecords(
          PLAYER_DEVELOPMENT_POPULATIONS,
          leftRow.populationCounts,
          rightRow.populationCounts,
        ),
      };
    }),
  };
}

function mergeGates(
  left: readonly PlayerDevelopmentCohortGate[],
  right: readonly PlayerDevelopmentCohortGate[],
): readonly PlayerDevelopmentCohortGate[] {
  if (left.length !== right.length) {
    throw new Error("Cannot merge different player-development gate sets");
  }
  return left.map((leftGate, index) => {
    const rightGate = right[index]!;
    if (leftGate.key !== rightGate.key) {
      throw new Error("Cannot merge unordered player-development gates");
    }
    return gateFromWorldEvidence(
      leftGate.key,
      leftGate.observationCount + rightGate.observationCount,
      leftGate.violationCount + rightGate.violationCount,
      leftGate.failedWorldCount + rightGate.failedWorldCount,
      leftGate.notEvaluatedWorldCount + rightGate.notEvaluatedWorldCount,
    );
  });
}

function groupParticipationByPlayer(
  rows: readonly PlayerDevelopmentParticipationObservation[],
): ReadonlyMap<string, readonly PlayerDevelopmentParticipationObservation[]> {
  const grouped = new Map<string, PlayerDevelopmentParticipationObservation[]>();
  for (const row of rows) {
    const playerRows = grouped.get(row.playerId) ?? [];
    playerRows.push(row);
    grouped.set(row.playerId, playerRows);
  }
  return grouped;
}

function ageBandFor(age: number): PlayerDevelopmentAgeBand | undefined {
  if (age >= 15 && age <= 17) return "15_17";
  if (age >= 18 && age <= 20) return "18_20";
  if (age >= 21 && age <= 23) return "21_23";
  return undefined;
}

function opportunityBand(minutes: number): PlayerDevelopmentOpportunityBand {
  const multiplier = monthlyOpportunityMultiplier(minutes);
  switch (multiplier) {
    case 0:
      return "zero";
    case 0.15:
      return "cameo";
    case 0.45:
      return "rotation";
    case 0.75:
      return "regular";
    case 1:
      return "full";
    default:
      throw new Error(`Unsupported development opportunity multiplier: ${multiplier}`);
  }
}

function performanceBand(
  observation: PlayerDevelopmentParticipationObservation,
): PlayerDevelopmentPerformanceBand {
  if (observation.ratingSamples === 0) return "unobserved";
  const modifier = monthlyPerformanceModifier(
    observation.ratingTotal / observation.ratingSamples,
  );
  if (modifier <= 0.85) return "negative_saturated";
  if (modifier < 1) return "negative";
  if (modifier === 1) return "neutral";
  if (modifier >= 1.15) return "positive_saturated";
  return "positive";
}

function environmentEffect(
  observation: PlayerDevelopmentParticipationObservation,
): PlayerDevelopmentEnvironmentEffect {
  if (
    observation.minutes === 0
    || observation.positiveGrowthEnvironmentBasisPoints === null
  ) {
    return "unobserved";
  }
  if (
    observation.positiveGrowthEnvironmentBasisPoints
    < NEUTRAL_ENVIRONMENT_BASIS_POINTS
  ) {
    return "negative";
  }
  if (
    observation.positiveGrowthEnvironmentBasisPoints
    > NEUTRAL_ENVIRONMENT_BASIS_POINTS
  ) {
    return "positive";
  }
  return "neutral";
}

function growthCellKey(
  ageBand: PlayerDevelopmentAgeBand,
  input: Readonly<{
    opportunity: PlayerDevelopmentOpportunityBand;
    performance: PlayerDevelopmentPerformanceBand;
    environmentEffect: PlayerDevelopmentEnvironmentEffect;
  }>,
): string {
  return [
    ageBand,
    input.opportunity,
    input.performance,
    input.environmentEffect,
  ].join("|");
}

function emptyMutableGrowthCell(): MutableGrowthCell {
  return {
    observationCount: 0,
    playerIds: new Set(),
    minutes: 0,
    ratingSamples: 0,
    currentAbilityGrowth: [],
    currentRatingDeltas: [],
    visibleEarlyPlateauCount: 0,
    visibleEarlyPlateauDenominator: 0,
    exactNonGrowthCount: 0,
    exactNonGrowthDenominator: 0,
  };
}

function countPopulations(
  observations: readonly Readonly<{ population: PlayerGenerationPopulation }>[],
): PlayerDevelopmentPopulationCounts {
  return countByKeys(
    PLAYER_DEVELOPMENT_POPULATIONS,
    observations.map(({ population }) => population),
  );
}

function ratingHistogram(
  ratings: readonly PlayerStarRating[],
): PlayerDevelopmentRatingHistogram {
  return countByKeys(PLAYER_STAR_RATINGS, ratings);
}

function starDeltaHistogram(
  deltas: readonly number[],
): PlayerDevelopmentStarDeltaHistogram {
  const validated = deltas.map((delta) => {
    const supported = PLAYER_DEVELOPMENT_STAR_DELTAS.find(
      (candidate) => candidate === delta,
    );
    if (supported === undefined) {
      throw new Error(`Unsupported player-development star delta: ${delta}`);
    }
    return supported;
  });
  return countByKeys(PLAYER_DEVELOPMENT_STAR_DELTAS, validated);
}

function numericSummary(
  values: readonly number[],
): PlayerDevelopmentNumericSummary {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new Error(`Player-development numeric evidence is not finite: ${value}`);
    }
  }
  return {
    observationCount: values.length,
    sum: values.reduce((sum, value) => sum + value, 0),
    minimum: values.length === 0 ? null : Math.min(...values),
    maximum: values.length === 0 ? null : Math.max(...values),
  };
}

function exactGapSummary(
  values: readonly number[],
): PlayerDevelopmentExactGapSummary {
  return {
    ...numericSummary(values),
    buckets: countByKeys(
      PLAYER_DEVELOPMENT_ABILITY_GAP_BUCKETS,
      values.map(abilityGapBucket),
    ),
  };
}

function mergeNumericSummaries(
  left: PlayerDevelopmentNumericSummary,
  right: PlayerDevelopmentNumericSummary,
): PlayerDevelopmentNumericSummary {
  return {
    observationCount: left.observationCount + right.observationCount,
    sum: left.sum + right.sum,
    minimum: minimumNullable(left.minimum, right.minimum),
    maximum: maximumNullable(left.maximum, right.maximum),
  };
}

function mergeExactGapSummaries(
  left: PlayerDevelopmentExactGapSummary,
  right: PlayerDevelopmentExactGapSummary,
): PlayerDevelopmentExactGapSummary {
  return {
    ...mergeNumericSummaries(left, right),
    buckets: sumRecords(
      PLAYER_DEVELOPMENT_ABILITY_GAP_BUCKETS,
      left.buckets,
      right.buckets,
    ),
  };
}

function mergePlateauSummaries(
  left: PlayerDevelopmentPlateauSummary,
  right: PlayerDevelopmentPlateauSummary,
): PlayerDevelopmentPlateauSummary {
  return {
    genuineUpsideDenominator:
      left.genuineUpsideDenominator + right.genuineUpsideDenominator,
    visibleEarlyPlateauCount:
      left.visibleEarlyPlateauCount + right.visibleEarlyPlateauCount,
    genuineUpsideExactNonGrowthCount:
      left.genuineUpsideExactNonGrowthCount
      + right.genuineUpsideExactNonGrowthCount,
    belowOneStarRoomDenominator:
      left.belowOneStarRoomDenominator + right.belowOneStarRoomDenominator,
    belowOneStarVisiblePlateauCount:
      left.belowOneStarVisiblePlateauCount
      + right.belowOneStarVisiblePlateauCount,
    belowOneStarExactNonGrowthCount:
      left.belowOneStarExactNonGrowthCount
      + right.belowOneStarExactNonGrowthCount,
  };
}

function abilityGapBucket(value: number): PlayerDevelopmentAbilityGapBucket {
  if (value <= 0) return "non_positive";
  if (value <= 0.25) return "up_to_0_25";
  if (value <= 0.5) return "up_to_0_5";
  if (value <= 1) return "up_to_1";
  if (value <= 2) return "up_to_2";
  if (value <= 4) return "up_to_4";
  return "above_4";
}

function roomRealizationBucket(
  value: number,
): PlayerDevelopmentRoomRealizationBucket {
  if (value <= 0) return "non_positive_growth";
  if (value <= 0.25) return "up_to_0_25";
  if (value <= 0.5) return "up_to_0_5";
  if (value <= 0.75) return "up_to_0_75";
  if (value <= 1) return "up_to_1";
  return "above_1";
}

function moneyBucket(value: number): PlayerDevelopmentMoneyBucket {
  for (const bucket of PLAYER_DEVELOPMENT_MONEY_BUCKETS) {
    const maximum = PLAYER_DEVELOPMENT_MONEY_BUCKET_UPPER_BOUNDS_MINOR_UNITS[bucket];
    if (maximum !== null && value <= maximum) return bucket;
  }
  return "above_eur_150m";
}

function countByKeys<Key extends PropertyKey>(
  keys: readonly Key[],
  values: readonly Key[],
): Readonly<Record<Key, number>> {
  const result = Object.fromEntries(keys.map((key) => [key, 0])) as Record<Key, number>;
  for (const value of values) result[value] += 1;
  return result;
}

function sumRecords<Key extends PropertyKey>(
  keys: readonly Key[],
  left: Readonly<Record<Key, number>>,
  right: Readonly<Record<Key, number>>,
): Readonly<Record<Key, number>> {
  return Object.fromEntries(
    keys.map((key) => [key, left[key] + right[key]]),
  ) as Record<Key, number>;
}

function gate(
  key: string,
  observationCount: number,
  violationCount: number,
): PlayerDevelopmentCohortGate {
  return gateFromWorldEvidence(
    key,
    observationCount,
    violationCount,
    violationCount > 0 ? 1 : 0,
    observationCount === 0 ? 1 : 0,
  );
}

function gateFromWorldEvidence(
  key: string,
  observationCount: number,
  violationCount: number,
  failedWorldCount: number,
  notEvaluatedWorldCount: number,
): PlayerDevelopmentCohortGate {
  return {
    key,
    observationCount,
    violationCount,
    failedWorldCount,
    notEvaluatedWorldCount,
    status:
      failedWorldCount > 0 || violationCount > 0
        ? "fail"
        : notEvaluatedWorldCount > 0 || observationCount === 0
        ? "not_evaluated"
        : "pass",
  };
}

function isExactProjectionOrdered(
  row: PlayerDevelopmentProjectionFacts,
): boolean {
  return row.currentAbility <= row.publicP50Ability
    && row.publicP50Ability <= row.publicUpperAbility
    && row.publicUpperAbility <= row.storedCeilingAbility;
}

function isRatingProjectionOrdered(
  row: PlayerDevelopmentProjectionFacts,
): boolean {
  return row.currentRating <= row.publicP50Rating
    && row.publicP50Rating <= row.publicUpperRating
    && row.publicUpperRating <= row.storedCeilingRating;
}

function duplicateValueCount(values: readonly string[]): number {
  const seen = new Set<string>();
  let duplicateCount = 0;
  for (const value of values) {
    if (seen.has(value)) duplicateCount += 1;
    else seen.add(value);
  }
  return duplicateCount;
}

function addStructuralExample(
  examples: PlayerDevelopmentStructuralViolationExample[],
  example: PlayerDevelopmentStructuralViolationExample,
): void {
  if (examples.length < MAXIMUM_STRUCTURAL_EXAMPLES) examples.push(example);
}

function compareStructuralExample(
  left: PlayerDevelopmentStructuralViolationExample,
  right: PlayerDevelopmentStructuralViolationExample,
): number {
  return left.worldId.localeCompare(right.worldId)
    || left.checkpoint.localeCompare(right.checkpoint)
    || left.playerId.localeCompare(right.playerId)
    || left.kind.localeCompare(right.kind);
}

function validateWorldIdentity(worldId: string, completedRolloverCount: number): void {
  if (worldId.length === 0) {
    throw new Error("Player-development cohort world identity must not be empty");
  }
  if (!Number.isSafeInteger(completedRolloverCount) || completedRolloverCount < 0) {
    throw new Error(`Invalid completed rollover count: ${completedRolloverCount}`);
  }
}

function assertOrderedAgeBands(
  rows: readonly PlayerDevelopmentCheckpointAgeBandSummary[],
): void {
  if (
    rows.length !== PLAYER_DEVELOPMENT_AGE_BANDS.length
    || rows.some((row, index) => row.ageBand !== PLAYER_DEVELOPMENT_AGE_BANDS[index])
  ) {
    throw new Error("Player-development checkpoint age bands are not canonical");
  }
}

function assertOrderedTrajectories(
  rows: readonly PlayerDevelopmentTrajectoryAgeBandSummary[],
): void {
  if (
    rows.length !== PLAYER_DEVELOPMENT_AGE_BANDS.length
    || rows.some((row, index) => row.ageBand !== PLAYER_DEVELOPMENT_AGE_BANDS[index])
  ) {
    throw new Error("Player-development trajectories are not canonical");
  }
}

function assertOrderedGrowthCells(
  rows: readonly PlayerDevelopmentGrowthCell[],
): void {
  const expectedCount =
    PLAYER_DEVELOPMENT_AGE_BANDS.length
    * PLAYER_DEVELOPMENT_OPPORTUNITY_BANDS.length
    * PLAYER_DEVELOPMENT_PERFORMANCE_BANDS.length
    * PLAYER_DEVELOPMENT_ENVIRONMENT_EFFECTS.length;
  if (rows.length !== expectedCount) {
    throw new Error("Player-development growth-cell matrix is incomplete");
  }
  let index = 0;
  for (const ageBand of PLAYER_DEVELOPMENT_AGE_BANDS) {
    for (const opportunity of PLAYER_DEVELOPMENT_OPPORTUNITY_BANDS) {
      for (const performance of PLAYER_DEVELOPMENT_PERFORMANCE_BANDS) {
        for (const environmentEffect of PLAYER_DEVELOPMENT_ENVIRONMENT_EFFECTS) {
          const row = rows[index];
          if (
            row === undefined
            || growthCellKey(row.ageBand, row)
              !== growthCellKey(ageBand, { opportunity, performance, environmentEffect })
          ) {
            throw new Error("Player-development growth cells are not canonical");
          }
          index += 1;
        }
      }
    }
  }
}

function assertOrderedValueSlices(
  rows: readonly PlayerDevelopmentYoungCeilingSixValueSlice[],
): void {
  let previous: PlayerDevelopmentYoungCeilingSixValueSlice | undefined;
  for (const row of rows) {
    if (
      !YOUNG_VALUE_AGE_BANDS.includes(row.ageBand)
      || !PLAYER_STAR_RATINGS.includes(row.currentRating)
      || !PLAYER_STAR_RATINGS.includes(row.publicUpperRating)
      || (previous !== undefined && compareValueSlices(previous, row) >= 0)
    ) {
      throw new Error("Rare-prospect value slices are not canonical");
    }
    previous = row;
  }
}

function validateCheckpointSummary(
  summary: PlayerDevelopmentCheckpointSummary,
): void {
  assertExactObjectKeys(summary, [
    "checkpoint",
    "observationCount",
    "populationCounts",
    "outsideTargetAgeBandCount",
    "ageBands",
    "youngStoredCeilingSixValueSlices",
  ], "player-development checkpoint summary");
  assertCount(summary.observationCount, "checkpoint observations");
  assertCount(summary.outsideTargetAgeBandCount, "outside target ages");
  validateCountRecord(
    PLAYER_DEVELOPMENT_POPULATIONS,
    summary.populationCounts,
    summary.observationCount,
    "checkpoint populations",
  );
  const ageBandCount = summary.ageBands.reduce(
    (sum, band) => sum + band.observationCount,
    0,
  );
  if (ageBandCount + summary.outsideTargetAgeBandCount !== summary.observationCount) {
    throw new Error("Checkpoint age-band counts do not cover its observations");
  }
  for (const band of summary.ageBands) validateCheckpointAgeBandSummary(band);
  for (const slice of summary.youngStoredCeilingSixValueSlices) {
    validateValueSlice(slice);
  }
}

function validateCheckpointAgeBandSummary(
  summary: PlayerDevelopmentCheckpointAgeBandSummary,
): void {
  assertExactObjectKeys(summary, [
    "ageBand",
    "observationCount",
    "populationCounts",
    "currentRatingHistogram",
    "publicP50RatingHistogram",
    "publicUpperRatingHistogram",
    "storedCeilingRatingHistogram",
    "publicP50FromCurrent",
    "publicUpperFromCurrent",
    "storedCeilingFromUpper",
    "storedCeilingFromCurrent",
    "publicP50FromCurrentRatingHistogram",
    "publicUpperFromCurrentRatingHistogram",
    "storedCeilingFromUpperRatingHistogram",
    "storedCeilingFromCurrentRatingHistogram",
    "quantizedPublicRoomCount",
  ], "player-development checkpoint age band");
  assertCount(summary.observationCount, "checkpoint age-band observations");
  validateCountRecord(
    PLAYER_DEVELOPMENT_POPULATIONS,
    summary.populationCounts,
    summary.observationCount,
    "checkpoint age-band populations",
  );
  for (const [label, histogram] of [
    ["current rating", summary.currentRatingHistogram],
    ["P50 rating", summary.publicP50RatingHistogram],
    ["upper rating", summary.publicUpperRatingHistogram],
    ["stored rating", summary.storedCeilingRatingHistogram],
  ] as const) {
    validateCountRecord(
      PLAYER_STAR_RATINGS,
      histogram,
      summary.observationCount,
      label,
    );
  }
  for (const [label, gap] of [
    ["P50-current", summary.publicP50FromCurrent],
    ["upper-current", summary.publicUpperFromCurrent],
    ["stored-upper", summary.storedCeilingFromUpper],
    ["stored-current", summary.storedCeilingFromCurrent],
  ] as const) {
    validateExactGapSummary(gap, summary.observationCount, label);
  }
  for (const [label, histogram] of [
    ["P50-current stars", summary.publicP50FromCurrentRatingHistogram],
    ["upper-current stars", summary.publicUpperFromCurrentRatingHistogram],
    ["stored-upper stars", summary.storedCeilingFromUpperRatingHistogram],
    ["stored-current stars", summary.storedCeilingFromCurrentRatingHistogram],
  ] as const) {
    validateCountRecord(
      PLAYER_DEVELOPMENT_STAR_DELTAS,
      histogram,
      summary.observationCount,
      label,
    );
  }
  assertCount(summary.quantizedPublicRoomCount, "quantized public room");
  if (summary.quantizedPublicRoomCount > summary.observationCount) {
    throw new Error("Quantized public-room count exceeds age-band observations");
  }
}

function validateValueSlice(
  slice: PlayerDevelopmentYoungCeilingSixValueSlice,
): void {
  assertExactObjectKeys(slice, [
    "ageBand",
    "currentRating",
    "publicUpperRating",
    "observationCount",
    "publicValue",
    "publicValueBuckets",
    "askingFee",
    "askingFeeBuckets",
    "publicValueHardCapBreachCount",
  ], "rare-prospect value slice");
  assertCount(slice.observationCount, "rare-prospect value observations");
  if (slice.observationCount === 0) {
    throw new Error("Rare-prospect value slices must retain positive evidence");
  }
  validateNumericSummary(slice.publicValue, "rare-prospect public value");
  if (slice.publicValue.observationCount !== slice.observationCount) {
    throw new Error("Rare-prospect public-value denominator is inconsistent");
  }
  validateCountRecord(
    PLAYER_DEVELOPMENT_MONEY_BUCKETS,
    slice.publicValueBuckets,
    slice.observationCount,
    "rare-prospect public-value buckets",
  );
  validateNumericSummary(slice.askingFee, "rare-prospect asking fee");
  if (slice.askingFee.observationCount > slice.observationCount) {
    throw new Error("Rare-prospect asking denominator exceeds its stock");
  }
  validateCountRecord(
    PLAYER_DEVELOPMENT_MONEY_BUCKETS,
    slice.askingFeeBuckets,
    slice.askingFee.observationCount,
    "rare-prospect asking buckets",
  );
  assertCount(slice.publicValueHardCapBreachCount, "public-value cap breaches");
  if (slice.publicValueHardCapBreachCount > slice.observationCount) {
    throw new Error("Rare-prospect cap breaches exceed observations");
  }
}

function validateTrajectorySummary(
  summary: PlayerDevelopmentTrajectoryAgeBandSummary,
): void {
  assertExactObjectKeys(summary, [
    "ageBand",
    "openingCount",
    "matchedClosingCount",
    "attritionCount",
    "openingPopulationCounts",
    "currentAbilityDelta",
    "currentRatingDeltaHistogram",
    "publicP50RatingDeltaHistogram",
    "publicUpperRatingDeltaHistogram",
    "storedCeilingRatingDeltaHistogram",
    "openingStoredRoom",
    "openingStoredRoomRatingHistogram",
    "roomRealization",
    "roomRealizationBuckets",
    "totalMinutes",
    "ratingTotal",
    "ratingSamples",
    "environmentSourceMinutes",
    "weightedEnvironmentBasisPointMinutes",
    "plateau",
  ], "player-development trajectory");
  assertCount(summary.openingCount, "trajectory opening");
  assertCount(summary.matchedClosingCount, "trajectory matched closing");
  assertCount(summary.attritionCount, "trajectory attrition");
  validateCountRecord(
    PLAYER_DEVELOPMENT_POPULATIONS,
    summary.openingPopulationCounts,
    summary.openingCount,
    "trajectory opening populations",
  );
  validateNumericSummary(summary.currentAbilityDelta, "current-ability delta");
  validateExactGapSummary(
    summary.openingStoredRoom,
    summary.matchedClosingCount,
    "opening stored room",
  );
  validateNumericSummary(summary.roomRealization, "room realization");
  if (
    summary.currentAbilityDelta.observationCount !== summary.matchedClosingCount
    || summary.openingStoredRoom.observationCount !== summary.matchedClosingCount
    || summary.roomRealization.observationCount > summary.matchedClosingCount
  ) {
    throw new Error("Trajectory numeric denominators are inconsistent");
  }
  for (const [label, histogram] of [
    ["current delta", summary.currentRatingDeltaHistogram],
    ["P50 delta", summary.publicP50RatingDeltaHistogram],
    ["upper delta", summary.publicUpperRatingDeltaHistogram],
    ["stored delta", summary.storedCeilingRatingDeltaHistogram],
    ["opening stored room", summary.openingStoredRoomRatingHistogram],
  ] as const) {
    validateCountRecord(
      PLAYER_DEVELOPMENT_STAR_DELTAS,
      histogram,
      summary.matchedClosingCount,
      `trajectory ${label}`,
    );
  }
  validateCountRecord(
    PLAYER_DEVELOPMENT_ROOM_REALIZATION_BUCKETS,
    summary.roomRealizationBuckets,
    summary.roomRealization.observationCount,
    "room-realization buckets",
  );
  for (const [label, value] of [
    ["trajectory minutes", summary.totalMinutes],
    ["trajectory rating samples", summary.ratingSamples],
    ["environment source minutes", summary.environmentSourceMinutes],
  ] as const) assertCount(value, label);
  if (
    !Number.isFinite(summary.ratingTotal)
    || !Number.isFinite(summary.weightedEnvironmentBasisPointMinutes)
  ) {
    throw new Error("Trajectory weighted evidence must be finite");
  }
  validatePlateauSummary(summary.plateau);
}

function validatePlateauSummary(summary: PlayerDevelopmentPlateauSummary): void {
  assertExactObjectKeys(summary, [
    "genuineUpsideDenominator",
    "visibleEarlyPlateauCount",
    "genuineUpsideExactNonGrowthCount",
    "belowOneStarRoomDenominator",
    "belowOneStarVisiblePlateauCount",
    "belowOneStarExactNonGrowthCount",
  ], "player-development plateau");
  for (const value of Object.values(summary)) assertCount(value, "plateau evidence");
  if (
    summary.visibleEarlyPlateauCount > summary.genuineUpsideDenominator
    || summary.genuineUpsideExactNonGrowthCount > summary.genuineUpsideDenominator
    || summary.belowOneStarVisiblePlateauCount > summary.belowOneStarRoomDenominator
    || summary.belowOneStarExactNonGrowthCount > summary.belowOneStarRoomDenominator
  ) {
    throw new Error("Plateau numerator exceeds its descriptive denominator");
  }
}

function validateGrowthCell(cell: PlayerDevelopmentGrowthCell): void {
  assertExactObjectKeys(cell, [
    "ageBand",
    "opportunity",
    "performance",
    "environmentEffect",
    "associationKind",
    "evaluationStatus",
    "observationCount",
    "playerCount",
    "minutes",
    "ratingSamples",
    "currentAbilityGrowth",
    "currentRatingDeltaHistogram",
    "visibleEarlyPlateauCount",
    "visibleEarlyPlateauDenominator",
    "exactNonGrowthCount",
    "exactNonGrowthDenominator",
  ], "player-development growth cell");
  if (cell.associationKind !== "overlapping_ever_exposed") {
    throw new Error("Growth-cell association semantics are missing");
  }
  for (const [label, value] of [
    ["growth-cell observations", cell.observationCount],
    ["growth-cell players", cell.playerCount],
    ["growth-cell minutes", cell.minutes],
    ["growth-cell rating samples", cell.ratingSamples],
    ["growth-cell visible plateau", cell.visibleEarlyPlateauCount],
    ["growth-cell visible denominator", cell.visibleEarlyPlateauDenominator],
    ["growth-cell exact non-growth", cell.exactNonGrowthCount],
    ["growth-cell exact denominator", cell.exactNonGrowthDenominator],
  ] as const) assertCount(value, label);
  const expectedStatus = cell.observationCount === 0
    ? "not_evaluated"
    : "evaluated";
  if (cell.evaluationStatus !== expectedStatus) {
    throw new Error("Growth-cell evaluation status is inconsistent");
  }
  if (
    cell.playerCount > cell.observationCount
    || cell.visibleEarlyPlateauCount > cell.visibleEarlyPlateauDenominator
    || cell.visibleEarlyPlateauDenominator > cell.playerCount
    || cell.exactNonGrowthCount > cell.exactNonGrowthDenominator
    || cell.exactNonGrowthDenominator > cell.playerCount
  ) {
    throw new Error("Growth-cell numerator or player denominator is inconsistent");
  }
  validateNumericSummary(cell.currentAbilityGrowth, "growth-cell ability");
  if (cell.currentAbilityGrowth.observationCount !== cell.playerCount) {
    throw new Error("Growth-cell ability denominator differs from player count");
  }
  validateCountRecord(
    PLAYER_DEVELOPMENT_STAR_DELTAS,
    cell.currentRatingDeltaHistogram,
    cell.playerCount,
    "growth-cell star deltas",
  );
}

function validateNewEntrantSummary(summary: PlayerDevelopmentNewEntrantSummary): void {
  assertExactObjectKeys(summary, [
    "totalCount",
    "outsideTargetAgeBandCount",
    "ageBandPopulationCounts",
  ], "player-development new entrants");
  assertCount(summary.totalCount, "new entrants");
  assertCount(summary.outsideTargetAgeBandCount, "outside-age new entrants");
  if (summary.ageBandPopulationCounts.length !== PLAYER_DEVELOPMENT_AGE_BANDS.length) {
    throw new Error("New-entrant age-band matrix is incomplete");
  }
  let inBandCount = 0;
  summary.ageBandPopulationCounts.forEach((row, index) => {
    assertExactObjectKeys(row, [
      "ageBand",
      "populationCounts",
    ], "player-development new-entrant age band");
    if (row.ageBand !== PLAYER_DEVELOPMENT_AGE_BANDS[index]) {
      throw new Error("New-entrant age bands are not canonical");
    }
    const rowCount = sumRecord(PLAYER_DEVELOPMENT_POPULATIONS, row.populationCounts);
    validateCountRecord(
      PLAYER_DEVELOPMENT_POPULATIONS,
      row.populationCounts,
      rowCount,
      "new-entrant populations",
    );
    inBandCount += rowCount;
  });
  if (inBandCount + summary.outsideTargetAgeBandCount !== summary.totalCount) {
    throw new Error("New-entrant age bands do not cover the total");
  }
}

function validateGateSummaries(
  gates: readonly PlayerDevelopmentCohortGate[],
  worldCount: number,
): void {
  if (
    gates.length !== PLAYER_DEVELOPMENT_COHORT_GATE_KEYS.length
    || gates.some((gateRow, index) =>
      gateRow.key !== PLAYER_DEVELOPMENT_COHORT_GATE_KEYS[index])
  ) {
    throw new Error("Player-development cohort gates are not canonical");
  }
  for (const gateRow of gates) {
    assertExactObjectKeys(gateRow, [
      "key",
      "observationCount",
      "violationCount",
      "failedWorldCount",
      "notEvaluatedWorldCount",
      "status",
    ], "player-development gate");
    assertCount(gateRow.observationCount, `${gateRow.key} observations`);
    assertCount(gateRow.violationCount, `${gateRow.key} violations`);
    assertCount(gateRow.failedWorldCount, `${gateRow.key} failed worlds`);
    assertCount(
      gateRow.notEvaluatedWorldCount,
      `${gateRow.key} not-evaluated worlds`,
    );
    if (gateRow.violationCount > gateRow.observationCount) {
      throw new Error(`Player-development gate violations exceed observations: ${gateRow.key}`);
    }
    if (
      gateRow.failedWorldCount > gateRow.violationCount
      || gateRow.failedWorldCount + gateRow.notEvaluatedWorldCount > worldCount
      || (gateRow.violationCount > 0) !== (gateRow.failedWorldCount > 0)
      || (gateRow.observationCount === 0)
        !== (gateRow.notEvaluatedWorldCount === worldCount)
    ) {
      throw new Error(`Player-development gate world counts are inconsistent: ${gateRow.key}`);
    }
    const expectedStatus = gateRow.failedWorldCount > 0
      ? "fail"
      : gateRow.notEvaluatedWorldCount > 0
        ? "not_evaluated"
        : "pass";
    if (gateRow.status !== expectedStatus) {
      throw new Error(`Player-development gate status is inconsistent: ${gateRow.key}`);
    }
  }
}

function validateAnomalySummaries(
  summary: PlayerDevelopmentCohortWorldSummary,
): void {
  if (
    summary.anomalyChecks.length !== LONG_RUN_ANOMALY_KEYS.length
    || summary.anomalyChecks.some(
      (anomaly, index) => anomaly.key !== LONG_RUN_ANOMALY_KEYS[index],
    )
  ) {
    throw new Error("Long-run anomaly evidence is not canonical");
  }
  for (const anomaly of summary.anomalyChecks) {
    assertExactObjectKeys(anomaly, [
      "key",
      "status",
      "value",
      "threshold",
      "semanticClass",
      "worldGateStatus",
    ], "long-run anomaly evidence");
    const projected = projectLongRunAnomalyCheckForWorldGate(anomaly);
    if (
      !isLongRunAnomalyStatus(anomaly.status)
      || !isLongRunAnomalyStatus(anomaly.worldGateStatus)
      || anomaly.threshold.length === 0
    ) {
      throw new Error(`Long-run anomaly shape is invalid: ${anomaly.key}`);
    }
    if (
      anomaly.semanticClass !== projected.semanticClass
      || anomaly.worldGateStatus !== projected.worldGateStatus
    ) {
      throw new Error(`Long-run anomaly semantics are inconsistent: ${anomaly.key}`);
    }
    if (
      anomaly.value !== "unavailable"
      && !Number.isFinite(anomaly.value)
    ) {
      throw new Error(`Long-run anomaly value is invalid: ${anomaly.key}`);
    }
  }
  if (
    summary.rawAnomalyStatus
      !== worstLongRunAnomalyStatus(summary.anomalyChecks.map(({ status }) => status))
    || summary.worldGateAnomalyStatus
      !== worstLongRunAnomalyStatus(
        summary.anomalyChecks.map(({ worldGateStatus }) => worldGateStatus),
      )
  ) {
    throw new Error("Long-run anomaly aggregate status is inconsistent");
  }
}

function validateStructuralExamples(
  summary: PlayerDevelopmentCohortWorldSummary,
): void {
  validateStructuralExampleRows(summary.structuralViolationExamples);
  for (const example of summary.structuralViolationExamples) {
    if (example.worldId !== summary.worldId) {
      throw new Error("Player-development structural example has the wrong world");
    }
  }
}

function validateStructuralExampleRows(
  examples: readonly PlayerDevelopmentStructuralViolationExample[],
): void {
  const checkpoints = [
    "opening",
    "closing",
    "trajectory",
    "participation",
  ] as const;
  const kinds = [
    "duplicate_identity",
    "duplicate_observation_id",
    "exact_projection_order",
    "rating_projection_order",
    "stored_ceiling_breach",
  ] as const;
  for (const example of examples) {
    assertExactObjectKeys(example, [
      "worldId",
      "checkpoint",
      "playerId",
      "kind",
    ], "player-development structural example");
    if (
      example.worldId.length === 0
      || example.playerId.length === 0
      || !checkpoints.includes(example.checkpoint)
      || !kinds.includes(example.kind)
    ) {
      throw new Error("Player-development structural example is malformed");
    }
  }
}

function validateExactGapSummary(
  summary: PlayerDevelopmentExactGapSummary,
  expectedCount: number,
  label: string,
): void {
  validateNumericSummary(summary, label, ["buckets"]);
  if (summary.observationCount !== expectedCount) {
    throw new Error(`${label} denominator is inconsistent`);
  }
  validateCountRecord(
    PLAYER_DEVELOPMENT_ABILITY_GAP_BUCKETS,
    summary.buckets,
    expectedCount,
    `${label} buckets`,
  );
}

function validateNumericSummary(
  summary: PlayerDevelopmentNumericSummary,
  label: string,
  additionalKeys: readonly string[] = [],
): void {
  assertExactObjectKeys(summary, [
    "observationCount",
    "sum",
    "minimum",
    "maximum",
    ...additionalKeys,
  ], label);
  assertCount(summary.observationCount, `${label} observations`);
  if (!Number.isFinite(summary.sum)) {
    throw new Error(`${label} sum is not finite`);
  }
  if (summary.observationCount === 0) {
    if (summary.sum !== 0 || summary.minimum !== null || summary.maximum !== null) {
      throw new Error(`${label} empty summary is inconsistent`);
    }
    return;
  }
  if (
    summary.minimum === null
    || summary.maximum === null
    || !Number.isFinite(summary.minimum)
    || !Number.isFinite(summary.maximum)
    || summary.minimum > summary.maximum
  ) {
    throw new Error(`${label} bounds are inconsistent`);
  }
  const minimumPossibleSum = summary.minimum * summary.observationCount;
  const maximumPossibleSum = summary.maximum * summary.observationCount;
  const tolerance = Number.EPSILON * Math.max(
    1,
    Math.abs(summary.sum),
    Math.abs(minimumPossibleSum),
    Math.abs(maximumPossibleSum),
  ) * summary.observationCount;
  if (
    summary.sum < minimumPossibleSum - tolerance
    || summary.sum > maximumPossibleSum + tolerance
  ) {
    throw new Error(`${label} sum falls outside its reported bounds`);
  }
}

function validateCountRecord<Key extends PropertyKey>(
  keys: readonly Key[],
  record: Readonly<Record<Key, number>>,
  expectedTotal: number,
  label: string,
): void {
  const actualKeys = Reflect.ownKeys(record);
  const expectedKeyNames = new Set(keys.map(String));
  if (
    actualKeys.length !== keys.length
    || actualKeys.some(
      (key) => typeof key !== "string" || !expectedKeyNames.has(key),
    )
  ) {
    throw new Error(`${label} has an invalid fixed-key shape`);
  }
  for (const key of keys) assertCount(record[key], `${label}.${String(key)}`);
  if (sumRecord(keys, record) !== expectedTotal) {
    throw new Error(`${label} does not match its denominator`);
  }
}

function sumRecord<Key extends PropertyKey>(
  keys: readonly Key[],
  record: Readonly<Record<Key, number>>,
): number {
  return keys.reduce((sum, key) => sum + record[key], 0);
}

function assertCount(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }
}

function assertExactObjectKeys(
  value: object,
  expectedKeys: readonly string[],
  label: string,
): void {
  const actualKeys = Reflect.ownKeys(value);
  if (
    actualKeys.length !== expectedKeys.length
    || actualKeys.some(
      (key) => typeof key !== "string" || !expectedKeys.includes(key),
    )
  ) {
    throw new Error(`${label} has an invalid exact-key shape`);
  }
}

function isLongRunAnomalyStatus(value: unknown): value is LongRunAnomalyStatus {
  return value === "pass" || value === "warn" || value === "fail";
}

function minimumNullable(left: number | null, right: number | null): number | null {
  if (left === null) return right;
  if (right === null) return left;
  return Math.min(left, right);
}

function maximumNullable(left: number | null, right: number | null): number | null {
  if (left === null) return right;
  if (right === null) return left;
  return Math.max(left, right);
}
