import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  createCareerState,
  createClubFinanceState,
  createSeniorSquadState,
  gameDate,
  getPlayerRoleProfile,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerContractId,
  playerId,
  saveId,
  seasonId,
  seniorSquadRegistrationId,
  stateValue,
  type CareerState,
  type Club,
  type ClubFinanceState,
  type ClubId,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeniorSquadState,
} from "@game/domain";

import { simulateTransferTurnover } from "./transfer-turnover.ts";

/** Tests for minimal deterministic transfer turnover. */

test("simulateTransferTurnover moves a suitable player between clubs", () => {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  const movable = playerId("player:movable");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, [
      playerFixture(movable, "cb", 7).id,
      ...playersForClubAtAbility("seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ], 13),
    ]),
  ]);

  const occurredOn = gameDate(20_365);
  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "turnover-world",
    seasonId: seasonId("season:0001"),
    occurredOn,
    maxMoves: 1,
  });

  assert.equal(result.transfers.length, 1);
  assert.equal(result.transfers[0]?.playerId, movable);
  assert.equal(result.careerState.gameState.clubs[buyer]?.playerIds.includes(movable), true);
  assert.equal(result.careerState.gameState.clubs[seller]?.playerIds.includes(movable), false);
  assert.equal(result.careerState.transferHistory.length, 1);
  assert.equal(result.careerState.transferHistory[0]?.occurredOn, occurredOn);
  assert.deepEqual(
    result.careerState.seniorSquadState?.contractHistoryEntryIds.map((id) =>
      result.careerState.seniorSquadState?.contractHistory[id]?.event
    ),
    ["transfer_terminated", "signed"],
  );
  assert.equal(
    result.careerState.seniorSquadState?.activeContractIds.some((id) => {
      const contract = result.careerState.seniorSquadState?.contracts[id];
      return contract?.playerId === movable
        && contract.clubId === buyer
        && contract.startsOn === occurredOn;
    }),
    true,
  );
  assert.equal(
    result.careerState.seniorSquadState?.registrationIds.some((id) => {
      const registration = result.careerState.seniorSquadState?.registrations[id];
      return registration?.playerId === movable && registration.clubId === buyer;
    }),
    true,
  );
});

test("simulateTransferTurnover is deterministic for same seed and season", () => {
  const careerState = turnoverFixture();

  const first = simulateTransferTurnover({
    careerState,
    worldSeed: "same-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });
  const second = simulateTransferTurnover({
    careerState,
    worldSeed: "same-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.deepEqual(second, first);
});

test("simulateTransferTurnover default cap allows roughly one move per four clubs", () => {
  const careerState = careerStateFixture(
    Array.from({ length: 8 }, (_, index) => {
      const surplusDefenders = index % 2 === 0;
      return clubFixture(
        clubId(`club:cap-${String(index + 1).padStart(2, "0")}`),
        5,
        playersForClub(`cap-${String(index + 1).padStart(2, "0")}`, [
          "gk", "gk",
          ...Array.from({ length: surplusDefenders ? 7 : 5 }, () => "cb" as const),
          ...Array.from({ length: surplusDefenders ? 5 : 7 }, () => "cm" as const),
          "st", "st", "st", "st", "st", "st",
        ]),
      );
    }),
  );

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "default-cap-turnover",
    seasonId: seasonId("season:0001"),
  });

  assert.equal(result.transfers.length, 2);
});

test("simulateTransferTurnover rejects casual downward moves for strong players", () => {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  const star = playerId("player:star");
  const careerState = careerStateFixture([
    clubFixture(buyer, 3, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 8, [
      playerFixture(star, "cb", 13).id,
      ...playersForClubAtAbility("seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ], 13),
    ], "second_division"),
  ]);

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "downward-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.deepEqual(result.transfers, []);
  assert.equal(result.careerState.gameState.clubs[seller]?.playerIds.includes(star), true);
});

test("simulateTransferTurnover protects a strong role specialist despite a low raw average", () => {
  const buyer = clubId("club:buyer-specialist");
  const seller = clubId("club:seller-specialist");
  const specialist = playerId("player:center-back-specialist");
  const careerState = careerStateFixture([
    clubFixture(buyer, 3, playersForClub("buyer-specialist", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 8, [
      playerFixture(specialist, "cb", 1, roleShapedAbilities("center_back", 14, 1)).id,
      ...playersForClubAtAbility("seller-specialist", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ], 13),
    ], "second_division"),
  ]);

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "specialist-downward-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.deepEqual(result.transfers, []);
  assert.equal(result.careerState.gameState.clubs[seller]?.playerIds.includes(specialist), true);
});

test("simulateTransferTurnover evaluates goalkeeper suitability through goalkeeper attributes", () => {
  const buyer = clubId("club:keeper-buyer");
  const seller = clubId("club:keeper-seller");
  const specialist = playerId("player:keeper-specialist");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("keeper-buyer", ["cb", "cb", "cm", "cm", "st"])),
    clubFixture(seller, 6, [
      playerFixture(specialist, "gk", 1, roleShapedAbilities("goalkeeper", 14, 1)).id,
      ...playersForClub("keeper-seller", ["gk", "gk", "cb", "cb", "cb", "cb", "cb", "cm", "cm", "cm", "cm", "cm", "cm", "st", "st", "st", "st", "st", "st"]),
    ]),
  ]);

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "goalkeeper-turnover",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.equal(result.transfers[0]?.playerId, specialist);
  assert.equal((result.transfers[0]?.currentAbilityAverage ?? 0) >= 12, true);
});

test("simulateTransferTurnover cannot sell below protected department depth", () => {
  const buyer = clubId("club:depth-buyer");
  const seller = clubId("club:depth-seller");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("depth-buyer", [
      "gk", "gk",
      "cb", "cb", "cb", "cb", "cb", "cb",
      "cm",
      "st", "st", "st",
    ])),
    clubFixture(seller, 6, playersForClub("depth-seller", [
      "gk", "gk",
      "cb", "cb", "cb", "cb", "cb", "cb",
      "cm", "cm", "cm",
      "st", "st", "st", "st", "st", "st", "st", "st", "st", "st",
    ])),
  ]);

  const result = simulateTransferTurnover({
    careerState,
    worldSeed: "protected-department-depth",
    seasonId: seasonId("season:0001"),
    maxMoves: 1,
  });

  assert.deepEqual(result.transfers, []);
  assert.equal(result.careerState.gameState.clubs[seller]?.playerIds.length, 21);
});

function turnoverFixture(): CareerState {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  return careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, [
      playerFixture(playerId("player:movable"), "cb", 7).id,
      ...playersForClub("seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ]),
    ]),
  ]);
}

function careerStateFixture(clubs: readonly Club[]): CareerState {
  const selectedClub = clubFixture(clubId("club:user"), 5, []);
  const worldClubs = [selectedClub, ...clubs];
  const players: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const club of worldClubs) {
    for (const clubPlayerId of club.playerIds) {
      const player = playerLookup.get(clubPlayerId);
      if (player === undefined) {
        throw new Error(`missing fixture player: ${clubPlayerId}`);
      }
      players[clubPlayerId] = player;
      playerIds.push(clubPlayerId);
      playerStates[clubPlayerId] = playerStateFixture();
    }
  }

  const selectedClubId = selectedClub.id;
  const gameState: GameState = {
    meta: {
      seed: "transfer-turnover-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: players as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: Object.fromEntries(worldClubs.map((club) => [club.id, club])) as GameState["clubs"],
    clubIds: worldClubs.map((club) => club.id),
    fixtures: {},
    fixtureIds: [],
  };
  const seniorSquadState = canonicalSeniorSquadState(gameState);

  return createCareerState({
    saveId: saveId("save:transfer-turnover"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState,
    transferHistory: [],
    seniorSquadState,
    clubFinanceState: canonicalClubFinanceState(gameState, seniorSquadState),
  });
}

function canonicalSeniorSquadState(gameState: GameState): SeniorSquadState {
  const registrations: Record<string, SeniorSquadState["registrations"][keyof SeniorSquadState["registrations"]]> = {};
  const registrationIds: SeniorSquadState["registrationIds"][number][] = [];
  const contracts: Record<string, SeniorSquadState["contracts"][keyof SeniorSquadState["contracts"]]> = {};
  const contractIds: SeniorSquadState["contractIds"][number][] = [];

  for (const clubIdValue of gameState.clubIds) {
    const club = gameState.clubs[clubIdValue];
    if (club === undefined) continue;
    for (let index = 0; index < club.playerIds.length; index += 1) {
      const ownedPlayerId = club.playerIds[index];
      if (ownedPlayerId === undefined) continue;
      const suffix = `${String(clubIdValue).slice(5)}:${String(ownedPlayerId).slice(7)}`;
      const registrationId = seniorSquadRegistrationId(`registration:${suffix}`);
      const contractId = playerContractId(`contract:${suffix}`);
      registrations[registrationId] = {
        id: registrationId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
        shirtNumber: index + 1,
        registeredOn: gameDate(19_000),
      };
      contracts[contractId] = {
        id: contractId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
        type: "professional",
        startsOn: gameDate(19_000),
        endsOn: gameDate(21_000),
        annualWage: nonNegativeMoney(100_000_00),
        squadStatus: "squad_player",
        bonuses: {
          signingBonus: nonNegativeMoney(0),
          appearanceBonus: nonNegativeMoney(1_000_00),
        },
      };
      registrationIds.push(registrationId);
      contractIds.push(contractId);
    }
  }

  return createSeniorSquadState(gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: contractIds,
    contractHistory: {},
    contractHistoryEntryIds: [],
  });
}

function canonicalClubFinanceState(gameState: GameState, seniorSquadState: SeniorSquadState): ClubFinanceState {
  const accounts: Record<string, ClubFinanceState["accounts"][keyof ClubFinanceState["accounts"]]> = {};
  const ledgerEntries: Record<string, ClubFinanceState["ledgerEntries"][keyof ClubFinanceState["ledgerEntries"]]> = {};
  const ledgerEntryIds: ClubFinanceState["ledgerEntryIds"][number][] = [];

  for (const clubIdValue of gameState.clubIds) {
    const committedAnnualWage = seniorSquadState.activeContractIds.reduce((total, contractId) => {
      const contract = seniorSquadState.contracts[contractId];
      return contract?.clubId === clubIdValue ? total + contract.annualWage : total;
    }, 0);
    const cashBalance = nonNegativeMoney(1_000_000_000_00);
    accounts[clubIdValue] = {
      clubId: clubIdValue,
      currency: "EUR",
      cashBalance,
      annualTransferBudget: nonNegativeMoney(500_000_000_00),
      availableTransferBudget: nonNegativeMoney(500_000_000_00),
      annualWageBudget: nonNegativeMoney(500_000_000_00),
      committedAnnualWage: nonNegativeMoney(committedAnnualWage),
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:opening:${String(clubIdValue).slice(5)}`);
    ledgerEntries[entryId] = {
      id: entryId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId: clubIdValue,
      occurredOn: gameDate(20_000),
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: cashBalance,
      balanceAfter: cashBalance,
      referenceId: `opening:${clubIdValue}`,
    };
    ledgerEntryIds.push(entryId);
  }

  return createClubFinanceState(gameState, seniorSquadState, {
    currency: "EUR",
    accounts,
    clubIds: gameState.clubIds,
    ledgerEntries,
    ledgerEntryIds,
  });
}

const playerLookup = new Map<PlayerId, Player>();

function clubFixture(
  id: ClubId,
  reputation: number,
  playerIds: readonly PlayerId[],
  category: Club["category"] = "third_division",
): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category,
    reputation,
    playerIds,
  };
}

function playersForClub(prefix: string, positions: readonly PlayerPosition[]): PlayerId[] {
  return positions.map((position, index) => playerFixture(playerId(`player:${prefix}-${String(index + 1).padStart(2, "0")}`), position, 7).id);
}

function playersForClubAtAbility(
  prefix: string,
  positions: readonly PlayerPosition[],
  ability: number,
): PlayerId[] {
  return positions.map((position, index) =>
    playerFixture(playerId(`player:${prefix}-${String(index + 1).padStart(2, "0")}`), position, ability).id
  );
}

function playerFixture(
  id: PlayerId,
  position: PlayerPosition,
  ability: number,
  abilities = abilitySet(ability),
): Player {
  const player: Player = {
    id,
    firstName: String(id),
    lastName: "Turnover",
    birthDate: gameDate(20_000 - 24 * 365),
    naturalPositions: [position],
    primaryRole: primaryRoleForPosition(position),
    abilities,
    potential: mapPlayerAbilities(abilities, (value) => abilityValue(Math.min(20, Number(value) + 1))),
  };
  playerLookup.set(id, player);
  return player;
}

function primaryRoleForPosition(position: PlayerPosition): PlayerRole {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "cb":
      return "center_back";
    case "dm":
      return "defensive_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
    case "lw":
      return "winger";
    case "st":
      return "striker";
    case "cm":
    default:
      return "central_midfielder";
  }
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
