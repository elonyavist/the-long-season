import assert from "node:assert/strict";
import { test } from "vitest";

import type {
  MarketBehaviorCalibrationConfig,
  PlayerEconomyCalibrationVersionBundle,
  PlayerDevelopmentEnvironmentConfig,
  PlayerMarketDivisionTarget,
  ValuationCurvesConfig,
} from "./player-economy-calibration.ts";
import {
  PlayerPotentialProjectionPolicyError,
  validatePlayerPotentialProjectionPolicyConfig,
  validatePlayerDevelopmentEnvironmentConfig,
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
    playerDevelopmentEnvironmentVersion: "development-environment-v1",
  };

  assert.equal(Object.keys(versions).length, 8);
  assert.equal(versions.topologyDecisionId, "fictional-three-tier-v1");
});

test("development environment requires a complete ordered seven-state matrix", () => {
  const config: PlayerDevelopmentEnvironmentConfig = {
    schemaVersion: 1,
    version: "player-development-environment-v1",
    classification: "explicit_game_design_target",
    competitiveTierPolicyVersion: "club-competitive-tier-v1",
    positiveGrowthMultiplierBasisPointsByKey: {
      very_poor: 9_200,
      poor: 9_500,
      limited: 9_800,
      adequate: 10_000,
      good: 10_300,
      very_good: 10_600,
      excellent: 11_000,
    },
    environmentKeyByCategoryAndTier: {
      third_division: {
        survival: "very_poor",
        mid_table: "poor",
        playoff_contender: "limited",
        title_contender: "adequate",
      },
      second_division: {
        survival: "poor",
        mid_table: "limited",
        playoff_contender: "adequate",
        title_contender: "good",
      },
      first_division: {
        survival: "adequate",
        mid_table: "very_good",
        playoff_contender: "excellent",
        title_contender: "excellent",
      },
    },
  };

  assert.doesNotThrow(() => validatePlayerDevelopmentEnvironmentConfig(config));
  assert.throws(
    () => validatePlayerDevelopmentEnvironmentConfig({
      ...config,
      positiveGrowthMultiplierBasisPointsByKey: {
        ...config.positiveGrowthMultiplierBasisPointsByKey,
        good: 9_900,
      },
    }),
    /strict state order/,
  );
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

test("public-quality participation and AI bid spread remain separately versioned policies", () => {
  const expectation = {
    version: "prospect-expectation-v3",
    potentialProjectionPolicyVersion: "projection-v1",
    p50ParticipationBasisPoints: 5_000,
    upperOptionParticipationBasisPoints: 1_000,
  } satisfies ValuationCurvesConfig["prospectExpectation"];
  const offer = {
    version: "ai-transfer-offer-v1",
    minimumAskingBasisPoints: 7_000,
    maximumAskingBasisPoints: 10_000,
    askingBasisPointsStep: 500,
  } satisfies MarketBehaviorCalibrationConfig["aiTransferOffer"];

  assert.equal(expectation.potentialProjectionPolicyVersion, "projection-v1");
  assert.equal(
    expectation.upperOptionParticipationBasisPoints
      < expectation.p50ParticipationBasisPoints,
    true,
  );
  assert.equal(offer.minimumAskingBasisPoints < offer.maximumAskingBasisPoints, true);
});

test("AI risk appetite is explicit and exhaustive by club category", () => {
  const riskAppetite = {
    uncertaintyPenaltyWeight: 10,
    toleranceBasisPointsByCategory: {
      first_division: 8_000,
      second_division: 6_000,
      third_division: 4_000,
    },
  } satisfies MarketBehaviorCalibrationConfig["aiRiskAppetite"];

  assert.deepEqual(Object.keys(riskAppetite.toleranceBasisPointsByCategory), [
    "first_division",
    "second_division",
    "third_division",
  ]);
  assert.equal(
    riskAppetite.toleranceBasisPointsByCategory.first_division
      > riskAppetite.toleranceBasisPointsByCategory.third_division,
    true,
  );
});

test("valuation calibration exposes global intrinsic curves without owner context", () => {
  const intrinsicInputs = {
    qualityInterpolationExponentMilli: 2_000,
    positionMultipliers: {
      goalkeeper: 8_500,
      defender: 9_500,
      midfielder: 10_000,
      forward: 11_000,
    },
  } satisfies Pick<
    ValuationCurvesConfig,
    "qualityInterpolationExponentMilli" | "positionMultipliers"
  >;

  assert.equal("marketContext" in intrinsicInputs, false);
});

test("potential projection policy accepts ordered evidence-linked age bands", () => {
  assert.doesNotThrow(() =>
    validatePlayerPotentialProjectionPolicyConfig(projectionPolicyFixture())
  );
});

test("potential projection policy requires exact post-20 ages and strict narrowing until zero", () => {
  const policy = projectionPolicyFixture();
  assert.equal(
    policy.ageBandsByRoleFamily.outfield
      .filter(({ minimumAge }) => minimumAge > 20 && minimumAge < 28)
      .every(({ minimumAge, maximumAge }) => minimumAge === maximumAge),
    true,
  );
  assert.equal(
    policy.ageBandsByRoleFamily.goalkeeper
      .filter(({ minimumAge }) => minimumAge > 20 && minimumAge < 32)
      .every(({ minimumAge, maximumAge }) => minimumAge === maximumAge),
    true,
  );

  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        outfield: policy.ageBandsByRoleFamily.outfield.map((ageBand, index) =>
          index === 3
            ? {
                ...ageBand,
                upperRealizationBasisPoints:
                  policy.ageBandsByRoleFamily.outfield[2]!
                    .upperRealizationBasisPoints,
              }
            : ageBand
        ),
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "flat_post_twenty_realization_factors",
  );

  assert.doesNotThrow(() =>
    validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        outfield: policy.ageBandsByRoleFamily.outfield.map((ageBand, index) =>
          index === 3
            ? { ...ageBand, p50RealizationBasisPoints: 2_500 }
            : ageBand
        ),
      },
    })
  );
});

test("potential projection policy rejects invalid factors and widening public ranges per role", () => {
  const policy = projectionPolicyFixture();
  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        goalkeeper: [
          {
            ...policy.ageBandsByRoleFamily.goalkeeper[0]!,
            p50RealizationBasisPoints: 10_001,
          },
          ...policy.ageBandsByRoleFamily.goalkeeper.slice(1),
        ],
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
        outfield: policy.ageBandsByRoleFamily.outfield.map((ageBand, index) =>
          index === 3
            ? { ...ageBand, upperRealizationBasisPoints: 7_000 }
            : ageBand
        ),
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "widening_public_estimate_spread",
  );
});

test("potential projection policy freezes age bands and young/terminal upper contracts", () => {
  const policy = projectionPolicyFixture();
  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        goalkeeper: [
          ...policy.ageBandsByRoleFamily.goalkeeper.slice(0, 2),
          {
            ...policy.ageBandsByRoleFamily.goalkeeper[2]!,
            maximumAge: 22,
          },
          ...policy.ageBandsByRoleFamily.goalkeeper.slice(4),
        ],
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "invalid_age_band_contract",
  );
  assert.throws(
    () => validatePlayerPotentialProjectionPolicyConfig({
      ...policy,
      ageBandsByRoleFamily: {
        ...policy.ageBandsByRoleFamily,
        outfield: policy.ageBandsByRoleFamily.outfield.map((ageBand, index) =>
          index === 1
            ? { ...ageBand, upperRealizationBasisPoints: 9_000 }
            : ageBand
        ),
      },
    }),
    (error) =>
      error instanceof PlayerPotentialProjectionPolicyError
      && error.code === "invalid_public_upper_contract",
  );
});

function projectionPolicyFixture(): PlayerPotentialProjectionPolicyConfig {
  return {
    schemaVersion: 2,
    version: "test-potential-projection-v2",
    classification: "explicit_game_design_target",
    ageBandsByRoleFamily: {
      goalkeeper: [
        projectionBand(0, 17, 3_000, 10_000),
        projectionBand(18, 20, 2_500, 10_000),
        projectionBand(21, 21, 2_200, 8_000),
        projectionBand(22, 22, 2_000, 7_000),
        projectionBand(23, 23, 1_800, 6_000),
        projectionBand(24, 24, 1_600, 5_000),
        projectionBand(25, 25, 1_400, 4_000),
        projectionBand(26, 26, 1_200, 3_000),
        projectionBand(27, 27, 1_000, 2_000),
        projectionBand(28, 28, 800, 1_500),
        projectionBand(29, 29, 600, 1_000),
        projectionBand(30, 30, 400, 700),
        projectionBand(31, 31, 200, 300),
        projectionBand(32, 200, 0, 0),
      ],
      outfield: [
        projectionBand(0, 17, 4_000, 10_000),
        projectionBand(18, 20, 3_000, 10_000),
        projectionBand(21, 21, 2_000, 6_000),
        projectionBand(22, 22, 1_500, 5_000),
        projectionBand(23, 23, 1_000, 4_000),
        projectionBand(24, 24, 750, 3_000),
        projectionBand(25, 25, 500, 2_000),
        projectionBand(26, 26, 250, 1_000),
        projectionBand(27, 27, 0, 0),
        projectionBand(28, 200, 0, 0),
      ],
    },
  };
}

function projectionBand(
  minimumAge: number,
  maximumAge: number,
  p50RealizationBasisPoints: number,
  upperRealizationBasisPoints: number,
) {
  return {
    minimumAge,
    maximumAge,
    p50RealizationBasisPoints,
    upperRealizationBasisPoints,
  };
}
