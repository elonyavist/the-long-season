import assert from "node:assert/strict";
import { test } from "vitest";

import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  getGeneratedPlayerArchetype,
} from "./player-archetypes.ts";
import {
  PLAYER_POTENTIAL_RARITY_BANDS,
  potentialRarityBudgetForDivision,
  potentialRarityForArchetype,
  potentialRarityForPotentialClass,
} from "./player-potential-rarity.ts";

test("every generated archetype maps to the Phase 33 potential rarity scale", () => {
  for (const key of GENERATED_PLAYER_ARCHETYPE_KEYS) {
    const rarity = potentialRarityForArchetype(key);
    const archetype = getGeneratedPlayerArchetype(key);

    assert.equal(PLAYER_POTENTIAL_RARITY_BANDS.includes(rarity), true, key);
    assert.equal(potentialRarityForPotentialClass(archetype.potentialClass), rarity, key);
  }
});

test("third-division rarity budget keeps high and elite potential bounded", () => {
  const budget = potentialRarityBudgetForDivision("third_division");

  assert.equal(budget.ordinary, "majority");
  assert.equal(budget.highPerDivision.minInclusive, 2);
  assert.equal(budget.highPerDivision.maxInclusive, 5);
  assert.equal(budget.elitePerDivision.minInclusive, 0);
  assert.equal(budget.elitePerDivision.maxInclusive, 1);
  assert.equal(budget.eliteChance > 0 && budget.eliteChance < 1, true);
});
