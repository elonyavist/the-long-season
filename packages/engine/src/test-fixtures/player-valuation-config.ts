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
      schemaVersion: 2,
      version: "projection-fixture-v2",
      classification: "explicit_game_design_target",
      ageBandsByRoleFamily: {
        goalkeeper: [
          {
            minimumAge: 0,
            maximumAge: 17,
            p50RealizationBasisPoints: 800,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 18,
            maximumAge: 20,
            p50RealizationBasisPoints: 700,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 21,
            maximumAge: 21,
            p50RealizationBasisPoints: 650,
            upperRealizationBasisPoints: 9_500,
          },
          {
            minimumAge: 22,
            maximumAge: 22,
            p50RealizationBasisPoints: 600,
            upperRealizationBasisPoints: 9_000,
          },
          {
            minimumAge: 23,
            maximumAge: 23,
            p50RealizationBasisPoints: 550,
            upperRealizationBasisPoints: 8_500,
          },
          {
            minimumAge: 24,
            maximumAge: 24,
            p50RealizationBasisPoints: 500,
            upperRealizationBasisPoints: 8_000,
          },
          {
            minimumAge: 25,
            maximumAge: 25,
            p50RealizationBasisPoints: 450,
            upperRealizationBasisPoints: 7_000,
          },
          {
            minimumAge: 26,
            maximumAge: 26,
            p50RealizationBasisPoints: 350,
            upperRealizationBasisPoints: 6_000,
          },
          {
            minimumAge: 27,
            maximumAge: 27,
            p50RealizationBasisPoints: 250,
            upperRealizationBasisPoints: 5_000,
          },
          {
            minimumAge: 28,
            maximumAge: 28,
            p50RealizationBasisPoints: 200,
            upperRealizationBasisPoints: 3_500,
          },
          {
            minimumAge: 29,
            maximumAge: 29,
            p50RealizationBasisPoints: 150,
            upperRealizationBasisPoints: 3_000,
          },
          {
            minimumAge: 30,
            maximumAge: 30,
            p50RealizationBasisPoints: 100,
            upperRealizationBasisPoints: 2_500,
          },
          {
            minimumAge: 31,
            maximumAge: 31,
            p50RealizationBasisPoints: 50,
            upperRealizationBasisPoints: 2_000,
          },
          {
            minimumAge: 32,
            maximumAge: 200,
            p50RealizationBasisPoints: 0,
            upperRealizationBasisPoints: 0,
          },
        ],
        outfield: [
          {
            minimumAge: 0,
            maximumAge: 17,
            p50RealizationBasisPoints: 1_400,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 18,
            maximumAge: 20,
            p50RealizationBasisPoints: 800,
            upperRealizationBasisPoints: 10_000,
          },
          {
            minimumAge: 21,
            maximumAge: 21,
            p50RealizationBasisPoints: 500,
            upperRealizationBasisPoints: 6_900,
          },
          {
            minimumAge: 22,
            maximumAge: 22,
            p50RealizationBasisPoints: 400,
            upperRealizationBasisPoints: 6_600,
          },
          {
            minimumAge: 23,
            maximumAge: 23,
            p50RealizationBasisPoints: 300,
            upperRealizationBasisPoints: 6_300,
          },
          {
            minimumAge: 24,
            maximumAge: 24,
            p50RealizationBasisPoints: 200,
            upperRealizationBasisPoints: 6_000,
          },
          {
            minimumAge: 25,
            maximumAge: 25,
            p50RealizationBasisPoints: 150,
            upperRealizationBasisPoints: 3_500,
          },
          {
            minimumAge: 26,
            maximumAge: 26,
            p50RealizationBasisPoints: 100,
            upperRealizationBasisPoints: 3_000,
          },
          {
            minimumAge: 27,
            maximumAge: 27,
            p50RealizationBasisPoints: 50,
            upperRealizationBasisPoints: 2_500,
          },
          {
            minimumAge: 28,
            maximumAge: 200,
            p50RealizationBasisPoints: 0,
            upperRealizationBasisPoints: 0,
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
        version: "prospect-expectation:test-v2",
        potentialProjectionPolicyVersion: "projection-fixture-v2",
        p50ParticipationBasisPoints: 5_000,
        upperOptionParticipationBasisPoints: 1_000,
      },
      positionMultipliers: {
        goalkeeper: 8_500,
        defender: 9_500,
        midfielder: 10_000,
        forward: 11_000,
      },
      upperTail: {
        compressionStartsMinorUnits: 8_000_000_000,
        compressionBasisPoints: 5_600,
        hardCapMinorUnits: 15_000_000_000,
        hardCapMaximumAge: 25,
        hardCapRequiredRating: 6,
      },
    } as unknown as PlayerValuationConfig["valuationCurves"],
  };
}
