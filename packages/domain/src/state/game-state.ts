import type { Club } from "../entities/club.entity.ts";
import type { Player, PlayerDynamicState } from "../entities/player.entity.ts";
import type { ClubId, PlayerId, SeasonId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";

/**
 * Version and seed metadata attached to a single run save.
 *
 * Engine code uses the seed and algorithm version to derive deterministic
 * sub-streams. Schema version exists from the beginning so migrations can be
 * introduced without changing the storage contract later.
 */
export interface GameMeta {
  /** Human-provided or generated run seed. */
  readonly seed: string;
  /** Frozen RNG algorithm version for this save/run. */
  readonly rngAlgorithmVersion: string;
  /** Current save snapshot schema version. */
  readonly saveSchemaVersion: number;
}

/**
 * Global game calendar.
 *
 * The world clock is a date, not a round number. Competition rounds are sporting
 * metadata on fixtures and seasons, not the authoritative clock.
 */
export interface GameCalendar {
  /** Current in-world day represented as epoch-day. */
  readonly currentDate: GameDate;
  /** Current season ID for the active simulation context. */
  readonly currentSeasonId: SeasonId;
}

/**
 * Authoritative in-memory state for one run.
 *
 * Lookup records provide O(1) access. Ordered ID arrays provide deterministic
 * traversal. Simulation code must use the arrays when order matters.
 */
export interface GameState {
  /** Seed, algorithm, and schema metadata for this run. */
  readonly meta: GameMeta;
  /** Date-first world clock. */
  readonly calendar: GameCalendar;
  /** Player lookup table by ID. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Deterministic player traversal order. */
  readonly playerIds: readonly PlayerId[];
  /** Frequently changing player state separated from stable player data. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Club lookup table by ID. */
  readonly clubs: Readonly<Record<ClubId, Club>>;
  /** Deterministic club traversal order. */
  readonly clubIds: readonly ClubId[];
}
