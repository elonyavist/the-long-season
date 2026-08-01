import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getPlayerGenerationBand,
  openingCompetitiveTierForClubRank,
  PLAYER_GENERATION_CLUB_TIERS,
  PLAYER_GENERATION_DIVISIONS,
} from "./player-generation-bands.ts";

/** Tests keep division/tier ability bands ordered before role templates use them. */

test("generation band data is ordered by division strength", () => {
  for (const tier of PLAYER_GENERATION_CLUB_TIERS) {
    const first = getPlayerGenerationBand("first_division", tier);
    const second = getPlayerGenerationBand("second_division", tier);
    const third = getPlayerGenerationBand("third_division", tier);

    assert.equal(first.currentAbility.minInclusive > second.currentAbility.minInclusive, true, tier);
    assert.equal(second.currentAbility.minInclusive > third.currentAbility.minInclusive, true, tier);
  }
});

test("generation band data is ordered by club tier inside each division", () => {
  for (const division of PLAYER_GENERATION_DIVISIONS) {
    const title = getPlayerGenerationBand(division, "title_contender");
    const playoff = getPlayerGenerationBand(division, "playoff_contender");
    const mid = getPlayerGenerationBand(division, "mid_table");
    const survival = getPlayerGenerationBand(division, "survival");

    assert.equal(title.currentAbility.minInclusive > playoff.currentAbility.minInclusive, true, division);
    assert.equal(playoff.currentAbility.minInclusive > mid.currentAbility.minInclusive, true, division);
    assert.equal(mid.currentAbility.minInclusive > survival.currentAbility.minInclusive, true, division);
  }
});

test("third-division current bands stay below first-division top-club quality", () => {
  const thirdTitle = getPlayerGenerationBand("third_division", "title_contender");
  const firstTitle = getPlayerGenerationBand("first_division", "title_contender");

  assert.equal(thirdTitle.currentAbility.maxInclusive < firstTitle.currentAbility.minInclusive, true);
  assert.equal(thirdTitle.currentAbility.maxInclusive <= 11, true);
  assert.equal(firstTitle.currentAbility.maxInclusive >= 18, true);
});

test("opening club rank maps to the exact 4/4/6/4 tier shape", () => {
  assert.equal(openingCompetitiveTierForClubRank(1), "title_contender");
  assert.equal(openingCompetitiveTierForClubRank(4), "title_contender");
  assert.equal(openingCompetitiveTierForClubRank(5), "playoff_contender");
  assert.equal(openingCompetitiveTierForClubRank(8), "playoff_contender");
  assert.equal(openingCompetitiveTierForClubRank(9), "mid_table");
  assert.equal(openingCompetitiveTierForClubRank(14), "mid_table");
  assert.equal(openingCompetitiveTierForClubRank(15), "survival");
  assert.equal(openingCompetitiveTierForClubRank(18), "survival");
  assert.throws(() => openingCompetitiveTierForClubRank(0), /1 to 18/);
  assert.throws(() => openingCompetitiveTierForClubRank(19), /1 to 18/);
});
