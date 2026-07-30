import assert from "node:assert/strict";
import { test } from "vitest";
import {
  money,
  type AgreedSquadStatus,
} from "@game/domain";

import {
  deriveSellerAskingPrice,
  type DeriveSellerAskingPriceInput,
} from "./seller-asking-price.ts";
import { askingPriceConfigFixture } from "../test-fixtures/asking-price-config.ts";

const PUBLIC_VALUE = money(10_000_000);
const askingPriceCurves = askingPriceConfigFixture();

function asking(
  overrides: Partial<Omit<DeriveSellerAskingPriceInput, "config" | "publicValue">> = {},
) {
  return deriveSellerAskingPrice({
    publicValue: PUBLIC_VALUE,
    remainingContractDays: 730,
    squadStatus: "squad_player",
    replacementNeed: "covered",
    sellerPressure: "healthy",
    playerDesire: "content",
    config: askingPriceCurves,
    ...overrides,
  });
}

test("derives asking prices below, equal to, and above public value", () => {
  assert.ok(asking({ squadStatus: "fringe_player" }).askingPrice < PUBLIC_VALUE);
  assert.equal(asking().askingPrice, PUBLIC_VALUE);
  assert.ok(asking({ squadStatus: "key_player" }).askingPrice > PUBLIC_VALUE);
});

test("long contracts and important players increase seller reluctance", () => {
  const short = asking({ remainingContractDays: 183 });
  const long = asking({ remainingContractDays: 1_095 });
  const key = asking({ squadStatus: "key_player" });
  const surplus = asking({ squadStatus: "fringe_player" });

  assert.ok(long.askingPrice > short.askingPrice);
  assert.ok(key.askingPrice > surplus.askingPrice);
  assert.deepEqual(long.reasons, ["long_contract"]);
  assert.deepEqual(key.reasons, ["important_player"]);
});

test("replacement cover and seller pressure remain separate auditable factors", () => {
  const reluctant = asking({ replacementNeed: "critical" });
  const pressured = asking({ sellerPressure: "must_sell" });

  assert.ok(reluctant.askingPrice > PUBLIC_VALUE);
  assert.ok(pressured.askingPrice < PUBLIC_VALUE);
  assert.ok(reluctant.reasons.includes("critical_replacement_cover"));
  assert.ok(pressured.reasons.includes("seller_must_sell"));
});

test("supports every canonical contract squad status", () => {
  const statuses: readonly AgreedSquadStatus[] = [
    "key_player",
    "regular_starter",
    "squad_player",
    "prospect",
    "fringe_player",
  ];
  for (const squadStatus of statuses) {
    assert.ok(asking({ squadStatus }).askingPrice > 0);
  }
});

test("keeps the reviewed free-agent transfer fee exactly zero", () => {
  assert.equal(askingPriceCurves.freeAgentTransferFeeMinorUnits, 0);
});
