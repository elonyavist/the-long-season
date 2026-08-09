import assert from "node:assert/strict";
import { test } from "vitest";

import { playerStateCurves, selectPlayerStateCurvesConfig } from "./player-state-curves.ts";

test("player-state curves select one validated immutable version", () => {
  assert.equal(selectPlayerStateCurvesConfig(), playerStateCurves);
  assert.equal(playerStateCurves.version, "player-state-curves-v2");
  assert.equal(Object.isFrozen(playerStateCurves), true);
});
