import { nonNegativeMoney, type Club, type ClubCategory, type GameDate, type Money, type Player, type PlayerPosition } from "@game/domain";

/** Age multiplier for deterministic true-data player valuation. */
export interface PlayerValuationAgeBand {
  /** Inclusive lower age bound. */
  readonly minAge: number;
  /** Inclusive upper age bound. */
  readonly maxAge: number;
  /** Multiplier applied when the player age is inside the band. */
  readonly multiplier: number;
}

/** Tunable input values for the first player valuation model. */
export interface PlayerValuationConfig {
  /** Base minor-unit amount before player and club multipliers. */
  readonly baseValue: Money;
  /** Weight applied to current ability average. */
  readonly currentAbilityWeight: number;
  /** Weight applied to potential average. */
  readonly potentialAbilityWeight: number;
  /** Ordered age bands; the first matching band is used. */
  readonly ageBands: readonly PlayerValuationAgeBand[];
  /** Sporting-tier multiplier by club category. */
  readonly categoryMultipliers: Readonly<Record<ClubCategory, number>>;
  /** Increment applied for each club reputation point. */
  readonly reputationStepMultiplier: number;
  /** Multiplier by the player's primary natural position. */
  readonly positionMultipliers: Readonly<Record<PlayerPosition, number>>;
  /** Lower bound for the returned value. */
  readonly minValue: Money;
  /** Upper bound for the returned value. */
  readonly maxValue: Money;
}

/** Inputs needed to derive one player value. */
export interface DerivePlayerValuationInput {
  /** Player being valued. */
  readonly player: Player;
  /** Club currently owning the player. */
  readonly club: Club;
  /** Current game date used to derive age. */
  readonly currentDate: GameDate;
  /** Explicit valuation tuning. */
  readonly config: PlayerValuationConfig;
}

/** Deterministic output of the true-data player valuation model. */
export interface PlayerValuation {
  /** Final clamped transfer value. */
  readonly value: Money;
  /** Player age in whole years at the current date. */
  readonly age: number;
  /** Current ability average on the 0-20 scale. */
  readonly currentAbilityAverage: number;
  /** Potential average on the 0-20 scale. */
  readonly potentialAbilityAverage: number;
  /** Ability and potential component before non-player multipliers. */
  readonly abilityScore: number;
  /** Age multiplier used for this player. */
  readonly ageMultiplier: number;
  /** Club category multiplier used for this player. */
  readonly categoryMultiplier: number;
  /** Club reputation multiplier used for this player. */
  readonly reputationMultiplier: number;
  /** Position multiplier used for this player's primary position. */
  readonly positionMultiplier: number;
}

/** Error categories exposed by player valuation helpers. */
export type PlayerValuationErrorCode = "missing_primary_position" | "missing_age_band" | "invalid_config";

/** Typed error thrown when the valuation input is incomplete or ambiguous. */
export class PlayerValuationError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: PlayerValuationErrorCode;

  /** Creates a player valuation error. */
  public constructor(code: PlayerValuationErrorCode, message: string) {
    super(message);
    this.name = "PlayerValuationError";
    this.code = code;
  }
}

/**
 * Default config for the first deterministic valuation model.
 *
 * Values are intentionally broad and fictional. They make the MVP usable for
 * affordability and willingness checks without pretending to model real fees.
 */
export const DEFAULT_PLAYER_VALUATION_CONFIG: PlayerValuationConfig = {
  baseValue: nonNegativeMoney(100_000_00),
  currentAbilityWeight: 0.7,
  potentialAbilityWeight: 0.3,
  ageBands: [
    { minAge: 16, maxAge: 20, multiplier: 1.15 },
    { minAge: 21, maxAge: 25, multiplier: 1.35 },
    { minAge: 26, maxAge: 29, multiplier: 1.2 },
    { minAge: 30, maxAge: 33, multiplier: 0.8 },
    { minAge: 34, maxAge: 45, multiplier: 0.45 },
  ],
  categoryMultipliers: {
    first_division: 2.3,
    second_division: 1.45,
    third_division: 1,
  },
  reputationStepMultiplier: 0.06,
  positionMultipliers: {
    gk: 0.85,
    rb: 0.95,
    cb: 0.98,
    lb: 0.95,
    rwb: 0.98,
    lwb: 0.98,
    dm: 1,
    cm: 1.05,
    am: 1.15,
    rw: 1.18,
    lw: 1.18,
    st: 1.25,
  },
  minValue: nonNegativeMoney(25_000_00),
  maxValue: nonNegativeMoney(50_000_000_00),
};

/**
 * Derives a deterministic true-data player value.
 *
 * The function is pure and uses only caller-provided player, club, date, and
 * config data. It does not read generated content or mutate game state.
 */
export function derivePlayerValuation(input: DerivePlayerValuationInput): PlayerValuation {
  validateConfig(input.config);

  const primaryPosition = input.player.naturalPositions[0];
  if (primaryPosition === undefined) {
    throw new PlayerValuationError("missing_primary_position", `player has no primary position: ${input.player.id}`);
  }

  const age = deriveAge(input.player.birthDate, input.currentDate);
  const ageMultiplier = findAgeMultiplier(input.config.ageBands, age);
  const currentAbilityAverage = averagePlayerAbilities(input.player.abilities);
  const potentialAbilityAverage = averagePlayerAbilities(input.player.potential);
  const abilityScore =
    currentAbilityAverage * input.config.currentAbilityWeight + potentialAbilityAverage * input.config.potentialAbilityWeight;
  const categoryMultiplier = input.config.categoryMultipliers[input.club.category];
  const reputationMultiplier = 1 + input.club.reputation * input.config.reputationStepMultiplier;
  const positionMultiplier = input.config.positionMultipliers[primaryPosition];
  const rawValue =
    input.config.baseValue *
    abilityScore *
    ageMultiplier *
    categoryMultiplier *
    reputationMultiplier *
    positionMultiplier;

  return {
    value: nonNegativeMoney(clampSafeInteger(Math.round(rawValue), input.config.minValue, input.config.maxValue)),
    age,
    currentAbilityAverage,
    potentialAbilityAverage,
    abilityScore,
    ageMultiplier,
    categoryMultiplier,
    reputationMultiplier,
    positionMultiplier,
  };
}

function validateConfig(config: PlayerValuationConfig): void {
  if (config.currentAbilityWeight < 0 || config.potentialAbilityWeight < 0) {
    throw new PlayerValuationError("invalid_config", "ability weights must not be negative");
  }

  if (config.minValue > config.maxValue) {
    throw new PlayerValuationError("invalid_config", "minimum value must not exceed maximum value");
  }
}

function deriveAge(birthDate: GameDate, currentDate: GameDate): number {
  return Math.floor((currentDate - birthDate) / 365);
}

function findAgeMultiplier(ageBands: readonly PlayerValuationAgeBand[], age: number): number {
  for (const band of ageBands) {
    if (age >= band.minAge && age <= band.maxAge) {
      return band.multiplier;
    }
  }

  throw new PlayerValuationError("missing_age_band", `no age multiplier for age: ${age}`);
}

function averagePlayerAbilities(abilities: Player["abilities"]): number {
  const values = [
    abilities.technical.finishing,
    abilities.technical.passing,
    abilities.technical.longPassing,
    abilities.technical.crossing,
    abilities.technical.dribbling,
    abilities.technical.technique,
    abilities.technical.tackling,
    abilities.technical.penalties,
    abilities.technical.freeKicks,
    abilities.physical.pace,
    abilities.physical.strength,
    abilities.physical.stamina,
    abilities.physical.agility,
    abilities.physical.heading,
    abilities.mental.positioning,
    abilities.mental.vision,
    abilities.mental.anticipation,
    abilities.mental.composure,
    abilities.mental.determination,
    abilities.mental.leadership,
    abilities.goalkeeping.reflexes,
    abilities.goalkeeping.handling,
    abilities.goalkeeping.rushingOut,
    abilities.goalkeeping.goalkeeperPositioning,
    abilities.goalkeeping.footwork,
  ];

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampSafeInteger(value: number, minValue: Money, maxValue: Money): number {
  if (!Number.isSafeInteger(value)) {
    throw new PlayerValuationError("invalid_config", `derived value is not a safe integer: ${value}`);
  }

  if (value < minValue) {
    return minValue;
  }

  if (value > maxValue) {
    return maxValue;
  }

  return value;
}
