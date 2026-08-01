import {
  createCareerState,
  type CareerState,
  type ClubId,
  type GameDate,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type RoleIdentifiedPlayer,
  type SeasonId,
  type YouthAcademyClubRoster,
  type YouthAcademyState,
  type YouthPlayerLifecycle,
} from "@game/domain";

/** Phase 33 exact active academy size per club after refill. */
export const YOUTH_ACADEMY_TARGET_MAX_SIZE = 11;

/** One generated youth player prepared for annual intake application. */
export interface YouthIntakeCandidate {
  /** Club receiving this intake candidate. */
  readonly targetClubId: ClubId;
  /** Generated youth player entity. */
  readonly player: RoleIdentifiedPlayer;
  /** Initial dynamic state for the generated youth player. */
  readonly playerState: PlayerDynamicState;
}

/** Input for applying one deterministic annual youth intake pass. */
export interface ApplySeasonalYouthIntakeInput {
  /** Durable career state before intake is applied. */
  readonly careerState: CareerState;
  /** Season that owns this youth intake pass. */
  readonly seasonId: SeasonId;
  /** In-world date when the youth players enter the academy. */
  readonly intakeDate: GameDate;
  /** Generated candidates in deterministic order. */
  readonly candidates: readonly YouthIntakeCandidate[];
  /** Optional academy max size. Defaults to Phase 33 exact target `11`. */
  readonly maxYouthRosterSize?: number;
}

/** Factual per-club intake record for later long-run reports. */
export interface YouthIntakeRecord {
  /** Club inspected by this intake pass. */
  readonly clubId: ClubId;
  /** Active youth size before intake. */
  readonly beforeYouthSize: number;
  /** Active youth size after accepted intake. */
  readonly afterYouthSize: number;
  /** Generated candidate IDs for this club. */
  readonly generatedPlayerIds: readonly PlayerId[];
  /** Candidate IDs actually attached to the active youth academy. */
  readonly acceptedPlayerIds: readonly PlayerId[];
  /** Candidate IDs skipped because the active academy had no capacity. */
  readonly skippedPlayerIds: readonly PlayerId[];
}

/** Result of applying annual youth intake. */
export interface ApplySeasonalYouthIntakeResult {
  /** Copied career state with accepted youth players attached. */
  readonly careerState: CareerState;
  /** Per-club factual intake records in deterministic club order. */
  readonly records: readonly YouthIntakeRecord[];
}

/** Machine-readable youth intake application failure. */
export type YouthIntakeErrorCode =
  | "candidate_target_club_not_found"
  | "duplicate_candidate_player"
  | "candidate_player_already_exists"
  | "academy_underfilled_after_refill";

/** Error thrown when an annual youth intake candidate pool is unsafe. */
export class YouthIntakeError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: YouthIntakeErrorCode;

  /** Creates a youth intake validation error. */
  public constructor(code: YouthIntakeErrorCode, message: string) {
    super(message);
    this.name = "YouthIntakeError";
    this.code = code;
  }
}

/**
 * Applies generated annual youth intake candidates to active academies.
 *
 * The function caps active youth roster size and never adds intake players to
 * senior `Club.playerIds`. It is deterministic for ordered candidates.
 */
export function applySeasonalYouthIntake(input: ApplySeasonalYouthIntakeInput): ApplySeasonalYouthIntakeResult {
  const maxYouthRosterSize = input.maxYouthRosterSize ?? YOUTH_ACADEMY_TARGET_MAX_SIZE;
  validateCandidatePool(input.careerState, input.candidates);

  const existingYouthState = input.careerState.youthAcademyState;
  const players: Partial<Record<PlayerId, Player>> = { ...input.careerState.gameState.players };
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = { ...input.careerState.gameState.playerStates };
  const playerIds = [...input.careerState.gameState.playerIds];
  const clubRosters: Record<ClubId, YouthAcademyClubRoster> = {};
  const clubRosterIds: ClubId[] = [];
  const playerLifecycle: Record<PlayerId, YouthPlayerLifecycle> = { ...(existingYouthState?.playerLifecycle ?? {}) };
  const playerLifecycleIds = [...(existingYouthState?.playerLifecycleIds ?? [])];
  const records: YouthIntakeRecord[] = [];

  for (const clubId of input.careerState.gameState.clubIds) {
    const existingRoster = existingYouthState?.clubRosters[clubId];
    const nextRosterPlayerIds = [...(existingRoster?.playerIds ?? [])];
    const candidates = candidatesForClub(input.candidates, clubId);
    const generatedPlayerIds = candidates.map((candidate) => candidate.player.id);
    const acceptedPlayerIds: PlayerId[] = [];
    const skippedPlayerIds: PlayerId[] = [];
    const beforeYouthSize = nextRosterPlayerIds.length;

    for (const candidate of candidates) {
      if (nextRosterPlayerIds.length >= maxYouthRosterSize) {
        skippedPlayerIds.push(candidate.player.id);
        continue;
      }

      players[candidate.player.id] = candidate.player;
      playerStates[candidate.player.id] = candidate.playerState;
      playerIds.push(candidate.player.id);
      nextRosterPlayerIds.push(candidate.player.id);
      playerLifecycle[candidate.player.id] = {
        playerId: candidate.player.id,
        clubId,
        status: "academy",
        academyEntrySeasonId: input.seasonId,
        academyEntryDate: input.intakeDate,
      };
      playerLifecycleIds.push(candidate.player.id);
      acceptedPlayerIds.push(candidate.player.id);
    }

    if (nextRosterPlayerIds.length < maxYouthRosterSize) {
      throw new YouthIntakeError(
        "academy_underfilled_after_refill",
        `youth academy underfilled after refill for ${clubId}: ${nextRosterPlayerIds.length}/${maxYouthRosterSize}`,
      );
    }

    clubRosters[clubId] = {
      clubId,
      playerIds: nextRosterPlayerIds,
    };
    clubRosterIds.push(clubId);
    records.push({
      clubId,
      beforeYouthSize,
      afterYouthSize: nextRosterPlayerIds.length,
      generatedPlayerIds,
      acceptedPlayerIds,
      skippedPlayerIds,
    });
  }

  const youthAcademyState: YouthAcademyState = {
    clubRosters,
    clubRosterIds,
    playerLifecycle,
    playerLifecycleIds,
  };

  return {
    careerState: createCareerState({
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        players: players as CareerState["gameState"]["players"],
        playerIds,
        playerStates: playerStates as CareerState["gameState"]["playerStates"],
      },
      youthAcademyState,
    }),
    records,
  };
}

function validateCandidatePool(careerState: CareerState, candidates: readonly YouthIntakeCandidate[]): void {
  const seenCandidateIds = new Set<PlayerId>();

  for (const candidate of candidates) {
    if (careerState.gameState.clubs[candidate.targetClubId] === undefined) {
      throw new YouthIntakeError("candidate_target_club_not_found", `youth intake target club does not exist: ${candidate.targetClubId}`);
    }

    if (seenCandidateIds.has(candidate.player.id)) {
      throw new YouthIntakeError("duplicate_candidate_player", `duplicate youth intake player: ${candidate.player.id}`);
    }

    if (careerState.gameState.players[candidate.player.id] !== undefined) {
      throw new YouthIntakeError(
        "candidate_player_already_exists",
        `youth intake player already exists in career history: ${candidate.player.id}`,
      );
    }

    seenCandidateIds.add(candidate.player.id);
  }
}

function candidatesForClub(candidates: readonly YouthIntakeCandidate[], clubId: ClubId): readonly YouthIntakeCandidate[] {
  const result: YouthIntakeCandidate[] = [];

  for (const candidate of candidates) {
    if (candidate.targetClubId === clubId) {
      result.push(candidate);
    }
  }

  return result;
}
