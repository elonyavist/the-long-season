import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  accruePlayerFixtureParticipation,
  clubId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

import { advanceCareerMonths, monthKeyForCareerDate } from "./advance-career-month.ts";

/**
 * Monthly career lifecycle tests protect the single calendar checkpoint that
 * closes participation, applies gradual development, and prevents duplicate
 * growth after reloads or alternate advancement routes.
 */

test("advanceCareerMonths is a no-op when no completed development month was crossed", () => {
  const player = playerId("player:no-op");
  const currentDate = gameDate(20_000);
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKey: monthKeyForCareerDate(currentDate),
  });

  const result = advanceCareerMonths({
    careerState: state,
    worldSeed: "month-no-op",
    toDate: gameDate(Number(currentDate) + 1),
  });

  assert.deepEqual(result, {
    careerState: state,
    summaries: [],
  });
});

test("advanceCareerMonths closes eligible participation months exactly once", () => {
  const player = playerId("player:monthly-growth");
  const currentDate = gameDate(20_000);
  const toDate = gameDate(Number(currentDate) + 70);
  const monthKey = monthKeyForCareerDate(currentDate);
  const state = careerStateWithParticipation({ currentDate, player, monthKey });

  const first = advanceCareerMonths({
    careerState: state,
    worldSeed: "month-growth-world",
    toDate,
  });
  const second = advanceCareerMonths({
    careerState: first.careerState,
    worldSeed: "month-growth-world",
    fromDate: currentDate,
    toDate,
  });

  assert.equal(first.summaries.length, 1);
  assert.equal(first.summaries[0]?.monthKey, monthKey);
  assert.equal(first.summaries[0]?.checkpointKey, `season:0001|${monthKey}`);
  assert.equal(first.careerState.playerParticipationLedger?.closedMonthKeys.includes(`season:0001|${monthKey}`), true);
  assert.equal(Number(first.careerState.gameState.players[player]?.abilities.technical.finishing) > 8, true);
  assert.deepEqual(second.summaries, []);
  assert.deepEqual(second.careerState, first.careerState);
});

test("advanceCareerMonths applies each crossed month as its own checkpoint", () => {
  const player = playerId("player:multi-month");
  const currentDate = gameDate(20_000);
  const secondParticipationDate = gameDate(Number(currentDate) + 40);
  const toDate = gameDate(Number(currentDate) + 100);
  const firstMonthKey = monthKeyForCareerDate(currentDate);
  const secondMonthKey = monthKeyForCareerDate(secondParticipationDate);
  const state = careerStateWithParticipation({
    currentDate,
    player,
    monthKeys: [firstMonthKey, secondMonthKey],
  });

  const result = advanceCareerMonths({
    careerState: state,
    worldSeed: "month-growth-world",
    toDate,
  });

  assert.deepEqual(result.summaries.map((summary) => summary.monthKey), [firstMonthKey, secondMonthKey]);
  assert.equal(result.summaries.every((summary) => summary.developmentChangeCount === 1), true);
  assert.equal(result.careerState.playerParticipationLedger?.closedMonthKeys.includes(`season:0001|${firstMonthKey}`), true);
  assert.equal(result.careerState.playerParticipationLedger?.closedMonthKeys.includes(`season:0001|${secondMonthKey}`), true);
  assert.equal(Number(result.careerState.gameState.players[player]?.abilities.technical.finishing) > 8, true);
});

test("advanceCareerMonths leaves current-month participation open for later fixtures", () => {
  const player = playerId("player:current-month");
  const currentDate = gameDate(20_000);
  const toDate = gameDate(Number(currentDate) + 70);
  const futureMonthKey = monthKeyForCareerDate(toDate);
  const state = careerStateWithParticipation({ currentDate, player, monthKey: futureMonthKey });

  const result = advanceCareerMonths({
    careerState: state,
    worldSeed: "month-current-open",
    toDate,
  });

  assert.equal(result.summaries.length, 0);
  assert.equal(result.careerState.playerParticipationLedger?.closedMonthKeys.includes(`season:0001|${futureMonthKey}`), false);
  assert.equal(Number(result.careerState.gameState.players[player]?.abilities.technical.finishing), 8);
});

function careerStateWithParticipation(input: {
  readonly currentDate: ReturnType<typeof gameDate>;
  readonly player: PlayerId;
  readonly monthKey?: string;
  readonly monthKeys?: readonly string[];
}): CareerState {
  let playerParticipationLedger = createEmptyPlayerParticipationLedger();
  const monthKeys = input.monthKeys ?? (input.monthKey === undefined ? [] : [input.monthKey]);

  for (const monthKey of monthKeys) {
    playerParticipationLedger = accruePlayerFixtureParticipation(playerParticipationLedger, {
      fixtureId: fixtureId(`fixture:${String(monthKey).replace("-", "")}`),
      playerId: input.player,
      seasonId: seasonId("season:0001"),
      monthKey,
      started: true,
      substituteAppearance: false,
      minutes: 90,
      rating: 7.2,
      playedRoleMinutes: { striker: 90 },
    });
  }

  return createCareerState({
    saveId: saveId("save:advance-career-month"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: clubId("club:selected"),
    gameState: gameStateFixture(input.currentDate, [playerFixture(input.player)]),
    transferHistory: [],
    playerParticipationLedger,
  });
}

function gameStateFixture(currentDate: ReturnType<typeof gameDate>, players: readonly Player[]): GameState {
  const playerMap: Partial<Record<PlayerId, Player>> = {};
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};
  const playerIds: PlayerId[] = [];
  const selectedClubId = clubId("club:selected");

  for (const player of players) {
    playerMap[player.id] = player;
    playerStates[player.id] = {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    };
    playerIds.push(player.id);
  }

  return {
    meta: {
      seed: "advance-career-month-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate,
      currentSeasonId: seasonId("season:0001"),
    },
    players: playerMap as GameState["players"],
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

function clubFixture(id: ReturnType<typeof clubId>, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: "SEL",
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function playerFixture(id: PlayerId): Player {
  return {
    id,
    firstName: "Month",
    lastName: String(id),
    birthDate: gameDate(13_065),
    naturalPositions: ["st"],
    primaryRole: "striker",
    abilities: abilitySet(8),
    potential: abilitySet(12),
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
