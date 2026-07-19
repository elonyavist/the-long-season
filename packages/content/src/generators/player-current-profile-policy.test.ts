import assert from "node:assert/strict";
import { test } from "vitest";

import { getPlayerRoleProfile, PLAYER_ABILITY_KEYS, readPlayerAbility, roleCurrentAbility } from "@game/domain";

import { buildCurrentPlayerProfile, GENERATED_CURRENT_PHYSICAL_FLOOR } from "./player-current-profile-policy.ts";

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
      slotDepthAdjustment: -1.5,
    });

    assert.equal(Number(abilities.physical.pace) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.strength) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.stamina) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.agility) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
    assert.equal(Number(abilities.physical.heading) >= GENERATED_CURRENT_PHYSICAL_FLOOR, true, role);
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
  });
  const striker = buildCurrentPlayerProfile({
    seed: "hard-cap",
    playerKey: "player:striker",
    division: "first_division",
    clubTier: "title_contender",
    role: "striker",
    ageYears: 27,
    rarityLane: "exceptional",
  });

  assert.equal(Number(centerBack.technical.finishing) <= 10, true);
  assert.equal(Number(striker.technical.tackling) <= 10, true);
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
  });
  const firstDivision = buildCurrentPlayerProfile({
    seed: "division-ladder",
    playerKey: "player:starter",
    division: "first_division",
    clubTier: "title_contender",
    role: "striker",
    ageYears: 26,
    rarityLane: "normal",
  });

  assert.equal(
    Number(roleCurrentAbility(firstDivision, getPlayerRoleProfile("striker"))) >
      Number(roleCurrentAbility(thirdDivision, getPlayerRoleProfile("striker"))),
    true,
  );
});

test("rare advanced youth traits can exist without inflating every attribute", () => {
  const winger = buildCurrentPlayerProfile({
    seed: "rare-youth-pace",
    playerKey: "player:rare-winger",
    division: "third_division",
    clubTier: "title_contender",
    role: "winger",
    ageYears: 18,
    rarityLane: "exceptional",
  });

  assert.equal(Number(winger.physical.pace) >= 14, true);
  assert.equal(Number(winger.technical.tackling) <= 10, true);
});

test("generated current profile always emits valid 0..20 ability values", () => {
  const profile = buildCurrentPlayerProfile({
    seed: "valid-values",
    playerKey: "player:valid",
    division: "second_division",
    clubTier: "mid_table",
    role: "central_midfielder",
    ageYears: 19,
    rarityLane: "rare",
  });

  for (const key of PLAYER_ABILITY_KEYS) {
    const value = Number(readPlayerAbility(profile, key));
    assert.equal(value >= 0 && value <= 20, true, key);
  }
});
