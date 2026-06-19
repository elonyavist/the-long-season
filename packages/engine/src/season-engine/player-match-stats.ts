import type { MatchEventSide, MatchReport, PlayerId } from "@game/domain";

/**
 * Sort modes supported by the player match-stat derivation helper.
 */
export type PlayerMatchStatsSortMode = "side_order" | "contribution";

/**
 * Explicit one-match player registration used to include zero-stat players.
 */
export interface PlayerMatchStatRegistration {
  /** Player to include in the match stat table, even if no event credits them. */
  readonly playerId: PlayerId;
  /** Match side associated with this player. */
  readonly side: MatchEventSide;
}

/**
 * One derived player match-stat row.
 */
export interface PlayerMatchStatRow {
  /** Player whose match contribution is counted. */
  readonly playerId: PlayerId;
  /** Match side associated with this row. */
  readonly side: MatchEventSide;
  /** Goals credited to this player. */
  readonly goals: number;
  /** Assists credited to this player. */
  readonly assists: number;
  /** Shots credited to this player when current durable events identify the shooter. */
  readonly shots: number;
  /** Shots on target credited to this player when current durable events identify the shooter. */
  readonly shotsOnTarget: number;
  /** Saves credited to this player when current durable events identify the goalkeeper. */
  readonly saves: number;
}

/**
 * Input for deriving player match stats from one durable match report.
 */
export interface ComputePlayerMatchStatsInput {
  /** Durable report that is the source of truth for event-derived stats. */
  readonly report: MatchReport;
  /** Optional explicit players to include even when they have no stats. */
  readonly playerRegistrations?: readonly PlayerMatchStatRegistration[];
  /** Optional deterministic output sort. Defaults to side and registration order. */
  readonly sortBy?: PlayerMatchStatsSortMode;
}

/**
 * Derives compact per-player match stats from durable match-report events.
 *
 * @example
 * const rows = computePlayerMatchStats({ report, playerRegistrations });
 */
export function computePlayerMatchStats(input: ComputePlayerMatchStatsInput): readonly PlayerMatchStatRow[] {
  const rows = initialRows(input.playerRegistrations ?? []);

  for (const event of input.report.events) {
    switch (event.type) {
      case "goal": {
        const scorer = findOrCreateRow(rows, event.scorerPlayerId, event.shot.side);
        scorer.goals += 1;
        scorer.shots += 1;
        scorer.shotsOnTarget += 1;

        if (event.assistPlayerId !== undefined) {
          const assistant = findOrCreateRow(rows, event.assistPlayerId, event.shot.side);
          assistant.assists += 1;
        }

        break;
      }

      case "save": {
        creditShot(rows, event.shooterPlayerId, event.shot.side, event.shot.isShotOnTarget);

        const goalkeeper = findOrCreateRow(rows, event.goalkeeperPlayerId, oppositeSide(event.shot.side));
        goalkeeper.saves += 1;
        break;
      }

      case "block":
      case "miss":
        creditShot(rows, event.shooterPlayerId, event.shot.side, event.shot.isShotOnTarget);
        break;

      case "full_time":
      case "half_time":
      case "kickoff":
        break;
    }
  }

  rows.sort(input.sortBy === "contribution" ? compareMutableRowsByContribution : compareMutableRowsBySideOrder);

  return rows.map(freezeRow);
}

/**
 * Credits one shot to a player when the durable event identifies a shooter.
 */
function creditShot(
  rows: MutablePlayerMatchStatRow[],
  shooterPlayerId: PlayerId | undefined,
  side: MatchEventSide,
  isShotOnTarget: boolean,
): void {
  if (shooterPlayerId === undefined) {
    return;
  }

  const shooter = findOrCreateRow(rows, shooterPlayerId, side);
  shooter.shots += 1;
  shooter.shotsOnTarget += isShotOnTarget ? 1 : 0;
}

/**
 * Creates mutable rows from explicit one-match registrations.
 */
function initialRows(registrations: readonly PlayerMatchStatRegistration[]): MutablePlayerMatchStatRow[] {
  const rows: MutablePlayerMatchStatRow[] = [];

  for (const registration of registrations) {
    if (findRow(rows, registration.playerId) !== undefined) {
      continue;
    }

    rows.push({
      playerId: registration.playerId,
      side: registration.side,
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      saves: 0,
      registrationOrder: rows.length,
    });
  }

  return rows;
}

/**
 * Finds an existing row or creates one for an unregistered event participant.
 */
function findOrCreateRow(
  rows: MutablePlayerMatchStatRow[],
  playerId: PlayerId,
  side: MatchEventSide,
): MutablePlayerMatchStatRow {
  const existing = findRow(rows, playerId);

  if (existing !== undefined) {
    return existing;
  }

  const created: MutablePlayerMatchStatRow = {
    playerId,
    side,
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    saves: 0,
    registrationOrder: Number.POSITIVE_INFINITY,
  };
  rows.push(created);

  return created;
}

/**
 * Finds one mutable player match-stat row by player ID.
 */
function findRow(
  rows: readonly MutablePlayerMatchStatRow[],
  playerId: PlayerId,
): MutablePlayerMatchStatRow | undefined {
  for (const row of rows) {
    if (row.playerId === playerId) {
      return row;
    }
  }

  return undefined;
}

/**
 * Returns the defending side for a shot event.
 */
function oppositeSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
}

/**
 * Compares rows by side, explicit registration order, then stable player ID.
 */
function compareMutableRowsBySideOrder(
  first: MutablePlayerMatchStatRow,
  second: MutablePlayerMatchStatRow,
): number {
  return (
    compareSides(first.side, second.side) ||
    compareAscending(first.registrationOrder, second.registrationOrder) ||
    comparePlayerIdsAscending(first.playerId, second.playerId)
  );
}

/**
 * Compares rows by contribution totals, then side/order for deterministic output.
 */
function compareMutableRowsByContribution(
  first: MutablePlayerMatchStatRow,
  second: MutablePlayerMatchStatRow,
): number {
  return (
    compareDescending(first.goals, second.goals) ||
    compareDescending(first.assists, second.assists) ||
    compareDescending(first.saves, second.saves) ||
    compareDescending(first.shotsOnTarget, second.shotsOnTarget) ||
    compareDescending(first.shots, second.shots) ||
    compareMutableRowsBySideOrder(first, second)
  );
}

/**
 * Compares match sides in home-before-away order.
 */
function compareSides(first: MatchEventSide, second: MatchEventSide): number {
  return sideRank(first) - sideRank(second);
}

/**
 * Maps a match side to its deterministic sort rank.
 */
function sideRank(side: MatchEventSide): number {
  return side === "home" ? 0 : 1;
}

/**
 * Compares numeric values in descending order.
 */
function compareDescending(first: number, second: number): number {
  return second - first;
}

/**
 * Compares numeric values in ascending order.
 */
function compareAscending(first: number, second: number): number {
  return first - second;
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
function freezeRow(row: MutablePlayerMatchStatRow): PlayerMatchStatRow {
  return {
    playerId: row.playerId,
    side: row.side,
    goals: row.goals,
    assists: row.assists,
    shots: row.shots,
    shotsOnTarget: row.shotsOnTarget,
    saves: row.saves,
  };
}

/**
 * Mutable accumulator used internally while deriving match stats.
 */
interface MutablePlayerMatchStatRow extends PlayerMatchStatRow {
  /** Registration order used only for deterministic side-order sorting. */
  readonly registrationOrder: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  saves: number;
}
