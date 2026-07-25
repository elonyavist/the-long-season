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
  assert.deepEqual(
    report.checks.map((check) => [check.key, check.status]),
    [
      ["contract_finance_structural_integrity", "pass"],
      ["transfer_market_window_integrity", "pass"],
      ["negotiation_clock_integrity", "pass"],
      ["preliminary_agreement_integrity", "pass"],
      ["wage_budget_utilization", "pass"],
      ["free_agent_population_share", "pass"],
      ["selected_club_expiry_decisions", "pass"],
    ],
  );
});

test("football-pressure signals warn without pretending the save is corrupt", () => {
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
  assert.equal(report.checks.find((check) => check.key === "wage_budget_utilization")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "free_agent_population_share")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "selected_club_expiry_decisions")?.status, "pass");
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
    ...overrides,
  };
}
