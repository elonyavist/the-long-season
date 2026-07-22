import type { FakeLeagueSystem } from "@game/content";
import type { MessageKey, Translator } from "@game/i18n";
import type {
  LongRunAnomalyReport,
  LongRunClubStabilityReport,
  LongRunContractFinanceStabilityReport,
  LongRunPlayerEvolutionReport,
  LongRunYouthStabilityReport,
} from "@game/simulation-tools";
import {
  clubLabel,
  drawRate,
  goalsPerMatch,
  type ClubAbilityHierarchySnapshot,
  type ClubAbilityHierarchySummary,
  type LongRunSeasonResult,
} from "./report-data.ts";

/**
 * Formats the narrow step-02 report output.
 */
export function formatTenSeasonReportOutput(
  league: FakeLeagueSystem,
  seasons: readonly LongRunSeasonResult[],
  playerEvolution: LongRunPlayerEvolutionReport,
  clubStability: LongRunClubStabilityReport,
  youthStability: LongRunYouthStabilityReport,
  contractFinanceStability: LongRunContractFinanceStabilityReport,
  anomalyReport: LongRunAnomalyReport,
  strengthHierarchy: ClubAbilityHierarchySummary,
  seed: string,
  seasonCount: number,
  text: Translator,
): readonly string[] {
  const selectedClubId = league.clubIds[0];

  if (selectedClubId === undefined) {
    throw new Error("Cannot format ten-season report without clubs");
  }

  const lines = [
    text("tenSeason.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("balance.seasons")}: ${seasonCount}`,
    `${text("season.competition")}: ${league.competition.name}`,
    `${text("setup.selectedClub")}: ${clubLabel(league, selectedClubId)}`,
    "",
    `${text("tenSeason.seasonSummaries")}:`,
  ];

  for (const season of seasons) {
    lines.push(formatSeasonSummaryLine(league, season, selectedClubId, text));
  }

  lines.push("", ...formatPlayerEvolutionLines(playerEvolution, text));
  lines.push("", ...formatStrengthHierarchyLines(strengthHierarchy, text));
  lines.push("", ...formatClubStabilityLines(clubStability, text));
  lines.push("", ...formatYouthStabilityLines(youthStability, text));
  lines.push("", ...formatContractFinanceStabilityLines(contractFinanceStability));
  lines.push("", ...formatAnomalyLines(anomalyReport, text));

  return lines;
}

/** Formats contract and finance diagnostics without hiding football warnings. */
function formatContractFinanceStabilityLines(
  report: LongRunContractFinanceStabilityReport,
): readonly string[] {
  return [
    `Contract and finance stability: ${report.status.toUpperCase()}`,
    `  Structural violations: ${report.structuralViolationCount}`,
    `  Cash floor (minor): ${report.minimumCashBalanceObserved}`,
    `  Annual wage utilization max: ${report.maximumWageBudgetUtilizationObserved.toFixed(4)}`,
    `  Free-agent share max: ${report.maximumFreeAgentShareObserved.toFixed(4)}`,
    `  Sampled player value min/max (minor): ${report.minimumPlayerValueObserved}..${report.maximumPlayerValueObserved}`,
    `  Contract lifecycle: renewals=${report.renewalCount} releases=${report.releaseCount} expiries=${report.expiryCount} selected_expiry_decisions=${report.selectedClubExpiredDecisionCount}`,
    ...report.checks.map(
      (check) => `  ${check.key}: ${check.status.toUpperCase()} value=${check.value} target=${check.threshold}`,
    ),
  ];
}

/**
 * Formats the initial/final senior squad ability hierarchy for source review.
 */
function formatStrengthHierarchyLines(
  strengthHierarchy: ClubAbilityHierarchySummary,
  text: Translator,
): readonly string[] {
  return [
    `${text("tenSeason.strengthHierarchy")}:`,
    `  ${text("tenSeason.initialAbilitySpread")}: ${formatAbilityHierarchySnapshot(strengthHierarchy.initial)}`,
    `  ${text("tenSeason.finalAbilitySpread")}: ${formatAbilityHierarchySnapshot(strengthHierarchy.final)}`,
  ];
}

/**
 * Formats one ability hierarchy snapshot as compact diagnostic text.
 */
function formatAbilityHierarchySnapshot(snapshot: ClubAbilityHierarchySnapshot): string {
  return `spread=${snapshot.spread.toFixed(2)} top=${snapshot.top.clubName}:${snapshot.top.averageCurrentAbility.toFixed(2)} bottom=${snapshot.bottom.clubName}:${snapshot.bottom.averageCurrentAbility.toFixed(2)}`;
}

/**
 * Formats one deterministic season summary row.
 */
function formatSeasonSummaryLine(
  league: FakeLeagueSystem,
  season: LongRunSeasonResult,
  selectedClubId: FakeLeagueSystem["clubIds"][number],
  text: Translator,
): string {
  const champion = season.result.table[0];
  const lastPlace = season.result.table[season.result.table.length - 1];
  const selectedIndex = season.result.table.findIndex((row) => row.clubId === selectedClubId);

  if (champion === undefined || lastPlace === undefined || selectedIndex < 0) {
    throw new Error(`Cannot summarize long-run season: ${season.seasonNumber}`);
  }

  return `  ${season.seasonNumber}. ${season.seasonSeed} ${text("tenSeason.champion")}=${clubLabel(league, champion.clubId)} ${text("tenSeason.points")}=${champion.points} ${text("tenSeason.lastPlacePoints")}=${lastPlace.points} ${text("tenSeason.tablePointsSpread")}=${champion.points - lastPlace.points} ${text("tenSeason.selectedPosition")}=${selectedIndex + 1} ${text("tenSeason.goalsPerMatch")}=${goalsPerMatch(season).toFixed(3)} ${text("tenSeason.drawRate")}=${drawRate(season).toFixed(3)}`;
}

/**
 * Formats player-evolution metrics for the long-run report.
 */
function formatPlayerEvolutionLines(report: LongRunPlayerEvolutionReport, text: Translator): readonly string[] {
  const lines = [
    `${text("tenSeason.playerEvolution")}:`,
    `  ${text("tenSeason.currentAbilityAvg")}: ${report.startAverageCurrentAbility.toFixed(2)} -> ${report.endAverageCurrentAbility.toFixed(2)}`,
    `  ${text("tenSeason.playersImproved")}: ${report.playersImproved}`,
    `  ${text("tenSeason.playersDeclined")}: ${report.playersDeclined}`,
    `  ${text("tenSeason.seriousProspects")}: ${report.seriousProspects}`,
    `  ${text("tenSeason.rareProdigies")}: ${report.rareProdigies}`,
    `  ${text("tenSeason.usefulAfterLongRun")}: ${report.usefulAfterLongRun}`,
    `  ${text("tenSeason.finalAgeDistribution")}: <=21=${report.finalAgeUnder22} 22-29=${report.finalAge22To29} 30+=${report.finalAge30Plus}`,
    `${text("tenSeason.topImprovers")}:`,
    ...formatMovementRows(report.topImprovers, text),
    `${text("tenSeason.biggestDecliners")}:`,
    ...formatMovementRows(report.biggestDecliners, text),
    `${text("tenSeason.productionLeaders")}:`,
  ];

  for (const production of report.production) {
    lines.push(
      `  ${production.seasonNumber}. ${text("season.topScorer")}=${production.topScorerName} ${text("season.unit.goal.many")}=${production.topScorerGoals} ${text("season.topAssist")}=${production.topAssistName} ${text("season.unit.assist.many")}=${production.topAssists} ${text("tenSeason.topCreator")}=${production.topCreatorName} ${text("tenSeason.creatorClub")}=${production.topCreatorClubName} ${text("tenSeason.teamGoals")}=${production.topCreatorClubGoals} ${text("tenSeason.clubTopScorer")}=${production.topCreatorClubTopScorerName}:${production.topCreatorClubTopScorerGoals} 12+=${production.assistPlayersAtLeastTwelve} top1_share=${production.topAssistClubGoalShare.toFixed(2)} top3_share=${production.topThreeAssistClubGoalShare.toFixed(2)}`,
    );
  }

  return lines;
}

/**
 * Formats one movement list with a deterministic empty fallback.
 */
function formatMovementRows(rows: readonly LongRunPlayerEvolutionReport["topImprovers"][number][], text: Translator): readonly string[] {
  if (rows.length === 0) {
    return [`  ${text("common.none")}`];
  }

  return rows.map(
    (row) =>
      `  ${row.displayName}: ${row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)} ${text("tenSeason.age")} ${row.startAge}->${row.endAge}`,
  );
}

/**
 * Formats club and missing-market stability metrics.
 */
function formatClubStabilityLines(report: LongRunClubStabilityReport, text: Translator): readonly string[] {
  return [
    `${text("tenSeason.clubStability")}:`,
    `  ${text("tenSeason.uniqueChampions")}: ${report.uniqueChampionCount}`,
    `  ${text("tenSeason.mostTitledClub")}: ${report.mostTitledClubName} (${report.mostTitledClubTitles})`,
    `  ${text("tenSeason.longestChampionStreak")}: ${report.longestChampionStreak}`,
    `  ${text("tenSeason.selectedClubAveragePosition")}: ${report.selectedClubAveragePosition.toFixed(2)}`,
    `  ${text("tenSeason.selectedClubBestWorst")}: ${report.selectedClubBestPosition}/${report.selectedClubWorstPosition}`,
    `  ${text("tenSeason.selectedClubAveragePoints")}: ${report.selectedClubAveragePoints.toFixed(2)}`,
    `  ${text("tenSeason.transferTurnover")}: ${report.transferTurnoverAvailable ? `${text("common.enabled")} (${report.transferTurnoverCount})` : text("common.unavailable")}`,
    `  ${text("tenSeason.squadTurnover")}: ${report.squadTurnoverAvailable ? `${text("common.enabled")} (${report.playerExitCount + report.squadMaintenanceAddedCount + report.transferTurnoverCount})` : text("common.unavailable")}`,
    `  ${text("tenSeason.playerExits")}: ${report.playerExitCount}`,
    `  ${text("tenSeason.exitReasons")}: retirement=${report.retirementExitCount} released=${report.releasedExitCount} career_step_down=${report.careerStepDownExitCount}`,
    `  ${text("tenSeason.playerIntake")}: ${report.playerIntakeCount}`,
    `  ${text("tenSeason.squadMaintenanceAdded")}: ${report.squadMaintenanceAddedCount}`,
    `  ${text("tenSeason.squadSizeMinAvgMax")}: ${report.minimumSquadSizeObserved}/${report.averageSquadSizeObserved.toFixed(2)}/${report.maximumSquadSizeObserved}`,
    `  ${text("tenSeason.clubsBelowMinimumSquadSize")}: ${report.clubsBelowMinimumSquadSizeCount}`,
    `  ${text("tenSeason.clubsWithoutNaturalGoalkeeper")}: ${report.clubsWithoutNaturalGoalkeeperCount}`,
    `  ${text("tenSeason.roleCoverageWarnings")}: ${report.roleCoverageWarningCount}`,
  ];
}

/**
 * Formats youth-academy population metrics for long-run inspection.
 */
function formatYouthStabilityLines(report: LongRunYouthStabilityReport, text: Translator): readonly string[] {
  const lines = [
    `${text("tenSeason.youthAcademyStability")}: ${text(statusMessageKey(report.status))}`,
    `  ${text("tenSeason.activePlayersSeniorYouthTotal")}: senior=${report.seasons.at(-1)?.seniorPlayerCount ?? 0} youth=${report.seasons.at(-1)?.youthPlayerCount ?? 0} total=${report.seasons.at(-1)?.activePlayerCount ?? 0}`,
    `  ${text("tenSeason.activePlayersMinMax")}: senior=${report.minimumSeniorPlayerCountObserved}..${report.maximumSeniorPlayerCountObserved} youth=${report.minimumYouthPlayerCountObserved}..${report.maximumYouthPlayerCountObserved} total=${report.minimumActivePlayerCountObserved}..${report.maximumActivePlayerCountObserved}`,
    `  ${text("tenSeason.youthRosterMinAvgMax")}: ${report.minimumYouthRosterSizeObserved}/${report.averageYouthRosterSizeObserved.toFixed(2)}/${report.maximumYouthRosterSizeObserved}`,
    `  ${text("tenSeason.youthIntake")}: ${report.youthIntakeCount}`,
    `  ${text("tenSeason.youthExits")}: ${report.youthExitCount}`,
    `  ${text("tenSeason.youthPromotions")}: ${report.youthPromotionCount}`,
    `  ${text("tenSeason.selectedClubYouthSize")}: ${report.selectedClubYouthMinimumSize}/${report.selectedClubYouthAverageSize.toFixed(2)}/${report.selectedClubYouthMaximumSize}`,
    `  ${text("tenSeason.clubsAboveYouthTarget")}: ${report.clubsAboveYouthTargetCount}`,
    `  ${text("tenSeason.clubsBelowYouthMinimum")}: ${report.clubsBelowYouthMinimumCount}`,
    `${text("tenSeason.youthChecks")}:`,
  ];

  for (const check of report.checks) {
    lines.push(
      `  ${check.key}: ${text(statusMessageKey(check.status))} ${text("tenSeason.value")}=${check.value} ${text("tenSeason.target")}=${check.threshold}`,
    );
  }

  return lines;
}

/**
 * Formats long-run anomaly scoring rows.
 */
function formatAnomalyLines(report: LongRunAnomalyReport, text: Translator): readonly string[] {
  const lines = [
    `${text("tenSeason.anomalyScoring")}: ${text(statusMessageKey(report.status))}`,
  ];

  for (const check of report.checks) {
    lines.push(
      `  ${check.key}: ${text(statusMessageKey(check.status))} ${text("tenSeason.value")}=${check.value} ${text("tenSeason.target")}=${check.threshold}`,
    );
  }

  return lines;
}

/**
 * Maps an anomaly status to an existing localized PASS/WARN/FAIL-like label.
 */
function statusMessageKey(status: LongRunAnomalyReport["status"]): MessageKey {
  if (status === "pass") {
    return "common.pass";
  }

  if (status === "fail") {
    return "common.fail";
  }

  return "tenSeason.warn";
}
