import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerId } from "@game/domain";

import {
  buildManualTacticChangeSchedule,
  isValidManualTacticChangeSchedule,
  ManualTacticChangeError,
  type BuildManualTacticChangeScheduleInput,
  type ManualTacticChange,
  type ManualTacticChangeErrorCode,
} from "./manual-tactic-change.ts";
import type { MatchTeamContext } from "./match-context.ts";

/**
 * Manual tactic-change tests cover the contract only. They intentionally do not
 * run segmented match simulation or add automatic tactical decisions.
 */
test("buildManualTacticChangeSchedule returns deterministic sorted changes", () => {
  const awayAt46 = tacticChange("away", 46, "club:away-attacking");
  const homeAt46 = tacticChange("home", 46, "club:home-attacking");
  const homeAt70 = tacticChange("home", 70, "club:home-defensive");

  const schedule = buildManualTacticChangeSchedule({
    minuteCount: 90,
    changes: [homeAt70, awayAt46, homeAt46],
  });

  assert.deepEqual(
    schedule.changes.map((change) => `${change.minute}:${change.side}:${change.team.clubId}`),
    ["46:home:club:home-attacking", "46:away:club:away-attacking", "70:home:club:home-defensive"],
  );
  assert.equal(schedule.minuteCount, 90);
});

test("manual tactic-change schedules stay JSON serializable", () => {
  const schedule = buildManualTacticChangeSchedule({
    minuteCount: 90,
    changes: [tacticChange("home", 46, "club:home-attacking")],
  });

  assert.deepEqual(JSON.parse(JSON.stringify(schedule)), schedule);
});

test("manual tactic-change validation rejects invalid match length", () => {
  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        ...validInput(),
        minuteCount: 0,
      }),
    "invalid_minute_count",
  );

  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        ...validInput(),
        minuteCount: 90.5,
      }),
    "invalid_minute_count",
  );
});

test("manual tactic-change validation rejects changes outside the match range", () => {
  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        minuteCount: 90,
        changes: [tacticChange("home", 0, "club:home-attacking")],
      }),
    "invalid_change_minute",
  );

  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        minuteCount: 90,
        changes: [tacticChange("home", 91, "club:home-attacking")],
      }),
    "invalid_change_minute",
  );
});

test("manual tactic-change validation rejects invalid side keys", () => {
  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        minuteCount: 90,
        changes: [tacticChange("neutral" as ManualTacticChange["side"], 46, "club:home-attacking")],
      }),
    "invalid_side",
  );
});

test("manual tactic-change validation rejects duplicate side and minute pairs", () => {
  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        minuteCount: 90,
        changes: [
          tacticChange("home", 46, "club:home-attacking"),
          tacticChange("home", 46, "club:home-defensive"),
        ],
      }),
    "duplicate_side_minute",
  );
});

test("manual tactic-change validation rejects missing team context", () => {
  assertManualTacticChangeError(
    () =>
      buildManualTacticChangeSchedule({
        minuteCount: 90,
        changes: [
          {
            side: "home",
            minute: 46,
            team: undefined,
          } as unknown as ManualTacticChange,
        ],
      }),
    "missing_team_context",
  );
});

test("isValidManualTacticChangeSchedule reports validation outcome", () => {
  assert.equal(isValidManualTacticChangeSchedule(validInput()), true);
  assert.equal(
    isValidManualTacticChangeSchedule({
      minuteCount: 90,
      changes: [tacticChange("home", 120, "club:home-attacking")],
    }),
    false,
  );
});

/**
 * Builds a valid schedule input for validation tests.
 */
function validInput(): BuildManualTacticChangeScheduleInput {
  return {
    minuteCount: 90,
    changes: [tacticChange("home", 46, "club:home-attacking")],
  };
}

/**
 * Builds one explicit tactic change for a side.
 */
function tacticChange(
  side: ManualTacticChange["side"],
  minute: number,
  teamClubId: string,
): ManualTacticChange {
  return {
    side,
    minute,
    team: teamContext(teamClubId),
  };
}

/**
 * Builds a minimal already-built team context.
 */
function teamContext(teamClubId: string): MatchTeamContext {
  return {
    clubId: clubId(teamClubId),
    lineup: [createLineupSlot({ slotId: "slot:01", playerId: playerId(`${teamClubId.replace("club:", "player:")}-01`), canonicalRole: "goalkeeper" })],
    strength: {
      attack: 10,
      midfield: 10,
      defense: 10,
      goalkeeper: 10,
      overall: 10,
    },
    tacticalDistribution: {
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
    },
  };
}

/**
 * Asserts that a callback throws a manual tactic-change error code.
 */
function assertManualTacticChangeError(callback: () => void, code: ManualTacticChangeErrorCode): void {
  assert.throws(
    callback,
    (error: unknown) => error instanceof ManualTacticChangeError && error.code === code,
  );
}
