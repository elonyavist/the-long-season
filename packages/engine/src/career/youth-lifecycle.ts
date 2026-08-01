import {
  createCareerState,
  type CareerState,
  type ClubId,
  type GameDate,
  type PlayerId,
  type SeasonId,
  type YouthAcademyClubRoster,
  type YouthAcademyState,
  type YouthPlayerLifecycle,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { completedPlayerAge } from "../player-state/completed-player-age.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import {
  derivePublicPlayerAssessment,
  type PublicPlayerAssessment,
} from "../squad/public-player-assessment.ts";

/**
 * Public-P50 equivalent of the legacy `4.5` stored-ceiling-room age-out gate.
 *
 * At age 20 the versioned 21.12–24.27% realization bands map that old room to
 * roughly `0.95..1.09` expected ability. This stricter `1.0` lifecycle gate
 * intentionally runs before the later `0.8` senior-promotion usefulness gate.
 */
const YOUTH_AGE_OUT_EXPECTED_ROOM_THRESHOLD = 1;

/** Youth lifecycle outcome emitted when a player leaves the active academy. */
export type YouthLifecycleOutcome = "promotion_candidate" | "external_move_candidate" | "released";

/** Input for applying one end-of-season youth academy lifecycle pass. */
export interface YouthAcademyLifecycleInput {
  /** Durable career state before youth lifecycle processing. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive lifecycle decisions. */
  readonly worldSeed: string;
  /** Season ID being processed. */
  readonly seasonId: SeasonId;
  /** Incoming-season date used for age-out decisions and lifecycle facts. */
  readonly lifecycleDate: GameDate;
  /** Canonical public-assessment policy used by every age-out decision. */
  readonly valuationConfig: PlayerValuationConfig;
}

/** Factual youth lifecycle record for reports. */
export interface YouthLifecycleRecord {
  /** Club whose academy held the player before this lifecycle decision. */
  readonly clubId: ClubId;
  /** Player affected by this lifecycle decision. */
  readonly playerId: PlayerId;
  /** Age in completed civil years on the incoming-season lifecycle date. */
  readonly age: number;
  /** Outcome applied at this lifecycle pass. */
  readonly outcome: YouthLifecycleOutcome;
}

/** Result of one youth academy lifecycle pass. */
export interface YouthAcademyLifecycleResult {
  /** Copied career state after age-out decisions. */
  readonly careerState: CareerState;
  /** Factual records for youth players removed from active academy rosters. */
  readonly records: readonly YouthLifecycleRecord[];
}

/**
 * Resolves academy age-out decisions after canonical development has run.
 *
 * Quarterly and season-end player development belongs exclusively to the
 * career checkpoint owner. This lifecycle only changes academy membership and
 * lifecycle facts, preventing youth players from receiving a second pass.
 * Senior rosters are not changed. Every age-out player leaves the active
 * academy roster, while their player and dynamic-state facts remain in the
 * world for a later explicit ownership transition.
 */
export function applyYouthAcademyLifecycle(input: YouthAcademyLifecycleInput): YouthAcademyLifecycleResult {
  const youthState = input.careerState.youthAcademyState;
  if (youthState === undefined) {
    return {
      careerState: input.careerState,
      records: [],
    };
  }

  const clubRosters: Record<ClubId, YouthAcademyClubRoster> = {};
  const clubRosterIds: ClubId[] = [];
  const playerLifecycle: Record<PlayerId, YouthPlayerLifecycle> = {};
  const playerLifecycleIds: PlayerId[] = [];
  const records: YouthLifecycleRecord[] = [];

  for (const clubId of input.careerState.gameState.clubIds) {
    const roster = youthState.clubRosters[clubId];
    const nextRosterPlayerIds: PlayerId[] = [];

    for (const playerId of roster?.playerIds ?? []) {
      const player = input.careerState.gameState.players[playerId];
      if (player === undefined) {
        continue;
      }

      const age = completedPlayerAge(player.birthDate, input.lifecycleDate);
      if (age <= 19) {
        nextRosterPlayerIds.push(playerId);
        playerLifecycle[playerId] = {
          ...requiredLifecycle(youthState, playerId),
          status: "academy",
        };
        playerLifecycleIds.push(playerId);
        continue;
      }

      const publicAssessment = derivePublicPlayerAssessment({
        player,
        currentDate: input.lifecycleDate,
        potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
        ratingScale: input.valuationConfig.ratingScale,
      });
      const outcome = ageOutOutcome({
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        publicAssessment,
      });
      records.push({
        clubId,
        playerId,
        age,
        outcome,
      });

      playerLifecycle[playerId] = {
        ...requiredLifecycle(youthState, playerId),
        status: outcome,
        statusChangedAt: input.lifecycleDate,
      };
      playerLifecycleIds.push(playerId);
    }

    clubRosters[clubId] = {
      clubId,
      playerIds: nextRosterPlayerIds,
    };
    clubRosterIds.push(clubId);
  }

  preserveNonRosterLifecycleRows({
    youthState,
    currentCareerState: input.careerState,
    playerLifecycle,
    playerLifecycleIds,
  });

  const nextYouthState: YouthAcademyState = {
    clubRosters,
    clubRosterIds,
    playerLifecycle,
    playerLifecycleIds,
  };

  return {
    careerState: createCareerState({
      ...input.careerState,
      youthAcademyState: nextYouthState,
    }),
    records,
  };
}

function preserveNonRosterLifecycleRows(input: {
  readonly youthState: YouthAcademyState;
  readonly currentCareerState: CareerState;
  readonly playerLifecycle: Record<PlayerId, YouthPlayerLifecycle>;
  readonly playerLifecycleIds: PlayerId[];
}): void {
  const seen = new Set<PlayerId>(input.playerLifecycleIds);

  for (const playerId of input.youthState.playerLifecycleIds) {
    if (seen.has(playerId)) {
      continue;
    }

    const lifecycle = input.youthState.playerLifecycle[playerId];
    if (lifecycle === undefined || lifecycle.status === "academy" || input.currentCareerState.gameState.players[playerId] === undefined) {
      continue;
    }

    input.playerLifecycle[playerId] = { ...lifecycle };
    input.playerLifecycleIds.push(playerId);
    seen.add(playerId);
  }
}

function requiredLifecycle(youthState: YouthAcademyState, playerId: PlayerId): YouthPlayerLifecycle {
  const lifecycle = youthState.playerLifecycle[playerId];
  if (lifecycle === undefined) {
    throw new Error(`Missing youth lifecycle row: ${playerId}`);
  }

  return lifecycle;
}

function ageOutOutcome(input: {
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly publicAssessment: PublicPlayerAssessment;
}): YouthLifecycleOutcome {
  const rng = deriveRng(
    input.worldSeed,
    "youth-age-out",
    input.seasonId,
    input.publicAssessment.playerId,
  );
  const currentAbility = input.publicAssessment.currentAbility;
  const expectedRoom = input.publicAssessment.p50Ability - currentAbility;

  if (
    currentAbility >= 8.8
    || expectedRoom >= YOUTH_AGE_OUT_EXPECTED_ROOM_THRESHOLD
  ) {
    return "promotion_candidate";
  }

  if (currentAbility >= 7.4 && rng.nextFloat() < 0.35) {
    return "external_move_candidate";
  }

  return "released";
}
