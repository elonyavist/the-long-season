import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
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
  type PlayerPosition,
} from "@game/domain";

import { simulateTransferTurnover } from "./transfer-turnover.ts";

/** Tests for minimal deterministic transfer turnover. */

test("simulateTransferTurnover moves a suitable player between clubs", () => {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  const movable = playerId("player:movable");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, [
      ...playersForClub("seller", ["gk", "gk", "cm", "cm", "cm", "cm", "cm", "cm", "cm", "cm", "st", "st", "st", "st", "st", "st", "st", "st", "st"]),
      playerFixture(movable, "cb", 7).id,
    ]),
  ]);

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "turnover-world",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.equal(result.transfers.length, 1);
  assert.equal(result.transfers[0]?.playerId, movable);
  assert.equal(result.careerState.gameState.clubs[buyer]?.playerIds.includes(movable), true);
  assert.equal(result.careerState.gameState.clubs[seller]?.playerIds.includes(movable), false);
});

test("simulateTransferTurnover is deterministic for same seed and season", () => {
  const careerState = turnoverFixture();

  const first = simulateTransferTurnover({
    careerState,
    worldSeed: "same-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });
  const second = simulateTransferTurnover({
    careerState,
    worldSeed: "same-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.deepEqual(second, first);
});

test("simulateTransferTurnover default cap allows roughly one move per four clubs", () => {
  const careerState = careerStateFixture(
    Array.from({ length: 8 }, (_, index) =>
      clubFixture(
        clubId(`club:cap-${String(index + 1).padStart(2, "0")}`),
        5,
        playersForClub(`cap-${String(index + 1).padStart(2, "0")}`, [
          "gk",
          "gk",
          "cb",
          "cb",
          "cb",
          "cb",
          "cb",
          "cb",
          "cm",
          "cm",
          "cm",
          "cm",
          "cm",
          "cm",
          "st",
          "st",
          "st",
          "st",
          "st",
          "st",
        ]),
      ),
    ),
  );

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "default-cap-turnover",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.transfers.length, 2);
});

test("simulateTransferTurnover rejects casual downward moves for strong players", () => {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  const star = playerId("player:star");
  const careerState = careerStateFixture([
    clubFixture(buyer, 3, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 8, [
      ...playersForClub("seller", ["gk", "gk", "cm", "cm", "cm", "cm", "cm", "cm", "cm", "cm", "st", "st", "st", "st", "st", "st", "st", "st", "st"]),
      playerFixture(star, "cb", 13).id,
    ]),
  ]);

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "downward-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.deepEqual(result.transfers, []);
  assert.equal(result.careerState.gameState.clubs[seller]?.playerIds.includes(star), true);
});

function turnoverFixture(): CareerState {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  return careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, [
      ...playersForClub("seller", ["gk", "gk", "cm", "cm", "cm", "cm", "cm", "cm", "cm", "cm", "st", "st", "st", "st", "st", "st", "st", "st", "st"]),
      playerFixture(playerId("player:movable"), "cb", 7).id,
    ]),
  ]);
}

function careerStateFixture(clubs: readonly Club[]): CareerState {
  const players: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const club of clubs) {
    for (const clubPlayerId of club.playerIds) {
      const player = playerLookup.get(clubPlayerId);
      if (player === undefined) {
        throw new Error(`missing fixture player: ${clubPlayerId}`);
      }
      players[clubPlayerId] = player;
      playerIds.push(clubPlayerId);
      playerStates[clubPlayerId] = playerStateFixture();
    }
  }

  const selectedClubId = clubs[0]?.id ?? clubId("club:missing");

  return createCareerState({
    saveId: saveId("save:transfer-turnover"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: {
      meta: {
        seed: "transfer-turnover-test",
        rngAlgorithmVersion: "test",
        saveSchemaVersion: 1,
      },
      calendar: {
        currentDate: gameDate(20_000),
        currentSeasonId: seasonId("season:0001"),
      },
      players: players as GameState["players"],
      playerIds,
      playerStates: playerStates as GameState["playerStates"],
      clubs: Object.fromEntries(clubs.map((club) => [club.id, club])) as GameState["clubs"],
      clubIds: clubs.map((club) => club.id),
      fixtures: {},
      fixtureIds: [],
    },
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
    transferHistory: [],
  });
}

const playerLookup = new Map<PlayerId, Player>();

function clubFixture(id: ClubId, reputation: number, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation,
    playerIds,
  };
}

function playersForClub(prefix: string, positions: readonly PlayerPosition[]): PlayerId[] {
  return positions.map((position, index) => playerFixture(playerId(`player:${prefix}-${String(index + 1).padStart(2, "0")}`), position, 7).id);
}

function playerFixture(id: PlayerId, position: PlayerPosition, ability: number): Player {
  const player: Player = {
    id,
    firstName: String(id),
    lastName: "Turnover",
    birthDate: gameDate(20_000 - 24 * 365),
    naturalPositions: [position],
    abilities: abilitySet(ability),
    potential: abilitySet(ability + 1),
  };
  playerLookup.set(id, player);
  return player;
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
