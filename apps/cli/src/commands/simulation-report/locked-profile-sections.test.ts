import assert from "node:assert/strict";
import { test } from "vitest";

import { createLiveMatchControlProfileFacts } from "./live-match-control-profile.ts";
import {
  createLockedProfileFacts,
  LOCKED_MIGRATION_PROFILE_IDS,
  LOCKED_PROFILE_MEASUREMENTS,
} from "./locked-profile-sections.ts";

test("every migrated locked profile has one immutable measurement contract", () => {
  assert.equal(Object.keys(LOCKED_PROFILE_MEASUREMENTS).length, LOCKED_MIGRATION_PROFILE_IDS.length);
  for (const id of LOCKED_MIGRATION_PROFILE_IDS) {
    const measurement = LOCKED_PROFILE_MEASUREMENTS[id];
    assert.ok(measurement.worldCount > 0);
    assert.ok(measurement.seasonCount > 0);
    assert.ok(measurement.includedSectionIds.length > 0);
    assert.ok(measurement.workerCount <= 7);
  }
});

test("balance profiles preserve default PASS and reachable strict FAIL populations", async () => {
  const normal = await createLockedProfileFacts("balance-default-v1");
  const strict = await createLockedProfileFacts("balance-strict-fail-smoke-v1");

  assert.equal(normal.decision, "PASS");
  assert.equal(strict.decision, "FAIL");
  assert.ok(normal.sections.economy !== undefined);
  assert.ok(strict.sections.economy !== undefined);
}, 60_000);

test("live-match producer still completes and reproduces one generated season", () => {
  const report = createLiveMatchControlProfileFacts({
    worldCount: 1,
    seedPrefix: "phase77-focused",
  });

  assert.equal(report.status, "pass");
  assert.equal(report.worldCount, 1);
  assert.equal(report.fixtureCount, 306);
  assert.equal(report.failures.length, 0);
  assert.equal(report.reproducibility.matches, true);
  assert.equal(report.distributions.possession_percent.count, 612);
  assert.equal(report.distributions.penalties_awarded_per_match.count, 306);
  assert.equal(report.distributions.penalty_goals_per_match.count, 306);
}, 20_000);
