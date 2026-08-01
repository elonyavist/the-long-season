import {
  CLUB_COMPETITIVE_TIER_POLICY_VERSION,
  type PlayerEconomyCalibrationVersionBundle,
  type PlayerDevelopmentEnvironmentConfig,
} from "@game/domain";

/**
 * Builds the complete seven-state development policy used by engine tests.
 *
 * Production composition roots inject the career-versioned content asset.
 * Keeping this fixture inside the engine package preserves that dependency
 * direction while still exercising every category/tier lookup.
 */
export function playerDevelopmentEnvironmentConfigFixture(): PlayerDevelopmentEnvironmentConfig {
  return {
    schemaVersion: 1,
    version: "player-development-environment:test-v1",
    classification: "explicit_game_design_target",
    competitiveTierPolicyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
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
        title_contender: "adequate",
        playoff_contender: "limited",
        mid_table: "poor",
        survival: "very_poor",
      },
      second_division: {
        title_contender: "good",
        playoff_contender: "adequate",
        mid_table: "limited",
        survival: "poor",
      },
      first_division: {
        title_contender: "excellent",
        playoff_contender: "excellent",
        mid_table: "very_good",
        survival: "adequate",
      },
    },
  };
}

/**
 * Builds a complete career version stamp aligned with the environment fixture.
 *
 * Unrelated policy versions remain explicit test identifiers so a fixture can
 * never look like a production calibration bundle by accident.
 */
export function playerDevelopmentCalibrationVersionsFixture(): PlayerEconomyCalibrationVersionBundle {
  return {
    topologyDecisionId: "fictional-three-tier:test-v1",
    playerRatingScaleVersion: "player-rating-scale:test-v1",
    playerMarketCalibrationVersion: "player-market-calibration:test-v1",
    valuationCurvesVersion: "valuation-curves:test-v1",
    askingPriceCurvesVersion: "asking-price-curves:test-v1",
    marketBehaviorCalibrationVersion: "market-behavior:test-v1",
    wageFinanceCalibrationVersion: "wage-finance:test-v1",
    playerDevelopmentEnvironmentVersion:
      playerDevelopmentEnvironmentConfigFixture().version,
  };
}
