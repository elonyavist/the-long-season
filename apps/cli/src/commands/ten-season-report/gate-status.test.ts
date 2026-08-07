import assert from "node:assert/strict";
import { test } from "vitest";

import {
  longRunGateExitCode,
  longRunGateStatus,
  type LongRunGateOutcomeFacts,
} from "./gate-status.ts";

const GREEN_RUN: LongRunGateOutcomeFacts = {
  failedWorldCount: 0,
  playerEconomyViolationCount: 0,
  closingPlayerMarketFitStatus: "pass",
};

test("a run with nothing wrong passes and exits zero", () => {
  assert.equal(longRunGateStatus(GREEN_RUN), "pass");
  assert.equal(longRunGateExitCode(longRunGateStatus(GREEN_RUN)), 0);
});

test("a closing division value-fit failure alone fails the run and exits one", () => {
  // The whole point of the extraction: one green run, changed in exactly one
  // fact, proves the closing-value fit is wired through to the exit code. A
  // gate that reports `fail` and exits `0` is worse than no gate.
  const failed: LongRunGateOutcomeFacts = { ...GREEN_RUN, closingPlayerMarketFitStatus: "fail" };

  assert.equal(longRunGateStatus(failed), "fail");
  assert.equal(longRunGateExitCode(longRunGateStatus(failed)), 1);
});

test("each failing fact on its own is enough to fail the run", () => {
  const singleFailures: readonly LongRunGateOutcomeFacts[] = [
    { ...GREEN_RUN, failedWorldCount: 1 },
    { ...GREEN_RUN, playerEconomyViolationCount: 1 },
    { ...GREEN_RUN, closingPlayerMarketFitStatus: "fail" },
  ];

  for (const facts of singleFailures) {
    assert.equal(longRunGateStatus(facts), "fail", JSON.stringify(facts));
    assert.equal(longRunGateExitCode(longRunGateStatus(facts)), 1);
  }
});

test("sample size is not a term in the gate, so a small run cannot fail for being small", () => {
  // A test used to assert that a two-world run exits `1`, under a comment
  // saying two worlds cannot prove the cohort bands. Nothing here counts
  // worlds. What that test actually caught was whether one seed's population
  // happened to hold a division-value outlier, which this step's change to
  // squad generation removed. Recorded here so the belief cannot come back:
  // if a small sample must fail, some *other* owner has to make it fail, and
  // today there is none.
  assert.equal(longRunGateStatus(GREEN_RUN), "pass");
  assert.equal(longRunGateExitCode("pass"), 0);
});
