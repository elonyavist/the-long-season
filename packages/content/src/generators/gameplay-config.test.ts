import assert from "node:assert/strict";
import { test } from "vitest";

import { createFakeGameplayConfig } from "./gameplay-config.ts";
import { createFakeLeagueSystem } from "./league-system.ts";

/** Shared gameplay configuration tests prevent facade-specific tuning copies. */
test("focused league uses the reusable generated gameplay configuration", () => {
  const expected = createFakeGameplayConfig();
  const league = createFakeLeagueSystem();

  assert.deepEqual(league.matchEngineConfig, expected.matchEngineConfig);
  assert.deepEqual(league.roleWeights, expected.roleWeights);
  assert.deepEqual(league.stateMultiplierCurves, expected.stateMultiplierCurves);
});
