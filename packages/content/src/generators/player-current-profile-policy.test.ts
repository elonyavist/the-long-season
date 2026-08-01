import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getPlayerRoleProfile,
  PLAYER_ABILITY_KEYS,
  readPlayerAbility,
  roleCurrentAbility,
} from "@game/domain";

import {
  buildCurrentPlayerProfile,
  buildCurrentPlayerProfileAtBandPosition,
  buildRoutineCurrentPlayerProfile,
  GENERATED_CURRENT_PHYSICAL_FLOOR,
} from "./player-current-profile-policy.ts";

/** Tests for the single current-profile policy shared by content generators. */

test("generated current profiles keep every physical attribute above the footballer floor", () => {
  const roles = ["goalkeeper", "center_back", "full_back", "defensive_midfielder", "central_midfielder", "winger", "striker"] as const;

  for (const role of roles) {
    const abilities = buildCurrentPlayerProfile({
      seed: "physical-floor",
      playerKey: `player:${role}`,
      division: "third_division",
      clubTier: "survival",
      role,
      ageYears: role === "goalkeeper" ? 32 : 18,
      rarityLane: "normal",
      currentQualityProfile: "youth_prospect",
      slotDepthAdjustment: -1.5,
    });

    assert.equal(Number(abilities.physical.pace) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.strength) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.stamina) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.agility) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    if (role === "goalkeeper") {
      assert.equal(Number(abilities.physical.heading) <= 6, true, role);
    } else {
      assert.equal(Number(abilities.physical.heading) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    }
  }
});

test("generated current profiles still obey role-incoherent hard caps", () => {
  const centerBack = buildCurrentPlayerProfile({
    seed: "hard-cap",
    playerKey: "player:center-back",
    division: "first_division",
    clubTier: "title_contender",
    role: "center_back",
    ageYears: 27,
    rarityLane: "exceptional",
    currentQualityProfile: "established_champion",
  });
  const striker = buildCurrentPlayerProfile({
    seed: "hard-cap",
    playerKey: "player:striker",
    division: "first_division",
    clubTier: "title_contender",
    role: "striker",
    ageYears: 27,
    rarityLane: "exceptional",
    currentQualityProfile: "established_champion",
  });

  assert.equal(Number(centerBack.technical.finishing) <= 10, true);
  assert.equal(Number(striker.technical.tackling) <= 10, true);

  const goalkeeper = buildCurrentPlayerProfile({
    seed: "hard-cap",
    playerKey: "player:goalkeeper",
    division: "third_division",
    clubTier: "survival",
    role: "goalkeeper",
    ageYears: 18,
    rarityLane: "normal",
    currentQualityProfile: "youth_prospect",
  });
  assert.equal(Number(goalkeeper.physical.heading) <= 6, true);
});

test("explicit band-position construction is deterministic and monotone", () => {
  const common = {
    seed: "current-band-position",
    playerKey: "player:current-band-position",
    division: "second_division" as const,
    clubTier: "playoff_contender" as const,
    role: "central_midfielder" as const,
    ageYears: 18,
    rarityLane: "normal" as const,
    currentQualityProfile: "youth_prospect" as const,
  };
  const minimum = buildCurrentPlayerProfileAtBandPosition({
    ...common,
    bandPosition: 0,
    minimumBandPolicy: "authored",
  });
  const midpoint = buildCurrentPlayerProfileAtBandPosition({
    ...common,
    bandPosition: 0.5,
    minimumBandPolicy: "authored",
  });
  const maximum = buildCurrentPlayerProfileAtBandPosition({
    ...common,
    bandPosition: 1,
    minimumBandPolicy: "authored",
  });
  const profile = getPlayerRoleProfile(common.role);

  assert.equal(
    Number(roleCurrentAbility(minimum, profile))
      <= Number(roleCurrentAbility(midpoint, profile)),
    true,
  );
  assert.equal(
    Number(roleCurrentAbility(midpoint, profile))
      <= Number(roleCurrentAbility(maximum, profile)),
    true,
  );
  for (const key of PLAYER_ABILITY_KEYS) {
    assert.equal(
      Number(readPlayerAbility(minimum, key))
        <= Number(readPlayerAbility(midpoint, key)),
      true,
      `${key}:minimum-to-midpoint`,
    );
    assert.equal(
      Number(readPlayerAbility(midpoint, key))
        <= Number(readPlayerAbility(maximum, key)),
      true,
      `${key}:midpoint-to-maximum`,
    );
  }
  const coreMidpointValues = [
    midpoint.technical.passing,
    midpoint.technical.longPassing,
    midpoint.technical.technique,
    midpoint.mental.vision,
    midpoint.mental.anticipation,
  ].map(Number);
  assert.equal(new Set(coreMidpointValues.map((value) => value.toFixed(4))).size > 1, true);
  assert.deepEqual(
    buildCurrentPlayerProfileAtBandPosition({
      ...common,
      bandPosition: 0.5,
      minimumBandPolicy: "authored",
    }),
    midpoint,
  );
  assert.throws(
    () => buildCurrentPlayerProfileAtBandPosition({
      ...common,
      bandPosition: 1.01,
      minimumBandPolicy: "authored",
    }),
    /between 0 and 1/,
  );
});

test("current profiles preserve the division ladder for the same role and player key", () => {
  const thirdDivision = buildCurrentPlayerProfile({
    seed: "division-ladder",
    playerKey: "player:starter",
    division: "third_division",
    clubTier: "title_contender",
    role: "striker",
    ageYears: 26,
    rarityLane: "normal",
    currentQualityProfile: "category_starter",
  });
  const firstDivision = buildCurrentPlayerProfile({
    seed: "division-ladder",
    playerKey: "player:starter",
    division: "first_division",
    clubTier: "title_contender",
    role: "striker",
    ageYears: 26,
    rarityLane: "normal",
    currentQualityProfile: "category_starter",
  });

  assert.equal(
    Number(roleCurrentAbility(firstDivision, getPlayerRoleProfile("striker"))) >
      Number(roleCurrentAbility(thirdDivision, getPlayerRoleProfile("striker"))),
    true,
  );
});

test("generated current profile always emits valid 1..20 ability values", () => {
  const profile = buildCurrentPlayerProfile({
    seed: "valid-values",
    playerKey: "player:valid",
    division: "second_division",
    clubTier: "mid_table",
    role: "central_midfielder",
    ageYears: 19,
    rarityLane: "rare",
    currentQualityProfile: "youth_prospect",
  });

  for (const key of PLAYER_ABILITY_KEYS) {
    const value = Number(readPlayerAbility(profile, key));
    assert.equal(value >= 1 && value <= 20, true, key);
  }
});

test("the exceptional senior lane constructs six-star role quality without a post-generation floor", () => {
  const roles = [
    "goalkeeper",
    "center_back",
    "full_back",
    "central_midfielder",
    "winger",
    "striker",
  ] as const;

  for (const role of roles) {
    const profile = buildCurrentPlayerProfile({
      seed: "world-current-six",
      playerKey: `player:world-current-six:${role}`,
      division: "first_division",
      clubTier: "title_contender",
      role,
      ageYears: 27,
      rarityLane: "exceptional",
      currentQualityProfile: "established_champion",
      slotDepthAdjustment: 0.35,
    });

    assert.equal(
      Number(roleCurrentAbility(profile, getPlayerRoleProfile(role))) >= 17,
      true,
      role,
    );
  }
});

test("the routine builder keeps archetype semantics behind the joint-profile boundary", () => {
  const input = {
    seed: "routine-current-profile",
    playerKey: "player:routine-current-profile",
    division: "second_division",
    clubTier: "mid_table",
    role: "central_midfielder",
    ageYears: 18,
    archetypeKey: "normal_youth",
    rarityLane: "normal",
  } as const;
  const routine = buildRoutineCurrentPlayerProfile(input);

  assert.deepEqual(buildRoutineCurrentPlayerProfile(input), routine);
  assert.equal(
    Number(roleCurrentAbility(routine, getPlayerRoleProfile(input.role))) > 0,
    true,
  );
});
