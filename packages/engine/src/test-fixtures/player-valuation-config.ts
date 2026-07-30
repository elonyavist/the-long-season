import type { PlayerValuationConfig } from "../market/player-valuation.ts";

/**
 * Builds compact version-linked valuation content for isolated engine tests.
 *
 * Production composition roots always inject validated content assets. Tests
 * use this deliberately small fixture so engine packages do not import content.
 */
export function playerValuationConfigFixture(): PlayerValuationConfig {
  return {
    ratingScale: {
      version: "rating-v1",
      abilityThresholds: [
        { minimumAbilityInclusive: 0, rating: 1 },
        { minimumAbilityInclusive: 6.5, rating: 1.5 },
        { minimumAbilityInclusive: 7.5, rating: 2 },
        { minimumAbilityInclusive: 8.5, rating: 2.5 },
        { minimumAbilityInclusive: 9.5, rating: 3 },
        { minimumAbilityInclusive: 12.5, rating: 3.5 },
        { minimumAbilityInclusive: 14.5, rating: 4 },
        { minimumAbilityInclusive: 15.5, rating: 4.5 },
        { minimumAbilityInclusive: 16, rating: 5 },
        { minimumAbilityInclusive: 16.5, rating: 5.5 },
        { minimumAbilityInclusive: 17, rating: 6 },
      ],
    } as unknown as PlayerValuationConfig["ratingScale"],
    potentialProjectionPolicy: {
      schemaVersion: 1,
      version: "projection-v1",
      classification: "explicit_game_design_target",
      ageBandsByRoleFamily: {
        goalkeeper: [
          {
            minimumAge: 0,
            maximumAge: 17,
            conservativeRealizationBasisPoints: 600,
            expectedRealizationBasisPoints: 800,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 18,
            maximumAge: 20,
            conservativeRealizationBasisPoints: 600,
            expectedRealizationBasisPoints: 700,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 21,
            maximumAge: 22,
            conservativeRealizationBasisPoints: 400,
            expectedRealizationBasisPoints: 500,
            upperRealizationBasisPoints: 9_800,
          },
          {
            minimumAge: 23,
            maximumAge: 24,
            conservativeRealizationBasisPoints: 300,
            expectedRealizationBasisPoints: 400,
            upperRealizationBasisPoints: 9_700,
          },
          {
            minimumAge: 25,
            maximumAge: 27,
            conservativeRealizationBasisPoints: 100,
            expectedRealizationBasisPoints: 100,
            upperRealizationBasisPoints: 9_500,
          },
          {
            minimumAge: 28,
            maximumAge: 200,
            conservativeRealizationBasisPoints: 0,
            expectedRealizationBasisPoints: 0,
            upperRealizationBasisPoints: 9_400,
          },
        ],
        outfield: [
          {
            minimumAge: 0,
            maximumAge: 17,
            conservativeRealizationBasisPoints: 900,
            expectedRealizationBasisPoints: 1_400,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 18,
            maximumAge: 20,
            conservativeRealizationBasisPoints: 500,
            expectedRealizationBasisPoints: 800,
            upperRealizationBasisPoints: 9_600,
          },
          {
            minimumAge: 21,
            maximumAge: 22,
            conservativeRealizationBasisPoints: 200,
            expectedRealizationBasisPoints: 200,
            upperRealizationBasisPoints: 9_300,
          },
          {
            minimumAge: 23,
            maximumAge: 24,
            conservativeRealizationBasisPoints: 100,
            expectedRealizationBasisPoints: 100,
            upperRealizationBasisPoints: 9_200,
          },
          {
            minimumAge: 25,
            maximumAge: 200,
            conservativeRealizationBasisPoints: 0,
            expectedRealizationBasisPoints: 0,
            upperRealizationBasisPoints: 9_100,
          },
        ],
      },
    },
    marketCalibration: {
      version: "market-v1",
    } as PlayerValuationConfig["marketCalibration"],
    valuationCurves: {
      version: "valuation-v1",
      playerRatingScaleVersion: "rating-v1",
      playerMarketCalibrationVersion: "market-v1",
      qualityInterpolationExponentMilli: 2_000,
      ratingValueAnchors: [
        { rating: 1, valueMinorUnits: 2_500_000 },
        { rating: 1.5, valueMinorUnits: 7_500_000 },
        { rating: 2, valueMinorUnits: 15_000_000 },
        { rating: 2.5, valueMinorUnits: 30_000_000 },
        { rating: 3, valueMinorUnits: 60_000_000 },
        { rating: 3.5, valueMinorUnits: 150_000_000 },
        { rating: 4, valueMinorUnits: 400_000_000 },
        { rating: 4.5, valueMinorUnits: 1_000_000_000 },
        { rating: 5, valueMinorUnits: 2_300_000_000 },
        { rating: 5.5, valueMinorUnits: 5_000_000_000 },
        { rating: 6, valueMinorUnits: 15_000_000_000 },
      ],
      ageMultipliers: [
        { minimumAge: 15, maximumAge: 18, multiplierBasisPoints: 10_500 },
        { minimumAge: 19, maximumAge: 21, multiplierBasisPoints: 12_000 },
        { minimumAge: 22, maximumAge: 25, multiplierBasisPoints: 12_500 },
        { minimumAge: 26, maximumAge: 29, multiplierBasisPoints: 11_000 },
        { minimumAge: 30, maximumAge: 32, multiplierBasisPoints: 8_500 },
        { minimumAge: 33, maximumAge: 35, multiplierBasisPoints: 6_000 },
        { minimumAge: 36, maximumAge: 45, multiplierBasisPoints: 3_500 },
      ],
      prospectExpectation: {
        version: "prospect-expectation-v1",
        potentialProjectionPolicyVersion: "projection-v1",
        uncertaintyDiscountBasisPointsPerHalfStar: 500,
        minimumUncertaintyMultiplierBasisPoints: 6_000,
      },
      positionMultipliers: {
        goalkeeper: 8_500,
        defender: 9_500,
        midfielder: 10_000,
        forward: 11_000,
      },
      marketContext: {
        multiplierBasisPoints: {
          first_division: 22_000,
          second_division: 10_000,
          third_division: 8_500,
          free_agent: 10_000,
        },
        maximumMinorUnits: {
          first_division: 15_000_000_000,
          second_division: 1_800_000_000,
          third_division: 500_000_000,
          free_agent: 15_000_000_000,
        },
      },
      upperTail: {
        compressionStartsMinorUnits: 8_000_000_000,
        compressionBasisPoints: 2_500,
        hardCapMinorUnits: 15_000_000_000,
        hardCapMaximumAge: 25,
        hardCapRequiredRating: 6,
      },
    } as unknown as PlayerValuationConfig["valuationCurves"],
  };
}
