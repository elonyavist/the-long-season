import assert from "node:assert/strict";
import { test } from "vitest";

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
    assert.ok(account.annualWageBudget <= account.committedAnnualWage * 1.25);
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
