import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  gameDate,
  getPlayerRoleProfile,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  stateValue,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  type CareerState,
  type GameDate,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeasonId,
} from "@game/domain";
import { deriveRng, fromISO } from "@game/shared";

import {
  applyYouthAcademyLifecycle as applyYouthAcademyLifecycleWithPolicy,
} from "./youth-lifecycle.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { derivePublicPlayerAssessment } from "../squad/public-player-assessment.ts";

function applyYouthAcademyLifecycle(
  input: Omit<
    Parameters<typeof applyYouthAcademyLifecycleWithPolicy>[0],
    "valuationConfig"
  >,
) {
  return applyYouthAcademyLifecycleWithPolicy({
    ...input,
    valuationConfig: playerValuationConfigFixture(),
  });
}

/** Tests for youth academy age-out lifecycle rules after development. */

const YOUTH_LIFECYCLE_REFERENCE_DATE = gameDate(fromISO("2028-08-01"));

test("applyYouthAcademyLifecycle leaves player abilities to the canonical development owner", () => {
  const senior = playerId("player:senior");
  const youth = playerId("player:youth-young");
  const careerState = careerStateFixture([
    youthPlayerFixture(youth, 17, abilitySet(6), abilitySet(12)),
  ]);
  const seniorBefore = careerState.gameState.players[senior]?.abilities;
  const youthPotentialBefore = careerState.gameState.players[youth]?.potential;
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "youth-lifecycle",
    seasonId: seasonId("season:0002"),
    lifecycleDate: careerState.gameState.calendar.currentDate,
  });
  const youthBefore = careerState.gameState.players[youth]?.abilities;
  const developedYouth = result.careerState.gameState.players[youth];

  assert.deepEqual(developedYouth?.abilities, youthBefore);
  assert.deepEqual(developedYouth?.potential, youthPotentialBefore);
  assert.deepEqual(result.careerState.gameState.players[senior]?.abilities, seniorBefore);
  assert.equal(result.records.length, 0);
});

test("applyYouthAcademyLifecycle releases aged-out youth without deleting their player facts", () => {
  const agedOut = playerId("player:youth-aged-out");
  const careerState = careerStateFixture([
    youthPlayerFixture(agedOut, 20, abilitySet(5), abilitySet(7)),
  ]);
  const player = careerState.gameState.players[agedOut];
  if (player === undefined) throw new Error("expected released age-out player");
  const valuationConfig = playerValuationConfigFixture();
  const assessment = derivePublicPlayerAssessment({
    player,
    currentDate: careerState.gameState.calendar.currentDate,
    potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
    ratingScale: valuationConfig.ratingScale,
  });
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "released-youth",
    seasonId: seasonId("season:0002"),
    lifecycleDate: careerState.gameState.calendar.currentDate,
  });

  assert.equal(assessment.currentAbility < 7.4, true);
  assert.equal(assessment.p50Ability - assessment.currentAbility < 1, true);
  assert.equal(result.records[0]?.outcome, "released");
  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 0);
  assert.deepEqual(result.careerState.gameState.players[agedOut], careerState.gameState.players[agedOut]);
  assert.deepEqual(result.careerState.gameState.playerStates[agedOut], careerState.gameState.playerStates[agedOut]);
  assert.equal(result.careerState.gameState.playerIds.includes(agedOut), true);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[agedOut]?.status, "released");
});

test("applyYouthAcademyLifecycle keeps a positive-P50-room age-out candidate outside the active youth roster", () => {
  const candidate = playerId("player:youth-promotion");
  const careerState = careerStateFixture([
    youthPlayerFixture(candidate, 20, abilitySet(4), abilitySet(20)),
  ]);
  const player = careerState.gameState.players[candidate];
  if (player === undefined) throw new Error("expected age-out candidate");
  const valuationConfig = playerValuationConfigFixture();
  const assessment = derivePublicPlayerAssessment({
    player,
    currentDate: careerState.gameState.calendar.currentDate,
    potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
    ratingScale: valuationConfig.ratingScale,
  });
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "promotion-youth",
    seasonId: seasonId("season:0002"),
    lifecycleDate: careerState.gameState.calendar.currentDate,
  });

  assert.equal(assessment.currentAbility < 8.8, true);
  assert.equal(assessment.p50Ability - assessment.currentAbility >= 1, true);
  assert.equal(result.records[0]?.outcome, "promotion_candidate");
  assert.equal(result.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length, 0);
  assert.equal(result.careerState.gameState.players[candidate] !== undefined, true);
  assert.equal(result.careerState.gameState.playerIds.includes(candidate), true);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status, "promotion_candidate");
});

test("applyYouthAcademyLifecycle preserves an external-move candidate as an active factual player", () => {
  const candidate = playerId("player:youth-external-move");
  const season = seasonId("season:0002");
  const worldSeed = firstExternalMoveSeed(season, candidate);
  const careerState = careerStateFixture([
    youthPlayerFixture(candidate, 20, abilitySet(8), abilitySet(9)),
  ]);

  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed,
    seasonId: season,
    lifecycleDate: careerState.gameState.calendar.currentDate,
  });

  assert.equal(result.records[0]?.outcome, "external_move_candidate");
  assert.equal(result.careerState.gameState.playerIds.includes(candidate), true);
  assert.deepEqual(result.careerState.gameState.players[candidate], careerState.gameState.players[candidate]);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status, "external_move_candidate");
});

test("applyYouthAcademyLifecycle evaluates goalkeeper age-out quality in the goalkeeper role", () => {
  const candidate = playerId("player:youth-goalkeeper-specialist");
  const abilities = roleShapedAbilities("goalkeeper", 14, 1);
  const careerState = careerStateFixture([
    youthPlayerFixture(candidate, 20, abilities, abilities, {
      position: "gk",
      primaryRole: "goalkeeper",
    }),
  ]);

  assert.equal(Number(rawDiagnosticAbilityAverage(abilities)) < 8.8, true);
  assert.equal(Number(roleCurrentAbility(abilities, getPlayerRoleProfile("goalkeeper"))) >= 8.8, true);

  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "goalkeeper-role-age-out",
    seasonId: seasonId("season:0002"),
    lifecycleDate: careerState.gameState.calendar.currentDate,
  });

  assert.equal(result.records[0]?.outcome, "promotion_candidate");
  assert.equal(result.careerState.gameState.players[candidate] !== undefined, true);
});

test("applyYouthAcademyLifecycle uses completed civil age around the twentieth birthday", () => {
  const candidate = playerId("player:youth-birthday-boundary");
  const birthDate = gameDate(fromISO("2008-08-01"));
  const preRolloverState = careerStateFixture(
    [youthPlayerFixture(candidate, 19, abilitySet(5), abilitySet(7), undefined, birthDate)],
    true,
    gameDate(fromISO("2027-08-01")),
  );

  const beforeResult = applyYouthAcademyLifecycle({
    careerState: preRolloverState,
    worldSeed: "civil-age-youth",
    seasonId: seasonId("season:0002"),
    lifecycleDate: gameDate(fromISO("2028-07-31")),
  });
  const birthdayResult = applyYouthAcademyLifecycle({
    careerState: preRolloverState,
    worldSeed: "civil-age-youth",
    seasonId: seasonId("season:0002"),
    lifecycleDate: gameDate(fromISO("2028-08-01")),
  });

  assert.deepEqual(
    beforeResult.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds,
    [candidate],
  );
  assert.equal(beforeResult.records.length, 0);
  assert.equal(
    birthdayResult.careerState.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds.length,
    0,
  );
  assert.equal(birthdayResult.records[0]?.age, 20);
  assert.equal(
    birthdayResult.careerState.youthAcademyState?.playerLifecycle[candidate]
      ?.statusChangedAt,
    gameDate(fromISO("2028-08-01")),
  );
});

test("applyYouthAcademyLifecycle returns unchanged state when no youth academy exists", () => {
  const careerState = careerStateFixture([], false);
  const result = applyYouthAcademyLifecycle({
    careerState,
    worldSeed: "no-youth",
    seasonId: seasonId("season:0002"),
    lifecycleDate: careerState.gameState.calendar.currentDate,
  });

  assert.equal(result.careerState, careerState);
  assert.deepEqual(result.records, []);
});

function careerStateFixture(
  youthPlayers: readonly Player[],
  includeYouthState = true,
  currentDate = YOUTH_LIFECYCLE_REFERENCE_DATE,
): CareerState {
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
        currentDate,
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
    primaryRole: "central_midfielder",
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

function youthPlayerFixture(
  id: PlayerId,
  age: number,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
  role: { readonly position: PlayerPosition; readonly primaryRole: PlayerRole } = {
    position: "cm",
    primaryRole: "central_midfielder",
  },
  birthDate = birthDateAtCompletedAge(age),
): Player {
  return {
    id,
    firstName: "Youth",
    lastName: String(id),
    birthDate,
    naturalPositions: [role.position],
    primaryRole: role.primaryRole,
    abilities,
    potential,
  };
}

function birthDateAtCompletedAge(age: number): GameDate {
  const birthYear = 2028 - age;
  return gameDate(fromISO(`${String(birthYear).padStart(4, "0")}-08-01`));
}

function firstExternalMoveSeed(season: SeasonId, candidate: PlayerId): string {
  for (let index = 0; index < 100; index += 1) {
    const seed = `external-move-${index}`;
    if (deriveRng(seed, "youth-age-out", season, candidate).nextFloat() < 0.35) {
      return seed;
    }
  }
  throw new Error("Could not find deterministic external-move test seed");
}

function roleShapedAbilities(role: PlayerRole, relevantValue: number, baselineValue: number): PlayerAbilities {
  const profile = getPlayerRoleProfile(role);
  const relevantKeys = new Set([...profile.coreForRole, ...profile.secondaryForRole]);

  return mapPlayerAbilities(abilitySet(baselineValue), (value, key) =>
    relevantKeys.has(key) ? abilityValue(relevantValue) : value,
  );
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
