import assert from "node:assert/strict";
import { test } from "vitest";

import { addDays, diffDays, fromISO, toISO } from "./date-utils.ts";

/**
 * Pure Gregorian date utility tests.
 */

test("fromISO(toISO(day)) round-trips across representative days", () => {
  const days = [-25_567, -1, 0, 1, 20_000, 47_481];

  for (const day of days) {
    assert.equal(fromISO(toISO(day)), day);
  }
});

test("leap day 2000-02-29 round-trips", () => {
  assert.equal(toISO(fromISO("2000-02-29")), "2000-02-29");
});

test("years 1900 and 2100 are not treated as leap years", () => {
  assert.throws(() => fromISO("1900-02-29"), /day is invalid/);
  assert.throws(() => fromISO("2100-02-29"), /day is invalid/);
});

test("addDays is stable across month and year boundaries", () => {
  assert.equal(toISO(addDays(fromISO("2026-01-31"), 1)), "2026-02-01");
  assert.equal(toISO(addDays(fromISO("2026-12-31"), 1)), "2027-01-01");
  assert.equal(toISO(addDays(fromISO("2024-03-01"), -1)), "2024-02-29");
});

test("diffDays is stable across month and year boundaries", () => {
  assert.equal(diffDays(fromISO("2027-01-01"), fromISO("2026-12-31")), 1);
  assert.equal(diffDays(fromISO("2024-03-01"), fromISO("2024-02-28")), 2);
  assert.equal(diffDays(fromISO("2026-02-01"), fromISO("2026-01-31")), 1);
});
