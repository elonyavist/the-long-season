import {
  getPlayerRoleProfile,
  nonNegativeMoney,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubCategory,
  type GameDate,
  type Money,
  type Player,
  type PlayerMarketCalibrationConfig,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
  type PlayerStarRating,
  type ValuationCurvesConfig,
} from "@game/domain";

import { derivePlayerPotentialProjection } from "../squad/player-potential-projection.ts";

/** Explicit versioned inputs required by the canonical public-value model. */
export interface PlayerValuationConfig {
  /** Closed global rating scale used for current and potential stars. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Canonical Step 05a policy used to derive one shared public range. */
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyConfig;
  /** Dated market anchors and reviewed distribution tolerances. */
  readonly marketCalibration: PlayerMarketCalibrationConfig;
  /** Reviewed nonlinear rating, age, potential, position, and tail curves. */
  readonly valuationCurves: ValuationCurvesConfig;
}

/** Stable owner-market fact used by the public value model. */
export type PlayerValuationMarketContext =
  | Readonly<{ kind: "contracted"; division: ClubCategory }>
  | Readonly<{ kind: "free_agent" }>;

/** Inputs needed to derive one observer-independent public market value. */
export interface DerivePlayerValuationInput {
  /** Player being valued. */
  readonly player: Player;
  /** Current game date used to derive age. */
  readonly currentDate: GameDate;
  /** Explicit validated and cross-versioned valuation content. */
  readonly config: PlayerValuationConfig;
  /**
   * Current owner market, or an explicit neutral context when unattached.
   * The observing/buying club is deliberately absent.
   */
  readonly marketContext: PlayerValuationMarketContext;
}

/** Safe structured components explaining one public value. */
export interface PlayerValuationComponents {
  /** Public current rating used to choose the nonlinear value anchor. */
  readonly currentRating: PlayerStarRating;
  /** Conservative public lower estimate used to measure uncertainty. */
  readonly potentialLowerRating: PlayerStarRating;
  /** Public expected estimate whose continuous anchor prices upside. */
  readonly potentialExpectedRating: PlayerStarRating;
  /** Public upper estimate; retained for range width, never priced directly. */
  readonly potentialUpperRating: PlayerStarRating;
  /** Anchor selected from the reviewed valuation curve. */
  readonly ratingAnchorMinorUnits: Money;
  /** Continuous value of proven current quality. */
  readonly currentQualityValueMinorUnits: Money;
  /** Continuous value of the modeled upper outcome, never used unweighted. */
  readonly upperQualityValueMinorUnits: Money;
  /** Probability-weighted money expectation from the Step 05a realization. */
  readonly undiscountedPotentialExpectationMinorUnits: Money;
  /** Range-width discount multiplier expressed in integer basis points. */
  readonly uncertaintyMultiplierBasisPoints: number;
  /** Discounted expected-realization value before the max-with-current rule. */
  readonly discountedPotentialExpectationMinorUnits: Money;
  /** Larger of current quality and discounted expected realization. */
  readonly selectedQualityValueMinorUnits: Money;
  /** Age multiplier expressed in integer basis points. */
  readonly ageMultiplierBasisPoints: number;
  /** Broad-position multiplier expressed in integer basis points. */
  readonly positionMultiplierBasisPoints: number;
  /** Owning-market multiplier expressed in integer basis points. */
  readonly marketContextMultiplierBasisPoints: number;
  /** Owning-market ceiling applied before the global hard-cap contract. */
  readonly marketContextMaximumMinorUnits: Money;
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

/** Canonical football-quality facts shared by market valuation and willingness. */
export interface PlayerMarketAbility {
  /** Current ability for the player's stable football role. */
  readonly currentAbility: number;
  /** Potential ability evaluated through the same role profile. */
  readonly potentialAbility: number;
}

/** Error categories exposed by player valuation helpers. */
export type PlayerValuationErrorCode =
  | "missing_primary_position"
  | "missing_role_identity"
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
 * Current quality and the Step 05a expected projection are valued on the same
 * continuous curve. The projected component is discounted by visible range
 * width, then the larger component receives the shared age, position, owner
 * context, upper-tail, whole-euro, and cap policies.
 */
export function derivePlayerValuation(
  input: DerivePlayerValuationInput,
): PlayerValuation {
  validateConfig(input.config);
  const primaryPosition = input.player.naturalPositions[0];
  if (primaryPosition === undefined) {
    throw new PlayerValuationError(
      "missing_primary_position",
      `player has no primary position: ${input.player.id}`,
    );
  }
  if (input.player.primaryRole === undefined) {
    throw new PlayerValuationError(
      "missing_role_identity",
      `player role identity is required for public value: ${input.player.id}`,
    );
  }

  const projection = derivePlayerPotentialProjection({
    player: input.player,
    currentDate: input.currentDate,
    policy: input.config.potentialProjectionPolicy,
    ratingScale: input.config.ratingScale,
  });
  const age = projection.age;
  const currentRating = projection.currentRating;
  const potentialLowerRating = projection.conservativeLowerRating;
  const potentialExpectedRating = projection.expectedRating;
  const potentialUpperRating = projection.upperRating;
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
    ability: projection.currentAbility,
    config: input.config,
  });
  const upperQualityValue = interpolateQualityCurveValue({
    ability: projection.upperAbility,
    config: input.config,
  });
  const undiscountedPotentialExpectation = interpolateExpectedOutcomeValue({
    currentAbility: projection.currentAbility,
    expectedAbility: projection.expectedAbility,
    upperAbility: projection.upperAbility,
    currentQualityValue,
    upperQualityValue,
  });
  const uncertaintyMultiplierBasisPoints = uncertaintyMultiplier(
    input.config.valuationCurves,
    potentialLowerRating,
    potentialUpperRating,
  );
  const discountedPotentialExpectation = multiplyBasisPoints(
    undiscountedPotentialExpectation,
    uncertaintyMultiplierBasisPoints,
  );
  const selectedQualityValue = Math.max(
    currentQualityValue,
    discountedPotentialExpectation,
  );
  const ageMultiplierBasisPoints = findAgeMultiplier(
    input.config.valuationCurves,
    age,
  );
  const positionMultiplierBasisPoints =
    input.config.valuationCurves.positionMultipliers[
      broadPosition(primaryPosition)
    ];
  const marketContextKey = input.marketContext.kind === "free_agent"
    ? "free_agent"
    : input.marketContext.division;
  const marketContextMultiplierBasisPoints =
    input.config.valuationCurves.marketContext.multiplierBasisPoints[
      marketContextKey
    ];
  const marketContextMaximumMinorUnits =
    input.config.valuationCurves.marketContext.maximumMinorUnits[
      marketContextKey
    ];
  const valueBeforeTailCompression = multiplyBasisPoints(
    multiplyBasisPoints(
      multiplyBasisPoints(
        selectedQualityValue,
        ageMultiplierBasisPoints,
      ),
      positionMultiplierBasisPoints,
    ),
    marketContextMultiplierBasisPoints,
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
    marketContextMaximumMinorUnits,
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
      potentialLowerRating,
      potentialExpectedRating,
      potentialUpperRating,
      ratingAnchorMinorUnits: nonNegativeMoney(ratingAnchor.valueMinorUnits),
      currentQualityValueMinorUnits: nonNegativeMoney(currentQualityValue),
      upperQualityValueMinorUnits: nonNegativeMoney(upperQualityValue),
      undiscountedPotentialExpectationMinorUnits: nonNegativeMoney(
        undiscountedPotentialExpectation,
      ),
      uncertaintyMultiplierBasisPoints,
      discountedPotentialExpectationMinorUnits: nonNegativeMoney(
        discountedPotentialExpectation,
      ),
      selectedQualityValueMinorUnits: nonNegativeMoney(selectedQualityValue),
      ageMultiplierBasisPoints,
      positionMultiplierBasisPoints,
      marketContextMultiplierBasisPoints,
      marketContextMaximumMinorUnits: nonNegativeMoney(
        marketContextMaximumMinorUnits,
      ),
      valueBeforeTailCompressionMinorUnits: nonNegativeMoney(
        valueBeforeTailCompression,
      ),
      valueAfterTailCompressionMinorUnits: nonNegativeMoney(compressedValue),
      hardCapEligible,
      hardCapApplied: value === upperTail.hardCapMinorUnits,
    },
  };
}

/**
 * Converts the Step 05a expected ability into a money-space expectation.
 *
 * The stored upper ability contributes only through the calibrated realization
 * share. This is neither raw-ceiling pricing nor an unweighted midpoint.
 */
function interpolateExpectedOutcomeValue(input: {
  readonly currentAbility: number;
  readonly expectedAbility: number;
  readonly upperAbility: number;
  readonly currentQualityValue: number;
  readonly upperQualityValue: number;
}): number {
  const remainingRoom = input.upperAbility - input.currentAbility;
  if (remainingRoom <= 0) return input.currentQualityValue;
  const realizationBasisPoints = Math.max(
    0,
    Math.min(
      10_000,
      Math.round(
        (
          input.expectedAbility - input.currentAbility
        ) * 10_000 / remainingRoom,
      ),
    ),
  );
  return assertSafeInteger(
    input.currentQualityValue
      + multiplyBasisPoints(
        input.upperQualityValue - input.currentQualityValue,
        realizationBasisPoints,
      ),
  );
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

/**
 * Derives the role-aware ability facts used by market decisions.
 *
 * This true-data helper remains separate from the public-value output so exact
 * potential is never added to public valuation diagnostics.
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
  const marketKeys = [
    "first_division",
    "second_division",
    "third_division",
    "free_agent",
  ] as const;
  if (
    config.valuationCurves.qualityInterpolationExponentMilli <= 0
    || config.valuationCurves.prospectExpectation
      .uncertaintyDiscountBasisPointsPerHalfStar <= 0
    || config.valuationCurves.prospectExpectation
      .minimumUncertaintyMultiplierBasisPoints <= 0
    || marketKeys.some((key) =>
      config.valuationCurves.marketContext.multiplierBasisPoints[key] <= 0
      || config.valuationCurves.marketContext.maximumMinorUnits[key] <= 0
    )
  ) {
    throw new PlayerValuationError(
      "invalid_config",
      "valuation interpolation or market context is invalid",
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

function uncertaintyMultiplier(
  curves: ValuationCurvesConfig,
  lowerRating: PlayerStarRating,
  upperRating: PlayerStarRating,
): number {
  const halfStarWidth = Math.max(
    0,
    Math.round((upperRating - lowerRating) * 2),
  );
  return Math.max(
    curves.prospectExpectation.minimumUncertaintyMultiplierBasisPoints,
    10_000
      - halfStarWidth
        * curves.prospectExpectation.uncertaintyDiscountBasisPointsPerHalfStar,
  );
}

function broadPosition(
  position: Player["naturalPositions"][number],
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
