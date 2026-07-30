import assert from "node:assert/strict";
import { test } from "vitest";

import type {
  MarketBehaviorCalibrationConfig,
  PlayerEconomyCalibrationVersionBundle,
  PlayerMarketDivisionTarget,
  ValuationCurvesConfig,
} from "./player-economy-calibration.ts";
import {
  PlayerPotentialProjectionPolicyError,
  validatePlayerPotentialProjectionPolicyConfig,
  type PlayerPotentialProjectionPolicyConfig,
} from "./player-economy-calibration.ts";

/** Domain owns stable shapes and version references, never concrete tuning. */
test("calibration version bundle keeps every independent asset explicit", () => {
  const versions: PlayerEconomyCalibrationVersionBundle = {
    topologyDecisionId: "fictional-three-tier-v1",
    playerRatingScaleVersion: "rating-v1",
    playerMarketCalibrationVersion: "market-v1",
    valuationCurvesVersion: "valuation-v1",
    askingPriceCurvesVersion: "asking-v1",
    marketBehaviorCalibrationVersion: "behavior-v1",
    wageFinanceCalibrationVersion: "wage-v1",
  };

  assert.equal(Object.keys(versions).length, 7);
  assert.equal(versions.topologyDecisionId, "fictional-three-tier-v1");
});

test("market targets distinguish source-derived distributions from design tolerances", () => {
  const target: PlayerMarketDivisionTarget = {
    division: "third_division",
    classification: "explicit_game_design_target",
    distribution: {
      medianMinorUnits: 15_000_000,
      p90MinorUnits: 37_500_000,
      p99MinorUnits: 120_000_000,
      maximumMinorUnits: 350_000_000,
    },
    medianToleranceBasisPoints: 2_500,
    p90ToleranceBasisPoints: 3_000,
    p99ToleranceBasisPoints: 3_500,
    minimumMaximumMinorUnits: 150_000_000,
    maximumMaximumMinorUnits: 500_000_000,
  };

  assert.equal(target.classification, "explicit_game_design_target");
  assert.equal(target.distribution.medianMinorUnits < target.distribution.p90MinorUnits, true);
});

test("prospect expectation and AI bid spread remain separately versioned policies", () => {
  const expectation = {
    version: "prospect-expectation-v1",
    potentialProjectionPolicyVersion: "projection-v1",
    uncertaintyDiscountBasisPointsPerHalfStar: 500,
    minimumUncertaintyMultiplierBasisPoints: 6_000,
  } satisfies ValuationCurvesConfig["prospectExpectation"];
  const offer = {
    version: "ai-transfer-offer-v1",
    minimumAskingBasisPoints: 7_000,
    maximumAskingBasisPoints: 10_000,
    askingBasisPointsStep: 500,
  } satisfies MarketBehaviorCalibrationConfig["aiTransferOffer"];

  assert.equal(expectation.potentialProjectionPolicyVersion, "projection-v1");
  assert.equal(offer.minimumAskingBasisPoints < offer.maximumAskingBasisPoints, true);
});

test("potential projection policy accepts ordered evidence-linked age bands", () => {
  assert.doesNotThrow(() =>
    validatePlayerPotentialProjectionPolicyConfig(projectionPolicyFixture())
  );
});

test("potential projection policy rejects invalid factors and widening public ranges per role", () => {
  const policy = projectionPolicyFixture();
  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        goalkeeper: [{
          minimumAge: 0,
          maximumAge: 200,
          conservativeRealizationBasisPoints: 2_000,
          expectedRealizationBasisPoints: 1_000,
          upperRealizationBasisPoints: 3_000,
        }],
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "invalid_realization_factors",
  );
  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        outfield: [
          {
            minimumAge: 0,
            maximumAge: 17,
            conservativeRealizationBasisPoints: 900,
            expectedRealizationBasisPoints: 1_000,
            upperRealizationBasisPoints: 2_000,
          },
          {
            minimumAge: 18,
            maximumAge: 200,
            conservativeRealizationBasisPoints: 500,
            expectedRealizationBasisPoints: 800,
            upperRealizationBasisPoints: 2_000,
          },
        ],
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "widening_public_estimate_spread",
  );
  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        goalkeeper: [
          {
            minimumAge: 0,
            maximumAge: 17,
            conservativeRealizationBasisPoints: 600,
            expectedRealizationBasisPoints: 800,
            upperRealizationBasisPoints: 2_000,
          },
          {
            minimumAge: 18,
            maximumAge: 200,
            conservativeRealizationBasisPoints: 100,
            expectedRealizationBasisPoints: 700,
            upperRealizationBasisPoints: 2_000,
          },
        ],
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "widening_public_estimate_spread",
  );
});

function projectionPolicyFixture(): PlayerPotentialProjectionPolicyConfig {
  return {
    schemaVersion: 1,
    version: "test-potential-projection-v1",
    classification: "explicit_game_design_target",
    ageBandsByRoleFamily: {
      goalkeeper: [{
        minimumAge: 0,
        maximumAge: 200,
        conservativeRealizationBasisPoints: 600,
        expectedRealizationBasisPoints: 800,
        upperRealizationBasisPoints: 3_000,
      }],
      outfield: [
        {
          minimumAge: 0,
          maximumAge: 17,
          conservativeRealizationBasisPoints: 900,
          expectedRealizationBasisPoints: 1_400,
          upperRealizationBasisPoints: 4_000,
        },
        {
          minimumAge: 18,
          maximumAge: 200,
          conservativeRealizationBasisPoints: 500,
          expectedRealizationBasisPoints: 800,
          upperRealizationBasisPoints: 3_000,
        },
      ],
    },
  };
}
