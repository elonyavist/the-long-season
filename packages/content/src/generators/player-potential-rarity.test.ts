import assert from "node:assert/strict";
import { test } from "vitest";

import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  getGeneratedPlayerArchetype,
} from "./player-archetypes.ts";
import {
  PLAYER_POTENTIAL_RARITY_BANDS,
  currentAbilityRarityLaneForYouthProspect,
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

test("youth current lane boost is limited to stronger prospects and academies", () => {
  assert.equal(currentAbilityRarityLaneForYouthProspect("normal_youth", 5), "normal");
  assert.equal(currentAbilityRarityLaneForYouthProspect("good_prospect", 4), "normal");
  assert.equal(currentAbilityRarityLaneForYouthProspect("good_prospect", 5), "rare");
  assert.equal(currentAbilityRarityLaneForYouthProspect("serious_prospect", 3), "normal");
  assert.equal(currentAbilityRarityLaneForYouthProspect("serious_prospect", 4), "rare");
  assert.equal(currentAbilityRarityLaneForYouthProspect("rare_prodigy", 5), "rare");
});
