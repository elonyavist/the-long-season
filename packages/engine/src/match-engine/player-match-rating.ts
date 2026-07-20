import type { MatchEventSide, PlayerId } from "@game/domain";

import type { MatchContext } from "./match-context.ts";
import type { MatchStepEvent } from "./step-match.ts";

/** Sort modes supported by the player rating derivation helper. */
export type PlayerMatchRatingSortMode = "side_order" | "rating";

/**
 * Explicit player registration used to include quiet players in live ratings.
 */
export interface PlayerMatchRatingRegistration {
  /** Player to include even when no event credits them yet. */
  readonly playerId: PlayerId;
  /** Match side associated with this player. */
  readonly side: MatchEventSide;
}

/**
 * Event-derived player involvement summary used by live and final ratings.
 */
export interface PlayerMatchInvolvementSummary {
  /** Player whose structured match involvement is counted. */
  readonly playerId: PlayerId;
  /** Match side associated with this row. */
  readonly side: MatchEventSide;
  /** Goals credited to this player. */
  readonly goals: number;
  /** Assists credited to this player. */
  readonly assists: number;
  /** Non-assist chance creation credits when the event exposes a creator. */
  readonly chancesCreated: number;
  /** Shots credited to this player. */
  readonly shots: number;
  /** Shots on target credited to this player. */
  readonly shotsOnTarget: number;
  /** Saves credited to this player. */
  readonly saves: number;
  /** Blocks credited to this player. */
  readonly blocks: number;
  /** Missed shots credited to this player. */
  readonly misses: number;
  /** Shots blocked by the opposition after this player shot. */
  readonly blockedShots: number;
}

/**
 * Deterministic v1 player rating row.
 *
 * The rating is an explainable derived fact, not final match-balance truth.
 */
export interface PlayerMatchRatingRow extends PlayerMatchInvolvementSummary {
  /** Bounded rating on a familiar football-manager-like 1-10 scale. */
  readonly rating: number;
}

/** Input for deriving deterministic player ratings from structured events. */
export interface BuildPlayerMatchRatingsInput {
  /** Sparse events emitted so far by the match simulation. */
  readonly events: readonly MatchStepEvent[];
  /** Optional explicit players to include even when they are quiet. */
  readonly playerRegistrations?: readonly PlayerMatchRatingRegistration[];
  /** Optional deterministic output sort. Defaults to side and registration order. */
  readonly sortBy?: PlayerMatchRatingSortMode;
}

/** Immutable contribution ledger shared by provisional and final ratings. */
export interface PlayerMatchRatingLedger {
  /** Current structured contribution summaries in stable registration order. */
  readonly entries: readonly PlayerMatchRatingLedgerEntry[];
}

/** One ledger entry, including its deterministic registration order. */
export interface PlayerMatchRatingLedgerEntry extends PlayerMatchInvolvementSummary {
  readonly registrationOrder: number;
}

/**
 * Builds deterministic player ratings from structured match events.
 *
 * The v1 formula starts from `6.0`, rewards decisive positive football actions,
 * and lightly penalizes visible wasted attacking actions. It never uses random
 * noise and never invents events that the engine did not emit.
 */
export function buildPlayerMatchRatings(input: BuildPlayerMatchRatingsInput): readonly PlayerMatchRatingRow[] {
  const ledger = advancePlayerMatchRatingLedger(
    createPlayerMatchRatingLedger(input.playerRegistrations ?? []),
    input.events,
  );
  return projectPlayerMatchRatings(ledger, input.sortBy);
}

/** Creates an empty contribution ledger with explicit quiet-player rows. */
export function createPlayerMatchRatingLedger(
  registrations: readonly PlayerMatchRatingRegistration[],
): PlayerMatchRatingLedger {
  return { entries: initialRows(registrations).map(freezeLedgerEntry) };
}

/** Applies only newly observed structured events to a contribution ledger. */
export function advancePlayerMatchRatingLedger(
  ledger: PlayerMatchRatingLedger,
  events: readonly MatchStepEvent[],
): PlayerMatchRatingLedger {
  const rows = ledger.entries.map(toMutableRow);

  for (const event of events) {
    switch (event.type) {
      case "shot_outcome":
        applyShotOutcome(rows, event);
        break;
      case "kickoff":
      case "half_time":
      case "full_time":
        break;
    }
  }

  return { entries: rows.map(freezeLedgerEntry) };
}

/** Projects familiar 1-10 ratings from the current contribution ledger. */
export function projectPlayerMatchRatings(
  ledger: PlayerMatchRatingLedger,
  sortBy: PlayerMatchRatingSortMode = "side_order",
): readonly PlayerMatchRatingRow[] {
  const rows = ledger.entries.map(toMutableRow);
  rows.sort(sortBy === "rating" ? compareMutableRowsByRating : compareMutableRowsBySideOrder);
  return rows.map(freezeRow);
}

/**
 * Creates rating registrations from both lineups in a match context.
 */
export function playerRatingRegistrationsFromContext(context: MatchContext): readonly PlayerMatchRatingRegistration[] {
  return [
    ...context.home.lineup.map((slot) => ({ playerId: slot.playerId, side: "home" as const })),
    ...context.away.lineup.map((slot) => ({ playerId: slot.playerId, side: "away" as const })),
  ];
}

type MutablePlayerMatchRatingRow = PlayerMatchInvolvementSummary & {
  readonly registrationOrder: number;
  goals: number;
  assists: number;
  chancesCreated: number;
  shots: number;
  shotsOnTarget: number;
  saves: number;
  blocks: number;
  misses: number;
  blockedShots: number;
};

type ShotOutcomeEvent = Extract<MatchStepEvent, { readonly type: "shot_outcome" }>;

function initialRows(registrations: readonly PlayerMatchRatingRegistration[]): MutablePlayerMatchRatingRow[] {
  const rows: MutablePlayerMatchRatingRow[] = [];

  for (const registration of registrations) {
    if (findRow(rows, registration.playerId) !== undefined) {
      continue;
    }

    rows.push(createMutableRow(registration.playerId, registration.side, rows.length));
  }

  return rows;
}

function applyShotOutcome(rows: MutablePlayerMatchRatingRow[], event: ShotOutcomeEvent): void {
  if (event.outcome === "goal") {
    const scorer = findOrCreateRow(rows, event.scorerPlayerId, event.side);
    scorer.goals += 1;
    scorer.shots += 1;
    scorer.shotsOnTarget += 1;

    if (event.assistPlayerId !== undefined) {
      findOrCreateRow(rows, event.assistPlayerId, event.side).assists += 1;
    }

    if (event.creatorPlayerId !== undefined) {
      findOrCreateRow(rows, event.creatorPlayerId, event.side).chancesCreated += 1;
    }

    return;
  }

  const shooter = findOrCreateRow(rows, event.shooterPlayerId, event.side);
  shooter.shots += 1;
  shooter.shotsOnTarget += event.isShotOnTarget ? 1 : 0;

  if (event.outcome === "save" && event.goalkeeperPlayerId !== undefined) {
    findOrCreateRow(rows, event.goalkeeperPlayerId, oppositeSide(event.side)).saves += 1;
    return;
  }

  if (event.outcome === "block") {
    shooter.blockedShots += 1;

    if (event.primaryDefenderPlayerId !== undefined) {
      findOrCreateRow(rows, event.primaryDefenderPlayerId, oppositeSide(event.side)).blocks += 1;
    }

    return;
  }

  if (event.outcome === "miss") {
    shooter.misses += 1;
  }
}

function findOrCreateRow(
  rows: MutablePlayerMatchRatingRow[],
  playerId: PlayerId,
  side: MatchEventSide,
): MutablePlayerMatchRatingRow {
  const existing = findRow(rows, playerId);

  if (existing !== undefined) {
    return existing;
  }

  const created = createMutableRow(playerId, side, Number.POSITIVE_INFINITY);
  rows.push(created);
  return created;
}

function createMutableRow(
  playerId: PlayerId,
  side: MatchEventSide,
  registrationOrder: number,
): MutablePlayerMatchRatingRow {
  return {
    playerId,
    side,
    goals: 0,
    assists: 0,
    chancesCreated: 0,
    shots: 0,
    shotsOnTarget: 0,
    saves: 0,
    blocks: 0,
    misses: 0,
    blockedShots: 0,
    registrationOrder,
  };
}

function toMutableRow(entry: PlayerMatchRatingLedgerEntry): MutablePlayerMatchRatingRow {
  return { ...entry };
}

function freezeLedgerEntry(row: MutablePlayerMatchRatingRow): PlayerMatchRatingLedgerEntry {
  return {
    playerId: row.playerId,
    side: row.side,
    goals: row.goals,
    assists: row.assists,
    chancesCreated: row.chancesCreated,
    shots: row.shots,
    shotsOnTarget: row.shotsOnTarget,
    saves: row.saves,
    blocks: row.blocks,
    misses: row.misses,
    blockedShots: row.blockedShots,
    registrationOrder: row.registrationOrder,
  };
}

function findRow(
  rows: readonly MutablePlayerMatchRatingRow[],
  playerId: PlayerId,
): MutablePlayerMatchRatingRow | undefined {
  return rows.find((row) => row.playerId === playerId);
}

function freezeRow(row: MutablePlayerMatchRatingRow): PlayerMatchRatingRow {
  return {
    playerId: row.playerId,
    side: row.side,
    goals: row.goals,
    assists: row.assists,
    chancesCreated: row.chancesCreated,
    shots: row.shots,
    shotsOnTarget: row.shotsOnTarget,
    saves: row.saves,
    blocks: row.blocks,
    misses: row.misses,
    blockedShots: row.blockedShots,
    rating: ratingFor(row),
  };
}

function ratingFor(row: MutablePlayerMatchRatingRow): number {
  const raw =
    6 +
    row.goals * 1.1 +
    row.assists * 0.75 +
    row.chancesCreated * 0.25 +
    row.saves * 0.28 +
    row.blocks * 0.22 +
    Math.max(0, row.shotsOnTarget - row.goals) * 0.12 -
    row.misses * 0.16 -
    row.blockedShots * 0.1;

  return roundOneDecimal(clamp(raw, 1, 10));
}

function oppositeSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
}

function compareMutableRowsByRating(
  first: MutablePlayerMatchRatingRow,
  second: MutablePlayerMatchRatingRow,
): number {
  return (
    compareDescending(ratingFor(first), ratingFor(second)) ||
    compareMutableRowsBySideOrder(first, second)
  );
}

function compareMutableRowsBySideOrder(
  first: MutablePlayerMatchRatingRow,
  second: MutablePlayerMatchRatingRow,
): number {
  return (
    compareAscending(sideRank(first.side), sideRank(second.side)) ||
    compareAscending(first.registrationOrder, second.registrationOrder) ||
    comparePlayerIdsAscending(first.playerId, second.playerId)
  );
}

function sideRank(side: MatchEventSide): number {
  return side === "home" ? 0 : 1;
}

function compareDescending(first: number, second: number): number {
  return second - first;
}

function compareAscending(first: number, second: number): number {
  return first - second;
}

function comparePlayerIdsAscending(first: PlayerId, second: PlayerId): number {
  return String(first).localeCompare(String(second));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
