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
    "career_player_injuries",
    "career_player_suspensions",
    "career_player_yellow_cards",
    "player_participation_ledgers",
    "player_participation_rows",
    "player_participation_role_minutes",
    "player_participation_applied_fixtures",
    "player_participation_closed_months",
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
              events: [
                { type: "kickoff", minute: 0 },
                { type: "foul", minute: 21, side: "home", committedByPlayerId: "player:one", sufferedByPlayerId: "player:bench", zoneDanger: 0.7 },
                { type: "yellow_card", minute: 21, side: "home", playerId: "player:one" },
                { type: "penalty_awarded", minute: 30, side: "away", fouledPlayerId: "player:bench", committedByPlayerId: "player:one" },
                { type: "penalty_outcome", minute: 30, side: "away", takerPlayerId: "player:bench", goalkeeperPlayerId: "player:one", outcome: "saved" },
                { type: "injury", minute: 55, side: "home", playerId: "player:one", severity: "minor" },
                { type: "substitution", minute: 60, side: "home", outgoingPlayerId: "player:one", incomingPlayerId: "player:bench", slotId: "home-out", reasonKey: "injury" },
                { type: "full_time", minute: 90, score: { home: 1, away: 0 } },
              ],
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
    playerAvailability: {
      injuries: [{
        playerId: "player:one",
        fixtureId: "fixture:played",
        severity: "minor",
        occurredOn: 20_100,
        unavailableUntil: 20_106,
      }],
      suspensions: [{
        playerId: "player:bench",
        fixtureId: "fixture:played",
        competitionId: "competition:demo",
        reason: "straight_red",
        remainingMatches: 2,
      }],
      yellowCards: [{
        playerId: "player:one",
        competitionId: "competition:demo",
        count: 3,
      }],
    },
    playerParticipationLedger: {
      rows: {
        "season:2026|2026-08|player:one": {
          rowKey: "season:2026|2026-08|player:one",
          playerId: "player:one",
          seasonId: "season:2026",
          monthKey: "2026-08",
          starts: 1,
          substituteAppearances: 0,
          minutes: 90,
          ratingTotal: 7.1,
          ratingSamples: 1,
          playedRoleMinutes: { striker: 90 },
          appliedFixtureIds: ["fixture:played"],
        },
      },
      rowKeys: ["season:2026|2026-08|player:one"],
      closedMonthKeys: ["season:2026|2026-08"],
    },
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
