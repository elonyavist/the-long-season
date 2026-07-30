import {
  createCareerPlayerSeasonStatistics,
  type CareerPlayerSeasonStatistics,
  type CareerPlayerSeasonStatisticsRow,
  type CareerPlayerStatisticsCoverage,
  type CareerState,
  type FixtureId,
  type PlayerId,
  type PlayerParticipationLedger,
  type SeasonId,
} from "@game/domain";

import { computeSeasonPlayerSummaryStats } from "../season-engine/player-stats.ts";

const MIN_EVENT_STATISTICS_SCHEMA_VERSION = 2;
const COMPLETE_EVENT_STATISTICS_SCHEMA_VERSION = 5;

/** Input for building durable player totals for one season. */
export interface BuildCareerPlayerSeasonStatisticsInput {
  /** Career snapshot containing fixtures and the current participation ledger. */
  readonly careerState: CareerState;
  /** Season whose rows should be summarized. */
  readonly seasonId: SeasonId;
}

/** Input for selecting one player's current-season and career totals. */
export interface SelectCareerPlayerStatisticsInput {
  /** Career snapshot containing current and archived season facts. */
  readonly careerState: CareerState;
  /** Player to summarize; the player does not need to remain active. */
  readonly playerId: PlayerId;
}

/** Derived player totals with truthful source coverage and display-safe helpers. */
export interface CareerPlayerStatisticsSummary extends CareerPlayerSeasonStatisticsRow {
  /** Starts plus substitute appearances. */
  readonly appearances: number;
  /** Weighted average of all available rating samples. */
  readonly averageRating?: number;
  /** Coverage of starts, appearances, minutes, and ratings. */
  readonly participationCoverage: CareerPlayerStatisticsCoverage;
  /** Coverage of goals, assists, and goalkeeper saves. */
  readonly eventCoverage: CareerPlayerStatisticsCoverage;
}

/** One deterministic current-season and whole-career statistics selection. */
export interface CareerPlayerStatisticsSelection {
  /** Season represented by `currentSeason`. */
  readonly currentSeasonId: SeasonId;
  /** Current-season totals, including truthful zeroes when the row is absent. */
  readonly currentSeason: CareerPlayerStatisticsSummary;
  /** Archived seasons plus the current season, with weighted rating totals. */
  readonly career: CareerPlayerStatisticsSummary;
}

/**
 * Builds one deterministic player-statistics archive before season rollover.
 *
 * Participation comes only from the durable ledger, while goal, assist, and
 * save totals reuse the canonical structured match-event aggregator.
 */
export function buildCareerPlayerSeasonStatistics(
  input: BuildCareerPlayerSeasonStatisticsInput,
): CareerPlayerSeasonStatistics {
  const fixtureIds = seasonFixtureIds(input);
  const playedFixtureIds = fixtureIds.filter(
    (fixtureId) => input.careerState.gameState.fixtures[fixtureId]?.result?.played === true,
  );
  const mutableRows = new Map<PlayerId, MutableCareerPlayerSeasonStatisticsRow>();

  for (const row of seasonParticipationRows(input.careerState.playerParticipationLedger, input.seasonId)) {
    const target = mutableRow(mutableRows, row.playerId);
    target.starts += row.starts;
    target.substituteAppearances += row.substituteAppearances;
    target.minutes += row.minutes;
    target.ratingTotal += row.ratingTotal;
    target.ratingSamples += row.ratingSamples;
  }

  const eventRows = computeSeasonPlayerSummaryStats({
    fixtures: input.careerState.gameState.fixtures,
    fixtureIds: playedFixtureIds,
  });
  for (const eventRow of eventRows) {
    const target = mutableRow(mutableRows, eventRow.playerId);
    target.goals = eventRow.goals;
    target.assists = eventRow.assists;
    target.saves = eventRow.saves;
  }

  const rows = [...mutableRows.values()]
    .sort(comparePlayerRows)
    .map(freezePlayerRow);

  return createCareerPlayerSeasonStatistics({
    participationCoverage: participationCoverage(
      input.careerState.playerParticipationLedger,
      input.seasonId,
      playedFixtureIds,
    ),
    eventCoverage: eventCoverage(input.careerState, playedFixtureIds),
    rows,
  });
}

/**
 * Selects one player's current-season and cumulative career statistics.
 *
 * Career rating averages remain weighted because selectors retain and sum the
 * underlying `ratingTotal` and `ratingSamples` instead of averaging averages.
 */
export function selectCareerPlayerStatistics(
  input: SelectCareerPlayerStatisticsInput,
): CareerPlayerStatisticsSelection {
  const currentSeasonId = input.careerState.gameState.calendar.currentSeasonId;
  const currentStatistics = buildCareerPlayerSeasonStatistics({
    careerState: input.careerState,
    seasonId: currentSeasonId,
  });
  const archivedStatistics = (input.careerState.seasonHistory ?? []).map(
    (entry) => createCareerPlayerSeasonStatistics(entry.playerStatistics),
  );
  const careerSources = [...archivedStatistics, currentStatistics];

  return {
    currentSeasonId,
    currentSeason: summarizePlayer(
      input.playerId,
      rowForPlayer(currentStatistics, input.playerId),
      currentStatistics.participationCoverage,
      currentStatistics.eventCoverage,
    ),
    career: summarizePlayer(
      input.playerId,
      aggregatePlayerRows(careerSources, input.playerId),
      combineCoverage(careerSources.map((source) => source.participationCoverage)),
      combineCoverage(careerSources.map((source) => source.eventCoverage)),
    ),
  };
}

/** Mutable accumulator kept private so exported contracts remain readonly. */
interface MutableCareerPlayerSeasonStatisticsRow {
  playerId: PlayerId;
  starts: number;
  substituteAppearances: number;
  minutes: number;
  ratingTotal: number;
  ratingSamples: number;
  goals: number;
  assists: number;
  saves: number;
}

/** Returns canonical fixture order for the requested season. */
function seasonFixtureIds(input: BuildCareerPlayerSeasonStatisticsInput): readonly FixtureId[] {
  return input.careerState.gameState.fixtureIds.filter(
    (fixtureId) => input.careerState.gameState.fixtures[fixtureId]?.seasonId === input.seasonId,
  );
}

/** Returns current-ledger rows belonging to the requested season. */
function seasonParticipationRows(
  ledger: PlayerParticipationLedger | undefined,
  seasonId: SeasonId,
): readonly NonNullable<PlayerParticipationLedger["rows"][string]>[] {
  if (ledger === undefined) {
    return [];
  }

  return ledger.rowKeys
    .map((rowKey) => ledger.rows[rowKey])
    .filter((row): row is NonNullable<typeof row> => row !== undefined && row.seasonId === seasonId);
}

/** Calculates coverage by comparing accrued fixture IDs with played fixtures. */
function participationCoverage(
  ledger: PlayerParticipationLedger | undefined,
  seasonId: SeasonId,
  playedFixtureIds: readonly FixtureId[],
): CareerPlayerStatisticsCoverage {
  if (playedFixtureIds.length === 0) {
    return "complete";
  }
  if (ledger === undefined) {
    return "unavailable";
  }

  const playedIds = new Set(playedFixtureIds);
  const coveredIds = new Set<FixtureId>();
  for (const row of seasonParticipationRows(ledger, seasonId)) {
    for (const fixtureId of row.appliedFixtureIds) {
      if (playedIds.has(fixtureId)) {
        coveredIds.add(fixtureId);
      }
    }
  }

  if (coveredIds.size === 0) {
    return "unavailable";
  }
  if (coveredIds.size !== playedFixtureIds.length) {
    return "partial";
  }

  const hasMissingAppearanceRating = seasonParticipationRows(ledger, seasonId).some(
    (row) => row.ratingSamples < row.starts + row.substituteAppearances,
  );
  return hasMissingAppearanceRating ? "partial" : "complete";
}

/** Calculates event coverage from the persisted match-report schema facts. */
function eventCoverage(
  careerState: CareerState,
  playedFixtureIds: readonly FixtureId[],
): CareerPlayerStatisticsCoverage {
  if (playedFixtureIds.length === 0) {
    return "complete";
  }

  let availableFixtureCount = 0;
  let completeFixtureCount = 0;

  for (const fixtureId of playedFixtureIds) {
    const schemaVersion = Number(
      careerState.gameState.fixtures[fixtureId]?.result?.report?.eventSchemaVersion ?? 0,
    );
    if (schemaVersion >= MIN_EVENT_STATISTICS_SCHEMA_VERSION) {
      availableFixtureCount += 1;
    }
    if (schemaVersion >= COMPLETE_EVENT_STATISTICS_SCHEMA_VERSION) {
      completeFixtureCount += 1;
    }
  }

  if (availableFixtureCount === 0) {
    return "unavailable";
  }
  return completeFixtureCount === playedFixtureIds.length ? "complete" : "partial";
}

/** Finds or creates the accumulator for one player. */
function mutableRow(
  rows: Map<PlayerId, MutableCareerPlayerSeasonStatisticsRow>,
  playerId: PlayerId,
): MutableCareerPlayerSeasonStatisticsRow {
  const existing = rows.get(playerId);
  if (existing !== undefined) {
    return existing;
  }

  const row = emptyPlayerRow(playerId);
  rows.set(playerId, row);
  return row;
}

/** Builds a zeroed accumulator for a player absent from one source. */
function emptyPlayerRow(playerId: PlayerId): MutableCareerPlayerSeasonStatisticsRow {
  return {
    playerId,
    starts: 0,
    substituteAppearances: 0,
    minutes: 0,
    ratingTotal: 0,
    ratingSamples: 0,
    goals: 0,
    assists: 0,
    saves: 0,
  };
}

/** Converts an internal accumulator to the durable readonly contract. */
function freezePlayerRow(
  row: MutableCareerPlayerSeasonStatisticsRow,
): CareerPlayerSeasonStatisticsRow {
  return { ...row };
}

/** Provides deterministic lexicographic archive order. */
function comparePlayerRows(
  left: CareerPlayerSeasonStatisticsRow,
  right: CareerPlayerSeasonStatisticsRow,
): number {
  if (String(left.playerId) < String(right.playerId)) return -1;
  if (String(left.playerId) > String(right.playerId)) return 1;
  return 0;
}

/** Returns one archived row when it exists. */
function rowForPlayer(
  statistics: CareerPlayerSeasonStatistics,
  playerId: PlayerId,
): CareerPlayerSeasonStatisticsRow | undefined {
  return statistics.rows.find((row) => row.playerId === playerId);
}

/** Sums one player's rows without losing weighted-rating inputs. */
function aggregatePlayerRows(
  sources: readonly CareerPlayerSeasonStatistics[],
  playerId: PlayerId,
): CareerPlayerSeasonStatisticsRow {
  const aggregate = emptyPlayerRow(playerId);

  for (const source of sources) {
    const row = rowForPlayer(source, playerId);
    if (row === undefined) {
      continue;
    }
    aggregate.starts += row.starts;
    aggregate.substituteAppearances += row.substituteAppearances;
    aggregate.minutes += row.minutes;
    aggregate.ratingTotal += row.ratingTotal;
    aggregate.ratingSamples += row.ratingSamples;
    aggregate.goals += row.goals;
    aggregate.assists += row.assists;
    aggregate.saves += row.saves;
  }

  return freezePlayerRow(aggregate);
}

/** Adds display-safe derivations to one durable row. */
function summarizePlayer(
  playerId: PlayerId,
  row: CareerPlayerSeasonStatisticsRow | undefined,
  participation: CareerPlayerStatisticsCoverage,
  events: CareerPlayerStatisticsCoverage,
): CareerPlayerStatisticsSummary {
  const totals = row ?? freezePlayerRow(emptyPlayerRow(playerId));
  return {
    ...totals,
    appearances: totals.starts + totals.substituteAppearances,
    ...(totals.ratingSamples === 0
      ? {}
      : { averageRating: totals.ratingTotal / totals.ratingSamples }),
    participationCoverage: participation,
    eventCoverage: events,
  };
}

/** Combines season-level source coverage without hiding any unavailable gap. */
function combineCoverage(
  coverages: readonly CareerPlayerStatisticsCoverage[],
): CareerPlayerStatisticsCoverage {
  if (coverages.length === 0 || coverages.every((coverage) => coverage === "unavailable")) {
    return "unavailable";
  }
  return coverages.every((coverage) => coverage === "complete") ? "complete" : "partial";
}
