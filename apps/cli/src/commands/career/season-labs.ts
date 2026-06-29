import { createFakeLeagueSystem } from "@game/content";
import { advanceCareerOneSeason, type AdvanceCareerReportRefreshMode } from "@game/engine";

import type { CliCareerState, CliGameState, PlayerId, ClubId } from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];

const DEVELOPMENT_REPORT_SEASONS = 7;

/** In-memory development report for one loaded career save. */
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

/** Compact player example surfaced by the development report. */
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
    const advanced = advanceCareerOneSeason({
      careerState: workingState,
      worldSeed,
      mode: {
        kind: "reportRefresh",
        nextSeasonId: `${workingState.gameState.calendar.currentSeasonId}:development-${seasonIndex}` as AdvanceCareerReportRefreshMode["nextSeasonId"],
        nextSeasonStartDate: (workingState.gameState.calendar.currentDate + 365) as AdvanceCareerReportRefreshMode["nextSeasonStartDate"],
      },
    });

    if (advanced.status !== "advanced") {
      break;
    }

    applyDevelopmentDeltas(aggregates, workingState, advanced.careerState);
    workingState = advanced.careerState;
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

/** Result of trying to roll a completed career season into the next one. */
export type CareerSeasonRolloverResult = CareerSeasonRolloverRolledOver | CareerSeasonRolloverInvalid;

/** Successful season rollover result with archive and next-season facts. */
export interface CareerSeasonRolloverRolledOver {
  readonly status: "rolledOver";
  readonly careerState: CliCareerState;
  readonly previousSeasonId: string;
  readonly nextSeasonId: string;
  readonly championClubId: ClubId;
  readonly selectedClubFinish: NonNullable<CliCareerState["seasonHistory"]>[number]["selectedClubFinish"];
  readonly aggregateGoals: NonNullable<CliCareerState["seasonHistory"]>[number]["aggregateGoals"];
  readonly archivedSeasonCount: number;
  readonly newFixtureCount: number;
}

/** Invalid season rollover result. */
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
  const tableRules = createFakeLeagueSystem({
    worldSeed: careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed,
  }).tableRules;
  const advanced = advanceCareerOneSeason({
    careerState,
    worldSeed: careerState.careerWorld?.worldSeed ?? careerState.gameState.meta.seed,
    mode: {
      kind: "completedSeason",
      tableRules,
    },
  });

  if (advanced.status === "invalid") {
    return {
      status: "invalid",
      careerState,
      reason: advanced.reason,
      ...(advanced.fixtureId === undefined ? {} : { fixtureId: advanced.fixtureId as CliFixtureId }),
    };
  }

  const archivedSeason = advanced.careerState.seasonHistory?.[advanced.careerState.seasonHistory.length - 1];
  if (archivedSeason === undefined) {
    return {
      status: "invalid",
      careerState,
      reason: "season_table_empty",
    };
  }

  return {
    status: "rolledOver",
    careerState: advanced.careerState,
    previousSeasonId: advanced.facts.previousSeasonId,
    nextSeasonId: advanced.facts.nextSeasonId,
    championClubId: archivedSeason.championClubId as ClubId,
    selectedClubFinish: archivedSeason.selectedClubFinish,
    aggregateGoals: archivedSeason.aggregateGoals,
    archivedSeasonCount: advanced.careerState.seasonHistory?.length ?? 0,
    newFixtureCount: advanced.careerState.gameState.fixtureIds.length - careerState.gameState.fixtureIds.length,
  };
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

function applyDevelopmentDeltas(
  aggregates: ReadonlyMap<PlayerId, MutableDevelopmentAggregate>,
  beforeState: CliCareerState,
  afterState: CliCareerState,
): void {
  for (const [playerId, aggregate] of aggregates) {
    const beforePlayer = beforeState.gameState.players[playerId];
    const afterPlayer = afterState.gameState.players[playerId];
    if (beforePlayer === undefined || afterPlayer === undefined) {
      continue;
    }

    const delta = totalAbilityDelta(beforePlayer.abilities, afterPlayer.abilities);
    if (delta > 0) {
      aggregate.totalGrowth += delta;
    } else if (delta < 0) {
      aggregate.totalDecline += Math.abs(delta);
    }
    aggregate.endAge = playerAgeYears(afterState, playerId);
  }
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

function totalAbilityDelta(
  before: CliCareerState["gameState"]["players"][PlayerId]["abilities"],
  after: CliCareerState["gameState"]["players"][PlayerId]["abilities"],
): number {
  const deltas = [
    after.technical.finishing - before.technical.finishing,
    after.technical.passing - before.technical.passing,
    after.technical.longPassing - before.technical.longPassing,
    after.technical.crossing - before.technical.crossing,
    after.technical.dribbling - before.technical.dribbling,
    after.technical.technique - before.technical.technique,
    after.technical.tackling - before.technical.tackling,
    after.technical.penalties - before.technical.penalties,
    after.technical.freeKicks - before.technical.freeKicks,
    after.physical.pace - before.physical.pace,
    after.physical.strength - before.physical.strength,
    after.physical.stamina - before.physical.stamina,
    after.physical.agility - before.physical.agility,
    after.physical.heading - before.physical.heading,
    after.mental.positioning - before.mental.positioning,
    after.mental.vision - before.mental.vision,
    after.mental.anticipation - before.mental.anticipation,
    after.mental.composure - before.mental.composure,
    after.mental.determination - before.mental.determination,
    after.mental.leadership - before.mental.leadership,
    after.goalkeeping.reflexes - before.goalkeeping.reflexes,
    after.goalkeeping.handling - before.goalkeeping.handling,
    after.goalkeeping.rushingOut - before.goalkeeping.rushingOut,
    after.goalkeeping.goalkeeperPositioning - before.goalkeeping.goalkeeperPositioning,
    after.goalkeeping.footwork - before.goalkeeping.footwork,
  ];
  let total = 0;

  for (const delta of deltas) {
    total += delta;
  }

  return total;
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
