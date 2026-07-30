import type { PlayerWagePolicyConfig } from "@game/domain";

import { playerValuationConfigFixture } from "./player-valuation-config.ts";

/**
 * Builds compact explicit wage/contract content for isolated engine tests.
 *
 * Production composition roots inject schema-validated content. Engine tests
 * retain an equivalent local fixture to preserve the package boundary.
 */
export function playerWagePolicyConfigFixture(): PlayerWagePolicyConfig {
  return {
    ratingScale: playerValuationConfigFixture().ratingScale,
    wageFinanceCalibration: {
      schemaVersion: 1,
      version: "wage-finance:test",
      classification: "mixed",
      retrievedAt: "2026-07-28T00:00:00+02:00",
      timeZone: "Europe/Rome",
      currency: "EUR",
      sourceReferences: [{
        id: "test-source",
        title: "Test source",
        url: "https://example.invalid/test-source",
        classification: "observed_source_fact",
      }],
      sourceBaselines: [
        sourceBaseline("first_division"),
        sourceBaseline("second_division"),
        sourceBaseline("third_division"),
      ],
      gameDesignTargets: [
        divisionTarget("first_division", 6_000_000_000, 9_000_000_000, 14_000_000_000),
        divisionTarget("second_division", 1_000_000_000, 1_600_000_000, 2_500_000_000),
        divisionTarget("third_division", 200_000_000, 300_000_000, 450_000_000),
      ],
      openingBudgetRoundingMinorUnits: 1_000_000,
      annualWageByRating: [
        { rating: 1, annualWageMinorUnits: 3_000_000 },
        { rating: 1.5, annualWageMinorUnits: 5_000_000 },
        { rating: 2, annualWageMinorUnits: 8_000_000 },
        { rating: 2.5, annualWageMinorUnits: 14_000_000 },
        { rating: 3, annualWageMinorUnits: 25_000_000 },
        { rating: 3.5, annualWageMinorUnits: 50_000_000 },
        { rating: 4, annualWageMinorUnits: 120_000_000 },
        { rating: 4.5, annualWageMinorUnits: 250_000_000 },
        { rating: 5, annualWageMinorUnits: 500_000_000 },
        { rating: 5.5, annualWageMinorUnits: 1_000_000_000 },
        { rating: 6, annualWageMinorUnits: 1_800_000_000 },
      ],
      annualWagePolicy: {
        roundingMinorUnits: 10_000,
        divisionMultipliers: {
          first_division: 10_000,
          second_division: 8_500,
          third_division: 7_000,
        },
        squadStatusMultipliers: {
          key_player: 13_500,
          regular_starter: 11_500,
          squad_player: 9_000,
          fringe_player: 7_000,
          prospect: 6_000,
        },
        ageMultipliers: [
          { minimumAge: 15, maximumAge: 20, multiplierBasisPoints: 8_500 },
          { minimumAge: 21, maximumAge: 23, multiplierBasisPoints: 10_000 },
          { minimumAge: 24, maximumAge: 29, multiplierBasisPoints: 10_500 },
          { minimumAge: 30, maximumAge: 32, multiplierBasisPoints: 9_500 },
          { minimumAge: 33, maximumAge: 45, multiplierBasisPoints: 8_000 },
        ],
        potentialPremiumMaximumAge: 23,
        potentialGapPremiums: [
          { maximumGapStarsInclusive: 0, premiumBasisPoints: 0 },
          { maximumGapStarsInclusive: 0.5, premiumBasisPoints: 500 },
          { maximumGapStarsInclusive: 1, premiumBasisPoints: 1_000 },
          { maximumGapStarsInclusive: 2, premiumBasisPoints: 1_800 },
          { maximumGapStarsInclusive: 3, premiumBasisPoints: 2_500 },
          { maximumGapStarsInclusive: 5, premiumBasisPoints: 3_000 },
        ],
        freeAgentMultiplierBasisPoints: 11_200,
        longContractMinimumDaysExclusive: 730,
        longContractMultiplierBasisPoints: 10_800,
        currentWageFloorAgeMultipliers: [
          { minimumAge: 15, maximumAge: 24, multiplierBasisPoints: 11_200 },
          { minimumAge: 25, maximumAge: 32, multiplierBasisPoints: 10_600 },
          { minimumAge: 33, maximumAge: 45, multiplierBasisPoints: 10_000 },
        ],
      },
      contractTermsPolicy: {
        preferredDuration: {
          highPotentialMaximumAge: 20,
          highPotentialMinimumGapStars: 1.5,
          highPotentialYears: 5,
          youngMaximumAge: 23,
          youngYears: 4,
          primeMaximumAge: 27,
          primeYears: 3,
          matureMaximumAge: 31,
          matureYears: 2,
          veteranYears: 1,
          minimumDurationReductionYears: 1,
        },
        minimumWageMultiplierBasisPoints: 9_000,
        minimumBonusMultiplierBasisPoints: 8_000,
        bonuses: {
          annualAppearanceDivisor: 110,
          signingBonusBasisPoints: {
            key_player: 1_400,
            regular_starter: 1_000,
            squad_player: 600,
            fringe_player: 600,
            prospect: 600,
          },
          goalBonusMultiplierBasisPoints: 14_000,
          defensiveCleanSheetMultiplierBasisPoints: 10_000,
          roundingMinorUnits: 100,
          signingRoundingMinorUnits: 1_000,
        },
      },
    },
  };
}

function sourceBaseline(division: "first_division" | "second_division" | "third_division") {
  return {
    division,
    classification: "observed_source_fact" as const,
    sourceReferenceId: "test-source",
    sourceSeason: "2023/24",
    sampleClubCount: 18,
    populationClubCount: 18,
    valueOfProductionPerClubMinorUnits: 1_000_000_000,
    employeeCostPerClubMinorUnits: 700_000_000,
    employeeCostToProductionBasisPoints: 7_000,
    approximate: false,
  };
}

function divisionTarget(
  division: "first_division" | "second_division" | "third_division",
  minimum: number,
  median: number,
  maximum: number,
) {
  return {
    division,
    classification: "explicit_game_design_target" as const,
    annualSeniorWageBudgetMinimumMinorUnits: minimum,
    annualSeniorWageBudgetMedianMinorUnits: median,
    annualSeniorWageBudgetMaximumMinorUnits: maximum,
    targetCommittedWageMinimumBasisPoints: 7_000,
    targetCommittedWageMaximumBasisPoints: 9_500,
  };
}
