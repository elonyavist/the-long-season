import type { ClubId, PlayerId } from "../types/ids.ts";

/** Required number of starters for an eleven-a-side match lineup. */
export const MATCH_STARTER_COUNT = 11;

/**
 * User-controlled squad depth for one club.
 *
 * The contract is deliberately explicit: callers provide the whole squad, the
 * selected starters, and the remaining bench/reserve group. Domain validation
 * checks consistency but never chooses players automatically.
 */
export interface SquadDepth {
  /** Club this squad-depth snapshot belongs to. */
  readonly clubId: ClubId;
  /** Ordered senior squad player IDs available to this club context. */
  readonly squadPlayerIds: readonly PlayerId[];
  /** Ordered player IDs explicitly selected as starters by the user/caller. */
  readonly starterPlayerIds: readonly PlayerId[];
  /** Ordered player IDs not starting the match but still in the squad group. */
  readonly benchReservePlayerIds: readonly PlayerId[];
}

/** Stable validation failure reasons for squad-depth contracts. */
export type SquadDepthErrorCode =
  | "empty_squad"
  | "duplicate_squad_player"
  | "duplicate_starter_player"
  | "duplicate_bench_reserve_player"
  | "unknown_starter_player"
  | "unknown_bench_reserve_player"
  | "starter_bench_reserve_overlap"
  | "invalid_starter_count";

/**
 * Error thrown when a squad-depth snapshot is ambiguous or impossible.
 *
 * @example
 * if (error instanceof SquadDepthError && error.code === "unknown_starter_player") {
 *   // The UI can point to a starter who is no longer in the club squad.
 * }
 */
export class SquadDepthError extends Error {
  /** Machine-readable validation failure code. */
  public readonly code: SquadDepthErrorCode;

  /** Creates a typed squad-depth validation error. */
  public constructor(code: SquadDepthErrorCode, message: string) {
    super(message);
    this.name = "SquadDepthError";
    this.code = code;
  }
}

/**
 * Builds a validated squad-depth snapshot.
 *
 * This validates membership, duplicate IDs, and starter/bench overlap. It does
 * not require exactly eleven starters because non-match screens may inspect a
 * partial or draft squad; call `validateMatchSquadDepth` for match-lineup use.
 */
export function createSquadDepth(input: SquadDepth): SquadDepth {
  if (input.squadPlayerIds.length === 0) {
    throw new SquadDepthError("empty_squad", "Squad depth must include at least one squad player");
  }

  assertNoDuplicatePlayers(input.squadPlayerIds, "duplicate_squad_player", "Squad player is duplicated");
  assertNoDuplicatePlayers(input.starterPlayerIds, "duplicate_starter_player", "Starter player is duplicated");
  assertNoDuplicatePlayers(input.benchReservePlayerIds, "duplicate_bench_reserve_player", "Bench/reserve player is duplicated");

  const squadPlayers = new Set(input.squadPlayerIds);
  const starterPlayers = new Set(input.starterPlayerIds);

  for (const playerId of input.starterPlayerIds) {
    if (!squadPlayers.has(playerId)) {
      throw new SquadDepthError("unknown_starter_player", `Starter player is not in squad: ${playerId}`);
    }
  }

  for (const playerId of input.benchReservePlayerIds) {
    if (!squadPlayers.has(playerId)) {
      throw new SquadDepthError("unknown_bench_reserve_player", `Bench/reserve player is not in squad: ${playerId}`);
    }

    if (starterPlayers.has(playerId)) {
      throw new SquadDepthError("starter_bench_reserve_overlap", `Player cannot be both starter and bench/reserve: ${playerId}`);
    }
  }

  return {
    clubId: input.clubId,
    squadPlayerIds: [...input.squadPlayerIds],
    starterPlayerIds: [...input.starterPlayerIds],
    benchReservePlayerIds: [...input.benchReservePlayerIds],
  };
}

/**
 * Validates squad depth for a match lineup and returns the normalized snapshot.
 *
 * Match simulation requires exactly eleven explicitly selected starters. This
 * helper keeps that rule separate from generic squad inspection so future
 * screens can still validate draft squads without forcing a complete XI.
 */
export function validateMatchSquadDepth(input: SquadDepth): SquadDepth {
  const squadDepth = createSquadDepth(input);

  if (squadDepth.starterPlayerIds.length !== MATCH_STARTER_COUNT) {
    throw new SquadDepthError(
      "invalid_starter_count",
      `Match squad depth must include exactly ${MATCH_STARTER_COUNT} starters: ${squadDepth.starterPlayerIds.length}`,
    );
  }

  return squadDepth;
}

function assertNoDuplicatePlayers(playerIds: readonly PlayerId[], code: SquadDepthErrorCode, message: string): void {
  const seenPlayerIds = new Set<PlayerId>();

  for (const playerId of playerIds) {
    if (seenPlayerIds.has(playerId)) {
      throw new SquadDepthError(code, `${message}: ${playerId}`);
    }

    seenPlayerIds.add(playerId);
  }
}
