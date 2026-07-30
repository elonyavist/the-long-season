import {
  isPlayerStarRating,
  PLAYER_STAR_RATINGS,
  type ClubCategory,
  type MoneyPercentileDistribution,
  type PlayerMarketDivisionBaseline,
  type PlayerMarketDivisionTarget,
  type PlayerEconomyCalibrationVersionBundle,
  type PlayerStarRating,
} from "@game/domain";

const divisions: readonly ClubCategory[] = [
  "first_division",
  "second_division",
  "third_division",
];

/** Population slice used to distinguish stock, intake, and year-ten diagnostics. */
export type PlayerMarketCalibrationPopulation =
  | "initial_starter"
  | "initial_reserve"
  | "initial_youth"
  | "annual_intake"
  | "active_year_ten";

/** One caller-supplied player observation used by the read-only diagnostic. */
export interface PlayerMarketCalibrationObservation {
  readonly division: ClubCategory;
  readonly currentRating: PlayerStarRating;
  readonly potentialRating: PlayerStarRating;
  readonly publicValueMinorUnits: number;
  readonly population: PlayerMarketCalibrationPopulation;
  readonly sourceLabel: string;
}

/** One generated club value normalized to the source comparator's 22 seniors. */
export interface PlayerMarketClubSquadObservation {
  readonly division: ClubCategory;
  readonly activeSeniorCount: 22;
  readonly publicSquadValueMinorUnits: number;
  readonly sourceLabel: string;
}

/** Reproducibility metadata supplied by the composition root. */
export interface PlayerMarketCalibrationSampleMetadata {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly projectionMethod: string;
}

/** Counts on every supported half-star value, including zero-count buckets. */
export type PlayerRatingHistogram = Readonly<Record<PlayerStarRating, number>>;

/** Distribution and rarity summary for one division. */
export interface PlayerMarketDivisionDiagnostic {
  readonly division: ClubCategory;
  readonly sampleSize: number;
  readonly valueDistribution: MoneyPercentileDistribution;
  readonly currentRatingHistogram: PlayerRatingHistogram;
  readonly potentialRatingHistogram: PlayerRatingHistogram;
  readonly currentFiveAndHalfOrHigherCount: number;
  readonly currentSixCount: number;
  readonly potentialSixCount: number;
  readonly valueFit: PlayerMarketDivisionValueFit;
  readonly normalized22SquadComparator: PlayerMarketSquadComparator;
}

/** One percentile comparison against a versioned design target. */
export interface PlayerMarketValueFitCheck {
  readonly metric: "median" | "p90" | "p99" | "maximum";
  readonly actualMinorUnits: number;
  readonly targetMinorUnits: number;
  readonly deviationBasisPoints: number;
  readonly status: "pass" | "fail";
}

/** Aggregate fit status for one division's public player values. */
export interface PlayerMarketDivisionValueFit {
  readonly observationCount: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly status: "pass" | "fail";
  readonly checks: readonly PlayerMarketValueFitCheck[];
}

/** Generated 22-player squad values compared only with the normalized source fact. */
export interface PlayerMarketSquadComparator {
  readonly comparatorKind: "normalized_22_active_seniors";
  readonly sampleSize: number;
  readonly generatedMeanMinorUnits: number;
  readonly sourceComparatorMinorUnits: number;
  readonly deviationBasisPoints: number;
}

/** Rating and rarity summary for one explicitly named population slice. */
export interface PlayerMarketPopulationDiagnostic {
  readonly population: PlayerMarketCalibrationPopulation;
  readonly sampleSize: number;
  readonly currentRatingHistogram: PlayerRatingHistogram;
  readonly potentialRatingHistogram: PlayerRatingHistogram;
  readonly currentSixCount: number;
  readonly potentialSixCount: number;
}

/** Pure diagnostic output for one supplied population. */
export interface PlayerMarketCalibrationReport {
  readonly versions: PlayerEconomyCalibrationVersionBundle;
  readonly metadata: PlayerMarketCalibrationSampleMetadata;
  readonly sampleSize: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly fitStatus: "pass" | "fail";
  readonly percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest minor unit";
  readonly sourceLabelCounts: Readonly<Record<string, number>>;
  readonly divisions: readonly PlayerMarketDivisionDiagnostic[];
  readonly populations: readonly PlayerMarketPopulationDiagnostic[];
}

/** Inputs to the pure player-market diagnostic. */
export interface CreatePlayerMarketCalibrationReportInput {
  readonly versions: PlayerEconomyCalibrationVersionBundle;
  readonly metadata: PlayerMarketCalibrationSampleMetadata;
  readonly observations: readonly PlayerMarketCalibrationObservation[];
  readonly clubSquadObservations: readonly PlayerMarketClubSquadObservation[];
  readonly targets: readonly PlayerMarketDivisionTarget[];
  readonly divisionBaselines: readonly PlayerMarketDivisionBaseline[];
}

/**
 * Summarizes supplied market populations without importing content or changing gameplay.
 *
 * Empty divisions remain present with zero-valued distributions so repeated
 * reports have a stable three-tier shape.
 */
export function createPlayerMarketCalibrationReport(
  input: CreatePlayerMarketCalibrationReportInput,
): PlayerMarketCalibrationReport {
  validateInput(input);

  const divisionDiagnostics = divisions.map((division) =>
    summarizeDivision(
      division,
      input.observations.filter((observation) => observation.division === division),
      input.clubSquadObservations.filter((observation) => observation.division === division),
      requiredDivisionEntry(input.targets, division, "target"),
      requiredDivisionEntry(input.divisionBaselines, division, "baseline"),
    ),
  );
  return {
    versions: { ...input.versions },
    metadata: { ...input.metadata },
    sampleSize: input.observations.length,
    evaluationStatus:
      input.observations.length === 0 ? "not_evaluated" : "evaluated",
    fitStatus: divisionDiagnostics.every(({ valueFit }) => valueFit.status === "pass")
      ? "pass"
      : "fail",
    percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest minor unit",
    sourceLabelCounts: countSourceLabels(input.observations),
    divisions: divisionDiagnostics,
    populations: populationOrder(input.observations).map((population) =>
      summarizePopulation(
        population,
        input.observations.filter((observation) => observation.population === population),
      ),
    ),
  };
}

function summarizeDivision(
  division: ClubCategory,
  observations: readonly PlayerMarketCalibrationObservation[],
  clubSquadObservations: readonly PlayerMarketClubSquadObservation[],
  target: PlayerMarketDivisionTarget,
  baseline: PlayerMarketDivisionBaseline,
): PlayerMarketDivisionDiagnostic {
  const values = observations.map((observation) => observation.publicValueMinorUnits).sort((a, b) => a - b);
  const valueDistribution = {
    medianMinorUnits: percentileTypeSeven(values, 0.5),
    p90MinorUnits: percentileTypeSeven(values, 0.9),
    p99MinorUnits: percentileTypeSeven(values, 0.99),
    maximumMinorUnits: values.at(-1) ?? 0,
  };

  return {
    division,
    sampleSize: observations.length,
    valueDistribution,
    currentRatingHistogram: ratingHistogram(observations.map((observation) => observation.currentRating)),
    potentialRatingHistogram: ratingHistogram(observations.map((observation) => observation.potentialRating)),
    currentFiveAndHalfOrHigherCount: observations.filter((observation) => observation.currentRating >= 5.5).length,
    currentSixCount: observations.filter((observation) => observation.currentRating === 6).length,
    potentialSixCount: observations.filter((observation) => observation.potentialRating === 6).length,
    valueFit: valueFit(valueDistribution, target, observations.length),
    normalized22SquadComparator: squadComparator(
      clubSquadObservations,
      baseline.normalized22SeniorSquadValueMinorUnits,
    ),
  };
}

function valueFit(
  actual: MoneyPercentileDistribution,
  target: PlayerMarketDivisionTarget,
  observationCount: number,
): PlayerMarketDivisionValueFit {
  const checks: readonly PlayerMarketValueFitCheck[] = [
    toleranceCheck("median", actual.medianMinorUnits, target.distribution.medianMinorUnits, target.medianToleranceBasisPoints),
    toleranceCheck("p90", actual.p90MinorUnits, target.distribution.p90MinorUnits, target.p90ToleranceBasisPoints),
    toleranceCheck("p99", actual.p99MinorUnits, target.distribution.p99MinorUnits, target.p99ToleranceBasisPoints),
    {
      metric: "maximum",
      actualMinorUnits: actual.maximumMinorUnits,
      targetMinorUnits: target.distribution.maximumMinorUnits,
      deviationBasisPoints: deviationBasisPoints(actual.maximumMinorUnits, target.distribution.maximumMinorUnits),
      status:
        actual.maximumMinorUnits >= target.minimumMaximumMinorUnits
        && actual.maximumMinorUnits <= target.maximumMaximumMinorUnits
          ? "pass"
          : "fail",
    },
  ];
  return {
    observationCount,
    evaluationStatus: observationCount === 0 ? "not_evaluated" : "evaluated",
    status:
      observationCount > 0 && checks.every((check) => check.status === "pass")
        ? "pass"
        : "fail",
    checks: observationCount === 0
      ? checks.map((check) => ({ ...check, status: "fail" as const }))
      : checks,
  };
}

function toleranceCheck(
  metric: PlayerMarketValueFitCheck["metric"],
  actual: number,
  target: number,
  toleranceBasisPoints: number,
): PlayerMarketValueFitCheck {
  const minimum = Math.round(target * (10_000 - toleranceBasisPoints) / 10_000);
  const maximum = Math.round(target * (10_000 + toleranceBasisPoints) / 10_000);
  return {
    metric,
    actualMinorUnits: actual,
    targetMinorUnits: target,
    deviationBasisPoints: deviationBasisPoints(actual, target),
    status: actual >= minimum && actual <= maximum ? "pass" : "fail",
  };
}

function squadComparator(
  observations: readonly PlayerMarketClubSquadObservation[],
  sourceComparatorMinorUnits: number,
): PlayerMarketSquadComparator {
  const generatedMeanMinorUnits = observations.length === 0
    ? 0
    : Math.round(
        observations.reduce(
          (sum, observation) => sum + observation.publicSquadValueMinorUnits,
          0,
        ) / observations.length,
      );
  return {
    comparatorKind: "normalized_22_active_seniors",
    sampleSize: observations.length,
    generatedMeanMinorUnits,
    sourceComparatorMinorUnits,
    deviationBasisPoints: deviationBasisPoints(
      generatedMeanMinorUnits,
      sourceComparatorMinorUnits,
    ),
  };
}

function deviationBasisPoints(actual: number, target: number): number {
  return target === 0
    ? actual === 0 ? 0 : 10_000
    : Math.round(((actual - target) * 10_000) / target);
}

function requiredDivisionEntry<T extends { readonly division: ClubCategory }>(
  entries: readonly T[],
  division: ClubCategory,
  label: string,
): T {
  const entry = entries.find((candidate) => candidate.division === division);
  if (entry === undefined) {
    throw new Error(`Player-market diagnostic is missing ${division} ${label}`);
  }
  return entry;
}

function summarizePopulation(
  population: PlayerMarketCalibrationPopulation,
  observations: readonly PlayerMarketCalibrationObservation[],
): PlayerMarketPopulationDiagnostic {
  return {
    population,
    sampleSize: observations.length,
    currentRatingHistogram: ratingHistogram(observations.map((observation) => observation.currentRating)),
    potentialRatingHistogram: ratingHistogram(observations.map((observation) => observation.potentialRating)),
    currentSixCount: observations.filter((observation) => observation.currentRating === 6).length,
    potentialSixCount: observations.filter((observation) => observation.potentialRating === 6).length,
  };
}

function populationOrder(
  observations: readonly PlayerMarketCalibrationObservation[],
): readonly PlayerMarketCalibrationPopulation[] {
  const all: readonly PlayerMarketCalibrationPopulation[] = [
    "initial_starter",
    "initial_reserve",
    "initial_youth",
    "annual_intake",
    "active_year_ten",
  ];
  const observed = new Set(observations.map((observation) => observation.population));
  return all.filter((population) => observed.has(population));
}

function percentileTypeSeven(sortedValues: readonly number[], percentile: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  const rank = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const lower = sortedValues[lowerIndex];
  const upper = sortedValues[upperIndex];

  if (lower === undefined || upper === undefined) {
    throw new Error("Player-market percentile rank is outside the supplied population");
  }

  return Math.round(lower + ((upper - lower) * (rank - lowerIndex)));
}

function ratingHistogram(ratings: readonly PlayerStarRating[]): PlayerRatingHistogram {
  const histogram = Object.fromEntries(
    PLAYER_STAR_RATINGS.map((rating) => [rating, 0]),
  ) as Record<PlayerStarRating, number>;

  for (const rating of ratings) {
    histogram[rating] += 1;
  }

  return histogram;
}

function countSourceLabels(
  observations: readonly PlayerMarketCalibrationObservation[],
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const observation of observations) {
    counts[observation.sourceLabel] = (counts[observation.sourceLabel] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function validateInput(input: CreatePlayerMarketCalibrationReportInput): void {
  if (
    input.metadata.seedPrefix.length === 0
    || input.metadata.projectionMethod.length === 0
    || !Number.isSafeInteger(input.metadata.worldCount)
    || input.metadata.worldCount <= 0
  ) {
    throw new Error("Player-market diagnostic metadata must be complete and use a positive world count");
  }

  for (const observation of input.observations) {
    if (
      !divisions.includes(observation.division)
      || !isPlayerStarRating(observation.currentRating)
      || !isPlayerStarRating(observation.potentialRating)
      || !Number.isSafeInteger(observation.publicValueMinorUnits)
      || observation.publicValueMinorUnits < 0
      || !isPopulation(observation.population)
      || observation.sourceLabel.length === 0
    ) {
      throw new Error("Player-market diagnostic received an invalid observation");
    }
  }
  for (const observation of input.clubSquadObservations) {
    if (
      !divisions.includes(observation.division)
      || observation.activeSeniorCount !== 22
      || !Number.isSafeInteger(observation.publicSquadValueMinorUnits)
      || observation.publicSquadValueMinorUnits < 0
      || observation.sourceLabel.length === 0
    ) {
      throw new Error("Player-market diagnostic received an invalid club-squad observation");
    }
  }
  for (const division of divisions) {
    requiredDivisionEntry(input.targets, division, "target");
    requiredDivisionEntry(input.divisionBaselines, division, "baseline");
  }
}

function isPopulation(value: string): value is PlayerMarketCalibrationPopulation {
  return value === "initial_starter"
    || value === "initial_reserve"
    || value === "initial_youth"
    || value === "annual_intake"
    || value === "active_year_ten";
}
