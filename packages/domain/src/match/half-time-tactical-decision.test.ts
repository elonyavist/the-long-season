import assert from "node:assert/strict";
import { test } from "vitest";

import { playerId } from "../types/ids.ts";
import { validateHalfTimeTacticalDecisionPlan, type HalfTimeTacticalDecisionPlan } from "./half-time-tactical-decision.ts";

test("validates a complete half-time tactical plan", () => {
  const plan = validPlan();
  const result = validateHalfTimeTacticalDecisionPlan(plan);

  assert.equal(result.status, "valid");
  assert.deepEqual(result.status === "valid" ? result.plan : undefined, plan);
});

test("reports structured facts for missing slots, duplicates, missing goalkeeper, and bench overlap", () => {
  const duplicatePlayer = playerId("player:duplicate");
  const plan: HalfTimeTacticalDecisionPlan = {
    ...validPlan(),
    lineupSlots: [
      { slotId: "slot:one", playerId: duplicatePlayer, roleKey: "striker" },
      { slotId: "slot:two", playerId: duplicatePlayer, roleKey: "center_back" },
      { slotId: "slot:three", playerId: null, roleKey: "center_midfielder" },
    ],
    benchSlots: [
      { slotId: "bench:one", playerId: duplicatePlayer },
      { slotId: "bench:two", playerId: playerId("player:bench") },
      { slotId: "bench:three", playerId: playerId("player:bench") },
    ],
    requiredLineupSize: 3,
  };

  const result = validateHalfTimeTacticalDecisionPlan(plan);

  assert.equal(result.status, "invalid");
  assert.deepEqual(result.status === "invalid" ? result.facts : [], [
    {
      key: "missing_lineup_slot",
      slotId: "slot:three",
    },
    {
      key: "duplicate_lineup_player",
      slotId: "slot:two",
      playerId: duplicatePlayer,
    },
    {
      key: "duplicate_bench_player",
      slotId: "bench:three",
      playerId: playerId("player:bench"),
    },
    {
      key: "player_in_lineup_and_bench",
      slotId: "bench:one",
      playerId: duplicatePlayer,
    },
    {
      key: "missing_goalkeeper",
    },
  ]);
});

test("reports invalid shape and substitution limit facts", () => {
  const plan: HalfTimeTacticalDecisionPlan = {
    ...validPlan(),
    baseFormationId: "",
    currentShape: " ",
    maxSubstitutions: 1,
    substitutions: [
      {
        outgoingPlayerId: playerId("player:out-one"),
        incomingPlayerId: playerId("player:in-one"),
        reasonKey: "half_time_manager_decision",
      },
      {
        outgoingPlayerId: playerId("player:out-two"),
        incomingPlayerId: playerId("player:in-two"),
        reasonKey: "half_time_manager_decision",
      },
    ],
  };

  const result = validateHalfTimeTacticalDecisionPlan(plan);

  assert.equal(result.status, "invalid");
  assert.deepEqual(result.status === "invalid" ? result.facts : [], [
    { key: "invalid_second_half_tactical_setup" },
    { key: "too_many_substitutions" },
  ]);
});

/**
 * Builds a compact valid tactical plan fixture. The validation contract allows
 * a smaller required lineup size so tests can focus on specific facts without
 * manufacturing a full XI in every case.
 */
function validPlan(): HalfTimeTacticalDecisionPlan {
  return {
    baseFormationId: "4-4-2",
    currentShape: "4-4-2",
    requiredLineupSize: 3,
    lineupSlots: [
      { slotId: "slot:gk", playerId: playerId("player:gk"), roleKey: "goalkeeper", positionKey: "gk" },
      { slotId: "slot:def", playerId: playerId("player:def"), roleKey: "center_back" },
      { slotId: "slot:att", playerId: playerId("player:att"), roleKey: "striker" },
    ],
    benchSlots: [
      { slotId: "bench:one", playerId: playerId("player:bench-one") },
      { slotId: "bench:two", playerId: null },
    ],
    substitutions: [],
  };
}
