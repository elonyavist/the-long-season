import assert from "node:assert/strict";
import { test } from "vitest";

import {
  FORMATION_CATALOG,
  FORMATION_KEYS,
  FORMATION_POSITION_FAMILIES,
  FORMATIONS,
  getFormation,
  isFormationKey,
  type FormationPositionFamily,
} from "./formations.ts";

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

  for (const formation of FORMATIONS) {
    for (const slot of formation.slots) {
      assert.equal(recognized.has(slot.positionFamily), true, `${formation.key}:${slot.slotKey} uses an unknown family`);
    }
  }
});

test("formation helpers return stable catalog entries", () => {
  assert.equal(isFormationKey("4-4-2"), true);
  assert.equal(isFormationKey("2-3-5"), false);
  assert.equal(getFormation("3-4-2-1"), FORMATION_CATALOG["3-4-2-1"]);
});
