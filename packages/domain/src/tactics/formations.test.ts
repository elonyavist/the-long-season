import assert from "node:assert/strict";
import { test } from "vitest";

import { canonicalPlayerRoleDepartment } from "./player-roles.ts";
import {
  CANONICAL_PLAYER_ROLES,
  canonicalRoleTacticalFacts,
  FORMATION_CATALOG,
  FORMATION_KEYS,
  FORMATION_POSITION_FAMILIES,
  FORMATIONS,
  getFormation,
  isFormationKey,
  type FormationPositionFamily,
} from "./index.ts";

/**
 * Formation catalog tests protect the curated shape data used by later lineup,
 * squad-fit and manager-facing formation reporting.
 */
test("catalog exposes every supported formation key in stable order", () => {
  assert.deepEqual(Object.keys(FORMATION_CATALOG), [...FORMATION_KEYS]);
  assert.deepEqual(
    FORMATIONS.map((formation) => formation.key),
    [...FORMATION_KEYS],
  );
});

test("every formation has exactly eleven slots and one goalkeeper", () => {
  for (const formation of FORMATIONS) {
    assert.equal(formation.slots.length, 11, `${formation.key} should have eleven slots`);
    assert.equal(
      formation.slots.filter((slot) => slot.positionFamily === "goalkeeper").length,
      1,
      `${formation.key} should have one goalkeeper`,
    );
  }
});

test("every formation has unique slot keys", () => {
  for (const formation of FORMATIONS) {
    const slotKeys = formation.slots.map((slot) => slot.slotKey);
    assert.equal(new Set(slotKeys).size, slotKeys.length, `${formation.key} should not repeat slot keys`);
  }
});

test("every formation uses recognized position families", () => {
  const recognized = new Set<FormationPositionFamily>(FORMATION_POSITION_FAMILIES);
  const canonicalRoles = new Set(CANONICAL_PLAYER_ROLES);

  for (const formation of FORMATIONS) {
    for (const slot of formation.slots) {
      assert.equal(recognized.has(slot.positionFamily), true, `${formation.key}:${slot.slotKey} uses an unknown family`);
      assert.equal(canonicalRoles.has(slot.playerRole), true, `${formation.key}:${slot.slotKey} uses a non-canonical player role`);
      assert.equal(slot.positionFamily, slot.playerRole, `${formation.key}:${slot.slotKey} should keep positionFamily as a canonical-role alias`);
    }
  }
});

test("formation slots do not use role variants as canonical player roles", () => {
  const forbiddenRoles = new Set(["right_wing_back", "left_wing_back", "second_striker"]);

  for (const formation of FORMATIONS) {
    for (const slot of formation.slots) {
      assert.equal(forbiddenRoles.has(slot.playerRole), false, `${formation.key}:${slot.slotKey} uses a role variant`);
      assert.equal(forbiddenRoles.has(slot.positionFamily), false, `${formation.key}:${slot.slotKey} uses a role variant family`);
    }
  }
});

test("formation helpers return stable catalog entries", () => {
  assert.equal(isFormationKey("4-4-2"), true);
  assert.equal(isFormationKey("2-3-5"), false);
  assert.equal(getFormation("3-4-2-1"), FORMATION_CATALOG["3-4-2-1"]);
});

test("three-six-one uses one defensive midfielder between defense and central midfield", () => {
  const formation = getFormation("3-6-1");

  assert.deepEqual(
    formation.slots.map((slot) => `${slot.slotKey}:${slot.line}`),
    [
      "gk:goalkeeper",
      "cb-right:defensive_line",
      "cb-center:defensive_line",
      "cb-left:defensive_line",
      "dm:defensive_midfield",
      "rm:midfield_line",
      "cm-right:midfield_line",
      "cm-left:midfield_line",
      "lm:midfield_line",
      "am:attacking_midfield",
      "st:forward_line",
    ],
  );
});

test("two-forward formations keep both forwards as strikers", () => {
  for (const formationKey of ["3-5-2", "5-3-2"] as const) {
    const forwards = getFormation(formationKey).slots.filter((slot) => slot.line === "forward_line");

    assert.deepEqual(
      forwards.map((slot) => slot.playerRole),
      ["striker", "striker"],
      `${formationKey} should use two central strikers, not left/right wingers`,
    );
  }
});

test("three-forward formations use left winger, striker, and right winger", () => {
  for (const formationKey of ["4-3-3", "3-4-3", "5-2-3"] as const) {
    const forwards = getFormation(formationKey).slots.filter((slot) => slot.line === "forward_line");

    assert.deepEqual(
      forwards.map((slot) => slot.playerRole).sort(),
      ["left_winger", "right_winger", "striker"],
      `${formationKey} should use two wingers and one central striker`,
    );
  }
});

test("canonical role facts derive department and family rather than restating them", () => {
  for (const role of CANONICAL_PLAYER_ROLES) {
    const facts = canonicalRoleTacticalFacts(role);

    assert.equal(facts.positionFamily, role, `${role} should fill its own position family`);
    assert.equal(facts.department, canonicalPlayerRoleDepartment(role), `${role} department`);
  }
});

test("canonical role facts place every role on exactly one line and channel", () => {
  const lines = new Set(CANONICAL_PLAYER_ROLES.map((role) => canonicalRoleTacticalFacts(role).line));

  assert.deepEqual(
    [...lines].sort(),
    ["attacking_midfield", "defensive_line", "defensive_midfield", "forward_line", "goalkeeper", "midfield_line"],
    "every formation line should be reachable from a canonical role",
  );
  assert.equal(canonicalRoleTacticalFacts("right_winger").channel, "right");
  assert.equal(canonicalRoleTacticalFacts("left_full_back").channel, "left");
  assert.equal(canonicalRoleTacticalFacts("striker").channel, "center");
});

test("every formation slot agrees with the canonical facts of its own role", () => {
  for (const formation of FORMATIONS) {
    for (const slot of formation.slots) {
      const facts = canonicalRoleTacticalFacts(slot.playerRole);

      assert.equal(slot.line, facts.line, `${formation.key}:${slot.slotKey} line`);
      assert.equal(slot.department, facts.department, `${formation.key}:${slot.slotKey} department`);
      assert.equal(slot.positionFamily, facts.positionFamily, `${formation.key}:${slot.slotKey} family`);
    }
  }
});
