// @ts-ignore Node test types are introduced with the formal test runner step.
import test from "node:test";
// @ts-ignore Node assert types are introduced with the formal test runner step.
import assert from "node:assert/strict";

import {
  addMoney,
  applyBasisPoints,
  basisPoints,
  money,
  nonNegativeMoney,
  splitMoney,
  subtractMoney,
} from "./money.ts";

/**
 * Money tests lock down accounting invariants before the economy exists.
 *
 * They intentionally focus on integer behavior, validation, and remainder
 * handling because silent rounding bugs compound over long simulations.
 */
test("money rejects floats", () => {
  assert.throws(() => money(10.5), /safe integer/);
});

test("money rejects non-safe integers", () => {
  assert.throws(() => money(Number.MAX_SAFE_INTEGER + 1), /safe integer/);
});

test("nonNegativeMoney rejects negative amounts", () => {
  assert.throws(() => nonNegativeMoney(-1), /must not be negative/);
});

test("money operations preserve integer minor units", () => {
  assert.equal(addMoney(money(100), money(50)), 150);
  assert.equal(subtractMoney(money(100), money(150)), -50);
  assert.deepEqual(splitMoney(money(10), 3), [3, 3, 4]);
});

test("basisPoints rejects floats and out-of-range values", () => {
  assert.throws(() => basisPoints(12.5), /safe integer/);
  assert.throws(() => basisPoints(-1), /between 0 and 10000/);
  assert.throws(() => basisPoints(10_001), /between 0 and 10000/);
});

test("basisPoints applies floor rounding explicitly", () => {
  assert.equal(applyBasisPoints(money(999), basisPoints(1250)), 124);
});
