import type { ClubId, Fixture, FixtureId, PlayerId } from "@game/domain";

/**
 * Minimum season-level player goal statistics.
 *
 * These rows are derived data, not persisted state. They intentionally include
 * only player ID, club ID, and goals until later steps add richer match detail.
 */

/** Minimum durable match-event schema version that carries scorer IDs. */
const MIN_SCORER_MATCH_EVENT_SCHEMA_VERSION = 2;

/**
 * Explicit registration for one player in a season-stat table.
 */
export interface SeasonPlayerStatRegistration {
  /** Player to include in the stat table, even if they have no goals. */
  readonly playerId: PlayerId;
  /** Club associated with the player for this early fixed-lineup season. */
  readonly clubId: ClubId;
}

/**
 * One sorted season player goal row.
 */
export interface SeasonPlayerGoalStatRow {
  /** Player whose goals are counted. */
  readonly playerId: PlayerId;
  /** Club associated with this player's goals in the simulated season. */
  readonly clubId: ClubId;
  /** Goals scored by this player across structured match reports. */
  readonly goals: number;
}

/**
 * Input for deterministic season player-goal aggregation.
 */
export interface ComputeSeasonPlayerGoalStatsInput {
  /** Fixture lookup table keyed by fixture ID. */
  readonly fixtures: Readonly<Record<FixtureId, Fixture>>;
  /** Explicit ordered fixture IDs to read. */
  readonly fixtureIds: readonly FixtureId[];
  /** Optional explicit players to include even when their goal total is zero. */
  readonly playerRegistrations?: readonly SeasonPlayerStatRegistration[];
}

/**
 * Aggregates player goals from durable `MatchReport` goal events.
 *
 * @example
 * const rows = computeSeasonPlayerGoalStats({ fixtures, fixtureIds, playerRegistrations });
 */
export function computeSeasonPlayerGoalStats(input: ComputeSeasonPlayerGoalStatsInput): readonly SeasonPlayerGoalStatRow[] {
  const rows = initialRows(input.playerRegistrations ?? []);

  for (const fixtureId of input.fixtureIds) {
    const fixture = input.fixtures[fixtureId];
    const report = fixture?.result?.report;

    if (fixture === undefined || report === undefined || report.eventSchemaVersion < MIN_SCORER_MATCH_EVENT_SCHEMA_VERSION) {
      continue;
    }

    for (const event of report.events) {
      if (event.type !== "goal") {
        continue;
      }

      const scoringClubId = event.shot.side === "home" ? fixture.homeClubId : fixture.awayClubId;
      const row = findOrCreateRow(rows, event.scorerPlayerId, scoringClubId);
      row.goals += 1;
    }
  }

  rows.sort(compareMutableRows);

  return rows.map(freezeRow);
}

/**
 * Creates mutable rows from explicit player registrations.
 */
function initialRows(registrations: readonly SeasonPlayerStatRegistration[]): MutableSeasonPlayerGoalStatRow[] {
  const rows: MutableSeasonPlayerGoalStatRow[] = [];

  for (const registration of registrations) {
    if (findRow(rows, registration.playerId) !== undefined) {
      continue;
    }

    rows.push({
      playerId: registration.playerId,
      clubId: registration.clubId,
      goals: 0,
    });
  }

  return rows;
}

/**
 * Finds an existing row or creates one for an unregistered scorer.
 */
function findOrCreateRow(
  rows: MutableSeasonPlayerGoalStatRow[],
  playerId: PlayerId,
  clubId: ClubId,
): MutableSeasonPlayerGoalStatRow {
  const existing = findRow(rows, playerId);

  if (existing !== undefined) {
    return existing;
  }

  const created = {
    playerId,
    clubId,
    goals: 0,
  };
  rows.push(created);

  return created;
}

/**
 * Finds one mutable player-stat row by player ID.
 */
function findRow(
  rows: readonly MutableSeasonPlayerGoalStatRow[],
  playerId: PlayerId,
): MutableSeasonPlayerGoalStatRow | undefined {
  for (const row of rows) {
    if (row.playerId === playerId) {
      return row;
    }
  }

  return undefined;
}

/**
 * Compares player goal rows with a deterministic final tie-breaker.
 */
function compareMutableRows(
  first: MutableSeasonPlayerGoalStatRow,
  second: MutableSeasonPlayerGoalStatRow,
): number {
  return compareDescending(first.goals, second.goals) || comparePlayerIdsAscending(first.playerId, second.playerId);
}

/**
 * Compares numeric values in descending order.
 */
function compareDescending(first: number, second: number): number {
  return second - first;
}

/**
 * Compares player IDs by stable ASCII/code-unit order.
 */
function comparePlayerIdsAscending(first: PlayerId, second: PlayerId): number {
  const firstValue = String(first);
  const secondValue = String(second);

  if (firstValue < secondValue) {
    return -1;
  }

  if (firstValue > secondValue) {
    return 1;
  }

  return 0;
}

/**
 * Freezes one mutable accumulator into the public row shape.
 */
function freezeRow(row: MutableSeasonPlayerGoalStatRow): SeasonPlayerGoalStatRow {
  return {
    playerId: row.playerId,
    clubId: row.clubId,
    goals: row.goals,
  };
}

/**
 * Mutable accumulator used internally while aggregating player goals.
 */
interface MutableSeasonPlayerGoalStatRow extends SeasonPlayerGoalStatRow {
  goals: number;
}
