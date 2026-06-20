import assert from "node:assert/strict";
import { test } from "vitest";

import { createFakeLeagueSystem } from "./league-system.ts";

/**
 * Fake league-system tests lock content-owned configuration without importing
 * engine contracts into the content package.
 */

test("fake league exposes a bounded deterministic fitness multiplier curve", () => {
  const league = createFakeLeagueSystem();
  const curve = league.stateMultiplierCurves.fitness;

  assert.deepEqual(curve, [
    { maxValueInclusive: 39, multiplier: 0.88 },
    { maxValueInclusive: 59, multiplier: 0.94 },
    { maxValueInclusive: 79, multiplier: 0.98 },
    { maxValueInclusive: 100, multiplier: 1 },
  ]);
});

test("fake league keeps all generated players fully fit initially", () => {
  const league = createFakeLeagueSystem();

  for (const playerId of league.playerIds) {
    const playerState = league.playerStates[playerId];

    assert.notEqual(playerState, undefined);
    assert.equal(Number(playerState?.fitness), 100);
  }
});
