import { deepStrictEqual, equal, throws } from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  createCareerState,
  fixtureId,
  gameDate,
  MATCH_EVENT_SCHEMA_VERSION,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
} from "@game/domain";

import type { CareerSaveMetadata } from "../save-metadata.ts";
import { withPersistableCareerFacts } from "../testing/persistable-career-fixture.ts";
import { SQLITE_CAREER_MIGRATIONS } from "./sqlite-career-migrations.ts";
import {
  loadCareerWorld,
  mapCareerWorldRows,
  reconstructCareerWorldRows,
  saveCareerWorld,
  SqliteWorldStateError,
  type SqliteBindValue,
  type SqliteWorldDatabase,
} from "./world-state-mapper.ts";

test("world rows round-trip ordered players, clubs, states, roles, abilities, and fixtures exactly", () => {
  const state = worldFixture("save:world-round-trip", "world-round-trip");
  const metadata = metadataFixture(state);

  const rows = mapCareerWorldRows({ saveId: state.saveId, name: metadata.name, state }, metadata);
  const restored = reconstructCareerWorldRows(rows);
  const {
    clubCompetitiveTierState: _competitiveTierSlice,
    currentSeasonInbox: _careerSlice,
    ...worldOnlyState
  } = state;

  deepStrictEqual(restored, worldOnlyState);
  deepStrictEqual(restored.gameState.playerIds, state.gameState.playerIds);
  deepStrictEqual(restored.gameState.clubIds, state.gameState.clubIds);
  deepStrictEqual(restored.gameState.fixtureIds, state.gameState.fixtureIds);
  deepStrictEqual(restored.gameState.clubs[clubId("club:home")]?.playerIds, [playerId("player:home-01")]);
});

/**
 * Round-trips a played match through a real database, not a recorder.
 *
 * `match_events` had no `route` column until Step 08, so every shot in a web
 * career was written back without the way it came down while the matchday
 * adapter went on reading `event.shot.route` to rebuild its step events and
 * always found nothing. Recording the writes would not have caught it - the
 * column was simply absent from the statement - and no test had ever loaded a
 * report back. Only a load can prove a save.
 */
test("a played match report survives a real save and load, routes and all", () => {
  const state = withPersistableCareerFacts(
    withRoutedMatchReport(worldFixture("save:report-round-trip", "report-round-trip")),
  );
  const database = new InMemorySqliteDatabase();

  saveCareerWorld(
    database,
    { saveId: state.saveId, name: "Report round trip", state },
    "2026-08-04T00:00:00.000Z",
  );

  const loaded = loadCareerWorld(database, state.saveId);
  const events = loaded.gameState.fixtures[fixtureId("fixture:played")]?.result?.report?.events ?? [];

  deepStrictEqual(
    events.flatMap((event) => ("shot" in event ? [[event.type, event.shot.route] as const] : [])),
    [
      ["goal", "left"],
      ["save", "transition"],
      // Awarded rather than worked: absence is the fact, and it survives as
      // absence rather than coming back as `central`.
      ["miss", undefined],
      ["block", "central"],
    ],
  );
  deepStrictEqual(
    events,
    state.gameState.fixtures[fixtureId("fixture:played")]?.result?.report?.events,
  );
});

test("world mapping rejects duplicate deterministic order before any SQL write", () => {
  const state = worldFixture("save:duplicate-order", "duplicate-order");
  const invalid = {
    ...state,
    gameState: { ...state.gameState, playerIds: [state.gameState.playerIds[0]!, state.gameState.playerIds[0]!] },
  } as CareerState;

  throws(
    () => mapCareerWorldRows({ saveId: invalid.saveId, name: "Invalid", state: invalid }, metadataFixture(invalid)),
    (error: unknown) => error instanceof SqliteWorldStateError && error.code === "unsupported_bootstrap_state",
  );
});

test("migration ledger exposes the clean Phase 80A persistence baseline", () => {
  deepStrictEqual(SQLITE_CAREER_MIGRATIONS.map((migration) => migration.version), [23]);
  const statements = SQLITE_CAREER_MIGRATIONS[0]?.statements ?? [];
  equal(statements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS players")), true);
  equal(statements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS active_match")), false);
  equal(statements.some((statement) => statement.includes("match_preparation_board_slots")), true);
  equal(statements.some((statement) => statement.includes("autosave_interval_days")), true);
  equal(statements.some((statement) => statement.includes("career_inbox_messages")), true);
  equal(statements.some((statement) => statement.includes("player_participation_rows")), true);
  equal(statements.some((statement) => statement.includes("player_participation_club_minutes")), true);
  equal(statements.some((statement) => statement.includes("career_player_injuries")), true);
  equal(statements.some((statement) => statement.includes("committed_by_player_id")), true);
  equal(statements.some((statement) => statement.includes("senior_squad_registrations")), true);
  equal(statements.some((statement) => statement.includes("player_contracts")), true);
  equal(statements.some((statement) => statement.includes("club_finance_accounts")), true);
  equal(statements.some((statement) => statement.includes("contract_negotiation_states")), true);
  equal(statements.some((statement) => statement.includes("continue_policy")), true);
  equal(statements.some((statement) => statement.includes("market_budgets")), false);
  equal(
    statements.some((statement) => statement.includes("season_player_statistics")),
    true,
  );
  equal(statements.some((statement) => statement.includes("domestic_competitions")), true);
  equal(statements.some((statement) => statement.includes("topology_decision_id")), true);
  equal(statements.some((statement) => statement.includes("club_competitive_tier_state")), true);
  equal(statements.some((statement) => statement.includes("club_competitive_tier_assignments")), true);
  equal(
    statements.some((statement) => statement.includes("player_development_environment_version")),
    true,
  );
  equal(statements.some((statement) => statement.includes("competitive_tier_history")), false);
});

/**
 * A real SQLite database over the shipped schema, held in memory.
 *
 * Small enough to be honest: it implements the three methods the mappers use
 * and applies the same migration statements a fresh browser database gets.
 */
class InMemorySqliteDatabase implements SqliteWorldDatabase {
  private readonly database = new DatabaseSync(":memory:");

  public constructor() {
    for (const statement of SQLITE_CAREER_MIGRATIONS[0]?.statements ?? []) {
      this.database.exec(statement);
    }
  }

  public run(sql: string, bind: readonly SqliteBindValue[] = []): void {
    this.database.prepare(sql).run(...bind);
  }

  public queryAll(sql: string, bind: readonly SqliteBindValue[] = []): readonly Record<string, unknown>[] {
    return this.database.prepare(sql).all(...bind) as readonly Record<string, unknown>[];
  }

  public transaction<T>(operation: () => T): T {
    return operation();
  }
}

/**
 * Attaches a complete Phase 81 match report to the fixture's played match.
 *
 * The base fixture deliberately has none: the world round trip above compares
 * reconstructed world rows, and reports live in career tables rather than world
 * ones.
 */
function withRoutedMatchReport(state: CareerState): CareerState {
  const played = fixtureId("fixture:played");
  const fixture = state.gameState.fixtures[played];
  const home = playerId("player:home-01");
  const away = playerId("player:away-01");
  if (fixture?.result === undefined) throw new Error("fixture fixture must be played");

  return createCareerState({
    ...state,
    gameState: {
      ...state.gameState,
      fixtures: {
        ...state.gameState.fixtures,
        [played]: {
          ...fixture,
          result: {
            ...fixture.result,
            report: {
              eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
              fixtureId: played,
              finalMinute: 90,
              score: { home: 2, away: 1 },
              stats: {
                home: { opportunities: 3, shots: 3, shotsOnTarget: 2, goals: 2 },
                away: { opportunities: 2, shots: 2, shotsOnTarget: 1, goals: 1 },
              },
              events: [
                { type: "kickoff", minute: 0 },
                { type: "goal", shot: { minute: 12, side: "home", quality: 0.62, isShotOnTarget: true, shotType: "header", chanceType: "cross", route: "left" }, scorerPlayerId: home, assistPlayerId: away, creatorPlayerId: away },
                { type: "save", shot: { minute: 41, side: "away", quality: 0.4, isShotOnTarget: true, shotType: "normal", chanceType: "counter", route: "transition" }, shooterPlayerId: away, goalkeeperPlayerId: home },
                { type: "miss", shot: { minute: 47, side: "away", quality: 0.9, isShotOnTarget: false, shotType: "set_piece", chanceType: "dead_ball" }, shooterPlayerId: away },
                { type: "block", shot: { minute: 52, side: "home", quality: 0.31, isShotOnTarget: false, shotType: "normal", chanceType: "open_play", route: "central" }, shooterPlayerId: home, primaryDefenderPlayerId: away },
                { type: "full_time", minute: 90, score: { home: 2, away: 1 } },
              ],
            },
          },
        },
      },
    },
  });
}

function worldFixture(rawSaveId: string, seed: string): CareerState {
  const homeId = clubId("club:home");
  const awayId = clubId("club:away");
  const homePlayerId = playerId("player:home-01");
  const awayPlayerId = playerId("player:away-01");
  const playedFixtureId = fixtureId("fixture:played");
  const futureFixtureId = fixtureId("fixture:future");
  const homePlayer: Player = {
    id: homePlayerId,
    firstName: "Luca",
    lastName: "Rossi",
    birthDate: gameDate(11_000),
    naturalPositions: ["cm", "dm"],
    primaryRole: "central_midfielder",
    archetype: "central_midfielder_playmaker",
    naturalRoles: ["central_midfielder"],
    adaptedRoles: [],
    weakRoles: ["attacking_midfielder"],
    roleFamiliarity: { central_midfielder: "natural", attacking_midfielder: "weak" },
    abilities: abilitySet(11),
    potential: abilitySet(15),
  };
  const awayPlayer: Player = {
    id: awayPlayerId,
    firstName: "Marco",
    lastName: "Bianchi",
    birthDate: gameDate(10_500),
    naturalPositions: ["gk"],
    primaryRole: "goalkeeper",
    archetype: "goalkeeper_shot_stopper",
    naturalRoles: ["goalkeeper"],
    adaptedRoles: [],
    weakRoles: [],
    roleFamiliarity: { goalkeeper: "natural" },
    abilities: abilitySet(9),
    potential: abilitySet(12),
  };

  return createCareerState({
    saveId: saveId(rawSaveId),
    schemaVersion: 2,
    selectedClubId: homeId,
    gameState: {
      meta: {
        seed,
        rngAlgorithmVersion: "sfc32-v1",
        saveSchemaVersion: 1,
        calibrationVersions: {
          topologyDecisionId: "fictional-three-tier-v1",
          playerRatingScaleVersion: "rating-v1",
          playerMarketCalibrationVersion: "market-v1",
          valuationCurvesVersion: "valuation-v1",
          askingPriceCurvesVersion: "asking-v1",
          marketBehaviorCalibrationVersion: "behavior-v1",
          wageFinanceCalibrationVersion: "wage-v1",
          playerDevelopmentEnvironmentVersion: "development-environment-v1",
        },
      },
      calendar: { currentDate: gameDate(20_100), currentSeasonId: seasonId("season:2026") },
      players: { [homePlayerId]: homePlayer, [awayPlayerId]: awayPlayer },
      playerIds: [awayPlayerId, homePlayerId],
      playerStates: { [homePlayerId]: playerState(91, 64, 72), [awayPlayerId]: playerState(98, 51, 49) },
      clubs: {
        [homeId]: { id: homeId, name: "Home Calcio", shortName: "Home", category: "third_division", reputation: 5, playerIds: [homePlayerId] },
        [awayId]: { id: awayId, name: "Away Calcio", shortName: "Away", category: "third_division", reputation: 4, playerIds: [awayPlayerId] },
      },
      clubIds: [awayId, homeId],
      fixtures: {
        [playedFixtureId]: {
          id: playedFixtureId,
          competitionId: competitionId("competition:ita-3"),
          seasonId: seasonId("season:2026"),
          roundNumber: 1,
          date: gameDate(20_100),
          homeClubId: homeId,
          awayClubId: awayId,
          result: { played: true, homeGoals: 2, awayGoals: 1 },
        },
        [futureFixtureId]: {
          id: futureFixtureId,
          competitionId: competitionId("competition:ita-3"),
          seasonId: seasonId("season:2026"),
          roundNumber: 2,
          date: gameDate(20_107),
          homeClubId: awayId,
          awayClubId: homeId,
        },
      },
      fixtureIds: [futureFixtureId, playedFixtureId],
      domesticCompetitionWorld: {
        competitionIds: [competitionId("competition:ita-3")],
        competitions: {
          [competitionId("competition:ita-3")]: {
            id: competitionId("competition:ita-3"),
            name: "Scalata Three",
            clubIds: [awayId, homeId],
            matchRules: {
              maximumSubstitutions: 5,
              substitutionWindowLimit: null,
              allowsPlayerReentry: false,
              yellowCardAccumulationThreshold: 5,
              straightRedSuspensionMatches: 3,
              secondYellowSuspensionMatches: 1,
              yellowAccumulationSuspensionMatches: 1,
            },
            seasonDistribution: {
              currency: "EUR",
              prizes: [
                { position: 1, amount: nonNegativeMoney(2_000_000_00) },
                { position: 2, amount: nonNegativeMoney(1_000_000_00) },
              ],
            },
          },
        },
        seasonHistory: [{
          sequenceNumber: 1,
          seasonId: seasonId("season:2025"),
          competitionId: competitionId("competition:ita-3"),
          finalTable: [
            tableRow(1, homeId, 3),
            tableRow(2, awayId, 0),
          ],
        }],
      },
    },
    transferHistory: [],
  });
}

function tableRow(position: number, id: ReturnType<typeof clubId>, points: number) {
  return {
    position,
    clubId: id,
    played: 1,
    wins: points === 3 ? 1 : 0,
    draws: 0,
    losses: points === 0 ? 1 : 0,
    goalsFor: points === 3 ? 2 : 0,
    goalsAgainst: points === 3 ? 0 : 2,
    goalDifference: points === 3 ? 2 : -2,
    points,
  };
}

function metadataFixture(state: CareerState): CareerSaveMetadata {
  return {
    saveId: state.saveId,
    name: "World fixture",
    createdAtISO: "2026-07-13T10:00:00.000Z",
    updatedAtISO: "2026-07-13T10:00:01.000Z",
    saveSchemaVersion: 1,
    autosaveIntervalDays: 7,
  };
}

function abilitySet(value: number): PlayerAbilities {
  const attribute = value as PlayerAbilities["technical"]["finishing"];
  return {
    technical: { finishing: attribute, passing: attribute, longPassing: attribute, crossing: attribute, dribbling: attribute, technique: attribute, tackling: attribute, penalties: attribute, freeKicks: attribute },
    physical: { pace: attribute, strength: attribute, stamina: attribute, agility: attribute, heading: attribute },
    mental: { positioning: attribute, vision: attribute, anticipation: attribute, composure: attribute, determination: attribute, leadership: attribute },
    goalkeeping: { reflexes: attribute, handling: attribute, rushingOut: attribute, goalkeeperPositioning: attribute, footwork: attribute },
  };
}

function playerState(fitness: number, form: number, morale: number): PlayerDynamicState {
  return {
    fitness: fitness as PlayerDynamicState["fitness"],
    form: form as PlayerDynamicState["form"],
    morale: morale as PlayerDynamicState["morale"],
  };
}
