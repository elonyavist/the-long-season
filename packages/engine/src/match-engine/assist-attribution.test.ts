import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import { assistCreatorWeightForRole, attributeAssist } from "./assist-attribution.ts";
import type { MatchTeamContext } from "./match-context.ts";

/**
 * Assist-attribution tests prove that optional assists are deterministic,
 * side-local, and separate from the main match RNG.
 */

test("same seed and goal context produce the same assist", () => {
  const input = assistInput();
  const first = attributeAssist(input);
  const second = attributeAssist(input);

  assert.deepEqual(first, second);
  assert.equal(first.assistPlayerId, playerId("player:mid"));
});

test("assist never credits the scorer", () => {
  const result = attributeAssist(assistInput({ scorerPlayerId: playerId("player:att") }));

  assert.notEqual(result.assistPlayerId, playerId("player:att"));
});

test("open-play goals can be unassisted", () => {
  const result = attributeAssist(
    assistInput({
      chanceType: "open_play",
      shotType: "normal",
    }),
  );

  assert.equal(result.assistPlayerId, undefined);
});

test("goals without eligible creators are unassisted", () => {
  const result = attributeAssist(
    assistInput({
      team: {
        ...teamFixture(),
        lineup: [
          {
            slotId: "slot:att",
            playerId: playerId("player:att"),
            roleKey: "attacker",
          },
          {
            slotId: "slot:gk",
            playerId: playerId("player:gk"),
            roleKey: "gk",
          },
        ],
      },
    }),
  );

  assert.equal(result.assistPlayerId, undefined);
});

test("creator weights favor midfielders and exclude goalkeepers", () => {
  assert.ok(assistCreatorWeightForRole("midfielder") > assistCreatorWeightForRole("attacker"));
  assert.ok(assistCreatorWeightForRole("attacker") > assistCreatorWeightForRole("defender"));
  assert.equal(assistCreatorWeightForRole("gk"), 0);
});

/**
 * Builds one deterministic assist-attribution input.
 */
function assistInput(
  overrides: Partial<Parameters<typeof attributeAssist>[0]> = {},
): Parameters<typeof attributeAssist>[0] {
  return {
    seed: "demo-001",
    fixtureId: fixtureId("fixture:assist-000001"),
    minute: 12,
    side: "home",
    scoreBeforeGoal: {
      home: 0,
      away: 0,
    },
    team: teamFixture(),
    scorerPlayerId: playerId("player:att"),
    shotType: "normal",
    chanceType: "counter",
    ...overrides,
  };
}

/**
 * Builds a scoring-side team fixture with ordered player roles.
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
