import assert from "node:assert/strict";
import { test } from "vitest";

import askingPriceCurvesJson from "../balance/asking-price-curves.json" with { type: "json" };
import marketBehaviorCalibrationJson from "../balance/market-behavior-calibration.json" with { type: "json" };
import playerMarketCalibrationJson from "../balance/player-market-calibration.json" with { type: "json" };
import playerRatingScaleJson from "../balance/player-rating-scale.json" with { type: "json" };
import valuationCurvesJson from "../balance/valuation-curves.json" with { type: "json" };
import wageFinanceCalibrationJson from "../balance/wage-finance-calibration.json" with { type: "json" };
import playerDevelopmentEnvironmentJson from "../balance/player-development-environment.json" with { type: "json" };
import {
  PlayerEconomyCalibrationValidationError,
  parsePlayerEconomyCalibrationAssets,
  type RawPlayerEconomyCalibrationAssets,
} from "./player-economy-calibration.schema.ts";

test("accepts the seven reviewed assets through one boundary", () => {
  const result = parsePlayerEconomyCalibrationAssets(validAssets());

  assert.equal(result.valuationCurves.version, "valuation-curves-v5");
  assert.equal(
    result.askingPriceCurves.valuationCurvesVersion,
    result.valuationCurves.version,
  );
  assert.equal("marketContext" in result.valuationCurves, false);
  assert.deepEqual(result.valuationCurves.prospectExpectation, {
    version: "prospect-expectation-v3",
    potentialProjectionPolicyVersion:
      result.playerPotentialProjectionPolicy.version,
    p50ParticipationBasisPoints: 5_000,
    upperOptionParticipationBasisPoints: 1_000,
  });
  assert.equal(result.playerRatingScale.supportedRatings.length, 11);
  assert.equal(result.playerPotentialProjectionPolicy.ageBandsByRoleFamily.outfield.length, 10);
  assert.equal(result.playerPotentialProjectionPolicy.ageBandsByRoleFamily.goalkeeper.length, 14);
  assert.equal(result.playerMarketCalibration.divisionBaselines.length, 3);
  assert.equal(result.wageFinanceCalibration.sourceBaselines.length, 3);
  assert.equal(
    result.playerDevelopmentEnvironment.environmentKeyByCategoryAndTier.first_division
      .title_contender,
    "excellent",
  );
});

test("rejects incomplete and non-monotonic development-environment policies", () => {
  const incompleteAssets = validAssets();
  const incomplete = incompleteAssets.playerDevelopmentEnvironment as {
    positiveGrowthMultiplierBasisPointsByKey: Record<string, number>;
  };
  delete incomplete.positiveGrowthMultiplierBasisPointsByKey.very_poor;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(incompleteAssets),
    "schema validation failed",
  );

  const nonMonotonicAssets = validAssets();
  const nonMonotonic = nonMonotonicAssets.playerDevelopmentEnvironment as {
    positiveGrowthMultiplierBasisPointsByKey: Record<string, number>;
  };
  nonMonotonic.positiveGrowthMultiplierBasisPointsByKey.good = 9_900;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(nonMonotonicAssets),
    "development-environment policy validation failed",
  );
});

test("rejects malformed or widening potential-projection policy", () => {
  const gapAssets = validAssets();
  const gapRating = gapAssets.playerRatingScale as MutableRatingScale;
  gapRating.potentialProjectionPolicy.ageBandsByRoleFamily.outfield[1]!.minimumAge = 19;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(gapAssets),
    "potential-projection policy validation failed",
  );

  const wideningAssets = validAssets();
  const wideningRating = wideningAssets.playerRatingScale as MutableRatingScale;
  const wideningBands = wideningRating.potentialProjectionPolicy
    .ageBandsByRoleFamily.outfield;
  wideningBands[3]!.upperRealizationBasisPoints =
    wideningBands[2]!.upperRealizationBasisPoints + 1;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(wideningAssets),
    "potential-projection policy validation failed",
  );

  const flatAssets = validAssets();
  const flatRating = flatAssets.playerRatingScale as MutableRatingScale;
  const flatBands = flatRating.potentialProjectionPolicy
    .ageBandsByRoleFamily.outfield;
  flatBands[3]!.upperRealizationBasisPoints =
    flatBands[2]!.upperRealizationBasisPoints;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(flatAssets),
    "potential-projection policy validation failed",
  );
});

test("rejects unknown keys", () => {
  const assets = validAssets();
  assets.playerRatingScale = {
    ...(assets.playerRatingScale as object),
    undocumentedTarget: true,
  };

  assertValidationFailure(() => parsePlayerEconomyCalibrationAssets(assets), "schema validation failed");
});

test("rejects the removed owner-market valuation context", () => {
  const assets = validAssets();
  const valuation = assets.valuationCurves as Record<string, unknown>;
  valuation.marketContext = {
    multiplierBasisPoints: { first_division: 10_000 },
  };

  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(assets),
    "schema validation failed",
  );
});

test("rejects removed uncertainty fields and invalid public-quality participation", () => {
  const legacyAssets = validAssets();
  const legacyExpectation = (
    legacyAssets.valuationCurves as MutableValuationCurves
  ).prospectExpectation as unknown as Record<string, unknown>;
  legacyExpectation.uncertaintyDiscountBasisPointsPerHalfStar = 500;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(legacyAssets),
    "schema validation failed",
  );

  const zeroOptionAssets = validAssets();
  const zeroOptionExpectation = (
    zeroOptionAssets.valuationCurves as MutableValuationCurves
  ).prospectExpectation;
  zeroOptionExpectation.upperOptionParticipationBasisPoints = 0;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(zeroOptionAssets),
    "0 < upper option <= P50 < 10000",
  );

  const invertedAssets = validAssets();
  const invertedExpectation = (
    invertedAssets.valuationCurves as MutableValuationCurves
  ).prospectExpectation;
  invertedExpectation.upperOptionParticipationBasisPoints =
    invertedExpectation.p50ParticipationBasisPoints + 1;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(invertedAssets),
    "0 < upper option <= P50 < 10000",
  );

  const guaranteedP50Assets = validAssets();
  const guaranteedP50Expectation = (
    guaranteedP50Assets.valuationCurves as MutableValuationCurves
  ).prospectExpectation;
  guaranteedP50Expectation.p50ParticipationBasisPoints = 10_000;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(guaranteedP50Assets),
    "0 < upper option <= P50 < 10000",
  );
});

test("rejects exceptional-stock targets that drift between opening world and annual intake", () => {
  const targetAssets = validAssets();
  const rating = targetAssets.playerRatingScale as MutableRatingScale;
  rating.rarity.annualIntake.activeYoungStoredCeilingSixTargetMinimum = 3;

  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(targetAssets),
    "annual young stored-ceiling-six target must match initial national stock",
  );
});

test("rejects duplicate and non-monotonic thresholds", () => {
  const duplicateAssets = validAssets();
  const duplicateRating = duplicateAssets.playerRatingScale as MutableRatingScale;
  duplicateRating.abilityThresholds[1]!.minimumAbilityInclusive = 0;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(duplicateAssets),
    "ability thresholds contain duplicate values",
  );

  const nonMonotonicAssets = validAssets();
  const nonMonotonicAsking = nonMonotonicAssets.askingPriceCurves as MutableAskingPriceCurves;
  nonMonotonicAsking.contractDaysRemaining[2]!.maximumValueInclusive = 100;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(nonMonotonicAssets),
    "contract-day thresholds must be strictly increasing",
  );
});

test("rejects invalid money and percentile order", () => {
  const moneyAssets = validAssets();
  const moneyMarket = moneyAssets.playerMarketCalibration as MutablePlayerMarketCalibration;
  moneyMarket.competitionSamples[0]!.totalValueMinorUnits = -1;
  assertValidationFailure(() => parsePlayerEconomyCalibrationAssets(moneyAssets), "schema validation failed");

  const percentileAssets = validAssets();
  const percentileMarket = percentileAssets.playerMarketCalibration as MutablePlayerMarketCalibration;
  percentileMarket.divisionBaselines[0]!.distribution.p90MinorUnits = 1;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(percentileAssets),
    "invalid percentile order",
  );
});

test("rejects mismatched versions and incomplete division coverage", () => {
  const versionAssets = validAssets();
  const valuation = versionAssets.valuationCurves as { playerRatingScaleVersion: string };
  valuation.playerRatingScaleVersion = "other-rating-scale";
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(versionAssets),
    "valuation rating-scale version does not match",
  );
  const projectionVersionAssets = validAssets();
  const projectionValuation = projectionVersionAssets.valuationCurves as MutableValuationCurves;
  projectionValuation.prospectExpectation.potentialProjectionPolicyVersion =
    "other-projection";
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(projectionVersionAssets),
    "valuation potential-projection version does not match",
  );

  const coverageAssets = validAssets();
  const wage = coverageAssets.wageFinanceCalibration as MutableWageFinanceCalibration;
  wage.sourceBaselines.pop();
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(coverageAssets),
    "wage source baselines must contain the exact required values",
  );
});

test("rejects malformed prospect evidence and AI offer spreads", () => {
  const evidenceAssets = validAssets();
  const market = evidenceAssets.playerMarketCalibration as MutablePlayerMarketCalibration;
  market.prospectSamples[0]!.minimumAge = 21;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(evidenceAssets),
    "invalid prospect age range",
  );

  const offerAssets = validAssets();
  const behavior = offerAssets.marketBehaviorCalibration as MutableMarketBehavior;
  behavior.aiTransferOffer.askingBasisPointsStep = 700;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(offerAssets),
    "AI transfer-offer spread",
  );

  const counterAssets = validAssets();
  const counterBehavior =
    counterAssets.marketBehaviorCalibration as MutableMarketBehavior;
  counterBehavior.sellerNegotiation.counterOfferConcessionBasisPoints = 0;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(counterAssets),
    "seller counter concession",
  );

  const riskAssets = validAssets();
  const riskBehavior = riskAssets.marketBehaviorCalibration as MutableMarketBehavior;
  riskBehavior.aiRiskAppetite.toleranceBasisPointsByCategory.second_division = 9_000;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(riskAssets),
    "AI risk tolerance must not increase in lower divisions",
  );
});

test("locks the six-star anchor and hard cap to 150m EUR", () => {
  const capAssets = validAssets();
  const curves = capAssets.valuationCurves as MutableValuationCurves;
  curves.upperTail.hardCapMinorUnits = 149_000_000_00;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(capAssets),
    "hard cap must be exactly 150m",
  );

  const anchorAssets = validAssets();
  const anchorCurves = anchorAssets.valuationCurves as MutableValuationCurves;
  anchorCurves.ratingValueAnchors.at(-1)!.valueMinorUnits = 149_000_000_00;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(anchorAssets),
    "six-star anchor must equal",
  );
});

test("rejects wage policies with age gaps or decreasing potential premiums", () => {
  const ageAssets = validAssets();
  const ageWage = ageAssets.wageFinanceCalibration as MutableWageFinanceCalibration;
  ageWage.annualWagePolicy.ageMultipliers[1]!.minimumAge = 22;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(ageAssets),
    "wage age multipliers must be contiguous and ordered",
  );

  const premiumAssets = validAssets();
  const premiumWage = premiumAssets.wageFinanceCalibration as MutableWageFinanceCalibration;
  premiumWage.annualWagePolicy.potentialGapPremiums[1]!.premiumBasisPoints = -1;
  assertValidationFailure(
    () => parsePlayerEconomyCalibrationAssets(premiumAssets),
    "schema validation failed",
  );
});

function validAssets(): MutableCalibrationAssets {
  return structuredClone({
    playerRatingScale: playerRatingScaleJson,
    playerMarketCalibration: playerMarketCalibrationJson,
    valuationCurves: valuationCurvesJson,
    askingPriceCurves: askingPriceCurvesJson,
    marketBehaviorCalibration: marketBehaviorCalibrationJson,
    wageFinanceCalibration: wageFinanceCalibrationJson,
    playerDevelopmentEnvironment: playerDevelopmentEnvironmentJson,
  });
}

function assertValidationFailure(action: () => unknown, message: string): void {
  assert.throws(action, (error: unknown) =>
    error instanceof PlayerEconomyCalibrationValidationError && error.message.includes(message),
  );
}

interface MutableRatingScale {
  abilityThresholds: Array<{ minimumAbilityInclusive: number }>;
  rarity: {
    annualIntake: {
      activeYoungStoredCeilingSixTargetMinimum: number;
    };
  };
  potentialProjectionPolicy: {
    ageBandsByRoleFamily: {
      outfield: Array<{
        minimumAge: number;
        p50RealizationBasisPoints: number;
        upperRealizationBasisPoints: number;
      }>;
    };
  };
}

interface MutableAskingPriceCurves {
  contractDaysRemaining: Array<{ maximumValueInclusive: number }>;
}

interface MutablePlayerMarketCalibration {
  competitionSamples: Array<{ totalValueMinorUnits: number }>;
  prospectSamples: Array<{
    minimumAge: number;
    maximumAge: number;
  }>;
  divisionBaselines: Array<{
    distribution: { p90MinorUnits: number };
  }>;
}

interface MutableWageFinanceCalibration {
  sourceBaselines: unknown[];
  annualWagePolicy: {
    ageMultipliers: Array<{
      minimumAge: number;
      maximumAge: number;
      multiplierBasisPoints: number;
    }>;
    potentialGapPremiums: Array<{
      maximumGapStarsInclusive: number;
      premiumBasisPoints: number;
    }>;
  };
}

interface MutableValuationCurves {
  ratingValueAnchors: Array<{ valueMinorUnits: number }>;
  upperTail: { hardCapMinorUnits: number };
  prospectExpectation: {
    potentialProjectionPolicyVersion: string;
    p50ParticipationBasisPoints: number;
    upperOptionParticipationBasisPoints: number;
  };
}

interface MutableMarketBehavior {
  aiTransferOffer: { askingBasisPointsStep: number };
  sellerNegotiation: { counterOfferConcessionBasisPoints: number };
  aiRiskAppetite: {
    toleranceBasisPointsByCategory: {
      first_division: number;
      second_division: number;
      third_division: number;
    };
  };
}

type MutableCalibrationAssets = {
  -readonly [Key in keyof RawPlayerEconomyCalibrationAssets]: RawPlayerEconomyCalibrationAssets[Key];
};
