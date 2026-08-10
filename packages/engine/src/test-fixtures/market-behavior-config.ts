import type { MarketBehaviorCalibrationConfig } from "@game/domain";

/**
 * Explicit compact market-behavior policy for engine unit tests.
 *
 * Production callers must select the career-stamped content asset instead;
 * this fixture exists only so isolated engine tests never introduce a hidden
 * runtime default.
 */
export function marketBehaviorConfigFixture(): MarketBehaviorCalibrationConfig {
  return {
    schemaVersion: 1,
    version: "market-behavior:test-v2",
    classification: "explicit_game_design_target",
    askingPriceCurvesVersion: "asking-price:test-v1",
    wageFinanceCalibrationVersion: "wage-finance:test-v1",
    openingFinanceRoundingMinorUnits: 1,
    openingFinanceTargets: [
      financeTarget("first_division", 100, 200, 300, 50, 100, 150),
      financeTarget("second_division", 50, 100, 150, 20, 50, 80),
      financeTarget("third_division", 20, 50, 100, 10, 25, 50),
    ],
    sellerNegotiation: {
      counterOfferMinimumAskingBasisPoints: 7_500,
      counterOfferConcessionBasisPoints: 5_000,
    },
    aiTransferOffer: {
      version: "ai-transfer-offer:test-v1",
      minimumAskingBasisPoints: 7_000,
      maximumAskingBasisPoints: 10_000,
      askingBasisPointsStep: 500,
    },
    sportingWillingness: {
      sameDivisionScore: 60,
      oneDivisionUpScore: 85,
      oneDivisionDownScore: 55,
      twoDivisionsUpScore: 100,
      twoDivisionsDownScore: 20,
      reputationScorePerPoint: 2,
      squadStatusScorePerStep: 8,
      wageScorePerTenPercent: 2,
      maximumAbsoluteWageScore: 20,
      contractYearScore: 2,
      strongAbilityMinimum: 11.5,
      eliteAbilityMinimum: 13,
      primeMinimumAge: 24,
      primeMaximumAge: 30,
      oneDivisionStrongPenalty: 20,
      twoDivisionStrongPenalty: 45,
      reputationDropMinimum: 4,
      reputationDropPenalty: 20,
      primeDownwardPenalty: 20,
      annualWageRegressionThresholdBasisPoints: 9_000,
      annualWageRegressionPenalty: 15,
      squadStatusRegressionPenalty: 15,
      contractSecurityGraceDays: 90,
      contractSecurityRegressionPenalty: 15,
      acceptanceScoreMinimum: 45,
    },
    affordability: {
      minimumCashReserveBasisPoints: 1_000,
      maximumTransferBudgetUseBasisPoints: 9_000,
      maximumWageBudgetUseBasisPoints: 9_800,
    },
    aiTargetWeights: {
      quality: 40,
      potential: 20,
      roleNeed: 25,
      affordability: 15,
    },
    aiRiskAppetite: {
      uncertaintyPenaltyWeight: 10,
      toleranceBasisPointsByCategory: {
        first_division: 8_000,
        second_division: 6_000,
        third_division: 4_000,
      },
    },
    aiLifecycle: {
      maximumActiveTalks: 2,
      maximumPermanentStartsPerSeason: 6,
      maximumPreliminaryStartsPerSeason: 4,
      permanentCheckpointDays: 3,
      preliminaryCheckpointDays: 14,
      preliminaryEligibilityDays: 183,
      expiringContractDays: 365,
      targetDepartmentDepth: {
        goalkeeper: 2,
        defender: 7,
        midfielder: 7,
        attacker: 4,
      },
      goalkeeperAgingAge: 33,
      outfieldAgingAge: 30,
      successionQualityTolerance: 0.5,
      averageQualityGap: 0.75,
      weakestQualityGap: 2,
      maximumSquadAboveTarget: 3,
      needPriorityWeights: {
        structuralDeficit: 100,
        targetDeficit: 12,
        expiringContract: 20,
        agingDepartment: 8,
        roleSuccession: 32,
        qualityGap: 6,
      },
    },
  };
}

function financeTarget(
  division: "first_division" | "second_division" | "third_division",
  cashMinimumMinorUnits: number,
  cashMedianMinorUnits: number,
  cashMaximumMinorUnits: number,
  annualTransferBudgetMinimumMinorUnits: number,
  annualTransferBudgetMedianMinorUnits: number,
  annualTransferBudgetMaximumMinorUnits: number,
): MarketBehaviorCalibrationConfig["openingFinanceTargets"][number] {
  return {
    division,
    classification: "explicit_game_design_target",
    cashMinimumMinorUnits,
    cashMedianMinorUnits,
    cashMaximumMinorUnits,
    annualTransferBudgetMinimumMinorUnits,
    annualTransferBudgetMedianMinorUnits,
    annualTransferBudgetMaximumMinorUnits,
  };
}
