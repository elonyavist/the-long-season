import assert from "node:assert/strict";
import { test } from "vitest";

import { FAKE_CLUB_COUNT, FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { deriveYouthDevelopmentLevel } from "./youth-development-level.ts";
import {
  buildPlayerRarityAllocation,
  buildYouthPlayerRarityAllocation,
  isBudgetedArchetype,
} from "./player-rarity-budget.ts";

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
    assert.equal(allocation.budget.seriousProspectCount <= 5, true);
    assert.equal(allocation.budget.rareProdigyCount >= 0, true);
    assert.equal(allocation.budget.rareProdigyCount <= 1, true);
  }
});

test("rarity allocation changes by season key while remaining deterministic", () => {
  const first = buildPlayerRarityAllocation({
    ...FAKE_INPUT,
    seasonKey: "season:0001",
  });
  const second = buildPlayerRarityAllocation({
    ...FAKE_INPUT,
    seasonKey: "season:0002",
  });

  assert.deepEqual(first, buildPlayerRarityAllocation({ ...FAKE_INPUT, seasonKey: "season:0001" }));
  assert.notDeepEqual(first, second);
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

test("initial youth rarity allocation is deterministic and obeys division caps", () => {
  for (let index = 0; index < 100; index += 1) {
    const input = {
      seed: `youth-rarity-budget-${index}`,
      division: "third_division" as const,
      seasonKey: "season:demo-001",
      clubCount: FAKE_CLUB_COUNT,
      playersPerClub: 11,
    };
    const allocation = buildYouthPlayerRarityAllocation(input);
    const assignments = Object.values(allocation.assignmentsBySlotKey);

    assert.deepEqual(allocation, buildYouthPlayerRarityAllocation(input));
    assert.equal(allocation.budget.seriousProspectCount >= 2, true);
    assert.equal(allocation.budget.seriousProspectCount <= 5, true);
    assert.equal(allocation.budget.rareProdigyCount >= 0, true);
    assert.equal(allocation.budget.rareProdigyCount <= 1, true);
    assert.equal(
      assignments.length,
      allocation.budget.seriousProspectCount + allocation.budget.rareProdigyCount,
    );
    assert.equal(new Set(assignments.map((assignment) => assignment.slotKey)).size, assignments.length);
  }
});

test("initial youth rarity allocation mildly favors stronger academies without changing budget size", () => {
  let highLevelAssignments = 0;
  let lowLevelAssignments = 0;

  for (let index = 0; index < 100; index += 1) {
    const allocation = buildYouthPlayerRarityAllocation({
      seed: `youth-development-weight-${index}`,
      division: "third_division",
      seasonKey: "season:demo-001",
      clubCount: 2,
      playersPerClub: 11,
      clubDevelopmentLevelsByClubNumber: {
        1: deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 10 }),
        2: deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 3 }),
      },
    });

    for (const assignment of Object.values(allocation.assignmentsBySlotKey)) {
      if (assignment.slotKey.startsWith("1:")) highLevelAssignments += 1;
      if (assignment.slotKey.startsWith("2:")) lowLevelAssignments += 1;
    }
  }

  assert.equal(highLevelAssignments > lowLevelAssignments, true);
});
