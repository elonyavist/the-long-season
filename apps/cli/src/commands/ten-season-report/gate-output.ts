import type { Translator } from "@game/i18n";
import type { LongRunGateCheckCount, LongRunGateReport, LongRunGateWorldSummary } from "./report-data.ts";

/**
 * Formats the batch gate report for concise CLI output.
 */
export function formatLongRunGateReportOutput(
  report: LongRunGateReport,
  text: Translator,
  reportOutputPath: string | undefined,
): readonly string[] {
  return [
    text("tenSeason.gateTitle"),
    `${text("tenSeason.seedPrefix")}: ${report.seedPrefix}`,
    `${text("tenSeason.worlds")}: ${report.worldCount}`,
    `${text("balance.seasons")}: ${report.seasonCount}`,
    `${text("tenSeason.totalSeasons")}: ${report.totalSeasonCount}`,
    `${text("balance.status")}: ${report.failedWorldCount === 0 ? text("common.pass") : text("common.fail")}`,
    `${text("tenSeason.failedWorlds")}: ${report.failedWorldCount}`,
    `${text("tenSeason.warningWorlds")}: ${report.warningWorldCount}`,
    `${text("tenSeason.goalsPerMatchAvgP95")}: avg=${report.goalsPerMatchAverage.toFixed(3)} p95=${report.goalsPerMatchP95.toFixed(3)}`,
    `${text("tenSeason.tableSpreadAvgMin")}: avg=${report.tablePointsSpreadAverage.toFixed(2)} min=${report.tablePointsSpreadMin.toFixed(2)}`,
    `${text("tenSeason.drawRateAvgMax")}: avg=${report.drawRateAverage.toFixed(3)} max=${report.drawRateMax.toFixed(3)}`,
    `${text("tenSeason.championStreakMax")}: ${report.championStreakMaxObserved}`,
    `${text("tenSeason.topAssistP95")}: ${report.topAssistMaxP95}`,
    `${text("tenSeason.productionWarningMax")}: assists=${report.topAssistMaxObserved} top1=${report.topCreatorGoalShareMaxObserved.toFixed(2)} top3=${report.topThreeCreatorGoalShareMaxObserved.toFixed(2)}`,
    `${text("tenSeason.age30PlusP95")}: ${report.age30PlusShareP95.toFixed(2)}`,
    `${text("tenSeason.minimumSquadSizeObserved")}: ${report.minimumSquadSizeObserved}`,
    `${text("tenSeason.clubsBelowMinimumSquadSize")}: ${report.clubsBelowMinimumSquadSizeCount}`,
    `${text("tenSeason.clubsWithoutNaturalGoalkeeper")}: ${report.clubsWithoutNaturalGoalkeeperCount}`,
    `${text("tenSeason.roleCoverageWarnings")}: total=${report.roleCoverageWarningCount} p95=${report.roleCoverageWarningP95}`,
    `${text("tenSeason.youthRosterMaxObserved")}: ${report.maximumYouthRosterSizeObserved}`,
    `${text("tenSeason.activePlayersMinMax")}: senior=${report.minimumSeniorPlayerCountObserved}..${report.maximumSeniorPlayerCountObserved} youth=${report.minimumYouthPlayerCountObserved}..${report.maximumYouthPlayerCountObserved} total=${report.minimumActivePlayerCountObserved}..${report.maximumActivePlayerCountObserved}`,
    `${text("tenSeason.clubsAboveYouthTarget")}: ${report.clubsAboveYouthTargetCount}`,
    `${text("tenSeason.clubsBelowYouthMinimum")}: ${report.clubsBelowYouthMinimumCount}`,
    `${text("tenSeason.warningCheckCounts")}: ${formatCheckCounts(report.warningCheckCounts)}`,
    `${text("tenSeason.signalCheckCounts")}: ${formatCheckCounts(report.signalCheckCounts)}`,
    `${text("tenSeason.failingCheckCounts")}: ${formatCheckCounts(report.failingCheckCounts)}`,
    text("tenSeason.signalGuide"),
    `${text("tenSeason.reportOutput")}: ${reportOutputPath ?? text("common.none")}`,
    `${text("tenSeason.worstWorlds")}:`,
    ...formatWorstGateWorldLines(report.worstWorlds),
  ];
}

/**
 * Formats a deterministic Markdown artifact for audit storage.
 */
export function formatLongRunGateReportMarkdown(report: LongRunGateReport, reportOutputPath: string): string {
  const lines = [
    "# Career Squad Refresh Long-Run Gates Report",
    "",
    `Date: 2026-06-22`,
    `Seed prefix: \`${report.seedPrefix}\``,
    `Worlds: ${report.worldCount}`,
    `Seasons per world: ${report.seasonCount}`,
    `Total seasons: ${report.totalSeasonCount}`,
    `Status: ${report.failedWorldCount === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Aggregate Metrics",
    "",
    `- Failed worlds: ${report.failedWorldCount}`,
    `- Warning worlds: ${report.warningWorldCount}`,
    `- Goals per match average: ${report.goalsPerMatchAverage.toFixed(3)}`,
    `- Goals per match p95: ${report.goalsPerMatchP95.toFixed(3)}`,
    `- Table spread average: ${report.tablePointsSpreadAverage.toFixed(2)}`,
    `- Table spread minimum world average: ${report.tablePointsSpreadMin.toFixed(2)}`,
    `- Draw rate average: ${report.drawRateAverage.toFixed(3)}`,
    `- Draw rate maximum world average: ${report.drawRateMax.toFixed(3)}`,
    `- Champion streak max observed: ${report.championStreakMaxObserved}`,
    `- Top assist max p95: ${report.topAssistMaxP95}`,
    `- Production warning max: assists=${report.topAssistMaxObserved} top1=${report.topCreatorGoalShareMaxObserved.toFixed(2)} top3=${report.topThreeCreatorGoalShareMaxObserved.toFixed(2)}`,
    `- Age 30+ share p95: ${report.age30PlusShareP95.toFixed(2)}`,
    `- Minimum squad size observed: ${report.minimumSquadSizeObserved}`,
    `- Clubs below minimum squad size: ${report.clubsBelowMinimumSquadSizeCount}`,
    `- Clubs without natural goalkeeper: ${report.clubsWithoutNaturalGoalkeeperCount}`,
    `- Role coverage warnings total: ${report.roleCoverageWarningCount}`,
    `- Role coverage warnings p95: ${report.roleCoverageWarningP95}`,
    `- Youth roster max observed: ${report.maximumYouthRosterSizeObserved}`,
    `- Active player count min/max: senior=${report.minimumSeniorPlayerCountObserved}..${report.maximumSeniorPlayerCountObserved} youth=${report.minimumYouthPlayerCountObserved}..${report.maximumYouthPlayerCountObserved} total=${report.minimumActivePlayerCountObserved}..${report.maximumActivePlayerCountObserved}`,
    `- Clubs above youth target: ${report.clubsAboveYouthTargetCount}`,
    `- Clubs below youth minimum: ${report.clubsBelowYouthMinimumCount}`,
    `- Warning check counts: ${formatCheckCounts(report.warningCheckCounts)}`,
    `- Signal check counts: ${formatCheckCounts(report.signalCheckCounts)}`,
    `- Failing check counts: ${formatCheckCounts(report.failingCheckCounts)}`,
    "- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk",
    "",
    "## Worst Worlds",
    "",
    "| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |",
    "|---|---:|---:|---:|---|---:|---:|---:|---:|---|---|---|---|",
    ...report.worstWorlds.map(
      (world) =>
      `| \`${world.seed}\` | ${world.status.toUpperCase()} | ${world.minimumSquadSizeObserved} | ${world.maximumYouthRosterSizeObserved} | senior ${world.minimumSeniorPlayerCountObserved}..${world.maximumSeniorPlayerCountObserved}; youth ${world.minimumYouthPlayerCountObserved}..${world.maximumYouthPlayerCountObserved}; total ${world.minimumActivePlayerCountObserved}..${world.maximumActivePlayerCountObserved} | ${world.clubsBelowMinimumSquadSizeCount} | ${world.clubsAboveYouthTargetCount} | ${world.clubsWithoutNaturalGoalkeeperCount} | ${world.topAssistMax} | avg ${world.tablePointsSpreadAverage.toFixed(2)}; min ${world.tablePointsSpreadMin}; max ${world.tablePointsSpreadMax}; low season ${world.lowestTableSpreadSeasonNumber}; champion pts ${world.firstPlacePointsMin}..${world.firstPlacePointsMax}; last pts ${world.lastPlacePointsMin}..${world.lastPlacePointsMax}; ability spread ${world.initialClubAbilitySpread.toFixed(2)}->${world.finalClubAbilitySpread.toFixed(2)}; draw rate avg/max ${world.drawRateAverage.toFixed(3)}/${world.drawRateMax.toFixed(3)} | season ${world.topCreatorSeasonNumber}; ${world.topCreatorClubName}; ${world.topCreatorName}; assists ${world.topCreatorAssists}; team goals ${world.topCreatorClubGoals}; top1 ${world.topCreatorGoalShareMax.toFixed(2)}; top3 ${world.topThreeCreatorGoalShareMax.toFixed(2)}; top assist ${world.topAssistName}; top scorer ${world.topScorerName}:${world.topScorerGoals} | ${world.warningCheckKeys.join(", ") || "none"} | ${world.failingCheckKeys.join(", ") || "none"} |`,
    ),
    "",
    "## Production Warning Snapshots",
    "",
    "| Seed | Top assist max | Creator snapshot | Warn checks |",
    "|---|---:|---|---|",
    ...report.productionWarningWorlds.map(
      (world) =>
        `| \`${world.seed}\` | ${world.topAssistMax} | season ${world.topCreatorSeasonNumber}; ${world.topCreatorClubName}; ${world.topCreatorName}; assists ${world.topCreatorAssists}; team goals ${world.topCreatorClubGoals}; top1 ${world.topCreatorGoalShareMax.toFixed(2)}; top3 ${world.topThreeCreatorGoalShareMax.toFixed(2)}; top assist ${world.topAssistName}; top scorer ${world.topScorerName}:${world.topScorerGoals} | ${world.warningCheckKeys.join(", ") || "none"} |`,
    ),
    "",
    "## Dynasty Warning Snapshots",
    "",
    "| Seed | Longest streak | Club | Champion pts | Streak table spread avg | Unique champions | Turnover | Warn checks |",
    "|---|---:|---|---:|---:|---:|---:|---|",
    ...report.dynastyWarningWorlds.map(
      (world) =>
        `| \`${world.seed}\` | ${world.longestChampionStreak} | ${world.longestChampionStreakClubName} | ${world.championStreakPointsMin}..${world.championStreakPointsMax} | ${world.championStreakTableSpreadAverage.toFixed(2)} | ${world.uniqueChampionCount} | transfer=${world.transferTurnoverCount}; squad=${world.squadTurnoverCount} | ${world.warningCheckKeys.join(", ") || "none"} |`,
    ),
    "",
    "## Table Spread Warning Snapshots",
    "",
    "| Seed | Avg spread | Min/max spread | Champion pts | Last-place pts | Draw rate | Ability spread | Warn checks |",
    "|---|---:|---:|---:|---:|---:|---:|---|",
    ...report.tableSpreadWarningWorlds.map(
      (world) =>
        `| \`${world.seed}\` | ${world.tablePointsSpreadAverage.toFixed(2)} | ${world.tablePointsSpreadMin}..${world.tablePointsSpreadMax} | ${world.firstPlacePointsMin}..${world.firstPlacePointsMax} | ${world.lastPlacePointsMin}..${world.lastPlacePointsMax} | avg ${world.drawRateAverage.toFixed(3)} max ${world.drawRateMax.toFixed(3)} | ${world.initialClubAbilitySpread.toFixed(2)}->${world.finalClubAbilitySpread.toFixed(2)} | ${world.warningCheckKeys.join(", ") || "none"} |`,
    ),
    "",
    "## Reproduction",
    "",
    "Run the same gate with:",
    "",
    "```bash",
    `pnpm cli ten-season-report --seed-prefix=${report.seedPrefix} --worlds=${report.worldCount} --seasons=${report.seasonCount} --report-output=${reportOutputPath}`,
    "```",
    "",
  ];

  return `${lines.join("\n")}`;
}

/**
 * Formats the top/worst worlds section with stable machine-readable fields.
 */
function formatWorstGateWorldLines(worlds: readonly LongRunGateWorldSummary[]): readonly string[] {
  if (worlds.length === 0) {
    return ["  none"];
  }

  return worlds.map(
    (world) =>
      `  ${world.seed} status=${world.status} min_squad=${world.minimumSquadSizeObserved} youth_max=${world.maximumYouthRosterSizeObserved} active_players=senior:${world.minimumSeniorPlayerCountObserved}..${world.maximumSeniorPlayerCountObserved},youth:${world.minimumYouthPlayerCountObserved}..${world.maximumYouthPlayerCountObserved},total:${world.minimumActivePlayerCountObserved}..${world.maximumActivePlayerCountObserved} below_min=${world.clubsBelowMinimumSquadSizeCount} youth_above_target=${world.clubsAboveYouthTargetCount} youth_below_min=${world.clubsBelowYouthMinimumCount} no_gk=${world.clubsWithoutNaturalGoalkeeperCount} top_assist_max=${world.topAssistMax} table_spread=avg:${world.tablePointsSpreadAverage.toFixed(2)},min:${world.tablePointsSpreadMin},max:${world.tablePointsSpreadMax},low_season:${world.lowestTableSpreadSeasonNumber},champion_pts:${world.firstPlacePointsMin}..${world.firstPlacePointsMax},last_pts:${world.lastPlacePointsMin}..${world.lastPlacePointsMax},ability_spread:${world.initialClubAbilitySpread.toFixed(2)}..${world.finalClubAbilitySpread.toFixed(2)} draw_rate=avg:${world.drawRateAverage.toFixed(3)},max:${world.drawRateMax.toFixed(3)},high_season:${world.highestDrawRateSeasonNumber} creator_snapshot=season:${world.topCreatorSeasonNumber},club:${world.topCreatorClubName},creator:${world.topCreatorName},assists:${world.topCreatorAssists},team_goals:${world.topCreatorClubGoals},top1:${world.topCreatorGoalShareMax.toFixed(2)},top3:${world.topThreeCreatorGoalShareMax.toFixed(2)},top_assist:${world.topAssistName},top_scorer:${world.topScorerName}:${world.topScorerGoals} warn_checks=${world.warningCheckKeys.join(",") || "none"} fail_checks=${world.failingCheckKeys.join(",") || "none"}`,
  );
}

/**
 * Formats aggregate anomaly-key counts as compact machine-readable pairs.
 */
function formatCheckCounts(counts: readonly LongRunGateCheckCount[]): string {
  if (counts.length === 0) {
    return "none";
  }

  return counts.map((row) => `${row.key}=${row.count}`).join(", ");
}
