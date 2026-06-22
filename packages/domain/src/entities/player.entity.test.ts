import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createPlayerRoleIdentity,
  PLAYER_ARCHETYPES_BY_ROLE,
  PLAYER_ROLES,
  PlayerRoleIdentityError,
} from "./player.entity.ts";

test("official role list contains the Phase 33 v1 roles once", () => {
  assert.deepEqual(PLAYER_ROLES, [
    "goalkeeper",
    "center_back",
    "full_back",
    "wing_back",
    "defensive_midfielder",
    "central_midfielder",
    "attacking_midfielder",
    "wide_midfielder",
    "winger",
    "striker",
  ]);
  assert.equal(new Set(PLAYER_ROLES).size, PLAYER_ROLES.length);
});

test("every official role has a small v1 archetype set", () => {
  for (const role of PLAYER_ROLES) {
    const archetypes = PLAYER_ARCHETYPES_BY_ROLE[role];
    assert.ok(archetypes.length >= 2, `${role} should have at least two archetypes`);
    assert.equal(new Set(archetypes).size, archetypes.length);
  }
});

test("createPlayerRoleIdentity builds deterministic natural adapted and weak familiarity", () => {
  const identity = createPlayerRoleIdentity({
    primaryRole: "center_back",
    archetype: "center_back_stopper",
    naturalRoles: ["center_back"],
    adaptedRoles: ["full_back", "defensive_midfielder"],
    weakRoles: ["wing_back"],
  });

  assert.equal(identity.primaryRole, "center_back");
  assert.equal(identity.archetype, "center_back_stopper");
  assert.deepEqual(identity.naturalRoles, ["center_back"]);
  assert.deepEqual(identity.adaptedRoles, ["full_back", "defensive_midfielder"]);
  assert.deepEqual(identity.weakRoles, ["wing_back"]);
  assert.equal(identity.roleFamiliarity.center_back, "natural");
  assert.equal(identity.roleFamiliarity.full_back, "adapted");
  assert.equal(identity.roleFamiliarity.defensive_midfielder, "adapted");
  assert.equal(identity.roleFamiliarity.wing_back, "weak");
});

test("createPlayerRoleIdentity rejects archetypes from another role", () => {
  assertRoleIdentityError(() => createPlayerRoleIdentity({
    primaryRole: "center_back",
    archetype: "striker_poacher",
    naturalRoles: ["center_back"],
    adaptedRoles: [],
    weakRoles: [],
  }), "archetype_not_allowed_for_role");
});

test("createPlayerRoleIdentity rejects role duplicates across familiarity buckets", () => {
  assertRoleIdentityError(() => createPlayerRoleIdentity({
    primaryRole: "full_back",
    archetype: "full_back_defensive",
    naturalRoles: ["full_back"],
    adaptedRoles: ["wing_back"],
    weakRoles: ["wing_back"],
  }), "duplicate_role");
});

test("createPlayerRoleIdentity keeps primary role stable and natural", () => {
  assertRoleIdentityError(() => createPlayerRoleIdentity({
    primaryRole: "striker",
    archetype: "striker_poacher",
    naturalRoles: ["winger"],
    adaptedRoles: ["striker"],
    weakRoles: [],
  }), "primary_role_not_natural");
});

function assertRoleIdentityError(fn: () => unknown, code: PlayerRoleIdentityError["code"]): void {
  assert.throws(fn, (error) => error instanceof PlayerRoleIdentityError && error.code === code);
}
