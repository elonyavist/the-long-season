import assert from "node:assert/strict";
import { test } from "vitest";

import { PLAYER_ROLES, type PlayerAbilities } from "../entities/player.entity.ts";
import { abilityValue } from "../value-objects/rating.ts";
import { PLAYER_ABILITY_KEYS, roleCurrentAbility, type PlayerAbilityKey } from "./player-abilities.ts";
import {
  getPlayerRoleProfile,
  hardCapForRoleAbility,
  canImprovePlayerRoleFamiliarity,
  PLAYER_ROLE_PROFILES,
  RELATED_PLAYER_ROLE_EXPOSURE_RULES,
  relatedPlayerRoleExposureCeiling,
  roleAttributeBucket,
  type RoleAttributeBucket,
} from "./player-role-profile.ts";

const ROLE_BUCKETS: readonly RoleAttributeBucket[] = [
  "coreForRole",
  "secondaryForRole",
  "allowedButLow",
  "cappedOutOfRole",
];

const EXPECTED_BUCKET_WEIGHTS: Readonly<Record<RoleAttributeBucket, number>> = {
  coreForRole: 1,
  secondaryForRole: 0.35,
  allowedButLow: 0.08,
  cappedOutOfRole: 0.02,
};

test("every official role has one complete, disjoint, normalized profile", () => {
  assert.deepEqual(Object.keys(PLAYER_ROLE_PROFILES), PLAYER_ROLES);

  for (const role of PLAYER_ROLES) {
    const profile = getPlayerRoleProfile(role);
    const classified = ROLE_BUCKETS.flatMap((bucket) => profile[bucket]);

    assert.equal(new Set(classified).size, PLAYER_ABILITY_KEYS.length, `${role} duplicates or omits abilities`);
    assert.deepEqual([...classified].sort(), [...PLAYER_ABILITY_KEYS].sort(), `${role} classifies all abilities`);
    assert.equal(
      Math.abs(Number(roleCurrentAbility(uniformAbilities(20), profile)) - 20) < Number.EPSILON * 64,
      true,
      `${role} normalizes its weights`,
    );

    for (const abilityKey of PLAYER_ABILITY_KEYS) {
      const bucket = roleAttributeBucket(role, abilityKey);
      assert.equal(profile.weights[abilityKey], EXPECTED_BUCKET_WEIGHTS[bucket], `${role}:${abilityKey}`);
    }
  }
});

test("all hard caps are valid ability-scale bounds", () => {
  for (const role of PLAYER_ROLES) {
    for (const [abilityKey, cap] of Object.entries(getPlayerRoleProfile(role).hardCaps)) {
      assert.equal(PLAYER_ABILITY_KEYS.includes(abilityKey as PlayerAbilityKey), true, `${role}:${abilityKey}`);
      assert.equal(Number.isInteger(cap), true, `${role}:${abilityKey}`);
      assert.equal(cap >= 1 && cap <= 20, true, `${role}:${abilityKey}`);
    }
  }
});

test("known defender, attacker, and goalkeeper coherence rules remain stable", () => {
  assert.equal(roleAttributeBucket("center_back", "technical.tackling"), "coreForRole");
  assert.equal(hardCapForRoleAbility("center_back", "technical.finishing"), 10);
  assert.equal(roleAttributeBucket("striker", "technical.finishing"), "coreForRole");
  assert.equal(hardCapForRoleAbility("striker", "technical.tackling"), 10);

  assert.deepEqual(getPlayerRoleProfile("goalkeeper").coreForRole, [
    "goalkeeping.reflexes",
    "goalkeeping.handling",
    "goalkeeping.goalkeeperPositioning",
    "goalkeeping.rushingOut",
  ]);
  assert.equal(hardCapForRoleAbility("goalkeeper", "technical.finishing"), 5);

  for (const role of PLAYER_ROLES.filter((candidate) => candidate !== "goalkeeper")) {
    assert.equal(hardCapForRoleAbility(role, "goalkeeping.reflexes"), 4, role);
    assert.equal(hardCapForRoleAbility(role, "goalkeeping.footwork"), 5, role);
  }
});

test("related role exposure graph is directional and excludes arbitrary retraining", () => {
  const edgeKeys = RELATED_PLAYER_ROLE_EXPOSURE_RULES.map((rule) => `${rule.fromRole}->${rule.toRole}`);

  assert.equal(new Set(edgeKeys).size, edgeKeys.length);
  assert.equal(relatedPlayerRoleExposureCeiling("center_back", "full_back"), "adapted");
  assert.equal(relatedPlayerRoleExposureCeiling("full_back", "wing_back"), "natural");
  assert.equal(canImprovePlayerRoleFamiliarity("center_back", "winger"), false);
  assert.equal(canImprovePlayerRoleFamiliarity("goalkeeper", "center_back"), false);
  assert.equal(canImprovePlayerRoleFamiliarity("striker", "attacking_midfielder"), true);
});

function uniformAbilities(value: number): PlayerAbilities {
  const rating = abilityValue(value);
  return {
    technical: {
      finishing: rating,
      passing: rating,
      longPassing: rating,
      crossing: rating,
      dribbling: rating,
      technique: rating,
      tackling: rating,
      penalties: rating,
      freeKicks: rating,
    },
    physical: {
      pace: rating,
      strength: rating,
      stamina: rating,
      agility: rating,
      heading: rating,
    },
    mental: {
      positioning: rating,
      vision: rating,
      anticipation: rating,
      composure: rating,
      determination: rating,
      leadership: rating,
    },
    goalkeeping: {
      reflexes: rating,
      handling: rating,
      rushingOut: rating,
      goalkeeperPositioning: rating,
      footwork: rating,
    },
  };
}
