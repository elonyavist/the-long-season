import assert from "node:assert/strict";
import { test } from "vitest";

import { evaluatePositionSuitability, isCoveringSuitability } from "./position-suitability.ts";

/**
 * Position-suitability tests preserve strict football meaning. Broadly making
 * every position compatible would hide the squad-building gaps Phase 12 needs.
 */
test("left backs are natural in left full-back slots", () => {
  assert.equal(evaluatePositionSuitability(["lb"], { positionFamily: "left_full_back" }), "natural");
});

test("wing backs adapt to same-side full-back and wide-midfield slots", () => {
  assert.equal(evaluatePositionSuitability(["lwb"], { positionFamily: "left_full_back" }), "adapted");
  assert.equal(evaluatePositionSuitability(["lwb"], { positionFamily: "left_midfielder" }), "adapted");
});

test("center backs are not natural full backs", () => {
  assert.equal(evaluatePositionSuitability(["cb"], { positionFamily: "center_back" }), "natural");
  assert.equal(evaluatePositionSuitability(["cb"], { positionFamily: "left_full_back" }), "weak");
});

test("wingers are not equivalent to central midfielders", () => {
  assert.equal(evaluatePositionSuitability(["rw"], { positionFamily: "right_winger" }), "natural");
  assert.equal(evaluatePositionSuitability(["rw"], { positionFamily: "central_midfielder" }), "invalid");
});

test("strikers are not equivalent to attacking midfielders", () => {
  assert.equal(evaluatePositionSuitability(["st"], { positionFamily: "striker" }), "natural");
  assert.equal(evaluatePositionSuitability(["st"], { positionFamily: "second_striker" }), "adapted");
  assert.equal(evaluatePositionSuitability(["st"], { positionFamily: "attacking_midfielder" }), "weak");
});

test("best suitability wins when a player has multiple natural positions", () => {
  assert.equal(evaluatePositionSuitability(["cb", "rb"], { positionFamily: "right_full_back" }), "natural");
});

test("only natural and adapted suitability count as real coverage", () => {
  assert.equal(isCoveringSuitability("natural"), true);
  assert.equal(isCoveringSuitability("adapted"), true);
  assert.equal(isCoveringSuitability("weak"), false);
  assert.equal(isCoveringSuitability("invalid"), false);
});
