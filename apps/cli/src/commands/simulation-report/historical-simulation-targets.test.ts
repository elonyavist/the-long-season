import assert from "node:assert/strict";
import { test } from "vitest";

import {
  HISTORICAL_DIVISION_TABLE_TARGETS,
  HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS,
  INTEGRATED_LEADER_AGE_DRIFT_TARGET,
} from "./historical-simulation-targets.ts";

test("every frozen historical target is a reachable ordered interval", () => {
  const bands = [
    ...Object.values(HISTORICAL_DIVISION_TABLE_TARGETS).flatMap(Object.values),
    ...Object.values(HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS),
    INTEGRATED_LEADER_AGE_DRIFT_TARGET,
  ];

  assert.equal(bands.every(({ min, max }) => Number.isFinite(min) && Number.isFinite(max) && min <= max), true);
  assert.equal(HISTORICAL_DIVISION_TABLE_TARGETS[1].championPoints.min >
    HISTORICAL_DIVISION_TABLE_TARGETS[2].championPoints.min, true);
  assert.notDeepEqual(HISTORICAL_DIVISION_TABLE_TARGETS[2], HISTORICAL_DIVISION_TABLE_TARGETS[3]);
});

test("the season-ten leader gate is one band with the effective 0.50 threshold", () => {
  const register = HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS;

  assert.deepEqual(register.careerGeneratedLeaderShareSeasonTen, { min: 0.5, max: 1 });
  assert.equal("generatedLeaderShareSeasonTen" in register, false);
  assert.equal("openingLeaderShareSeasonTen" in register, false);
});
