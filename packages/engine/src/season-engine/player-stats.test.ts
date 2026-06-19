import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  MATCH_EVENT_SCHEMA_VERSION,
  playerId,
  seasonId,
  type Fixture,
  type FixtureId,
  type MatchReport,
} from "@game/domain";
import { fromISO } from "@game/shared";

import { computeSeasonPlayerGoalStats } from "./player-stats.ts";

/**
 * Player-stat tests prove that season scorer totals come from structured
 * durable match reports, not fixture score totals or rendered text.
 */

test("aggregates player goals across multiple match reports", () => {
  const fixtures = fixturesById([
    playedFixture({
      fixtureValue: "fixture:stats-001",
      homeGoals: [playerId("player:home-10"), playerId("player:home-10")],
      awayGoals: [playerId("player:away-09")],
    }),
    playedFixture({
      fixtureValue: "fixture:stats-002",
      homeGoals: [playerId("player:home-10")],
      awayGoals: [],
    }),
  ]);
  const rows = computeSeasonPlayerGoalStats({
    fixtures,
    fixtureIds: [fixtureId("fixture:stats-001"), fixtureId("fixture:stats-002")],
  });

  assert.deepEqual(rows, [
    { playerId: playerId("player:home-10"), clubId: clubId("club:home"), goals: 3 },
    { playerId: playerId("player:away-09"), clubId: clubId("club:away"), goals: 1 },
  ]);
});

test("registered players with no goals stay in the table", () => {
  const fixtures = fixturesById([
    playedFixture({
      fixtureValue: "fixture:stats-zero",
      homeGoals: [playerId("player:home-10")],
      awayGoals: [],
    }),
  ]);
  const rows = computeSeasonPlayerGoalStats({
    fixtures,
    fixtureIds: [fixtureId("fixture:stats-zero")],
    playerRegistrations: [
      { playerId: playerId("player:home-10"), clubId: clubId("club:home") },
      { playerId: playerId("player:home-11"), clubId: clubId("club:home") },
    ],
  });

  assert.deepEqual(rows, [
    { playerId: playerId("player:home-10"), clubId: clubId("club:home"), goals: 1 },
    { playerId: playerId("player:home-11"), clubId: clubId("club:home"), goals: 0 },
  ]);
});

test("ties are sorted by stable player ID", () => {
  const fixtures = fixturesById([
    playedFixture({
      fixtureValue: "fixture:stats-tie",
      homeGoals: [playerId("player:home-b")],
      awayGoals: [playerId("player:away-a")],
    }),
  ]);
  const rows = computeSeasonPlayerGoalStats({
    fixtures,
    fixtureIds: [fixtureId("fixture:stats-tie")],
  });

  assert.deepEqual(rows, [
    { playerId: playerId("player:away-a"), clubId: clubId("club:away"), goals: 1 },
    { playerId: playerId("player:home-b"), clubId: clubId("club:home"), goals: 1 },
  ]);
});

/**
 * Builds a fixture with an attached durable match report.
 */
function playedFixture(options: {
  readonly fixtureValue: string;
  readonly homeGoals: readonly ReturnType<typeof playerId>[];
  readonly awayGoals: readonly ReturnType<typeof playerId>[];
}): Fixture {
  const id = fixtureId(options.fixtureValue);

  return {
    id,
    competitionId: competitionId("competition:stats"),
    seasonId: seasonId("season:2026"),
    roundNumber: 1,
    date: gameDate(fromISO("2026-08-01")),
    homeClubId: clubId("club:home"),
    awayClubId: clubId("club:away"),
    result: {
      played: true,
      homeGoals: options.homeGoals.length,
      awayGoals: options.awayGoals.length,
      report: matchReport(id, options.homeGoals, options.awayGoals),
    },
  };
}

/**
 * Builds one durable match report from goal scorer IDs.
 */
function matchReport(
  id: FixtureId,
  homeGoals: readonly ReturnType<typeof playerId>[],
  awayGoals: readonly ReturnType<typeof playerId>[],
): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: id,
    finalMinute: 90,
    score: {
      home: homeGoals.length,
      away: awayGoals.length,
    },
    stats: {
      home: {
        opportunities: homeGoals.length,
        shots: homeGoals.length,
        shotsOnTarget: homeGoals.length,
        goals: homeGoals.length,
      },
      away: {
        opportunities: awayGoals.length,
        shots: awayGoals.length,
        shotsOnTarget: awayGoals.length,
        goals: awayGoals.length,
      },
    },
    events: [...goalEvents("home", homeGoals), ...goalEvents("away", awayGoals)],
  };
}

/**
 * Builds durable goal events for one side.
 */
function goalEvents(side: "home" | "away", scorers: readonly ReturnType<typeof playerId>[]): MatchReport["events"] {
  return scorers.map((scorerPlayerId, index) => ({
    type: "goal",
    shot: {
      minute: index + 1,
      side,
      quality: 0.8,
      isShotOnTarget: true,
    },
    scorerPlayerId,
  }));
}

/**
 * Indexes fixtures by ID for aggregation tests.
 */
function fixturesById(fixtures: readonly Fixture[]): Readonly<Record<FixtureId, Fixture>> {
  const lookup: Record<FixtureId, Fixture> = {};

  for (const fixture of fixtures) {
    lookup[fixture.id] = fixture;
  }

  return lookup;
}
