import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  gameDate,
  nonNegativeMoney,
  playerId,
  seasonId,
  type Club,
  type ClubFinanceLedgerEntry,
  type ClubFinanceLedgerEntryId,
  type ClubFinanceAccount,
  type ClubFinanceState,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
} from "@game/domain";

import {
  evaluatePermanentTransfer as evaluatePermanentTransferWithConfig,
} from "./transfer-feasibility.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

function evaluatePermanentTransfer(
  input: Omit<
    Parameters<typeof evaluatePermanentTransferWithConfig>[0],
    "valuationConfig" | "marketBehaviorPolicy"
  >,
) {
  return evaluatePermanentTransferWithConfig({
    ...input,
    valuationConfig: playerValuationConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
}

/**
 * Transfer feasibility tests protect pure market evaluation behavior.
 *
 * Ownership and finance changes belong exclusively to the durable career
 * transfer use case, so this module only returns structured facts and reasons.
 */
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
    clubFinanceState: clubFinanceStateFixture([[pro01, 100_000_00]]),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["insufficient_transfer_budget"],
  );
});

test("evaluatePermanentTransfer rejects a fee that the club cannot fund with cash", () => {
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
    clubFinanceState: clubFinanceStateFixture([[pro01, 5_000_000_00, 100_000_00]]),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["insufficient_cash"],
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
    clubFinanceState: clubFinanceStateFixture([
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
    clubFinanceState: clubFinanceStateFixture([[pro01, 5_000_000_00]]),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["player_already_owned_by_buying_club", "player_not_owned_by_selling_club"],
  );
});

test("evaluatePermanentTransfer derives an accepted budget preview without mutating finance state", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const target = playerId("player:target");
  const financeState = clubFinanceStateFixture([[pro01, 100_000_000_00]]);

  const result = evaluatePermanentTransfer({
    gameState: gameStateFixture({
      clubs: [
        clubFixture(pro01, "third_division", 6, []),
        clubFixture(pro18, "third_division", 4, [target]),
      ],
      players: [playerFixture(target, "st", 10, 12, 24)],
    }),
    clubFinanceState: financeState,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "accepted");
  assert.equal(result.buyerBudgetBefore, 100_000_000_00);
  assert.equal(result.buyerBudgetAfter, 100_000_000_00 - (result.transferFee ?? 0));
  assert.equal(financeState.accounts[pro01]?.availableTransferBudget, 100_000_000_00);
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

function clubFinanceStateFixture(
  rows: readonly (readonly [Club["id"], transferBudget: number, cashBalance?: number])[],
): ClubFinanceState {
  const accounts: Record<Club["id"], ClubFinanceAccount> = {} as Record<Club["id"], ClubFinanceAccount>;
  const clubIds: Club["id"][] = [];
  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = {};
  const ledgerEntryIds: ClubFinanceLedgerEntryId[] = [];

  for (const [id, transferBudget, cashBalance = transferBudget] of rows) {
    accounts[id] = {
      clubId: id,
      currency: "EUR",
      cashBalance: nonNegativeMoney(cashBalance),
      annualTransferBudget: nonNegativeMoney(transferBudget),
      availableTransferBudget: nonNegativeMoney(transferBudget),
      annualWageBudget: nonNegativeMoney(0),
      committedAnnualWage: nonNegativeMoney(0),
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };
    clubIds.push(id);
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:opening:${id}`);
    ledgerEntries[entryId] = {
      id: entryId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId: id,
      occurredOn: gameDate(20_000),
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: nonNegativeMoney(cashBalance),
      balanceAfter: nonNegativeMoney(cashBalance),
      referenceId: `test:${id}`,
    };
    ledgerEntryIds.push(entryId);
  }

  return { currency: "EUR", accounts, clubIds, ledgerEntries, ledgerEntryIds };
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
    primaryRole: "striker",
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
