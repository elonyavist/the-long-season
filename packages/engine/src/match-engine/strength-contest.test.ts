import assert from "node:assert/strict";
import { test } from "vitest";

import { strengthContestPair } from "./strength-contest.ts";

test("an equal department contest is byte-identical at every positive multiplier", () => {
  assert.deepEqual(strengthContestPair(14, 14, 1), { own: 14, opponent: 14 });
  assert.deepEqual(strengthContestPair(14, 14, 1.25), { own: 14, opponent: 14 });
  assert.deepEqual(strengthContestPair(14, 14, 1.5), { own: 14, opponent: 14 });
});

test("the contest conserves its midpoint and expands only the observed gap", () => {
  const contest = strengthContestPair(17, 12, 1.25);

  assert.equal((contest.own + contest.opponent) / 2, 14.5);
  assert.equal(contest.own - contest.opponent, 6.25);
});

test("swapping the teams swaps the complete contest pair", () => {
  const forward = strengthContestPair(16, 11, 1.25);
  const reverse = strengthContestPair(11, 16, 1.25);

  assert.deepEqual(reverse, { own: forward.opponent, opponent: forward.own });
});
