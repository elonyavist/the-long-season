import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  createMarketState,
  gameDate,
  nonNegativeMoney,
  playerId,
  seasonId,
  type Club,
  type GameState,
  type MarketState,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
} from "@game/domain";

import { evaluatePermanentTransfer, previewPermanentTransfer } from "./transfer-feasibility.ts";

/**
 * Transfer feasibility tests protect the command-local preview behavior.
 *
 * The accepted path must copy state and budget data; rejected paths must return
 * structured reasons without modifying the original inputs.
 */
test("previewPermanentTransfer applies accepted ownership and budget copies", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");
  const gameState = gameStateFixture({
    clubs: [
      clubFixture(pro01, "third_division", 6, [playerId("player:pro01-01")]),
      clubFixture(pro18, "third_division", 4, [target]),
    ],
    players: [playerFixture(target, "st", 10, 12, 24), playerFixture(playerId("player:pro01-01"), "cm", 9, 10, 24)],
  });
  const marketState = marketStateFixture([
    [pro01, 5_000_000_00],
    [pro18, 500_000_00],
  ]);

  const preview = previewPermanentTransfer({
    gameState,
    marketState,
    intent: {
      buyingClubId: pro01,
      sellingClubId: pro18,
      playerId: target,
    },
  });

  assert.equal(preview.status, "accepted");
  assert.equal(preview.reasons.length, 0);
  assert.ok(preview.transferFee !== undefined);
  assert.deepEqual(preview.gameState.clubs[pro01]?.playerIds, [playerId("player:pro01-01"), target]);
  assert.deepEqual(preview.gameState.clubs[pro18]?.playerIds, []);
  assert.deepEqual(gameState.clubs[pro18]?.playerIds, [target]);
  assert.equal(preview.marketState.clubBudgets[pro01]?.transferBudget, 5_000_000_00 - preview.transferFee);
  assert.equal(preview.marketState.clubBudgets[pro18]?.transferBudget, 500_000_00 + preview.transferFee);
});

test("evaluatePermanentTransfer rejects insufficient transfer budget", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");

  const result = evaluatePermanentTransfer({
    gameState: gameStateFixture({
      clubs: [
        clubFixture(pro01, "third_division", 6, []),
        clubFixture(pro18, "third_division", 4, [target]),
      ],
      players: [playerFixture(target, "st", 10, 12, 24)],
    }),
    marketState: marketStateFixture([[pro01, 100_000_00]]),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["insufficient_transfer_budget"],
  );
});

test("evaluatePermanentTransfer rejects an unwilling player", () => {
  const pro01 = clubId("club:pro01");
  const elite = clubId("club:elite01");
  const target = playerId("player:target");

  const result = evaluatePermanentTransfer({
    gameState: gameStateFixture({
      clubs: [
        clubFixture(pro01, "third_division", 5, []),
        clubFixture(elite, "first_division", 10, [target]),
      ],
      players: [playerFixture(target, "st", 15, 16, 27)],
    }),
    marketState: marketStateFixture([
      [pro01, 100_000_000_00],
      [elite, 0],
    ]),
    intent: { buyingClubId: pro01, sellingClubId: elite, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.ok(result.willingness?.status === "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["player_unwilling"],
  );
});

test("evaluatePermanentTransfer returns structured identity and ownership reasons", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");

  const result = evaluatePermanentTransfer({
    gameState: gameStateFixture({
      clubs: [
        clubFixture(pro01, "third_division", 6, [target]),
        clubFixture(pro18, "third_division", 4, []),
      ],
      players: [playerFixture(target, "st", 10, 12, 24)],
    }),
    marketState: marketStateFixture([[pro01, 5_000_000_00]]),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["player_already_owned_by_buying_club", "player_not_owned_by_selling_club"],
  );
});

test("previewPermanentTransfer returns original references when rejected", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");
  const gameState = gameStateFixture({
    clubs: [
      clubFixture(pro01, "third_division", 6, []),
      clubFixture(pro18, "third_division", 4, [target]),
    ],
    players: [playerFixture(target, "st", 10, 12, 24)],
  });
  const marketState = marketStateFixture([[pro18, 500_000_00]]);

  const preview = previewPermanentTransfer({
    gameState,
    marketState,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(preview.status, "rejected");
  assert.deepEqual(preview.reasons.map((reason) => reason.code), ["missing_buying_budget"]);
  assert.equal(preview.gameState, gameState);
  assert.equal(preview.marketState, marketState);
});

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
