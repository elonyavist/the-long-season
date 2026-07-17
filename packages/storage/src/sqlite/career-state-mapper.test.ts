import assert from "node:assert/strict";

import { test } from "vitest";

import type { CareerState } from "@game/domain";

import { insertCareerStateRows } from "./career-state-mapper.ts";
import type { SqliteBindValue, SqliteWorldDatabase } from "./world-state-mapper.ts";

/** Relational mapping covers every current durable career slice without blobs. */
test("career rows use explicit relational tables and scalar binds", () => {
  const database = new RecordingDatabase();

  insertCareerStateRows(database, richCareerFixture());

  const insertedTables = new Set(database.statements.map(({ sql }) => insertedTable(sql)));
  assert.deepEqual(insertedTables, new Set([
    "career_world",
    "market_budgets",
    "transfer_history",
    "career_inbox_messages",
    "career_inbox_blockers",
    "career_inbox_actions",
    "youth_state",
    "youth_club_rosters",
    "youth_roster_players",
    "youth_lifecycle",
    "season_history",
    "season_table_rows",
    "match_preparation",
    "match_preparation_lineup",
    "match_preparation_board_slots",
    "match_preparation_bench",
    "match_reports",
    "match_events",
    "active_match",
    "active_match_teams",
    "active_match_lineups",
    "active_match_conversion_bands",
    "active_match_bench",
    "active_match_substitutions",
    "half_time_plan",
    "half_time_plan_lineup",
    "half_time_plan_bench",
    "half_time_plan_substitutions",
  ]));
  assert.ok(database.statements.every(({ bind }) => bind.every(isSqliteScalar)));
  assert.ok(database.statements.every(({ sql }) => !/json/i.test(sql)));
});

/** Captures mapper writes without pretending to implement persistence. */
class RecordingDatabase implements SqliteWorldDatabase {
  public readonly statements: Array<{ readonly sql: string; readonly bind: readonly SqliteBindValue[] }> = [];

  public run(sql: string, bind: readonly SqliteBindValue[] = []): void {
    this.statements.push({ sql, bind });
  }

  public queryAll(): readonly Record<string, unknown>[] {
    throw new Error("The insert-only mapper test must not query the database");
  }

  public transaction<T>(operation: () => T): T {
    return operation();
  }
}

/** Returns the table targeted by one mapper INSERT statement. */
function insertedTable(sql: string): string {
  const match = /INSERT INTO\s+([a-z_]+)/i.exec(sql);
  assert.ok(match?.[1], `Expected INSERT statement, received: ${sql}`);
  return match[1];
}

/** Narrows mapper binds to the only scalar values accepted by SQLite. */
function isSqliteScalar(value: unknown): value is SqliteBindValue {
  return value === null || typeof value === "string" || typeof value === "number";
}

/**
 * Builds a dense mapper fixture containing every durable optional career slice.
 * Domain validation and exact reconstruction are covered by the browser OPFS
 * test; this fixture keeps this unit test focused on relational write coverage.
 */
function richCareerFixture(): CareerState {
  return {
    saveId: "save:mapper",
    schemaVersion: 1,
    selectedClubId: "club:home",
    gameState: {
      meta: { seed: "mapper", rngAlgorithmVersion: "sfc32-v1", saveSchemaVersion: 1 },
      calendar: { currentDate: 20_100, currentSeasonId: "season:2026" },
      players: {},
      playerIds: [],
      playerStates: {},
      clubs: {},
      clubIds: [],
      fixtures: {
        "fixture:played": {
          id: "fixture:played",
          competitionId: "competition:demo",
          seasonId: "season:2026",
          roundNumber: 1,
          date: 20_100,
          homeClubId: "club:home",
          awayClubId: "club:away",
          result: {
            played: true,
            homeGoals: 1,
            awayGoals: 0,
            report: {
              eventSchemaVersion: 7,
              fixtureId: "fixture:played",
              finalMinute: 90,
              score: { home: 1, away: 0 },
              stats: { home: sideStats(1), away: sideStats(0) },
              events: [{ type: "kickoff", minute: 0 }, { type: "full_time", minute: 90, score: { home: 1, away: 0 } }],
            },
          },
        },
      },
      fixtureIds: ["fixture:played"],
    },
    careerWorld: { worldSeed: "mapper-world", generatorVersion: 1, creationSourceKey: "test" },
    marketState: {
      clubBudgets: { "club:home": { clubId: "club:home", transferBudget: 600_000_000 } },
      clubBudgetIds: ["club:home"],
    },
    transferHistory: [{ sequenceNumber: 1, occurredOn: 20_000, buyingClubId: "club:home", sellingClubId: "club:away", playerId: "player:one", transferFee: 100_000_000 }],
    currentSeasonInbox: [{
      id: "inbox:matchday:fixture:played",
      date: 20_100,
      category: "matchday",
      source: "technical_staff",
      level: "blocking",
      lifecycle: { read: true, acknowledged: false, resolved: false },
      related: { fixtureId: "fixture:played" },
      blockerKeys: ["missing_saved_tactic"],
      actionIds: ["prepare_match"],
    }],
    youthAcademyState: {
      clubRosters: { "club:home": { clubId: "club:home", playerIds: ["player:youth"] } },
      clubRosterIds: ["club:home"],
      playerLifecycle: { "player:youth": { playerId: "player:youth", clubId: "club:home", status: "academy", academyEntrySeasonId: "season:2026", academyEntryDate: 20_000 } },
      playerLifecycleIds: ["player:youth"],
    },
    seasonHistory: [{
      sequenceNumber: 1,
      seasonId: "season:2025",
      competitionId: "competition:demo",
      finalTable: [tableRow()],
      championClubId: "club:home",
      selectedClubFinish: tableRow(),
      aggregateGoals: { fixtureCount: 1, totalGoals: 1 },
    }],
    matchPreparation: {
      selectedClubId: "club:home",
      targetFixtureId: "fixture:future",
      updatedAt: 20_100,
      selectedLineup: { clubId: "club:home", slots: [{ slotKey: "gk", playerId: "player:one", roleKey: "gk" }] },
      tactic: { mentality: "balanced", pressing: 0.5, directness: 0.5, width: 0.5, risk: 0.5 },
      baseFormationId: "4-4-2",
      boardSlots: [{ slotKey: "gk", nx: 0.5, ny: 0.92, roleKey: "POR" }],
      benchSlots: [{ slotKey: "bench:01", playerId: "player:bench" }],
    },
    activeMatchCheckpoint: {
      schemaVersion: 1,
      fixtureId: "fixture:future",
      selectedClubSide: "home",
      phase: "half_time",
      initialContext: {
        fixtureId: "fixture:future",
        seed: "mapper-match",
        home: matchTeam("club:home", "home"),
        away: matchTeam("club:away", "away"),
        engineConfig: {
          minuteCount: 90,
          rates: { baseOpportunityRatePerMinute: 0.1, maxOpportunityRatePerMinute: 0.3 },
          conversionBands: [{ bandKey: "all", minQualityInclusive: 0, maxQualityExclusive: 1.01, goalProbability: 0.1 }],
          homeAdvantageFactor: 1.05,
          tacticalDistributionCaps: {
            directness: { minInclusive: -1, maxInclusive: 1 },
            pressing: { minInclusive: -1, maxInclusive: 1 },
            width: { minInclusive: -1, maxInclusive: 1 },
            risk: { minInclusive: -1, maxInclusive: 1 },
          },
        },
      },
      simulation: {
        minute: 45,
        score: { home: 0, away: 0 },
        stats: { home: sideStats(0), away: sideStats(0) },
        local: { hasKickedOff: true, hasReachedHalfTime: true, hasReachedFullTime: false },
      },
      events: [{ type: "kickoff", minute: 0 }, { type: "half_time", minute: 45, score: { home: 0, away: 0 } }],
      selectedClubBenchSlots: [{ slotId: "bench-1", playerId: "player:bench" }],
      appliedSubstitutions: [{ side: "home", minute: 45, outgoingPlayerId: "player:out", incomingPlayerId: "player:in", slotId: "home-out", reasonKey: "tactical" }],
      halfTimeTacticalPlan: {
        baseFormationId: "4-4-2",
        currentShape: "4-4-2",
        maxSubstitutions: 5,
        requiredLineupSize: 11,
        lineupSlots: [{ slotId: "home-gk", playerId: "player:home-gk", roleKey: "gk", positionKey: "gk" }],
        benchSlots: [{ slotId: "bench-1", playerId: "player:bench" }],
        substitutions: [{ outgoingPlayerId: "player:out", incomingPlayerId: "player:in", reasonKey: "tactical" }],
      },
    },
  } as unknown as CareerState;
}

/** Builds compact match statistics for one side. */
function sideStats(goals: number) {
  return { opportunities: goals, shots: goals, shotsOnTarget: goals, goals };
}

/** Builds one final-table row used in both ordered and selected-club fields. */
function tableRow() {
  return { position: 1, clubId: "club:home", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 3 };
}

/** Builds one side of the staged match context with explicit goalkeeper and outfielder. */
function matchTeam(clubId: string, prefix: string) {
  return {
    clubId,
    lineup: [
      { slotId: `${prefix}-gk`, playerId: `player:${prefix}-gk`, roleKey: "gk" },
      { slotId: `${prefix}-out`, playerId: `player:${prefix}-out`, roleKey: "attacker" },
    ],
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 },
  };
}
