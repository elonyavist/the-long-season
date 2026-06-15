// @ts-ignore Node test types are introduced with the formal test runner step.
import test from "node:test";
// @ts-ignore Node assert types are introduced with the formal test runner step.
import assert from "node:assert/strict";

import { clubId, competitionId, fixtureId, playerId, saveId, seasonId } from "./ids.ts";

/**
 * ID tests document the public constructor contract.
 *
 * There is no exported partial ID validator on purpose: callers must choose the
 * specific constructor for the entity type they are creating.
 */
test("ID constructors reject empty and integer-like IDs", () => {
  assert.throws(() => playerId(""), /must not be empty/);
  assert.throws(() => playerId("123"), /integer-like/);
});

test("ID constructors preserve stable string values", () => {
  assert.equal(playerId("player:000001"), "player:000001");
  assert.equal(clubId("club:perugia"), "club:perugia");
  assert.equal(competitionId("competition:ita-3"), "competition:ita-3");
  assert.equal(fixtureId("fixture:000001"), "fixture:000001");
  assert.equal(seasonId("season:2026"), "season:2026");
  assert.equal(saveId("save:demo-001"), "save:demo-001");
});

test("ID constructors reject values with the wrong namespace prefix", () => {
  assert.throws(() => playerId("p_000001"), /player:/);
  assert.throws(() => clubId("perugia"), /club:/);
  assert.throws(() => competitionId("comp:ita-3"), /competition:/);
  assert.throws(() => fixtureId("fx_000001"), /fixture:/);
  assert.throws(() => seasonId("year-2026"), /season:/);
  assert.throws(() => saveId("demo-001"), /save:/);
});

test("ID constructors reject empty namespace values", () => {
  assert.throws(() => playerId("player:"), /include a value/);
  assert.throws(() => clubId("club:"), /include a value/);
});
