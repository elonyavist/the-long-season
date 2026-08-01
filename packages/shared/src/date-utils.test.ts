import assert from "node:assert/strict";
import { test } from "vitest";

import {
  addCivilYears,
  addDays,
  completedCivilYears,
  diffDays,
  fromISO,
  toISO,
} from "./date-utils.ts";

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

test("addCivilYears preserves a season boundary across a leap year", () => {
  assert.equal(
    toISO(addCivilYears(fromISO("2027-08-01"), 1)),
    "2028-08-01",
  );
});

test("addCivilYears clamps leap day to the destination month's final day", () => {
  const leapDay = fromISO("2024-02-29");

  assert.equal(toISO(addCivilYears(leapDay, 1)), "2025-02-28");
  assert.equal(toISO(addCivilYears(leapDay, -1)), "2023-02-28");
  assert.equal(toISO(addCivilYears(leapDay, 4)), "2028-02-29");
  assert.equal(toISO(addCivilYears(fromISO("2096-02-29"), 4)), "2100-02-28");
});

test("addCivilYears accepts zero and rejects fractional year offsets", () => {
  const epochDay = fromISO("2028-02-29");

  assert.equal(addCivilYears(epochDay, 0), epochDay);
  assert.throws(() => addCivilYears(epochDay, 0.5), /years must be a safe integer/);
});

test("diffDays is stable across month and year boundaries", () => {
  assert.equal(diffDays(fromISO("2027-01-01"), fromISO("2026-12-31")), 1);
  assert.equal(diffDays(fromISO("2024-03-01"), fromISO("2024-02-28")), 2);
  assert.equal(diffDays(fromISO("2026-02-01"), fromISO("2026-01-31")), 1);
});

test("completedCivilYears changes only on the exact birthday", () => {
  const birthDate = fromISO("2008-08-01");

  assert.equal(completedCivilYears(birthDate, fromISO("2025-07-31")), 16);
  assert.equal(completedCivilYears(birthDate, fromISO("2025-08-01")), 17);
});

test("completedCivilYears treats March 1 as a leap-day anniversary", () => {
  const leapDayBirth = fromISO("2008-02-29");

  assert.equal(completedCivilYears(leapDayBirth, fromISO("2025-02-28")), 16);
  assert.equal(completedCivilYears(leapDayBirth, fromISO("2025-03-01")), 17);
});

test("completedCivilYears rejects a date before birth", () => {
  assert.throws(
    () => completedCivilYears(fromISO("2008-08-01"), fromISO("2008-07-31")),
    /must not precede birth epoch day/,
  );
});
