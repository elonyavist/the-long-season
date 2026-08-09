import {
  stateValue,
  type GameDate,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerStateCurvesConfig,
} from "@game/domain";

/** Default deterministic fitness rules for the first fatigue prototype. */
export const DEFAULT_FITNESS_RULES: FitnessRules = {
  matchFitnessCost: 8,
  minFitness: 0,
  maxFitness: 100,
};

/**
 * Tunable deterministic rules for player fitness spend and clamps.
 *
 * Values use the existing domain `StateValue` scale, where `100` means fully
 * fit and `0` means completely exhausted.
 */
export interface FitnessRules {
  /** Fitness points spent by a player who appears in one full match. */
  readonly matchFitnessCost: number;
  /** Lower clamp for fitness values, normally `0`. */
  readonly minFitness: number;
  /** Upper clamp for fitness values, normally `100`. */
  readonly maxFitness: number;
}

/**
 * Input for spending fitness on explicitly ordered players.
 */
export interface PlayerMinuteLoad {
  /** Player whose exact appearance interval creates the load. */
  readonly playerId: PlayerId;
  /** Exact regulation minutes played, including zero-minute bench records. */
  readonly minutes: number;
}

/** Input for spending fitness from exact, explicitly ordered minute facts. */
export interface SpendFitnessForMinutesInput {
  /** Current player-state lookup. The helper never mutates this object. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Explicit ordered player loads derived from canonical participation. */
  readonly loads: readonly PlayerMinuteLoad[];
  /** Player facts used when the versioned age-load policy is active. */
  readonly players?: Readonly<Record<PlayerId, Player>>;
  /** Fixture date used for continuous age-conditioned match load. */
  readonly currentDate?: GameDate;
  /** Versioned policy; supplied together with players and currentDate. */
  readonly loadPolicy?: PlayerStateCurvesConfig;
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
  /** Player facts used for continuous age and physical resilience. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Date at which recovery is evaluated. */
  readonly currentDate: GameDate;
  /** Versioned content policy controlling recovery magnitudes. */
  readonly recoveryPolicy: PlayerStateCurvesConfig;
  /** Positive number of calendar days to recover. */
  readonly dayCount: number;
  /** Fitness rules to apply. */
  readonly rules?: FitnessRules;
}

/** Error categories exposed by deterministic fitness helpers. */
export type FitnessStateErrorCode =
  | "duplicate_player_id"
  | "invalid_day_count"
  | "invalid_minutes"
  | "invalid_rules"
  | "missing_player"
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
 * Spends fitness in direct proportion to exact regulation minutes.
 *
 * @example
 * const nextStates = spendFitnessForMinutes({ playerStates, loads });
 */
export function spendFitnessForMinutes(
  input: SpendFitnessForMinutesInput,
): Readonly<Record<PlayerId, PlayerDynamicState>> {
  const rules = validateFitnessRules(input.rules ?? DEFAULT_FITNESS_RULES);
  const nextStates: Record<PlayerId, PlayerDynamicState> = { ...input.playerStates };
  const seen = new Set<PlayerId>();

  for (const { playerId, minutes } of input.loads) {
    assertUniquePlayerId(playerId, seen);
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 90) {
      throw new FitnessStateError("invalid_minutes", `Fitness minutes must be within 0..90: ${minutes}`);
    }
    const playerState = input.playerStates[playerId];

    if (playerState === undefined) {
      throw new FitnessStateError("missing_player_state", `Missing player state for fitness spend: ${playerId}`);
    }

    const matchFitnessCost = ageConditionedMatchFitnessCost({
      playerId,
      rules,
      players: input.players,
      currentDate: input.currentDate,
      loadPolicy: input.loadPolicy,
    });
    nextStates[playerId] = {
      ...playerState,
      fitness: stateValue(clamp(Number(playerState.fitness) - matchFitnessCost * minutes / 90, rules)),
    };
  }

  return nextStates;
}

/** Returns the continuous full-match fitness cost for one dated player. */
export function matchFitnessCostForPlayer(
  player: Player,
  currentDate: GameDate,
  policy: PlayerStateCurvesConfig,
  rules: FitnessRules = DEFAULT_FITNESS_RULES,
): number {
  const validatedRules = validateFitnessRules(rules);
  const ageYears = Math.max(0, (Number(currentDate) - Number(player.birthDate)) / 365.2425);
  const yearsAboveThreshold = Math.max(0, ageYears - policy.agePenaltyStartsAtYears);
  const multiplierBasisPoints = Math.min(
    policy.maximumAgeMatchLoadMultiplierBasisPoints,
    10_000 + yearsAboveThreshold * policy.ageMatchLoadPerYearBasisPoints,
  );
  return validatedRules.matchFitnessCost * multiplierBasisPoints / 10_000;
}

function ageConditionedMatchFitnessCost(input: {
  readonly playerId: PlayerId;
  readonly rules: FitnessRules;
  readonly players: Readonly<Record<PlayerId, Player>> | undefined;
  readonly currentDate: GameDate | undefined;
  readonly loadPolicy: PlayerStateCurvesConfig | undefined;
}): number {
  const suppliedCount = Number(input.players !== undefined)
    + Number(input.currentDate !== undefined)
    + Number(input.loadPolicy !== undefined);
  if (suppliedCount === 0) return input.rules.matchFitnessCost;
  if (suppliedCount !== 3) {
    throw new FitnessStateError(
      "invalid_rules",
      "Age-conditioned fitness spend requires players, currentDate and loadPolicy together",
    );
  }
  if (input.players === undefined || input.currentDate === undefined || input.loadPolicy === undefined) {
    throw new FitnessStateError("invalid_rules", "Incomplete age-conditioned fitness policy");
  }
  const player = input.players[input.playerId];
  if (player === undefined) {
    throw new FitnessStateError("missing_player", `Missing player for fitness spend: ${input.playerId}`);
  }
  return matchFitnessCostForPlayer(
    player,
    input.currentDate,
    input.loadPolicy,
    input.rules,
  );
}

/**
 * Recovers fitness for each explicitly ordered player over calendar days.
 *
 * @example
 * const nextStates = recoverFitnessForPlayers({
 *   playerStates,
 *   playerIds,
 *   players,
 *   currentDate,
 *   recoveryPolicy,
 *   dayCount: 3,
 * });
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
    const player = input.players[playerId];

    if (playerState === undefined) {
      throw new FitnessStateError("missing_player_state", `Missing player state for fitness recovery: ${playerId}`);
    }
    if (player === undefined) {
      throw new FitnessStateError("missing_player", `Missing player for fitness recovery: ${playerId}`);
    }

    const deficit = rules.maxFitness - Number(playerState.fitness);
    const recoveryFraction = input.dayCount / (
      input.dayCount + recoveryHalfLifeDays(player, input.currentDate, input.recoveryPolicy)
    );
    nextStates[playerId] = {
      ...playerState,
      fitness: stateValue(clamp(Number(playerState.fitness) + deficit * recoveryFraction, rules)),
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

  if (rules.minFitness < 0 || rules.maxFitness > 100 || rules.minFitness > rules.maxFitness) {
    throw new FitnessStateError(
      "invalid_rules",
      `Fitness clamps must satisfy 0 <= min <= max <= 100: ${rules.minFitness}..${rules.maxFitness}`,
    );
  }

  return rules;
}

/** Derives the days required to recover half the current deficit. */
export function recoveryHalfLifeDays(
  player: Player,
  currentDate: GameDate,
  policy: PlayerStateCurvesConfig,
): number {
  const ageYears = Math.max(0, (Number(currentDate) - Number(player.birthDate)) / 365.2425);
  const ageYearsAboveThreshold = Math.max(0, ageYears - policy.agePenaltyStartsAtYears);
  const baseHalfLife = (
    policy.baseRecoveryHalfLifeDaysBasisPoints
    + ageYearsAboveThreshold * policy.ageHalfLifeDaysPerYearBasisPoints
  ) / 10_000;
  const weights = policy.resilienceWeightsBasisPoints;
  const resilience = (
    Number(player.abilities.physical.stamina) * weights.stamina
    + Number(player.abilities.physical.agility) * weights.agility
    + Number(player.abilities.physical.strength) * weights.strength
  ) / (20 * 10_000);
  // Smootherstep preserves the neutral midpoint and both endpoints while
  // making genuinely exceptional/fragile generated physical profiles matter.
  // Its continuous first and second derivatives avoid a hidden trait band.
  const shapedResilience = resilience * resilience * resilience * (
    resilience * (resilience * 6 - 15) + 10
  );
  const multiplier = (
    policy.lowResilienceHalfLifeMultiplierBasisPoints
    + shapedResilience * (
      policy.highResilienceHalfLifeMultiplierBasisPoints
      - policy.lowResilienceHalfLifeMultiplierBasisPoints
    )
  ) / 10_000;
  return baseHalfLife * multiplier;
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
