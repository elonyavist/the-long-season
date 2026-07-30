import type { FakeDomesticWorld } from "@game/content";
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
import { competitionIdForClubInWorld } from "../career/scenarios.ts";

/**
 * Formats the narrow step-02 report output.
 */
export function formatTenSeasonReportOutput(
  league: FakeDomesticWorld,
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
  const selectedClubId = league.defaultSelectedClubId;

  if (selectedClubId === undefined) {
    throw new Error("Cannot format ten-season report without clubs");
  }

  const lines = [
    text("tenSeason.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("balance.seasons")}: ${seasonCount}`,
    `${text("season.competition")}: ${selectedCompetitionName(league)}`,
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
    `  Annual wage utilization: p50=${report.wageBudgetUtilizationP50.toFixed(4)} p90=${report.wageBudgetUtilizationP90.toFixed(4)} p95=${report.wageBudgetUtilizationP95.toFixed(4)} p99=${report.wageBudgetUtilizationP99.toFixed(4)} pressure_share=${report.wagePressureClubSeasonShare.toFixed(4)} exact_ceiling_share=${report.exactWageCeilingClubSeasonShare.toFixed(4)} above_budget_share=${report.aboveWageBudgetClubSeasonShare.toFixed(4)} reallocation_exact_ceiling=${report.reallocationExactCeilingClubSeasonCount}`,
    `  Annual wage headroom (minor): p10=${report.annualWageHeadroomP10} p50=${report.annualWageHeadroomP50}`,
    ...report.closingDivisionWageEconomy.map((row) =>
      `  Wage economy ${row.division}: clubs=${row.clubCount} players=${row.playerCount} wage_p50/p90/p99=${row.annualWageP50}/${row.annualWageP90}/${row.annualWageP99} bonuses_p50(signing/appearance/goal/clean)=${row.signingBonusP50}/${row.appearanceBonusP50}/${row.goalBonusP50}/${row.cleanSheetBonusP50} committed_p50/p90/p99=${row.committedAnnualWageP50}/${row.committedAnnualWageP90}/${row.committedAnnualWageP99} utilization_p50/p90/p99=${row.wageBudgetUtilizationP50.toFixed(4)}/${row.wageBudgetUtilizationP90.toFixed(4)}/${row.wageBudgetUtilizationP99.toFixed(4)} headroom_p10/p50=${row.annualWageHeadroomP10}/${row.annualWageHeadroomP50}`
    ),
    ...report.closingDivisionMarketEconomy.map((row) =>
      `  Market economy ${row.division}: clubs=${row.clubCount} cash_p50/p90/p99=${row.cashBalanceP50}/${row.cashBalanceP90}/${row.cashBalanceP99} transfer_room_p50/p90/p99=${row.availableTransferBudgetP50}/${row.availableTransferBudgetP90}/${row.availableTransferBudgetP99} pending_cash_p50/p90/p99=${row.pendingCashExposureP50}/${row.pendingCashExposureP90}/${row.pendingCashExposureP99} pending_wage_p50/p90/p99=${row.pendingAnnualWageExposureP50}/${row.pendingAnnualWageExposureP90}/${row.pendingAnnualWageExposureP99} attempts=${row.permanentAttemptCount} completed=${row.permanentCompletionCount} free_agents=${row.freeAgentSigningCount}`
    ),
    ...report.closingCrossTierTransfers.map((row) =>
      `  Cross-tier market ${row.sourceDivision}->${row.destinationDivision}: attempts=${row.attemptCount} completed=${row.completionCount} value_p50=${row.publicValueP50} asking_p50=${row.askingPriceP50} fee_p50=${row.completedFeeP50} rejected=${formatReasonCounts(row.rejectionReasonCounts)}`
    ),
    `  Free-agent share max: ${report.maximumFreeAgentShareObserved.toFixed(4)}`,
    `  Useful free-agent stock max: ${report.maximumUsefulFreeAgentCountObserved}`,
    `  Free-agent band observations: age under23/23-29/30-34/35+=${report.freeAgentBandObservations.age.under_23}/${report.freeAgentBandObservations.age.prime_23_29}/${report.freeAgentBandObservations.age.age_30_34}/${report.freeAgentBandObservations.age.age_35_plus}; ability <8/8-9/10-11/12+=${report.freeAgentBandObservations.currentAbility.under_8}/${report.freeAgentBandObservations.currentAbility.ability_8_9}/${report.freeAgentBandObservations.currentAbility.ability_10_11}/${report.freeAgentBandObservations.currentAbility.ability_12_plus}; unattached <1/1-2/3+ seasons=${report.freeAgentBandObservations.unattached.under_1_season}/${report.freeAgentBandObservations.unattached.one_to_two_seasons}/${report.freeAgentBandObservations.unattached.three_plus_seasons}`,
    `  Permanent funnel: needs=${report.permanentTransferFunnel.needsEvaluatedCount} recruitable=${report.permanentTransferFunnel.recruitableNeedCount} targets=${report.permanentTransferFunnel.targetFoundCount} unavailable=${report.permanentTransferFunnel.targetUnavailableCount} offers=${report.permanentTransferFunnel.offerSubmittedCount} seller_rejected=${report.permanentTransferFunnel.sellerRejectedCount} seller_countered=${report.permanentTransferFunnel.sellerCounteredCount} seller_accepted=${report.permanentTransferFunnel.sellerAcceptedCount} player_started=${report.permanentTransferFunnel.playerTermsStartedCount} unaffordable=${report.permanentTransferFunnel.unaffordableCompletionCount} completed=${report.permanentTransferFunnel.completedCount} lost=${formatReasonCounts(report.permanentTransferFunnel.lostReasonCounts)}`,
    `  Permanent losses by department: ${formatDepartmentLosses(report.permanentTransferFunnel.lostByClubDepartment)}`,
    `  In-window permanent losses by department: ${formatDepartmentLosses(report.permanentTransferFunnel.lostByClubDepartment.filter((row) => row.transferWindowOpen))}`,
    `  Preliminary funnel: candidates=${report.preliminaryAgreementFunnel.candidateFoundCount} unavailable=${report.preliminaryAgreementFunnel.candidateUnavailableCount} offers=${report.preliminaryAgreementFunnel.offerSubmittedCount} rejected=${report.preliminaryAgreementFunnel.offerRejectedCount} countered=${report.preliminaryAgreementFunnel.counteredCount} agreements=${report.preliminaryAgreementFunnel.agreementCreatedCount} expired=${report.preliminaryAgreementFunnel.expiredCount} activations=${report.preliminaryAgreementFunnel.activationCount} activation_failures=${report.preliminaryAgreementFunnel.activationFailureCount} lost=${formatReasonCounts(report.preliminaryAgreementFunnel.lostReasonCounts)}`,
    ...report.permanentTransferFunnel.clubActivity.map((club) =>
      `  Market club ${club.clubId}: needs=${club.needsEvaluatedCount} recruitable=${club.recruitableNeedCount} permanent_targets=${club.permanentTargetFoundCount} permanent_offers=${club.permanentOfferSubmittedCount} permanent_completed=${club.permanentCompletedCount} preliminary_offers=${club.preliminaryOfferSubmittedCount}`
    ),
    `  Sampled player value min/max (minor): ${report.minimumPlayerValueObserved}..${report.maximumPlayerValueObserved}`,
    `  Contract lifecycle: renewals=${report.renewalCount} releases=${report.releaseCount} expiries=${report.expiryCount} selected_expiry_decisions=${report.selectedClubExpiredDecisionCount}`,
    ...report.seasons.map((season) =>
      `  Free-agent flow S${season.seasonNumber}: opening=${season.freeAgentFlow.openingStock} expiry_in=${season.freeAgentFlow.expiryInflow} release_in=${season.freeAgentFlow.releaseInflow} youth_external_in=${season.freeAgentFlow.youthExternalMoveInflow} youth_release_in=${season.freeAgentFlow.youthReleaseInflow} other_in=${season.freeAgentFlow.otherInflow} ordinary_signing_out=${season.freeAgentFlow.ordinarySigningOutflow} preliminary_out=${season.freeAgentFlow.preliminaryActivationOutflow} retirement_out=${season.freeAgentFlow.retirementOutflow} step_down_out=${season.freeAgentFlow.careerStepDownOutflow} other_out=${season.freeAgentFlow.otherOutflow} closing=${season.freeAgentFlow.closingStock} delta=${season.freeAgentFlow.reconciliationDelta} useful=${season.freeAgentFlow.usefulClosingStock} age=${season.freeAgentFlow.bands.age.under_23}/${season.freeAgentFlow.bands.age.prime_23_29}/${season.freeAgentFlow.bands.age.age_30_34}/${season.freeAgentFlow.bands.age.age_35_plus} ability=${season.freeAgentFlow.bands.currentAbility.under_8}/${season.freeAgentFlow.bands.currentAbility.ability_8_9}/${season.freeAgentFlow.bands.currentAbility.ability_10_11}/${season.freeAgentFlow.bands.currentAbility.ability_12_plus} unattached=${season.freeAgentFlow.bands.unattached.under_1_season}/${season.freeAgentFlow.bands.unattached.one_to_two_seasons}/${season.freeAgentFlow.bands.unattached.three_plus_seasons}`
    ),
    ...report.seasons.map((season) =>
      `  Market funnel S${season.seasonNumber}: needs=${season.permanentTransferFunnel.needsEvaluatedCount} recruitable=${season.permanentTransferFunnel.recruitableNeedCount} permanent_targets=${season.permanentTransferFunnel.targetFoundCount} permanent_offers=${season.permanentTransferFunnel.offerSubmittedCount} permanent_completed=${season.permanentTransferFunnel.completedCount} preliminary_offers=${season.preliminaryAgreementFunnel.offerSubmittedCount}`
    ),
    ...report.checks.map(
      (check) =>
        `  ${check.key}: ${check.status.toUpperCase()} observations=${check.observationCount} evaluation=${check.evaluationStatus} value=${check.value} target=${check.threshold}`,
    ),
  ];
}

function formatReasonCounts(counts: Readonly<Record<string, number>>): string {
  const rows = Object.entries(counts);
  return rows.length === 0
    ? "none"
    : rows.map(([reason, count]) => `${reason}:${count}`).join(",");
}

function formatDepartmentLosses(
  rows: LongRunContractFinanceStabilityReport["permanentTransferFunnel"]["lostByClubDepartment"],
): string {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.department}:${row.reason}`;
    totals.set(key, (totals.get(key) ?? 0) + row.count);
  }
  return [...totals]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => `${key}:${count}`)
    .join(",") || "none";
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
  league: FakeDomesticWorld,
  season: LongRunSeasonResult,
  selectedClubId: FakeDomesticWorld["clubIds"][number],
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

/** Resolves the report club's current competition label from membership. */
function selectedCompetitionName(world: FakeDomesticWorld): string {
  const competitionId = competitionIdForClubInWorld(
    world.domesticCompetitionWorld,
    world.defaultSelectedClubId,
  );
  return competitionId === undefined
    ? "unknown"
    : world.domesticCompetitionWorld.competitions[competitionId]?.name ?? String(competitionId);
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
