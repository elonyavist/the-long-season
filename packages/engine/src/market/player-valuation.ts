import {
  getPlayerRoleProfile,
  nonNegativeMoney,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  rolePotentialAbility,
  type Club,
  type ClubCategory,
  type GameDate,
  type Money,
  type Player,
  type PlayerContract,
  type PlayerPosition,
} from "@game/domain";

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
  /** Active agreement whose remaining security affects the transfer price. */
  readonly contract?: PlayerContract;
  /** Current supported form value on the canonical 0-100 scale. */
  readonly currentForm?: number;
}

/** Deterministic output of the true-data player valuation model. */
export interface PlayerValuation {
  /** Final clamped transfer value. */
  readonly value: Money;
  /** Player age in whole years at the current date. */
  readonly age: number;
  /** Role current ability on the 0-20 scale; the name is retained for API compatibility. */
  readonly currentAbilityAverage: number;
  /** Role potential ability on the 0-20 scale; the name is retained for API compatibility. */
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
  /** Whole days remaining on the active agreement, when supplied. */
  readonly remainingContractDays?: number;
  /** Modest multiplier for the security of the remaining agreement. */
  readonly contractSecurityMultiplier: number;
  /** Modest multiplier for already-supported current form. */
  readonly formMultiplier: number;
}

/** Canonical football-quality facts shared by market valuation and willingness. */
export interface PlayerMarketAbility {
  /** Current ability for the player's stable football role. */
  readonly currentAbility: number;
  /** Potential ability evaluated through the same role profile. */
  readonly potentialAbility: number;
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
  const marketAbility = derivePlayerMarketAbility(input.player);
  const currentAbilityAverage = marketAbility.currentAbility;
  const potentialAbilityAverage = marketAbility.potentialAbility;
  const abilityScore =
    currentAbilityAverage * input.config.currentAbilityWeight + potentialAbilityAverage * input.config.potentialAbilityWeight;
  const categoryMultiplier = input.config.categoryMultipliers[input.club.category];
  const reputationMultiplier = 1 + input.club.reputation * input.config.reputationStepMultiplier;
  const positionMultiplier = input.config.positionMultipliers[primaryPosition];
  const remainingContractDays = input.contract === undefined
    ? undefined
    : Math.max(0, input.contract.endsOn - input.currentDate);
  const contractSecurityMultiplier = remainingContractDays === undefined
    ? 1
    : contractSecurityFor(remainingContractDays);
  const formMultiplier = input.currentForm === undefined ? 1 : currentFormMultiplier(input.currentForm);
  const rawValue =
    input.config.baseValue *
    abilityScore *
    ageMultiplier *
    categoryMultiplier *
    reputationMultiplier *
    positionMultiplier *
    contractSecurityMultiplier *
    formMultiplier;

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
    ...(remainingContractDays === undefined ? {} : { remainingContractDays }),
    contractSecurityMultiplier,
    formMultiplier,
  };
}

/**
 * Derives the role-aware ability facts used by market decisions.
 *
 * Historical saves without role identity retain the former raw diagnostic
 * behavior until their durable player data is naturally replaced.
 */
export function derivePlayerMarketAbility(player: Player): PlayerMarketAbility {
  if (player.primaryRole === undefined) {
    return {
      currentAbility: Number(rawDiagnosticAbilityAverage(player.abilities)),
      potentialAbility: Number(rawDiagnosticAbilityAverage(player.potential)),
    };
  }

  const profile = getPlayerRoleProfile(player.primaryRole);
  return {
    currentAbility: Number(roleCurrentAbility(player.abilities, profile)),
    potentialAbility: Number(rolePotentialAbility(player.potential, profile)),
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

  // Price plausible ages that fall just outside the senior bands with the
  // nearest boundary band instead of failing. Generation deliberately seeds
  // senior reserves with the occasional very young prodigy (the `rare_prodigy`
  // archetype starts at 15), and long careers can push a player past the top
  // band; every market path must value such a real player rather than crash.
  // A genuine gap between non-contiguous bands still fails loudly.
  const lowestBand = ageBands.reduce((lowest, band) => (band.minAge < lowest.minAge ? band : lowest));
  const highestBand = ageBands.reduce((highest, band) => (band.maxAge > highest.maxAge ? band : highest));
  if (age < lowestBand.minAge) return lowestBand.multiplier;
  if (age > highestBand.maxAge) return highestBand.multiplier;

  throw new PlayerValuationError("missing_age_band", `no age multiplier for age: ${age}`);
}

function contractSecurityFor(remainingDays: number): number {
  if (remainingDays <= 0) return 0.72;
  if (remainingDays <= 183) return 0.78;
  if (remainingDays <= 365) return 0.86;
  if (remainingDays <= 730) return 1;
  if (remainingDays <= 1_095) return 1.08;
  if (remainingDays <= 1_460) return 1.14;
  return 1.18;
}

function currentFormMultiplier(form: number): number {
  if (!Number.isFinite(form) || form < 0 || form > 100) {
    throw new PlayerValuationError("invalid_config", `current form must be in range 0-100: ${form}`);
  }
  return 0.94 + form / 100 * 0.12;
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
