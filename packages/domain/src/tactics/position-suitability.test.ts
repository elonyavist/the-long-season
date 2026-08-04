import assert from "node:assert/strict";
import { test } from "vitest";

import { evaluatePositionSuitability, isCoveringSuitability, scorePlayerForFormationSlot } from "./position-suitability.ts";

/**
 * Position-suitability tests preserve strict football meaning. Broadly making
 * every position compatible would hide the squad-building gaps Phase 12 needs.
 */
test("left backs are natural in left full-back slots", () => {
  assert.equal(evaluatePositionSuitability(["lb"], { playerRole: "left_full_back" }), "natural");
});

test("wide midfielders adapt to same-side full-back and winger slots", () => {
  assert.equal(evaluatePositionSuitability(["lwb"], { playerRole: "left_full_back" }), "adapted");
  assert.equal(evaluatePositionSuitability(["lwb"], { playerRole: "left_midfielder" }), "natural");
  assert.equal(evaluatePositionSuitability(["lwb"], { playerRole: "left_winger" }), "adapted");
});

test("center backs are not natural full backs", () => {
  assert.equal(evaluatePositionSuitability(["cb"], { playerRole: "center_back" }), "natural");
  assert.equal(evaluatePositionSuitability(["cb"], { playerRole: "left_full_back" }), "weak");
});

test("wingers are not equivalent to central midfielders", () => {
  assert.equal(evaluatePositionSuitability(["rw"], { playerRole: "right_winger" }), "natural");
  assert.equal(evaluatePositionSuitability(["rw"], { playerRole: "central_midfielder" }), "invalid");
});

test("strikers are weak coverage for attacking midfielders", () => {
  assert.equal(evaluatePositionSuitability(["st"], { playerRole: "striker" }), "natural");
  assert.equal(evaluatePositionSuitability(["st"], { playerRole: "attacking_midfielder" }), "weak");
});

test("best suitability wins when a player has multiple natural positions", () => {
  assert.equal(evaluatePositionSuitability(["cb", "rb"], { playerRole: "right_full_back" }), "natural");
});

test("only natural and adapted suitability count as real coverage", () => {
  assert.equal(isCoveringSuitability("natural"), true);
  assert.equal(isCoveringSuitability("adapted"), true);
  assert.equal(isCoveringSuitability("weak"), false);
  assert.equal(isCoveringSuitability("invalid"), false);
});

test("player strength can make a valid adapted player outrank a mediocre natural player", () => {
  const slot = { playerRole: "attacking_midfielder" as const };
  const strongAdaptedScore = scorePlayerForFormationSlot({ naturalPositions: ["cm"], playerStrength: 90, slot });
  const mediocreNaturalScore = scorePlayerForFormationSlot({ naturalPositions: ["am"], playerStrength: 60, slot });

  assert.equal(strongAdaptedScore > mediocreNaturalScore, true);
});

/**
 * Holds the selection bonus on the ability scale it is added to (Step 09).
 *
 * Only a bonus small against the `0-20` ability range leaves ability able to
 * decide anything. At the `35 / 25` this table once held, one suitability step
 * was worth more than half the entire range, so positional fit alone settled
 * every comparison and every threshold written in ability points - the AI
 * substitution regressions among them - silently stopped binding.
 */
test("one suitability step is worth about one ability point, not half the scale", () => {
  const slot = { playerRole: "attacking_midfielder" as const };
  const natural = scorePlayerForFormationSlot({ naturalPositions: ["am"], playerStrength: 10, slot });
  const adapted = scorePlayerForFormationSlot({ naturalPositions: ["cm"], playerStrength: 10, slot });

  assert.equal(natural - adapted < 2, true);
  assert.equal(
    scorePlayerForFormationSlot({ naturalPositions: ["cm"], playerStrength: 12, slot }) > natural,
    true,
  );
});

test("side metadata gives a small deterministic bonus without changing role suitability", () => {
  const rightWideScore = scorePlayerForFormationSlot({
    naturalPositions: ["rw"],
    playerStrength: 70,
    slot: { playerRole: "right_winger", side: "right" },
  });
  const leftWideScore = scorePlayerForFormationSlot({
    naturalPositions: ["lw"],
    playerStrength: 70,
    slot: { playerRole: "right_winger", side: "right" },
  });

  assert.equal(rightWideScore > leftWideScore, true);
});
