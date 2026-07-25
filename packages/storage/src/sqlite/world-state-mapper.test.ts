import { deepStrictEqual, equal, throws } from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  createCareerState,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
} from "@game/domain";

import type { CareerSaveMetadata } from "../save-metadata.ts";
import { SQLITE_CAREER_MIGRATIONS } from "./sqlite-career-migrations.ts";
import { mapCareerWorldRows, reconstructCareerWorldRows, SqliteWorldStateError } from "./world-state-mapper.ts";

test("world rows round-trip ordered players, clubs, states, roles, abilities, and fixtures exactly", () => {
  const state = worldFixture("save:world-round-trip", "world-round-trip");
  const metadata = metadataFixture(state);

  const rows = mapCareerWorldRows({ saveId: state.saveId, name: metadata.name, state }, metadata);
  const restored = reconstructCareerWorldRows(rows);
  const { currentSeasonInbox: _careerSlice, ...worldOnlyState } = state;

  deepStrictEqual(restored, worldOnlyState);
  deepStrictEqual(restored.gameState.playerIds, state.gameState.playerIds);
  deepStrictEqual(restored.gameState.clubIds, state.gameState.clubIds);
  deepStrictEqual(restored.gameState.fixtureIds, state.gameState.fixtureIds);
  deepStrictEqual(restored.gameState.clubs[clubId("club:home")]?.playerIds, [playerId("player:home-01")]);
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

test("migration ledger exposes one complete Phase 79 baseline", () => {
  deepStrictEqual(SQLITE_CAREER_MIGRATIONS.map((migration) => migration.version), [13]);
  const statements = SQLITE_CAREER_MIGRATIONS[0]?.statements ?? [];
  equal(statements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS players")), true);
  equal(statements.some((statement) => statement.includes("CREATE TABLE IF NOT EXISTS active_match")), false);
  equal(statements.some((statement) => statement.includes("match_preparation_board_slots")), true);
  equal(statements.some((statement) => statement.includes("autosave_interval_days")), true);
  equal(statements.some((statement) => statement.includes("career_inbox_messages")), true);
  equal(statements.some((statement) => statement.includes("player_participation_rows")), true);
  equal(statements.some((statement) => statement.includes("career_player_injuries")), true);
  equal(statements.some((statement) => statement.includes("committed_by_player_id")), true);
  equal(statements.some((statement) => statement.includes("senior_squad_registrations")), true);
  equal(statements.some((statement) => statement.includes("player_contracts")), true);
  equal(statements.some((statement) => statement.includes("club_finance_accounts")), true);
  equal(statements.some((statement) => statement.includes("contract_negotiation_states")), true);
  equal(statements.some((statement) => statement.includes("continue_policy")), true);
  equal(statements.some((statement) => statement.includes("market_budgets")), false);
});

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
    schemaVersion: 1,
    selectedClubId: homeId,
    gameState: {
      meta: { seed, rngAlgorithmVersion: "sfc32-v1", saveSchemaVersion: 1 },
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
    },
    transferHistory: [],
  });
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
