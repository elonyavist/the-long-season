import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  createMarketState,
  gameDate,
  nonNegativeMoney,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type Club,
  type GameState,
  type MarketState,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
} from "@game/domain";

import { applyCareerPermanentTransfer } from "./apply-career-transfer.ts";

/**
 * Persistent transfer tests protect durable career-state mutation.
 *
 * The engine use case must not write files. It only returns copied accepted
 * state or the original rejected state.
 */
test("applyCareerPermanentTransfer applies accepted ownership, budget, and history copies", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");
  const careerState = careerStateFixture({
    clubs: [
      clubFixture(pro01, "third_division", 6, [playerId("player:pro01-01")]),
      clubFixture(pro18, "third_division", 4, [target]),
    ],
    players: [playerFixture(target, "st", 10, 12, 24), playerFixture(playerId("player:pro01-01"), "cm", 9, 10, 24)],
    marketRows: [
      [pro01, 6_000_000_00],
      [pro18, 500_000_00],
    ],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    intent: {
      buyingClubId: pro01,
      sellingClubId: pro18,
      playerId: target,
    },
  });

  assert.equal(result.status, "accepted");
  assert.notEqual(result.careerState, careerState);
  assert.ok(result.transferFee !== undefined);
  assert.deepEqual(result.careerState.gameState.clubs[pro01]?.playerIds, [playerId("player:pro01-01"), target]);
  assert.deepEqual(result.careerState.gameState.clubs[pro18]?.playerIds, []);
  assert.deepEqual(careerState.gameState.clubs[pro18]?.playerIds, [target]);
  assert.equal(result.careerState.marketState.clubBudgets[pro01]?.transferBudget, 6_000_000_00 - result.transferFee);
  assert.equal(result.careerState.marketState.clubBudgets[pro18]?.transferBudget, 500_000_00 + result.transferFee);
  assert.deepEqual(result.careerState.transferHistory, [
    {
      sequenceNumber: 1,
      occurredOn: gameDate(20_000),
      buyingClubId: pro01,
      sellingClubId: pro18,
      playerId: target,
      transferFee: result.transferFee,
    },
  ]);
});

test("applyCareerPermanentTransfer rejects insufficient transfer budget without mutating career state", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");
  const careerState = careerStateFixture({
    clubs: [
      clubFixture(pro01, "third_division", 6, []),
      clubFixture(pro18, "third_division", 4, [target]),
    ],
    players: [playerFixture(target, "st", 10, 12, 24)],
    marketRows: [[pro01, 100_000_00]],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.equal(result.careerState, careerState);
  assert.deepEqual(result.reasons.map((reason) => reason.code), ["insufficient_transfer_budget"]);
  assert.deepEqual(careerState.transferHistory, []);
});

test("applyCareerPermanentTransfer rejects unwilling players without mutating career state", () => {
  const pro01 = clubId("club:pro01");
  const elite = clubId("club:elite01");
  const target = playerId("player:target");
  const careerState = careerStateFixture({
    clubs: [
      clubFixture(pro01, "third_division", 5, []),
      clubFixture(elite, "first_division", 10, [target]),
    ],
    players: [playerFixture(target, "st", 15, 16, 27)],
    marketRows: [
      [pro01, 100_000_000_00],
      [elite, 0],
    ],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    intent: { buyingClubId: pro01, sellingClubId: elite, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.equal(result.careerState, careerState);
  assert.deepEqual(result.reasons.map((reason) => reason.code), ["player_unwilling"]);
  assert.equal(result.willingness?.status, "rejected");
});

test("applyCareerPermanentTransfer appends after existing transfer history", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");
  const careerState = createCareerState({
    ...careerStateFixture({
      clubs: [
        clubFixture(pro01, "third_division", 6, []),
        clubFixture(pro18, "third_division", 4, [target]),
      ],
      players: [playerFixture(target, "st", 10, 12, 24)],
      marketRows: [
        [pro01, 6_000_000_00],
        [pro18, 500_000_00],
      ],
    }),
    transferHistory: [
      {
        sequenceNumber: 3,
        occurredOn: gameDate(19_999),
        buyingClubId: pro01,
        sellingClubId: pro18,
        playerId: target,
        transferFee: nonNegativeMoney(1_000_00),
      },
    ],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "accepted");
  assert.equal(result.careerState.transferHistory.at(-1)?.sequenceNumber, 4);
});

function careerStateFixture(input: {
  readonly clubs: readonly Club[];
  readonly players: readonly Player[];
  readonly marketRows: readonly (readonly [Club["id"], number])[];
}): CareerState {
  const selectedClubId = input.clubs[0]!.id;

  return createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture(input),
    marketState: marketStateFixture(input.marketRows),
    transferHistory: [],
  });
}

function gameStateFixture(input: {
  readonly clubs: readonly Club[];
  readonly players: readonly Player[];
}): GameState {
  const clubs: Record<Club["id"], Club> = {} as Record<Club["id"], Club>;
  const clubIds: Club["id"][] = [];
  const players: Record<Player["id"], Player> = {} as Record<Player["id"], Player>;
  const playerIds: Player["id"][] = [];

  for (const club of input.clubs) {
    clubs[club.id] = club;
    clubIds.push(club.id);
  }

  for (const player of input.players) {
    players[player.id] = player;
    playerIds.push(player.id);
  }

  return {
    meta: {
      seed: "test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:test"),
    },
    players,
    playerIds,
    playerStates: {},
    clubs,
    clubIds,
    fixtures: {},
    fixtureIds: [],
  };
}

function marketStateFixture(rows: readonly (readonly [Club["id"], number])[]): MarketState {
  const clubBudgets: Record<Club["id"], MarketState["clubBudgets"][Club["id"]]> = {} as Record<
    Club["id"],
    MarketState["clubBudgets"][Club["id"]]
  >;
  const clubBudgetIds: Club["id"][] = [];

  for (const [id, amount] of rows) {
    clubBudgets[id] = {
      clubId: id,
      transferBudget: nonNegativeMoney(amount),
    };
    clubBudgetIds.push(id);
  }

  return createMarketState({
    clubBudgets,
    clubBudgetIds,
  });
}

function clubFixture(id: Club["id"], category: Club["category"], reputation: number, playerIds: readonly Player["id"][]): Club {
  return {
    id,
    name: `Club ${id}`,
    shortName: id,
    category,
    reputation,
    playerIds,
  };
}

function playerFixture(
  id: Player["id"],
  primaryPosition: PlayerPosition,
  currentAbility: number,
  potentialAbility: number,
  age: number,
): Player {
  return {
    id,
    firstName: "Test",
    lastName: id,
    birthDate: gameDate(20_000 - age * 365),
    naturalPositions: [primaryPosition],
    abilities: abilitiesFixture(currentAbility),
    potential: abilitiesFixture(potentialAbility),
  };
}

function abilitiesFixture(value: number): PlayerAbilities {
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
