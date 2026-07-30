import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createLongRunContractFinanceStabilityReport,
  type LongRunContractFinanceSeasonRow,
} from "./contract-finance-stability.ts";

test("contract and finance stability passes clean structural rows", () => {
  const report = createLongRunContractFinanceStabilityReport([seasonRow(1), seasonRow(2)]);

  assert.equal(report.status, "pass");
  assert.equal(report.structuralViolationCount, 0);
  assert.equal(report.minimumCashBalanceObserved, 4_000_000);
  assert.equal(report.renewalCount, 2);
  assert.equal(
    report.checks.every(
      ({ observationCount, evaluationStatus }) =>
        observationCount > 0 && evaluationStatus === "evaluated",
    ),
    true,
  );
  assert.deepEqual(
    report.checks.map((check) => [check.key, check.status]),
    [
      ["contract_finance_structural_integrity", "pass"],
      ["transfer_market_window_integrity", "pass"],
      ["negotiation_clock_integrity", "pass"],
      ["preliminary_agreement_integrity", "pass"],
      ["wage_budget_overspend", "pass"],
      ["wage_budget_pressure_prevalence", "pass"],
      ["wage_budget_exact_ceiling_prevalence", "pass"],
      ["wage_budget_headroom_p10", "pass"],
      ["free_agent_population_share", "pass"],
      ["selected_club_expiry_decisions", "pass"],
    ],
  );
});

test("zero wage observations cannot pass a required prevalence gate", () => {
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1, {
      wageBudgetUtilizations: [],
      annualWageHeadrooms: [],
    }),
  ]);

  const pressure = report.checks.find(
    ({ key }) => key === "wage_budget_pressure_prevalence",
  );
  assert.equal(pressure?.status, "fail");
  assert.equal(pressure?.observationCount, 0);
  assert.equal(pressure?.evaluationStatus, "not_evaluated");
});

test("population pressure warns without treating isolated wage utilization as systemic", () => {
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1, {
      maximumWageBudgetUtilization: 0.97,
      freeAgentShare: 0.28,
      selectedClubExpiredDecisionCount: 3,
    }),
  ]);

  assert.equal(report.status, "warn");
  assert.equal(report.structuralViolationCount, 0);
  assert.equal(report.selectedClubExpiredDecisionCount, 3);
  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_pressure_prevalence")?.status,
    "pass",
  );
  assert.equal(report.checks.find((check) => check.key === "free_agent_population_share")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "selected_club_expiry_decisions")?.status, "pass");
});

test("wage checks separate widespread pressure, exact contact, overspend, and headroom", () => {
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1, {
      maximumWageBudgetUtilization: 1.01,
      wageBudgetUtilizations: [1.01, 1, 0.97, 0.8],
      annualWageHeadrooms: [-10, 0, 30, 200],
      wagePressureClubCount: 3,
      exactWageCeilingClubCount: 1,
      aboveWageBudgetClubCount: 1,
    }),
  ]);

  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_overspend")?.status,
    "fail",
  );
  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_pressure_prevalence")?.status,
    "warn",
  );
  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_exact_ceiling_prevalence")?.status,
    "warn",
  );
  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_headroom_p10")?.value,
    -7,
  );
  assert.equal(report.maximumWageBudgetUtilizationObserved, 1.01);
});

test("one exact-ceiling club-season stays visible without a systemic warning", () => {
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1, {
      wageBudgetUtilizations: [1, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
      annualWageHeadrooms: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
      wagePressureClubCount: 1,
      exactWageCeilingClubCount: 1,
    }),
  ]);

  assert.equal(report.exactWageCeilingClubSeasonShare, 0.0909);
  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_exact_ceiling_prevalence")?.status,
    "pass",
  );
  assert.equal(
    report.checks.find((check) => check.key === "wage_budget_pressure_prevalence")?.status,
    "pass",
  );
});

test("ownership, finance, or hidden-plan violations fail the structural gate", () => {
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1, {
      ownershipInvariantViolationCount: 1,
      financeInvariantViolationCount: 1,
      selectedPlanHiddenReplacementCount: 1,
    }),
  ]);

  assert.equal(report.status, "fail");
  assert.equal(report.structuralViolationCount, 3);
  assert.equal(
    report.checks.find((check) => check.key === "contract_finance_structural_integrity")?.status,
    "fail",
  );
});

test("market funnels and club-season wage samples aggregate without losing stage reasons", () => {
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1, {
      wageBudgetUtilizations: [0.5, 0.95],
      annualWageHeadrooms: [500, 50],
      wagePressureClubCount: 1,
      permanentTransferFunnel: {
        ...seasonRow(1).permanentTransferFunnel,
        needsEvaluatedCount: 3,
        recruitableNeedCount: 2,
        targetFoundCount: 1,
        targetUnavailableCount: 1,
        offerSubmittedCount: 1,
        sellerRejectedCount: 1,
        lostReasonCounts: { permanent_target_unavailable: 1 },
      },
      preliminaryAgreementFunnel: {
        ...seasonRow(1).preliminaryAgreementFunnel,
        candidateFoundCount: 1,
        offerSubmittedCount: 1,
        agreementCreatedCount: 1,
      },
    }),
    seasonRow(2, {
      wageBudgetUtilizations: [1, 0.8],
      annualWageHeadrooms: [0, 200],
      wagePressureClubCount: 1,
      exactWageCeilingClubCount: 1,
      permanentTransferFunnel: {
        ...seasonRow(2).permanentTransferFunnel,
        needsEvaluatedCount: 2,
        recruitableNeedCount: 1,
        targetFoundCount: 1,
        offerSubmittedCount: 1,
        completedCount: 1,
        lostReasonCounts: { active_talk_limit_reached: 1 },
      },
    }),
  ]);

  assert.equal(report.permanentTransferFunnel.needsEvaluatedCount, 5);
  assert.equal(report.permanentTransferFunnel.completedCount, 1);
  assert.deepEqual(report.permanentTransferFunnel.lostReasonCounts, {
    active_talk_limit_reached: 1,
    permanent_target_unavailable: 1,
  });
  assert.equal(report.preliminaryAgreementFunnel.agreementCreatedCount, 1);
  assert.equal(report.wageBudgetUtilizationP50, 0.875);
  assert.equal(report.wageBudgetUtilizationP95, 0.9925);
  assert.equal(report.wagePressureClubSeasonShare, 0.5);
  assert.equal(report.exactWageCeilingClubSeasonShare, 0.25);
  assert.equal(report.annualWageHeadroomP10, 15);
});

test("retains the final per-division wage economy without inflating every aggregate", () => {
  const thirdDivision = {
    division: "third_division" as const,
    clubCount: 20,
    playerCount: 440,
    annualWageP50: 10,
    annualWageP90: 20,
    annualWageP99: 30,
    signingBonusP50: 1,
    appearanceBonusP50: 2,
    goalBonusP50: 3,
    cleanSheetBonusP50: 4,
    committedAnnualWageP50: 100,
    committedAnnualWageP90: 110,
    committedAnnualWageP99: 120,
    wageBudgetUtilizationP50: 0.8,
    wageBudgetUtilizationP90: 0.9,
    wageBudgetUtilizationP99: 0.95,
    annualWageHeadroomP50: 25,
    annualWageHeadroomP10: 5,
  };
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1),
    seasonRow(2, { divisionWageEconomy: [thirdDivision] }),
  ]);

  assert.deepEqual(report.closingDivisionWageEconomy, [thirdDivision]);
});

test("retains final per-division market economy and cross-tier transfer diagnostics", () => {
  const marketEconomy = {
    division: "second_division" as const,
    clubCount: 20,
    cashBalanceP50: 100,
    cashBalanceP90: 200,
    cashBalanceP99: 300,
    availableTransferBudgetP50: 40,
    availableTransferBudgetP90: 80,
    availableTransferBudgetP99: 120,
    pendingCashExposureP50: 5,
    pendingCashExposureP90: 10,
    pendingCashExposureP99: 15,
    pendingAnnualWageExposureP50: 2,
    pendingAnnualWageExposureP90: 4,
    pendingAnnualWageExposureP99: 6,
    permanentAttemptCount: 3,
    permanentCompletionCount: 1,
    freeAgentSigningCount: 2,
  };
  const crossTierTransfer = {
    sourceDivision: "third_division" as const,
    destinationDivision: "second_division" as const,
    attemptCount: 2,
    completionCount: 1,
    publicValueP50: 30,
    askingPriceP50: 40,
    completedFeeP50: 38,
    rejectionReasonCounts: { player_not_willing: 1 },
  };
  const report = createLongRunContractFinanceStabilityReport([
    seasonRow(1),
    seasonRow(2, {
      divisionMarketEconomy: [marketEconomy],
      crossTierTransfers: [crossTierTransfer],
    }),
  ]);

  assert.deepEqual(report.closingDivisionMarketEconomy, [marketEconomy]);
  assert.deepEqual(report.closingCrossTierTransfers, [crossTierTransfer]);
});

function seasonRow(
  seasonNumber: number,
  overrides: Partial<LongRunContractFinanceSeasonRow> = {},
): LongRunContractFinanceSeasonRow {
  return {
    seasonNumber,
    currentDate: 20_000 + seasonNumber * 365,
    ownedSeniorPlayerCount: 396,
    freeAgentCount: 12,
    freeAgentShare: 0.03,
    freeAgentSigningPublicValues: [],
    missingStateCount: 0,
    seniorSquadInvariantViolationCount: 0,
    ownershipInvariantViolationCount: 0,
    activeContractDateViolationCount: 0,
    selectedClubExpiredDecisionCount: 0,
    freeAgentInvariantViolationCount: 0,
    negotiationInvariantViolationCount: 0,
    unaffordableAiOfferCount: 0,
    financeInvariantViolationCount: 0,
    duplicateLedgerBusinessFactCount: 0,
    annualPayrollReconciliationViolationCount: 0,
    financeLimitViolationCount: 0,
    minimumCashBalance: 4_000_000,
    maximumWageBudgetUtilization: 0.72,
    wageBudgetUtilizations: [0.72],
    annualWageHeadrooms: [280_000],
    wagePressureClubCount: 0,
    exactWageCeilingClubCount: 0,
    aboveWageBudgetClubCount: 0,
    reallocationExactCeilingClubCount: 0,
    minimumSquadSize: 22,
    maximumSquadSize: 25,
    minimumGoalkeeperCount: 2,
    minimumDefenderCount: 7,
    minimumMidfielderCount: 8,
    minimumAttackerCount: 4,
    minimumAge: 18,
    averageAge: 25.4,
    maximumAge: 35,
    minimumAnnualWage: 120_000,
    averageAnnualWage: 800_000,
    maximumAnnualWage: 2_400_000,
    divisionWageEconomy: [],
    divisionMarketEconomy: [],
    crossTierTransfers: [],
    valuationSampleCount: 396,
    minimumPlayerValue: 30_000,
    averagePlayerValue: 900_000,
    maximumPlayerValue: 8_000_000,
    expiringContractCount: 34,
    openNegotiationCount: 4,
    renewalCount: 1,
    releaseCount: 1,
    expiryCount: 1,
    ledgerReasonAmounts: {
      opening_capital: 0,
      season_distribution: 2_000_000,
      transfer_fee_paid: 0,
      transfer_fee_received: 0,
      contract_signing_bonus: 40_000,
      annual_base_wage: 1_000_000,
      appearance_bonus: 0,
      goal_bonus: 0,
      clean_sheet_bonus: 0,
    },
    selectedPlanObservationCount: 1,
    selectedPlanRetainedPlayerMissingCount: 0,
    selectedPlanHiddenReplacementCount: 0,
    completedTransferCount: 0,
    transferWindowViolationCount: 0,
    negotiationClockViolationCount: 0,
    unaffordableCompletedTransferCount: 0,
    preliminaryAgreementCount: 0,
    preliminaryAgreementActivationCount: 0,
    preliminaryAgreementViolationCount: 0,
    permanentTransferFunnel: {
      needsEvaluatedCount: 0,
      recruitableNeedCount: 0,
      targetFoundCount: 0,
      targetUnavailableCount: 0,
      offerSubmittedCount: 0,
      sellerRejectedCount: 0,
      sellerCounteredCount: 0,
      sellerAcceptedCount: 0,
      sellerExpiredCount: 0,
      sellerWithdrawnCount: 0,
      playerTermsStartedCount: 0,
      playerCounteredCount: 0,
      playerRejectedCount: 0,
      playerCounterAcceptedCount: 0,
      unaffordableCompletionCount: 0,
      completedCount: 0,
      lostReasonCounts: {},
      lostByClubDepartment: [],
      clubActivity: [],
    },
    preliminaryAgreementFunnel: {
      candidateFoundCount: 0,
      candidateUnavailableCount: 0,
      offerSubmittedCount: 0,
      offerRejectedCount: 0,
      counteredCount: 0,
      counterAcceptedCount: 0,
      counterRejectedCount: 0,
      agreementCreatedCount: 0,
      expiredCount: 0,
      activationCount: 0,
      activationFailureCount: 0,
      lostReasonCounts: {},
    },
    freeAgentFlow: {
      openingStock: 12,
      expiryInflow: 0,
      releaseInflow: 0,
      youthExternalMoveInflow: 0,
      youthReleaseInflow: 0,
      otherInflow: 0,
      ordinarySigningOutflow: 0,
      preliminaryActivationOutflow: 0,
      retirementOutflow: 0,
      careerStepDownOutflow: 0,
      otherOutflow: 0,
      closingStock: 12,
      reconciliationDelta: 0,
      usefulClosingStock: 0,
      bands: {
        age: { under_23: 0, prime_23_29: 0, age_30_34: 0, age_35_plus: 12 },
        currentAbility: { under_8: 12, ability_8_9: 0, ability_10_11: 0, ability_12_plus: 0 },
        unattached: { under_1_season: 0, one_to_two_seasons: 0, three_plus_seasons: 12 },
      },
    },
    ...overrides,
  };
}
