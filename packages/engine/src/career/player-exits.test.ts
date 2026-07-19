import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  createMarketState,
  gameDate,
  mapPlayerAbilities,
  playerId,
  rawDiagnosticAbilityAverage,
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
  type PlayerPosition,
} from "@game/domain";

import { applyEndOfSeasonPlayerExits } from "./player-exits.ts";

/** Tests for deterministic end-of-season active-roster exits. */

test("applyEndOfSeasonPlayerExits retires hard-threshold old outfield players", () => {
  const retiringPlayer = playerId("player:retiring");
  const careerState = careerStateFixture([
    playerFixture(retiringPlayer, "st", 37, abilitySet(11), abilitySet(11)),
  ]);

  const result = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "exit-world",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.exits.length, 1);
  assert.equal(result.exits[0]?.playerId, retiringPlayer);
  assert.equal(result.exits[0]?.reason, "retirement");
  assert.deepEqual(result.careerState.gameState.playerIds, []);
  assert.deepEqual(result.careerState.gameState.clubs[clubId("club:selected")]?.playerIds, []);
  assert.equal(result.careerState.gameState.players[retiringPlayer]?.id, retiringPlayer);
  assert.equal(result.careerState.gameState.playerStates[retiringPlayer], undefined);
});

test("applyEndOfSeasonPlayerExits uses later hard retirement for goalkeepers", () => {
  const keeper = playerId("player:keeper");
  const careerState = careerStateFixture([
    playerFixture(keeper, "gk", 39, abilitySet(11), abilitySet(11)),
  ]);

  const result = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "keeper-exit-world",
    seasonId: seasonId("season:0001"),
  });

  assert.deepEqual(result.exits, []);
  assert.deepEqual(result.careerState, careerState);
});

test("applyEndOfSeasonPlayerExits is deterministic for same seed and season", () => {
  const players = [
    playerFixture(playerId("player:old-01"), "cb", 35, abilitySet(8), abilitySet(8)),
    playerFixture(playerId("player:old-02"), "cm", 34, abilitySet(7), abilitySet(7)),
    playerFixture(playerId("player:young"), "st", 22, abilitySet(9), abilitySet(12)),
  ];
  const careerState = careerStateFixture(players);

  const first = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "deterministic-exits",
    seasonId: seasonId("season:0001"),
  });
  const second = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "deterministic-exits",
    seasonId: seasonId("season:0001"),
  });

  assert.deepEqual(second, first);
});

test("applyEndOfSeasonPlayerExits preserves explicit active player order", () => {
  const active = playerId("player:active");
  const retiring = playerId("player:retiring");
  const careerState = careerStateFixture([
    playerFixture(active, "cm", 24, abilitySet(10), abilitySet(12)),
    playerFixture(retiring, "st", 37, abilitySet(10), abilitySet(10)),
  ]);

  const result = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "order-exits",
    seasonId: seasonId("season:0001"),
  });

  assert.deepEqual(result.careerState.gameState.playerIds, [active]);
  assert.deepEqual(result.careerState.gameState.clubs[clubId("club:selected")]?.playerIds, [active]);
});

test("applyEndOfSeasonPlayerExits reports role-shaped quality for exit decisions", () => {
  const retiring = playerId("player:raw-diagnostic-retiring");
  const unevenAbilities = mapPlayerAbilities(abilitySet(1), (value, key) =>
    key === "technical.finishing" ? abilityValue(20) : value,
  );
  const careerState = careerStateFixture([
    playerFixture(retiring, "st", 37, unevenAbilities, unevenAbilities),
  ]);

  const result = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "raw-diagnostic-exit",
    seasonId: seasonId("season:0001"),
  });

  assert.equal((result.exits[0]?.currentAbilityAverage ?? 0) > Number(rawDiagnosticAbilityAverage(unevenAbilities)), true);
});

test("applyEndOfSeasonPlayerExits does not release non-retiring players from already thin squads", () => {
  const lowQualityVeteran = playerId("player:thin-squad-veteran");
  const careerState = careerStateFixture([
    playerFixture(lowQualityVeteran, "st", 33, abilitySet(6), abilitySet(6)),
  ]);

  const result = applyEndOfSeasonPlayerExits({
    careerState,
    worldSeed: "thin-squad-exit",
    seasonId: seasonId("season:0001"),
  });

  assert.deepEqual(result.exits, []);
  assert.deepEqual(result.careerState.gameState.playerIds, [lowQualityVeteran]);
});

function careerStateFixture(players: readonly Player[]): CareerState {
  const selectedClubId = clubId("club:selected");

  return createCareerState({
    saveId: saveId("save:player-exits"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(selectedClubId, players),
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
  });
}

function gameStateFixture(selectedClubId: ClubId, players: readonly Player[]): GameState {
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const player of players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = playerStateFixture();
  }

  return {
    meta: {
      seed: "player-exits-test",
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

function playerFixture(
  id: PlayerId,
  primaryPosition: PlayerPosition,
  ageYears: number,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Exit",
    birthDate: gameDate(20_000 - ageYears * 365),
    naturalPositions: [primaryPosition],
    abilities,
    potential,
  };
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);

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
