/**
 * Calibration metric keys mirrored as content data.
 */
export type ContentCalibrationMetricKey =
  | "away_win_rate"
  | "draw_rate"
  | "first_place_points"
  | "goals_per_match"
  | "home_win_rate"
  | "last_place_points"
  | "table_points_spread"
  | "upset_rate";

/**
 * Hand-authored aggregate calibration target.
 *
 * These values are intentionally broad early smoke targets, not final football
 * calibration. They avoid real databases and only catch obvious drift.
 */
export interface ContentCalibrationTarget {
  /** Metric this target applies to. */
  readonly metric: ContentCalibrationMetricKey;
  /** Human-readable target label. */
  readonly label: string;
  /** Inclusive lower acceptable bound. */
  readonly minInclusive: number;
  /** Inclusive upper acceptable bound. */
  readonly maxInclusive: number;
}

/**
 * Default broad aggregate targets for the generated fake league.
 */
export const defaultSeasonCalibrationTargets: readonly ContentCalibrationTarget[] = [
  {
    metric: "goals_per_match",
    label: "Goals per match",
    minInclusive: 1.0,
    maxInclusive: 4.0,
  },
  {
    metric: "home_win_rate",
    label: "Home win rate",
    minInclusive: 0.2,
    maxInclusive: 0.65,
  },
  {
    metric: "draw_rate",
    label: "Draw rate",
    minInclusive: 0.1,
    maxInclusive: 0.6,
  },
  {
    metric: "away_win_rate",
    label: "Away win rate",
    minInclusive: 0.1,
    maxInclusive: 0.55,
  },
  {
    metric: "first_place_points",
    label: "First-place points",
    minInclusive: 40,
    maxInclusive: 90,
  },
  {
    metric: "last_place_points",
    label: "Last-place points",
    minInclusive: 5,
    maxInclusive: 50,
  },
  {
    metric: "table_points_spread",
    label: "Table points spread",
    minInclusive: 15,
    maxInclusive: 80,
  },
  {
    metric: "upset_rate",
    label: "Upset proxy rate",
    minInclusive: 0.02,
    maxInclusive: 0.6,
  },
];

/**
 * Stricter football-like aggregate targets for the first calibration loop.
 *
 * This profile is expected to expose the current under-scoring and draw-heavy
 * engine before rate tuning. It should not replace the broad default smoke
 * profile.
 */
export const calibrationV1SeasonCalibrationTargets: readonly ContentCalibrationTarget[] = [
  {
    metric: "goals_per_match",
    label: "Goals per match",
    minInclusive: 2.0,
    maxInclusive: 3.2,
  },
  {
    metric: "home_win_rate",
    label: "Home win rate",
    minInclusive: 0.33,
    maxInclusive: 0.55,
  },
  {
    metric: "draw_rate",
    label: "Draw rate",
    minInclusive: 0.18,
    maxInclusive: 0.33,
  },
  {
    metric: "away_win_rate",
    label: "Away win rate",
    minInclusive: 0.17,
    maxInclusive: 0.38,
  },
  {
    metric: "first_place_points",
    label: "First-place points",
    minInclusive: 66,
    maxInclusive: 90,
  },
  {
    metric: "last_place_points",
    label: "Last-place points",
    minInclusive: 15,
    maxInclusive: 38,
  },
  {
    metric: "table_points_spread",
    label: "Table points spread",
    minInclusive: 36,
    maxInclusive: 60,
  },
  {
    metric: "upset_rate",
    label: "Upset proxy rate",
    minInclusive: 0.15,
    maxInclusive: 0.45,
  },
];

/**
 * Intentionally impossible target profile used to smoke-test strict failures.
 */
export const strictFailureSmokeTargets: readonly ContentCalibrationTarget[] = [
  {
    metric: "goals_per_match",
    label: "Goals per match",
    minInclusive: 99,
    maxInclusive: 100,
  },
];
