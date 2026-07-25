import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  createCareerState,
  createClubFinanceState,
  createSeniorSquadState,
  gameDate,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerContractId,
  playerId,
  saveId,
  seasonTransferWindows,
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

import {
  advanceAiMarketLifecycle,
  deriveAiMarketNeeds,
} from "./ai-market-lifecycle.ts";

/** Tests for deterministic AI market behavior through canonical negotiations. */

test("deriveAiMarketNeeds orders structural department gaps before softer needs", () => {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, balancedSeniorSquad("seller")),
  ]);

  const needs = deriveAiMarketNeeds({
    careerState,
    asOf: gameDate(20_000),
  });

  assert.equal(needs[0]?.clubId, buyer);
  assert.equal(needs[0]?.reasons[0], "structural_depth");
  assert.equal(needs.filter((need) => need.clubId === buyer).length, 3);
  assert.deepEqual(
    needs.filter((need) => need.clubId === buyer).map((need) => need.department),
    ["defender", "midfielder", "attacker"],
  );
});

test("advanceAiMarketLifecycle starts no permanent negotiation outside a window", () => {
  const careerState = marketFixture();
  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_020),
    transferWindows: marketWindows({
      summer: [19_900, 19_950],
      winter: [20_200, 20_220],
    }),
  });

  assert.equal(result.facts.some((fact) => fact.event === "club_offer_submitted"), false);
  assert.equal(result.careerState.transferNegotiationState?.negotiationIds.length ?? 0, 0);
  assert.equal(result.careerState.transferHistory.length, 0);
});

test("advanceAiMarketLifecycle is deterministic and completes transfers through canonical state", () => {
  const careerState = marketFixture();
  const input = {
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  } as const;

  const first = advanceAiMarketLifecycle(input);
  const second = advanceAiMarketLifecycle(input);

  assert.deepEqual(second, first);
  assert.equal(first.facts.some((fact) => fact.event === "club_offer_submitted"), true);
  assert.equal(first.facts.some((fact) => fact.event === "transfer_completed"), true);
  assert.equal(first.careerState.transferHistory.length > 0, true);
  assert.equal(
    first.careerState.seniorSquadState?.contractHistoryEntryIds.length,
    first.careerState.transferHistory.length * 2,
  );
});

test("advanceAiMarketLifecycle protects the selected club and seller department floors", () => {
  const buyer = clubId("club:buyer");
  const protectedSeller = clubId("club:protected-seller");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(protectedSeller, 6, [
      ...playersForClub("protected-seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ]),
    ]),
  ]);
  const selectedClubId = careerState.selectedClubId;
  const selectedBefore = careerState.gameState.clubs[selectedClubId]?.playerIds;
  const protectedBefore = careerState.gameState.clubs[protectedSeller]?.playerIds;
  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  });

  assert.deepEqual(result.careerState.gameState.clubs[selectedClubId]?.playerIds, selectedBefore);
  assert.equal(
    result.facts.some((fact) =>
      fact.buyingClubId === selectedClubId || fact.sellingClubId === selectedClubId
    ),
    false,
  );
  const protectedAfter = result.careerState.gameState.clubs[protectedSeller]?.playerIds ?? [];
  const remainingDefenders = protectedAfter.filter((playerIdValue) =>
    careerState.gameState.players[playerIdValue]?.naturalPositions.includes("cb")
  ).length;
  assert.equal((protectedBefore?.length ?? 0) >= protectedAfter.length, true);
  assert.equal(protectedAfter.length >= 18, true);
  assert.equal(remainingDefenders, 6);
});

function marketFixture(): CareerState {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  return careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, [
      playerFixture(playerId("player:movable"), "cb", 15).id,
      ...playersForClubAtAbility("seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ], 10),
    ]),
  ]);
}

function balancedSeniorSquad(prefix: string): PlayerId[] {
  return playersForClub(prefix, [
    "gk", "gk",
    "cb", "cb", "cb", "cb", "cb", "cb",
    "cm", "cm", "cm", "cm", "cm", "cm", "cm",
    "st", "st", "st", "st", "st", "st",
  ]);
}

function marketWindows(input: {
  readonly summer: readonly [number, number];
  readonly winter: readonly [number, number];
}) {
  return seasonTransferWindows({
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:0001"),
    windows: [
      { opensOn: gameDate(input.summer[0]), closesOn: gameDate(input.summer[1]) },
      { opensOn: gameDate(input.winter[0]), closesOn: gameDate(input.winter[1]) },
    ],
  });
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
