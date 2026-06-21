import { createFakeLeagueSystem } from "@game/content";
import {
  applyCareerPermanentTransfer,
  assessCareerSeasonCompletion,
  computeLeagueTable,
  developPlayersForSeason,
  generateNextSeasonCalendar,
  rolloverPlayersForNextSeason,
} from "@game/engine";
import { createTranslator } from "@game/i18n";
import { JsonCareerStorage, StorageError } from "@game/storage";

import {
  formatCareerAdvanceOutput,
  formatCareerInspectOutput,
  formatCareerMarketApplyOutput,
  formatCareerLineupSaveOutput,
  formatCareerSeasonRolloverOutput,
  formatCareerDevelopmentReportOutput,
  formatCareerSquadOutput,
  formatCareerSummaryOutput,
  formatCareerTacticSaveOutput,
  formatNewCareerWorldOutput,
} from "./career/format.ts";
import {
  formatSupportedCareerLineupDemoProfiles,
  formatSupportedCareerTacticDemoProfiles,
  formatSupportedMarketDemoProfiles,
  parseCareerArgs,
} from "./career/parse-career-args.ts";
import {
  buildMarketDemoScenario,
  careerStateFromNewWorld,
  careerStateFromScenario,
} from "./career/scenarios.ts";
import { advanceCareerNextFixture } from "./career/progression.ts";
import { saveCareerLineupDemo, saveCareerTacticDemo } from "./career/preparation.ts";
import type { CliCareerState, CliGameState, CliIntent, PlayerId } from "./career/types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];
type CliFixture = CliGameState["fixtures"][CliFixtureId];

/** Minimal IO adapter used by command tests. */
export interface CareerCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/** Optional adapters for deterministic command tests. */
export interface CareerCommandOptions {
  /** Directory used by the JSON career storage adapter. */
  readonly storageDirectoryPath?: string;
}

/**
 * Runs the deterministic career CLI command.
 *
 * The public command stays intentionally small: argument parsing, state/scenario
 * construction, and formatting live in private modules so Phase 23 can add a
 * career loop without growing this file into another broad command surface.
 *
 * @example
 * await runCareerCommand(["--seed=demo-001", "--save=career-demo", "--apply-market-demo=pro01-affordable-permanent"]);
 */
export async function runCareerCommand(
  args: readonly string[],
  io: CareerCommandIo = defaultIo(),
  options: CareerCommandOptions = {},
): Promise<number> {
  const parsed = parseCareerArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("career.usage", {
      marketProfiles: formatSupportedMarketDemoProfiles(),
      lineupProfiles: formatSupportedCareerLineupDemoProfiles(),
      tacticProfiles: formatSupportedCareerTacticDemoProfiles(),
    }));
    return 1;
  }

  const storageDirectoryPath = options.storageDirectoryPath ?? "saves/career";
  const storage = new JsonCareerStorage({
    directoryPath: storageDirectoryPath,
  });

  if (parsed.mode === "inspect") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      for (const line of formatCareerInspectOutput({ careerState, saveDirectoryPath: storageDirectoryPath, text })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "summary") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      for (const line of formatCareerSummaryOutput({ careerState, saveDirectoryPath: storageDirectoryPath, text })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "squad") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      for (const line of formatCareerSquadOutput({ careerState, saveDirectoryPath: storageDirectoryPath, text })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "setLineupDemo") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      const result = saveCareerLineupDemo(careerState, parsed.lineupDemo);

      await storage.saveCareer({
        saveId: parsed.saveId,
        name: String(parsed.saveId),
        state: result.careerState,
      });

      for (const line of formatCareerLineupSaveOutput({
        result,
        saveId: parsed.saveId,
        saveDirectoryPath: storageDirectoryPath,
        text,
      })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "setTacticDemo") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      const result = saveCareerTacticDemo(careerState, parsed.tacticDemo);

      await storage.saveCareer({
        saveId: parsed.saveId,
        name: String(parsed.saveId),
        state: result.careerState,
      });

      for (const line of formatCareerTacticSaveOutput({
        result,
        saveId: parsed.saveId,
        saveDirectoryPath: storageDirectoryPath,
        text,
      })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "advanceNextFixture") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      const result = advanceCareerNextFixture(careerState);

      if (result.status === "advanced") {
        await storage.saveCareer({
          saveId: parsed.saveId,
          name: String(parsed.saveId),
          state: result.careerState,
        });
      }

      for (const line of formatCareerAdvanceOutput({
        result,
        saveId: parsed.saveId,
        saveDirectoryPath: storageDirectoryPath,
        text,
      })) {
        io.stdout(line);
      }

      return result.status === "invalid" ? 1 : 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "rolloverSeason") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      const result = rolloverCareerSeason(careerState);

      if (result.status === "rolledOver") {
        await storage.saveCareer({
          saveId: parsed.saveId,
          name: String(parsed.saveId),
          state: result.careerState,
        });
      }

      for (const line of formatCareerSeasonRolloverOutput({
        result,
        saveId: parsed.saveId,
        saveDirectoryPath: storageDirectoryPath,
        text,
      })) {
        io.stdout(line);
      }

      return result.status === "invalid" ? 1 : 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "developmentReport") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      const result = buildCareerDevelopmentReport(careerState);

      for (const line of formatCareerDevelopmentReportOutput({
        result,
        saveId: parsed.saveId,
        saveDirectoryPath: storageDirectoryPath,
        text,
      })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "newWorldPreview") {
    const league = createFakeLeagueSystem({ worldSeed: parsed.seed });
    const careerState = careerStateFromNewWorld(parsed.saveId, league, parsed.seed);

    await storage.saveCareer({
      saveId: parsed.saveId,
      name: String(parsed.saveId),
      state: careerState,
    });

    for (const line of formatNewCareerWorldOutput({
      league,
      careerState,
      saveDirectoryPath: storageDirectoryPath,
      worldSeed: parsed.seed,
      text,
    })) {
      io.stdout(line);
    }

    return 0;
  }

  const league = createFakeLeagueSystem();
  const scenario = buildMarketDemoScenario(league, parsed.marketDemo);
  const careerState = careerStateFromScenario(parsed.saveId, scenario);
  const intent: CliIntent = {
    buyingClubId: scenario.buyingClubId,
    sellingClubId: scenario.sellingClubId,
    playerId: scenario.targetPlayerId,
  };
  const result = applyCareerPermanentTransfer({ careerState, intent });
  const careerSaveWritten = result.status === "accepted";

  if (careerSaveWritten) {
    await storage.saveCareer({
      saveId: parsed.saveId,
      name: String(parsed.saveId),
      state: result.careerState,
    });
  }

  for (const line of formatCareerMarketApplyOutput({
    league,
    seed: parsed.seed,
    saveId: parsed.saveId,
    saveDirectoryPath: storageDirectoryPath,
    profileKey: parsed.marketDemo,
    scenario,
    result,
    careerSaveWritten,
    text,
  })) {
    io.stdout(line);
  }

  return 0;
}

const DEVELOPMENT_REPORT_SEASONS = 7;

export interface CareerDevelopmentReportResult {
  readonly careerState: CliCareerState;
  readonly seasonsSimulated: number;
  readonly playersReviewed: number;
  readonly playersImproved: number;
  readonly playersDeclined: number;
  readonly stalledProspects: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly biggestImprover?: CareerDevelopmentReportPlayerExample;
  readonly biggestDecline?: CareerDevelopmentReportPlayerExample;
  readonly stalledProspect?: CareerDevelopmentReportPlayerExample;
  readonly decliningVeteran?: CareerDevelopmentReportPlayerExample;
}

export interface CareerDevelopmentReportPlayerExample {
  readonly playerId: PlayerId;
  readonly startAge: number;
  readonly endAge: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
}

interface MutableDevelopmentAggregate {
  playerId: PlayerId;
  startAge: number;
  endAge: number;
  totalGrowth: number;
  totalDecline: number;
  potentialRoom: number;
}

/** Builds an in-memory development report without mutating or saving a career. */
export function buildCareerDevelopmentReport(careerState: CliCareerState): CareerDevelopmentReportResult {
  let workingState = careerState;
  const aggregates = initialDevelopmentAggregates(careerState);
  const worldSeed = careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed;

  for (let seasonIndex = 1; seasonIndex <= DEVELOPMENT_REPORT_SEASONS; seasonIndex += 1) {
    const developed = developPlayersForSeason({
      careerState: workingState,
      worldSeed,
      seasonId: `${workingState.gameState.calendar.currentSeasonId}:development-${seasonIndex}` as Parameters<typeof developPlayersForSeason>[0]["seasonId"],
    });

    for (const change of developed.changes) {
      const aggregate = aggregates.get(change.playerId as PlayerId);
      if (aggregate === undefined) {
        continue;
      }

      aggregate.totalGrowth += change.totalGrowth;
      aggregate.totalDecline += change.totalDecline;
      aggregate.endAge = change.age;
    }

    workingState = careerStateWithAdvancedReportDate(developed.careerState, seasonIndex);
  }

  const selectedClubAggregates = selectedClubDevelopmentAggregates(careerState, aggregates);
  const playersImproved = selectedClubAggregates.filter((aggregate) => aggregate.totalGrowth > 0).length;
  const playersDeclined = selectedClubAggregates.filter((aggregate) => aggregate.totalDecline > 0).length;
  const stalledProspects = selectedClubAggregates.filter(isStalledProspect).length;

  const result: CareerDevelopmentReportResult = {
    careerState,
    seasonsSimulated: DEVELOPMENT_REPORT_SEASONS,
    playersReviewed: selectedClubAggregates.length,
    playersImproved,
    playersDeclined,
    stalledProspects,
    totalGrowth: roundReportDelta(sumGrowth(selectedClubAggregates)),
    totalDecline: roundReportDelta(sumDecline(selectedClubAggregates)),
  };
  const biggestImprover = toDevelopmentExample(maxBy(selectedClubAggregates, (aggregate) => aggregate.totalGrowth));
  const biggestDecline = toDevelopmentExample(maxBy(selectedClubAggregates, (aggregate) => aggregate.totalDecline));
  const stalledProspect = toDevelopmentExample(selectedClubAggregates.find(isStalledProspect));
  const decliningVeteran = toDevelopmentExample(selectedClubAggregates.find((aggregate) => aggregate.startAge >= 30 && aggregate.totalDecline > 0));

  return {
    ...result,
    ...(biggestImprover === undefined ? {} : { biggestImprover }),
    ...(biggestDecline === undefined ? {} : { biggestDecline }),
    ...(stalledProspect === undefined ? {} : { stalledProspect }),
    ...(decliningVeteran === undefined ? {} : { decliningVeteran }),
  };
}

export type CareerSeasonRolloverResult = CareerSeasonRolloverRolledOver | CareerSeasonRolloverInvalid;

export interface CareerSeasonRolloverRolledOver {
  readonly status: "rolledOver";
  readonly careerState: CliCareerState;
  readonly previousSeasonId: string;
  readonly nextSeasonId: string;
  readonly championClubId: CliCareerState["selectedClubId"];
  readonly selectedClubFinish: NonNullable<CliCareerState["seasonHistory"]>[number]["selectedClubFinish"];
  readonly aggregateGoals: NonNullable<CliCareerState["seasonHistory"]>[number]["aggregateGoals"];
  readonly archivedSeasonCount: number;
  readonly newFixtureCount: number;
}

export interface CareerSeasonRolloverInvalid {
  readonly status: "invalid";
  readonly careerState: CliCareerState;
  readonly reason: string;
  readonly fixtureId?: CliFixtureId;
}

/**
 * Builds the next persisted career season after every fixture in the current
 * season has been played. The function stays pure so the command can decide
 * whether a successful result should be written to disk.
 */
export function rolloverCareerSeason(careerState: CliCareerState): CareerSeasonRolloverResult {
  const completion = assessCareerSeasonCompletion(careerState);
  if (completion.status === "invalid") {
    const invalidResult: CareerSeasonRolloverInvalid = {
      status: "invalid",
      careerState,
      reason: completion.reason,
    };

    if (completion.fixtureId !== undefined) {
      return { ...invalidResult, fixtureId: completion.fixtureId as CliFixtureId };
    }

    return invalidResult;
  }

  if (completion.status === "incomplete") {
    return {
      status: "invalid",
      careerState,
      reason: "current_season_incomplete",
      fixtureId: completion.firstUnplayedFixtureId as CliFixtureId,
    };
  }

  const nextCalendar = generateNextSeasonCalendar(careerState);
  if (nextCalendar.status === "invalid") {
    return {
      status: "invalid",
      careerState,
      reason: nextCalendar.reason,
    };
  }

  const currentSeasonFixtureIds = findCurrentSeasonFixtureIds(careerState);
  const tableRules = createFakeLeagueSystem({
    worldSeed: careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed,
  }).tableRules;
  const finalTable = computeLeagueTable({
    clubIds: careerState.gameState.clubIds,
    fixtures: careerState.gameState.fixtures,
    fixtureIds: currentSeasonFixtureIds,
    rules: tableRules,
  });
  const champion = finalTable[0];
  if (champion === undefined) {
    return {
      status: "invalid",
      careerState,
      reason: "season_table_empty",
    };
  }

  const selectedClubFinish = finalTable.find((row) => row.clubId === careerState.selectedClubId);
  if (selectedClubFinish === undefined) {
    return {
      status: "invalid",
      careerState,
      reason: "selected_club_not_in_table",
    };
  }

  const aggregateGoals = computeAggregateGoals(careerState, currentSeasonFixtureIds);
  const nextFixtures = mergeNextSeasonFixtures(careerState, nextCalendar.fixtures as readonly CliFixture[]);
  const archiveEntry: NonNullable<CliCareerState["seasonHistory"]>[number] = {
    sequenceNumber: nextSeasonSequenceNumber(careerState),
    seasonId: careerState.gameState.calendar.currentSeasonId,
    competitionId: nextCalendar.competitionId as NonNullable<CliCareerState["seasonHistory"]>[number]["competitionId"],
    finalTable,
    championClubId: champion.clubId,
    selectedClubFinish,
    aggregateGoals,
  };
  const { matchPreparation: _matchPreparation, ...careerStateWithoutPreparation } = careerState;
  const careerStateWithNextSeason: CliCareerState = {
    ...careerStateWithoutPreparation,
    gameState: {
      ...careerState.gameState,
      fixtures: nextFixtures.fixtures,
      fixtureIds: nextFixtures.fixtureIds,
    },
    seasonHistory: [...(careerState.seasonHistory ?? []), archiveEntry],
  };
  const rolledOver = rolloverPlayersForNextSeason({
    careerState: careerStateWithNextSeason,
    nextSeasonId: nextCalendar.seasonId,
    nextSeasonStartDate: nextCalendar.seasonStartDate,
  });

  return {
    status: "rolledOver",
    careerState: rolledOver.careerState,
    previousSeasonId: careerState.gameState.calendar.currentSeasonId,
    nextSeasonId: nextCalendar.seasonId,
    championClubId: champion.clubId,
    selectedClubFinish,
    aggregateGoals,
    archivedSeasonCount: rolledOver.careerState.seasonHistory?.length ?? 0,
    newFixtureCount: nextCalendar.fixtureIds.length,
  };
}

function findCurrentSeasonFixtureIds(careerState: CliCareerState): readonly CliFixtureId[] {
  const fixtureIds: CliFixtureId[] = [];
  const currentSeasonId = careerState.gameState.calendar.currentSeasonId;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture?.seasonId === currentSeasonId) {
      fixtureIds.push(fixtureId);
    }
  }

  return fixtureIds;
}

function computeAggregateGoals(
  careerState: CliCareerState,
  fixtureIds: readonly CliFixtureId[],
): NonNullable<CliCareerState["seasonHistory"]>[number]["aggregateGoals"] {
  let fixtureCount = 0;
  let totalGoals = 0;

  for (const fixtureId of fixtureIds) {
    const result = careerState.gameState.fixtures[fixtureId]?.result;
    if (result === undefined) {
      continue;
    }

    fixtureCount += 1;
    totalGoals += result.homeGoals + result.awayGoals;
  }

  return { fixtureCount, totalGoals };
}

function mergeNextSeasonFixtures(
  careerState: CliCareerState,
  nextFixtures: readonly CliFixture[],
): { readonly fixtures: CliCareerState["gameState"]["fixtures"]; readonly fixtureIds: CliCareerState["gameState"]["fixtureIds"] } {
  const fixtures = { ...careerState.gameState.fixtures };
  const fixtureIds = [...careerState.gameState.fixtureIds];

  for (const fixture of nextFixtures) {
    fixtures[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  return { fixtures, fixtureIds };
}

function nextSeasonSequenceNumber(careerState: CliCareerState): number {
  let maxSequenceNumber = 0;

  for (const entry of careerState.seasonHistory ?? []) {
    maxSequenceNumber = Math.max(maxSequenceNumber, entry.sequenceNumber);
  }

  return maxSequenceNumber + 1;
}

function initialDevelopmentAggregates(careerState: CliCareerState): Map<PlayerId, MutableDevelopmentAggregate> {
  const aggregates = new Map<PlayerId, MutableDevelopmentAggregate>();

  for (const playerId of careerState.gameState.playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player === undefined) {
      continue;
    }

    aggregates.set(playerId as PlayerId, {
      playerId: playerId as PlayerId,
      startAge: playerAgeYears(careerState, playerId as PlayerId),
      endAge: playerAgeYears(careerState, playerId as PlayerId),
      totalGrowth: 0,
      totalDecline: 0,
      potentialRoom: averagePlayerPotentialRoom(player),
    });
  }

  return aggregates;
}

function selectedClubDevelopmentAggregates(
  careerState: CliCareerState,
  aggregates: ReadonlyMap<PlayerId, MutableDevelopmentAggregate>,
): readonly MutableDevelopmentAggregate[] {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];
  const rows: MutableDevelopmentAggregate[] = [];

  for (const playerId of selectedClub?.playerIds ?? []) {
    const aggregate = aggregates.get(playerId as PlayerId);
    if (aggregate !== undefined) {
      rows.push(aggregate);
    }
  }

  return rows;
}

function careerStateWithAdvancedReportDate(careerState: CliCareerState, seasonIndex: number): CliCareerState {
  return {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      calendar: {
        ...careerState.gameState.calendar,
        currentDate: (careerState.gameState.calendar.currentDate + 365) as CliCareerState["gameState"]["calendar"]["currentDate"],
        currentSeasonId: `${careerState.gameState.calendar.currentSeasonId}:development-${seasonIndex}` as CliCareerState["gameState"]["calendar"]["currentSeasonId"],
      },
    },
  };
}

function playerAgeYears(careerState: CliCareerState, playerId: PlayerId): number {
  const player = careerState.gameState.players[playerId];
  return player === undefined ? 0 : Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / 365);
}

function averagePlayerPotentialRoom(player: CliCareerState["gameState"]["players"][PlayerId]): number {
  const abilityValues = [
    player.potential.technical.finishing - player.abilities.technical.finishing,
    player.potential.technical.passing - player.abilities.technical.passing,
    player.potential.technical.longPassing - player.abilities.technical.longPassing,
    player.potential.technical.crossing - player.abilities.technical.crossing,
    player.potential.technical.dribbling - player.abilities.technical.dribbling,
    player.potential.technical.technique - player.abilities.technical.technique,
    player.potential.technical.tackling - player.abilities.technical.tackling,
    player.potential.technical.penalties - player.abilities.technical.penalties,
    player.potential.technical.freeKicks - player.abilities.technical.freeKicks,
    player.potential.physical.pace - player.abilities.physical.pace,
    player.potential.physical.strength - player.abilities.physical.strength,
    player.potential.physical.stamina - player.abilities.physical.stamina,
    player.potential.physical.agility - player.abilities.physical.agility,
    player.potential.physical.heading - player.abilities.physical.heading,
    player.potential.mental.positioning - player.abilities.mental.positioning,
    player.potential.mental.vision - player.abilities.mental.vision,
    player.potential.mental.anticipation - player.abilities.mental.anticipation,
    player.potential.mental.composure - player.abilities.mental.composure,
    player.potential.mental.determination - player.abilities.mental.determination,
    player.potential.mental.leadership - player.abilities.mental.leadership,
    player.potential.goalkeeping.reflexes - player.abilities.goalkeeping.reflexes,
    player.potential.goalkeeping.handling - player.abilities.goalkeeping.handling,
    player.potential.goalkeeping.rushingOut - player.abilities.goalkeeping.rushingOut,
    player.potential.goalkeeping.goalkeeperPositioning - player.abilities.goalkeeping.goalkeeperPositioning,
    player.potential.goalkeeping.footwork - player.abilities.goalkeeping.footwork,
  ];
  let total = 0;

  for (const value of abilityValues) {
    total += value;
  }

  return total / abilityValues.length;
}

function isStalledProspect(aggregate: MutableDevelopmentAggregate): boolean {
  return aggregate.startAge <= 21 && aggregate.potentialRoom >= 3 && aggregate.totalGrowth < 1;
}

function maxBy(
  aggregates: readonly MutableDevelopmentAggregate[],
  readValue: (aggregate: MutableDevelopmentAggregate) => number,
): MutableDevelopmentAggregate | undefined {
  let best: MutableDevelopmentAggregate | undefined;
  let bestValue = -Infinity;

  for (const aggregate of aggregates) {
    const value = readValue(aggregate);
    if (value > bestValue) {
      best = aggregate;
      bestValue = value;
    }
  }

  return bestValue > 0 ? best : undefined;
}

function sumGrowth(aggregates: readonly MutableDevelopmentAggregate[]): number {
  let total = 0;
  for (const aggregate of aggregates) {
    total += aggregate.totalGrowth;
  }

  return total;
}

function sumDecline(aggregates: readonly MutableDevelopmentAggregate[]): number {
  let total = 0;
  for (const aggregate of aggregates) {
    total += aggregate.totalDecline;
  }

  return total;
}

function toDevelopmentExample(aggregate: MutableDevelopmentAggregate | undefined): CareerDevelopmentReportPlayerExample | undefined {
  if (aggregate === undefined) {
    return undefined;
  }

  return {
    playerId: aggregate.playerId,
    startAge: aggregate.startAge,
    endAge: aggregate.endAge,
    totalGrowth: roundReportDelta(aggregate.totalGrowth),
    totalDecline: roundReportDelta(aggregate.totalDecline),
  };
}

function roundReportDelta(value: number): number {
  return Math.round(value * 100) / 100;
}

function defaultIo(): CareerCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}
