import { test } from "vitest";
import assert from "node:assert/strict";

import { clubId, playerId } from "../types/ids.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import {
  createMarketState,
  createPermanentTransferIntent,
  findClubTransferBudget,
  replaceClubTransferBudget,
  TransferContractError,
  type MarketState,
} from "./transfer.entity.ts";

/**
 * Transfer entity tests cover only dependency-free market data invariants.
 *
 * Ownership, valuation, willingness, and state previews are engine
 * responsibilities and are intentionally not tested here.
 */
test("createPermanentTransferIntent rejects same-club transfers", () => {
  const pro01 = clubId("club:pro01");

  assertTransferContractError(
    () =>
      createPermanentTransferIntent({
        buyingClubId: pro01,
        sellingClubId: pro01,
        playerId: playerId("player:000001"),
      }),
    "same_club",
  );
});

test("createPermanentTransferIntent preserves explicit IDs", () => {
  const intent = createPermanentTransferIntent({
    buyingClubId: clubId("club:pro01"),
    sellingClubId: clubId("club:pro18"),
    playerId: playerId("player:000999"),
  });

  assert.deepEqual(JSON.parse(JSON.stringify(intent)), {
    buyingClubId: "club:pro01",
    sellingClubId: "club:pro18",
    playerId: "player:000999",
  });
});

test("createMarketState preserves explicit budget order", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");

  const market = createMarketState({
    clubBudgets: {
      [pro18]: { clubId: pro18, transferBudget: nonNegativeMoney(250_000_00) },
      [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(1_000_000_00) },
    },
    clubBudgetIds: [pro01, pro18],
  });

  assert.deepEqual(market.clubBudgetIds, [pro01, pro18]);
  assert.equal(market.clubBudgets[pro01]?.transferBudget, 1_000_000_00);
});

test("createMarketState rejects duplicate ordered budget club IDs", () => {
  const pro01 = clubId("club:pro01");

  assertTransferContractError(
    () =>
      createMarketState({
        clubBudgets: {
          [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(1_000_000_00) },
        },
        clubBudgetIds: [pro01, pro01],
      }),
    "duplicate_budget_club",
  );
});

test("createMarketState rejects missing and mismatched budget entries", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");

  assertTransferContractError(
    () =>
      createMarketState({
        clubBudgets: {
          [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(1_000_000_00) },
        },
        clubBudgetIds: [pro01, pro18],
      }),
    "missing_budget_entry",
  );

  assertTransferContractError(
    () =>
      createMarketState({
        clubBudgets: {
          [pro01]: { clubId: pro18, transferBudget: nonNegativeMoney(1_000_000_00) },
        },
        clubBudgetIds: [pro01],
      }),
    "budget_entry_mismatch",
  );
});

test("findClubTransferBudget uses explicit market order", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const market = marketStateFixture();

  assert.equal(findClubTransferBudget(market, pro01)?.transferBudget, 1_000_000_00);
  assert.equal(findClubTransferBudget(market, pro18)?.transferBudget, 250_000_00);
  assert.equal(findClubTransferBudget(market, clubId("club:pro99")), undefined);
});

test("replaceClubTransferBudget returns a copy with the same order", () => {
  const pro01 = clubId("club:pro01");
  const market = marketStateFixture();

  const updated = replaceClubTransferBudget(market, {
    clubId: pro01,
    transferBudget: nonNegativeMoney(500_000_00),
  });

  assert.deepEqual(updated.clubBudgetIds, market.clubBudgetIds);
  assert.equal(updated.clubBudgets[pro01]?.transferBudget, 500_000_00);
  assert.equal(market.clubBudgets[pro01]?.transferBudget, 1_000_000_00);
});

test("replaceClubTransferBudget rejects unknown clubs", () => {
  assertTransferContractError(
    () =>
      replaceClubTransferBudget(marketStateFixture(), {
        clubId: clubId("club:pro99"),
        transferBudget: nonNegativeMoney(500_000_00),
      }),
    "unknown_budget_club",
  );
});

/** Builds a compact two-club market state fixture. */
function marketStateFixture(): MarketState {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");

  return createMarketState({
    clubBudgets: {
      [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(1_000_000_00) },
      [pro18]: { clubId: pro18, transferBudget: nonNegativeMoney(250_000_00) },
    },
    clubBudgetIds: [pro01, pro18],
  });
}

/**
 * Asserts a typed transfer-domain failure and its stable machine code.
 */
function assertTransferContractError(
  action: () => void,
  code: TransferContractError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof TransferContractError && error.code === code,
  );
}
