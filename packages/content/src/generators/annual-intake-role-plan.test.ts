import assert from "node:assert/strict";
import { test } from "vitest";

import {
  PLAYER_ROLES,
  clubId,
  playerRoleSquadDepartment,
  type PlayerRole,
} from "@game/domain";

import {
  annualIntakeRoleCoverageFacts,
  planCompetitionAnnualIntakePositions,
  type AnnualIntakeRoleSlotKind,
} from "./annual-intake-role-plan.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import { assignGeneratedSquadIdentityRoles } from "./squad-identity.ts";

test("competition role planning is deterministic and reaches every outfield role", () => {
  const clubs = Array.from({ length: 18 }, (_, index) => ({
    clubId: clubId(`club:role-plan-${index + 1}`),
    slotKinds: ["goalkeeper", ...Array.from({ length: 7 }, () => "outfield")] as AnnualIntakeRoleSlotKind[],
    currentRoles: PLAYER_ROLES.slice(index % PLAYER_ROLES.length),
    targetRoles: PLAYER_ROLES.slice(index % PLAYER_ROLES.length),
  }));
  const input = {
    seed: "role-plan-world",
    seasonKey: "season:2",
    competitionKey: "competition:test",
    clubs,
  } as const;

  const first = planCompetitionAnnualIntakePositions(input);
  const second = planCompetitionAnnualIntakePositions(input);

  assert.deepEqual([...first], [...second]);
  const roles = [...first.values()].flat().map(primaryRoleForPosition);
  assert.deepEqual(new Set(roles), new Set(PLAYER_ROLES));
  assert.equal(roles.filter((role) => role === "goalkeeper").length, 18);
  assertBalanced(roles.filter((role) => role !== "goalkeeper"), PLAYER_ROLES.filter((role) => role !== "goalkeeper"));
});

test("academy department slots remain local while roles balance across the competition", () => {
  const departmentPlan = [
    "goalkeeper",
    "defender", "defender", "defender", "defender",
    "midfielder", "midfielder", "midfielder", "midfielder",
    "attacker", "attacker",
  ] as const satisfies readonly AnnualIntakeRoleSlotKind[];
  const clubs = Array.from({ length: 18 }, (_, index) => ({
    clubId: clubId(`club:academy-plan-${index + 1}`),
    slotKinds: departmentPlan,
    currentRoles: [] as PlayerRole[],
    targetRoles: PLAYER_ROLES,
  }));
  const result = planCompetitionAnnualIntakePositions({
    seed: "academy-plan-world",
    seasonKey: "season:1",
    competitionKey: "competition:academy",
    clubs,
  });

  const allRoles: PlayerRole[] = [];
  for (const club of clubs) {
    const positions = result.get(club.clubId);
    assert.ok(positions !== undefined);
    const roles = positions.map(primaryRoleForPosition);
    allRoles.push(...roles);
    assert.deepEqual(
      ["goalkeeper", "defender", "midfielder", "attacker"].map((department) =>
        roles.filter((role) => playerRoleSquadDepartment(role) === department).length
      ),
      [1, 4, 4, 2],
    );
  }

  assert.deepEqual(new Set(allRoles), new Set(PLAYER_ROLES));
  for (const department of ["goalkeeper", "defender", "midfielder", "attacker"] as const) {
    const eligible = PLAYER_ROLES.filter((role) => playerRoleSquadDepartment(role) === department);
    assertBalanced(allRoles.filter((role) => playerRoleSquadDepartment(role) === department), eligible);
  }
});

test("two-sided role plans cannot erase one flank", () => {
  const clubs = Array.from({ length: 20 }, (_, index) => ({
    clubId: clubId(`club:side-plan-${index + 1}`),
    slotKinds: Array.from({ length: 9 }, () => "outfield" as const),
    currentRoles: [] as PlayerRole[],
    targetRoles: PLAYER_ROLES,
  }));
  const result = planCompetitionAnnualIntakePositions({
    seed: "side-plan-world",
    seasonKey: "season:3",
    competitionKey: "competition:sides",
    clubs,
  });
  const positions = [...result.values()].flat();

  for (const [right, left] of [["rb", "lb"], ["rwb", "lwb"], ["rm", "lm"], ["rw", "lw"]] as const) {
    assert.equal(
      Math.abs(positions.filter((position) => position === right).length - positions.filter((position) => position === left).length) <= 1,
      true,
      `${right}/${left}`,
    );
  }
});

test("soft blueprints keep distinct role abundance without excluding any role", () => {
  const clubIds = Array.from({ length: 20 }, (_, index) =>
    clubId(`club:blueprint-plan-${index + 1}`)
  );
  const targetRoles = assignGeneratedSquadIdentityRoles({
    seed: "blueprint-plan-world",
    competitionIdentityKey: "competition:blueprint-plan",
    orderedClubIds: clubIds,
  });
  const clubs = clubIds.map((clubIdValue) => ({
    clubId: clubIdValue,
    slotKinds: Array.from({ length: 11 }, () => "outfield" as const),
    currentRoles: [] as PlayerRole[],
    targetRoles: targetRoles.get(clubIdValue) ?? [],
  }));
  const result = planCompetitionAnnualIntakePositions({
    seed: "blueprint-plan-world",
    seasonKey: "season:2",
    competitionKey: "competition:blueprint-plan",
    clubs,
  });
  const roleVectors = clubs.map(({ clubId: clubIdValue }) =>
    (result.get(clubIdValue) ?? []).map(primaryRoleForPosition).toSorted().join("|")
  );
  const allRoles = [...result.values()].flat().map(primaryRoleForPosition);

  assert.equal(new Set(roleVectors).size >= 6, true, roleVectors.join("\n"));
  assert.deepEqual(new Set(allRoles), new Set(PLAYER_ROLES.filter((role) => role !== "goalkeeper")));
});

test("coverage facts respect department-limited vacancy denominators", () => {
  assert.deepEqual(
    annualIntakeRoleCoverageFacts(["rw", "lw", "st", "st", "rw"]),
    {
      positiveRoles: ["winger", "striker"],
      maximumReachableRoleCount: 2,
      sidedRoleImbalanceCount: 0,
    },
  );
  assert.equal(
    annualIntakeRoleCoverageFacts(["rw", "rw"]).sidedRoleImbalanceCount,
    1,
  );
});

function assertBalanced(observed: readonly PlayerRole[], eligible: readonly PlayerRole[]): void {
  const counts = eligible.map((role) => observed.filter((candidate) => candidate === role).length);
  assert.equal(Math.max(...counts) - Math.min(...counts) <= 1, true, counts.join(","));
}
