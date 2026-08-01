import {
  nonNegativeMoney,
  type Money,
  type PlayerMarketCalibrationConfig,
  type PlayerPosition,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
  type PlayerStarRating,
  type ValuationCurvesConfig,
} from "@game/domain";

import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";

/** Explicit versioned inputs required by the canonical public-value model. */
export interface PlayerValuationConfig {
  /** Closed global rating scale used for current and potential stars. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Canonical Phase 80A Step 05 policy used by the public assessment. */
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyConfig;
  /** Dated market anchors and reviewed distribution tolerances. */
  readonly marketCalibration: PlayerMarketCalibrationConfig;
  /** Reviewed nonlinear rating, age, potential, position, and tail curves. */
  readonly valuationCurves: ValuationCurvesConfig;
}

/** Inputs needed to derive one observer-independent public market value. */
export interface DerivePlayerValuationInput {
  /** Canonical public facts already derived once by the caller. */
  readonly assessment: PublicPlayerAssessment;
  /** Intrinsic football position used only for bounded role scarcity. */
  readonly primaryPosition: PlayerPosition;
  /** Explicit validated and cross-versioned valuation content. */
  readonly config: PlayerValuationConfig;
}

/** Safe structured components explaining one public value. */
export interface PlayerValuationComponents {
  /** Public current rating used to choose the nonlinear value anchor. */
  readonly currentRating: PlayerStarRating;
  /** Public P50 estimate used to price the probable-development tranche. */
  readonly potentialP50Rating: PlayerStarRating;
  /** Public upper estimate used to price bounded, non-guaranteed option value. */
  readonly potentialUpperRating: PlayerStarRating;
  /** Anchor selected from the reviewed valuation curve. */
  readonly ratingAnchorMinorUnits: Money;
  /** Continuous value of proven current quality. */
  readonly currentQualityValueMinorUnits: Money;
  /** Continuous value of the public P50 outcome on the same nonlinear curve. */
  readonly p50QualityValueMinorUnits: Money;
  /** Continuous value of the public upper outcome on the same nonlinear curve. */
  readonly upperQualityValueMinorUnits: Money;
  /** Policy participation in the incremental current-to-P50 value. */
  readonly p50ParticipationBasisPoints: number;
  /** Policy participation in the incremental P50-to-upper option value. */
  readonly upperOptionParticipationBasisPoints: number;
  /** Weighted contribution of the incremental current-to-P50 value. */
  readonly p50UpsideValueMinorUnits: Money;
  /** Weighted contribution of the incremental P50-to-upper value. */
  readonly upperOptionValueMinorUnits: Money;
  /** Proven current value plus both bounded public-upside contributions. */
  readonly expectedQualityValueMinorUnits: Money;
  /** Age multiplier expressed in integer basis points. */
  readonly ageMultiplierBasisPoints: number;
  /** Broad-position multiplier expressed in integer basis points. */
  readonly positionMultiplierBasisPoints: number;
  /** Deterministically rounded value before upper-tail compression. */
  readonly valueBeforeTailCompressionMinorUnits: Money;
  /** Shared compressed value before whole-euro quantization and final caps. */
  readonly valueAfterTailCompressionMinorUnits: Money;
  /** Whether this player is eligible to reach the global hard cap. */
  readonly hardCapEligible: boolean;
  /** Whether the final value was clamped exactly to the global hard cap. */
  readonly hardCapApplied: boolean;
}

/** Deterministic public market value and its safe diagnostic components. */
export interface PlayerValuation {
  /** Final integer-minor-unit public value. */
  readonly value: Money;
  /** Player age in whole years at the current date. */
  readonly age: number;
  /**
   * Components use public half-star ratings and never expose exact numeric
   * potential ability.
   */
  readonly components: PlayerValuationComponents;
}

/** Error categories exposed by player valuation helpers. */
export type PlayerValuationErrorCode =
  | "missing_primary_position"
  | "invalid_assessment"
  | "missing_age_band"
  | "invalid_config";

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
 * Derives one global, observer-independent public market value.
 *
 * Current, P50, and upper quality use the same nonlinear curve. Proven current
 * quality is priced fully; only the two non-overlapping upside deltas receive
 * bounded participation. Owner, employment, and seller facts cannot enter
 * this API.
 */
export function derivePlayerValuation(
  input: DerivePlayerValuationInput,
): PlayerValuation {
  validateConfig(input.config);
  const primaryPosition = input.primaryPosition;
  if (primaryPosition === undefined) {
    throw new PlayerValuationError(
      "missing_primary_position",
      `player has no primary position: ${input.assessment.playerId}`,
    );
  }
  const assessment = input.assessment;
  validateAssessment(assessment, input.config);
  const age = assessment.age;
  const currentRating = assessment.currentRating.stars;
  const potentialP50Rating = assessment.p50Rating.stars;
  const potentialUpperRating = assessment.upperRating.stars;
  const ratingAnchorIndex = input.config.valuationCurves.ratingValueAnchors.findIndex(
    (anchor) => anchor.rating === currentRating,
  );
  const ratingAnchor = input.config.valuationCurves.ratingValueAnchors[ratingAnchorIndex];
  if (ratingAnchorIndex < 0 || ratingAnchor === undefined) {
    throw new PlayerValuationError(
      "invalid_config",
      `valuation anchor is missing for rating: ${currentRating}`,
    );
  }
  const currentQualityValue = interpolateQualityCurveValue({
    ability: assessment.currentAbility,
    config: input.config,
  });
  const p50QualityValue = interpolateQualityCurveValue({
    ability: assessment.p50Ability,
    config: input.config,
  });
  const upperQualityValue = interpolateQualityCurveValue({
    ability: assessment.upperAbility,
    config: input.config,
  });
  const participation = input.config.valuationCurves.prospectExpectation;
  const p50UpsideValue = multiplyBasisPoints(
    p50QualityValue - currentQualityValue,
    participation.p50ParticipationBasisPoints,
  );
  const upperOptionValue = multiplyBasisPoints(
    upperQualityValue - p50QualityValue,
    participation.upperOptionParticipationBasisPoints,
  );
  const expectedQualityValue = assertSafeInteger(
    currentQualityValue + p50UpsideValue + upperOptionValue,
  );
  const ageMultiplierBasisPoints = findAgeMultiplier(
    input.config.valuationCurves,
    age,
  );
  const positionMultiplierBasisPoints =
    input.config.valuationCurves.positionMultipliers[
      broadPosition(primaryPosition)
    ];
  const valueBeforeTailCompression = multiplyBasisPoints(
    multiplyBasisPoints(
      expectedQualityValue,
      ageMultiplierBasisPoints,
    ),
    positionMultiplierBasisPoints,
  );
  const upperTail = input.config.valuationCurves.upperTail;
  const hardCapEligible =
    currentRating === upperTail.hardCapRequiredRating
    && age <= upperTail.hardCapMaximumAge;
  const compressedValue = compressUpperTail(
    valueBeforeTailCompression,
    upperTail.compressionStartsMinorUnits,
    upperTail.compressionBasisPoints,
  );
  const wholeEuroValue = floorToWholeEuro(compressedValue);
  const cappedValue = Math.min(
    wholeEuroValue,
    hardCapEligible
      ? upperTail.hardCapMinorUnits
      : upperTail.hardCapMinorUnits - 100,
  );
  const value = nonNegativeMoney(assertSafeInteger(cappedValue));

  return {
    value,
    age,
    components: {
      currentRating,
      potentialP50Rating,
      potentialUpperRating,
      ratingAnchorMinorUnits: nonNegativeMoney(ratingAnchor.valueMinorUnits),
      currentQualityValueMinorUnits: nonNegativeMoney(currentQualityValue),
      p50QualityValueMinorUnits: nonNegativeMoney(p50QualityValue),
      upperQualityValueMinorUnits: nonNegativeMoney(upperQualityValue),
      p50ParticipationBasisPoints: participation.p50ParticipationBasisPoints,
      upperOptionParticipationBasisPoints:
        participation.upperOptionParticipationBasisPoints,
      p50UpsideValueMinorUnits: nonNegativeMoney(p50UpsideValue),
      upperOptionValueMinorUnits: nonNegativeMoney(upperOptionValue),
      expectedQualityValueMinorUnits: nonNegativeMoney(expectedQualityValue),
      ageMultiplierBasisPoints,
      positionMultiplierBasisPoints,
      valueBeforeTailCompressionMinorUnits: nonNegativeMoney(
        valueBeforeTailCompression,
      ),
      valueAfterTailCompressionMinorUnits: nonNegativeMoney(compressedValue),
      hardCapEligible,
      hardCapApplied: value === upperTail.hardCapMinorUnits,
    },
  };
}

function interpolateQualityCurveValue(input: {
  readonly ability: number;
  readonly config: PlayerValuationConfig;
}): number {
  const curves = input.config.valuationCurves;
  const ratingAnchorIndex = qualityAnchorIndex(input.ability, input.config);
  const lowerAnchor = curves.ratingValueAnchors[ratingAnchorIndex];
  const upperAnchor = curves.ratingValueAnchors[ratingAnchorIndex + 1];
  const lowerThreshold = input.config.ratingScale.abilityThresholds[ratingAnchorIndex];
  const upperThreshold = input.config.ratingScale.abilityThresholds.find(
    (threshold) => threshold.rating === upperAnchor?.rating,
  );
  if (
    lowerAnchor === undefined
    || upperAnchor === undefined
    || lowerThreshold === undefined
    || upperThreshold === undefined
  ) {
    if (lowerAnchor !== undefined && upperAnchor === undefined) {
      return lowerAnchor.valueMinorUnits;
    }
    throw new PlayerValuationError(
      "invalid_config",
      `continuous valuation interval is incomplete at ability: ${input.ability}`,
    );
  }
  const interval = upperThreshold.minimumAbilityInclusive
    - lowerThreshold.minimumAbilityInclusive;
  if (interval <= 0) {
    throw new PlayerValuationError(
      "invalid_config",
      `continuous valuation interval is invalid at ability: ${input.ability}`,
    );
  }
  const progress = Math.max(
    0,
    Math.min(
      1,
      (input.ability - lowerThreshold.minimumAbilityInclusive) / interval,
    ),
  );
  const curvedProgress = progress
    ** (curves.qualityInterpolationExponentMilli / 1_000);
  return assertSafeInteger(Math.round(
    lowerAnchor.valueMinorUnits
      + ((upperAnchor.valueMinorUnits - lowerAnchor.valueMinorUnits)
        * curvedProgress),
  ));
}

/** Finds the continuous rating interval containing one role ability. */
function qualityAnchorIndex(
  ability: number,
  config: PlayerValuationConfig,
): number {
  let selectedIndex = 0;
  for (
    let index = 0;
    index < config.ratingScale.abilityThresholds.length;
    index += 1
  ) {
    const threshold = config.ratingScale.abilityThresholds[index];
    if (threshold === undefined || ability < threshold.minimumAbilityInclusive) break;
    selectedIndex = index;
  }
  return selectedIndex;
}

/** Rejects malformed facts before they can influence the global money curve. */
function validateAssessment(
  assessment: PublicPlayerAssessment,
  config: PlayerValuationConfig,
): void {
  const abilities = [
    assessment.currentAbility,
    assessment.p50Ability,
    assessment.upperAbility,
  ];
  if (
    !Number.isSafeInteger(assessment.age)
    || assessment.age < 0
    || abilities.some((ability) =>
      !Number.isFinite(ability) || ability < 0 || ability > 20
    )
    || assessment.currentAbility > assessment.p50Ability
    || assessment.p50Ability > assessment.upperAbility
    || assessment.currentRating.stars > assessment.p50Rating.stars
    || assessment.p50Rating.stars > assessment.upperRating.stars
    || assessment.currentRating.stars
      !== ratingForAbility(assessment.currentAbility, config)
    || assessment.p50Rating.stars
      !== ratingForAbility(assessment.p50Ability, config)
    || assessment.upperRating.stars
      !== ratingForAbility(assessment.upperAbility, config)
  ) {
    throw new PlayerValuationError(
      "invalid_assessment",
      `public assessment is invalid: ${assessment.playerId}`,
    );
  }
}

/** Maps an exact public ability through the same closed scale as valuation. */
function ratingForAbility(
  ability: number,
  config: PlayerValuationConfig,
): PlayerStarRating | undefined {
  return config.ratingScale.abilityThresholds[
    qualityAnchorIndex(ability, config)
  ]?.rating;
}

function validateConfig(config: PlayerValuationConfig): void {
  if (
    config.valuationCurves.playerRatingScaleVersion !== config.ratingScale.version
    || config.valuationCurves.playerMarketCalibrationVersion
      !== config.marketCalibration.version
    || config.valuationCurves.prospectExpectation.potentialProjectionPolicyVersion
      !== config.potentialProjectionPolicy.version
  ) {
    throw new PlayerValuationError(
      "invalid_config",
      "valuation content versions do not match",
    );
  }
  if (
    config.valuationCurves.upperTail.hardCapMinorUnits !== 15_000_000_000
    || config.valuationCurves.upperTail.hardCapRequiredRating !== 6
    || config.valuationCurves.upperTail.hardCapMaximumAge !== 25
  ) {
    throw new PlayerValuationError(
      "invalid_config",
      "valuation hard-cap contract is invalid",
    );
  }
  const p50Participation =
    config.valuationCurves.prospectExpectation.p50ParticipationBasisPoints;
  const upperOptionParticipation =
    config.valuationCurves.prospectExpectation
      .upperOptionParticipationBasisPoints;
  if (
    config.valuationCurves.qualityInterpolationExponentMilli <= 0
    || !Number.isSafeInteger(p50Participation)
    || !Number.isSafeInteger(upperOptionParticipation)
    || upperOptionParticipation <= 0
    || upperOptionParticipation > p50Participation
    || p50Participation >= 10_000
  ) {
    throw new PlayerValuationError(
      "invalid_config",
      "valuation interpolation or public-quality participation is invalid",
    );
  }
}

function findAgeMultiplier(
  curves: ValuationCurvesConfig,
  age: number,
): number {
  const matching = curves.ageMultipliers.find(
    (band) => age >= band.minimumAge && age <= band.maximumAge,
  );
  if (matching !== undefined) return matching.multiplierBasisPoints;

  const first = curves.ageMultipliers[0];
  const last = curves.ageMultipliers.at(-1);
  if (first === undefined || last === undefined) {
    throw new PlayerValuationError(
      "invalid_config",
      "valuation age curves are empty",
    );
  }
  if (age < first.minimumAge) return first.multiplierBasisPoints;
  if (age > last.maximumAge) return last.multiplierBasisPoints;
  throw new PlayerValuationError(
    "missing_age_band",
    `no age multiplier for age: ${age}`,
  );
}

function broadPosition(
  position: PlayerPosition,
): keyof ValuationCurvesConfig["positionMultipliers"] {
  if (position === "gk") return "goalkeeper";
  if (
    position === "rb"
    || position === "cb"
    || position === "lb"
    || position === "rwb"
    || position === "lwb"
  ) return "defender";
  if (position === "rw" || position === "lw" || position === "st") {
    return "forward";
  }
  return "midfielder";
}

function multiplyBasisPoints(value: number, basisPoints: number): number {
  return assertSafeInteger(Math.round(value * basisPoints / 10_000));
}

function compressUpperTail(
  value: number,
  startsAt: number,
  compressionBasisPoints: number,
): number {
  if (value <= startsAt) return value;
  return assertSafeInteger(
    startsAt
      + Math.round((value - startsAt) * compressionBasisPoints / 10_000),
  );
}

/** Quantizes cents downward to the whole-euro precision rendered by Market. */
function floorToWholeEuro(value: number): number {
  return assertSafeInteger(Math.floor(value / 100) * 100);
}

function assertSafeInteger(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new PlayerValuationError(
      "invalid_config",
      `derived value is not a safe non-negative integer: ${value}`,
    );
  }
  return value;
}
