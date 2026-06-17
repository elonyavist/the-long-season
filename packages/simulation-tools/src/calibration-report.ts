import type { ClubId, Fixture, LeagueTableRow } from "@game/domain";
import { simulateSeason, type SimulateSeasonInput, type SimulateSeasonResult } from "@game/engine";

/**
 * Aggregate metric keys emitted by the first season calibration report.
 */
export type CalibrationMetricKey =
  | "away_win_rate"
  | "draw_rate"
  | "first_place_points"
  | "goals_per_match"
  | "home_win_rate"
  | "last_place_points"
  | "table_points_spread"
  | "upset_rate";

/**
 * One hand-authored acceptable value band for an aggregate metric.
 */
export interface CalibrationTarget {
  /** Metric this target applies to. */
  readonly metric: CalibrationMetricKey;
  /** Human-readable target label. */
  readonly label: string;
  /** Inclusive lower acceptable bound. */
  readonly minInclusive: number;
  /** Inclusive upper acceptable bound. */
  readonly maxInclusive: number;
}

/**
 * One reported metric with optional target evaluation.
 */
export interface CalibrationMetricResult {
  /** Metric key. */
  readonly metric: CalibrationMetricKey;
  /** Human-readable metric label. */
  readonly label: string;
  /** Observed aggregate value. */
  readonly value: number;
  /** Target band, if one was supplied. */
  readonly target: CalibrationTarget | undefined;
  /** Whether the metric is inside its target band. */
  readonly status: "fail" | "pass";
}

/**
 * Summary for one simulated season in a batch.
 */
export interface CalibrationSeasonSummary {
  /** Seed used for the simulated season. */
  readonly seed: string;
  /** Number of completed fixtures. */
  readonly matchCount: number;
  /** Final champion row. */
  readonly firstPlace: LeagueTableRow;
  /** Final bottom row. */
  readonly lastPlace: LeagueTableRow;
}

/**
 * Complete aggregate balance report.
 */
export interface CalibrationReport {
  /** Seed prefix used to derive each season seed. */
  readonly seedPrefix: string;
  /** Number of simulated seasons. */
  readonly seasonCount: number;
  /** Per-season summaries. */
  readonly seasons: readonly CalibrationSeasonSummary[];
  /** Aggregate metric results. */
  readonly metrics: readonly CalibrationMetricResult[];
  /** Overall target status. */
  readonly status: "fail" | "pass";
}

/**
 * Input for deterministic calibration report generation.
 */
export interface CreateCalibrationReportInput {
  /** Prefix used to derive deterministic season seeds. */
  readonly seedPrefix: string;
  /** Number of seasons to simulate. */
  readonly seasonCount: number;
  /** Hand-authored target bands to evaluate. */
  readonly targets: readonly CalibrationTarget[];
  /** Factory that builds one season simulation input for a seed. */
  readonly createSeasonInput: (seed: string, seasonIndex: number) => SimulateSeasonInput;
}

/**
 * Creates a deterministic aggregate calibration report over N seasons.
 *
 * @example
 * const report = createCalibrationReport(input);
 */
export function createCalibrationReport(input: CreateCalibrationReportInput): CalibrationReport {
  assertValidBatchInput(input);

  const totals = emptyTotals();
  const seasons: CalibrationSeasonSummary[] = [];

  for (let seasonIndex = 0; seasonIndex < input.seasonCount; seasonIndex += 1) {
    const seed = seasonSeed(input.seedPrefix, seasonIndex);
    const seasonInput = input.createSeasonInput(seed, seasonIndex);
    const result = simulateSeason(seasonInput);
    const summary = summarizeSeason(seed, result);

    accumulateSeasonTotals(totals, seasonInput, result);
    seasons.push(summary);
  }

  const metrics = metricResultsFromTotals(totals, input.seasonCount, input.targets);

  return {
    seedPrefix: input.seedPrefix,
    seasonCount: input.seasonCount,
    seasons,
    metrics,
    status: reportStatus(metrics),
  };
}

/**
 * Builds a stable season seed from prefix and zero-based index.
 */
export function seasonSeed(seedPrefix: string, seasonIndex: number): string {
  return `${seedPrefix}-${String(seasonIndex + 1).padStart(3, "0")}`;
}

/**
 * Validates the batch dimensions.
 */
function assertValidBatchInput(input: CreateCalibrationReportInput): void {
  if (input.seedPrefix.length === 0) {
    throw new Error("Calibration seedPrefix must not be empty");
  }

  if (!Number.isSafeInteger(input.seasonCount) || input.seasonCount <= 0) {
    throw new Error(`Calibration seasonCount must be a positive safe integer: ${input.seasonCount}`);
  }
}

/**
 * Creates zeroed aggregate totals.
 */
function emptyTotals(): CalibrationTotals {
  return {
    matchCount: 0,
    goalCount: 0,
    homeWins: 0,
    draws: 0,
    awayWins: 0,
    firstPlacePointsTotal: 0,
    lastPlacePointsTotal: 0,
    tablePointsSpreadTotal: 0,
    upsetMatches: 0,
    upsetEligibleMatches: 0,
  };
}

/**
 * Summarizes one simulated season.
 */
function summarizeSeason(seed: string, result: SimulateSeasonResult): CalibrationSeasonSummary {
  const firstPlace = result.table[0];
  const lastPlace = result.table[result.table.length - 1];

  if (firstPlace === undefined || lastPlace === undefined) {
    throw new Error(`Cannot summarize an empty season table for seed ${seed}`);
  }

  return {
    seed,
    matchCount: result.fixtureIds.length,
    firstPlace,
    lastPlace,
  };
}

/**
 * Adds one season's fixtures and table to aggregate totals.
 */
function accumulateSeasonTotals(
  totals: CalibrationTotals,
  input: SimulateSeasonInput,
  result: SimulateSeasonResult,
): void {
  const firstPlace = result.table[0];
  const lastPlace = result.table[result.table.length - 1];

  if (firstPlace === undefined || lastPlace === undefined) {
    throw new Error("Cannot accumulate an empty season table");
  }

  totals.firstPlacePointsTotal += firstPlace.points;
  totals.lastPlacePointsTotal += lastPlace.points;
  totals.tablePointsSpreadTotal += firstPlace.points - lastPlace.points;

  for (const fixture of result.fixtures) {
    accumulateFixtureTotals(totals, input, fixture);
  }
}

/**
 * Adds one played fixture to aggregate totals.
 */
function accumulateFixtureTotals(totals: CalibrationTotals, input: SimulateSeasonInput, fixture: Fixture): void {
  const result = fixture.result;

  if (result === undefined) {
    return;
  }

  totals.matchCount += 1;
  totals.goalCount += result.homeGoals + result.awayGoals;

  if (result.homeGoals > result.awayGoals) {
    totals.homeWins += 1;
    accumulateUpset(totals, input, fixture.homeClubId, fixture.awayClubId, "home");
    return;
  }

  if (result.awayGoals > result.homeGoals) {
    totals.awayWins += 1;
    accumulateUpset(totals, input, fixture.homeClubId, fixture.awayClubId, "away");
    return;
  }

  totals.draws += 1;
}

/**
 * Adds one decisive result to the upset proxy.
 */
function accumulateUpset(
  totals: CalibrationTotals,
  input: SimulateSeasonInput,
  homeClubId: ClubId,
  awayClubId: ClubId,
  winner: "away" | "home",
): void {
  const homeStrength = input.teamsByClubId[homeClubId]?.strength.overall;
  const awayStrength = input.teamsByClubId[awayClubId]?.strength.overall;

  if (homeStrength === undefined || awayStrength === undefined || homeStrength === awayStrength) {
    return;
  }

  totals.upsetEligibleMatches += 1;

  if ((winner === "home" && homeStrength < awayStrength) || (winner === "away" && awayStrength < homeStrength)) {
    totals.upsetMatches += 1;
  }
}

/**
 * Converts aggregate totals into ordered metric results.
 */
function metricResultsFromTotals(
  totals: CalibrationTotals,
  seasonCount: number,
  targets: readonly CalibrationTarget[],
): readonly CalibrationMetricResult[] {
  const matchCount = totals.matchCount;
  const values: readonly MetricValue[] = [
    {
      metric: "goals_per_match",
      label: "Goals per match",
      value: safeDivide(totals.goalCount, matchCount),
    },
    {
      metric: "home_win_rate",
      label: "Home win rate",
      value: safeDivide(totals.homeWins, matchCount),
    },
    {
      metric: "draw_rate",
      label: "Draw rate",
      value: safeDivide(totals.draws, matchCount),
    },
    {
      metric: "away_win_rate",
      label: "Away win rate",
      value: safeDivide(totals.awayWins, matchCount),
    },
    {
      metric: "first_place_points",
      label: "First-place points",
      value: safeDivide(totals.firstPlacePointsTotal, seasonCount),
    },
    {
      metric: "last_place_points",
      label: "Last-place points",
      value: safeDivide(totals.lastPlacePointsTotal, seasonCount),
    },
    {
      metric: "table_points_spread",
      label: "Table points spread",
      value: safeDivide(totals.tablePointsSpreadTotal, seasonCount),
    },
    {
      metric: "upset_rate",
      label: "Upset proxy rate",
      value: safeDivide(totals.upsetMatches, totals.upsetEligibleMatches),
    },
  ];
  const results: CalibrationMetricResult[] = [];

  for (const value of values) {
    results.push(metricResult(value, findTarget(targets, value.metric)));
  }

  return results;
}

/**
 * Creates one metric result from a value and optional target.
 */
function metricResult(value: MetricValue, target: CalibrationTarget | undefined): CalibrationMetricResult {
  return {
    metric: value.metric,
    label: value.label,
    value: value.value,
    target,
    status:
      target === undefined || (value.value >= target.minInclusive && value.value <= target.maxInclusive)
        ? "pass"
        : "fail",
  };
}

/**
 * Finds the target for one metric.
 */
function findTarget(
  targets: readonly CalibrationTarget[],
  metric: CalibrationMetricKey,
): CalibrationTarget | undefined {
  for (const target of targets) {
    if (target.metric === metric) {
      return target;
    }
  }

  return undefined;
}

/**
 * Derives the overall report status from metric results.
 */
function reportStatus(metrics: readonly CalibrationMetricResult[]): "fail" | "pass" {
  for (const metric of metrics) {
    if (metric.status === "fail") {
      return "fail";
    }
  }

  return "pass";
}

/**
 * Divides two numbers while keeping zero-denominator metrics deterministic.
 */
function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Mutable aggregate counters for a batch.
 */
interface CalibrationTotals {
  matchCount: number;
  goalCount: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  firstPlacePointsTotal: number;
  lastPlacePointsTotal: number;
  tablePointsSpreadTotal: number;
  upsetMatches: number;
  upsetEligibleMatches: number;
}

/**
 * Internal metric value before target evaluation.
 */
interface MetricValue {
  readonly metric: CalibrationMetricKey;
  readonly label: string;
  readonly value: number;
}
