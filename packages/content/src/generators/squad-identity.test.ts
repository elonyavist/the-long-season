import assert from "node:assert/strict";
import { test } from "vitest";

import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  PLAYER_ROLES,
  playerSquadDepartment,
  type PlayerPosition,
  type PlayerRole,
  type PlayerSquadDepartment,
} from "@game/domain";

import { FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import {
  GENERATED_SQUAD_IDENTITIES,
  GENERATED_SQUAD_IDENTITY_KEYS,
  generatedSquadIdentity,
  squadIdentityPositionForSlot,
  type GeneratedSquadIdentity,
} from "./squad-identity.ts";

test("every squad identity fills the whole squad and keeps two goalkeepers", () => {
  for (const identity of allIdentities()) {
    assert.equal(identity.positions.length, FAKE_PLAYERS_PER_CLUB, identity.key);

    const goalkeeperSlots = identity.positions
      .map((position, index) => ({ position, slotNumber: index + 1 }))
      .filter((entry) => entry.position === "gk")
      .map((entry) => entry.slotNumber);

    assert.deepEqual(goalkeeperSlots, [1, 12], identity.key);
  }
});

test("every squad identity fields exactly one goalkeeper and ten outfielders", () => {
  for (const identity of allIdentities()) {
    const eleven = identity.positions.slice(0, FAKE_LINEUP_SIZE);
    const goalkeepers = eleven.filter((position) => position === "gk");

    assert.equal(eleven.length, FAKE_LINEUP_SIZE, identity.key);
    assert.equal(goalkeepers.length, 1, identity.key);
  }
});

// The floors are read from their domain owner, not restated. A generated squad
// born under one hands every club that draws it a `weak_*_depth` warning and a
// signing to make on its first day, which is a squad nobody designed.
test("every squad identity clears the career department floors on its first day", () => {
  for (const identity of allIdentities()) {
    const depth = departmentDepth(identity);

    for (const [department, minimum] of Object.entries(MINIMUM_CAREER_DEPARTMENT_DEPTH)) {
      assert.equal(
        depth[department as PlayerSquadDepartment] >= minimum,
        true,
        `${identity.key} has ${String(depth[department as PlayerSquadDepartment])} ${department}, needs ${String(minimum)}`,
      );
    }
  }
});

test("the identity table reaches all ten primary roles without any one squad holding them", () => {
  const reached = new Set<PlayerRole>();
  let widestSquad = 0;

  for (const identity of allIdentities()) {
    const squadRoles = new Set(identity.positions.map((position) => primaryRoleForPosition(position)));
    for (const role of squadRoles) {
      reached.add(role);
    }
    widestSquad = Math.max(widestSquad, squadRoles.size);
  }

  assert.deepEqual([...reached].toSorted(), [...PLAYER_ROLES].toSorted());
  assert.equal(widestSquad < PLAYER_ROLES.length, true, "no single squad may hold all ten roles");
});

test("no role is stocked by every identity, so abundance varies between clubs", () => {
  const identities = allIdentities();
  const optionalRoles: readonly PlayerRole[] = [
    "full_back",
    "wing_back",
    "defensive_midfielder",
    "attacking_midfielder",
    "wide_midfielder",
    "winger",
  ];

  for (const role of optionalRoles) {
    const holders = identities.filter((identity) =>
      identity.positions.some((position) => primaryRoleForPosition(position) === role)
    );

    assert.equal(holders.length > 0, true, `${role} is unreachable`);
    assert.equal(holders.length < identities.length, true, `${role} is in every squad`);
  }
});

test("squad identity is deterministic for a seed and club number", () => {
  const first = generatedSquadIdentity("identity-world", 7);
  const second = generatedSquadIdentity("identity-world", 7);

  assert.equal(first.key, second.key);
  assert.deepEqual(first.positions, second.positions);
});

test("a generated division draws several different squad identities", () => {
  const drawn = new Set<string>();

  for (let clubNumber = 1; clubNumber <= 18; clubNumber += 1) {
    drawn.add(generatedSquadIdentity("demo-001", clubNumber).key);
  }

  assert.equal(drawn.size >= 4, true, `one division drew only ${String(drawn.size)} identities`);
});

test("every identity is reachable across seeds", () => {
  const drawn = new Set<string>();

  for (let seedNumber = 0; seedNumber < 40; seedNumber += 1) {
    for (let clubNumber = 1; clubNumber <= 18; clubNumber += 1) {
      drawn.add(generatedSquadIdentity(`reach-${String(seedNumber)}`, clubNumber).key);
    }
  }

  assert.deepEqual([...drawn].toSorted(), [...GENERATED_SQUAD_IDENTITY_KEYS].toSorted());
});

test("a slot outside the squad is refused rather than answered", () => {
  const identity = generatedSquadIdentity("demo-001", 1);

  assert.throws(() => squadIdentityPositionForSlot(identity, 0), /has no slot 0/);
  assert.throws(
    () => squadIdentityPositionForSlot(identity, FAKE_PLAYERS_PER_CLUB + 1),
    /has no slot 23/,
  );
});

function allIdentities(): readonly GeneratedSquadIdentity[] {
  return GENERATED_SQUAD_IDENTITY_KEYS.map((key) => GENERATED_SQUAD_IDENTITIES[key]);
}

/**
 * Counts one identity's players per department through the domain owner.
 *
 * Reading the department off `playerSquadDepartment` rather than a local map
 * is what keeps this test measuring the game's own answer: a position that
 * changes department there changes the count here, instead of two maps
 * agreeing on paper and disagreeing in a career.
 */
function departmentDepth(
  identity: GeneratedSquadIdentity,
): Readonly<Record<PlayerSquadDepartment, number>> {
  const depth: Record<PlayerSquadDepartment, number> = {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0,
  };

  for (const position of identity.positions) {
    depth[departmentOf(position)] += 1;
  }

  return depth;
}

function departmentOf(position: PlayerPosition): PlayerSquadDepartment {
  return playerSquadDepartment({
    primaryRole: primaryRoleForPosition(position),
    naturalPositions: [position],
  });
}
