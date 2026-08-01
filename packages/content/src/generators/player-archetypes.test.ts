import assert from "node:assert/strict";
import { test } from "vitest";

import {
  currentAbilityRarityLaneForGeneratedArchetype,
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  GENERATED_PLAYER_ARCHETYPES,
  getGeneratedPlayerArchetype,
  resolveGeneratedCurrentAbilityRarityLane,
  resolveGeneratedCurrentQualityProfile,
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
    assert.equal([
      "senior_regular",
      "category_starter",
      "category_star",
      "veteran_drop_down",
      "youth_prospect",
    ].includes(archetype.currentQualityProfile), true);
    assert.equal(Number.isSafeInteger(archetype.lineupWeight), true);
    assert.equal(Number.isSafeInteger(archetype.reserveWeight), true);
    assert.equal(archetype.lineupWeight >= 0, true);
    assert.equal(archetype.reserveWeight >= 0, true);
  }
});

test("senior archetypes keep current quality separate from potential class", () => {
  assert.equal(
    getGeneratedPlayerArchetype("senior_regular").currentQualityProfile,
    "senior_regular",
  );
  assert.equal(
    getGeneratedPlayerArchetype("category_starter").currentQualityProfile,
    "category_starter",
  );
  assert.equal(
    getGeneratedPlayerArchetype("category_star").currentQualityProfile,
    "category_star",
  );
  assert.equal(
    getGeneratedPlayerArchetype("veteran_drop_down").currentQualityProfile,
    "veteran_drop_down",
  );
  assert.equal(
    getGeneratedPlayerArchetype("rare_prodigy").currentQualityProfile,
    "youth_prospect",
  );
});

test("exceptional precedence names current-six champions separately", () => {
  assert.equal(
    resolveGeneratedCurrentQualityProfile({
      archetypeKey: "category_star",
      effectiveRarityLane: "rare",
    }),
    "category_star",
  );
  assert.equal(
    resolveGeneratedCurrentQualityProfile({
      archetypeKey: "category_star",
      effectiveRarityLane: "exceptional",
    }),
    "established_champion",
  );
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
  assert.equal(prodigy.ageYears.maxInclusive, 20);
});

test("prospect ceiling semantics do not promote serious youth into a stronger current lane", () => {
  assert.equal(currentAbilityRarityLaneForGeneratedArchetype("normal_youth"), "normal");
  assert.equal(currentAbilityRarityLaneForGeneratedArchetype("good_prospect"), "normal");
  assert.equal(currentAbilityRarityLaneForGeneratedArchetype("serious_prospect"), "normal");
  assert.equal(currentAbilityRarityLaneForGeneratedArchetype("rare_prodigy"), "exceptional");

  assert.equal(
    resolveGeneratedCurrentAbilityRarityLane({
      archetypeKey: "serious_prospect",
      requestedLane: "normal",
    }),
    "normal",
  );
  assert.equal(
    resolveGeneratedCurrentAbilityRarityLane({
      archetypeKey: "rare_prodigy",
      requestedLane: "normal",
    }),
    "exceptional",
  );
  assert.equal(
    resolveGeneratedCurrentAbilityRarityLane({
      archetypeKey: "category_star",
      requestedLane: "exceptional",
    }),
    "exceptional",
  );
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
      currentAbilityLane: "exceptional",
      requiresSixStarPotentialFloor: true,
    },
  );
});

test("ordinary exceptional-profile resolution uses the canonical normal lane", () => {
  assert.deepEqual(
    resolveGeneratedExceptionalProfile({
      currentSixAllocated: false,
      potentialSixAllocated: false,
    }),
    {
      kind: "ordinary",
      currentAbilityLane: "normal",
      requiresSixStarPotentialFloor: false,
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
