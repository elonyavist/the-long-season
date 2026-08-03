import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  contractNegotiationId,
  createCareerState,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  saveId,
  seasonId,
  seasonTransferWindows,
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

import {
  applyCareerPermanentTransfer as applyCareerPermanentTransferWithConfig,
} from "./apply-career-transfer.ts";
import {
  offerContractRenewal as offerContractRenewalWithPolicy,
} from "./contract-negotiation.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

function applyCareerPermanentTransfer(
  input: Omit<
    Parameters<typeof applyCareerPermanentTransferWithConfig>[0],
    "valuationConfig" | "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return applyCareerPermanentTransferWithConfig({
    ...input,
    valuationConfig: playerValuationConfigFixture(),
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
}

function offerContractRenewal(
  input: Omit<Parameters<typeof offerContractRenewalWithPolicy>[0], "wagePolicy">,
) {
  return offerContractRenewalWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
  });
}

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
    transferWindows: openTransferWindows(occurredOn),
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
      kind: "permanent_transfer",
      sequenceNumber: 1,
      occurredOn,
      buyingClubId: pro01,
      sellingClubId: pro18,
      playerId: target,
      publicValue: result.transferFee,
      initialAskingPrice: result.transferFee,
      offeredFee: result.transferFee,
      agreedFee: result.transferFee,
      completedFee: result.transferFee,
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

test("applyCareerPermanentTransfer rejects a transfer outside an open window without mutating career state", () => {
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
  // Windows that both start after the transfer date, so the attempt is closed.
  const transferWindows = seasonTransferWindows({
    competitionId: competitionId("competition:demo-third-division"),
    seasonId: seasonId("season:demo-001"),
    windows: [
      { opensOn: gameDate(20_050), closesOn: gameDate(20_090) },
      { opensOn: gameDate(20_200), closesOn: gameDate(20_230) },
    ],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    occurredOn: gameDate(20_010),
    transferWindows,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.deepEqual(result.reasons.map((reason) => reason.code), ["outside_transfer_window"]);
  assert.equal(result.careerState, careerState);
});

test("applyCareerPermanentTransfer accepts a transfer inside an open window", () => {
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
  const transferWindows = seasonTransferWindows({
    competitionId: competitionId("competition:demo-third-division"),
    seasonId: seasonId("season:demo-001"),
    windows: [
      { opensOn: gameDate(20_000), closesOn: gameDate(20_050) },
      { opensOn: gameDate(20_200), closesOn: gameDate(20_230) },
    ],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    occurredOn: gameDate(20_010),
    transferWindows,
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "accepted");
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
    transferWindows: openTransferWindows(careerState.gameState.calendar.currentDate),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "rejected");
  assert.equal(result.careerState, careerState);
  assert.deepEqual(result.reasons.map((reason) => reason.code), ["insufficient_transfer_budget"]);
  assert.deepEqual(careerState.transferHistory, []);
});

test("applyCareerPermanentTransfer is not blocked by an unresolved renewal offer's pending wages", () => {
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
    transferWindows: openTransferWindows(offered.careerState.gameState.calendar.currentDate),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  // Phase 79 locked rule: an unresolved offer does not reserve wage budget, so
  // affordability is judged against committed contracts only. The transfer is
  // funded here even though a pending renewal would spend the whole budget if
  // it were ever accepted.
  assert.equal(result.status, "accepted");
  assert.deepEqual(result.careerState.gameState.clubs[pro01]?.playerIds, [buyerPlayer, target]);
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
    transferWindows: openTransferWindows(careerState.gameState.calendar.currentDate),
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
        kind: "permanent_transfer",
        sequenceNumber: 3,
        occurredOn: gameDate(19_999),
        buyingClubId: pro01,
        sellingClubId: pro18,
        playerId: target,
        publicValue: nonNegativeMoney(900_00),
        initialAskingPrice: nonNegativeMoney(1_100_00),
        offeredFee: nonNegativeMoney(1_000_00),
        agreedFee: nonNegativeMoney(1_000_00),
        completedFee: nonNegativeMoney(1_000_00),
      },
    ],
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    transferWindows: openTransferWindows(careerState.gameState.calendar.currentDate),
    intent: { buyingClubId: pro01, sellingClubId: pro18, playerId: target },
  });

  assert.equal(result.status, "accepted");
  assert.equal(result.careerState.transferHistory.at(-1)?.sequenceNumber, 4);
});

test("selling a selected-club starter leaves the saved slot empty without choosing a replacement", () => {
  const buyer = clubId("club:pro01");
  const seller = clubId("club:pro18");
  const target = playerId("player:target");
  const substitute = playerId("player:substitute");
  const base = careerStateFixture({
    clubs: [
      clubFixture(buyer, "third_division", 6, []),
      clubFixture(seller, "third_division", 4, [target, substitute]),
    ],
    players: [
      playerFixture(target, "st", 10, 12, 24),
      playerFixture(substitute, "cm", 9, 10, 24),
    ],
    financeRows: [
      [buyer, 6_000_000_00],
      [seller, 500_000_00],
    ],
  });
  const careerState = createCareerState({
    ...base,
    selectedClubId: seller,
    matchPreparation: {
      selectedClubId: seller,
      selectedLineup: {
        clubId: seller,
        slots: [{ slotKey: "st", playerId: target, canonicalRole: "striker" }],
      },
      boardSlots: [{ slotKey: "st", nx: 0.5, ny: 0.18, roleKey: "ATT" }],
      benchSlots: [{ slotKey: "bench:01", playerId: substitute }],
      updatedAt: gameDate(20_000),
    },
  });

  const result = applyCareerPermanentTransfer({
    careerState,
    transferWindows: openTransferWindows(careerState.gameState.calendar.currentDate),
    intent: {
      buyingClubId: buyer,
      sellingClubId: seller,
      playerId: target,
    },
  });

  assert.equal(result.status, "accepted");
  assert.equal(result.careerState.matchPreparation?.selectedLineup, undefined);
  assert.equal(result.careerState.matchPreparation?.boardSlots, undefined);
  assert.deepEqual(result.careerState.matchPreparation?.benchSlots, [
    { slotKey: "bench:01", playerId: substitute },
  ]);
});

function openTransferWindows(asOf: ReturnType<typeof gameDate>) {
  return seasonTransferWindows({
    competitionId: competitionId("competition:demo-third-division"),
    seasonId: seasonId("season:demo-001"),
    windows: [
      { opensOn: gameDate(asOf - 10), closesOn: gameDate(asOf + 50) },
      { opensOn: gameDate(asOf + 200), closesOn: gameDate(asOf + 230) },
    ],
  });
}

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
      // Keep the fixture internally credible: a 10% liquidity reserve must not
      // exceed the multi-million transfer cash used by accepted scenarios.
      annualWageBudget: nonNegativeMoney(5_000_000_00),
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
