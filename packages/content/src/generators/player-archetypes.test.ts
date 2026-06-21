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
    assertValidAgeRange(archetype.ageYears);
    assertValidNumericRange(archetype.currentAbilityOffset);
    assertValidNumericRange(archetype.potentialUplift);
    assert.equal(["limited", "category", "interesting", "serious", "elite"].includes(archetype.potentialClass), true);
    assert.equal(Number.isSafeInteger(archetype.lineupWeight), true);
    assert.equal(Number.isSafeInteger(archetype.reserveWeight), true);
    assert.equal(archetype.lineupWeight >= 0, true);
    assert.equal(archetype.reserveWeight >= 0, true);
  }
});

test("prospect archetypes are younger and carry more upside than regulars", () => {
  const regular = getGeneratedPlayerArchetype("senior_regular");
  const youth = getGeneratedPlayerArchetype("normal_youth");
  const goodProspect = getGeneratedPlayerArchetype("good_prospect");
  const seriousProspect = getGeneratedPlayerArchetype("serious_prospect");
  const prodigy = getGeneratedPlayerArchetype("rare_prodigy");

  assert.equal(youth.ageYears.maxInclusive < regular.ageYears.minInclusive, true);
  assert.equal(goodProspect.potentialUplift.minInclusive > regular.potentialUplift.maxInclusive, true);
  assert.equal(seriousProspect.potentialUplift.minInclusive > goodProspect.potentialUplift.minInclusive, true);
  assert.equal(prodigy.potentialUplift.minInclusive > seriousProspect.potentialUplift.minInclusive, true);
  assert.equal(prodigy.potentialClass, "elite");
});

test("rare prodigies are possible but uncommon in reserve generation", () => {
  const reserveWeightTotal = sumWeights(GENERATED_PLAYER_ARCHETYPE_KEYS.map((key) => getGeneratedPlayerArchetype(key)));
  const prodigy = getGeneratedPlayerArchetype("rare_prodigy");

  assert.equal(prodigy.reserveWeight > 0, true);
  assert.equal(prodigy.reserveWeight / reserveWeightTotal < 0.02, true);
  assert.equal(prodigy.lineupWeight, 0);
});

/** Asserts an age range is deterministic-friendly and integer-based. */
function assertValidAgeRange(range: GeneratedPlayerArchetype["ageYears"]): void {
  assert.equal(Number.isSafeInteger(range.minInclusive), true);
  assert.equal(Number.isSafeInteger(range.maxInclusive), true);
  assert.equal(range.minInclusive <= range.maxInclusive, true);
}

/** Asserts a numeric generation range is deterministic-friendly. */
function assertValidNumericRange(range: GeneratedPlayerArchetype["currentAbilityOffset"]): void {
  assert.equal(Number.isFinite(range.minInclusive), true);
  assert.equal(Number.isFinite(range.maxInclusive), true);
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
