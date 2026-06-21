import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
  createMarketState,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type ClubId,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

import { rolloverPlayersForNextSeason } from "./player-season-rollover.ts";

/**
 * Player season rollover tests prove the end-of-season baseline changes only
 * calendar-derived age and dynamic states, not abilities or potential.
 */

test("rolloverPlayersForNextSeason advances the age source without changing player birth dates", () => {
  const player01 = playerId("player:000001");
  const careerState = careerStateFixture([
    playerFixture(player01, gameDate(10_000)),
  ]);

  const result = rolloverPlayersForNextSeason({
    careerState,
    nextSeasonId: seasonId("season:0002"),
    nextSeasonStartDate: gameDate(20_365),
  });

  assert.equal(result.careerState.gameState.calendar.currentSeasonId, "season:0002");
  assert.equal(result.careerState.gameState.calendar.currentDate, gameDate(20_365));
  assert.equal(result.careerState.gameState.players[player01]?.birthDate, gameDate(10_000));
});

test("rolloverPlayersForNextSeason resets fitness and form for starters and reserves", () => {
  const starter = playerId("player:starter");
  const reserve = playerId("player:reserve");
  const careerState = careerStateFixture(
    [playerFixture(starter), playerFixture(reserve)],
    {
      [starter]: playerStateFixture(62, 80, 50),
      [reserve]: playerStateFixture(100, 30, 50),
    },
  );

  const result = rolloverPlayersForNextSeason({
    careerState,
    nextSeasonId: seasonId("season:0002"),
    nextSeasonStartDate: gameDate(20_365),
  });

  assert.equal(result.careerState.gameState.playerStates[starter]?.fitness, 100);
  assert.equal(result.careerState.gameState.playerStates[starter]?.form, 50);
  assert.equal(result.careerState.gameState.playerStates[reserve]?.fitness, 100);
  assert.equal(result.careerState.gameState.playerStates[reserve]?.form, 50);
});

test("rolloverPlayersForNextSeason normalizes low and high morale toward neutral", () => {
  const lowMorale = playerId("player:low-morale");
  const highMorale = playerId("player:high-morale");
  const neutralMorale = playerId("player:neutral-morale");
  const careerState = careerStateFixture(
    [playerFixture(lowMorale), playerFixture(highMorale), playerFixture(neutralMorale)],
    {
      [lowMorale]: playerStateFixture(50, 50, 32),
      [highMorale]: playerStateFixture(50, 50, 88),
      [neutralMorale]: playerStateFixture(50, 50, 50),
    },
  );

  const result = rolloverPlayersForNextSeason({
    careerState,
    nextSeasonId: seasonId("season:0002"),
    nextSeasonStartDate: gameDate(20_365),
  });

  assert.equal(result.careerState.gameState.playerStates[lowMorale]?.morale, 42);
  assert.equal(result.careerState.gameState.playerStates[highMorale]?.morale, 78);
  assert.equal(result.careerState.gameState.playerStates[neutralMorale]?.morale, 50);
});

test("rolloverPlayersForNextSeason does not change abilities, potential, or player ordering", () => {
  const first = playerId("player:first");
  const second = playerId("player:second");
  const careerState = careerStateFixture([playerFixture(first), playerFixture(second)]);
  const beforePlayers = JSON.stringify(careerState.gameState.players);

  const result = rolloverPlayersForNextSeason({
    careerState,
    nextSeasonId: seasonId("season:0002"),
    nextSeasonStartDate: gameDate(20_365),
  });

  assert.equal(JSON.stringify(result.careerState.gameState.players), beforePlayers);
  assert.deepEqual(result.careerState.gameState.playerIds, [first, second]);
});

function careerStateFixture(
  players: readonly Player[],
  states: Partial<Record<PlayerId, PlayerDynamicState>> = {},
): CareerState {
  const selectedClubId = clubId("club:selected");

  return createCareerState({
    saveId: saveId("save:player-season-rollover"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(selectedClubId, players, states),
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
  });
}

function gameStateFixture(
  selectedClubId: ClubId,
  players: readonly Player[],
  states: Partial<Record<PlayerId, PlayerDynamicState>>,
): GameState {
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const player of players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = states[player.id] ?? playerStateFixture(50, 50, 50);
  }

  return {
    meta: {
      seed: "player-rollover-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: playersById as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: {
      [selectedClubId]: clubFixture(selectedClubId, playerIds),
    },
    clubIds: [selectedClubId],
    fixtures: {},
    fixtureIds: [],
  };
}

function clubFixture(id: ClubId, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function playerFixture(id: PlayerId, birthDate = gameDate(10_000)): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Rollover",
    birthDate,
    naturalPositions: ["st"],
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

function playerStateFixture(fitness: number, form: number, morale: number): PlayerDynamicState {
  return {
    fitness: stateValue(fitness),
    form: stateValue(form),
    morale: stateValue(morale),
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = value as PlayerAbilities["technical"]["finishing"];

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}
