import assert from "node:assert/strict";
import { test } from "vitest";

import { buildPlayerAbilitiesForPosition, roleTemplateKeyForPosition } from "./player-role-templates.ts";

/** Tests protect generated player role coherence before full quality reports exist. */

test("position mapping resolves current generated positions to role templates", () => {
  assert.equal(roleTemplateKeyForPosition("gk"), "goalkeeper");
  assert.equal(roleTemplateKeyForPosition("rb"), "full_back");
  assert.equal(roleTemplateKeyForPosition("cb"), "center_back");
  assert.equal(roleTemplateKeyForPosition("lwb"), "wing_back");
  assert.equal(roleTemplateKeyForPosition("cm"), "central_midfielder");
  assert.equal(roleTemplateKeyForPosition("rw"), "wide_midfielder");
  assert.equal(roleTemplateKeyForPosition("st"), "striker");
});

test("center backs emphasize defending and cap ordinary finishing", () => {
  const abilities = buildPlayerAbilitiesForPosition(14, "cb");

  assert.equal(Number(abilities.technical.tackling) > Number(abilities.technical.finishing), true);
  assert.equal(Number(abilities.mental.positioning) > Number(abilities.technical.finishing), true);
  assert.equal(Number(abilities.technical.finishing) <= 7, true);
});

test("strikers emphasize finishing and cap ordinary tackling", () => {
  const abilities = buildPlayerAbilitiesForPosition(14, "st");

  assert.equal(Number(abilities.technical.finishing) > Number(abilities.technical.tackling), true);
  assert.equal(Number(abilities.mental.composure) > Number(abilities.technical.tackling), true);
  assert.equal(Number(abilities.technical.tackling) <= 8, true);
});

test("outfield players do not receive goalkeeper-like profiles", () => {
  const abilities = buildPlayerAbilitiesForPosition(15, "cm");

  assert.equal(Number(abilities.goalkeeping.reflexes) <= 4, true);
  assert.equal(Number(abilities.goalkeeping.handling) <= 4, true);
  assert.equal(Number(abilities.goalkeeping.footwork) <= 5, true);
});

test("goalkeepers use goalkeeper attributes and cap outfield extremes", () => {
  const abilities = buildPlayerAbilitiesForPosition(14, "gk");

  assert.equal(Number(abilities.goalkeeping.reflexes) > Number(abilities.technical.finishing), true);
  assert.equal(Number(abilities.goalkeeping.handling) > Number(abilities.technical.tackling), true);
  assert.equal(Number(abilities.technical.finishing) <= 5, true);
  assert.equal(Number(abilities.technical.tackling) <= 5, true);
});
