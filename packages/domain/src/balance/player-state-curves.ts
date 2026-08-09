/** Versioned content policy for deterministic fitness recovery. */
export interface PlayerStateCurvesConfig {
  readonly schemaVersion: 1;
  readonly version: string;
  /** Recovery half-life for a prime player with neutral resilience, in day bps. */
  readonly baseRecoveryHalfLifeDaysBasisPoints: number;
  /** Extra half-life per continuous year above the age threshold, in day bps. */
  readonly ageHalfLifeDaysPerYearBasisPoints: number;
  readonly agePenaltyStartsAtYears: number;
  /** Extra full-match fitness cost per continuous year above the threshold. */
  readonly ageMatchLoadPerYearBasisPoints: number;
  /** Upper bound for the age-conditioned full-match cost multiplier. */
  readonly maximumAgeMatchLoadMultiplierBasisPoints: number;
  readonly resilienceWeightsBasisPoints: {
    readonly stamina: number;
    readonly agility: number;
    readonly strength: number;
  };
  readonly lowResilienceHalfLifeMultiplierBasisPoints: number;
  readonly highResilienceHalfLifeMultiplierBasisPoints: number;
}

/** Validates recovery content without selecting any gameplay outcome. */
export function validatePlayerStateCurvesConfig(
  config: PlayerStateCurvesConfig,
): PlayerStateCurvesConfig {
  if (config.schemaVersion !== 1) throw new Error(`unsupported player-state curves schema: ${config.schemaVersion}`);
  if (config.version.length === 0) throw new Error("player-state curves version must not be empty");
  const positiveIntegers = [
    config.baseRecoveryHalfLifeDaysBasisPoints,
    config.ageHalfLifeDaysPerYearBasisPoints,
    config.agePenaltyStartsAtYears,
    config.ageMatchLoadPerYearBasisPoints,
    config.maximumAgeMatchLoadMultiplierBasisPoints,
    config.lowResilienceHalfLifeMultiplierBasisPoints,
    config.highResilienceHalfLifeMultiplierBasisPoints,
  ];
  if (!positiveIntegers.every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error("player-state curve magnitudes must be positive safe integers");
  }
  const weights = config.resilienceWeightsBasisPoints;
  if (
    ![weights.stamina, weights.agility, weights.strength]
      .every((value) => Number.isSafeInteger(value) && value >= 0)
    || weights.stamina + weights.agility + weights.strength !== 10_000
  ) {
    throw new Error("player-state resilience weights must be non-negative and sum to 10000");
  }
  if (config.highResilienceHalfLifeMultiplierBasisPoints >= config.lowResilienceHalfLifeMultiplierBasisPoints) {
    throw new Error("high resilience must reduce recovery half-life");
  }
  if (config.maximumAgeMatchLoadMultiplierBasisPoints < 10_000) {
    throw new Error("maximum age match-load multiplier must be at least neutral");
  }
  return config;
}
