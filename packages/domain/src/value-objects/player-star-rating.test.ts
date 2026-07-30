import assert from "node:assert/strict";
import { test } from "vitest";

import {
  isPlayerStarRating,
  PLAYER_STAR_RATINGS,
  playerStarRating,
} from "./player-star-rating.ts";

/** The public scale is closed so UI, diagnostics, and saves share one language. */
test("player star ratings contain every 1..6 half step exactly once", () => {
  assert.deepEqual(PLAYER_STAR_RATINGS, [
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
    5.5,
    6,
  ]);
});

test("playerStarRating accepts supported values and rejects other numbers", () => {
  assert.equal(playerStarRating(1), 1);
  assert.equal(playerStarRating(5.5), 5.5);
  assert.equal(playerStarRating(6), 6);
  assert.equal(isPlayerStarRating(3.5), true);
  assert.equal(isPlayerStarRating(3.25), false);
  assert.throws(() => playerStarRating(0.5), /1\.\.6 half step/);
  assert.throws(() => playerStarRating(6.5), /1\.\.6 half step/);
});
