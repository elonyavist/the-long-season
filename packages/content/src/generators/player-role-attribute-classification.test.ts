import assert from "node:assert/strict";
import { test } from "vitest";

import {
  PLAYER_ARCHETYPES_BY_ROLE,
  PLAYER_ROLES,
  type PlayerArchetype,
  type PlayerRole,
} from "@game/domain";

import {
  getArchetypeAttributeClassification,
  hardCapForRoleAbility,
  PLAYER_ABILITY_KEYS,
  PLAYER_ARCHETYPE_ATTRIBUTE_CLASSIFICATIONS,
  PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS,
  type PlayerAbilityKey,
  type RoleAttributeBucket,
  type RoleAttributeClassification,
} from "./player-role-attribute-classification.ts";

test("each official role has role attribute classification data", () => {
  assert.deepEqual(Object.keys(PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS), PLAYER_ROLES);

  for (const role of PLAYER_ROLES) {
    assertCompleteClassification(role, PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS[role]);
  }
});

test("each official archetype resolves to classification data", () => {
  const expectedArchetypes = PLAYER_ROLES.flatMap((role) => PLAYER_ARCHETYPES_BY_ROLE[role]);

  assert.deepEqual(Object.keys(PLAYER_ARCHETYPE_ATTRIBUTE_CLASSIFICATIONS).sort(), [...expectedArchetypes].sort());

  for (const archetype of expectedArchetypes) {
    assertCompleteClassification(archetype, getArchetypeAttributeClassification(archetype));
  }
});

test("known role-coherence risk attributes have hard caps", () => {
  assert.equal(hardCapForRoleAbility("center_back", "technical.finishing"), 10);
  assert.equal(hardCapForRoleAbility("full_back", "technical.finishing"), 10);
  assert.equal(hardCapForRoleAbility("wing_back", "technical.finishing"), 11);
  assert.equal(hardCapForRoleAbility("striker", "technical.tackling"), 10);
  assert.equal(hardCapForRoleAbility("winger", "technical.tackling"), 10);
  assert.equal(hardCapForRoleAbility("attacking_midfielder", "technical.tackling"), 11);
});

test("goalkeepers are classified through goalkeeper-specific attributes", () => {
  const goalkeeper = PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS.goalkeeper;

  assert.deepEqual(goalkeeper.coreForRole, [
    "goalkeeping.reflexes",
    "goalkeeping.handling",
    "goalkeeping.goalkeeperPositioning",
    "goalkeeping.rushingOut",
  ]);
  assert.equal(goalkeeper.hardCaps["technical.finishing"], 5);
  assert.equal(goalkeeper.hardCaps["technical.tackling"], 5);
  assert.equal(goalkeeper.cappedOutOfRole.includes("technical.finishing"), true);
});

test("outfield roles cap goalkeeper abilities", () => {
  const outfieldRoles = PLAYER_ROLES.filter((role) => role !== "goalkeeper");

  for (const role of outfieldRoles) {
    assert.equal(hardCapForRoleAbility(role, "goalkeeping.reflexes"), 4, role);
    assert.equal(hardCapForRoleAbility(role, "goalkeeping.handling"), 4, role);
    assert.equal(hardCapForRoleAbility(role, "goalkeeping.footwork"), 5, role);
  }
});

function assertCompleteClassification(
  key: PlayerRole | PlayerArchetype,
  classification: RoleAttributeClassification,
): void {
  const buckets: readonly RoleAttributeBucket[] = [
    "coreForRole",
    "secondaryForRole",
    "allowedButLow",
    "cappedOutOfRole",
  ];
  const classifiedAbilities = buckets.flatMap((bucket) => classification[bucket]);

  assert.equal(new Set(classifiedAbilities).size, PLAYER_ABILITY_KEYS.length, `${key} has duplicate or missing abilities`);
  assert.deepEqual([...classifiedAbilities].sort(), [...PLAYER_ABILITY_KEYS].sort(), `${key} classifies every ability`);

  for (const [abilityKey, cap] of Object.entries(classification.hardCaps)) {
    assert.equal(PLAYER_ABILITY_KEYS.includes(abilityKey as PlayerAbilityKey), true, `${key} ${abilityKey}`);
    assert.equal(Number.isInteger(cap), true, `${key} ${abilityKey}`);
    assert.equal(cap >= 1 && cap <= 20, true, `${key} ${abilityKey}`);
  }
}
