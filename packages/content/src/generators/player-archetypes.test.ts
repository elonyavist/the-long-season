import assert from "node:assert/strict";
import { test } from "vitest";

import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  GENERATED_PLAYER_ARCHETYPES,
  getGeneratedPlayerArchetype,
  resolveGeneratedExceptionalProfile,
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
  assert.equal(goodProspect.potentialClass, "interesting");
  assert.equal(seriousProspect.potentialClass, "serious");
  assert.equal(prodigy.potentialClass, "elite");
});

test("rare prodigies are possible but uncommon in reserve generation", () => {
  const reserveWeightTotal = sumWeights(GENERATED_PLAYER_ARCHETYPE_KEYS.map((key) => getGeneratedPlayerArchetype(key)));
  const prodigy = getGeneratedPlayerArchetype("rare_prodigy");

  assert.equal(prodigy.reserveWeight > 0, true);
  assert.equal(prodigy.reserveWeight / reserveWeightTotal < 0.02, true);
  assert.equal(prodigy.lineupWeight, 0);
});

test("current-six allocation wins over potential-only prodigy precedence", () => {
  assert.deepEqual(
    resolveGeneratedExceptionalProfile({
      currentSixAllocated: true,
      potentialSixAllocated: true,
    }),
    {
      kind: "current_six",
      archetypeKey: "category_star",
      currentAbilityLane: "exceptional",
      requiresSixStarPotentialFloor: true,
    },
  );
  assert.deepEqual(
    resolveGeneratedExceptionalProfile({
      currentSixAllocated: false,
      potentialSixAllocated: true,
    }),
    {
      kind: "potential_only_six",
      archetypeKey: "rare_prodigy",
      currentAbilityLane: "ordinary",
      requiresSixStarPotentialFloor: true,
    },
  );
});

/** Asserts an age range is deterministic-friendly and integer-based. */
function assertValidAgeRange(range: GeneratedPlayerArchetype["ageYears"]): void {
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
