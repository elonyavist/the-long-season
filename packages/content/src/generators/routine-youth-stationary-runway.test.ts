import assert from "node:assert/strict";
import { test } from "vitest";

import { PLAYER_ROLES } from "@game/domain";

import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  ROUTINE_YOUTH_STATIONARY_RUNWAY_BASIS_POINTS,
  ROUTINE_YOUTH_STATIONARY_RUNWAY_TARGETS,
  routineYouthStationaryRunwayTarget,
} from "./routine-youth-stationary-runway.ts";

test("routine-youth runway owns one quarter-point target per division and role below six stars", () => {
  const divisions = [
    "first_division",
    "second_division",
    "third_division",
  ] as const;
  const rows = divisions.flatMap((division) => PLAYER_ROLES.map((role) => ({
    division,
    role,
    target: ROUTINE_YOUTH_STATIONARY_RUNWAY_TARGETS[division][role],
  })));
  const sixStarFloor = playerRatingScale.abilityThresholds.find(
    ({ rating }) => rating === 6,
  )?.minimumAbilityInclusive;
  assert.notEqual(sixStarFloor, undefined);
  assert.equal(rows.length, 3 * PLAYER_ROLES.length);
  assert.equal(new Set(rows.map(({ division, role }) => `${division}:${role}`)).size, rows.length);
  for (const row of rows) {
    assert.equal(row.target * 4, Math.round(row.target * 4));
    assert.equal(row.target < sixStarFloor!, true);
  }
});

test("routine-youth runway selection is deterministic, stable per player and reachable both ways", () => {
  const decisions = Array.from({ length: 2_000 }, (_, index) => {
    const input = {
      worldSeed: "runway-reachability",
      playerKey: `player:academy-${String(index).padStart(4, "0")}`,
      division: "second_division" as const,
      role: "central_midfielder" as const,
    };
    const first = routineYouthStationaryRunwayTarget(input);
    const replay = routineYouthStationaryRunwayTarget(input);
    assert.equal(replay, first);
    return first;
  });
  const selected = decisions.filter((target) => target !== undefined).length;
  assert.equal(selected > 0 && selected < decisions.length, true);
  assert.equal(ROUTINE_YOUTH_STATIONARY_RUNWAY_BASIS_POINTS, 5_000);
});

test("routine-youth runway never reads candidate order", () => {
  const keys = Array.from({ length: 80 }, (_, index) => `player:stable-${index}`);
  const decide = (orderedKeys: readonly string[]) => Object.fromEntries(
    orderedKeys.map((playerKey) => [
      playerKey,
      routineYouthStationaryRunwayTarget({
        worldSeed: "runway-order",
        playerKey,
        division: "first_division",
        role: "winger",
      }),
    ]),
  );
  assert.deepEqual(decide(keys), decide([...keys].reverse()));
});
