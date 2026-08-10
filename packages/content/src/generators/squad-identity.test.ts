import assert from "node:assert/strict";
import { test } from "vitest";

import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  PLAYER_ROLES,
  clubId,
  playerSquadDepartment,
  type ClubId,
  type PlayerPosition,
  type PlayerRole,
  type PlayerSquadDepartment,
} from "@game/domain";

import { FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { primaryRoleForPosition } from "./player-role-identity.ts";
import {
  assignGeneratedSquadIdentities,
  assignGeneratedSquadIdentityRoles,
  GENERATED_SQUAD_IDENTITIES,
  GENERATED_SQUAD_IDENTITY_KEYS,
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

test("competition assignment is deterministic and balanced for twenty clubs", () => {
  const orderedClubIds = generatedClubIds(20);
  const input = {
    seed: "identity-world",
    competitionIdentityKey: "competition:test-20",
    orderedClubIds,
  } as const;
  const first = assignGeneratedSquadIdentities(input);
  const second = assignGeneratedSquadIdentities(input);

  assert.deepEqual(assignmentVector(first, orderedClubIds), assignmentVector(second, orderedClubIds));
  const counts = identityCounts(first);
  assert.deepEqual([...counts.values()].toSorted((left, right) => left - right), [2, 2, 2, 2, 3, 3, 3, 3]);
});

test("the annual-intake role blueprint is derived from the assigned position chart", () => {
  const orderedClubIds = generatedClubIds(20);
  const input = {
    seed: "identity-role-view",
    competitionIdentityKey: "competition:role-view",
    orderedClubIds,
  } as const;
  const identities = assignGeneratedSquadIdentities(input);
  const roles = assignGeneratedSquadIdentityRoles(input);

  for (const clubIdValue of orderedClubIds) {
    const identity = identities.get(clubIdValue);
    const roleVector = roles.get(clubIdValue);
    assert.ok(identity !== undefined);
    assert.ok(roleVector !== undefined);
    assert.deepEqual(roleVector, identity.positions.map(primaryRoleForPosition));
  }
});

test("every competition size uses only floor or ceiling counts without early repeats", () => {
  for (let clubCount = 1; clubCount <= 32; clubCount += 1) {
    const orderedClubIds = generatedClubIds(clubCount);
    const assignments = assignGeneratedSquadIdentities({
      seed: `balanced-${String(clubCount)}`,
      competitionIdentityKey: `competition:test-${String(clubCount)}`,
      orderedClubIds,
    });
    const counts = identityCounts(assignments);
    const floor = Math.floor(clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
    const ceiling = Math.ceil(clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);

    assert.equal(assignments.size, clubCount);
    for (const count of counts.values()) {
      assert.equal(count === floor || count === ceiling, true, `${String(clubCount)} clubs produced ${String(count)}`);
    }
    if (clubCount <= GENERATED_SQUAD_IDENTITY_KEYS.length) {
      assert.equal(new Set(assignmentVector(assignments, orderedClubIds)).size, clubCount);
    }
  }
});

test("competition identity participates in assignment and duplicate clubs are refused", () => {
  const orderedClubIds = generatedClubIds(18);
  const vectors = ["competition:one", "competition:two", "competition:three"].map(
    (competitionIdentityKey) => assignmentVector(
      assignGeneratedSquadIdentities({
        seed: "scoped-world",
        competitionIdentityKey,
        orderedClubIds,
      }),
      orderedClubIds,
    ).join("|"),
  );

  assert.equal(new Set(vectors).size >= 2, true, "competition scope did not change a real assignment");
  assert.throws(
    () => assignGeneratedSquadIdentities({
      seed: "duplicate-world",
      competitionIdentityKey: "competition:duplicate",
      orderedClubIds: [orderedClubIds[0]!, orderedClubIds[0]!],
    }),
    /duplicate club/,
  );
  assert.throws(
    () => assignGeneratedSquadIdentities({
      seed: "empty-scope-world",
      competitionIdentityKey: "",
      orderedClubIds,
    }),
    /requires a competition identity key/,
  );
});

test("a slot outside the squad is refused rather than answered", () => {
  const firstKey = GENERATED_SQUAD_IDENTITY_KEYS[0];
  assert.ok(firstKey !== undefined);
  const identity = GENERATED_SQUAD_IDENTITIES[firstKey];

  assert.throws(() => squadIdentityPositionForSlot(identity, 0), /has no slot 0/);
  assert.throws(
    () => squadIdentityPositionForSlot(identity, FAKE_PLAYERS_PER_CLUB + 1),
    /has no slot 23/,
  );
});

function allIdentities(): readonly GeneratedSquadIdentity[] {
  return GENERATED_SQUAD_IDENTITY_KEYS.map((key) => GENERATED_SQUAD_IDENTITIES[key]);
}

function generatedClubIds(count: number): readonly ClubId[] {
  return Array.from({ length: count }, (_, index) =>
    clubId(`club:identity-test-${String(index + 1).padStart(2, "0")}`)
  );
}

function assignmentVector(
  assignments: ReadonlyMap<ClubId, GeneratedSquadIdentity>,
  orderedClubIds: readonly ClubId[],
): readonly string[] {
  return orderedClubIds.map((id) => {
    const identity = assignments.get(id);
    assert.ok(identity !== undefined, `assignment omitted ${id}`);
    return identity.key;
  });
}

function identityCounts(
  assignments: ReadonlyMap<ClubId, GeneratedSquadIdentity>,
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>(
    GENERATED_SQUAD_IDENTITY_KEYS.map((key) => [key, 0]),
  );
  for (const identity of assignments.values()) {
    const currentCount = counts.get(identity.key);
    assert.ok(currentCount !== undefined);
    counts.set(identity.key, currentCount + 1);
  }
  return counts;
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
