import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerId } from "@game/domain";

import { attributeGoalkeeperSave } from "./goalkeeper-attribution.ts";
import type { MatchTeamContext } from "./match-context.ts";

/**
 * Goalkeeper-attribution tests prove that saved shots identify the defending
 * goalkeeper through explicit lineup role data.
 */

test("save attribution returns the goalkeeper from the defending lineup", () => {
  const result = attributeGoalkeeperSave({ defendingTeam: teamFixture() });

  assert.equal(result.goalkeeperPlayerId, playerId("player:gk"));
});

test("save attribution uses lineup order when multiple goalkeeper slots exist", () => {
  const team = {
    ...teamFixture(),
    lineup: [
      {
        slotId: "slot:gk-a",
        playerId: playerId("player:gk-a"),
        roleKey: "gk",
      },
      {
        slotId: "slot:gk-b",
        playerId: playerId("player:gk-b"),
        roleKey: "gk",
      },
    ],
  };
  const result = attributeGoalkeeperSave({ defendingTeam: team });

  assert.equal(result.goalkeeperPlayerId, playerId("player:gk-a"));
});

test("save attribution fails clearly when no goalkeeper exists", () => {
  const team = {
    ...teamFixture(),
    lineup: [
      {
        slotId: "slot:def",
        playerId: playerId("player:def"),
        roleKey: "defender",
      },
    ],
  };

  assert.throws(
    () => attributeGoalkeeperSave({ defendingTeam: team }),
    /without a goalkeeper slot/,
  );
});

/**
 * Builds one defending team fixture with a goalkeeper slot.
 */
function teamFixture(): MatchTeamContext {
  return {
    clubId: clubId("club:defending"),
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
