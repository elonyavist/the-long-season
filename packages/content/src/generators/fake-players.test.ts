import assert from "node:assert/strict";
import { test } from "vitest";

import type { Player } from "@game/domain";

import { fakePlayerId, generateFakeClubs } from "./fake-clubs.ts";
import { generateFakePlayersForClubs } from "./fake-players.ts";

/**
 * Fake player tests lock the deterministic content hierarchy without importing
 * engine strength derivation into the content package.
 */

test("fake players are deterministic for the same club list", () => {
  const clubs = generateFakeClubs();
  const first = generateFakePlayersForClubs(clubs.clubIds);
  const second = generateFakePlayersForClubs(clubs.clubIds);

  assert.deepEqual(first, second);
});

test("fake player generation gives top clubs a visible role ability edge", () => {
  const clubs = generateFakeClubs();
  const players = generateFakePlayersForClubs(clubs.clubIds);
  const topAttacker = requiredPlayer(players.players[fakePlayerId(1, 10)]);
  const bottomAttacker = requiredPlayer(players.players[fakePlayerId(18, 10)]);
  const topDefender = requiredPlayer(players.players[fakePlayerId(1, 3)]);
  const bottomDefender = requiredPlayer(players.players[fakePlayerId(18, 3)]);
  const topGoalkeeper = requiredPlayer(players.players[fakePlayerId(1, 1)]);
  const bottomGoalkeeper = requiredPlayer(players.players[fakePlayerId(18, 1)]);

  assert.equal(
    Number(topAttacker.abilities.technical.finishing) - Number(bottomAttacker.abilities.technical.finishing) >= 6,
    true,
  );
  assert.equal(
    Number(topDefender.abilities.technical.tackling) - Number(bottomDefender.abilities.technical.tackling) >= 5,
    true,
  );
  assert.equal(
    Number(topGoalkeeper.abilities.goalkeeping.reflexes) - Number(bottomGoalkeeper.abilities.goalkeeping.reflexes) >= 5,
    true,
  );
});

/**
 * Returns a generated player or fails the test with a clear message.
 */
function requiredPlayer(player: Player | undefined): Player {
  assert.ok(player !== undefined);
  return player;
}
