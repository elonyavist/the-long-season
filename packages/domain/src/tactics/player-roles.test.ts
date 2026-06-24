import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CANONICAL_PLAYER_ROLES,
  canonicalPlayerRoleDepartment,
  canonicalPlayerRoleOrder,
  isCanonicalPlayerRole,
} from "./player-roles.ts";

test("canonical player role list contains exactly the twelve agreed roles", () => {
  assert.deepEqual(CANONICAL_PLAYER_ROLES, [
    "goalkeeper",
    "right_full_back",
    "center_back",
    "left_full_back",
    "defensive_midfielder",
    "central_midfielder",
    "right_midfielder",
    "left_midfielder",
    "attacking_midfielder",
    "right_winger",
    "left_winger",
    "striker",
  ]);
});

test("canonical player roles do not include slot-side or role-variant names", () => {
  for (const forbiddenRole of [
    "right_wing_back",
    "left_wing_back",
    "second_striker",
    "cb-right",
    "cm-left",
    "dm-right",
  ]) {
    assert.equal(isCanonicalPlayerRole(forbiddenRole), false, `${forbiddenRole} must not be a canonical player role`);
  }
});

test("canonical player roles expose deterministic order and departments", () => {
  assert.equal(canonicalPlayerRoleOrder("goalkeeper"), 0);
  assert.equal(canonicalPlayerRoleOrder("striker"), 11);
  assert.equal(canonicalPlayerRoleDepartment("goalkeeper"), "goalkeeping");
  assert.equal(canonicalPlayerRoleDepartment("right_full_back"), "defense");
  assert.equal(canonicalPlayerRoleDepartment("central_midfielder"), "midfield");
  assert.equal(canonicalPlayerRoleDepartment("right_winger"), "attack");
});
