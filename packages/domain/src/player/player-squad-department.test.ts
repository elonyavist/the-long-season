import assert from "node:assert/strict";
import { test } from "vitest";

import type { Player } from "../entities/player.entity.ts";
import { playerSquadDepartment } from "./player-squad-department.ts";

test("playerSquadDepartment uses explicit football role before legacy position", () => {
  assert.equal(
    playerSquadDepartment({ primaryRole: "wide_midfielder", naturalPositions: ["rw"] }),
    "midfielder",
  );
  assert.equal(
    playerSquadDepartment({ primaryRole: "winger", naturalPositions: ["rw"] }),
    "attacker",
  );
});

test("playerSquadDepartment supports legacy players without role identity", () => {
  const legacyPlayer = {
    naturalPositions: ["cm"],
  } as Pick<Player, "primaryRole" | "naturalPositions">;

  assert.equal(playerSquadDepartment(legacyPlayer), "midfielder");
});
