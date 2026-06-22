import assert from "node:assert/strict";
import { test } from "vitest";

import {
  resolveEffectiveCurrentAbilityBandForRoleAbility,
  resolveSeniorCurrentAbilityBand,
  resolveYouthCurrentAbilityBand,
  sampleCurrentAbilityInBand,
  youthCurrentAbilityAgeGroup,
} from "./player-current-ability-bands.ts";

test("third-division senior normal current ability does not inflate broadly", () => {
  const titleCore = resolveSeniorCurrentAbilityBand({
    division: "third_division",
    clubTier: "title_contender",
    bucket: "coreForRole",
  });
  const survivalCore = resolveSeniorCurrentAbilityBand({
    division: "third_division",
    clubTier: "survival",
    bucket: "coreForRole",
  });

  assert.equal(titleCore.maxInclusive, 13);
  assert.equal(titleCore.minInclusive > survivalCore.minInclusive, true);
  assert.equal(survivalCore.minInclusive >= 8, true);
  assert.equal(survivalCore.maxInclusive <= 13, true);
  assert.equal(titleCore.minInclusive - survivalCore.minInclusive >= 1.5, true);
});

test("club-tier modifiers stay inside division rarity lanes", () => {
  const firstRareOutOfRole = resolveSeniorCurrentAbilityBand({
    division: "first_division",
    clubTier: "title_contender",
    bucket: "cappedOutOfRole",
    rarityLane: "rare",
  });
  const thirdRareOutOfRole = resolveSeniorCurrentAbilityBand({
    division: "third_division",
    clubTier: "title_contender",
    bucket: "cappedOutOfRole",
    rarityLane: "rare",
  });

  assert.equal(firstRareOutOfRole.maxInclusive, 11);
  assert.equal(thirdRareOutOfRole.maxInclusive, 11);
});

test("effective ranges apply role hard caps after division and tier", () => {
  const centerBackFinishing = resolveEffectiveCurrentAbilityBandForRoleAbility({
    division: "first_division",
    clubTier: "title_contender",
    role: "center_back",
    abilityKey: "technical.finishing",
    rarityLane: "rare",
  });
  const strikerTackling = resolveEffectiveCurrentAbilityBandForRoleAbility({
    division: "first_division",
    clubTier: "title_contender",
    role: "striker",
    abilityKey: "technical.tackling",
    rarityLane: "rare",
  });

  assert.equal(centerBackFinishing.maxInclusive, 10);
  assert.equal(strikerTackling.maxInclusive, 10);
});

test("older youth bands can sit closer to senior ability than younger youth", () => {
  const younger = resolveYouthCurrentAbilityBand({
    division: "third_division",
    clubTier: "mid_table",
    ageYears: 16,
    bucket: "coreForRole",
  });
  const older = resolveYouthCurrentAbilityBand({
    division: "third_division",
    clubTier: "mid_table",
    ageYears: 19,
    bucket: "coreForRole",
  });

  assert.equal(youthCurrentAbilityAgeGroup(16), "age_15_17");
  assert.equal(youthCurrentAbilityAgeGroup(19), "age_18_19");
  assert.equal(older.minInclusive > younger.minInclusive, true);
  assert.equal(older.maxInclusive > younger.maxInclusive, true);
});

test("sampling current ability inside a band is deterministic by seed and key", () => {
  const range = resolveSeniorCurrentAbilityBand({
    division: "third_division",
    clubTier: "playoff_contender",
    bucket: "secondaryForRole",
  });
  const first = sampleCurrentAbilityInBand({
    seed: "stable-band",
    playerKey: "player:001",
    streamName: "test-band",
    range,
  });
  const second = sampleCurrentAbilityInBand({
    seed: "stable-band",
    playerKey: "player:001",
    streamName: "test-band",
    range,
  });
  const different = sampleCurrentAbilityInBand({
    seed: "other-band",
    playerKey: "player:001",
    streamName: "test-band",
    range,
  });

  assert.equal(first, second);
  assert.notEqual(first, different);
  assert.equal(first >= range.minInclusive && first <= range.maxInclusive, true);
});
