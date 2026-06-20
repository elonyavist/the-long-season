import { stateValue, type PlayerDynamicState, type PlayerId } from "@game/domain";

/** Default deterministic fitness rules for the first fatigue prototype. */
export const DEFAULT_FITNESS_RULES: FitnessRules = {
  matchFitnessCost: 8,
  dailyRecovery: 5,
  minFitness: 0,
  maxFitness: 100,
};

/**
 * Tunable deterministic rules for player fitness spend and recovery.
 *
 * Values use the existing domain `StateValue` scale, where `100` means fully
 * fit and `0` means completely exhausted.
 */
export interface FitnessRules {
  /** Fitness points spent by a player who appears in one full match. */
  readonly matchFitnessCost: number;
  /** Fitness points recovered for each calendar day of rest. */
  readonly dailyRecovery: number;
  /** Lower clamp for fitness values, normally `0`. */
  readonly minFitness: number;
  /** Upper clamp for fitness values, normally `100`. */
  readonly maxFitness: number;
}

/**
 * Input for spending fitness on explicitly ordered players.
 */
export interface SpendFitnessInput {
  /** Current player-state lookup. The helper never mutates this object. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Explicit ordered player IDs that spent fitness. */
  readonly playerIds: readonly PlayerId[];
  /** Fitness rules to apply. */
  readonly rules?: FitnessRules;
}

/**
 * Input for recovering fitness on explicitly ordered players.
 */
export interface RecoverFitnessInput {
  /** Current player-state lookup. The helper never mutates this object. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Explicit ordered player IDs that recover fitness. */
  readonly playerIds: readonly PlayerId[];
  /** Positive number of calendar days to recover. */
  readonly dayCount: number;
  /** Fitness rules to apply. */
  readonly rules?: FitnessRules;
}

/** Error categories exposed by deterministic fitness helpers. */
export type FitnessStateErrorCode =
  | "duplicate_player_id"
  | "invalid_day_count"
  | "invalid_rules"
  | "missing_player_state";

/**
 * Typed error thrown when player fitness cannot be updated from the provided input.
 */
export class FitnessStateError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: FitnessStateErrorCode;

  /**
   * Creates a fitness-state error.
   */
  public constructor(code: FitnessStateErrorCode, message: string) {
    super(message);
    this.name = "FitnessStateError";
    this.code = code;
  }
}

/**
 * Spends one match of fitness for each explicitly ordered player.
 *
 * @example
 * const nextStates = spendFitnessForPlayers({ playerStates, playerIds: lineupIds });
 */
export function spendFitnessForPlayers(input: SpendFitnessInput): Readonly<Record<PlayerId, PlayerDynamicState>> {
  const rules = validateFitnessRules(input.rules ?? DEFAULT_FITNESS_RULES);
  const nextStates: Record<PlayerId, PlayerDynamicState> = { ...input.playerStates };
  const seen = new Set<PlayerId>();

  for (const playerId of input.playerIds) {
    assertUniquePlayerId(playerId, seen);
    const playerState = input.playerStates[playerId];

    if (playerState === undefined) {
      throw new FitnessStateError("missing_player_state", `Missing player state for fitness spend: ${playerId}`);
    }

    nextStates[playerId] = {
      ...playerState,
      fitness: stateValue(clamp(Number(playerState.fitness) - rules.matchFitnessCost, rules)),
    };
  }

  return nextStates;
}

/**
 * Recovers fitness for each explicitly ordered player over calendar days.
 *
 * @example
 * const nextStates = recoverFitnessForPlayers({ playerStates, playerIds, dayCount: 3 });
 */
export function recoverFitnessForPlayers(input: RecoverFitnessInput): Readonly<Record<PlayerId, PlayerDynamicState>> {
  const rules = validateFitnessRules(input.rules ?? DEFAULT_FITNESS_RULES);
  const nextStates: Record<PlayerId, PlayerDynamicState> = { ...input.playerStates };
  const seen = new Set<PlayerId>();

  if (!Number.isInteger(input.dayCount) || input.dayCount <= 0) {
    throw new FitnessStateError("invalid_day_count", `Recovery day count must be a positive integer: ${input.dayCount}`);
  }

  for (const playerId of input.playerIds) {
    assertUniquePlayerId(playerId, seen);
    const playerState = input.playerStates[playerId];

    if (playerState === undefined) {
      throw new FitnessStateError("missing_player_state", `Missing player state for fitness recovery: ${playerId}`);
    }

    nextStates[playerId] = {
      ...playerState,
      fitness: stateValue(clamp(Number(playerState.fitness) + rules.dailyRecovery * input.dayCount, rules)),
    };
  }

  return nextStates;
}

/**
 * Validates and returns a fitness rule set.
 */
function validateFitnessRules(rules: FitnessRules): FitnessRules {
  const entries = [
    ["matchFitnessCost", rules.matchFitnessCost],
    ["dailyRecovery", rules.dailyRecovery],
    ["minFitness", rules.minFitness],
    ["maxFitness", rules.maxFitness],
  ] as const;

  for (const [key, value] of entries) {
    if (!Number.isFinite(value)) {
      throw new FitnessStateError("invalid_rules", `Fitness rule must be finite: ${key}=${value}`);
    }
  }

  if (rules.matchFitnessCost < 0) {
    throw new FitnessStateError("invalid_rules", `Match fitness cost must be non-negative: ${rules.matchFitnessCost}`);
  }

  if (rules.dailyRecovery < 0) {
    throw new FitnessStateError("invalid_rules", `Daily recovery must be non-negative: ${rules.dailyRecovery}`);
  }

  if (rules.minFitness < 0 || rules.maxFitness > 100 || rules.minFitness > rules.maxFitness) {
    throw new FitnessStateError(
      "invalid_rules",
      `Fitness clamps must satisfy 0 <= min <= max <= 100: ${rules.minFitness}..${rules.maxFitness}`,
    );
  }

  return rules;
}

/**
 * Rejects duplicate IDs inside one ordered update list.
 */
function assertUniquePlayerId(playerId: PlayerId, seen: Set<PlayerId>): void {
  if (seen.has(playerId)) {
    throw new FitnessStateError("duplicate_player_id", `Duplicate player ID in fitness update: ${playerId}`);
  }

  seen.add(playerId);
}

/**
 * Clamps one numeric fitness value to the provided rule bounds.
 */
function clamp(value: number, rules: FitnessRules): number {
  return Math.min(rules.maxFitness, Math.max(rules.minFitness, value));
}
