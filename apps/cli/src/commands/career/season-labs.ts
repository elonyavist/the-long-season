import { createFakeLeagueSystem } from "@game/content";
import {
  advanceCareerOneSeason,
  summarizePlayerDevelopmentAbilities,
  totalPlayerAbilityDelta,
  type AdvanceCareerReportRefreshMode,
} from "@game/engine";

import type { CliCareerState, CliGameState, PlayerId, ClubId } from "./types.ts";

type CliFixtureId = CliGameState["fixtureIds"][number];

const DEVELOPMENT_REPORT_SEASONS = 7;
const DEVELOPMENT_TRAJECTORY_SAMPLE_AGES = [16, 18, 21, 24, 26, 29, 32, 36, 40] as const;

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
  readonly trajectorySamples: readonly CareerDevelopmentTrajectorySample[];
}

/** Compact player example surfaced by the development report. */
export interface CareerDevelopmentReportPlayerExample {
  readonly playerId: PlayerId;
  readonly startAge: number;
  readonly endAge: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
}

/** Representative selected-club player trajectory shown by the lab report. */
export interface CareerDevelopmentTrajectorySample {
  readonly targetAge: number;
  readonly playerId: PlayerId;
  readonly startAge: number;
  readonly endAge: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly ceilingRoom: number;
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
    trajectorySamples: buildTrajectorySamples(selectedClubAggregates),
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
      potentialRoom: playerPotentialRoom(player),
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

    const delta = totalPlayerAbilityDelta(beforePlayer.abilities, afterPlayer.abilities);
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

function playerPotentialRoom(player: CliCareerState["gameState"]["players"][PlayerId]): number {
  return summarizePlayerDevelopmentAbilities(player).potentialRoom;
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

function buildTrajectorySamples(
  aggregates: readonly MutableDevelopmentAggregate[],
): readonly CareerDevelopmentTrajectorySample[] {
  return DEVELOPMENT_TRAJECTORY_SAMPLE_AGES.flatMap((targetAge): readonly CareerDevelopmentTrajectorySample[] => {
    const aggregate = nearestDevelopmentAggregate(aggregates, targetAge);

    if (aggregate === undefined) {
      return [];
    }

    return [
      {
        targetAge,
        playerId: aggregate.playerId,
        startAge: aggregate.startAge,
        endAge: aggregate.endAge,
        totalGrowth: roundReportDelta(aggregate.totalGrowth),
        totalDecline: roundReportDelta(aggregate.totalDecline),
        ceilingRoom: roundReportDelta(aggregate.potentialRoom),
      },
    ];
  });
}

function nearestDevelopmentAggregate(
  aggregates: readonly MutableDevelopmentAggregate[],
  targetAge: number,
): MutableDevelopmentAggregate | undefined {
  return [...aggregates].sort((left, right) => {
    const distance = Math.abs(left.startAge - targetAge) - Math.abs(right.startAge - targetAge);
    if (distance !== 0) {
      return distance;
    }

    const growth = right.totalGrowth - left.totalGrowth;
    if (growth !== 0) {
      return growth;
    }

    return String(left.playerId).localeCompare(String(right.playerId));
  })[0];
}

function roundReportDelta(value: number): number {
  return Math.round(value * 100) / 100;
}
