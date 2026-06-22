import type { LongRunClubStabilityReport } from "./club-stability.ts";
import type { LongRunPlayerEvolutionReport } from "./player-evolution.ts";

/** Status assigned to one long-run anomaly check. */
export type LongRunAnomalyStatus = "pass" | "warn" | "fail";

/** Balance row used by long-run anomaly scoring. */
export interface LongRunBalanceSeasonRow {
  /** Goals per match for this season. */
  readonly goalsPerMatch: number;
  /** First-place points. */
  readonly firstPlacePoints: number;
  /** Last-place points. */
  readonly lastPlacePoints: number;
  /** First-place minus last-place points. */
  readonly tablePointsSpread: number;
}

/** One deterministic anomaly check. */
export interface LongRunAnomalyCheck {
  /** Stable check key for CLI output and future docs. */
  readonly key: string;
  /** PASS/WARN/FAIL status. */
  readonly status: LongRunAnomalyStatus;
  /** Numeric value that triggered the check. */
  readonly value: number | "unavailable";
  /** Human-readable threshold note owned by simulation tooling, not UI prose. */
  readonly threshold: string;
}

/** Input for long-run anomaly scoring. */
export interface CreateLongRunAnomalyReportInput {
  /** Season balance rows. */
  readonly balance: readonly LongRunBalanceSeasonRow[];
  /** Player-evolution report from the same run. */
  readonly playerEvolution: LongRunPlayerEvolutionReport;
  /** Club-stability report from the same run. */
  readonly clubStability: LongRunClubStabilityReport;
}

/** Aggregate anomaly report for a long-run simulation. */
export interface LongRunAnomalyReport {
  /** Overall status, worst of all checks. */
  readonly status: LongRunAnomalyStatus;
  /** Deterministic ordered checks. */
  readonly checks: readonly LongRunAnomalyCheck[];
}

/**
 * Scores a long-run report for suspicious outcomes.
 *
 * Thresholds are intentionally explicit and narrow enough to surface issues;
 * this function must never tune the underlying simulation values.
 */
export function createLongRunAnomalyReport(input: CreateLongRunAnomalyReportInput): LongRunAnomalyReport {
  const checks: LongRunAnomalyCheck[] = [
    goalsPerMatchCheck(input.balance),
    tableSpreadCheck(input.balance),
    topAssistCheck(input.playerEvolution),
    topCreatorShareCheck(input.playerEvolution),
    topThreeCreatorShareCheck(input.playerEvolution),
    championDominanceCheck(input.clubStability),
    usefulPlayersCheck(input.playerEvolution),
    ageDistributionCheck(input.playerEvolution),
    transferTurnoverCheck(input.clubStability),
    squadTurnoverCheck(input.clubStability),
    minimumSquadSizeCheck(input.clubStability),
    goalkeeperCoverageCheck(input.clubStability),
    roleCoverageWarningCheck(input.clubStability),
  ];

  return {
    status: worstStatus(checks),
    checks,
  };
}

function goalsPerMatchCheck(balance: readonly LongRunBalanceSeasonRow[]): LongRunAnomalyCheck {
  const value = roundMetric(average(balance.map((season) => season.goalsPerMatch)));
  return check("goals_per_match_avg", value, "pass 2.0..3.2; warn outside 2.3..3.0", () => {
    if (value < 2 || value > 3.2) {
      return "fail";
    }

    if (value < 2.3 || value > 3) {
      return "warn";
    }

    return "pass";
  });
}

function tableSpreadCheck(balance: readonly LongRunBalanceSeasonRow[]): LongRunAnomalyCheck {
  const value = roundMetric(average(balance.map((season) => season.tablePointsSpread)));
  return check("table_points_spread_avg", value, "pass 36..60; warn 30..70", () => {
    if (value < 30 || value > 70) {
      return "fail";
    }

    if (value < 36 || value > 60) {
      return "warn";
    }

    return "pass";
  });
}

function topAssistCheck(report: LongRunPlayerEvolutionReport): LongRunAnomalyCheck {
  const value = Math.max(...report.production.map((row) => row.topAssists), 0);
  const failAt = topAssistFailThreshold(report.production.length);
  return check("top_assist_max", value, `pass <=15; warn 16..${failAt - 1}; fail >=${failAt}`, () => {
    if (value >= failAt) {
      return "fail";
    }

    if (value >= 16) {
      return "warn";
    }

    return "pass";
  });
}

function topAssistFailThreshold(seasonCount: number): number {
  if (seasonCount <= 10) {
    return 21;
  }

  if (seasonCount <= 30) {
    return 24;
  }

  return 25;
}

function topCreatorShareCheck(report: LongRunPlayerEvolutionReport): LongRunAnomalyCheck {
  const value = roundMetric(Math.max(...report.production.map((row) => row.topAssistClubGoalShare), 0));
  return check("top_creator_goal_share_max", value, "pass <=0.30; warn <=0.40; fail >0.40", () => {
    if (value > 0.4) {
      return "fail";
    }

    if (value > 0.3) {
      return "warn";
    }

    return "pass";
  });
}

function topThreeCreatorShareCheck(report: LongRunPlayerEvolutionReport): LongRunAnomalyCheck {
  const value = roundMetric(Math.max(...report.production.map((row) => row.topThreeAssistClubGoalShare), 0));
  return check("top_three_creator_goal_share_max", value, "pass <=0.60; warn <=0.75; fail >0.75", () => {
    if (value > 0.75) {
      return "fail";
    }

    if (value > 0.6) {
      return "warn";
    }

    return "pass";
  });
}

function championDominanceCheck(report: LongRunClubStabilityReport): LongRunAnomalyCheck {
  const value = report.longestChampionStreak;
  const warnAt = championStreakWarnThreshold(report.seasons.length);
  const failAt = championStreakFailThreshold(report.seasons.length);

  return check("champion_streak", value, `pass <${warnAt}; warn ${warnAt}..${failAt - 1}; fail >=${failAt}`, () => {
    if (value >= failAt) {
      return "fail";
    }

    if (value >= warnAt) {
      return "warn";
    }

    return "pass";
  });
}

function championStreakWarnThreshold(seasonCount: number): number {
  return Math.max(4, Math.ceil(seasonCount * 0.18));
}

function championStreakFailThreshold(seasonCount: number): number {
  return Math.max(7, Math.ceil(seasonCount * 0.3));
}

function usefulPlayersCheck(report: LongRunPlayerEvolutionReport): LongRunAnomalyCheck {
  const value = report.usefulAfterLongRun;
  return check("useful_players_after_long_run", value, "pass <=8; warn <=16; fail >16", () => {
    if (value > 16) {
      return "fail";
    }

    if (value > 8) {
      return "warn";
    }

    return "pass";
  });
}

function ageDistributionCheck(report: LongRunPlayerEvolutionReport): LongRunAnomalyCheck {
  const total = report.finalAgeUnder22 + report.finalAge22To29 + report.finalAge30Plus;
  const value = total === 0 ? 0 : roundMetric(report.finalAge30Plus / total);
  return check("age_30_plus_share", value, "pass <=0.45; warn <=0.60; fail >0.60", () => {
    if (value > 0.6) {
      return "fail";
    }

    if (value > 0.45) {
      return "warn";
    }

    return "pass";
  });
}

function transferTurnoverCheck(report: LongRunClubStabilityReport): LongRunAnomalyCheck {
  return {
    key: "transfer_turnover_available",
    status: report.transferTurnoverAvailable && report.transferTurnoverCount > 0 ? "pass" : "warn",
    value: report.transferTurnoverAvailable ? report.transferTurnoverCount : "unavailable",
    threshold: "warn while transfer turnover is unavailable or zero",
  };
}

function squadTurnoverCheck(report: LongRunClubStabilityReport): LongRunAnomalyCheck {
  const turnoverCount = report.playerExitCount + report.squadMaintenanceAddedCount + report.transferTurnoverCount;
  return {
    key: "squad_turnover_available",
    status: report.squadTurnoverAvailable && turnoverCount > 0 ? "pass" : "warn",
    value: report.squadTurnoverAvailable ? turnoverCount : "unavailable",
    threshold: "warn while squad turnover is unavailable or zero",
  };
}

function minimumSquadSizeCheck(report: LongRunClubStabilityReport): LongRunAnomalyCheck {
  const value = report.clubsBelowMinimumSquadSizeCount;
  return check("clubs_below_minimum_squad_size", value, "pass 0; fail >0", () => {
    if (value > 0) {
      return "fail";
    }

    return "pass";
  });
}

function goalkeeperCoverageCheck(report: LongRunClubStabilityReport): LongRunAnomalyCheck {
  const value = report.clubsWithoutNaturalGoalkeeperCount;
  return check("clubs_without_natural_goalkeeper", value, "pass 0; fail >0", () => {
    if (value > 0) {
      return "fail";
    }

    return "pass";
  });
}

function roleCoverageWarningCheck(report: LongRunClubStabilityReport): LongRunAnomalyCheck {
  const value = report.roleCoverageWarningCount;
  const clubSeasonCount = Math.max(1, report.seasons.length * 18);

  return check("role_coverage_warning_count", value, "pass <= one per club-season; warn above", () => {
    if (value > clubSeasonCount) {
      return "warn";
    }

    return "pass";
  });
}

function check(
  key: string,
  value: number,
  threshold: string,
  status: () => LongRunAnomalyStatus,
): LongRunAnomalyCheck {
  return {
    key,
    value,
    threshold,
    status: status(),
  };
}

function worstStatus(checks: readonly LongRunAnomalyCheck[]): LongRunAnomalyStatus {
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
