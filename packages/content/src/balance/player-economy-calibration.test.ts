import assert from "node:assert/strict";
import { test } from "vitest";

import {
  askingPriceCurves,
  marketBehaviorCalibration,
  playerEconomyCalibration,
  playerMarketCalibration,
  playerPotentialProjectionPolicy,
  playerRatingScale,
  playerValuationConfig,
  selectAskingPriceCurves,
  selectMarketBehaviorCalibration,
  selectPlayerValuationConfig,
  selectPlayerPotentialProjectionPolicy,
  selectPlayerWagePolicyConfig,
  valuationCurves,
  wageFinanceCalibration,
} from "./player-economy-calibration.ts";

test("loads one cross-versioned immutable economy bundle from the six JSON assets", () => {
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
  assert.equal(marketBehaviorCalibration.aiTransferOffer.maximumAskingBasisPoints, 10_000);
  assert.equal(Object.isFrozen(wageFinanceCalibration.sourceBaselines[0]), true);
});

test("selects the derived potential policy only for the current beta bundle", () => {
  assert.equal(
    selectPlayerPotentialProjectionPolicy(playerEconomyCalibration.versions),
    playerPotentialProjectionPolicy,
  );
  assert.equal(playerPotentialProjectionPolicy.version, "player-potential-projection-v2");
  assert.deepEqual(
    playerPotentialProjectionPolicy.ageBandsByRoleFamily.outfield.map(
      ({
        conservativeRealizationBasisPoints,
        expectedRealizationBasisPoints,
        upperRealizationBasisPoints,
      }) => [
        conservativeRealizationBasisPoints,
        expectedRealizationBasisPoints,
        upperRealizationBasisPoints,
      ],
    ),
    [
      [0, 1_667, 3_076],
      [0, 878, 2_346],
      [0, 385, 1_095],
      [0, 142, 437],
      [0, 0, 22],
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
