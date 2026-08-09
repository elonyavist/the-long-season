import assert from "node:assert/strict";
import { test } from "vitest";

import { generatedPlayerDepartmentForPosition, generatedRoleIdentityForPosition, primaryRoleForPosition } from "./player-role-identity.ts";

test("maps generated positions to Phase 33 primary roles", () => {
  assert.equal(primaryRoleForPosition("gk"), "goalkeeper");
  assert.equal(primaryRoleForPosition("cb"), "center_back");
  assert.equal(primaryRoleForPosition("rb"), "full_back");
  assert.equal(primaryRoleForPosition("lwb"), "wing_back");
  assert.equal(primaryRoleForPosition("dm"), "defensive_midfielder");
  assert.equal(primaryRoleForPosition("cm"), "central_midfielder");
  assert.equal(primaryRoleForPosition("am"), "attacking_midfielder");
  assert.equal(primaryRoleForPosition("lw"), "winger");
  assert.equal(primaryRoleForPosition("st"), "striker");
});

test("generated position departments include both wide-midfield sides", () => {
  assert.equal(generatedPlayerDepartmentForPosition("rm"), "midfielder");
  assert.equal(generatedPlayerDepartmentForPosition("lm"), "midfielder");
  assert.equal(generatedPlayerDepartmentForPosition("rw"), "attacker");
});

test("builds deterministic role identity without duplicate natural adapted or weak roles", () => {
  const identity = generatedRoleIdentityForPosition("cb");

  assert.equal(identity.primaryRole, "center_back");
  assert.equal(identity.archetype, "center_back_stopper");
  assert.deepEqual(identity.naturalRoles, ["center_back"]);
  assert.equal(identity.roleFamiliarity.center_back, "natural");
  assert.equal(identity.roleFamiliarity.defensive_midfielder, "adapted");
  assert.equal(identity.roleFamiliarity.full_back, "weak");
  assert.equal(new Set([...identity.naturalRoles, ...identity.adaptedRoles, ...identity.weakRoles]).size, (
    identity.naturalRoles.length + identity.adaptedRoles.length + identity.weakRoles.length
  ));
});

test("goalkeepers remain a separate role family", () => {
  const identity = generatedRoleIdentityForPosition("gk");

  assert.equal(identity.primaryRole, "goalkeeper");
  assert.equal(identity.archetype, "goalkeeper_shot_stopper");
  assert.deepEqual(identity.naturalRoles, ["goalkeeper"]);
  assert.deepEqual(identity.adaptedRoles, []);
  assert.deepEqual(identity.weakRoles, []);
});
