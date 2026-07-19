import assert from "node:assert/strict";
import { test } from "vitest";

import { youthDevelopmentLevel } from "./youth-academy-state.ts";

/** Tests protect the explicit `1..5` academy-development value contract. */

test("youthDevelopmentLevel accepts only integer values from 1 to 5", () => {
  assert.equal(youthDevelopmentLevel(1), 1);
  assert.equal(youthDevelopmentLevel(5), 5);
  assert.throws(() => youthDevelopmentLevel(0), /between 1 and 5/);
  assert.throws(() => youthDevelopmentLevel(6), /between 1 and 5/);
  assert.throws(() => youthDevelopmentLevel(3.5), /safe integer/);
});
