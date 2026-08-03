import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerId, type Club } from "@game/domain";

import { fieldablePlayerIds, fieldablePlayerIdsFor } from "./squad-depth.ts";

function club(playerIds: readonly ReturnType<typeof playerId>[]): Club {
  return {
    id: clubId("club:test"),
    name: "Test",
    shortName: "TST",
    playerIds,
  } as Club;
}

test("fieldablePlayerIds returns the club's stored roster under today's rules", () => {
  const roster = [playerId("player:000001"), playerId("player:000002")];

  assert.deepEqual(fieldablePlayerIds(club(roster)), roster);
});

test("fieldablePlayerIdsFor gives one shared answer for a missing club", () => {
  assert.deepEqual(fieldablePlayerIdsFor(undefined), []);
});

test("fieldablePlayerIdsFor agrees with the direct accessor for a present club", () => {
  const present = club([playerId("player:000003")]);

  assert.deepEqual(fieldablePlayerIdsFor(present), fieldablePlayerIds(present));
});
