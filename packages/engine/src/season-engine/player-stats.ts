import type { ClubId, Fixture, FixtureId, MatchEventSide, PlayerId } from "@game/domain";

/**
 * Minimum season-level player statistics.
 *
 * These rows are derived data, not persisted state. They intentionally include
 * only the current durable match-event facts that have season-level meaning.
 */

/** Minimum durable match-event schema version that carries scorer IDs. */
const MIN_SCORER_MATCH_EVENT_SCHEMA_VERSION = 2;

/** Minimum durable match-event schema version that carries assist IDs. */
const MIN_ASSIST_MATCH_EVENT_SCHEMA_VERSION = 4;

/** Minimum durable match-event schema version that carries goalkeeper save IDs. */
const MIN_GOALKEEPER_SAVE_MATCH_EVENT_SCHEMA_VERSION = 5;

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
 * One season player summary row for current durable player-counted stats.
 */
export interface SeasonPlayerSummaryStatRow {
  /** Player whose season events are counted. */
  readonly playerId: PlayerId;
  /** Club associated with this player's current fixed-lineup season. */
  readonly clubId: ClubId;
  /** Goals scored by this player across structured match reports. */
  readonly goals: number;
  /** Assists credited to this player across structured match reports. */
  readonly assists: number;
  /** Goalkeeper saves credited to this player across structured match reports. */
  readonly saves: number;
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
 * Input for deterministic season player-summary aggregation.
 */
export interface ComputeSeasonPlayerSummaryStatsInput {
  /** Fixture lookup table keyed by fixture ID. */
  readonly fixtures: Readonly<Record<FixtureId, Fixture>>;
  /** Explicit ordered fixture IDs to read. */
  readonly fixtureIds: readonly FixtureId[];
  /** Optional explicit players to include even when their totals are zero. */
  readonly playerRegistrations?: readonly SeasonPlayerStatRegistration[];
}

/**
 * Aggregates player goals from durable `MatchReport` goal events.
 *
 * @example
 * const rows = computeSeasonPlayerGoalStats({ fixtures, fixtureIds, playerRegistrations });
 */
export function computeSeasonPlayerGoalStats(input: ComputeSeasonPlayerGoalStatsInput): readonly SeasonPlayerGoalStatRow[] {
  const rows = computeSeasonPlayerSummaryStats(input).map(({ playerId, clubId, goals }) => ({
    playerId,
    clubId,
    goals,
  }));

  return [...rows].sort(compareGoalRows);
}

/**
 * Aggregates current player-counted season stats from durable `MatchReport` events.
 *
 * @example
 * const rows = computeSeasonPlayerSummaryStats({ fixtures, fixtureIds, playerRegistrations });
 */
export function computeSeasonPlayerSummaryStats(
  input: ComputeSeasonPlayerSummaryStatsInput,
): readonly SeasonPlayerSummaryStatRow[] {
  const rows = initialRows(input.playerRegistrations ?? []);

  for (const fixtureId of input.fixtureIds) {
    const fixture = input.fixtures[fixtureId];
    const report = fixture?.result?.report;

    if (fixture === undefined || report === undefined || report.eventSchemaVersion < MIN_SCORER_MATCH_EVENT_SCHEMA_VERSION) {
      continue;
    }

    for (const event of report.events) {
      switch (event.type) {
        case "goal": {
          const scoringClubId = sideClubId(fixture, event.shot.side);
          findOrCreateRow(rows, event.scorerPlayerId, scoringClubId).goals += 1;

          if (report.eventSchemaVersion >= MIN_ASSIST_MATCH_EVENT_SCHEMA_VERSION && event.assistPlayerId !== undefined) {
            findOrCreateRow(rows, event.assistPlayerId, scoringClubId).assists += 1;
          }

          break;
        }

        case "save": {
          if (report.eventSchemaVersion < MIN_GOALKEEPER_SAVE_MATCH_EVENT_SCHEMA_VERSION) {
            break;
          }

          const defendingClubId = sideClubId(fixture, oppositeSide(event.shot.side));
          findOrCreateRow(rows, event.goalkeeperPlayerId, defendingClubId).saves += 1;
          break;
        }

        case "block":
        case "full_time":
        case "half_time":
        case "kickoff":
        case "miss":
          break;
      }
    }
  }

  rows.sort(compareSummaryRows);

  return rows.map(freezeSummaryRow);
}

/**
 * Creates mutable rows from explicit player registrations.
 */
function initialRows(registrations: readonly SeasonPlayerStatRegistration[]): MutableSeasonPlayerSummaryStatRow[] {
  const rows: MutableSeasonPlayerSummaryStatRow[] = [];

  for (const registration of registrations) {
    if (findRow(rows, registration.playerId) !== undefined) {
      continue;
    }

    rows.push({
      playerId: registration.playerId,
      clubId: registration.clubId,
      goals: 0,
      assists: 0,
      saves: 0,
      clubIsRegistered: true,
    });
  }

  return rows;
}

/**
 * Finds an existing row or creates one for an unregistered scorer.
 *
 * The club comes from the fixture side the event happened on, which is the club
 * the player was actually fielded by (A8). A registration only names the club
 * for a player who produced no events at all, and is overridden by his first
 * event: two sources of truth for one attribution is one too many, and the
 * caller-supplied one is the one that can be wrong. The two agree today, so
 * nothing moves; they stop agreeing at Phase 82A's first loan, where a goal
 * scored on loan must not be recorded against the parent club.
 *
 * A player fielded by two clubs in one season keeps his first club here. That
 * is a real limitation of a per-season row and it belongs to Phase 82A with the
 * rest of the registration model, not to a silent last-event-wins rule.
 */
function findOrCreateRow(
  rows: MutableSeasonPlayerSummaryStatRow[],
  playerId: PlayerId,
  clubId: ClubId,
): MutableSeasonPlayerSummaryStatRow {
  const existing = findRow(rows, playerId);

  if (existing !== undefined) {
    if (existing.clubIsRegistered) {
      existing.clubId = clubId;
      existing.clubIsRegistered = false;
    }

    return existing;
  }

  const created = {
    playerId,
    clubId,
    goals: 0,
    assists: 0,
    saves: 0,
    clubIsRegistered: false,
  };
  rows.push(created);

  return created;
}

/**
 * Finds one mutable player-stat row by player ID.
 */
function findRow(
  rows: readonly MutableSeasonPlayerSummaryStatRow[],
  playerId: PlayerId,
): MutableSeasonPlayerSummaryStatRow | undefined {
  for (const row of rows) {
    if (row.playerId === playerId) {
      return row;
    }
  }

  return undefined;
}

/**
 * Compares player summary rows with a deterministic final tie-breaker.
 */
function compareSummaryRows(
  first: MutableSeasonPlayerSummaryStatRow,
  second: MutableSeasonPlayerSummaryStatRow,
): number {
  return (
    compareDescending(first.goals, second.goals) ||
    compareDescending(first.assists, second.assists) ||
    compareDescending(first.saves, second.saves) ||
    comparePlayerIdsAscending(first.playerId, second.playerId)
  );
}

/**
 * Compares public goal rows with a deterministic final tie-breaker.
 */
function compareGoalRows(first: SeasonPlayerGoalStatRow, second: SeasonPlayerGoalStatRow): number {
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
 * Returns the fixture club ID for one match side.
 */
function sideClubId(fixture: Fixture, side: MatchEventSide): ClubId {
  return side === "home" ? fixture.homeClubId : fixture.awayClubId;
}

/**
 * Returns the opposite side of a persisted match event.
 */
function oppositeSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
}

/**
 * Freezes one mutable accumulator into the public summary row shape.
 */
function freezeSummaryRow(row: MutableSeasonPlayerSummaryStatRow): SeasonPlayerSummaryStatRow {
  return {
    playerId: row.playerId,
    clubId: row.clubId,
    goals: row.goals,
    assists: row.assists,
    saves: row.saves,
  };
}

/**
 * Mutable accumulator used internally while aggregating player season summaries.
 */
interface MutableSeasonPlayerSummaryStatRow extends SeasonPlayerSummaryStatRow {
  clubId: ClubId;
  goals: number;
  assists: number;
  saves: number;
  /** Whether `clubId` still comes from a registration rather than an event. */
  clubIsRegistered: boolean;
}
