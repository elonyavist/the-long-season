import assert from "node:assert/strict";
import { test } from "vitest";

import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  GENERATED_PLAYER_ARCHETYPES,
  getGeneratedPlayerArchetype,
  type GeneratedPlayerArchetype,
} from "./player-archetypes.ts";

/**
 * Player-archetype tests protect deterministic content data before it is wired
 * into generated squad creation.
 */

test("generated player archetype keys match the exported definitions", () => {
  assert.deepEqual(Object.keys(GENERATED_PLAYER_ARCHETYPES), GENERATED_PLAYER_ARCHETYPE_KEYS);
});

test("generated player archetypes have valid numeric ranges and weights", () => {
  for (const key of GENERATED_PLAYER_ARCHETYPE_KEYS) {
    const archetype = getGeneratedPlayerArchetype(key);

    assert.equal(archetype.key, key);
    assertValidRange(archetype.ageYears);
    assertValidRange(archetype.currentAbilityOffset);
    assertValidRange(archetype.potentialUplift);
    assert.equal(Number.isSafeInteger(archetype.lineupWeight), true);
    assert.equal(Number.isSafeInteger(archetype.reserveWeight), true);
    assert.equal(archetype.lineupWeight >= 0, true);
    assert.equal(archetype.reserveWeight >= 0, true);
  }
});

test("prospect archetypes are younger and carry more upside than regulars", () => {
  const regular = getGeneratedPlayerArchetype("first_team_regular");
  const prospect = getGeneratedPlayerArchetype("prospect");
  const highPotential = getGeneratedPlayerArchetype("high_potential_prospect");
  const wonderkid = getGeneratedPlayerArchetype("rare_wonderkid");

  assert.equal(prospect.ageYears.maxInclusive < regular.ageYears.minInclusive, true);
  assert.equal(highPotential.potentialUplift.minInclusive > regular.potentialUplift.maxInclusive, true);
  assert.equal(wonderkid.potentialUplift.minInclusive > highPotential.potentialUplift.minInclusive, true);
});

test("rare wonderkids are possible but uncommon in reserve generation", () => {
  const reserveWeightTotal = sumWeights(GENERATED_PLAYER_ARCHETYPE_KEYS.map((key) => getGeneratedPlayerArchetype(key)));
  const wonderkid = getGeneratedPlayerArchetype("rare_wonderkid");

  assert.equal(wonderkid.reserveWeight > 0, true);
  assert.equal(wonderkid.reserveWeight / reserveWeightTotal < 0.02, true);
  assert.equal(wonderkid.lineupWeight, 0);
});

/** Asserts an inclusive numeric range is deterministic-friendly. */
function assertValidRange(range: GeneratedPlayerArchetype["ageYears"]): void {
  assert.equal(Number.isSafeInteger(range.minInclusive), true);
  assert.equal(Number.isSafeInteger(range.maxInclusive), true);
  assert.equal(range.minInclusive <= range.maxInclusive, true);
}

/** Sums reserve weights in explicit archetype order. */
function sumWeights(archetypes: readonly GeneratedPlayerArchetype[]): number {
  let total = 0;

  for (const archetype of archetypes) {
    total += archetype.reserveWeight;
  }

  return total;
}
