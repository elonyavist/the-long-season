import assert from "node:assert/strict";
import { test } from "vitest";

import { playerId, type PlayerId } from "@game/domain";

import { assignFootballXi, type FootballXiSlotCandidate } from "./football-xi-assignment.ts";

test("the best eleven is chosen, not the best player for each slot in turn", () => {
  // Taking the best player for the first slot costs more at the second than it
  // gained: 10 + 2 = 12 against 9 + 9 = 18.
  const versatile = playerId("player:versatile");
  const specialist = playerId("player:specialist");
  const assignment = assignFootballXi({
    candidatesBySlot: [
      ranked([[versatile, 10], [specialist, 9]]),
      ranked([[versatile, 9], [specialist, 2]]),
    ],
  });

  assert.deepEqual(assignment?.candidateBySlot.map((candidate) => candidate.playerId), [specialist, versatile]);
  assert.equal(assignment?.totalScore, 18);
});

test("filling every slot outranks the total the eleven is worth", () => {
  // The only footballer who can fill the second slot is also the best at the
  // first by a wide margin. A team with a hole in it is not a better team.
  const onlyCover = playerId("player:only-cover");
  const other = playerId("player:other");
  const assignment = assignFootballXi({
    candidatesBySlot: [
      ranked([[onlyCover, 40], [other, 1]]),
      ranked([[onlyCover, 5]]),
    ],
  });

  assert.deepEqual(assignment?.candidateBySlot.map((candidate) => candidate.playerId), [other, onlyCover]);
});

test("a shape no complete eleven can fill has no assignment", () => {
  const single = playerId("player:single");

  assert.equal(assignFootballXi({ candidatesBySlot: [ranked([[single, 10]]), []] }), undefined);
  assert.equal(assignFootballXi({ candidatesBySlot: [ranked([[single, 10]]), ranked([[single, 8]])] }), undefined);
  assert.equal(assignFootballXi({ candidatesBySlot: [] }), undefined);
});

/**
 * Fixes what happens when two footballers are genuinely worth the same.
 *
 * Without a stated rule the answer would be whichever the search reached first,
 * which is stable only by accident and changes the moment the algorithm does.
 */
test("equal scores resolve to the candidate each slot already ranks higher", () => {
  const first = playerId("player:a");
  const second = playerId("player:b");
  const assignment = assignFootballXi({
    candidatesBySlot: [
      ranked([[first, 10], [second, 10]]),
      ranked([[second, 10], [first, 10]]),
    ],
  });

  assert.deepEqual(assignment?.candidateBySlot.map((candidate) => candidate.playerId), [first, second]);
});

test("the same candidates always produce the same eleven", () => {
  const candidatesBySlot = [
    ranked([[playerId("player:a"), 10], [playerId("player:b"), 10], [playerId("player:c"), 9.5]]),
    ranked([[playerId("player:c"), 10], [playerId("player:a"), 9.5], [playerId("player:b"), 9.5]]),
    ranked([[playerId("player:b"), 8], [playerId("player:a"), 8], [playerId("player:c"), 8]]),
  ];
  const first = assignFootballXi({ candidatesBySlot });

  for (let run = 0; run < 5; run += 1) {
    assert.deepEqual(assignFootballXi({ candidatesBySlot }), first);
  }
});

/** Builds one slot's candidates already in canonical best-first order. */
function ranked(entries: ReadonlyArray<readonly [PlayerId, number]>): readonly FootballXiSlotCandidate[] {
  return entries.map(([id, score], rank) => ({ playerId: id, score, rank }));
}
