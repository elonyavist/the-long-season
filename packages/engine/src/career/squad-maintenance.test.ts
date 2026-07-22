import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
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

import { maintainCareerSquadShape } from "./squad-maintenance.ts";

/** Tests for structural squad maintenance after exits and intake. */

test("maintainCareerSquadShape fills minimum squad size and goalkeeper coverage", () => {
  const selectedClubId = clubId("club:selected");
  const existing = [
    playerFixture(playerId("player:existing-01"), "cb"),
    playerFixture(playerId("player:existing-02"), "cm"),
    playerFixture(playerId("player:existing-03"), "st"),
  ];
  const careerState = careerStateFixture(selectedClubId, existing);
  const candidates = [
    candidate(playerId("player:intake-gk"), "gk", selectedClubId),
    candidate(playerId("player:intake-cb"), "cb", selectedClubId),
    candidate(playerId("player:intake-cm"), "cm", selectedClubId),
    candidate(playerId("player:intake-st"), "st", selectedClubId),
  ];

  const result = maintainCareerSquadShape({
    careerState,
    intakeCandidates: candidates,
    minimumSquadSize: 4,
    targetSquadSize: 4,
  });

  assert.deepEqual(result.records[0]?.addedPlayerIds, [playerId("player:intake-gk")]);
  assert.equal(result.records[0]?.afterSquadSize, 4);
  assert.equal(result.records[0]?.warnings.includes("no_natural_goalkeeper"), false);
  assert.equal(result.careerState.gameState.players[playerId("player:intake-gk")]?.id, playerId("player:intake-gk"));
  assert.equal(result.careerState.gameState.playerStates[playerId("player:intake-gk")]?.fitness, 100);
});

test("maintainCareerSquadShape preserves deterministic active player order", () => {
  const selectedClubId = clubId("club:selected");
  const existing = [
    playerFixture(playerId("player:existing-01"), "gk"),
    playerFixture(playerId("player:existing-02"), "cb"),
  ];
  const careerState = careerStateFixture(selectedClubId, existing);
  const intake = [
    candidate(playerId("player:intake-01"), "cb", selectedClubId),
    candidate(playerId("player:intake-02"), "cm", selectedClubId),
  ];

  const result = maintainCareerSquadShape({
    careerState,
    intakeCandidates: intake,
    minimumSquadSize: 3,
    targetSquadSize: 4,
  });

  assert.deepEqual(result.careerState.gameState.playerIds, [
    playerId("player:existing-01"),
    playerId("player:existing-02"),
    playerId("player:intake-01"),
    playerId("player:intake-02"),
  ]);
});

test("maintainCareerSquadShape reports remaining warnings when intake is insufficient", () => {
  const selectedClubId = clubId("club:selected");
  const careerState = careerStateFixture(selectedClubId, [playerFixture(playerId("player:only"), "st")]);

  const result = maintainCareerSquadShape({
    careerState,
    intakeCandidates: [],
    minimumSquadSize: 4,
    targetSquadSize: 4,
  });

  assert.equal(result.records[0]?.warnings.includes("below_minimum_squad_size"), true);
  assert.equal(result.records[0]?.warnings.includes("no_natural_goalkeeper"), true);
});

function candidate(id: PlayerId, position: PlayerPosition, targetClubId: ClubId): Parameters<typeof maintainCareerSquadShape>[0]["intakeCandidates"][number] {
  return {
    player: playerFixture(id, position),
    playerState: playerStateFixture(),
    targetClubId,
  };
}

function careerStateFixture(selectedClubId: ClubId, players: readonly Player[]): CareerState {
  return createCareerState({
    saveId: saveId("save:squad-maintenance"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(selectedClubId, players),
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
      seed: "squad-maintenance-test",
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

function playerFixture(id: PlayerId, position: PlayerPosition): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Maintenance",
    birthDate: gameDate(20_000 - 20 * 365),
    naturalPositions: [position],
    abilities: abilitySet(7),
    potential: abilitySet(10),
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
