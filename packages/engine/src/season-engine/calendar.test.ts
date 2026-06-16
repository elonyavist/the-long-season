import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, competitionId, gameDate, seasonId, type ClubId, type Fixture } from "@game/domain";
import { diffDays, fromISO } from "@game/shared";

import { generateRoundRobinCalendar, type RoundRobinCalendar } from "../index.ts";

/**
 * Calendar tests prove deterministic double round-robin generation without
 * simulating fixtures or deriving league tables.
 */

test("for 18 clubs, generate 34 rounds", () => {
  const calendar = generateCalendar();

  assert.equal(calendar.rounds.length, 34);
  assert.equal(calendar.fixtureIds.length, 306);
  assert.equal(calendar.fixtures.length, 306);
});

test("each pair plays twice", () => {
  const calendar = generateCalendar();

  for (let firstIndex = 0; firstIndex < calendarInputClubIds.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < calendarInputClubIds.length; secondIndex += 1) {
      const firstClubId = calendarInputClubIds[firstIndex];
      const secondClubId = calendarInputClubIds[secondIndex];
      assert.ok(firstClubId !== undefined);
      assert.ok(secondClubId !== undefined);

      assert.equal(countPairFixtures(calendar.fixtures, firstClubId, secondClubId), 2);
    }
  }
});

test("home and away are inverted in return fixtures", () => {
  const calendar = generateCalendar();

  for (let firstHalfIndex = 0; firstHalfIndex < calendar.fixtures.length / 2; firstHalfIndex += 1) {
    const firstHalfFixture = calendar.fixtures[firstHalfIndex];
    const returnFixture = calendar.fixtures[firstHalfIndex + calendar.fixtures.length / 2];
    assert.ok(firstHalfFixture !== undefined);
    assert.ok(returnFixture !== undefined);

    assert.equal(returnFixture.homeClubId, firstHalfFixture.awayClubId);
    assert.equal(returnFixture.awayClubId, firstHalfFixture.homeClubId);
  }
});

test("no club plays twice in the same round", () => {
  const calendar = generateCalendar();

  for (const round of calendar.rounds) {
    const clubsInRound: ClubId[] = [];

    for (const fixtureId of round.fixtureIds) {
      const fixture = findFixture(calendar.fixtures, String(fixtureId));
      assert.ok(fixture !== undefined);
      assert.equal(clubsInRound.includes(fixture.homeClubId), false);
      assert.equal(clubsInRound.includes(fixture.awayClubId), false);
      clubsInRound.push(fixture.homeClubId, fixture.awayClubId);
    }
  }
});

test("same seed produces same fixture order", () => {
  const first = generateCalendar({ seed: "schedule-seed" });
  const second = generateCalendar({ seed: "schedule-seed" });

  assert.deepEqual(first.fixtureIds, second.fixtureIds);
  assert.deepEqual(first.fixtures, second.fixtures);
});

test("different seed can produce different fixture order", () => {
  const first = generateCalendar({ seed: "schedule-seed-a" });
  const second = generateCalendar({ seed: "schedule-seed-b" });

  assert.notDeepEqual(
    first.fixtures.map((fixture) => `${fixture.homeClubId}|${fixture.awayClubId}`),
    second.fixtures.map((fixture) => `${fixture.homeClubId}|${fixture.awayClubId}`),
  );
});

test("dates advance by seven days", () => {
  const calendar = generateCalendar();

  for (let index = 0; index < calendar.rounds.length; index += 1) {
    const round = calendar.rounds[index];
    assert.ok(round !== undefined);
    assert.equal(diffDays(round.date, gameDate(fromISO("2026-08-01"))), index * 7);
  }
});

test("fixture IDs use the fixture namespace and explicit order", () => {
  const calendar = generateCalendar();

  assert.equal(calendar.fixtureIds[0], "fixture:000001");
  assert.equal(calendar.fixtureIds[calendar.fixtureIds.length - 1], "fixture:000306");
  assert.equal(calendar.fixtures[0]?.id, calendar.fixtureIds[0]);
});

/**
 * Generates the standard 18-club test calendar.
 */
function generateCalendar(options: { readonly seed?: string } = {}): RoundRobinCalendar {
  return generateRoundRobinCalendar({
    seed: options.seed ?? "schedule-seed",
    seasonId: seasonId("season:2026"),
    competitionId: competitionId("competition:ita-3"),
    clubIds: calendarInputClubIds,
    seasonStartDate: gameDate(fromISO("2026-08-01")),
  });
}

/**
 * Counts fixtures between two clubs regardless of home/away order.
 */
function countPairFixtures(fixtures: readonly Fixture[], firstClubId: ClubId, secondClubId: ClubId): number {
  let count = 0;

  for (const fixture of fixtures) {
    const direct = fixture.homeClubId === firstClubId && fixture.awayClubId === secondClubId;
    const inverse = fixture.homeClubId === secondClubId && fixture.awayClubId === firstClubId;

    if (direct || inverse) {
      count += 1;
    }
  }

  return count;
}

/**
 * Finds one fixture by string ID without relying on object-key order.
 */
function findFixture(fixtures: readonly Fixture[], id: string): Fixture | undefined {
  for (const fixture of fixtures) {
    if (fixture.id === id) {
      return fixture;
    }
  }

  return undefined;
}

/** Explicit ordered participant IDs used by calendar tests. */
const calendarInputClubIds: readonly ClubId[] = [
  clubId("club:team-01"),
  clubId("club:team-02"),
  clubId("club:team-03"),
  clubId("club:team-04"),
  clubId("club:team-05"),
  clubId("club:team-06"),
  clubId("club:team-07"),
  clubId("club:team-08"),
  clubId("club:team-09"),
  clubId("club:team-10"),
  clubId("club:team-11"),
  clubId("club:team-12"),
  clubId("club:team-13"),
  clubId("club:team-14"),
  clubId("club:team-15"),
  clubId("club:team-16"),
  clubId("club:team-17"),
  clubId("club:team-18"),
];
