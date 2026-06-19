import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import { attributeShotTaker, shotTakerWeightForRole } from "./shot-attribution.ts";
import type { MatchTeamContext } from "./match-context.ts";

/**
 * Shot-attribution tests prove that non-goal shot takers are deterministic,
 * side-local, and separate from the main match RNG.
 */

test("same seed and shot context produce the same shooter", () => {
  const input = shotInput();
  const first = attributeShotTaker(input);
  const second = attributeShotTaker(input);

  assert.deepEqual(first, second);
  assert.equal(first.shooterPlayerId, playerId("player:mid"));
});

test("shot taker belongs to the attacking lineup", () => {
  const result = attributeShotTaker(shotInput());
  const playerIds = teamFixture().lineup.map((slot) => slot.playerId);

  assert.equal(playerIds.includes(result.shooterPlayerId), true);
});

test("shot taker attribution excludes goalkeepers when outfield players exist", () => {
  for (let minute = 1; minute <= 30; minute += 1) {
    const result = attributeShotTaker(shotInput({ minute }));

    assert.notEqual(result.shooterPlayerId, playerId("player:gk"));
  }
});

test("goalkeeper-only synthetic lineups still produce a deterministic shooter", () => {
  const result = attributeShotTaker(
    shotInput({
      team: {
        ...teamFixture(),
        lineup: [
          {
            slotId: "slot:gk",
            playerId: playerId("player:gk"),
            roleKey: "gk",
          },
        ],
      },
    }),
  );

  assert.equal(result.shooterPlayerId, playerId("player:gk"));
});

test("empty lineups fail clearly", () => {
  assert.throws(
    () =>
      attributeShotTaker(
        shotInput({
          team: {
            ...teamFixture(),
            lineup: [],
          },
        }),
      ),
    /without lineup players/,
  );
});

test("shooter weights favor attackers and exclude goalkeepers", () => {
  assert.ok(shotTakerWeightForRole("attacker") > shotTakerWeightForRole("midfielder"));
  assert.ok(shotTakerWeightForRole("midfielder") > shotTakerWeightForRole("defender"));
  assert.equal(shotTakerWeightForRole("gk"), 0);
});

/**
 * Builds one deterministic shot-attribution input.
 */
function shotInput(
  overrides: Partial<Parameters<typeof attributeShotTaker>[0]> = {},
): Parameters<typeof attributeShotTaker>[0] {
  return {
    seed: "demo-001",
    fixtureId: fixtureId("fixture:shot-000001"),
    minute: 18,
    side: "home",
    scoreBeforeShot: {
      home: 0,
      away: 0,
    },
    team: teamFixture(),
    outcome: "miss",
    shotType: "normal",
    chanceType: "open_play",
    ...overrides,
  };
}

/**
 * Builds an attacking-side team fixture with ordered player roles.
 */
function teamFixture(): MatchTeamContext {
  return {
    clubId: clubId("club:home"),
    lineup: [
      {
        slotId: "slot:gk",
        playerId: playerId("player:gk"),
        roleKey: "gk",
      },
      {
        slotId: "slot:def",
        playerId: playerId("player:def"),
        roleKey: "defender",
      },
      {
        slotId: "slot:mid",
        playerId: playerId("player:mid"),
        roleKey: "midfielder",
      },
      {
        slotId: "slot:att",
        playerId: playerId("player:att"),
        roleKey: "attacker",
      },
    ],
    strength: {
      attack: 10,
      midfield: 10,
      defense: 10,
      goalkeeper: 10,
      overall: 10,
    },
    tacticalDistribution: {
      directness: 0,
      pressing: 0,
      width: 0,
      risk: 0,
    },
  };
}
