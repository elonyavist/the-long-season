import { createFakeLeagueSystem, type FakeLeagueSystem } from "@game/content";
import { developPlayersForSeason } from "@game/engine";
import {
  createTranslator,
  formatSupportedLanguages,
  parseLanguageCode,
  type MessageKey,
  type SupportedLanguage,
  type Translator,
} from "@game/i18n";
import {
  DEFAULT_LONG_RUN_SEASON_COUNT,
  createLongRunAnomalyReport,
  createLongRunClubStabilityReport,
  createLongRunPlayerEvolutionReport,
  runLongRunSimulation,
  type LongRunAnomalyReport,
  type LongRunBalanceSeasonRow,
  type LongRunClubSeasonRow,
  type LongRunClubStabilityReport,
  type LongRunPlayerEvolutionReport,
  type LongRunPlayerProductionRow,
  type LongRunSeasonResult,
  type LongRunPlayerSnapshotRow,
} from "@game/simulation-tools";
import { careerStateFromNewWorld } from "./career/scenarios.ts";
import type { CliCareerState, CliPlayer, CliSaveId } from "./career/types.ts";
import { createFakeSeasonInput } from "./fake-season-input.ts";

/** Default seed used by the ten-season lab report. */
export const DEFAULT_TEN_SEASON_REPORT_SEED = "world-a";

/**
 * Minimal IO adapter used by command tests.
 */
export interface TenSeasonReportCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/**
 * Runs the deterministic ten-season lab report command.
 *
 * @example
 * await runTenSeasonReportCommand(["--seed=world-a", "--seasons=10"]);
 */
export async function runTenSeasonReportCommand(
  args: readonly string[],
  io: TenSeasonReportCommandIo = defaultIo(),
): Promise<number> {
  const parsed = parseArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("tenSeason.usage"));
    return 1;
  }

  const league = createFakeLeagueSystem({ worldSeed: parsed.seed });
  const report = runLongRunSimulation({
    seed: parsed.seed,
    seasonCount: parsed.seasonCount,
    createSeasonInput: ({ seasonSeed }) => createFakeSeasonInput(league, seasonSeed),
  });
  const initialCareerState = careerStateFromNewWorld("save:ten-season-report" as CliSaveId, league, parsed.seed);
  const developedCareerState = developCareerForReport(initialCareerState, parsed.seed, parsed.seasonCount);
  const playerEvolutionReport = createLongRunPlayerEvolutionReport({
    initialPlayers: snapshotPlayers(initialCareerState),
    finalPlayers: snapshotPlayers(developedCareerState),
    production: productionRows(league, report.seasons, text),
    usefulPlayerCurrentAbilityThreshold: 12,
  });
  const clubStabilityReport = createLongRunClubStabilityReport(clubSeasonRows(league, report.seasons));
  const anomalyReport = createLongRunAnomalyReport({
    balance: balanceSeasonRows(report.seasons),
    playerEvolution: playerEvolutionReport,
    clubStability: clubStabilityReport,
  });

  for (const line of formatTenSeasonReportOutput(
    league,
    report.seasons,
    playerEvolutionReport,
    clubStabilityReport,
    anomalyReport,
    parsed.seed,
    parsed.seasonCount,
    text,
  )) {
    io.stdout(line);
  }

  return 0;
}

/**
 * Creates the default console-backed IO adapter.
 */
function defaultIo(): TenSeasonReportCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}

/**
 * Formats the narrow step-02 report output.
 */
function formatTenSeasonReportOutput(
  league: FakeLeagueSystem,
  seasons: readonly LongRunSeasonResult[],
  playerEvolution: LongRunPlayerEvolutionReport,
  clubStability: LongRunClubStabilityReport,
  anomalyReport: LongRunAnomalyReport,
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
  lines.push("", ...formatClubStabilityLines(clubStability, text));
  lines.push("", ...formatAnomalyLines(anomalyReport, text));

  return lines;
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
  const selectedIndex = season.result.table.findIndex((row) => row.clubId === selectedClubId);

  if (champion === undefined || selectedIndex < 0) {
    throw new Error(`Cannot summarize long-run season: ${season.seasonNumber}`);
  }

  return `  ${season.seasonNumber}. ${season.seasonSeed} ${text("tenSeason.champion")}=${clubLabel(league, champion.clubId)} ${text("tenSeason.points")}=${champion.points} ${text("tenSeason.selectedPosition")}=${selectedIndex + 1} ${text("tenSeason.goalsPerMatch")}=${goalsPerMatch(season).toFixed(3)}`;
}

/**
 * Calculates league goals per match from the completed season result.
 */
function goalsPerMatch(season: LongRunSeasonResult): number {
  const totalGoals = season.result.table.reduce((sum, row) => sum + row.goalsFor, 0);

  return totalGoals / season.result.fixtures.length;
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
      `  ${production.seasonNumber}. ${text("season.topScorer")}=${production.topScorerName} ${text("season.unit.goal.many")}=${production.topScorerGoals} ${text("season.topAssist")}=${production.topAssistName} ${text("season.unit.assist.many")}=${production.topAssists} 12+=${production.assistPlayersAtLeastTwelve} top1_share=${production.topAssistClubGoalShare.toFixed(2)} top3_share=${production.topThreeAssistClubGoalShare.toFixed(2)}`,
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
 * Applies current deterministic player development in memory for the report.
 */
function developCareerForReport(careerState: CliCareerState, worldSeed: string, seasonCount: number): CliCareerState {
  let workingState = careerState;

  for (let seasonNumber = 1; seasonNumber <= seasonCount; seasonNumber += 1) {
    const developed = developPlayersForSeason({
      careerState: workingState,
      worldSeed,
      seasonId: `${workingState.gameState.calendar.currentSeasonId}:long-run-development-${seasonNumber}` as Parameters<typeof developPlayersForSeason>[0]["seasonId"],
    });

    workingState = {
      ...developed.careerState,
      gameState: {
        ...developed.careerState.gameState,
        calendar: {
          ...developed.careerState.gameState.calendar,
          currentDate: (developed.careerState.gameState.calendar.currentDate + 365) as CliCareerState["gameState"]["calendar"]["currentDate"],
          currentSeasonId: `${developed.careerState.gameState.calendar.currentSeasonId}:long-run-${seasonNumber}` as CliCareerState["gameState"]["calendar"]["currentSeasonId"],
        },
      },
    };
  }

  return workingState;
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
  league: FakeLeagueSystem,
  seasons: readonly LongRunSeasonResult[],
  text: Translator,
): readonly LongRunPlayerProductionRow[] {
  return seasons.map((season) => {
    const topScorer = season.result.playerGoalStats[0];
    const topAssist = topAssistRow(season);

    return {
      seasonNumber: season.seasonNumber,
      topScorerName: topScorer === undefined ? text("common.unavailable") : playerNameById(league, topScorer.playerId),
      topScorerGoals: topScorer?.goals ?? 0,
      topAssistName: topAssist === undefined ? text("common.unavailable") : playerNameById(league, topAssist.playerId),
      topAssists: topAssist?.assists ?? 0,
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
    `  ${text("tenSeason.transferTurnover")}: ${report.transferTurnoverAvailable ? text("common.enabled") : text("common.unavailable")}`,
    `  ${text("tenSeason.squadTurnover")}: ${report.squadTurnoverAvailable ? text("common.enabled") : text("common.unavailable")}`,
  ];
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

/**
 * Resolves a generated club display name for report output.
 */
function clubLabel(league: FakeLeagueSystem, clubId: FakeLeagueSystem["clubIds"][number]): string {
  const club = league.clubsById[clubId];

  if (club === undefined) {
    return String(clubId);
  }

  return club.name;
}

/**
 * Resolves a generated player display name by ID.
 */
function playerNameById(league: FakeLeagueSystem, playerId: FakeLeagueSystem["playerIds"][number]): string {
  const player = league.players[playerId];

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
 * Parses command-line arguments for the ten-season report.
 */
function parseArgs(args: readonly string[]): ParsedArgs {
  let seed = DEFAULT_TEN_SEASON_REPORT_SEED;
  let seasonCount = DEFAULT_LONG_RUN_SEASON_COUNT;
  let language: SupportedLanguage = "en";

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      return { ok: false, message: createTranslator(language)("tenSeason.usage"), language };
    }

    if (arg === "--seed") {
      return { ok: false, message: createTranslator(language)("season.error.seedRequired"), language };
    }

    if (arg.startsWith("--seed=")) {
      const value = arg.slice("--seed=".length);

      if (value.length === 0) {
        return { ok: false, message: createTranslator(language)("season.error.seedRequired"), language };
      }

      seed = value;
      continue;
    }

    if (arg === "--seasons") {
      return { ok: false, message: createTranslator(language)("tenSeason.error.seasonsRequired"), language };
    }

    if (arg.startsWith("--seasons=")) {
      const value = arg.slice("--seasons=".length);
      const parsed = parseSeasonCount(value);

      if (parsed === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("tenSeason.error.seasonsInvalid", { value }),
          language,
        };
      }

      seasonCount = parsed;
      continue;
    }

    if (arg === "--lang") {
      return {
        ok: false,
        message: createTranslator(language)("cli.error.langRequiresValue", { supported: formatSupportedLanguages() }),
        language,
      };
    }

    if (arg.startsWith("--lang=")) {
      const value = arg.slice("--lang=".length);
      const parsedLanguage = parseLanguageCode(value);

      if (parsedLanguage === undefined) {
        return {
          ok: false,
          message: createTranslator(language)("cli.error.unsupportedLanguage", {
            value,
            supported: formatSupportedLanguages(),
          }),
          language,
        };
      }

      language = parsedLanguage;
      continue;
    }

    return {
      ok: false,
      message: createTranslator(language)("cli.error.unknownArgument", { arg }),
      language,
    };
  }

  return { ok: true, seed, seasonCount, language };
}

/**
 * Parses a positive safe integer season count.
 */
function parseSeasonCount(value: string): number | undefined {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

type ParsedArgs =
  | {
      readonly ok: true;
      readonly seed: string;
      readonly seasonCount: number;
      readonly language: SupportedLanguage;
    }
  | {
      readonly ok: false;
      readonly message: string;
      readonly language: SupportedLanguage;
    };
