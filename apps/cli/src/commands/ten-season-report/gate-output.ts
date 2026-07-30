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
    `Execution: ${formatExecutionSummary(report)}`,
    `${text("balance.status")}: ${report.failedWorldCount === 0 ? text("common.pass") : text("common.fail")}`,
    `${text("tenSeason.failedWorlds")}: ${report.failedWorldCount}`,
    `${text("tenSeason.warningWorlds")}: ${report.warningWorldCount}`,
    `Year-10 rating cap violations: ${report.ratingInflationViolationWorldCount}`,
    `Year-10 rating stock observations: ${report.yearTenRatingStockObservationCount}/${report.worldCount}`,
    `Year-10 six-star max: current=${report.yearTenCurrentSixMaximumObserved} potential=${report.yearTenPotentialSixMaximumObserved} lower_tier_potential=${report.yearTenLowerDivisionPotentialSixMaximumObserved}`,
    ...report.playerEconomyGates.map(
      (gate) =>
        `Phase 79D ${gate.key}: observations=${gate.observationCount} violations=${gate.violationCount} failed_worlds=${gate.failedWorldCount} not_evaluated_worlds=${gate.notEvaluatedWorldCount} target=${gate.threshold}`,
    ),
    `Calibration bundles: ${report.calibrationVersionBundles.map((bundle) => JSON.stringify(bundle)).join(" | ")}`,
    `Composition hashes: ${report.compositionHashes.map((row) => `${row.seed}:${row.hash}`).join(", ")}`,
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
    `Contract/finance structural violations: ${report.contractFinanceStructuralViolationCount}`,
    `Club cash floor (minor): ${report.minimumCashBalanceObserved}`,
    `Annual wage utilization max: ${report.maximumWageBudgetUtilizationObserved.toFixed(4)}`,
    `Annual wage utilization distribution: p50=${report.wageBudgetUtilizationP50.toFixed(4)} p90=${report.wageBudgetUtilizationP90.toFixed(4)} p95=${report.wageBudgetUtilizationP95.toFixed(4)} p99=${report.wageBudgetUtilizationP99.toFixed(4)} pressure_share=${report.wagePressureClubSeasonShare.toFixed(4)} exact_ceiling_share=${report.exactWageCeilingClubSeasonShare.toFixed(4)} above_budget_share=${report.aboveWageBudgetClubSeasonShare.toFixed(4)} reallocation_exact_ceiling=${report.reallocationExactCeilingClubSeasonCount}`,
    `Annual wage headroom (minor): p10=${report.annualWageHeadroomP10} p50=${report.annualWageHeadroomP50}`,
    `Free-agent share max: ${report.maximumFreeAgentShareObserved.toFixed(4)}`,
    `Useful free-agent stock max: ${report.maximumUsefulFreeAgentCountObserved}`,
    `Free-agent band observations: ${formatFreeAgentBands(report.freeAgentBandObservations)}`,
    `Permanent funnel: ${formatPermanentFunnel(report.permanentTransferFunnel)}`,
    `Preliminary funnel: ${formatPreliminaryFunnel(report.preliminaryAgreementFunnel)}`,
    `Permanent public values: ${formatMoneyDistribution(report.permanentTransferPublicValueDistribution)}`,
    `Permanent asking prices: ${formatMoneyDistribution(report.permanentTransferAskingPriceDistribution)}`,
    `Permanent completed fees: ${formatMoneyDistribution(report.permanentTransferCompletedFeeDistribution)}`,
    `Free-agent public values: ${formatMoneyDistribution(report.freeAgentPublicValueDistribution)}`,
    `Free-agent non-zero completed fees: ${report.freeAgentZeroFeeViolationCount}`,
    `Sampled player value min/max (minor): ${report.minimumPlayerValueObserved}..${report.maximumPlayerValueObserved}`,
    `Contract lifecycle: renewals=${report.renewalCount} releases=${report.releaseCount} expiries=${report.expiryCount} selected_expiry_decisions=${report.selectedClubExpiredDecisionCount}`,
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
    "# Senior Squad, Contracts And Club Finance Long-Run Gates Report",
    "",
    `Date: 2026-07-28`,
    `Seed prefix: \`${report.seedPrefix}\``,
    `Worlds: ${report.worldCount}`,
    `Seasons per world: ${report.seasonCount}`,
    `Total seasons: ${report.totalSeasonCount}`,
    `Execution: ${formatExecutionSummary(report)}`,
    `Status: ${report.failedWorldCount === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Aggregate Metrics",
    "",
    `- Failed worlds: ${report.failedWorldCount}`,
    `- Warning worlds: ${report.warningWorldCount}`,
    `- Year-10 rating-cap violation worlds: ${report.ratingInflationViolationWorldCount}`,
    `- Year-10 rating-stock observations: ${report.yearTenRatingStockObservationCount}/${report.worldCount}`,
    `- Year-10 current-six maximum observed: ${report.yearTenCurrentSixMaximumObserved}`,
    `- Year-10 potential-six maximum observed: ${report.yearTenPotentialSixMaximumObserved}`,
    `- Year-10 lower-tier potential-six maximum observed: ${report.yearTenLowerDivisionPotentialSixMaximumObserved}`,
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
    `- Contract/finance structural violations: ${report.contractFinanceStructuralViolationCount}`,
    `- Club cash floor (minor): ${report.minimumCashBalanceObserved}`,
    `- Maximum annual wage utilization: ${report.maximumWageBudgetUtilizationObserved.toFixed(4)}`,
    `- Annual wage utilization distribution: p50=${report.wageBudgetUtilizationP50.toFixed(4)}; p90=${report.wageBudgetUtilizationP90.toFixed(4)}; p95=${report.wageBudgetUtilizationP95.toFixed(4)}; p99=${report.wageBudgetUtilizationP99.toFixed(4)}; pressure share=${report.wagePressureClubSeasonShare.toFixed(4)}; exact ceiling share=${report.exactWageCeilingClubSeasonShare.toFixed(4)}; above budget share=${report.aboveWageBudgetClubSeasonShare.toFixed(4)}; reallocation exact ceiling count=${report.reallocationExactCeilingClubSeasonCount}`,
    `- Annual wage headroom (minor): p10=${report.annualWageHeadroomP10}; p50=${report.annualWageHeadroomP50}`,
    `- Maximum free-agent share: ${report.maximumFreeAgentShareObserved.toFixed(4)}`,
    `- Maximum useful free-agent stock: ${report.maximumUsefulFreeAgentCountObserved}`,
    `- Free-agent closing-stock band observations: ${formatFreeAgentBands(report.freeAgentBandObservations)}`,
    `- Permanent-transfer funnel: ${formatPermanentFunnel(report.permanentTransferFunnel)}`,
    `- Preliminary-agreement funnel: ${formatPreliminaryFunnel(report.preliminaryAgreementFunnel)}`,
    `- Permanent-transfer public values: ${formatMoneyDistribution(report.permanentTransferPublicValueDistribution)}`,
    `- Permanent-transfer asking prices: ${formatMoneyDistribution(report.permanentTransferAskingPriceDistribution)}`,
    `- Permanent-transfer completed fees: ${formatMoneyDistribution(report.permanentTransferCompletedFeeDistribution)}`,
    `- Free-agent public values: ${formatMoneyDistribution(report.freeAgentPublicValueDistribution)}`,
    `- Free-agent non-zero completed fees: ${report.freeAgentZeroFeeViolationCount}`,
    `- Sampled player value min/max (minor): ${report.minimumPlayerValueObserved}..${report.maximumPlayerValueObserved}`,
    `- Contract lifecycle: renewals=${report.renewalCount}; releases=${report.releaseCount}; expiries=${report.expiryCount}; selected expiry decisions=${report.selectedClubExpiredDecisionCount}`,
    `- Warning check counts: ${formatCheckCounts(report.warningCheckCounts)}`,
    `- Signal check counts: ${formatCheckCounts(report.signalCheckCounts)}`,
    `- Failing check counts: ${formatCheckCounts(report.failingCheckCounts)}`,
    "- Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk",
    "",
    "## Phase 79D Non-Vacuous Player And Market Gates",
    "",
    "| Gate | Observations | Violations | Failed worlds | Not evaluated worlds | Threshold |",
    "|---|---:|---:|---:|---:|---|",
    ...report.playerEconomyGates.map(
      (gate) =>
        `| \`${gate.key}\` | ${gate.observationCount} | ${gate.violationCount} | ${gate.failedWorldCount} | ${gate.notEvaluatedWorldCount} | ${gate.threshold} |`,
    ),
    "",
    "## Phase 79C Version And Replay Evidence",
    "",
    "Exact calibration bundles:",
    "",
    ...report.calibrationVersionBundles.map((bundle) => `- \`${JSON.stringify(bundle)}\``),
    "",
    "| Seed | Initial composition hash |",
    "|---|---|",
    ...report.compositionHashes.map((row) => `| \`${row.seed}\` | \`${row.hash}\` |`),
    "",
    "## Phase 79C Closing Division Economy",
    "",
    "### Wage Economy",
    "",
    "| Seed | Division | Clubs | Players | Wage P50/P90/P99 | Committed P50/P90/P99 | Utilization P50/P90/P99 | Headroom P10/P50 |",
    "|---|---|---:|---:|---|---|---|---|",
    ...report.divisionWageEconomySnapshots.map((row) =>
      `| \`${row.seed}\` | ${row.division} | ${row.clubCount} | ${row.playerCount} | ${row.annualWageP50}/${row.annualWageP90}/${row.annualWageP99} | ${row.committedAnnualWageP50}/${row.committedAnnualWageP90}/${row.committedAnnualWageP99} | ${row.wageBudgetUtilizationP50.toFixed(4)}/${row.wageBudgetUtilizationP90.toFixed(4)}/${row.wageBudgetUtilizationP99.toFixed(4)} | ${row.annualWageHeadroomP10}/${row.annualWageHeadroomP50} |`
    ),
    "",
    "### Cash, Transfer Room And Pending Exposure",
    "",
    "| Seed | Division | Cash P50/P90/P99 | Transfer room P50/P90/P99 | Pending cash P50/P90/P99 | Pending wage P50/P90/P99 | Attempts/completed/free agents |",
    "|---|---|---|---|---|---|---|",
    ...report.divisionMarketEconomySnapshots.map((row) =>
      `| \`${row.seed}\` | ${row.division} | ${row.cashBalanceP50}/${row.cashBalanceP90}/${row.cashBalanceP99} | ${row.availableTransferBudgetP50}/${row.availableTransferBudgetP90}/${row.availableTransferBudgetP99} | ${row.pendingCashExposureP50}/${row.pendingCashExposureP90}/${row.pendingCashExposureP99} | ${row.pendingAnnualWageExposureP50}/${row.pendingAnnualWageExposureP90}/${row.pendingAnnualWageExposureP99} | ${row.permanentAttemptCount}/${row.permanentCompletionCount}/${row.freeAgentSigningCount} |`
    ),
    "",
    "### Cross-Tier Permanent Transfers",
    "",
    "| Seed | Source -> destination | Attempts | Completed | Public value P50 | Asking P50 | Fee P50 | Rejections |",
    "|---|---|---:|---:|---:|---:|---:|---|",
    ...report.crossTierTransferSnapshots.map((row) =>
      `| \`${row.seed}\` | ${row.sourceDivision} -> ${row.destinationDivision} | ${row.attemptCount} | ${row.completionCount} | ${row.publicValueP50} | ${row.askingPriceP50} | ${row.completedFeeP50} | ${formatReasonCounts(row.rejectionReasonCounts)} |`
    ),
    "",
    "## Phase 79C Year-10 Exceptional Locations",
    "",
    ...report.yearTenExceptionalLocations.flatMap((world) => [
      `### ${world.seed}`,
      "",
      ...(world.locations.length === 0
        ? ["- none"]
        : world.locations.map((location) => `- \`${location}\``)),
      "",
    ]),
    "## Worst Worlds",
    "",
    "| Seed | Status | Min squad | Youth max | Active players | Below min | Youth above target | No GK | Contract/finance snapshot | Top assist max | Table spread snapshot | Creator snapshot | Warn checks | Fail checks |",
    "|---|---:|---:|---:|---|---:|---:|---:|---|---:|---|---|---|---|",
    ...report.worstWorlds.map(
      (world) =>
      `| \`${world.seed}\` | ${world.status.toUpperCase()} | ${world.minimumSquadSizeObserved} | ${world.maximumYouthRosterSizeObserved} | senior ${world.minimumSeniorPlayerCountObserved}..${world.maximumSeniorPlayerCountObserved}; youth ${world.minimumYouthPlayerCountObserved}..${world.maximumYouthPlayerCountObserved}; total ${world.minimumActivePlayerCountObserved}..${world.maximumActivePlayerCountObserved} | ${world.clubsBelowMinimumSquadSizeCount} | ${world.clubsAboveYouthTargetCount} | ${world.clubsWithoutNaturalGoalkeeperCount} | structural ${world.contractFinanceStructuralViolationCount}; cash ${world.minimumCashBalanceObserved}; wage ${world.maximumWageBudgetUtilizationObserved.toFixed(4)}; free agents ${world.maximumFreeAgentShareObserved.toFixed(4)}; values ${world.minimumPlayerValueObserved}..${world.maximumPlayerValueObserved}; renew/release/expiry ${world.renewalCount}/${world.releaseCount}/${world.expiryCount} | ${world.topAssistMax} | avg ${world.tablePointsSpreadAverage.toFixed(2)}; min ${world.tablePointsSpreadMin}; max ${world.tablePointsSpreadMax}; low season ${world.lowestTableSpreadSeasonNumber}; champion pts ${world.firstPlacePointsMin}..${world.firstPlacePointsMax}; last pts ${world.lastPlacePointsMin}..${world.lastPlacePointsMax}; ability spread ${world.initialClubAbilitySpread.toFixed(2)}->${world.finalClubAbilitySpread.toFixed(2)}; draw rate avg/max ${world.drawRateAverage.toFixed(3)}/${world.drawRateMax.toFixed(3)} | season ${world.topCreatorSeasonNumber}; ${world.topCreatorClubName}; ${world.topCreatorName}; assists ${world.topCreatorAssists}; team goals ${world.topCreatorClubGoals}; top1 ${world.topCreatorGoalShareMax.toFixed(2)}; top3 ${world.topThreeCreatorGoalShareMax.toFixed(2)}; top assist ${world.topAssistName}; top scorer ${world.topScorerName}:${world.topScorerGoals} | ${world.warningCheckKeys.join(", ") || "none"} | ${world.failingCheckKeys.join(", ") || "none"} |`,
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
    "## Market And Economy Diagnostic Worlds",
    "",
    "### Zero Permanent Completions Despite Recruitment Needs",
    "",
    "| Seed | Needs | Recruitable | Targets | Offers | Completed | Lost reasons |",
    "|---|---:|---:|---:|---:|---:|---|",
    ...report.zeroPermanentTransferWorlds.map(
      (world) =>
        `| \`${world.seed}\` | ${world.permanentTransferFunnel.needsEvaluatedCount} | ${world.permanentTransferFunnel.recruitableNeedCount} | ${world.permanentTransferFunnel.targetFoundCount} | ${world.permanentTransferFunnel.offerSubmittedCount} | ${world.completedTransferCount} | ${formatReasonCounts(world.permanentTransferFunnel.lostReasonCounts)} |`,
    ),
    "",
    "### Highest Useful Free-Agent Stock",
    "",
    "| Seed | Useful stock max | Free-agent share max |",
    "|---|---:|---:|",
    ...report.usefulFreeAgentWorlds.map(
      (world) =>
        `| \`${world.seed}\` | ${world.maximumUsefulFreeAgentCountObserved} | ${world.maximumFreeAgentShareObserved.toFixed(4)} |`,
    ),
    "",
    "### Broadest Wage Pressure",
    "",
    "| Seed | Pressure share | Exact ceiling share | Above budget share | Wage max |",
    "|---|---:|---:|---:|---:|",
    ...report.wagePressureWorlds.map(
      (world) =>
        `| \`${world.seed}\` | ${world.wagePressureClubSeasonShare.toFixed(4)} | ${world.exactWageCeilingClubSeasonShare.toFixed(4)} | ${world.aboveWageBudgetClubSeasonShare.toFixed(4)} | ${world.maximumWageBudgetUtilizationObserved.toFixed(4)} |`,
    ),
    "",
    "## Reproduction",
    "",
    "Run the same gate with:",
    "",
    "```bash",
    formatReproductionCommand(report, reportOutputPath),
    "```",
    "",
  ];

  return `${lines.join("\n")}`;
}

/**
 * Formats deterministic execution metadata for reproducible large gates.
 */
function formatExecutionSummary(report: LongRunGateReport): string {
  const shardSummary = report.execution.mode === "sharded"
    ? `; shards=${report.execution.shardCount ?? 0}; resumed=${report.execution.resumedShardCount ?? 0}`
    : "";
  return `${report.execution.mode}; workers=${report.execution.workerCount}${shardSummary}; partition_hashes=${report.execution.partitionHashes.join(",")}`;
}

/** Formats a command that preserves the execution strategy used by the report. */
function formatReproductionCommand(report: LongRunGateReport, reportOutputPath: string): string {
  const checkpointArgs = report.execution.mode === "sharded"
    ? ` --checkpoint-dir=<checkpoint-directory> --shards=${report.execution.shardCount ?? 1} --workers=${report.execution.workerCount}`
    : "";
  return `pnpm cli ten-season-report --seed-prefix=${report.seedPrefix} --worlds=${report.worldCount} --seasons=${report.seasonCount}${checkpointArgs} --report-output=${reportOutputPath}`;
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
      `  ${world.seed} status=${world.status} min_squad=${world.minimumSquadSizeObserved} youth_max=${world.maximumYouthRosterSizeObserved} active_players=senior:${world.minimumSeniorPlayerCountObserved}..${world.maximumSeniorPlayerCountObserved},youth:${world.minimumYouthPlayerCountObserved}..${world.maximumYouthPlayerCountObserved},total:${world.minimumActivePlayerCountObserved}..${world.maximumActivePlayerCountObserved} below_min=${world.clubsBelowMinimumSquadSizeCount} youth_above_target=${world.clubsAboveYouthTargetCount} youth_below_min=${world.clubsBelowYouthMinimumCount} no_gk=${world.clubsWithoutNaturalGoalkeeperCount} contract_finance=structural:${world.contractFinanceStructuralViolationCount},cash_min:${world.minimumCashBalanceObserved},wage_max:${world.maximumWageBudgetUtilizationObserved.toFixed(4)},free_agents_max:${world.maximumFreeAgentShareObserved.toFixed(4)},value:${world.minimumPlayerValueObserved}..${world.maximumPlayerValueObserved},renewals:${world.renewalCount},releases:${world.releaseCount},expiries:${world.expiryCount},selected_expiry_decisions:${world.selectedClubExpiredDecisionCount} top_assist_max=${world.topAssistMax} table_spread=avg:${world.tablePointsSpreadAverage.toFixed(2)},min:${world.tablePointsSpreadMin},max:${world.tablePointsSpreadMax},low_season:${world.lowestTableSpreadSeasonNumber},champion_pts:${world.firstPlacePointsMin}..${world.firstPlacePointsMax},last_pts:${world.lastPlacePointsMin}..${world.lastPlacePointsMax},ability_spread:${world.initialClubAbilitySpread.toFixed(2)}..${world.finalClubAbilitySpread.toFixed(2)} draw_rate=avg:${world.drawRateAverage.toFixed(3)},max:${world.drawRateMax.toFixed(3)},high_season:${world.highestDrawRateSeasonNumber} creator_snapshot=season:${world.topCreatorSeasonNumber},club:${world.topCreatorClubName},creator:${world.topCreatorName},assists:${world.topCreatorAssists},team_goals:${world.topCreatorClubGoals},top1:${world.topCreatorGoalShareMax.toFixed(2)},top3:${world.topThreeCreatorGoalShareMax.toFixed(2)},top_assist:${world.topAssistName},top_scorer:${world.topScorerName}:${world.topScorerGoals} warn_checks=${world.warningCheckKeys.join(",") || "none"} fail_checks=${world.failingCheckKeys.join(",") || "none"}`,
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

function formatPermanentFunnel(
  funnel: LongRunGateReport["permanentTransferFunnel"],
): string {
  return `needs=${funnel.needsEvaluatedCount}; recruitable=${funnel.recruitableNeedCount}; targets=${funnel.targetFoundCount}; unavailable=${funnel.targetUnavailableCount}; offers=${funnel.offerSubmittedCount}; seller rejected/countered/accepted/expired/withdrawn=${funnel.sellerRejectedCount}/${funnel.sellerCounteredCount}/${funnel.sellerAcceptedCount}/${funnel.sellerExpiredCount}/${funnel.sellerWithdrawnCount}; player started/countered/rejected/counter-accepted=${funnel.playerTermsStartedCount}/${funnel.playerCounteredCount}/${funnel.playerRejectedCount}/${funnel.playerCounterAcceptedCount}; unaffordable=${funnel.unaffordableCompletionCount}; completed=${funnel.completedCount}; lost reasons=${formatReasonCounts(funnel.lostReasonCounts)}`;
}

function formatPreliminaryFunnel(
  funnel: LongRunGateReport["preliminaryAgreementFunnel"],
): string {
  return `candidates=${funnel.candidateFoundCount}; unavailable=${funnel.candidateUnavailableCount}; offers=${funnel.offerSubmittedCount}; rejected/countered/counter-accepted/counter-rejected=${funnel.offerRejectedCount}/${funnel.counteredCount}/${funnel.counterAcceptedCount}/${funnel.counterRejectedCount}; agreements=${funnel.agreementCreatedCount}; expired=${funnel.expiredCount}; activations=${funnel.activationCount}; activation failures=${funnel.activationFailureCount}; lost reasons=${formatReasonCounts(funnel.lostReasonCounts)}`;
}

function formatReasonCounts(counts: Readonly<Record<string, number>>): string {
  const rows = Object.entries(counts);
  return rows.length === 0
    ? "none"
    : rows.map(([reason, count]) => `${reason}=${count}`).join(", ");
}

/** Formats one retained exact-money distribution without currency ambiguity. */
function formatMoneyDistribution(
  distribution: LongRunGateReport["permanentTransferPublicValueDistribution"],
): string {
  return `count=${distribution.count}; p50=${distribution.p50}; p90=${distribution.p90}; p99=${distribution.p99}; max=${distribution.maximum}`;
}

function formatFreeAgentBands(
  bands: LongRunGateReport["freeAgentBandObservations"],
): string {
  return `age under23/23-29/30-34/35+=${bands.age.under_23}/${bands.age.prime_23_29}/${bands.age.age_30_34}/${bands.age.age_35_plus}; ability <8/8-9/10-11/12+=${bands.currentAbility.under_8}/${bands.currentAbility.ability_8_9}/${bands.currentAbility.ability_10_11}/${bands.currentAbility.ability_12_plus}; unattached <1/1-2/3+ seasons=${bands.unattached.under_1_season}/${bands.unattached.one_to_two_seasons}/${bands.unattached.three_plus_seasons}`;
}
