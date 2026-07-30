import assert from "node:assert/strict";
import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
  gameDate,
  nonNegativeMoney,
  saveId,
  seasonId,
  type CareerState,
  type ClubFinanceState,
} from "@game/domain";
import { test } from "vitest";

import {
  evaluateCareerContractCapacity,
  evaluateTransferFeeCapacity,
} from "./career-contract-capacity.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";

const BUYER = clubId("club:pro01");

function careerFixture(input: {
  readonly cashBalance: number;
  readonly availableTransferBudget: number;
}): CareerState {
  const clubFinanceState: ClubFinanceState = {
    currency: "EUR",
    accounts: {
      [BUYER]: {
        clubId: BUYER,
        currency: "EUR",
        cashBalance: nonNegativeMoney(input.cashBalance),
        annualTransferBudget: nonNegativeMoney(input.availableTransferBudget),
        availableTransferBudget: nonNegativeMoney(input.availableTransferBudget),
        annualWageBudget: nonNegativeMoney(10_000_000_00),
        committedAnnualWage: nonNegativeMoney(0),
        seasonIncome: nonNegativeMoney(0),
        seasonExpenses: nonNegativeMoney(0),
      },
    },
    clubIds: [BUYER],
    ledgerEntries: {},
    ledgerEntryIds: [],
  };

  return createCareerState({
    saveId: saveId("save:capacity-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: BUYER,
    gameState: {
      meta: { seed: "test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
      calendar: { currentDate: gameDate(20_000), currentSeasonId: seasonId("season:test") },
      players: {},
      playerIds: [],
      playerStates: {},
      clubs: { [BUYER]: { id: BUYER, name: "Buyer", shortName: "BUY", category: "third_division", reputation: 5, playerIds: [] } },
      clubIds: [BUYER],
      fixtures: {},
      fixtureIds: [],
    },
    clubFinanceState,
    transferHistory: [],
  });
}

test("a fee within both transfer budget and cash is affordable", () => {
  const state = careerFixture({ cashBalance: 5_000_000_00, availableTransferBudget: 2_000_000_00 });
  const result = evaluateTransferFeeCapacity({
    careerState: state,
    buyingClubId: BUYER,
    fee: nonNegativeMoney(1_000_000_00),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
  assert.equal(result.status, "affordable");
  if (result.status !== "affordable") return;
  assert.equal(result.projectedTransferBudget, 1_000_000_00);
  assert.equal(result.projectedCash, 4_000_000_00);
});

test("a fee above the transfer budget is rejected even with enough cash", () => {
  const state = careerFixture({ cashBalance: 5_000_000_00, availableTransferBudget: 500_000_00 });
  const result = evaluateTransferFeeCapacity({
    careerState: state,
    buyingClubId: BUYER,
    fee: nonNegativeMoney(1_000_000_00),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
  assert.equal(result.status, "unaffordable");
  assert.equal(result.status === "unaffordable" ? result.reason : undefined, "insufficient_transfer_budget");
});

test("a fee within budget but above cash is rejected", () => {
  const state = careerFixture({ cashBalance: 500_000_00, availableTransferBudget: 5_000_000_00 });
  const result = evaluateTransferFeeCapacity({
    careerState: state,
    buyingClubId: BUYER,
    fee: nonNegativeMoney(1_000_000_00),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
  assert.equal(result.status, "unaffordable");
  assert.equal(result.status === "unaffordable" ? result.reason : undefined, "insufficient_cash");
});

test("an unknown buying club is unaffordable", () => {
  const state = careerFixture({ cashBalance: 5_000_000_00, availableTransferBudget: 5_000_000_00 });
  const result = evaluateTransferFeeCapacity({
    careerState: state,
    buyingClubId: clubId("club:unknown"),
    fee: nonNegativeMoney(1),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
  assert.equal(result.status, "unaffordable");
  assert.equal(result.status === "unaffordable" ? result.reason : undefined, "club_finance_account_missing");
});

test("structural repair may use the existing wage buffer without exceeding the actual budget", () => {
  const state = careerFixture({
    cashBalance: 5_000_000_00,
    availableTransferBudget: 0,
  });
  const account = state.clubFinanceState?.accounts[BUYER];
  assert.notEqual(account, undefined);
  const constrainedState = createCareerState({
    ...state,
    clubFinanceState: {
      ...state.clubFinanceState!,
      accounts: {
        ...state.clubFinanceState!.accounts,
        [BUYER]: {
          ...account!,
          annualWageBudget: nonNegativeMoney(100_000_00),
          committedAnnualWage: nonNegativeMoney(98_000_00),
        },
      },
    },
  });
  const input = {
    careerState: constrainedState,
    clubId: BUYER,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    addedAnnualWage: nonNegativeMoney(1_000_00),
    addedSigningBonus: nonNegativeMoney(0),
  };

  assert.equal(evaluateCareerContractCapacity(input).status, "unaffordable");
  assert.equal(
    evaluateCareerContractCapacity({
      ...input,
      allowFullWageBudgetForStructuralRepair: true,
    }).status,
    "affordable",
  );
});
