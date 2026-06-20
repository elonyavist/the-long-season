import assert from "node:assert/strict";
import { playerId, stateValue, type PlayerDynamicState, type PlayerId } from "@game/domain";
import { test } from "vitest";

import {
  DEFAULT_FITNESS_RULES,
  FitnessStateError,
  recoverFitnessForPlayers,
  spendFitnessForPlayers,
  type FitnessRules,
} from "./fitness.ts";

/**
 * Fitness helper tests cover pure copy-on-write state transitions only.
 */

test("spendFitnessForPlayers spends one match of fitness for selected players", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 100],
  ]);

  const nextStates = spendFitnessForPlayers({ playerStates, playerIds: [id] });

  assert.equal(Number(nextStates[id]?.fitness), 92);
  assert.equal(Number(playerStates[id]?.fitness), 100);
});

test("recoverFitnessForPlayers recovers fitness over calendar days", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 70],
  ]);

  const nextStates = recoverFitnessForPlayers({ playerStates, playerIds: [id], dayCount: 3 });

  assert.equal(Number(nextStates[id]?.fitness), 85);
  assert.equal(Number(playerStates[id]?.fitness), 70);
});

test("fitness updates clamp values to the rules range", () => {
  const id = playerId("player:000001");
  const rules: FitnessRules = {
    ...DEFAULT_FITNESS_RULES,
    matchFitnessCost: 12,
    dailyRecovery: 8,
  };
  const lowStates = states([
    [id, 5],
  ]);
  const highStates = states([
    [id, 98],
  ]);

  const spent = spendFitnessForPlayers({ playerStates: lowStates, playerIds: [id], rules });
  const recovered = recoverFitnessForPlayers({ playerStates: highStates, playerIds: [id], dayCount: 2, rules });

  assert.equal(Number(spent[id]?.fitness), 0);
  assert.equal(Number(recovered[id]?.fitness), 100);
});

test("players outside the ordered update list are unchanged", () => {
  const selectedId = playerId("player:000001");
  const restingId = playerId("player:000002");
  const playerStates = states([
    [selectedId, 100],
    [restingId, 60],
  ]);

  const spent = spendFitnessForPlayers({ playerStates, playerIds: [selectedId] });
  const recovered = recoverFitnessForPlayers({ playerStates, playerIds: [selectedId], dayCount: 2 });

  assert.equal(Number(spent[selectedId]?.fitness), 92);
  assert.equal(Number(spent[restingId]?.fitness), 60);
  assert.equal(Number(recovered[selectedId]?.fitness), 100);
  assert.equal(Number(recovered[restingId]?.fitness), 60);
});

test("same fitness input produces identical output", () => {
  const firstId = playerId("player:000001");
  const secondId = playerId("player:000002");
  const playerStates = states([
    [firstId, 80],
    [secondId, 90],
  ]);
  const playerIds = [firstId, secondId];

  const first = spendFitnessForPlayers({ playerStates, playerIds });
  const second = spendFitnessForPlayers({ playerStates, playerIds });

  assert.deepEqual(first, second);
});

test("fitness helpers reject missing player states", () => {
  const id = playerId("player:000001");
  const missingId = playerId("player:000002");
  const playerStates = states([
    [id, 100],
  ]);

  assert.throws(
    () => spendFitnessForPlayers({ playerStates, playerIds: [missingId] }),
    (error) => error instanceof FitnessStateError && error.code === "missing_player_state",
  );
  assert.throws(
    () => recoverFitnessForPlayers({ playerStates, playerIds: [missingId], dayCount: 1 }),
    (error) => error instanceof FitnessStateError && error.code === "missing_player_state",
  );
});

test("fitness helpers reject duplicate player IDs in one ordered update", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 100],
  ]);

  assert.throws(
    () => spendFitnessForPlayers({ playerStates, playerIds: [id, id] }),
    (error) => error instanceof FitnessStateError && error.code === "duplicate_player_id",
  );
});

test("recoverFitnessForPlayers rejects non-positive day counts", () => {
  const id = playerId("player:000001");
  const playerStates = states([
    [id, 100],
  ]);

  assert.throws(
    () => recoverFitnessForPlayers({ playerStates, playerIds: [id], dayCount: 0 }),
    (error) => error instanceof FitnessStateError && error.code === "invalid_day_count",
  );
});

/**
 * Builds a deterministic player-state lookup for tests.
 */
function states(entries: readonly (readonly [PlayerId, number])[]): Readonly<Record<PlayerId, PlayerDynamicState>> {
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};

  for (const [id, fitness] of entries) {
    playerStates[id] = {
      fitness: stateValue(fitness),
      form: stateValue(50),
      morale: stateValue(50),
    };
  }

  return playerStates;
}
