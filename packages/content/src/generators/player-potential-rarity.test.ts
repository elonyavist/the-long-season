import assert from "node:assert/strict";
import { test } from "vitest";

import {
  GENERATED_PLAYER_ARCHETYPE_KEYS,
  getGeneratedPlayerArchetype,
} from "./player-archetypes.ts";
import {
  CONTEXTUAL_PROSPECT_CEILING_RATING_BANDS,
  PLAYER_POTENTIAL_RARITY_BANDS,
  contextualProspectCeilingRatingBand,
  contextualProspectClassForArchetype,
  currentAbilityRarityLaneForYouthProspect,
  potentialRarityBudgetForDivision,
  potentialRarityForArchetype,
  potentialRarityForPotentialClass,
} from "./player-potential-rarity.ts";

test("contextual prospect classes keep routine youth outside the division ceiling matrix", () => {
  assert.equal(contextualProspectClassForArchetype("normal_youth"), "routine");
  assert.equal(contextualProspectClassForArchetype("good_prospect"), "interesting");
  assert.equal(contextualProspectClassForArchetype("serious_prospect"), "serious");
  assert.equal(contextualProspectClassForArchetype("rare_prodigy"), "rare");
  assert.equal(contextualProspectCeilingRatingBand("first_division", "routine"), undefined);
});

test("contextual prospect ceiling bands match the accepted three-division matrix", () => {
  assert.deepEqual(CONTEXTUAL_PROSPECT_CEILING_RATING_BANDS, {
    third_division: {
      interesting: {
        minimumRating: 2.5,
        maximumRating: 3.5,
        selection: {
          kind: "weighted_maximum",
          maximumRatingBasisPoints: 2_500,
        },
      },
      serious: { minimumRating: 3.5, maximumRating: 4, selection: { kind: "uniform" } },
      rare: { minimumRating: 5, maximumRating: 6, selection: { kind: "uniform" } },
    },
    second_division: {
      interesting: { minimumRating: 3, maximumRating: 3.5, selection: { kind: "uniform" } },
      serious: { minimumRating: 3.5, maximumRating: 4.5, selection: { kind: "uniform" } },
      rare: { minimumRating: 5, maximumRating: 6, selection: { kind: "uniform" } },
    },
    first_division: {
      interesting: { minimumRating: 3.5, maximumRating: 4, selection: { kind: "uniform" } },
      serious: { minimumRating: 4, maximumRating: 5, selection: { kind: "uniform" } },
      rare: { minimumRating: 5.5, maximumRating: 6, selection: { kind: "uniform" } },
    },
  });
});

test("third-division interesting prospects reach three-and-a-half only as a weighted edge", () => {
  const interesting = contextualProspectCeilingRatingBand(
    "third_division",
    "interesting",
  );
  const serious = contextualProspectCeilingRatingBand(
    "third_division",
    "serious",
  );

  assert.deepEqual(interesting, {
    minimumRating: 2.5,
    maximumRating: 3.5,
    selection: {
      kind: "weighted_maximum",
      maximumRatingBasisPoints: 2_500,
    },
  });
  assert.deepEqual(serious, {
    minimumRating: 3.5,
    maximumRating: 4,
    selection: { kind: "uniform" },
  });
});

test("every generated archetype maps to the Phase 33 potential rarity scale", () => {
  for (const key of GENERATED_PLAYER_ARCHETYPE_KEYS) {
    const rarity = potentialRarityForArchetype(key);
    const archetype = getGeneratedPlayerArchetype(key);

    assert.equal(PLAYER_POTENTIAL_RARITY_BANDS.includes(rarity), true, key);
    assert.equal(potentialRarityForPotentialClass(archetype.potentialClass), rarity, key);
  }
});

test("third-division routine rarity budget keeps serious potential bounded", () => {
  const budget = potentialRarityBudgetForDivision("third_division");

  assert.equal(budget.ordinary, "majority");
  assert.equal(budget.highPerDivision.minInclusive, 2);
  assert.equal(budget.highPerDivision.maxInclusive, 5);
});

test("youth current lane boost is limited to stronger prospects and academies", () => {
  assert.equal(currentAbilityRarityLaneForYouthProspect("normal_youth", 5), "normal");
  assert.equal(currentAbilityRarityLaneForYouthProspect("good_prospect", 4), "normal");
  assert.equal(currentAbilityRarityLaneForYouthProspect("good_prospect", 5), "rare");
  assert.equal(currentAbilityRarityLaneForYouthProspect("serious_prospect", 3), "normal");
  assert.equal(currentAbilityRarityLaneForYouthProspect("serious_prospect", 4), "rare");
  assert.equal(currentAbilityRarityLaneForYouthProspect("rare_prodigy", 5), "rare");
});
