import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createFakeGameplayConfig,
  PRODUCT_STRENGTH_GAP_MULTIPLIER,
} from "./gameplay-config.ts";
import { createFakeLeagueSystem } from "./league-system.ts";

/** Shared gameplay configuration tests prevent facade-specific tuning copies. */
test("focused league uses the reusable generated gameplay configuration", () => {
  const expected = createFakeGameplayConfig();
  const league = createFakeLeagueSystem();

  assert.deepEqual(league.matchEngineConfig, expected.matchEngineConfig);
  assert.deepEqual(league.roleWeights, expected.roleWeights);
  assert.equal(league.matchEngineConfig.strengthGapMultiplier, PRODUCT_STRENGTH_GAP_MULTIPLIER);
  assert.deepEqual(league.stateMultiplierCurves, expected.stateMultiplierCurves);
});

test("canonical conversion bands remain shared across every division", () => {
  assert.deepEqual(
    createFakeGameplayConfig().matchEngineConfig.conversionBands.map(
      ({ bandKey, goalProbability }) => ({ bandKey, goalProbability }),
    ),
    [
      { bandKey: "low", goalProbability: 0.0575 },
      { bandKey: "medium", goalProbability: 0.11 },
      { bandKey: "high", goalProbability: 0.193 },
    ],
  );
});
