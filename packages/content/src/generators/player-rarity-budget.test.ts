import assert from "node:assert/strict";
import { test } from "vitest";

import { FAKE_CLUB_COUNT, FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { buildPlayerRarityAllocation, isBudgetedArchetype } from "./player-rarity-budget.ts";

/** Tests protect league-level rarity budgets for generated lower-division players. */

const FAKE_INPUT = {
  seed: "rarity-budget",
  clubCount: FAKE_CLUB_COUNT,
  playersPerClub: FAKE_PLAYERS_PER_CLUB,
  lineupSize: FAKE_LINEUP_SIZE,
};

test("rarity allocation is deterministic for the same seed", () => {
  assert.deepEqual(buildPlayerRarityAllocation(FAKE_INPUT), buildPlayerRarityAllocation(FAKE_INPUT));
});

test("third-division rarity budgets stay inside configured limits", () => {
  for (let index = 0; index < 40; index += 1) {
    const allocation = buildPlayerRarityAllocation({
      ...FAKE_INPUT,
      seed: `rarity-budget-${index}`,
    });

    assert.equal(allocation.budget.whiteFlyCount >= 1, true);
    assert.equal(allocation.budget.whiteFlyCount <= 4, true);
    assert.equal(allocation.budget.seriousProspectCount >= 2, true);
    assert.equal(allocation.budget.seriousProspectCount <= 3, true);
    assert.equal(allocation.budget.rareProdigyCount >= 0, true);
    assert.equal(allocation.budget.rareProdigyCount <= 1, true);
  }
});

test("rarity assignments match the requested budget count", () => {
  const allocation = buildPlayerRarityAllocation(FAKE_INPUT);
  const assignments = Object.values(allocation.assignmentsBySlotKey);

  assert.equal(
    assignments.length,
    allocation.budget.whiteFlyCount + allocation.budget.seriousProspectCount + allocation.budget.rareProdigyCount,
  );
  assert.equal(assignments.every((assignment) => isBudgetedArchetype(assignment.archetypeKey)), true);
});
