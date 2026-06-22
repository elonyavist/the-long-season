import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  createCareerState,
  createMarketState,
  gameDate,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

import { applyYouthAcademyLifecycle } from "./youth-lifecycle.ts";

/** Tests for youth academy development and age-out lifecycle rules. */

test("applyYouthAcademyLifecycle develops active youth without changing senior player abilities", () => {
  const senior = playerId("player:senior");
  const youth = playerId("player:youth-young");
  const careerState = careerStateFixture([
    youthPlayerFixture(youth, 17, abilitySet(6), abilitySet(12)),
  ]);
  const seniorBefore = careerState.gameState.players[senior]?.abilities;
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "youth-lifecycle",
    seasonId: seasonId("season:0002"),
  });
  const developedYouth = result.careerState.gameState.players[youth];

  assert.equal(result.developmentChanges.length, 1);
  assert.equal(developedYouth !== undefined && developedYouth.abilities.technical.passing > 6, true);
  assert.deepEqual(result.careerState.gameState.players[senior]?.abilities, seniorBefore);
  assert.equal(result.records.length, 0);
});

test("applyYouthAcademyLifecycle removes aged-out released youth from active state", () => {
  const agedOut = playerId("player:youth-aged-out");
  const careerState = careerStateFixture([
    youthPlayerFixture(agedOut, 20, abilitySet(5), abilitySet(7)),
  ]);
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "released-youth",
    seasonId: seasonId("season:0002"),
  });

  assert.equal(result.records[0]?.outcome, "released");
  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 0);
  assert.equal(result.careerState.gameState.players[agedOut], undefined);
  assert.equal(result.careerState.gameState.playerIds.includes(agedOut), false);
});

test("applyYouthAcademyLifecycle keeps aged-out promotion candidates outside the active youth roster", () => {
  const candidate = playerId("player:youth-promotion");
  const careerState = careerStateFixture([
    youthPlayerFixture(candidate, 20, abilitySet(8), abilitySet(14)),
  ]);
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "promotion-youth",
    seasonId: seasonId("season:0002"),
  });

  assert.equal(result.records[0]?.outcome, "promotion_candidate");
  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 0);
  assert.equal(result.careerState.gameState.players[candidate] !== undefined, true);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status, "promotion_candidate");
});

test("applyYouthAcademyLifecycle returns unchanged state when no youth academy exists", () => {
  const careerState = careerStateFixture([], false);
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "no-youth",
    seasonId: seasonId("season:0002"),
  });

  assert.equal(result.careerState, careerState);
  assert.deepEqual(result.records, []);
  assert.deepEqual(result.developmentChanges, []);
});

function careerStateFixture(youthPlayers: readonly Player[], includeYouthState = true): CareerState {
  const pro01 = clubId("club:pro01");
  const senior = playerId("player:senior");
  const players: Record<PlayerId, Player> = {
    [senior]: seniorPlayerFixture(senior),
  };
  const playerStates: Record<PlayerId, PlayerDynamicState> = {
    [senior]: playerStateFixture(),
  };
  const playerIds: PlayerId[] = [senior];

  for (const player of youthPlayers) {
    players[player.id] = player;
    playerStates[player.id] = playerStateFixture();
    playerIds.push(player.id);
  }

  return createCareerState({
    saveId: saveId("save:youth-lifecycle"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: pro01,
    gameState: {
      meta: {
        seed: "youth-lifecycle",
        rngAlgorithmVersion: "test",
        saveSchemaVersion: 1,
      },
      calendar: {
        currentDate: gameDate(20_000),
        currentSeasonId: seasonId("season:0001"),
      },
      players,
      playerIds,
      playerStates,
      clubs: {
        [pro01]: {
          id: pro01,
          name: "PRO01",
          shortName: "PRO01",
          category: "third_division",
          reputation: 5,
          playerIds: [senior],
        },
      },
      clubIds: [pro01],
      fixtures: {},
      fixtureIds: [],
    },
    marketState: createMarketState({
      clubBudgets: {
        [pro01]: { clubId: pro01, transferBudget: nonNegativeMoney(1_000_000_00) },
      },
      clubBudgetIds: [pro01],
    }),
    transferHistory: [],
    ...(includeYouthState
      ? {
          youthAcademyState: {
            clubRosters: {
              [pro01]: {
                clubId: pro01,
                playerIds: youthPlayers.map((player) => player.id),
              },
            },
            clubRosterIds: [pro01],
            playerLifecycle: youthPlayers.reduce<Record<PlayerId, NonNullable<CareerState["youthAcademyState"]>["playerLifecycle"][PlayerId]>>(
              (accumulator, player) => {
                accumulator[player.id] = {
                  playerId: player.id,
                  clubId: pro01,
                  status: "academy",
                  academyEntrySeasonId: seasonId("season:0001"),
                  academyEntryDate: gameDate(19_000),
                };
                return accumulator;
              },
              {},
            ),
            playerLifecycleIds: youthPlayers.map((player) => player.id),
          },
        }
      : {}),
  });
}

function seniorPlayerFixture(id: PlayerId): Player {
  return {
    id,
    firstName: "Senior",
    lastName: "One",
    birthDate: gameDate(9_000),
    naturalPositions: ["cm"],
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

function youthPlayerFixture(id: PlayerId, age: number, abilities: PlayerAbilities, potential: PlayerAbilities): Player {
  return {
    id,
    firstName: "Youth",
    lastName: String(id),
    birthDate: gameDate(20_000 - age * 365),
    naturalPositions: ["cm"],
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
