import {
  createFakeLeagueSystem,
  generateCareerIntakePlayers,
  generateSeasonalYouthIntakePlayers,
  YOUTH_ACADEMY_POSITION_PLAN,
  type FakeLeagueSystem,
} from "@game/content";
import {
  advanceCareerOneSeason,
  type AdvanceCareerReportRefreshMode,
  type CareerIntakeCandidate,
  type YouthIntakeCandidate,
} from "@game/engine";
import type { Translator } from "@game/i18n";
import {
  createLongRunAnomalyReport,
  createLongRunClubStabilityReport,
  createLongRunPlayerEvolutionReport,
  createLongRunYouthStabilityReport,
  runCareerLongRunSimulation,
  worstLongRunAnomalyStatus,
  type CareerLongRunSeasonResult as LongRunSeasonResult,
  type LongRunAnomalyReport,
  type LongRunBalanceSeasonRow,
  type LongRunClubSeasonRow,
  type LongRunClubStabilityReport,
  type LongRunPlayerEvolutionReport,
  type LongRunPlayerProductionRow,
  type LongRunPlayerSnapshotRow,
  type LongRunYouthSeasonRow,
  type LongRunYouthStabilityReport,
} from "@game/simulation-tools";
import { careerStateFromNewWorld } from "../career/scenarios.ts";
import type { CliCareerState, CliPlayer, CliSaveId } from "../career/types.ts";
import { createCareerSeasonInput } from "../fake-season-input.ts";

/** Candidate pool size per club for long-run squad maintenance stress tests. */
const LONG_RUN_INTAKE_CANDIDATES_PER_CLUB = 8;

/** Minimum club goals needed before top-three creator share is treated as structurally meaningful. */
const MIN_GOALS_FOR_TOP_THREE_CREATOR_SHARE = 40;

/** Complete report bundle for one deterministic career world. */
export interface SingleWorldLongRunReport {
  /** Seed used to generate this world. */
  readonly seed: string;
  /** Generated fake league for this world. */
  readonly league: FakeLeagueSystem;
  /** Completed career-aware season rows. */
  readonly seasons: readonly LongRunSeasonResult[];
  /** Player-development and production report. */
  readonly playerEvolutionReport: LongRunPlayerEvolutionReport;
  /** Club-stability and squad-refresh report. */
  readonly clubStabilityReport: LongRunClubStabilityReport;
  /** Youth-academy population and lifecycle report. */
  readonly youthStabilityReport: LongRunYouthStabilityReport;
  /** Deterministic anomaly report. */
  readonly anomalyReport: LongRunAnomalyReport;
  /** Initial/final club ability hierarchy snapshot. */
  readonly strengthHierarchy: ClubAbilityHierarchySummary;
}

/** One world summary inside the explicit long-run regression gate. */
export interface LongRunGateWorldSummary {
  /** Stable generated world seed. */
  readonly seed: string;
  /** PASS/WARN/FAIL status for this world. */
  readonly status: LongRunAnomalyReport["status"];
  /** Average goals per match across this world run. */
  readonly goalsPerMatchAverage: number;
  /** Average draw rate across this world run. */
  readonly drawRateAverage: number;
  /** Highest draw rate observed in one season for this world. */
  readonly drawRateMax: number;
  /** Season number where the highest draw rate happened. */
  readonly highestDrawRateSeasonNumber: number;
  /** Number of distinct champions across this world run. */
  readonly uniqueChampionCount: number;
  /** Longest consecutive champion streak. */
  readonly longestChampionStreak: number;
  /** Club name that produced the longest champion streak. */
  readonly longestChampionStreakClubName: string;
  /** Lowest champion points during the longest streak. */
  readonly championStreakPointsMin: number;
  /** Highest champion points during the longest streak. */
  readonly championStreakPointsMax: number;
  /** Average table spread during the longest streak. */
  readonly championStreakTableSpreadAverage: number;
  /** Initial top-to-bottom club current-ability spread. */
  readonly initialClubAbilitySpread: number;
  /** Final top-to-bottom club current-ability spread. */
  readonly finalClubAbilitySpread: number;
  /** Average first-place points across this world run. */
  readonly firstPlacePointsAverage: number;
  /** Average last-place points across this world run. */
  readonly lastPlacePointsAverage: number;
  /** Average first-minus-last points spread across this world run. */
  readonly tablePointsSpreadAverage: number;
  /** Lowest first-minus-last spread observed in this world run. */
  readonly tablePointsSpreadMin: number;
  /** Highest first-minus-last spread observed in this world run. */
  readonly tablePointsSpreadMax: number;
  /** Season number where the lowest table spread happened. */
  readonly lowestTableSpreadSeasonNumber: number;
  /** Lowest champion points total observed in this world run. */
  readonly firstPlacePointsMin: number;
  /** Highest champion points total observed in this world run. */
  readonly firstPlacePointsMax: number;
  /** Lowest last-place points total observed in this world run. */
  readonly lastPlacePointsMin: number;
  /** Highest last-place points total observed in this world run. */
  readonly lastPlacePointsMax: number;
  /** Maximum top-assist count observed across this world run. */
  readonly topAssistMax: number;
  /** Season number where the strongest creator concentration happened. */
  readonly topCreatorSeasonNumber: number;
  /** Creator-concentration club name for compact gate diagnostics. */
  readonly topCreatorClubName: string;
  /** Creator name for compact gate diagnostics. */
  readonly topCreatorName: string;
  /** Creator assists for the concentration snapshot. */
  readonly topCreatorAssists: number;
  /** Goals scored by the creator's club in the concentration snapshot. */
  readonly topCreatorClubGoals: number;
  /** Highest single-creator club-goal share observed in this world. */
  readonly topCreatorGoalShareMax: number;
  /** Highest top-three creator club-goal share observed in this world. */
  readonly topThreeCreatorGoalShareMax: number;
  /** Global top-assist player name in the creator-concentration season. */
  readonly topAssistName: string;
  /** Global top-scorer player name in the creator-concentration season. */
  readonly topScorerName: string;
  /** Global top-scorer goals in the creator-concentration season. */
  readonly topScorerGoals: number;
  /** Final share of players aged 30 or older. */
  readonly age30PlusShare: number;
  /** Total transfer-turnover movements. */
  readonly transferTurnoverCount: number;
  /** Total squad-turnover movements and additions. */
  readonly squadTurnoverCount: number;
  /** Minimum roster size observed after refresh. */
  readonly minimumSquadSizeObserved: number;
  /** Club-season observations below minimum roster size. */
  readonly clubsBelowMinimumSquadSizeCount: number;
  /** Club-season observations without natural goalkeeper coverage. */
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  /** Role/depth warnings emitted across this world run. */
  readonly roleCoverageWarningCount: number;
  /** Maximum youth roster size observed after refresh. */
  readonly maximumYouthRosterSizeObserved: number;
  /** Minimum active senior player count observed. */
  readonly minimumSeniorPlayerCountObserved: number;
  /** Maximum active senior player count observed. */
  readonly maximumSeniorPlayerCountObserved: number;
  /** Minimum active academy player count observed. */
  readonly minimumYouthPlayerCountObserved: number;
  /** Maximum active academy player count observed. */
  readonly maximumYouthPlayerCountObserved: number;
  /** Minimum total active player count observed. */
  readonly minimumActivePlayerCountObserved: number;
  /** Maximum total active player count observed. */
  readonly maximumActivePlayerCountObserved: number;
  /** Club-season observations above youth roster target. */
  readonly clubsAboveYouthTargetCount: number;
  /** Club-season observations below youth roster minimum. */
  readonly clubsBelowYouthMinimumCount: number;
  /** Failing anomaly keys for this world. */
  readonly failingCheckKeys: readonly string[];
  /** Warning-level anomaly keys for this world. */
  readonly warningCheckKeys: readonly string[];
}

/** Aggregate report for an explicit long-run regression gate. */
export interface LongRunGateReport {
  /** Seed prefix used to derive world seeds. */
  readonly seedPrefix: string;
  /** Number of simulated worlds. */
  readonly worldCount: number;
  /** Number of seasons simulated per world. */
  readonly seasonCount: number;
  /** Total simulated seasons. */
  readonly totalSeasonCount: number;
  /** Number of worlds with failing anomaly checks. */
  readonly failedWorldCount: number;
  /** Number of worlds with warning-level anomaly checks. */
  readonly warningWorldCount: number;
  /** Minimum squad size observed across every world. */
  readonly minimumSquadSizeObserved: number;
  /** Total club-season observations below minimum roster size. */
  readonly clubsBelowMinimumSquadSizeCount: number;
  /** Total club-season observations without natural goalkeeper coverage. */
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  /** Total role/depth warnings emitted across every world. */
  readonly roleCoverageWarningCount: number;
  /** Maximum youth roster size observed across every world. */
  readonly maximumYouthRosterSizeObserved: number;
  /** Minimum active senior player count observed across every world. */
  readonly minimumSeniorPlayerCountObserved: number;
  /** Maximum active senior player count observed across every world. */
  readonly maximumSeniorPlayerCountObserved: number;
  /** Minimum active academy player count observed across every world. */
  readonly minimumYouthPlayerCountObserved: number;
  /** Maximum active academy player count observed across every world. */
  readonly maximumYouthPlayerCountObserved: number;
  /** Minimum total active player count observed across every world. */
  readonly minimumActivePlayerCountObserved: number;
  /** Maximum total active player count observed across every world. */
  readonly maximumActivePlayerCountObserved: number;
  /** Total club-season observations above youth roster target. */
  readonly clubsAboveYouthTargetCount: number;
  /** Total club-season observations below youth roster minimum. */
  readonly clubsBelowYouthMinimumCount: number;
  /** Average goals-per-match value across world averages. */
  readonly goalsPerMatchAverage: number;
  /** 95th percentile goals-per-match world average. */
  readonly goalsPerMatchP95: number;
  /** Average table spread across world averages. */
  readonly tablePointsSpreadAverage: number;
  /** Lowest table spread average observed across worlds. */
  readonly tablePointsSpreadMin: number;
  /** Average draw rate across world averages. */
  readonly drawRateAverage: number;
  /** Highest average draw rate observed across worlds. */
  readonly drawRateMax: number;
  /** Highest champion streak observed across worlds. */
  readonly championStreakMaxObserved: number;
  /** 95th percentile top-assist maximum per world. */
  readonly topAssistMaxP95: number;
  /** Highest top-assist maximum observed across all worlds. */
  readonly topAssistMaxObserved: number;
  /** Highest single-creator club-goal share observed across all worlds. */
  readonly topCreatorGoalShareMaxObserved: number;
  /** Highest top-three creator club-goal share observed across all worlds. */
  readonly topThreeCreatorGoalShareMaxObserved: number;
  /** 95th percentile final 30-plus player share per world. */
  readonly age30PlusShareP95: number;
  /** 95th percentile role/depth warnings per world. */
  readonly roleCoverageWarningP95: number;
  /** Warning-level anomaly counts grouped by stable check key. */
  readonly warningCheckCounts: readonly LongRunGateCheckCount[];
  /** Warning-level checks grouped by gameplay meaning. */
  readonly signalCheckCounts: readonly LongRunGateCheckCount[];
  /** Failing anomaly counts grouped by stable check key. */
  readonly failingCheckCounts: readonly LongRunGateCheckCount[];
  /** Reproducible worst worlds sorted by severity. */
  readonly worstWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the strongest assist or creator-concentration stories. */
  readonly productionWarningWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the longest champion streaks. */
  readonly dynastyWarningWorlds: readonly LongRunGateWorldSummary[];
  /** Worlds with the tightest average first-to-last table spread. */
  readonly tableSpreadWarningWorlds: readonly LongRunGateWorldSummary[];
}

/** Aggregate count for one anomaly key in a batch gate report. */
export interface LongRunGateCheckCount {
  /** Stable anomaly check key. */
  readonly key: string;
  /** Number of worlds that emitted this status for the key. */
  readonly count: number;
}

/**
 * Builds the full single-world report bundle used by both normal output and
 * long-run batch gates. Keeping one path avoids report drift.
 */
export function createSingleWorldReport(seed: string, seasonCount: number, text: Translator): SingleWorldLongRunReport {
  const league = createFakeLeagueSystem({ worldSeed: seed });
  const initialCareerState = careerStateFromNewWorld("save:ten-season-report" as CliSaveId, league, seed);
  const report = runCareerLongRunSimulation({
    seed,
    seasonCount,
    initialCareerState,
    createSeasonInput: ({ seasonSeed, careerState }) => createCareerSeasonInput(league, careerState, seasonSeed),
    advanceCareerState: (context) => advanceCareerForReport(league, seed, context),
  });
  const playerEvolutionReport = createLongRunPlayerEvolutionReport({
    initialPlayers: snapshotPlayers(initialCareerState),
    finalPlayers: snapshotPlayers(report.finalCareerState as CliCareerState),
    production: productionRows(report.finalCareerState as CliCareerState, report.seasons, text),
    usefulPlayerCurrentAbilityThreshold: 12,
  });
  const clubStabilityReport = createLongRunClubStabilityReport(clubSeasonRows(league, report.seasons), refreshTotals(report.seasons));
  const youthStabilityReport = createLongRunYouthStabilityReport(youthSeasonRows(report.seasons));
  const anomalyReport = createLongRunAnomalyReport({
    balance: balanceSeasonRows(report.seasons),
    playerEvolution: playerEvolutionReport,
    clubStability: clubStabilityReport,
  });

  return {
    seed,
    league,
    seasons: report.seasons,
    playerEvolutionReport,
    clubStabilityReport,
    youthStabilityReport,
    anomalyReport,
    strengthHierarchy: summarizeClubAbilityHierarchy(league, initialCareerState, report.finalCareerState as CliCareerState),
  };
}

/**
 * Runs an explicit multi-world long-run gate and returns compact aggregate
 * metrics. This is intentionally outside `pnpm check` because large gates can
 * be expensive.
 */
export async function createLongRunGateReport(input: {
  readonly seedPrefix: string;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly text: Translator;
}): Promise<LongRunGateReport> {
  const worlds: LongRunGateWorldSummary[] = [];

  for (let index = 1; index <= input.worldCount; index += 1) {
    const seed = `${input.seedPrefix}-world-${String(index).padStart(5, "0")}`;
    const report = createSingleWorldReport(seed, input.seasonCount, input.text);
    worlds.push(summarizeGateWorld(report));
  }

  return summarizeGateWorlds(input.seedPrefix, input.worldCount, input.seasonCount, worlds);
}

/**
 * Extracts compact world-level gate metrics from one full report bundle.
 */
function summarizeGateWorld(report: SingleWorldLongRunReport): LongRunGateWorldSummary {
  const finalAgeTotal =
    report.playerEvolutionReport.finalAgeUnder22 +
    report.playerEvolutionReport.finalAge22To29 +
    report.playerEvolutionReport.finalAge30Plus;
  const concentration = topCreatorConcentrationProductionRow(report.playerEvolutionReport.production);
  const balanceRows = balanceSeasonRows(report.seasons);
  const tableSpreadSnapshot = summarizeTableSpread(balanceRows);
  const drawSnapshot = summarizeDrawRates(report.seasons);
  const championStreakSnapshot = summarizeChampionStreak(report.clubStabilityReport.seasons, balanceRows);

  return {
    seed: report.seed,
    status: worstLongRunAnomalyStatus([report.anomalyReport.status, report.youthStabilityReport.status]),
    goalsPerMatchAverage: roundReportNumber(average(balanceRows.map((season) => season.goalsPerMatch))),
    drawRateAverage: drawSnapshot.average,
    drawRateMax: drawSnapshot.max,
    highestDrawRateSeasonNumber: drawSnapshot.highestSeasonNumber,
    uniqueChampionCount: report.clubStabilityReport.uniqueChampionCount,
    longestChampionStreak: championStreakSnapshot.length,
    longestChampionStreakClubName: championStreakSnapshot.clubName,
    championStreakPointsMin: championStreakSnapshot.pointsMin,
    championStreakPointsMax: championStreakSnapshot.pointsMax,
    championStreakTableSpreadAverage: championStreakSnapshot.tableSpreadAverage,
    initialClubAbilitySpread: report.strengthHierarchy.initial.spread,
    finalClubAbilitySpread: report.strengthHierarchy.final.spread,
    firstPlacePointsAverage: tableSpreadSnapshot.firstPlacePointsAverage,
    lastPlacePointsAverage: tableSpreadSnapshot.lastPlacePointsAverage,
    tablePointsSpreadAverage: tableSpreadSnapshot.tablePointsSpreadAverage,
    tablePointsSpreadMin: tableSpreadSnapshot.tablePointsSpreadMin,
    tablePointsSpreadMax: tableSpreadSnapshot.tablePointsSpreadMax,
    lowestTableSpreadSeasonNumber: tableSpreadSnapshot.lowestTableSpreadSeasonNumber,
    firstPlacePointsMin: tableSpreadSnapshot.firstPlacePointsMin,
    firstPlacePointsMax: tableSpreadSnapshot.firstPlacePointsMax,
    lastPlacePointsMin: tableSpreadSnapshot.lastPlacePointsMin,
    lastPlacePointsMax: tableSpreadSnapshot.lastPlacePointsMax,
    topAssistMax: Math.max(...report.playerEvolutionReport.production.map((row) => row.topAssists), 0),
    topCreatorSeasonNumber: concentration?.seasonNumber ?? 0,
    topCreatorClubName: concentration?.topCreatorClubName ?? "unavailable",
    topCreatorName: concentration?.topCreatorName ?? "unavailable",
    topCreatorAssists: concentration?.topCreatorAssists ?? 0,
    topCreatorClubGoals: concentration?.topCreatorClubGoals ?? 0,
    topCreatorGoalShareMax: concentration?.topAssistClubGoalShare ?? 0,
    topThreeCreatorGoalShareMax: concentration?.topThreeAssistClubGoalShare ?? 0,
    topAssistName: concentration?.topAssistName ?? "unavailable",
    topScorerName: concentration?.topScorerName ?? "unavailable",
    topScorerGoals: concentration?.topScorerGoals ?? 0,
    age30PlusShare: finalAgeTotal === 0 ? 0 : roundReportNumber(report.playerEvolutionReport.finalAge30Plus / finalAgeTotal),
    transferTurnoverCount: report.clubStabilityReport.transferTurnoverCount,
    squadTurnoverCount:
      report.clubStabilityReport.playerExitCount +
      report.clubStabilityReport.squadMaintenanceAddedCount +
      report.clubStabilityReport.transferTurnoverCount,
    minimumSquadSizeObserved: report.clubStabilityReport.minimumSquadSizeObserved,
    clubsBelowMinimumSquadSizeCount: report.clubStabilityReport.clubsBelowMinimumSquadSizeCount,
    clubsWithoutNaturalGoalkeeperCount: report.clubStabilityReport.clubsWithoutNaturalGoalkeeperCount,
    roleCoverageWarningCount: report.clubStabilityReport.roleCoverageWarningCount,
    maximumYouthRosterSizeObserved: report.youthStabilityReport.maximumYouthRosterSizeObserved,
    minimumSeniorPlayerCountObserved: report.youthStabilityReport.minimumSeniorPlayerCountObserved,
    maximumSeniorPlayerCountObserved: report.youthStabilityReport.maximumSeniorPlayerCountObserved,
    minimumYouthPlayerCountObserved: report.youthStabilityReport.minimumYouthPlayerCountObserved,
    maximumYouthPlayerCountObserved: report.youthStabilityReport.maximumYouthPlayerCountObserved,
    minimumActivePlayerCountObserved: report.youthStabilityReport.minimumActivePlayerCountObserved,
    maximumActivePlayerCountObserved: report.youthStabilityReport.maximumActivePlayerCountObserved,
    clubsAboveYouthTargetCount: report.youthStabilityReport.clubsAboveYouthTargetCount,
    clubsBelowYouthMinimumCount: report.youthStabilityReport.clubsBelowYouthMinimumCount,
    failingCheckKeys: [
      ...report.anomalyReport.checks.filter((check) => check.status === "fail").map((check) => check.key),
      ...report.youthStabilityReport.checks.filter((check) => check.status === "fail").map((check) => check.key),
    ],
    warningCheckKeys: [
      ...report.anomalyReport.checks.filter((check) => check.status === "warn").map((check) => check.key),
      ...report.youthStabilityReport.checks.filter((check) => check.status === "warn").map((check) => check.key),
    ],
  };
}

/** Compact table-spread snapshot for one world in a long-run gate. */
interface TableSpreadSnapshot {
  /** Average first-place points. */
  readonly firstPlacePointsAverage: number;
  /** Average last-place points. */
  readonly lastPlacePointsAverage: number;
  /** Average first-minus-last spread. */
  readonly tablePointsSpreadAverage: number;
  /** Lowest season spread. */
  readonly tablePointsSpreadMin: number;
  /** Highest season spread. */
  readonly tablePointsSpreadMax: number;
  /** Season number where the lowest spread happened. */
  readonly lowestTableSpreadSeasonNumber: number;
  /** Lowest champion points. */
  readonly firstPlacePointsMin: number;
  /** Highest champion points. */
  readonly firstPlacePointsMax: number;
  /** Lowest last-place points. */
  readonly lastPlacePointsMin: number;
  /** Highest last-place points. */
  readonly lastPlacePointsMax: number;
}

/** Compact draw-rate snapshot for one world in a long-run gate. */
interface DrawRateSnapshot {
  /** Average draw rate across the world run. */
  readonly average: number;
  /** Highest single-season draw rate. */
  readonly max: number;
  /** Season number where the highest draw rate happened. */
  readonly highestSeasonNumber: number;
}

/** Compact snapshot of the longest champion run in one world. */
interface ChampionStreakSnapshot {
  /** Consecutive titles in the streak. */
  readonly length: number;
  /** Club name that won the streak. */
  readonly clubName: string;
  /** Lowest champion points total inside the streak. */
  readonly pointsMin: number;
  /** Highest champion points total inside the streak. */
  readonly pointsMax: number;
  /** Average table spread across the streak seasons. */
  readonly tableSpreadAverage: number;
}

/** One side of a club current-ability hierarchy snapshot. */
export interface ClubAbilityHierarchyEdge {
  /** Club name at the edge of the hierarchy. */
  readonly clubName: string;
  /** Average senior current ability for the club. */
  readonly averageCurrentAbility: number;
}

/** One current-ability hierarchy snapshot for all senior club squads. */
export interface ClubAbilityHierarchySnapshot {
  /** Strongest average senior squad. */
  readonly top: ClubAbilityHierarchyEdge;
  /** Weakest average senior squad. */
  readonly bottom: ClubAbilityHierarchyEdge;
  /** Top average minus bottom average. */
  readonly spread: number;
}

/** Initial/final current-ability hierarchy snapshot for one long run. */
export interface ClubAbilityHierarchySummary {
  /** Hierarchy before long-run seasons are simulated. */
  readonly initial: ClubAbilityHierarchySnapshot;
  /** Hierarchy after long-run refresh/development. */
  readonly final: ClubAbilityHierarchySnapshot;
}

/**
 * Summarizes table compression without changing anomaly thresholds.
 */
function summarizeTableSpread(rows: readonly LongRunBalanceSeasonRow[]): TableSpreadSnapshot {
  let lowestSpreadRowIndex = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const currentLowest = rows[lowestSpreadRowIndex];

    if (row !== undefined && currentLowest !== undefined && row.tablePointsSpread < currentLowest.tablePointsSpread) {
      lowestSpreadRowIndex = index;
    }
  }

  return {
    firstPlacePointsAverage: roundReportNumber(average(rows.map((row) => row.firstPlacePoints))),
    lastPlacePointsAverage: roundReportNumber(average(rows.map((row) => row.lastPlacePoints))),
    tablePointsSpreadAverage: roundReportNumber(average(rows.map((row) => row.tablePointsSpread))),
    tablePointsSpreadMin: Math.min(...rows.map((row) => row.tablePointsSpread)),
    tablePointsSpreadMax: Math.max(...rows.map((row) => row.tablePointsSpread)),
    lowestTableSpreadSeasonNumber: lowestSpreadRowIndex + 1,
    firstPlacePointsMin: Math.min(...rows.map((row) => row.firstPlacePoints)),
    firstPlacePointsMax: Math.max(...rows.map((row) => row.firstPlacePoints)),
    lastPlacePointsMin: Math.min(...rows.map((row) => row.lastPlacePoints)),
    lastPlacePointsMax: Math.max(...rows.map((row) => row.lastPlacePoints)),
  };
}

/**
 * Summarizes draw concentration because high draw rates can compress a table
 * even when goals and squad structure look healthy.
 */
function summarizeDrawRates(seasons: readonly LongRunSeasonResult[]): DrawRateSnapshot {
  let highestSeasonIndex = 0;
  const rates = seasons.map((season) => drawRate(season));

  for (let index = 1; index < rates.length; index += 1) {
    if ((rates[index] ?? 0) > (rates[highestSeasonIndex] ?? 0)) {
      highestSeasonIndex = index;
    }
  }

  return {
    average: roundReportNumber(average(rates)),
    max: roundReportNumber(rates[highestSeasonIndex] ?? 0),
    highestSeasonNumber: highestSeasonIndex + 1,
  };
}

/**
 * Summarizes the longest title streak with table context so dynasties can be
 * judged as football stories before changing thresholds.
 */
function summarizeChampionStreak(
  clubRows: readonly LongRunClubSeasonRow[],
  balanceRows: readonly LongRunBalanceSeasonRow[],
): ChampionStreakSnapshot {
  let bestStartIndex = 0;
  let bestLength = 0;
  let currentStartIndex = 0;
  let currentLength = 0;
  let previousChampionId = "";

  for (let index = 0; index < clubRows.length; index += 1) {
    const row = clubRows[index];
    if (row === undefined) {
      continue;
    }

    if (row.championClubId === previousChampionId) {
      currentLength += 1;
    } else {
      currentStartIndex = index;
      currentLength = 1;
      previousChampionId = row.championClubId;
    }

    if (currentLength > bestLength) {
      bestStartIndex = currentStartIndex;
      bestLength = currentLength;
    }
  }

  const streakRows = clubRows.slice(bestStartIndex, bestStartIndex + bestLength);
  const spreadRows = balanceRows.slice(bestStartIndex, bestStartIndex + bestLength);
  const firstRow = streakRows[0];

  return {
    length: bestLength,
    clubName: firstRow?.championClubName ?? "unavailable",
    pointsMin: Math.min(...streakRows.map((row) => row.championPoints)),
    pointsMax: Math.max(...streakRows.map((row) => row.championPoints)),
    tableSpreadAverage: roundReportNumber(average(spreadRows.map((row) => row.tablePointsSpread))),
  };
}

/**
 * Summarizes whether senior squad current ability stays separated by club.
 *
 * This is diagnostic only: it reads existing players and does not alter
 * development, transfers, lineups, or match simulation.
 */
function summarizeClubAbilityHierarchy(
  league: FakeLeagueSystem,
  initialCareerState: CliCareerState,
  finalCareerState: CliCareerState,
): ClubAbilityHierarchySummary {
  return {
    initial: summarizeClubAbilityHierarchySnapshot(league, initialCareerState),
    final: summarizeClubAbilityHierarchySnapshot(league, finalCareerState),
  };
}

/**
 * Computes the top-to-bottom average current-ability spread for senior squads.
 */
function summarizeClubAbilityHierarchySnapshot(
  league: FakeLeagueSystem,
  careerState: CliCareerState,
): ClubAbilityHierarchySnapshot {
  const rows = careerState.gameState.clubIds.map((clubId) => {
    const club = careerState.gameState.clubs[clubId];
    const playerIds = club?.playerIds ?? [];
    const averageCurrentAbility = roundReportNumber(
      average(
        playerIds.flatMap((playerId): readonly number[] => {
          const player = careerState.gameState.players[playerId];
          return player === undefined ? [] : [averageAbility(player.abilities)];
        }),
      ),
    );

    return {
      clubId: String(clubId),
      clubName: clubLabel(league, clubId),
      averageCurrentAbility,
    };
  });

  const ordered = rows.sort(
    (left, right) => right.averageCurrentAbility - left.averageCurrentAbility || left.clubId.localeCompare(right.clubId),
  );
  const top = ordered[0];
  const bottom = ordered[ordered.length - 1];

  if (top === undefined || bottom === undefined) {
    throw new Error("Cannot summarize club ability hierarchy without clubs");
  }

  return {
    top: {
      clubName: top.clubName,
      averageCurrentAbility: top.averageCurrentAbility,
    },
    bottom: {
      clubName: bottom.clubName,
      averageCurrentAbility: bottom.averageCurrentAbility,
    },
    spread: roundReportNumber(top.averageCurrentAbility - bottom.averageCurrentAbility),
  };
}

/**
 * Finds the production row that drives the maximum single-creator share.
 */
function topCreatorConcentrationProductionRow(
  rows: readonly LongRunPlayerProductionRow[],
): LongRunPlayerProductionRow | undefined {
  let best: LongRunPlayerProductionRow | undefined;

  for (const row of rows) {
    if (
      best === undefined ||
      row.topAssistClubGoalShare > best.topAssistClubGoalShare ||
      (row.topAssistClubGoalShare === best.topAssistClubGoalShare && row.topCreatorAssists > best.topCreatorAssists) ||
      (row.topAssistClubGoalShare === best.topAssistClubGoalShare &&
        row.topCreatorAssists === best.topCreatorAssists &&
        row.seasonNumber < best.seasonNumber)
    ) {
      best = row;
    }
  }

  return best;
}

/**
 * Aggregates per-world summaries into the final gate report.
 */
function summarizeGateWorlds(
  seedPrefix: string,
  worldCount: number,
  seasonCount: number,
  worlds: readonly LongRunGateWorldSummary[],
): LongRunGateReport {
  return {
    seedPrefix,
    worldCount,
    seasonCount,
    totalSeasonCount: worldCount * seasonCount,
    failedWorldCount: worlds.filter((world) => world.status === "fail").length,
    warningWorldCount: worlds.filter((world) => world.status === "warn").length,
    minimumSquadSizeObserved: Math.min(...worlds.map((world) => world.minimumSquadSizeObserved)),
    clubsBelowMinimumSquadSizeCount: worlds.reduce((sum, world) => sum + world.clubsBelowMinimumSquadSizeCount, 0),
    clubsWithoutNaturalGoalkeeperCount: worlds.reduce((sum, world) => sum + world.clubsWithoutNaturalGoalkeeperCount, 0),
    roleCoverageWarningCount: worlds.reduce((sum, world) => sum + world.roleCoverageWarningCount, 0),
    maximumYouthRosterSizeObserved: Math.max(...worlds.map((world) => world.maximumYouthRosterSizeObserved)),
    minimumSeniorPlayerCountObserved: Math.min(...worlds.map((world) => world.minimumSeniorPlayerCountObserved)),
    maximumSeniorPlayerCountObserved: Math.max(...worlds.map((world) => world.maximumSeniorPlayerCountObserved)),
    minimumYouthPlayerCountObserved: Math.min(...worlds.map((world) => world.minimumYouthPlayerCountObserved)),
    maximumYouthPlayerCountObserved: Math.max(...worlds.map((world) => world.maximumYouthPlayerCountObserved)),
    minimumActivePlayerCountObserved: Math.min(...worlds.map((world) => world.minimumActivePlayerCountObserved)),
    maximumActivePlayerCountObserved: Math.max(...worlds.map((world) => world.maximumActivePlayerCountObserved)),
    clubsAboveYouthTargetCount: worlds.reduce((sum, world) => sum + world.clubsAboveYouthTargetCount, 0),
    clubsBelowYouthMinimumCount: worlds.reduce((sum, world) => sum + world.clubsBelowYouthMinimumCount, 0),
    goalsPerMatchAverage: roundReportNumber(average(worlds.map((world) => world.goalsPerMatchAverage))),
    goalsPerMatchP95: percentile(worlds.map((world) => world.goalsPerMatchAverage), 0.95),
    tablePointsSpreadAverage: roundReportNumber(average(worlds.map((world) => world.tablePointsSpreadAverage))),
    tablePointsSpreadMin: Math.min(...worlds.map((world) => world.tablePointsSpreadAverage)),
    drawRateAverage: roundReportNumber(average(worlds.map((world) => world.drawRateAverage))),
    drawRateMax: Math.max(...worlds.map((world) => world.drawRateAverage)),
    championStreakMaxObserved: Math.max(...worlds.map((world) => world.longestChampionStreak)),
    topAssistMaxP95: percentile(worlds.map((world) => world.topAssistMax), 0.95),
    topAssistMaxObserved: Math.max(...worlds.map((world) => world.topAssistMax)),
    topCreatorGoalShareMaxObserved: Math.max(...worlds.map((world) => world.topCreatorGoalShareMax)),
    topThreeCreatorGoalShareMaxObserved: Math.max(...worlds.map((world) => world.topThreeCreatorGoalShareMax)),
    age30PlusShareP95: percentile(worlds.map((world) => world.age30PlusShare), 0.95),
    roleCoverageWarningP95: percentile(worlds.map((world) => world.roleCoverageWarningCount), 0.95),
    warningCheckCounts: countCheckKeys(worlds.flatMap((world) => world.warningCheckKeys)),
    signalCheckCounts: countSignalKinds(worlds.flatMap((world) => world.warningCheckKeys)),
    failingCheckCounts: countCheckKeys(worlds.flatMap((world) => world.failingCheckKeys)),
    worstWorlds: [...worlds].sort(compareWorstGateWorld).slice(0, 10),
    productionWarningWorlds: [...worlds].sort(compareProductionWarningWorld).slice(0, 10),
    dynastyWarningWorlds: [...worlds].sort(compareDynastyWarningWorld).slice(0, 10),
    tableSpreadWarningWorlds: [...worlds].sort(compareTableSpreadWarningWorld).slice(0, 10),
  };
}

/**
 * Sorts worlds by assist/creator concentration so warning audits can review
 * standout-playmaker stories without changing anomaly scoring.
 */
function compareProductionWarningWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  return (
    right.topAssistMax - left.topAssistMax ||
    right.topCreatorGoalShareMax - left.topCreatorGoalShareMax ||
    right.topThreeCreatorGoalShareMax - left.topThreeCreatorGoalShareMax ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Sorts worlds by longest title run for dynasty warning audits.
 */
function compareDynastyWarningWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  return (
    right.longestChampionStreak - left.longestChampionStreak ||
    right.championStreakTableSpreadAverage - left.championStreakTableSpreadAverage ||
    right.transferTurnoverCount - left.transferTurnoverCount ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Sorts worlds by the tightest long-run table spread for compression audits.
 */
function compareTableSpreadWarningWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  return (
    left.tablePointsSpreadAverage - right.tablePointsSpreadAverage ||
    left.tablePointsSpreadMin - right.tablePointsSpreadMin ||
    left.firstPlacePointsAverage - right.firstPlacePointsAverage ||
    right.lastPlacePointsAverage - left.lastPlacePointsAverage ||
    left.seed.localeCompare(right.seed)
  );
}

/**
 * Counts anomaly keys and returns them sorted by frequency, then key.
 */
function countCheckKeys(keys: readonly string[]): readonly LongRunGateCheckCount[] {
  const counts = new Map<string, number>();

  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

/**
 * Groups warning-level checks by player-facing meaning.
 *
 * This is report language only: it does not change anomaly keys, thresholds, or
 * final gate status.
 */
function countSignalKinds(keys: readonly string[]): readonly LongRunGateCheckCount[] {
  return countCheckKeys(keys.map(signalKindForCheckKey));
}

/**
 * Classifies a stable check key by how a designer should read it.
 */
function signalKindForCheckKey(key: string): string {
  switch (key) {
    case "top_assist_max":
    case "champion_streak":
    case "table_points_spread_avg":
      return "story";
    case "top_creator_goal_share_max":
    case "top_three_creator_goal_share_max":
    case "role_coverage_warning_count":
    case "goals_per_match_avg":
    case "age_30_plus_share":
    case "useful_players_after_long_run":
    case "transfer_turnover_available":
    case "squad_turnover_available":
    case "senior_active_player_population":
    case "youth_active_player_population":
    case "total_active_player_population":
      return "monitor";
    default:
      return "structural";
  }
}

/**
 * Sorts gate worlds by failure severity, then by structural collapse signals,
 * then by stable seed for deterministic output.
 */
function compareWorstGateWorld(left: LongRunGateWorldSummary, right: LongRunGateWorldSummary): number {
  const statusDelta = gateStatusSeverity(right.status) - gateStatusSeverity(left.status);
  if (statusDelta !== 0) {
    return statusDelta;
  }

  const structuralDelta =
    right.clubsBelowMinimumSquadSizeCount +
    right.clubsWithoutNaturalGoalkeeperCount -
    (left.clubsBelowMinimumSquadSizeCount + left.clubsWithoutNaturalGoalkeeperCount);
  if (structuralDelta !== 0) {
    return structuralDelta;
  }

  return left.seed.localeCompare(right.seed);
}

/**
 * Converts PASS/WARN/FAIL into a sortable severity value.
 */
function gateStatusSeverity(status: LongRunAnomalyReport["status"]): number {
  if (status === "fail") {
    return 2;
  }

  if (status === "warn") {
    return 1;
  }

  return 0;
}


/**
 * Applies deterministic post-season career refresh in memory for the report.
 */
function advanceCareerForReport(
  league: FakeLeagueSystem,
  worldSeed: string,
  context: Parameters<typeof runCareerLongRunSimulation>[0]["advanceCareerState"] extends (value: infer Context) => unknown ? Context : never,
): ReturnType<Parameters<typeof runCareerLongRunSimulation>[0]["advanceCareerState"]> {
  const nextSeasonId =
    `${context.careerState.gameState.calendar.currentSeasonId}:long-run-${context.seasonNumber}` as AdvanceCareerReportRefreshMode["nextSeasonId"];
  const nextSeasonStartDate = (context.careerState.gameState.calendar.currentDate + 365) as AdvanceCareerReportRefreshMode["nextSeasonStartDate"];
  const advanced = advanceCareerOneSeason({
    careerState: context.careerState,
    worldSeed,
    mode: {
      kind: "reportRefresh",
      nextSeasonId,
      nextSeasonStartDate,
    },
    createYouthIntakeCandidates: (candidateContext) =>
      youthIntakeCandidatesForCareer(candidateContext.careerState as CliCareerState, worldSeed, context.seasonNumber),
    createSeniorIntakeCandidates: (candidateContext) =>
      intakeCandidatesForCareer(league, candidateContext.careerState as CliCareerState, worldSeed, context.seasonNumber),
  });

  if (advanced.status !== "advanced") {
    throw new Error(`Cannot advance report career season ${context.seasonNumber}: ${advanced.reason}`);
  }

  return {
    careerState: advanced.careerState,
    refresh: {
      exitCount: advanced.facts.playerExits.exitCount,
      exitReasons: {
        retirement: advanced.facts.playerExits.reasons.retirement,
        released: advanced.facts.playerExits.reasons.released,
        careerStepDown: advanced.facts.playerExits.reasons.career_step_down,
      },
      intakeCount: advanced.facts.squadMaintenance.candidateCount,
      squadMaintenanceAddedCount: advanced.facts.squadMaintenance.addedPlayerCount,
      youthPromotionCount: advanced.facts.youthPromotions.promotedCount,
      youthIntakeCount: advanced.facts.youthIntake.acceptedPlayerCount,
      youthExitCount: advanced.facts.youthLifecycle.recordCount,
      transferTurnoverCount: advanced.facts.transferTurnover.transferCount,
      seniorPlayerCount: advanced.facts.squadHealth.seniorPlayerCount,
      youthPlayerCount: advanced.facts.youthHealth.youthPlayerCount,
      activePlayerCount: advanced.facts.youthHealth.activePlayerCount,
      minimumSquadSize: advanced.facts.squadHealth.minimumSquadSize,
      averageSquadSize: advanced.facts.squadHealth.averageSquadSize,
      maximumSquadSize: advanced.facts.squadHealth.maximumSquadSize,
      clubsBelowMinimumSquadSize: advanced.facts.squadHealth.clubsBelowMinimumSquadSize,
      clubsWithoutNaturalGoalkeeper: advanced.facts.squadHealth.clubsWithoutNaturalGoalkeeper,
      roleCoverageWarningCount: advanced.facts.squadMaintenance.warningCount,
      minimumYouthRosterSize: advanced.facts.youthHealth.minimumYouthRosterSize,
      averageYouthRosterSize: advanced.facts.youthHealth.averageYouthRosterSize,
      maximumYouthRosterSize: advanced.facts.youthHealth.maximumYouthRosterSize,
      selectedClubYouthSize: advanced.facts.youthHealth.selectedClubYouthSize,
      clubsAboveYouthTarget: advanced.facts.youthHealth.clubsAboveYouthTarget,
      clubsBelowYouthMinimum: advanced.facts.youthHealth.clubsBelowYouthMinimum,
    },
  };
}

function intakeCandidatesForCareer(
  league: FakeLeagueSystem,
  careerState: CliCareerState,
  worldSeed: string,
  seasonNumber: number,
): readonly CareerIntakeCandidate[] {
  const candidates: CareerIntakeCandidate[] = [];

  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    const generated = generateCareerIntakePlayers({
      worldSeed,
      seasonId: `${careerState.gameState.calendar.currentSeasonId}:intake-${seasonNumber}` as Parameters<
        typeof generateCareerIntakePlayers
      >[0]["seasonId"],
      clubId,
      clubContext: {
        category: club.category,
        reputation: club.reputation,
      },
      count: LONG_RUN_INTAKE_CANDIDATES_PER_CLUB,
      referenceDate: careerState.gameState.calendar.currentDate,
    });

    for (const player of generated.generatedPlayers) {
      candidates.push({
        player: player.player,
        playerState: player.playerState,
        targetClubId: clubId,
      });
    }
  }

  return candidates;
}

function youthIntakeCandidatesForCareer(
  careerState: CliCareerState,
  worldSeed: string,
  seasonNumber: number,
): readonly YouthIntakeCandidate[] {
  const candidates: YouthIntakeCandidate[] = [];

  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    const generated = generateSeasonalYouthIntakePlayers({
      worldSeed,
      seasonId: `${careerState.gameState.calendar.currentSeasonId}:youth-intake-${seasonNumber}` as Parameters<
        typeof generateSeasonalYouthIntakePlayers
      >[0]["seasonId"],
      clubId,
      clubContext: {
        category: club.category,
        reputation: club.reputation,
      },
      referenceDate: careerState.gameState.calendar.currentDate,
      targetPositions: youthRefillTargetPositions(careerState, clubId),
    });

    for (const player of generated.generatedPlayers) {
      candidates.push({
        player: player.player,
        playerState: player.playerState,
        targetClubId: clubId,
      });
    }
  }

  return candidates;
}

function youthRefillTargetPositions(
  careerState: CliCareerState,
  clubId: CliCareerState["gameState"]["clubIds"][number],
): NonNullable<Parameters<typeof generateSeasonalYouthIntakePlayers>[0]["targetPositions"]> {
  const missing = [...YOUTH_ACADEMY_POSITION_PLAN];
  const roster = careerState.youthAcademyState?.clubRosters[clubId];

  for (const playerId of roster?.playerIds ?? []) {
    const position = careerState.gameState.players[playerId]?.naturalPositions[0];
    if (position === undefined) {
      continue;
    }

    const exactIndex = missing.findIndex((candidate) => candidate === position);
    if (exactIndex >= 0) {
      missing.splice(exactIndex, 1);
      continue;
    }

    const departmentIndex = missing.findIndex((candidate) => sameYouthDepartment(candidate, position));
    if (departmentIndex >= 0) {
      missing.splice(departmentIndex, 1);
    }
  }

  return missing;
}

function sameYouthDepartment(left: string, right: string): boolean {
  return youthDepartment(left) === youthDepartment(right);
}

function youthDepartment(position: string): "attacker" | "defender" | "goalkeeper" | "midfielder" {
  if (position === "gk") return "goalkeeper";
  if (position === "cb" || position === "rb" || position === "lb" || position === "rwb" || position === "lwb") return "defender";
  if (position === "dm" || position === "cm" || position === "am") return "midfielder";
  return "attacker";
}

/**
 * Builds report-safe player snapshots from a career state.
 */
function snapshotPlayers(careerState: CliCareerState): readonly LongRunPlayerSnapshotRow[] {
  const rows: LongRunPlayerSnapshotRow[] = [];

  for (const playerId of careerState.gameState.playerIds) {
    const player = careerState.gameState.players[playerId];

    if (player === undefined) {
      continue;
    }

    rows.push({
      playerId: String(playerId),
      displayName: playerName(player),
      age: playerAgeYears(careerState, player),
      currentAbility: averageAbility(player.abilities),
      potentialRoom: averagePotentialRoom(player),
    });
  }

  return rows;
}

/**
 * Builds production rows from completed simulated seasons.
 */
function productionRows(
  careerState: CliCareerState,
  seasons: readonly LongRunSeasonResult[],
  text: Translator,
): readonly LongRunPlayerProductionRow[] {
  return seasons.map((season) => {
    const topScorer = season.result.playerGoalStats[0];
    const topAssist = topAssistRow(season);
    const topCreator = topCreatorShareRow(season);
    const topCreatorClubTopScorer = topCreatorClubScorerRow(season, topCreator?.clubId);

    return {
      seasonNumber: season.seasonNumber,
      topScorerName: topScorer === undefined ? text("common.unavailable") : playerNameById(careerState, topScorer.playerId),
      topScorerGoals: topScorer?.goals ?? 0,
      topAssistName: topAssist === undefined ? text("common.unavailable") : playerNameById(careerState, topAssist.playerId),
      topAssists: topAssist?.assists ?? 0,
      topCreatorClubName: topCreator === undefined ? text("common.unavailable") : clubNameById(careerState, topCreator.clubId),
      topCreatorName: topCreator === undefined ? text("common.unavailable") : playerNameById(careerState, topCreator.playerId),
      topCreatorAssists: topCreator?.assists ?? 0,
      topCreatorClubGoals: topCreator?.clubGoals ?? 0,
      topCreatorClubTopScorerName:
        topCreatorClubTopScorer === undefined ? text("common.unavailable") : playerNameById(careerState, topCreatorClubTopScorer.playerId),
      topCreatorClubTopScorerGoals: topCreatorClubTopScorer?.goals ?? 0,
      assistPlayersAtLeastFive: assistDepth(season, 5),
      assistPlayersAtLeastEight: assistDepth(season, 8),
      assistPlayersAtLeastTen: assistDepth(season, 10),
      assistPlayersAtLeastTwelve: assistDepth(season, 12),
      topAssistClubGoalShare: maxSingleAssistShare(season),
      topThreeAssistClubGoalShare: maxTopThreeAssistShare(season),
    };
  });
}

/**
 * Finds the player with the highest share of their own club's goals created by
 * assists. This is diagnostic output only; anomaly thresholds still live in
 * simulation-tools.
 */
function topCreatorShareRow(
  season: LongRunSeasonResult,
): (LongRunSeasonResult["result"]["playerSummaryStats"][number] & { readonly clubGoals: number; readonly creatorShare: number }) | undefined {
  let best:
    | (LongRunSeasonResult["result"]["playerSummaryStats"][number] & { readonly clubGoals: number; readonly creatorShare: number })
    | undefined;

  for (const row of season.result.playerSummaryStats) {
    const clubGoals = season.result.table.find((tableRow) => tableRow.clubId === row.clubId)?.goalsFor ?? 0;

    if (clubGoals <= 0) {
      continue;
    }

    const candidate = {
      ...row,
      clubGoals,
      creatorShare: row.assists / clubGoals,
    };

    if (
      best === undefined ||
      candidate.creatorShare > best.creatorShare ||
      (candidate.creatorShare === best.creatorShare && candidate.assists > best.assists) ||
      (candidate.creatorShare === best.creatorShare &&
        candidate.assists === best.assists &&
        String(candidate.playerId) < String(best.playerId))
    ) {
      best = candidate;
    }
  }

  return best;
}

/**
 * Finds the top scorer in the same club as a creator-concentration row.
 */
function topCreatorClubScorerRow(
  season: LongRunSeasonResult,
  clubId: LongRunSeasonResult["result"]["playerSummaryStats"][number]["clubId"] | undefined,
): LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined {
  if (clubId === undefined) {
    return undefined;
  }

  let best: LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined;

  for (const row of season.result.playerSummaryStats) {
    if (row.clubId !== clubId) {
      continue;
    }

    if (best === undefined || row.goals > best.goals || (row.goals === best.goals && String(row.playerId) < String(best.playerId))) {
      best = row;
    }
  }

  return best;
}

/**
 * Finds the top assist row for a season.
 */
function topAssistRow(season: LongRunSeasonResult): LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined {
  let best: LongRunSeasonResult["result"]["playerSummaryStats"][number] | undefined;

  for (const row of season.result.playerSummaryStats) {
    if (best === undefined || row.assists > best.assists || (row.assists === best.assists && String(row.playerId) < String(best.playerId))) {
      best = row;
    }
  }

  return best;
}

/**
 * Reads a club name from the report career state.
 */
function clubNameById(careerState: CliCareerState, clubId: CliCareerState["gameState"]["clubIds"][number]): string {
  return careerState.gameState.clubs[clubId]?.name ?? String(clubId);
}

/**
 * Counts how many players reached an assist threshold.
 */
function assistDepth(season: LongRunSeasonResult, threshold: number): number {
  return season.result.playerSummaryStats.filter((row) => row.assists >= threshold).length;
}

/**
 * Calculates the highest single-player assist share of his club's goals.
 */
function maxSingleAssistShare(season: LongRunSeasonResult): number {
  let maxShare = 0;

  for (const row of season.result.playerSummaryStats) {
    const goalsFor = season.result.table.find((tableRow) => tableRow.clubId === row.clubId)?.goalsFor ?? 0;

    if (goalsFor > 0) {
      maxShare = Math.max(maxShare, row.assists / goalsFor);
    }
  }

  return maxShare;
}

/**
 * Calculates the highest top-three assist share for any club.
 */
function maxTopThreeAssistShare(season: LongRunSeasonResult): number {
  let maxShare = 0;

  for (const tableRow of season.result.table) {
    if (tableRow.goalsFor < MIN_GOALS_FOR_TOP_THREE_CREATOR_SHARE) {
      continue;
    }

    const assists = season.result.playerSummaryStats
      .filter((row) => row.clubId === tableRow.clubId)
      .map((row) => row.assists)
      .sort((left, right) => right - left)
      .slice(0, 3)
      .reduce((sum, assists) => sum + assists, 0);

    if (tableRow.goalsFor > 0) {
      maxShare = Math.max(maxShare, assists / tableRow.goalsFor);
    }
  }

  return maxShare;
}

/**
 * Builds club-stability season rows from completed simulated seasons.
 */
function clubSeasonRows(league: FakeLeagueSystem, seasons: readonly LongRunSeasonResult[]): readonly LongRunClubSeasonRow[] {
  const selectedClubId = league.clubIds[0];

  if (selectedClubId === undefined) {
    throw new Error("Cannot build club stability rows without clubs");
  }

  return seasons.map((season) => {
    const champion = season.result.table[0];
    const selectedIndex = season.result.table.findIndex((row) => row.clubId === selectedClubId);
    const selectedRow = selectedIndex < 0 ? undefined : season.result.table[selectedIndex];

    if (champion === undefined || selectedRow === undefined) {
      throw new Error(`Cannot build club stability row for season: ${season.seasonNumber}`);
    }

    return {
      seasonNumber: season.seasonNumber,
      championClubId: String(champion.clubId),
      championClubName: clubLabel(league, champion.clubId),
      championPoints: champion.points,
      selectedClubPosition: selectedIndex + 1,
      selectedClubPoints: selectedRow.points,
    };
  });
}

function refreshTotals(seasons: readonly LongRunSeasonResult[]): {
  readonly transferTurnoverCount: number;
  readonly playerExitCount: number;
  readonly retirementExitCount: number;
  readonly releasedExitCount: number;
  readonly careerStepDownExitCount: number;
  readonly playerIntakeCount: number;
  readonly squadMaintenanceAddedCount: number;
  readonly minimumSquadSizeObserved: number;
  readonly maximumSquadSizeObserved: number;
  readonly averageSquadSizeObserved: number;
  readonly clubsBelowMinimumSquadSizeCount: number;
  readonly clubsWithoutNaturalGoalkeeperCount: number;
  readonly roleCoverageWarningCount: number;
} {
  const averageSquadSizes = seasons.map((season) => season.refresh.averageSquadSize);

  return {
    transferTurnoverCount: seasons.reduce((sum, season) => sum + season.refresh.transferTurnoverCount, 0),
    playerExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitCount, 0),
    retirementExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitReasons.retirement, 0),
    releasedExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitReasons.released, 0),
    careerStepDownExitCount: seasons.reduce((sum, season) => sum + season.refresh.exitReasons.careerStepDown, 0),
    playerIntakeCount: seasons.reduce((sum, season) => sum + season.refresh.intakeCount, 0),
    squadMaintenanceAddedCount: seasons.reduce((sum, season) => sum + season.refresh.squadMaintenanceAddedCount, 0),
    minimumSquadSizeObserved: Math.min(...seasons.map((season) => season.refresh.minimumSquadSize)),
    maximumSquadSizeObserved: Math.max(...seasons.map((season) => season.refresh.maximumSquadSize)),
    averageSquadSizeObserved: roundReportNumber(
      averageSquadSizes.reduce((sum, value) => sum + value, 0) / averageSquadSizes.length,
    ),
    clubsBelowMinimumSquadSizeCount: seasons.reduce((sum, season) => sum + season.refresh.clubsBelowMinimumSquadSize, 0),
    clubsWithoutNaturalGoalkeeperCount: seasons.reduce((sum, season) => sum + season.refresh.clubsWithoutNaturalGoalkeeper, 0),
    roleCoverageWarningCount: seasons.reduce((sum, season) => sum + season.refresh.roleCoverageWarningCount, 0),
  };
}

/**
 * Builds youth-population season rows from completed career refresh snapshots.
 */
function youthSeasonRows(seasons: readonly LongRunSeasonResult[]): readonly LongRunYouthSeasonRow[] {
  return seasons.map((season) => ({
    seasonNumber: season.seasonNumber,
    seniorPlayerCount: season.refresh.seniorPlayerCount,
    youthPlayerCount: season.refresh.youthPlayerCount,
    activePlayerCount: season.refresh.activePlayerCount,
    minimumYouthRosterSize: season.refresh.minimumYouthRosterSize,
    averageYouthRosterSize: season.refresh.averageYouthRosterSize,
    maximumYouthRosterSize: season.refresh.maximumYouthRosterSize,
    youthIntakeCount: season.refresh.youthIntakeCount,
    youthExitCount: season.refresh.youthExitCount,
    youthPromotionCount: season.refresh.youthPromotionCount,
    selectedClubYouthSize: season.refresh.selectedClubYouthSize,
    clubsAboveYouthTarget: season.refresh.clubsAboveYouthTarget,
    clubsBelowYouthMinimum: season.refresh.clubsBelowYouthMinimum,
  }));
}

/**
 * Builds balance rows for deterministic anomaly scoring.
 */
function balanceSeasonRows(seasons: readonly LongRunSeasonResult[]): readonly LongRunBalanceSeasonRow[] {
  return seasons.map((season) => {
    const first = season.result.table[0];
    const last = season.result.table[season.result.table.length - 1];

    if (first === undefined || last === undefined) {
      throw new Error(`Cannot score balance for empty season table: ${season.seasonNumber}`);
    }

    return {
      goalsPerMatch: goalsPerMatch(season),
      firstPlacePoints: first.points,
      lastPlacePoints: last.points,
      tablePointsSpread: first.points - last.points,
    };
  });
}

/**
 * Calculates league goals per match from the completed season result.
 */
export function goalsPerMatch(season: LongRunSeasonResult): number {
  const totalGoals = season.result.table.reduce((sum, row) => sum + row.goalsFor, 0);

  return totalGoals / season.result.fixtures.length;
}

/**
 * Calculates the share of completed fixtures that ended in a draw.
 */
export function drawRate(season: LongRunSeasonResult): number {
  const draws = season.result.fixtures.filter(
    (fixture) => fixture.result !== undefined && fixture.result.homeGoals === fixture.result.awayGoals,
  ).length;

  return draws / season.result.fixtures.length;
}

/**
 * Resolves a generated club display name for report output.
 */
export function clubLabel(league: FakeLeagueSystem, clubId: FakeLeagueSystem["clubIds"][number]): string {
  const club = league.clubsById[clubId];

  if (club === undefined) {
    return String(clubId);
  }

  return club.name;
}

/**
 * Resolves a generated player display name by ID.
 */
function playerNameById(careerState: CliCareerState, playerId: CliCareerState["gameState"]["playerIds"][number]): string {
  const player = careerState.gameState.players[playerId];

  if (player === undefined) {
    return String(playerId);
  }

  return playerName(player);
}

/**
 * Formats a player's generated name.
 */
function playerName(player: Pick<CliPlayer, "firstName" | "lastName">): string {
  return `${player.firstName} ${player.lastName}`;
}

/**
 * Calculates a player's age in years at the career state's current date.
 */
function playerAgeYears(careerState: CliCareerState, player: Pick<CliPlayer, "birthDate">): number {
  return Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / 365);
}

/**
 * Calculates the average true current ability across the complete 25-ability shape.
 */
function averageAbility(abilities: CliPlayer["abilities"]): number {
  return roundReportNumber(abilityValues(abilities).reduce((sum, value) => sum + value, 0) / abilityValues(abilities).length);
}

/**
 * Calculates average potential room without exposing exact hidden potential in report text.
 */
function averagePotentialRoom(player: CliPlayer): number {
  const current = abilityValues(player.abilities);
  const potential = abilityValues(player.potential);
  let totalRoom = 0;

  for (let index = 0; index < current.length; index += 1) {
    totalRoom += (potential[index] ?? 0) - (current[index] ?? 0);
  }

  return roundReportNumber(totalRoom / current.length);
}

/**
 * Flattens the current full ability object into stable presentation order.
 */
function abilityValues(abilities: CliPlayer["abilities"]): readonly number[] {
  return [
    abilities.technical.finishing,
    abilities.technical.passing,
    abilities.technical.longPassing,
    abilities.technical.crossing,
    abilities.technical.dribbling,
    abilities.technical.technique,
    abilities.technical.tackling,
    abilities.technical.penalties,
    abilities.technical.freeKicks,
    abilities.physical.pace,
    abilities.physical.strength,
    abilities.physical.stamina,
    abilities.physical.agility,
    abilities.physical.heading,
    abilities.mental.positioning,
    abilities.mental.vision,
    abilities.mental.anticipation,
    abilities.mental.composure,
    abilities.mental.determination,
    abilities.mental.leadership,
    abilities.goalkeeping.reflexes,
    abilities.goalkeeping.handling,
    abilities.goalkeeping.rushingOut,
    abilities.goalkeeping.goalkeeperPositioning,
    abilities.goalkeeping.footwork,
  ];
}

/**
 * Rounds lab-report numeric values to two decimals.
 */
function roundReportNumber(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates a numeric average with an explicit empty fallback for reports.
 */
function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculates a nearest-rank percentile in deterministic sorted order.
 */
function percentile(values: readonly number[], rank: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * rank) - 1));

  return roundReportNumber(sorted[index] ?? 0);
}
