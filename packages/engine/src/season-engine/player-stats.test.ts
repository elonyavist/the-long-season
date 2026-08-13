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

import { computeSeasonPlayerGoalStats, computeSeasonPlayerSummaryStats } from "./player-stats.ts";

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

/**
 * Fixes the attribution rule this phase committed to (A8).
 *
 * A goal and its assist belong to the club the player was fielded by. Here the
 * borrowed player is registered against `club:parent`, which holds his contract,
 * and scores for `club:home`, which fielded him. The two sources disagree on
 * purpose - that is the only way to prove which one the aggregator obeys - and
 * they cannot disagree in the shipped game until Phase 82A's first loan, by
 * which time this history already exists.
 */
test("a borrowed player's goal and assist belong to the club that fielded him", () => {
  const borrowed = playerId("player:borrowed");
  const assistant = playerId("player:borrowed-assistant");
  const fixtures = fixturesById([
    playedFixture({
      fixtureValue: "fixture:stats-loan",
      homeGoals: [borrowed],
      homeGoalAssists: [assistant],
      awayGoals: [],
    }),
  ]);
  const rows = computeSeasonPlayerSummaryStats({
    fixtures,
    fixtureIds: [fixtureId("fixture:stats-loan")],
    playerRegistrations: [
      { playerId: borrowed, clubId: clubId("club:parent") },
      { playerId: assistant, clubId: clubId("club:parent") },
    ],
  });

  assert.deepEqual(findSummaryRow(rows, borrowed), {
    playerId: borrowed,
    clubId: clubId("club:home"),
    goals: 1,
    assists: 0,
    saves: 0,
  });
  assert.equal(findSummaryRow(rows, assistant)?.clubId, clubId("club:home"));
  assert.equal(findSummaryRow(rows, assistant)?.assists, 1);
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

test("aggregates goals assists and goalkeeper saves from durable reports", () => {
  const fixtures = fixturesById([
    playedFixture({
      fixtureValue: "fixture:stats-summary",
      homeGoals: [playerId("player:home-10")],
      homeGoalAssists: [playerId("player:home-11")],
      awayGoals: [playerId("player:away-09")],
      homeGoalkeeperSaves: [playerId("player:home-01")],
      awayGoalkeeperSaves: [playerId("player:away-01"), playerId("player:away-01")],
    }),
  ]);
  const rows = computeSeasonPlayerSummaryStats({
    fixtures,
    fixtureIds: [fixtureId("fixture:stats-summary")],
    playerRegistrations: [
      { playerId: playerId("player:home-01"), clubId: clubId("club:home") },
      { playerId: playerId("player:home-10"), clubId: clubId("club:home") },
      { playerId: playerId("player:home-11"), clubId: clubId("club:home") },
      { playerId: playerId("player:away-01"), clubId: clubId("club:away") },
      { playerId: playerId("player:away-09"), clubId: clubId("club:away") },
      { playerId: playerId("player:away-10"), clubId: clubId("club:away") },
    ],
  });

  assert.deepEqual(findSummaryRow(rows, playerId("player:home-10")), {
    playerId: playerId("player:home-10"),
    clubId: clubId("club:home"),
    goals: 1,
    assists: 0,
    saves: 0,
  });
  assert.deepEqual(findSummaryRow(rows, playerId("player:home-11")), {
    playerId: playerId("player:home-11"),
    clubId: clubId("club:home"),
    goals: 0,
    assists: 1,
    saves: 0,
  });
  assert.deepEqual(findSummaryRow(rows, playerId("player:home-01")), {
    playerId: playerId("player:home-01"),
    clubId: clubId("club:home"),
    goals: 0,
    assists: 0,
    saves: 1,
  });
  assert.deepEqual(findSummaryRow(rows, playerId("player:away-01")), {
    playerId: playerId("player:away-01"),
    clubId: clubId("club:away"),
    goals: 0,
    assists: 0,
    saves: 2,
  });
  assert.deepEqual(findSummaryRow(rows, playerId("player:away-10")), {
    playerId: playerId("player:away-10"),
    clubId: clubId("club:away"),
    goals: 0,
    assists: 0,
    saves: 0,
  });
});

/**
 * Builds a fixture with an attached durable match report.
 */
function playedFixture(options: {
  readonly fixtureValue: string;
  readonly homeGoals: readonly ReturnType<typeof playerId>[];
  readonly homeGoalAssists?: readonly (ReturnType<typeof playerId> | undefined)[];
  readonly awayGoals: readonly ReturnType<typeof playerId>[];
  readonly awayGoalAssists?: readonly (ReturnType<typeof playerId> | undefined)[];
  readonly homeGoalkeeperSaves?: readonly ReturnType<typeof playerId>[];
  readonly awayGoalkeeperSaves?: readonly ReturnType<typeof playerId>[];
}): Fixture {
  const id = fixtureId(options.fixtureValue);
  const homeGoalkeeperSaves = options.homeGoalkeeperSaves ?? [];
  const awayGoalkeeperSaves = options.awayGoalkeeperSaves ?? [];

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
      report: matchReport(
        id,
        options.homeGoals,
        options.awayGoals,
        options.homeGoalAssists ?? [],
        options.awayGoalAssists ?? [],
        homeGoalkeeperSaves,
        awayGoalkeeperSaves,
      ),
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
  homeGoalAssists: readonly (ReturnType<typeof playerId> | undefined)[],
  awayGoalAssists: readonly (ReturnType<typeof playerId> | undefined)[],
  homeGoalkeeperSaves: readonly ReturnType<typeof playerId>[],
  awayGoalkeeperSaves: readonly ReturnType<typeof playerId>[],
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
        opportunities: homeGoals.length + awayGoalkeeperSaves.length,
        shots: homeGoals.length + awayGoalkeeperSaves.length,
        shotsOnTarget: homeGoals.length + awayGoalkeeperSaves.length,
        goals: homeGoals.length,
      },
      away: {
        opportunities: awayGoals.length + homeGoalkeeperSaves.length,
        shots: awayGoals.length + homeGoalkeeperSaves.length,
        shotsOnTarget: awayGoals.length + homeGoalkeeperSaves.length,
        goals: awayGoals.length,
      },
    },
    events: [
      ...goalEvents("home", homeGoals, homeGoalAssists),
      ...goalEvents("away", awayGoals, awayGoalAssists),
      ...saveEvents("away", homeGoalkeeperSaves),
      ...saveEvents("home", awayGoalkeeperSaves),
    ],
    tacticalContext: {
      home: { formation: "4-3-3", lateralFocus: "balanced" },
      away: { formation: "4-4-2", lateralFocus: "balanced" },
      commands: [],
    },
  };
}

/**
 * Builds durable goal events for one side.
 */
function goalEvents(
  side: "home" | "away",
  scorers: readonly ReturnType<typeof playerId>[],
  assists: readonly (ReturnType<typeof playerId> | undefined)[],
): MatchReport["events"] {
  return scorers.map((scorerPlayerId, index) => {
    const event: MatchReport["events"][number] = {
      type: "goal",
      shot: {
        minute: index + 1,
        side,
        quality: 0.8,
        expectedGoals: 0.64,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
      },
      scorerPlayerId,
    };
    const assistPlayerId = assists[index];

    if (assistPlayerId === undefined) {
      return event;
    }

    return {
      ...event,
      assistPlayerId,
    };
  });
}

/**
 * Builds durable save events for shots taken by one attacking side.
 */
function saveEvents(side: "home" | "away", goalkeepers: readonly ReturnType<typeof playerId>[]): MatchReport["events"] {
  return goalkeepers.map((goalkeeperPlayerId, index) => ({
    type: "save",
    shot: {
      minute: index + 20,
      side,
      quality: 0.55,
      expectedGoals: 0.3,
      isShotOnTarget: true,
      shotType: "normal",
      chanceType: "open_play",
    },
    shooterPlayerId: playerId(`player:${side}-shot-${index + 1}`),
    goalkeeperPlayerId,
  }));
}

/**
 * Finds one player summary row by ID.
 */
function findSummaryRow(
  rows: ReturnType<typeof computeSeasonPlayerSummaryStats>,
  targetPlayerId: ReturnType<typeof playerId>,
): ReturnType<typeof computeSeasonPlayerSummaryStats>[number] | undefined {
  for (const row of rows) {
    if (row.playerId === targetPlayerId) {
      return row;
    }
  }

  return undefined;
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
