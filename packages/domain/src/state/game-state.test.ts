import { test } from "vitest";
import assert from "node:assert/strict";

import type { Club } from "../entities/club.entity.ts";
import type { Player, PlayerAbilities, PlayerDynamicState } from "../entities/player.entity.ts";
import { clubId, playerId, seasonId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { abilityValue, stateValue } from "../value-objects/rating.ts";
import type { GameState } from "./game-state.ts";

/**
 * Builds a complete 25-attribute ability object with one repeated value.
 *
 * Tests use this to keep the fixture compact while still proving that `Player`
 * stores the full launch attribute shape.
 */
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

test("GameState fixture keeps lookup records separate from ordered ID arrays", () => {
  const firstPlayerId = playerId("player:000001");
  const secondPlayerId = playerId("player:000002");
  const firstClubId = clubId("club:first");
  const secondClubId = clubId("club:second");

  const firstPlayer: Player = {
    id: firstPlayerId,
    firstName: "Luca",
    lastName: "Rossi",
    birthDate: gameDate(10_000),
    naturalPositions: ["cm"],
    abilities: abilitySet(10),
    potential: abilitySet(14),
  };

  const secondPlayer: Player = {
    id: secondPlayerId,
    firstName: "Marco",
    lastName: "Bianchi",
    birthDate: gameDate(10_100),
    naturalPositions: ["st"],
    abilities: abilitySet(11),
    potential: abilitySet(15),
  };

  const defaultState: PlayerDynamicState = {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };

  const firstClub: Club = {
    id: firstClubId,
    name: "First Club",
    shortName: "First",
    category: "third_division",
    reputation: 5,
    playerIds: [secondPlayerId, firstPlayerId],
  };

  const secondClub: Club = {
    id: secondClubId,
    name: "Second Club",
    shortName: "Second",
    category: "third_division",
    reputation: 4,
    playerIds: [],
  };

  const state: GameState = {
    meta: {
      seed: "demo-001",
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: {
      [firstPlayerId]: firstPlayer,
      [secondPlayerId]: secondPlayer,
    },
    playerIds: [secondPlayerId, firstPlayerId],
    playerStates: {
      [firstPlayerId]: defaultState,
      [secondPlayerId]: defaultState,
    },
    clubs: {
      [firstClubId]: firstClub,
      [secondClubId]: secondClub,
    },
    clubIds: [secondClubId, firstClubId],
  };

  assert.deepEqual(state.playerIds, [secondPlayerId, firstPlayerId]);
  assert.deepEqual(state.clubIds, [secondClubId, firstClubId]);
  assert.deepEqual(state.clubs[firstClubId]?.playerIds, [secondPlayerId, firstPlayerId]);
});
