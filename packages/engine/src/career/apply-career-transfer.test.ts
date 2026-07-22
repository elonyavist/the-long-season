import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  contractNegotiationId,
  createCareerState,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  saveId,
  seasonId,
  seniorSquadRegistrationId,
  type CareerState,
  type Club,
  type ClubFinanceAccount,
  type ClubFinanceLedgerEntry,
  type ClubFinanceLedgerEntryId,
  type ClubFinanceState,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
  type PlayerRole,
  type SeniorSquadState,
} from "@game/domain";

import { applyCareerPermanentTransfer } from "./apply-career-transfer.ts";
import { offerContractRenewal } from "./contract-negotiation.ts";

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
    financeRows: [
      [pro01, 6_000_000_00],
      [pro18, 500_000_00],
    ],
  });

  const occurredOn = gameDate(20_010);
  const result = applyCareerPermanentTransfer({
    careerState,
    occurredOn,
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
  const activeContract = Object.values(result.careerState.seniorSquadState?.contracts ?? {})
    .find((contract) => contract.playerId === target && contract.clubId === pro01);
  assert.ok(activeContract !== undefined);
  assert.equal(activeContract.type, "professional");
  assert.equal(activeContract.startsOn, occurredOn);
  assert.ok(activeContract.annualWage > 0);
  assert.deepEqual(
    result.careerState.seniorSquadState?.contractHistoryEntryIds
      .map((id) => result.careerState.seniorSquadState?.contractHistory[id]?.event)
      .slice(-2),
    ["transfer_terminated", "signed"],
  );
  assert.equal(
    result.careerState.clubFinanceState?.accounts[pro01]?.availableTransferBudget,
    6_000_000_00 - result.transferFee - activeContract.bonuses.signingBonus,
  );
  assert.equal(
    result.careerState.clubFinanceState?.accounts[pro18]?.availableTransferBudget,
    500_000_00 + result.transferFee,
  );
  assert.deepEqual(result.careerState.transferHistory, [
    {
      sequenceNumber: 1,
      occurredOn,
      buyingClubId: pro01,
      sellingClubId: pro18,
      playerId: target,
      transferFee: result.transferFee,
    },
  ]);
  assert.ok(
    result.careerState.clubFinanceState?.ledgerEntryIds.some((entryId) =>
      result.careerState.clubFinanceState?.ledgerEntries[entryId]?.reason === "contract_signing_bonus"
    ),
  );
  assert.equal(
    result.careerState.clubFinanceState?.ledgerEntryIds
      .map((entryId) => result.careerState.clubFinanceState?.ledgerEntries[entryId])
      .filter((entry) => entry?.referenceId.startsWith("transfer:"))
      .every((entry) => entry?.occurredOn === occurredOn),
    true,
  );
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
    financeRows: [[pro01, 100_000_00], [pro18, 500_000_00]],
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

test("applyCareerPermanentTransfer preserves wages promised by an unresolved renewal", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const buyerPlayer = playerId("player:pro01-01");
  const target = playerId("player:target");
  const careerState = careerStateFixture({
    clubs: [
      clubFixture(pro01, "third_division", 6, [buyerPlayer]),
      clubFixture(pro18, "third_division", 4, [target]),
    ],
    players: [
      playerFixture(target, "st", 10, 12, 24),
      playerFixture(buyerPlayer, "cm", 9, 10, 24),
    ],
    financeRows: [
      [pro01, 6_000_000_00],
      [pro18, 500_000_00],
    ],
  });
  const account = careerState.clubFinanceState?.accounts[pro01];
  const currentContract = careerState.seniorSquadState?.activeContractIds
    .map((id) => careerState.seniorSquadState?.contracts[id])
    .find((contract) => contract?.playerId === buyerPlayer);
  assert.ok(account !== undefined && currentContract !== undefined);
  if (account === undefined || currentContract === undefined) return;

  const offered = offerContractRenewal({
    careerState,
    negotiationId: contractNegotiationId("contract-negotiation:transfer-reserved-wage"),
    playerId: buyerPlayer,
    clubId: pro01,
    offeredOn: careerState.gameState.calendar.currentDate,
    terms: {
      durationYears: 2,
      annualWage: account.annualWageBudget,
      squadStatus: currentContract.squadStatus,
      bonuses: {
        signingBonus: nonNegativeMoney(0),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
  });
  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;

  const result = applyCareerPermanentTransfer({
    careerState: offered.careerState,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.equal(result.reasons[0]?.code, "insufficient_wage_budget");
  assert.strictEqual(result.careerState, offered.careerState);
  assert.deepEqual(result.careerState.gameState.clubs[pro18]?.playerIds, [target]);
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
    financeRows: [
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
      financeRows: [
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
  readonly financeRows: readonly (readonly [Club["id"], number])[];
}): CareerState {
  const selectedClubId = input.clubs[0]!.id;
  const gameState = gameStateFixture(input);
  const seniorSquadState = seniorSquadStateFixture(gameState);

  return createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState,
    seniorSquadState,
    clubFinanceState: clubFinanceStateFixture(input.financeRows, seniorSquadState),
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

function clubFinanceStateFixture(
  rows: readonly (readonly [Club["id"], number])[],
  seniorSquadState: SeniorSquadState,
): ClubFinanceState {
  const accounts: Record<Club["id"], ClubFinanceAccount> = {} as Record<Club["id"], ClubFinanceAccount>;
  const clubIds: Club["id"][] = [];
  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = {};
  const ledgerEntryIds: ClubFinanceLedgerEntryId[] = [];

  for (const [id, amount] of rows) {
    const committedAnnualWage = seniorSquadState.activeContractIds.reduce((total, contractId) => {
      const contract = seniorSquadState.contracts[contractId];
      return total + (contract?.clubId === id ? contract.annualWage : 0);
    }, 0);
    accounts[id] = {
      clubId: id,
      currency: "EUR",
      cashBalance: nonNegativeMoney(amount),
      annualTransferBudget: nonNegativeMoney(amount),
      availableTransferBudget: nonNegativeMoney(amount),
      annualWageBudget: nonNegativeMoney(100_000_000_00),
      committedAnnualWage: nonNegativeMoney(committedAnnualWage),
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
      amount: nonNegativeMoney(amount),
      balanceAfter: nonNegativeMoney(amount),
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
    primaryRole: roleFor(primaryPosition),
    abilities: abilitiesFixture(currentAbility),
    potential: abilitiesFixture(potentialAbility),
  };
}

function seniorSquadStateFixture(gameState: GameState): SeniorSquadState {
  const registrations: Record<string, SeniorSquadState["registrations"][keyof SeniorSquadState["registrations"]]> = {};
  const contracts: Record<string, SeniorSquadState["contracts"][keyof SeniorSquadState["contracts"]]> = {};
  const contractHistory: Record<string, SeniorSquadState["contractHistory"][keyof SeniorSquadState["contractHistory"]]> = {};
  const registrationIds: SeniorSquadState["registrationIds"][number][] = [];
  const contractIds: SeniorSquadState["contractIds"][number][] = [];
  const contractHistoryEntryIds: SeniorSquadState["contractHistoryEntryIds"][number][] = [];
  let sequenceNumber = 1;

  for (const clubIdValue of gameState.clubIds) {
    const club = gameState.clubs[clubIdValue];
    if (club === undefined) continue;
    for (let index = 0; index < club.playerIds.length; index += 1) {
      const ownedPlayerId = club.playerIds[index]!;
      const suffix = `${String(clubIdValue).slice(5)}:${String(ownedPlayerId).slice(7)}`;
      const registrationId = seniorSquadRegistrationId(`registration:${suffix}`);
      const contractId = playerContractId(`contract:${suffix}:initial`);
      const historyId = playerContractHistoryEntryId(`contract-history:${suffix}:initial`);
      registrations[registrationId] = {
        id: registrationId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
        shirtNumber: index + 1,
        registeredOn: gameDate(19_500),
      };
      contracts[contractId] = {
        id: contractId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
        type: "professional",
        startsOn: gameDate(19_500),
        endsOn: gameDate(21_000),
        annualWage: nonNegativeMoney(100_000_00),
        squadStatus: "squad_player",
        bonuses: {
          signingBonus: nonNegativeMoney(10_000_00),
          appearanceBonus: nonNegativeMoney(1_000_00),
        },
      };
      contractHistory[historyId] = {
        id: historyId,
        sequenceNumber,
        occurredOn: gameDate(19_500),
        event: "signed",
        contractId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
      };
      registrationIds.push(registrationId);
      contractIds.push(contractId);
      contractHistoryEntryIds.push(historyId);
      sequenceNumber += 1;
    }
  }
  return {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: contractIds,
    contractHistory,
    contractHistoryEntryIds,
  };
}

function roleFor(position: PlayerPosition): PlayerRole {
  if (position === "gk") return "goalkeeper";
  if (position === "cb") return "center_back";
  if (position === "rb" || position === "lb") return "full_back";
  if (position === "rwb" || position === "lwb") return "wing_back";
  if (position === "dm") return "defensive_midfielder";
  if (position === "cm") return "central_midfielder";
  if (position === "am") return "attacking_midfielder";
  if (position === "rw" || position === "lw") return "winger";
  return "striker";
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
