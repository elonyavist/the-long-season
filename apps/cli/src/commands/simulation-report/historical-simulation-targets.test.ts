import assert from "node:assert/strict";
import { test } from "vitest";

import {
  HISTORICAL_DIVISION_TABLE_TARGETS,
  HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS,
} from "./historical-simulation-targets.ts";

test("every frozen historical target is a reachable ordered interval", () => {
  const bands = [
    ...Object.values(HISTORICAL_DIVISION_TABLE_TARGETS).flatMap(Object.values),
    ...Object.values(HISTORICAL_FIRST_DIVISION_PLAYER_TARGETS),
  ];

  assert.equal(bands.every(({ min, max }) => Number.isFinite(min) && Number.isFinite(max) && min <= max), true);
  assert.equal(HISTORICAL_DIVISION_TABLE_TARGETS[1].championPoints.min >
    HISTORICAL_DIVISION_TABLE_TARGETS[2].championPoints.min, true);
  assert.notDeepEqual(HISTORICAL_DIVISION_TABLE_TARGETS[2], HISTORICAL_DIVISION_TABLE_TARGETS[3]);
});
