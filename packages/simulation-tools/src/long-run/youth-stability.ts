import type { LongRunAnomalyStatus } from "./anomaly-scoring.ts";

/** One season row used to measure youth-academy population health. */
export interface LongRunYouthSeasonRow {
  /** Simulated season number. */
  readonly seasonNumber: number;
  /** Total active senior players after refresh. */
  readonly seniorPlayerCount: number;
  /** Total active academy players after refresh. */
  readonly youthPlayerCount: number;
  /** Total active senior plus academy players after refresh. */
  readonly activePlayerCount: number;
  /** Smallest active academy roster size after refresh. */
  readonly minimumYouthRosterSize: number;
  /** Average active academy roster size after refresh. */
  readonly averageYouthRosterSize: number;
  /** Largest active academy roster size after refresh. */
  readonly maximumYouthRosterSize: number;
  /** Accepted youth intake players this season. */
  readonly youthIntakeCount: number;
  /** Youth players that left active academy rosters this season. */
  readonly youthExitCount: number;
  /** Youth players promoted into senior squads this season. */
  readonly youthPromotionCount: number;
  /** Active academy roster size for the selected club. */
  readonly selectedClubYouthSize: number;
  /** Clubs above the youth roster target after refresh. */
  readonly clubsAboveYouthTarget: number;
  /** Clubs below the youth roster minimum after refresh. */
  readonly clubsBelowYouthMinimum: number;
}

/** One machine-readable youth population check. */
export interface LongRunYouthStabilityCheck {
  /** Stable check key for CLI output and audit documents. */
  readonly key: string;
  /** PASS/WARN/FAIL status. */
  readonly status: LongRunAnomalyStatus;
  /** Numeric value that triggered the check. */
  readonly value: number;
  /** Human-readable threshold note owned by simulation tooling. */
  readonly threshold: string;
}

/** Aggregate youth-academy stability report for one long-run simulation. */
export interface LongRunYouthStabilityReport {
  /** Overall status, worst of all youth checks. */
  readonly status: LongRunAnomalyStatus;
  /** Smallest active academy roster size observed. */
  readonly minimumYouthRosterSizeObserved: number;
  /** Average active academy roster size observed. */
  readonly averageYouthRosterSizeObserved: number;
  /** Largest active academy roster size observed. */
  readonly maximumYouthRosterSizeObserved: number;
  /** Smallest total active player count observed. */
  readonly minimumActivePlayerCountObserved: number;
  /** Average total active player count observed. */
  readonly averageActivePlayerCountObserved: number;
  /** Largest total active player count observed. */
  readonly maximumActivePlayerCountObserved: number;
  /** Total accepted youth intake players across the run. */
  readonly youthIntakeCount: number;
  /** Total youth exits from active academy rosters across the run. */
  readonly youthExitCount: number;
  /** Total academy promotions into senior squads across the run. */
  readonly youthPromotionCount: number;
  /** Smallest selected-club youth roster size observed. */
  readonly selectedClubYouthMinimumSize: number;
  /** Average selected-club youth roster size observed. */
  readonly selectedClubYouthAverageSize: number;
  /** Largest selected-club youth roster size observed. */
  readonly selectedClubYouthMaximumSize: number;
  /** Total club-season observations above the youth target cap. */
  readonly clubsAboveYouthTargetCount: number;
  /** Total club-season observations below the youth minimum. */
  readonly clubsBelowYouthMinimumCount: number;
  /** Ordered machine-readable checks. */
  readonly checks: readonly LongRunYouthStabilityCheck[];
  /** Original season rows for report rendering and future scoring. */
  readonly seasons: readonly LongRunYouthSeasonRow[];
}

/** Optional thresholds used by youth stability scoring. */
export interface CreateLongRunYouthStabilityReportOptions {
  /** Maximum active youth players allowed in one club academy. */
  readonly youthRosterTargetMaximum?: number;
  /** Minimum active youth players expected in one club academy. */
  readonly youthRosterMinimum?: number;
  /** Lower bound for total active players in an 18-club, 23-senior plus 8-youth setup. */
  readonly activePlayerMinimum?: number;
  /** Upper bound for total active players in an 18-club, 25-senior plus 12-youth setup. */
  readonly activePlayerMaximum?: number;
}

const DEFAULT_YOUTH_ROSTER_TARGET_MAXIMUM = 11;
const DEFAULT_YOUTH_ROSTER_MINIMUM = 11;
const DEFAULT_ACTIVE_PLAYER_MINIMUM = 612;
const DEFAULT_ACTIVE_PLAYER_MAXIMUM = 648;

/**
 * Creates aggregate youth-academy population metrics and anomaly checks.
 *
 * The checks are intentionally about population health only. They do not tune
 * development, transfers, or match balance.
 */
export function createLongRunYouthStabilityReport(
  seasons: readonly LongRunYouthSeasonRow[],
  options: CreateLongRunYouthStabilityReportOptions = {},
): LongRunYouthStabilityReport {
  const youthRosterTargetMaximum = options.youthRosterTargetMaximum ?? DEFAULT_YOUTH_ROSTER_TARGET_MAXIMUM;
  const youthRosterMinimum = options.youthRosterMinimum ?? DEFAULT_YOUTH_ROSTER_MINIMUM;
  const activePlayerMinimum = options.activePlayerMinimum ?? DEFAULT_ACTIVE_PLAYER_MINIMUM;
  const activePlayerMaximum = options.activePlayerMaximum ?? DEFAULT_ACTIVE_PLAYER_MAXIMUM;
  const checks = youthStabilityChecks(seasons, {
    youthRosterTargetMaximum,
    youthRosterMinimum,
    activePlayerMinimum,
    activePlayerMaximum,
  });

  return {
    status: worstStatus(checks),
    minimumYouthRosterSizeObserved: Math.min(...seasons.map((season) => season.minimumYouthRosterSize)),
    averageYouthRosterSizeObserved: roundMetric(average(seasons.map((season) => season.averageYouthRosterSize))),
    maximumYouthRosterSizeObserved: Math.max(...seasons.map((season) => season.maximumYouthRosterSize)),
    minimumActivePlayerCountObserved: Math.min(...seasons.map((season) => season.activePlayerCount)),
    averageActivePlayerCountObserved: roundMetric(average(seasons.map((season) => season.activePlayerCount))),
    maximumActivePlayerCountObserved: Math.max(...seasons.map((season) => season.activePlayerCount)),
    youthIntakeCount: seasons.reduce((sum, season) => sum + season.youthIntakeCount, 0),
    youthExitCount: seasons.reduce((sum, season) => sum + season.youthExitCount, 0),
    youthPromotionCount: seasons.reduce((sum, season) => sum + season.youthPromotionCount, 0),
    selectedClubYouthMinimumSize: Math.min(...seasons.map((season) => season.selectedClubYouthSize)),
    selectedClubYouthAverageSize: roundMetric(average(seasons.map((season) => season.selectedClubYouthSize))),
    selectedClubYouthMaximumSize: Math.max(...seasons.map((season) => season.selectedClubYouthSize)),
    clubsAboveYouthTargetCount: seasons.reduce((sum, season) => sum + season.clubsAboveYouthTarget, 0),
    clubsBelowYouthMinimumCount: seasons.reduce((sum, season) => sum + season.clubsBelowYouthMinimum, 0),
    checks,
    seasons,
  };
}

function youthStabilityChecks(
  seasons: readonly LongRunYouthSeasonRow[],
  thresholds: Required<CreateLongRunYouthStabilityReportOptions>,
): readonly LongRunYouthStabilityCheck[] {
  const maximumYouthRosterSize = Math.max(...seasons.map((season) => season.maximumYouthRosterSize));
  const clubsAboveYouthTarget = seasons.reduce((sum, season) => sum + season.clubsAboveYouthTarget, 0);
  const minimumYouthRosterSize = Math.min(...seasons.map((season) => season.minimumYouthRosterSize));
  const clubsBelowYouthMinimum = seasons.reduce((sum, season) => sum + season.clubsBelowYouthMinimum, 0);
  const minimumActivePlayerCount = Math.min(...seasons.map((season) => season.activePlayerCount));
  const maximumActivePlayerCount = Math.max(...seasons.map((season) => season.activePlayerCount));

  return [
    check("youth_roster_max_size", maximumYouthRosterSize, `pass <=${thresholds.youthRosterTargetMaximum}; fail above`, () =>
      maximumYouthRosterSize > thresholds.youthRosterTargetMaximum ? "fail" : "pass",
    ),
    check("clubs_above_youth_target", clubsAboveYouthTarget, "pass 0; fail >0", () =>
      clubsAboveYouthTarget > 0 ? "fail" : "pass",
    ),
    check("youth_roster_min_size", minimumYouthRosterSize, `pass >=${thresholds.youthRosterMinimum}; fail below`, () =>
      minimumYouthRosterSize < thresholds.youthRosterMinimum ? "fail" : "pass",
    ),
    check("clubs_below_youth_minimum", clubsBelowYouthMinimum, "pass 0; fail >0", () =>
      clubsBelowYouthMinimum > 0 ? "fail" : "pass",
    ),
    check(
      "active_player_population",
      maximumActivePlayerCount,
      `pass ${thresholds.activePlayerMinimum}..${thresholds.activePlayerMaximum}; warn outside`,
      () => (minimumActivePlayerCount < thresholds.activePlayerMinimum || maximumActivePlayerCount > thresholds.activePlayerMaximum ? "warn" : "pass"),
    ),
  ];
}

function check(
  key: string,
  value: number,
  threshold: string,
  status: () => LongRunAnomalyStatus,
): LongRunYouthStabilityCheck {
  return {
    key,
    value,
    threshold,
    status: status(),
  };
}

function worstStatus(checks: readonly LongRunYouthStabilityCheck[]): LongRunAnomalyStatus {
  if (checks.some((row) => row.status === "fail")) {
    return "fail";
  }

  if (checks.some((row) => row.status === "warn")) {
    return "warn";
  }

  return "pass";
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}
