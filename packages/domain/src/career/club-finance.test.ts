import assert from "node:assert/strict";
import { test } from "vitest";

import { clubFinanceLedgerEntryId, clubId, playerContractId, playerId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import type { SeniorSquadState } from "./senior-squad.ts";
import {
  beginClubFinanceTransaction,
  ClubFinanceStateError,
  commitClubFinanceTransaction,
  createClubFinanceState,
  postClubFinanceLedgerEntry,
  postClubFinanceLedgerEntries,
  remainingAnnualWageBudget,
  replaceClubFinanceAccount,
  replaceClubFinanceAccounts,
  type ClubFinanceState,
} from "./club-finance.ts";

const club = clubId("club:test");
const player = playerId("player:test");
const contract = playerContractId("contract:test");
const openingEntry = clubFinanceLedgerEntryId("finance-ledger:opening:test");
const currentDate = gameDate(20_000);

test("club finances validate ordered opening capital and active wage commitments", () => {
  const state = createClubFinanceState(world(), seniorSquad(), financeFixture());

  assert.equal(state.accounts[club]?.cashBalance, 12_000_000_00);
  assert.equal(state.accounts[club]?.committedAnnualWage, 1_200_000_00);
  assert.deepEqual(state.ledgerEntryIds, [openingEntry]);
  assert.equal(remainingAnnualWageBudget(state.accounts[club]!), 300_000_00);
});

test("club finances reject a committed wage that does not match active contracts", () => {
  const fixture = financeFixture();
  const account = fixture.accounts[club];
  assert.ok(account);

  assert.throws(
    () => createClubFinanceState(world(), seniorSquad(), {
      ...fixture,
      accounts: { ...fixture.accounts, [club]: { ...account, committedAnnualWage: nonNegativeMoney(1) } },
    }),
    (error) => error instanceof ClubFinanceStateError && error.code === "committed_wage_mismatch",
  );
});

test("ledger posting is idempotent and updates cash and season totals", () => {
  const gameState = world();
  const squad = seniorSquad();
  const state = createClubFinanceState(gameState, squad, financeFixture());
  const payment = {
    id: clubFinanceLedgerEntryId("finance-ledger:transfer-paid:test"),
    clubId: club,
    occurredOn: currentDate,
    currency: "EUR" as const,
    reason: "transfer_fee_paid" as const,
    direction: "debit" as const,
    amount: nonNegativeMoney(500_000_00),
    referenceId: "transfer:test",
  };
  const posted = postClubFinanceLedgerEntry(state, payment);
  const replayed = postClubFinanceLedgerEntry(posted, payment);

  assert.strictEqual(replayed, posted);
  assert.equal(posted.accounts[club]?.cashBalance, 11_500_000_00);
  assert.equal(posted.accounts[club]?.seasonExpenses, 500_000_00);
  assert.equal(posted.ledgerEntries[payment.id]?.sequenceNumber, 2);
  assert.strictEqual(createClubFinanceState(gameState, squad, posted), posted);
});

test("finance batches match sequential updates and reject atomically", () => {
  const state = createClubFinanceState(world(), seniorSquad(), financeFixture());
  const firstPayment = {
    id: clubFinanceLedgerEntryId("finance-ledger:batch-first"),
    clubId: club,
    occurredOn: currentDate,
    currency: "EUR" as const,
    reason: "contract_signing_bonus" as const,
    direction: "debit" as const,
    amount: nonNegativeMoney(125_000_00),
    referenceId: "contract:batch-first",
  };
  const secondPayment = {
    ...firstPayment,
    id: clubFinanceLedgerEntryId("finance-ledger:batch-second"),
    amount: nonNegativeMoney(75_000_00),
    referenceId: "contract:batch-second",
  };
  const sequential = postClubFinanceLedgerEntry(
    postClubFinanceLedgerEntry(state, firstPayment),
    secondPayment,
  );
  const batched = postClubFinanceLedgerEntries(state, [firstPayment, secondPayment]);

  assert.deepEqual(batched, sequential);
  assert.strictEqual(postClubFinanceLedgerEntries(batched, [firstPayment, secondPayment]), batched);
  assert.throws(
    () => postClubFinanceLedgerEntries(state, [
      firstPayment,
      {
        ...secondPayment,
        id: clubFinanceLedgerEntryId("finance-ledger:batch-overspend"),
        amount: nonNegativeMoney(20_000_000_00),
      },
    ]),
    (error) => error instanceof ClubFinanceStateError && error.code === "insufficient_cash",
  );
  assert.deepEqual(state.ledgerEntryIds, [openingEntry]);

  const account = state.accounts[club]!;
  const firstAccount = { ...account, committedAnnualWage: nonNegativeMoney(1_250_000_00) };
  const secondAccount = { ...firstAccount, committedAnnualWage: nonNegativeMoney(1_300_000_00) };
  assert.deepEqual(
    replaceClubFinanceAccounts(state, [firstAccount, secondAccount]),
    replaceClubFinanceAccount(replaceClubFinanceAccount(state, firstAccount), secondAccount),
  );
});

test("finance transactions isolate the caller and stop reusing records after commit", () => {
  const state = createClubFinanceState(world(), seniorSquad(), financeFixture());
  const transaction = beginClubFinanceTransaction(state);
  const first = postClubFinanceLedgerEntry(transaction, {
    id: clubFinanceLedgerEntryId("finance-ledger:transaction-first"),
    clubId: club,
    occurredOn: currentDate,
    currency: "EUR",
    reason: "annual_base_wage",
    direction: "debit",
    amount: nonNegativeMoney(100_000_00),
    referenceId: "transaction:first",
  });
  const second = postClubFinanceLedgerEntry(first, {
    id: clubFinanceLedgerEntryId("finance-ledger:transaction-second"),
    clubId: club,
    occurredOn: currentDate,
    currency: "EUR",
    reason: "season_distribution",
    direction: "credit",
    amount: nonNegativeMoney(50_000_00),
    referenceId: "transaction:second",
  });

  assert.notStrictEqual(transaction.ledgerEntries, state.ledgerEntries);
  assert.strictEqual(first.ledgerEntries, second.ledgerEntries);
  assert.deepEqual(state.ledgerEntryIds, [openingEntry]);

  const committed = commitClubFinanceTransaction(second);
  const afterCommit = postClubFinanceLedgerEntry(committed, {
    id: clubFinanceLedgerEntryId("finance-ledger:after-transaction"),
    clubId: club,
    occurredOn: currentDate,
    currency: "EUR",
    reason: "season_distribution",
    direction: "credit",
    amount: nonNegativeMoney(25_000_00),
    referenceId: "transaction:after",
  });
  assert.notStrictEqual(afterCommit.ledgerEntries, committed.ledgerEntries);
});

test("ledger debits cap the remaining transfer budget at available cash", () => {
  const state = createClubFinanceState(world(), seniorSquad(), financeFixture());
  const posted = postClubFinanceLedgerEntry(state, {
    id: clubFinanceLedgerEntryId("finance-ledger:payroll:test"),
    clubId: club,
    occurredOn: currentDate,
    currency: "EUR",
    reason: "annual_base_wage",
    direction: "debit",
    amount: nonNegativeMoney(10_000_000_00),
    referenceId: "payroll:test",
  });

  assert.equal(posted.accounts[club]?.cashBalance, 2_000_000_00);
  assert.equal(posted.accounts[club]?.availableTransferBudget, 2_000_000_00);
});

test("finance helpers reject overspending and transfer budget beyond cash", () => {
  const state = createClubFinanceState(world(), seniorSquad(), financeFixture());
  assert.throws(
    () => postClubFinanceLedgerEntry(state, {
      id: clubFinanceLedgerEntryId("finance-ledger:overspend:test"),
      clubId: club,
      occurredOn: currentDate,
      currency: "EUR",
      reason: "transfer_fee_paid",
      direction: "debit",
      amount: nonNegativeMoney(20_000_000_00),
      referenceId: "transfer:overspend",
    }),
    (error) => error instanceof ClubFinanceStateError && error.code === "insufficient_cash",
  );

  const account = state.accounts[club];
  assert.ok(account);
  assert.throws(
    () => replaceClubFinanceAccount(state, {
      ...account,
      availableTransferBudget: nonNegativeMoney(13_000_000_00),
    }),
    (error) => error instanceof ClubFinanceStateError && error.code === "invalid_finance_money",
  );
});

function world() {
  return {
    clubIds: [club],
    clubs: {
      [club]: {
        id: club,
        name: "Test Club",
        shortName: "TEST",
        category: "third_division" as const,
        reputation: 5,
        playerIds: [player],
      },
    },
  };
}

function seniorSquad(): SeniorSquadState {
  return {
    registrations: {},
    registrationIds: [],
    contracts: {
      [contract]: {
        id: contract,
        playerId: player,
        clubId: club,
        type: "professional",
        startsOn: gameDate(currentDate - 365),
        endsOn: gameDate(currentDate + 365),
        annualWage: nonNegativeMoney(1_200_000_00),
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: nonNegativeMoney(50_000_00),
          appearanceBonus: nonNegativeMoney(5_000_00),
        },
      },
    },
    contractIds: [contract],
    activeContractIds: [contract],
    contractHistory: {},
    contractHistoryEntryIds: [],
  };
}

function financeFixture(): ClubFinanceState {
  return {
    currency: "EUR",
    clubIds: [club],
    accounts: {
      [club]: {
        clubId: club,
        currency: "EUR",
        cashBalance: nonNegativeMoney(12_000_000_00),
        annualTransferBudget: nonNegativeMoney(3_000_000_00),
        availableTransferBudget: nonNegativeMoney(3_000_000_00),
        annualWageBudget: nonNegativeMoney(1_500_000_00),
        committedAnnualWage: nonNegativeMoney(1_200_000_00),
        seasonIncome: nonNegativeMoney(0),
        seasonExpenses: nonNegativeMoney(0),
      },
    },
    ledgerEntries: {
      [openingEntry]: {
        id: openingEntry,
        sequenceNumber: 1,
        clubId: club,
        occurredOn: currentDate,
        currency: "EUR",
        reason: "opening_capital",
        direction: "credit",
        amount: nonNegativeMoney(12_000_000_00),
        balanceAfter: nonNegativeMoney(12_000_000_00),
        referenceId: "world:test",
      },
    },
    ledgerEntryIds: [openingEntry],
  };
}
