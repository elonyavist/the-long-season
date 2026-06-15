// @ts-ignore Node test types are introduced with the formal test runner step.
import test from "node:test";
// @ts-ignore Node assert types are introduced with the formal test runner step.
import assert from "node:assert/strict";

import { abilityValue, stateValue } from "./rating.ts";

/**
 * Rating tests protect the two public numeric scales used by the domain:
 * abilities are 0-20, dynamic states are 0-100.
 */
test("abilityValue rejects values below 0 and above 20", () => {
  assert.throws(() => abilityValue(-0.1), /between 0 and 20/);
  assert.throws(() => abilityValue(20.1), /between 0 and 20/);
});

test("abilityValue accepts fractional true values inside range", () => {
  assert.equal(abilityValue(12.75), 12.75);
});

test("stateValue rejects values outside 0 and 100", () => {
  assert.throws(() => stateValue(-1), /between 0 and 100/);
  assert.throws(() => stateValue(101), /between 0 and 100/);
});
