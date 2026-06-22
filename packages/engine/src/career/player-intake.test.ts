import assert from "node:assert/strict";
import { test } from "vitest";

import { abilityValue, clubId, gameDate, playerId, stateValue, type Player, type PlayerAbilities, type PlayerDynamicState } from "@game/domain";

import { CareerIntakePoolError, createCareerIntakePool } from "./player-intake.ts";

/** Tests for safe intake-pool validation before roster application. */

test("createCareerIntakePool records deterministic candidate facts", () => {
  const targetClubId = clubId("club:target");
  const candidate = {
    player: playerFixture(playerId("player:intake-001"), "cm"),
    playerState: playerStateFixture(),
    targetClubId,
  };

  const result = createCareerIntakePool({
    activePlayerIds: [playerId("player:active")],
    activeClubIds: [targetClubId],
    candidates: [candidate],
  });

  assert.deepEqual(result.candidates, [candidate]);
  assert.deepEqual(result.records, [
    {
      playerId: candidate.player.id,
      targetClubId,
      primaryPosition: "cm",
    },
  ]);
});

test("createCareerIntakePool rejects duplicate intake players", () => {
  const targetClubId = clubId("club:target");
  const duplicate = playerFixture(playerId("player:duplicate"), "st");

  assert.throws(
    () =>
      createCareerIntakePool({
        activePlayerIds: [],
        activeClubIds: [targetClubId],
        candidates: [
          { player: duplicate, playerState: playerStateFixture(), targetClubId },
          { player: duplicate, playerState: playerStateFixture(), targetClubId },
        ],
      }),
    (error) => error instanceof CareerIntakePoolError && error.code === "duplicate_intake_player",
  );
});

test("createCareerIntakePool rejects already-active player IDs", () => {
  const targetClubId = clubId("club:target");
  const player = playerFixture(playerId("player:active"), "cb");

  assert.throws(
    () =>
      createCareerIntakePool({
        activePlayerIds: [player.id],
        activeClubIds: [targetClubId],
        candidates: [{ player, playerState: playerStateFixture(), targetClubId }],
      }),
    (error) => error instanceof CareerIntakePoolError && error.code === "player_already_active",
  );
});

function playerFixture(id: ReturnType<typeof playerId>, position: Player["naturalPositions"][number]): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Intake",
    birthDate: gameDate(0),
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
