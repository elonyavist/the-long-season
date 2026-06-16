import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  seasonId,
  type ClubId,
  type Fixture,
  type FixtureId,
  type LeagueTableRules,
} from "@game/domain";

import { computeLeagueTable } from "../index.ts";

/**
 * League-table tests prove that standings are derived from compact fixture
 * results without reading match events, simulating matches, or persisting rows.
 */

test("wins, draws, losses, goals, and points are computed correctly", () => {
  const table = computeLeagueTable({
    clubIds: standardClubIds,
    fixtures: standardFixtures(),
    fixtureIds: standardFixtureIds,
    rules: standardRules,
  });

  assert.deepEqual(table, [
    row(1, "club:alpha", 1, 1, 0, 0, 2, 0, 2, 3),
    row(2, "club:bravo", 2, 1, 0, 1, 3, 4, -1, 3),
    row(3, "club:delta", 1, 0, 1, 0, 1, 1, 0, 1),
    row(4, "club:charlie", 2, 0, 1, 1, 3, 4, -1, 1),
  ]);
});

test("unplayed fixtures are ignored", () => {
  const table = computeLeagueTable({
    clubIds: standardClubIds,
    fixtures: standardFixtures(),
    fixtureIds: standardFixtureIds,
    rules: standardRules,
  });

  const alpha = table[0];
  const delta = table[2];
  assert.ok(alpha !== undefined);
  assert.ok(delta !== undefined);
  assert.equal(alpha.clubId, "club:alpha");
  assert.equal(alpha.played, 1);
  assert.equal(delta.clubId, "club:delta");
  assert.equal(delta.played, 1);
});

test("sorting follows points, goal difference, goals for, and club ID", () => {
  const alpha = clubId("club:alpha");
  const bravo = clubId("club:bravo");
  const charlie = clubId("club:charlie");
  const fixtures = fixturesById([
    playedFixture("fixture:sort-001", alpha, charlie, 2, 0),
    playedFixture("fixture:sort-002", bravo, charlie, 3, 1),
  ]);
  const fixtureIds = [fixtureId("fixture:sort-001"), fixtureId("fixture:sort-002")];

  const table = computeLeagueTable({
    clubIds: [alpha, bravo, charlie],
    fixtures,
    fixtureIds,
    rules: standardRules,
  });

  assert.equal(table[0]?.clubId, "club:bravo");
  assert.equal(table[1]?.clubId, "club:alpha");
  assert.equal(table[2]?.clubId, "club:charlie");
});

test("tied rows have stable deterministic order by club ID", () => {
  const alpha = clubId("club:alpha");
  const bravo = clubId("club:bravo");
  const fixtures = fixturesById([
    playedFixture("fixture:tied-001", alpha, bravo, 1, 0),
    playedFixture("fixture:tied-002", bravo, alpha, 1, 0),
  ]);
  const fixtureIds = [fixtureId("fixture:tied-001"), fixtureId("fixture:tied-002")];

  const table = computeLeagueTable({
    clubIds: [bravo, alpha],
    fixtures,
    fixtureIds,
    rules: standardRules,
  });

  assert.equal(table[0]?.clubId, "club:alpha");
  assert.equal(table[1]?.clubId, "club:bravo");
});

test("input fixtures and club ID arrays are not mutated", () => {
  const clubIds = [...standardClubIds];
  const fixtureIds = [...standardFixtureIds];
  const fixtures = standardFixtures();
  const beforeClubIds = JSON.stringify(clubIds);
  const beforeFixtureIds = JSON.stringify(fixtureIds);
  const beforeFixtures = JSON.stringify(fixtures);

  computeLeagueTable({
    clubIds,
    fixtures,
    fixtureIds,
    rules: standardRules,
  });

  assert.equal(JSON.stringify(clubIds), beforeClubIds);
  assert.equal(JSON.stringify(fixtureIds), beforeFixtureIds);
  assert.equal(JSON.stringify(fixtures), beforeFixtures);
});

/**
 * Builds one expected immutable table row.
 */
function row(
  position: number,
  clubIdValue: string,
  played: number,
  wins: number,
  draws: number,
  losses: number,
  goalsFor: number,
  goalsAgainst: number,
  goalDifference: number,
  points: number,
) {
  return {
    position,
    clubId: clubId(clubIdValue),
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points,
  };
}

/**
 * Builds the standard fixture lookup used by scoring tests.
 */
function standardFixtures(): Readonly<Record<FixtureId, Fixture>> {
  return fixturesById([
    playedFixture("fixture:table-001", standardClubIds[0], standardClubIds[1], 2, 0),
    playedFixture("fixture:table-002", standardClubIds[2], standardClubIds[3], 1, 1),
    playedFixture("fixture:table-003", standardClubIds[1], standardClubIds[2], 3, 2),
    unplayedFixture("fixture:table-004", standardClubIds[0], standardClubIds[3]),
  ]);
}

/**
 * Builds a fixture lookup from explicit fixture order.
 */
function fixturesById(fixtures: readonly Fixture[]): Readonly<Record<FixtureId, Fixture>> {
  const lookup: Record<FixtureId, Fixture> = {};

  for (const fixture of fixtures) {
    lookup[fixture.id] = fixture;
  }

  return lookup;
}

/**
 * Builds one fixture with a compact played result.
 */
function playedFixture(
  idValue: string,
  homeClubId: ClubId | undefined,
  awayClubId: ClubId | undefined,
  homeGoals: number,
  awayGoals: number,
): Fixture {
  assert.ok(homeClubId !== undefined);
  assert.ok(awayClubId !== undefined);

  return {
    ...unplayedFixture(idValue, homeClubId, awayClubId),
    result: {
      played: true,
      homeGoals,
      awayGoals,
    },
  };
}

/**
 * Builds one scheduled fixture without a played result.
 */
function unplayedFixture(idValue: string, homeClubId: ClubId | undefined, awayClubId: ClubId | undefined): Fixture {
  assert.ok(homeClubId !== undefined);
  assert.ok(awayClubId !== undefined);

  return {
    id: fixtureId(idValue),
    competitionId: competitionId("competition:table-test"),
    seasonId: seasonId("season:2026"),
    roundNumber: 1,
    date: gameDate(20_000),
    homeClubId,
    awayClubId,
  };
}

/** Standard association-football point rules used by these tests. */
const standardRules: LeagueTableRules = {
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
};

/** Explicit participant order used by scoring tests. */
const standardClubIds: readonly ClubId[] = [
  clubId("club:alpha"),
  clubId("club:bravo"),
  clubId("club:charlie"),
  clubId("club:delta"),
];

/** Explicit fixture order used by scoring tests. */
const standardFixtureIds: readonly FixtureId[] = [
  fixtureId("fixture:table-001"),
  fixtureId("fixture:table-002"),
  fixtureId("fixture:table-003"),
  fixtureId("fixture:table-004"),
];
