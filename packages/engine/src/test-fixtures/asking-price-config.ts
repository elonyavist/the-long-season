import type { AskingPriceCurvesConfig } from "@game/domain";

/**
 * Explicit deterministic asking-price content for engine tests.
 *
 * Tests keep this fixture inside the engine package so production code and test
 * compilation both preserve the engine-to-content dependency boundary.
 */
export function askingPriceConfigFixture(): AskingPriceCurvesConfig {
  return {
    schemaVersion: 1,
    version: "asking-price-curves:test",
    classification: "explicit_game_design_target",
    valuationCurvesVersion: "valuation-curves:test",
    contractDaysRemaining: [
      { maximumValueInclusive: 0, multiplierBasisPoints: 6_500 },
      { maximumValueInclusive: 183, multiplierBasisPoints: 7_500 },
      { maximumValueInclusive: 365, multiplierBasisPoints: 8_500 },
      { maximumValueInclusive: 730, multiplierBasisPoints: 10_000 },
      { maximumValueInclusive: 1_095, multiplierBasisPoints: 11_250 },
      { maximumValueInclusive: 1_460, multiplierBasisPoints: 12_000 },
      { maximumValueInclusive: 3_650, multiplierBasisPoints: 13_000 },
    ],
    squadStatusMultipliers: {
      key_player: 14_000,
      starter: 12_000,
      rotation: 10_000,
      prospect: 11_500,
      surplus: 8_000,
    },
    replacementNeedMultipliers: {
      covered: 10_000,
      thin: 11_500,
      critical: 14_000,
    },
    sellerPressureMultipliers: {
      healthy: 10_000,
      strained: 9_000,
      must_sell: 7_500,
    },
    playerDesireMultipliers: {
      content: 10_000,
      open_to_move: 9_000,
      wants_exit: 8_000,
    },
    finalMultiplierMinimumBasisPoints: 5_000,
    finalMultiplierMaximumBasisPoints: 18_000,
    freeAgentTransferFeeMinorUnits: 0,
  };
}
