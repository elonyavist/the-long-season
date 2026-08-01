import assert from "node:assert/strict";
import { test } from "vitest";

import {
  askingPriceCurves,
  marketBehaviorCalibration,
  playerDevelopmentEnvironment,
  playerEconomyCalibration,
  playerMarketCalibration,
  playerPotentialProjectionPolicy,
  playerRatingScale,
  playerValuationConfig,
  selectAskingPriceCurves,
  selectMarketBehaviorCalibration,
  selectPlayerValuationConfig,
  selectPlayerPotentialProjectionPolicy,
  selectPlayerDevelopmentEnvironmentConfig,
  selectPlayerWagePolicyConfig,
  valuationCurves,
  wageFinanceCalibration,
} from "./player-economy-calibration.ts";

test("loads one cross-versioned immutable economy bundle from the seven JSON assets", () => {
  assert.equal(
    playerEconomyCalibration.versions.topologyDecisionId,
    "fictional-three-tier-v1",
  );
  assert.equal(playerEconomyCalibration.versions.playerRatingScaleVersion, playerRatingScale.version);
  assert.equal(playerEconomyCalibration.versions.playerMarketCalibrationVersion, playerMarketCalibration.version);
  assert.equal(playerEconomyCalibration.versions.valuationCurvesVersion, valuationCurves.version);
  assert.equal(playerEconomyCalibration.versions.askingPriceCurvesVersion, askingPriceCurves.version);
  assert.equal(
    playerEconomyCalibration.versions.marketBehaviorCalibrationVersion,
    marketBehaviorCalibration.version,
  );
  assert.equal(
    playerEconomyCalibration.versions.wageFinanceCalibrationVersion,
    wageFinanceCalibration.version,
  );
  assert.equal(
    playerEconomyCalibration.versions.playerDevelopmentEnvironmentVersion,
    playerDevelopmentEnvironment.version,
  );
  assert.equal(Object.isFrozen(playerEconomyCalibration), true);
  assert.equal(Object.isFrozen(playerRatingScale.abilityThresholds), true);
  assert.equal(Object.isFrozen(playerValuationConfig), true);
  assert.equal(Object.isFrozen(playerPotentialProjectionPolicy), true);
  assert.equal(playerMarketCalibration.prospectSamples.length, 10);
  assert.equal(
    playerValuationConfig.potentialProjectionPolicy,
    playerPotentialProjectionPolicy,
  );
  assert.equal(
    valuationCurves.prospectExpectation.potentialProjectionPolicyVersion,
    playerPotentialProjectionPolicy.version,
  );
  assert.equal(valuationCurves.version, "valuation-curves-v5");
  assert.deepEqual(valuationCurves.prospectExpectation, {
    version: "prospect-expectation-v3",
    potentialProjectionPolicyVersion: playerPotentialProjectionPolicy.version,
    p50ParticipationBasisPoints: 5_000,
    upperOptionParticipationBasisPoints: 1_000,
  });
  assert.equal(askingPriceCurves.valuationCurvesVersion, valuationCurves.version);
  assert.equal(askingPriceCurves.version, "asking-price-curves-v4");
  assert.equal("marketContext" in valuationCurves, false);
  assert.equal("uncertaintyDiscountBasisPointsPerHalfStar" in valuationCurves.prospectExpectation, false);
  assert.equal("minimumUncertaintyMultiplierBasisPoints" in valuationCurves.prospectExpectation, false);
  assert.equal(marketBehaviorCalibration.version, "market-behavior-calibration-v5");
  assert.equal(
    marketBehaviorCalibration.askingPriceCurvesVersion,
    askingPriceCurves.version,
  );
  assert.equal(marketBehaviorCalibration.aiTransferOffer.maximumAskingBasisPoints, 10_000);
  assert.deepEqual(marketBehaviorCalibration.aiRiskAppetite, {
    uncertaintyPenaltyWeight: 10,
    toleranceBasisPointsByCategory: {
      first_division: 8_000,
      second_division: 6_000,
      third_division: 4_000,
    },
  });
  assert.equal(Object.isFrozen(wageFinanceCalibration.sourceBaselines[0]), true);
  assert.equal(Object.isFrozen(marketBehaviorCalibration.aiRiskAppetite), true);
  assert.equal(Object.isFrozen(playerDevelopmentEnvironment), true);
});

test("selects the exact career-stamped seven-state development environment", () => {
  assert.equal(
    selectPlayerDevelopmentEnvironmentConfig(playerEconomyCalibration.versions),
    playerDevelopmentEnvironment,
  );
  assert.deepEqual(
    playerDevelopmentEnvironment.positiveGrowthMultiplierBasisPointsByKey,
    {
      very_poor: 9_200,
      poor: 9_500,
      limited: 9_800,
      adequate: 10_000,
      good: 10_300,
      very_good: 10_600,
      excellent: 11_000,
    },
  );
  assert.throws(
    () => selectPlayerDevelopmentEnvironmentConfig({
      ...playerEconomyCalibration.versions,
      playerDevelopmentEnvironmentVersion: "unknown",
    }),
    /unsupported/,
  );
  assert.throws(() => selectPlayerDevelopmentEnvironmentConfig(undefined), /unsupported/);
});

test("selects the derived potential policy only for the current beta bundle", () => {
  assert.equal(
    selectPlayerPotentialProjectionPolicy(playerEconomyCalibration.versions),
    playerPotentialProjectionPolicy,
  );
  assert.equal(playerRatingScale.version, "player-rating-scale-v7");
  assert.deepEqual(playerRatingScale.rarity.initialWorld, {
    establishedCurrentSixMinimum: 2,
    establishedCurrentSixMaximum: 3,
    youngStoredCeilingSixMinimum: 4,
    youngStoredCeilingSixMaximum: 5,
    lowerDivisionYoungStoredCeilingSixMaximum: 1,
    youngStoredCeilingSixPerClubMaximum: 1,
  });
  assert.equal(playerPotentialProjectionPolicy.version, "player-potential-projection-v4");
  assert.deepEqual(
    playerPotentialProjectionPolicy.ageBandsByRoleFamily.outfield.map(
      ({
        minimumAge,
        maximumAge,
        p50RealizationBasisPoints,
        upperRealizationBasisPoints,
      }) => [
        minimumAge,
        maximumAge,
        p50RealizationBasisPoints,
        upperRealizationBasisPoints,
      ],
    ),
    [
      [0, 17, 3_034, 10_000],
      [18, 20, 2_200, 10_000],
      [21, 21, 1_196, 2_823],
      [22, 22, 716, 2_111],
      [23, 23, 483, 1_405],
      [24, 24, 219, 653],
      [25, 25, 71, 249],
      [26, 26, 0, 55],
      [27, 27, 0, 0],
      [28, 200, 0, 0],
    ],
  );
  assert.deepEqual(
    playerPotentialProjectionPolicy.ageBandsByRoleFamily.goalkeeper.map(
      ({
        minimumAge,
        maximumAge,
        p50RealizationBasisPoints,
        upperRealizationBasisPoints,
      }) => [
        minimumAge,
        maximumAge,
        p50RealizationBasisPoints,
        upperRealizationBasisPoints,
      ],
    ),
    [
      [0, 17, 2_215, 10_000],
      [18, 20, 2_050, 10_000],
      [21, 21, 1_715, 3_713],
      [22, 22, 1_466, 3_272],
      [23, 23, 1_185, 2_553],
      [24, 24, 810, 1_894],
      [25, 25, 397, 1_100],
      [26, 26, 278, 756],
      [27, 27, 149, 372],
      [28, 28, 0, 0],
      [29, 29, 0, 0],
      [30, 30, 0, 0],
      [31, 31, 0, 0],
      [32, 200, 0, 0],
    ],
  );
  assert.throws(
    () => selectPlayerPotentialProjectionPolicy({
      ...playerEconomyCalibration.versions,
      playerRatingScaleVersion: "player-rating-scale-v1",
    }),
    /unsupported/,
  );
  assert.throws(() => selectPlayerPotentialProjectionPolicy(undefined), /unsupported/);
});

test("selects public-value content only for the exact career-stamped versions", () => {
  assert.equal(
    selectPlayerValuationConfig(playerEconomyCalibration.versions),
    playerValuationConfig,
  );
  assert.throws(
    () => selectPlayerValuationConfig({
      ...playerEconomyCalibration.versions,
      valuationCurvesVersion: "valuation-curves:unknown",
    }),
    /unsupported/,
  );
  assert.throws(() => selectPlayerValuationConfig(undefined), /unsupported/);
});

test("selects asking-price content only for the exact career-stamped versions", () => {
  assert.equal(
    selectAskingPriceCurves(playerEconomyCalibration.versions),
    askingPriceCurves,
  );
  assert.throws(
    () => selectAskingPriceCurves({
      ...playerEconomyCalibration.versions,
      askingPriceCurvesVersion: "asking-price-curves:unknown",
    }),
    /unsupported/,
  );
  assert.throws(() => selectAskingPriceCurves(undefined), /unsupported/);
});

test("selects market behavior only for the exact linked career versions", () => {
  assert.equal(
    selectMarketBehaviorCalibration(playerEconomyCalibration.versions),
    marketBehaviorCalibration,
  );
  assert.throws(
    () => selectMarketBehaviorCalibration({
      ...playerEconomyCalibration.versions,
      marketBehaviorCalibrationVersion: "market-behavior:unknown",
    }),
    /unsupported/,
  );
  assert.throws(
    () => selectMarketBehaviorCalibration({
      ...playerEconomyCalibration.versions,
      askingPriceCurvesVersion: "asking-price-curves:unknown",
    }),
    /unsupported/,
  );
  assert.throws(() => selectMarketBehaviorCalibration(undefined), /unsupported/);
});

test("selects the explicit wage policy only for the exact career-stamped versions", () => {
  assert.equal(
    selectPlayerWagePolicyConfig(playerEconomyCalibration.versions).wageFinanceCalibration,
    wageFinanceCalibration,
  );
  assert.throws(
    () => selectPlayerWagePolicyConfig({
      ...playerEconomyCalibration.versions,
      wageFinanceCalibrationVersion: "wage-finance:unknown",
    }),
    /unsupported/,
  );
  assert.throws(() => selectPlayerWagePolicyConfig(undefined), /unsupported/);
});

test("keeps source facts, derived aggregates, and reviewed design targets explicit", () => {
  assert.equal(playerMarketCalibration.classification, "mixed");
  assert.equal(playerMarketCalibration.competitionSamples[0]?.classification, "observed_source_fact");
  assert.equal(playerMarketCalibration.divisionBaselines[0]?.classification, "derived_aggregate");
  assert.equal(playerMarketCalibration.gameDesignTargets[0]?.classification, "explicit_game_design_target");
  assert.equal(playerMarketCalibration.prospectSamples[0]?.classification, "observed_source_fact");
  assert.equal(marketBehaviorCalibration.classification, "explicit_game_design_target");
  assert.equal(wageFinanceCalibration.classification, "mixed");
  assert.equal(
    selectPlayerWagePolicyConfig(playerEconomyCalibration.versions).ratingScale,
    playerRatingScale,
  );
});
