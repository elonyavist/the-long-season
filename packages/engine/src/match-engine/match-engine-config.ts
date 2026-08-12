/**
 * Match engine configuration for early aggregate simulation.
 *
 * This file defines serializable tuning inputs only. It does not simulate
 * minutes, events, shots, or goals.
 */

/**
 * Chance-generation rate configuration.
 */
export interface MatchRateConfig {
  /** Baseline opportunity probability per team per simulated minute. */
  readonly baseOpportunityRatePerMinute: number;
  /** Absolute cap after future strength/tactical modifiers are applied. */
  readonly maxOpportunityRatePerMinute: number;
}

/**
 * Conversion band for mapping an opportunity quality score to goal probability.
 */
export interface ConversionBand {
  /** Stable data key for diagnostics and balance reports. */
  readonly bandKey: string;
  /** Inclusive lower quality bound. */
  readonly minQualityInclusive: number;
  /** Exclusive upper quality bound. */
  readonly maxQualityExclusive: number;
  /** Goal probability for opportunities inside this band. */
  readonly goalProbability: number;
}

/**
 * Inclusive cap for one tactical distribution knob.
 */
export interface TacticalKnobCap {
  /** Lowest allowed value. */
  readonly minInclusive: number;
  /** Highest allowed value. */
  readonly maxInclusive: number;
}

/**
 * Tactical distribution cap data.
 *
 * These caps bound future tactical inputs so tactics can move distributions
 * without directly adding uncapped team strength.
 */
export interface TacticalDistributionCaps {
  /** Directness or route-one tendency cap. */
  readonly directness: TacticalKnobCap;
  /** Pressing intensity cap. */
  readonly pressing: TacticalKnobCap;
  /** Width tendency cap. */
  readonly width: TacticalKnobCap;
  /** Attacking risk cap. */
  readonly risk: TacticalKnobCap;
}

/** Versioned disciplinary-event calibration consumed by the minute engine. */
export interface MatchDisciplineConfig {
  /** Stable content identity reported with simulation evidence. */
  readonly version: string;
  /** Conditional award share after a foul crosses the penalty-area threshold. */
  readonly penaltyAwardProbabilityAfterDangerousFoulBasisPoints: number;
  /** Minimum foul-location danger eligible for a direct shot. */
  readonly directFreeKickMinimumZoneDangerBasisPoints: number;
  /** Share of eligible restarts taken as a direct shot. */
  readonly directFreeKickShotProbabilityBasisPoints: number;
  /** Population conversion anchor before player attributes. */
  readonly directFreeKickBaseGoalProbabilityBasisPoints: number;
  readonly directFreeKickReferenceTakerAbility: number;
  readonly directFreeKickTakerAbilityStepBasisPoints: number;
  readonly directFreeKickReferenceGoalkeeperReflexes: number;
  readonly directFreeKickGoalkeeperAbilityStepBasisPoints: number;
  readonly directFreeKickMinimumGoalProbabilityBasisPoints: number;
  readonly directFreeKickMaximumGoalProbabilityBasisPoints: number;
}

/**
 * Serializable match engine tuning for one match.
 */
export interface MatchEngineConfig {
  /** Number of simulated match minutes. */
  readonly minuteCount: number;
  /** Chance-generation rates. */
  readonly rates: MatchRateConfig;
  /** Ordered conversion bands used by future opportunity resolution. */
  readonly conversionBands: readonly ConversionBand[];
  /** Multiplier applied later to home-side distribution or strength inputs. */
  readonly homeAdvantageFactor: number;
  /** Multiplier applied only to the gap between opposing department scores. */
  readonly strengthGapMultiplier: number;
  /** Versioned foul-to-penalty calibration. */
  readonly discipline: MatchDisciplineConfig;
  /** Caps for future tactical distribution knobs. */
  readonly tacticalDistributionCaps: TacticalDistributionCaps;
}

/**
 * Checks whether the engine config has the minimal complete shape required by a
 * match context.
 *
 * @example
 * const valid = isValidMatchEngineConfig(config);
 */
export function isValidMatchEngineConfig(config: MatchEngineConfig | undefined): config is MatchEngineConfig {
  if (config === undefined) {
    return false;
  }

  return (
    Number.isSafeInteger(config.minuteCount) &&
    config.minuteCount > 0 &&
    Number.isFinite(config.rates.baseOpportunityRatePerMinute) &&
    config.rates.baseOpportunityRatePerMinute >= 0 &&
    Number.isFinite(config.rates.maxOpportunityRatePerMinute) &&
    config.rates.maxOpportunityRatePerMinute >= config.rates.baseOpportunityRatePerMinute &&
    Number.isFinite(config.homeAdvantageFactor) &&
    config.homeAdvantageFactor > 0 &&
    Number.isFinite(config.strengthGapMultiplier) &&
    config.strengthGapMultiplier > 0 &&
    isValidMatchDisciplineConfig(config.discipline) &&
    config.conversionBands.length > 0 &&
    config.conversionBands.every(isValidConversionBand) &&
    isValidTacticalDistributionCaps(config.tacticalDistributionCaps)
  );
}

/** Checks the versioned disciplinary probability without supplying defaults. */
function isValidMatchDisciplineConfig(config: MatchDisciplineConfig | undefined): boolean {
  if (config === undefined) return false;
  const awardShare = config.penaltyAwardProbabilityAfterDangerousFoulBasisPoints;
  const directShotShare = config.directFreeKickShotProbabilityBasisPoints;
  const directMinimum = config.directFreeKickMinimumGoalProbabilityBasisPoints;
  const directMaximum = config.directFreeKickMaximumGoalProbabilityBasisPoints;
  return config.version.trim().length > 0
    && Number.isSafeInteger(awardShare)
    && awardShare > 0
    && awardShare < 10_000
    && isInteriorBasisPointShare(directShotShare)
    && isInteriorBasisPointShare(config.directFreeKickMinimumZoneDangerBasisPoints)
    && isInteriorBasisPointShare(config.directFreeKickBaseGoalProbabilityBasisPoints)
    && Number.isSafeInteger(config.directFreeKickReferenceTakerAbility)
    && config.directFreeKickReferenceTakerAbility >= 1
    && config.directFreeKickReferenceTakerAbility <= 20
    && Number.isSafeInteger(config.directFreeKickTakerAbilityStepBasisPoints)
    && config.directFreeKickTakerAbilityStepBasisPoints > 0
    && Number.isSafeInteger(config.directFreeKickReferenceGoalkeeperReflexes)
    && config.directFreeKickReferenceGoalkeeperReflexes >= 1
    && config.directFreeKickReferenceGoalkeeperReflexes <= 20
    && Number.isSafeInteger(config.directFreeKickGoalkeeperAbilityStepBasisPoints)
    && config.directFreeKickGoalkeeperAbilityStepBasisPoints > 0
    && isInteriorBasisPointShare(directMinimum)
    && isInteriorBasisPointShare(directMaximum)
    && directMinimum < directMaximum;
}

function isInteriorBasisPointShare(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0 && value < 10_000;
}

/**
 * Checks one conversion band.
 */
function isValidConversionBand(band: ConversionBand): boolean {
  return (
    band.bandKey.length > 0 &&
    Number.isFinite(band.minQualityInclusive) &&
    Number.isFinite(band.maxQualityExclusive) &&
    band.maxQualityExclusive > band.minQualityInclusive &&
    Number.isFinite(band.goalProbability) &&
    band.goalProbability >= 0 &&
    band.goalProbability <= 1
  );
}

/**
 * Checks all tactical caps.
 */
function isValidTacticalDistributionCaps(caps: TacticalDistributionCaps): boolean {
  return (
    isValidTacticalKnobCap(caps.directness) &&
    isValidTacticalKnobCap(caps.pressing) &&
    isValidTacticalKnobCap(caps.width) &&
    isValidTacticalKnobCap(caps.risk)
  );
}

/**
 * Checks one tactical knob cap.
 */
function isValidTacticalKnobCap(cap: TacticalKnobCap): boolean {
  return (
    Number.isFinite(cap.minInclusive) &&
    Number.isFinite(cap.maxInclusive) &&
    cap.maxInclusive >= cap.minInclusive
  );
}
