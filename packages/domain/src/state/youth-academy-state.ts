import type { ClubId, PlayerId, SeasonId } from "../types/ids.ts";
import { brand, type Brand } from "../types/brand.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { GameState } from "./game-state.ts";

/** Validated academy-development level on the explicit `1..5` scale. */
export type YouthDevelopmentLevel = Brand<number, "YouthDevelopmentLevel">;

/**
 * Builds a validated youth-development level.
 *
 * The value is a factual academy quality signal. Content decides how to derive
 * it from division and club reputation; domain only protects the `1..5` shape.
 */
export function youthDevelopmentLevel(value: number): YouthDevelopmentLevel {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`YouthDevelopmentLevel must be a safe integer: ${value}`);
  }

  if (value < 1 || value > 5) {
    throw new Error(`YouthDevelopmentLevel must be between 1 and 5: ${value}`);
  }

  return brand<number, "YouthDevelopmentLevel">(value);
}

/** Active youth states that still occupy a club academy slot. */
const ACTIVE_YOUTH_STATUSES: readonly YouthPlayerStatus[] = [
  "academy",
];

/**
 * Durable lifecycle marker for a youth-academy player.
 *
 * The status is factual state, not presentation text. UI/CLI layers decide how
 * to label it through localization.
 */
export type YouthPlayerStatus =
  | "academy"
  | "promotion_candidate"
  | "external_move_candidate"
  | "promoted"
  | "released"
  | "aged_out";

/**
 * Ordered active youth roster for one club.
 *
 * `playerIds` contains only active academy players. Promoted, released, or
 * aged-out players can remain in lifecycle history but must not stay in this
 * active list.
 */
export interface YouthAcademyClubRoster {
  /** Club owning this youth academy roster. */
  readonly clubId: ClubId;
  /** Deterministic active youth-player order for this club. */
  readonly playerIds: readonly PlayerId[];
}

/**
 * Durable youth lifecycle facts for one player.
 */
export interface YouthPlayerLifecycle {
  /** Player tracked by this lifecycle row. */
  readonly playerId: PlayerId;
  /** Club academy that introduced or currently owns the youth player. */
  readonly clubId: ClubId;
  /** Current factual lifecycle status. */
  readonly status: YouthPlayerStatus;
  /** Season when the player entered the academy pipeline. */
  readonly academyEntrySeasonId: SeasonId;
  /** In-world date when the player entered the academy pipeline. */
  readonly academyEntryDate: GameDate;
  /** Optional factual date for the latest lifecycle status change. */
  readonly statusChangedAt?: GameDate;
}

/**
 * Durable youth-academy slice attached to a career save.
 *
 * Club rosters give active academy membership. Lifecycle rows give factual
 * status metadata and allow later steps to report promotions/releases without
 * mixing youth players into senior `Club.playerIds`.
 */
export interface YouthAcademyState {
  /** Youth roster lookup by club ID. */
  readonly clubRosters: Readonly<Record<ClubId, YouthAcademyClubRoster>>;
  /** Explicit deterministic order for youth roster traversal. */
  readonly clubRosterIds: readonly ClubId[];
  /** Youth lifecycle lookup by player ID. */
  readonly playerLifecycle: Readonly<Record<PlayerId, YouthPlayerLifecycle>>;
  /** Explicit deterministic order for youth lifecycle traversal. */
  readonly playerLifecycleIds: readonly PlayerId[];
}

/** Machine-readable youth-academy validation failure. */
export type YouthAcademyStateErrorCode =
  | "club_roster_not_found"
  | "club_roster_club_mismatch"
  | "club_not_found"
  | "duplicate_club_roster"
  | "player_not_found"
  | "duplicate_youth_player"
  | "youth_player_already_senior"
  | "lifecycle_not_found"
  | "lifecycle_player_mismatch"
  | "lifecycle_club_not_found"
  | "lifecycle_active_player_missing_from_roster"
  | "lifecycle_inactive_player_still_rostered"
  | "lifecycle_club_mismatch"
  | "duplicate_lifecycle";

/**
 * Typed error thrown when a youth-academy snapshot is inconsistent.
 */
export class YouthAcademyStateError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: YouthAcademyStateErrorCode;

  /** Creates a youth-academy validation error. */
  public constructor(code: YouthAcademyStateErrorCode, message: string) {
    super(message);
    this.name = "YouthAcademyStateError";
    this.code = code;
  }
}

/**
 * Builds a validated youth-academy snapshot.
 *
 * The validator keeps active academy membership separate from senior roster
 * ownership and preserves every explicit order array supplied by the caller.
 */
export function createYouthAcademyState(gameState: GameState, input: YouthAcademyState): YouthAcademyState {
  const seniorPlayerIds = seniorPlayerIdSet(gameState);
  const activeYouthPlayerIds = new Set<PlayerId>();
  const activeYouthRosterClubIds = new Map<PlayerId, ClubId>();
  const clubRosterIds: ClubId[] = [];
  const clubRosters: Record<ClubId, YouthAcademyClubRoster> = {};
  const seenClubRosterIds = new Set<ClubId>();

  for (const clubId of input.clubRosterIds) {
    if (seenClubRosterIds.has(clubId)) {
      throw new YouthAcademyStateError("duplicate_club_roster", `duplicate youth academy club roster: ${clubId}`);
    }

    const roster = input.clubRosters[clubId];
    if (roster === undefined) {
      throw new YouthAcademyStateError("club_roster_not_found", `youth academy roster is missing for club: ${clubId}`);
    }

    if (roster.clubId !== clubId) {
      throw new YouthAcademyStateError("club_roster_club_mismatch", `youth academy roster club mismatch: ${clubId}`);
    }

    if (gameState.clubs[clubId] === undefined) {
      throw new YouthAcademyStateError("club_not_found", `youth academy club does not exist: ${clubId}`);
    }

    seenClubRosterIds.add(clubId);
    clubRosterIds.push(clubId);
    clubRosters[clubId] = {
      clubId: roster.clubId,
      playerIds: validateRosterPlayers(gameState, seniorPlayerIds, activeYouthPlayerIds, activeYouthRosterClubIds, roster),
    };
  }

  const playerLifecycleIds: PlayerId[] = [];
  const playerLifecycle: Record<PlayerId, YouthPlayerLifecycle> = {};
  const seenLifecycleIds = new Set<PlayerId>();

  for (const playerId of input.playerLifecycleIds) {
    if (seenLifecycleIds.has(playerId)) {
      throw new YouthAcademyStateError("duplicate_lifecycle", `duplicate youth lifecycle row: ${playerId}`);
    }

    const lifecycle = input.playerLifecycle[playerId];
    if (lifecycle === undefined) {
      throw new YouthAcademyStateError("lifecycle_not_found", `youth lifecycle row is missing for player: ${playerId}`);
    }

    if (lifecycle.playerId !== playerId) {
      throw new YouthAcademyStateError("lifecycle_player_mismatch", `youth lifecycle player mismatch: ${playerId}`);
    }

    if (gameState.players[playerId] === undefined) {
      throw new YouthAcademyStateError("player_not_found", `youth lifecycle player does not exist: ${playerId}`);
    }

    if (gameState.clubs[lifecycle.clubId] === undefined) {
      throw new YouthAcademyStateError("lifecycle_club_not_found", `youth lifecycle club does not exist: ${lifecycle.clubId}`);
    }

    validateLifecycleRosterConsistency(activeYouthRosterClubIds, lifecycle);
    seenLifecycleIds.add(playerId);
    playerLifecycleIds.push(playerId);
    playerLifecycle[playerId] = { ...lifecycle };
  }

  for (const playerId of activeYouthPlayerIds) {
    if (playerLifecycle[playerId] === undefined) {
      throw new YouthAcademyStateError("lifecycle_not_found", `active youth player has no lifecycle row: ${playerId}`);
    }
  }

  return {
    clubRosters,
    clubRosterIds,
    playerLifecycle,
    playerLifecycleIds,
  };
}

function validateRosterPlayers(
  gameState: GameState,
  seniorPlayerIds: ReadonlySet<PlayerId>,
  activeYouthPlayerIds: Set<PlayerId>,
  activeYouthRosterClubIds: Map<PlayerId, ClubId>,
  roster: YouthAcademyClubRoster,
): PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (const playerId of roster.playerIds) {
    if (gameState.players[playerId] === undefined) {
      throw new YouthAcademyStateError("player_not_found", `youth academy player does not exist: ${playerId}`);
    }

    if (seniorPlayerIds.has(playerId)) {
      throw new YouthAcademyStateError("youth_player_already_senior", `youth academy player is already in a senior roster: ${playerId}`);
    }

    if (activeYouthPlayerIds.has(playerId)) {
      throw new YouthAcademyStateError("duplicate_youth_player", `duplicate active youth academy player: ${playerId}`);
    }

    activeYouthPlayerIds.add(playerId);
    activeYouthRosterClubIds.set(playerId, roster.clubId);
    playerIds.push(playerId);
  }

  return playerIds;
}

function validateLifecycleRosterConsistency(
  activeYouthRosterClubIds: ReadonlyMap<PlayerId, ClubId>,
  lifecycle: YouthPlayerLifecycle,
): void {
  const rosterClubId = activeYouthRosterClubIds.get(lifecycle.playerId);
  const activeStatus = isActiveYouthStatus(lifecycle.status);

  if (activeStatus && rosterClubId === undefined) {
    throw new YouthAcademyStateError(
      "lifecycle_active_player_missing_from_roster",
      `active youth lifecycle player is not in a youth roster: ${lifecycle.playerId}`,
    );
  }

  if (!activeStatus && rosterClubId !== undefined) {
    throw new YouthAcademyStateError(
      "lifecycle_inactive_player_still_rostered",
      `inactive youth lifecycle player is still in a youth roster: ${lifecycle.playerId}`,
    );
  }

  if (rosterClubId !== undefined && rosterClubId !== lifecycle.clubId) {
    throw new YouthAcademyStateError("lifecycle_club_mismatch", `youth lifecycle club does not match roster: ${lifecycle.playerId}`);
  }
}

function isActiveYouthStatus(status: YouthPlayerStatus): boolean {
  for (const activeStatus of ACTIVE_YOUTH_STATUSES) {
    if (activeStatus === status) {
      return true;
    }
  }

  return false;
}

function seniorPlayerIdSet(gameState: GameState): ReadonlySet<PlayerId> {
  const seniorPlayerIds = new Set<PlayerId>();

  for (const clubId of gameState.clubIds) {
    const club = gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    for (const playerId of club.playerIds) {
      seniorPlayerIds.add(playerId);
    }
  }

  return seniorPlayerIds;
}
