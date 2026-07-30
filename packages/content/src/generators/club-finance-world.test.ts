import assert from "node:assert/strict";
import { test } from "vitest";

import { marketBehaviorCalibration } from "../balance/player-economy-calibration.ts";
import { generateCompetitionSeasonDistribution } from "./club-finance-world.ts";
import { createFakeDomesticWorld } from "./domestic-world.ts";
import { createFakeLeagueSystem } from "./league-system.ts";

test("generated club finances are deterministic, funded, and not uniform", () => {
  const first = createFakeLeagueSystem({ worldSeed: "finance-world-a" });
  const second = createFakeLeagueSystem({ worldSeed: "finance-world-a" });
  assert.deepEqual(first.clubFinanceState, second.clubFinanceState);

  const transferBudgets = new Set<number>();
  const cashBalances = new Set<number>();
  for (const clubId of first.clubIds) {
    const account = first.clubFinanceState.accounts[clubId];
    assert.ok(account);
    assert.ok(account.cashBalance >= account.committedAnnualWage);
    assert.ok(account.annualWageBudget >= account.committedAnnualWage);
    const utilization = account.committedAnnualWage / account.annualWageBudget;
    assert.ok(utilization >= 0.7);
    assert.ok(utilization <= 0.95);
    assert.ok(account.annualWageBudget >= 2_000_000_00);
    assert.ok(account.annualWageBudget <= 4_500_000_00);
    assert.ok(account.availableTransferBudget <= account.cashBalance);
    transferBudgets.add(account.annualTransferBudget);
    cashBalances.add(account.cashBalance);
  }

  assert.ok(transferBudgets.size > 3);
  assert.ok(cashBalances.size > 3);
  assert.equal(first.clubFinanceState.ledgerEntryIds.length, first.clubIds.length);
});

test("the current competition owns a complete descending season distribution", () => {
  const league = createFakeLeagueSystem({ worldSeed: "finance-world-b" });
  const prizes = league.competition.seasonDistribution?.prizes;
  assert.ok(prizes);
  assert.equal(prizes.length, league.clubIds.length);

  for (let index = 0; index < prizes.length; index += 1) {
    assert.equal(prizes[index]?.position, index + 1);
    if (index > 0) assert.ok((prizes[index - 1]?.amount ?? 0) >= (prizes[index]?.amount ?? 0));
  }

  const maximumCommittedWage = Math.max(
    ...league.clubIds.map((clubId) => league.clubFinanceState.accounts[clubId]?.committedAnnualWage ?? 0),
  );
  assert.ok((prizes.at(-1)?.amount ?? 0) >= maximumCommittedWage);
});

test("one world finance state can derive an independent 18-club tier distribution", () => {
  const league = createFakeLeagueSystem({ worldSeed: "finance-tier-slice" });
  const firstHalf = league.clubIds.slice(0, 9);
  const distribution = generateCompetitionSeasonDistribution(
    league.clubFinanceState,
    firstHalf,
  );

  assert.equal(distribution.prizes.length, firstHalf.length);
  assert.deepEqual(distribution.prizes.map((prize) => prize.position), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("the canonical country opens with distinct calibrated cash and transfer distributions", () => {
  const world = createFakeDomesticWorld({ worldSeed: "finance-tier-calibration" });
  const cashMedians: number[] = [];
  const transferMedians: number[] = [];

  for (const division of ["third_division", "second_division", "first_division"] as const) {
    const target = marketBehaviorCalibration.openingFinanceTargets.find(
      (candidate) => candidate.division === division,
    );
    assert.ok(target);
    const accounts = world.divisionClubIds[division].map((clubId) => {
      const account = world.clubFinanceState.accounts[clubId];
      assert.ok(account);
      return account;
    });
    const cash = accounts.map((account) => account.cashBalance).sort((a, b) => a - b);
    const transfer = accounts
      .map((account) => account.annualTransferBudget)
      .sort((a, b) => a - b);

    assert.equal(accounts.length, 18);
    assert.equal(cash[0], target.cashMinimumMinorUnits);
    assert.equal(cash.at(-1), target.cashMaximumMinorUnits);
    assert.equal(transfer[0], target.annualTransferBudgetMinimumMinorUnits);
    assert.equal(transfer.at(-1), target.annualTransferBudgetMaximumMinorUnits);
    assert.ok(accounts.every(
      (account) =>
        account.availableTransferBudget === account.annualTransferBudget
        && account.annualTransferBudget <= account.cashBalance,
    ));
    cashMedians.push(median(cash));
    transferMedians.push(median(transfer));
  }

  assert.ok(cashMedians[0]! < cashMedians[1]! && cashMedians[1]! < cashMedians[2]!);
  assert.ok(
    transferMedians[0]! < transferMedians[1]!
    && transferMedians[1]! < transferMedians[2]!,
  );
});

/** Returns the midpoint used to compare even-sized deterministic tier samples. */
function median(values: readonly number[]): number {
  const lower = values[(values.length / 2) - 1];
  const upper = values[values.length / 2];
  assert.ok(lower !== undefined && upper !== undefined);
  return (lower + upper) / 2;
}
