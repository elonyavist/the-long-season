import assert from "node:assert/strict";
import { test } from "vitest";

import { PLAYER_ROLES, type Player } from "../entities/player.entity.ts";
import { playerRoleSquadDepartment, playerSquadDepartment } from "./player-squad-department.ts";

test("playerRoleSquadDepartment classifies every official role", () => {
  assert.deepEqual(
    PLAYER_ROLES.map((role) => [role, playerRoleSquadDepartment(role)]),
    [
      ["goalkeeper", "goalkeeper"],
      ["center_back", "defender"],
      ["full_back", "defender"],
      ["wing_back", "defender"],
      ["defensive_midfielder", "midfielder"],
      ["central_midfielder", "midfielder"],
      ["attacking_midfielder", "midfielder"],
      ["wide_midfielder", "midfielder"],
      ["winger", "attacker"],
      ["striker", "attacker"],
    ],
  );
});

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

test("a wide midfielder counts against the midfield floor, from his position too", () => {
  // `rm`/`lm` arrived with Phase 81A Step 03A, and the position switch had a
  // `default` that would have quietly filed them as attackers - which is a squad
  // floor (`2 gk / 6 def / 6 mid / 3 att`) being enforced against the wrong
  // department. The role-level map already said `midfielder`; the two must agree.
  assert.equal(playerSquadDepartment({ naturalPositions: ["rm"] } as never), "midfielder");
  assert.equal(playerSquadDepartment({ naturalPositions: ["lm"] } as never), "midfielder");
  assert.equal(
    playerSquadDepartment({ primaryRole: "wide_midfielder", naturalPositions: ["rm"] }),
    "midfielder",
  );
});
