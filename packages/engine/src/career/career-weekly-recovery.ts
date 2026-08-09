import {
  type GameDate,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerStateCurvesConfig,
} from "@game/domain";

import { DEFAULT_FITNESS_RULES, FitnessStateError, recoverFitnessForPlayers, type FitnessRules } from "../player-state/fitness.ts";

/** One player-level recovery change before a career fixture. */
export interface CareerWeeklyRecoveryChange {
  /** Player whose fitness was reviewed for recovery. */
  readonly playerId: PlayerId;
  /** Fitness before recovery was applied. */
  readonly beforeFitness: number;
  /** Fitness after recovery was applied. */
  readonly afterFitness: number;
  /** Signed fitness delta, normally positive when recovery happened. */
  readonly delta: number;
  /** Whether this player gained any fitness from the recovery pass. */
  readonly recovered: boolean;
}

/** Input for applying deterministic day-based recovery before a career fixture. */
export interface ApplyCareerWeeklyRecoveryInput {
  /** Current player-state lookup. This object is never mutated. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Explicit ordered player IDs that should be considered for recovery. */
  readonly playerIds: readonly PlayerId[];
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly currentDate: GameDate;
  readonly recoveryPolicy: PlayerStateCurvesConfig;
  /** Calendar-day gap before the fixture. Non-positive values are a no-op. */
  readonly dayCount: number;
  /** Fitness rules to apply; defaults match the existing fitness prototype. */
  readonly rules?: FitnessRules;
}

/** Result of applying deterministic day-based recovery before a career fixture. */
export interface ApplyCareerWeeklyRecoveryResult {
  /** Copy-on-write player-state lookup after recovery. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Non-negative day count actually used by the recovery pass. */
  readonly dayCount: number;
  /** Ordered, structured player-level recovery changes for presentation. */
  readonly changes: readonly CareerWeeklyRecoveryChange[];
}

/**
 * Applies deterministic day-based fitness recovery before a career fixture.
 *
 * This helper intentionally does not advance fixtures, spend match fitness,
 * choose players, render text, or infer advice. It wraps the lower-level
 * fitness recovery helper so career progression can also expose a structured
 * recovery summary to the CLI or a future UI.
 */
export function applyCareerWeeklyRecovery(input: ApplyCareerWeeklyRecoveryInput): ApplyCareerWeeklyRecoveryResult {
  const dayCount = input.dayCount <= 0 ? 0 : input.dayCount;
  assertRecoverablePlayerIds(input.playerStates, input.playerIds);
  const playerStates =
    dayCount === 0
      ? { ...input.playerStates }
      : recoverFitnessForPlayers({
          playerStates: input.playerStates,
          playerIds: input.playerIds,
          players: input.players,
          currentDate: input.currentDate,
          recoveryPolicy: input.recoveryPolicy,
          dayCount,
          rules: input.rules ?? DEFAULT_FITNESS_RULES,
        });

  return {
    playerStates,
    dayCount,
    changes: input.playerIds.map((playerId) => {
      const beforeState = input.playerStates[playerId];
      const afterState = playerStates[playerId];

      if (beforeState === undefined || afterState === undefined) {
        throw new FitnessStateError("missing_player_state", `Missing player state for career recovery summary: ${playerId}`);
      }

      const beforeFitness = Number(beforeState.fitness);
      const afterFitness = Number(afterState.fitness);

      return {
        playerId,
        beforeFitness,
        afterFitness,
        delta: afterFitness - beforeFitness,
        recovered: afterFitness > beforeFitness,
      };
    }),
  };
}

/**
 * Validates the ordered recovery ID list before the lower-level helper runs.
 *
 * This keeps zero-day recovery useful as a reporting no-op while still catching
 * bad caller input such as duplicate IDs or missing player states.
 */
function assertRecoverablePlayerIds(
  playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>,
  playerIds: readonly PlayerId[],
): void {
  const seen = new Set<PlayerId>();

  for (const playerId of playerIds) {
    if (seen.has(playerId)) {
      throw new FitnessStateError("duplicate_player_id", `Duplicate player ID in career recovery: ${playerId}`);
    }

    if (playerStates[playerId] === undefined) {
      throw new FitnessStateError("missing_player_state", `Missing player state for career recovery: ${playerId}`);
    }

    seen.add(playerId);
  }
}
