import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerContractHistoryEntryId, playerContractId, playerId, seasonId, seniorSquadRegistrationId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import type { GameState } from "../state/game-state.ts";
import {
  activateRenewedPlayerContract,
  activateRenewedPlayerContracts,
  createSeniorSquadState,
  SeniorSquadStateError,
  type SeniorSquadState,
} from "./senior-squad.ts";

test("senior squad state preserves one registration and active contract per owned player", () => {
  const state = createSeniorSquadState(gameStateFixture(), seniorSquadFixture());

  assert.deepEqual(state.registrationIds, [seniorSquadRegistrationId("registration:club-01-player-01")]);
  assert.deepEqual(state.activeContractIds, [playerContractId("contract:player-01-initial")]);
  assert.equal(state.registrations[state.registrationIds[0]!]?.shirtNumber, 9);
  assert.equal(state.contractHistory[state.contractHistoryEntryIds[0]!]!.event, "signed");
});

test("senior squad state rejects duplicate shirts and missing owned-player contracts", () => {
  const gameState = gameStateFixture(true);
  const fixture = seniorSquadFixture();
  const secondRegistrationId = seniorSquadRegistrationId("registration:club-01-player-02");

  assert.throws(
    () => createSeniorSquadState(gameState, {
      ...fixture,
      registrations: {
        ...fixture.registrations,
        [secondRegistrationId]: {
          id: secondRegistrationId,
          clubId: clubId("club:01"),
          playerId: playerId("player:02"),
          shirtNumber: 9,
          registeredOn: gameDate(20_000),
        },
      },
      registrationIds: [...fixture.registrationIds, secondRegistrationId],
    }),
    (error) => error instanceof SeniorSquadStateError && error.code === "duplicate_shirt_number",
  );

  assert.throws(
    () => createSeniorSquadState(gameState, {
      ...fixture,
      registrations: {
        ...fixture.registrations,
        [secondRegistrationId]: {
          id: secondRegistrationId,
          clubId: clubId("club:01"),
          playerId: playerId("player:02"),
          shirtNumber: 10,
          registeredOn: gameDate(20_000),
        },
      },
      registrationIds: [...fixture.registrationIds, secondRegistrationId],
    }),
    (error) => error instanceof SeniorSquadStateError && error.code === "owned_player_active_contract_missing",
  );
});

test("senior squad state rejects a registration for a historical inactive player", () => {
  const gameState = gameStateFixture();

  assert.throws(
    () => createSeniorSquadState(
      { ...gameState, playerIds: [] },
      seniorSquadFixture(),
    ),
    (error) => error instanceof SeniorSquadStateError && error.code === "registration_player_not_active",
  );
});

test("accepted renewal replaces one active contract and appends canonical history", () => {
  const gameState = gameStateFixture();
  const state = createSeniorSquadState(gameState, seniorSquadFixture());
  const previousContractId = state.activeContractIds[0]!;
  const contractId = playerContractId("contract:player-01-renewed");
  const historyId = playerContractHistoryEntryId("contract-history:player-01-renewed");
  const contract = {
    ...state.contracts[previousContractId]!,
    id: contractId,
    startsOn: gameDate(20_200),
    endsOn: gameDate(21_600),
    annualWage: nonNegativeMoney(75_000_00),
  };

  const renewed = activateRenewedPlayerContract(gameState, state, {
    previousContractId,
    contract,
    historyEntry: {
      id: historyId,
      sequenceNumber: 2,
      occurredOn: gameDate(20_200),
      event: "renewed",
      contractId,
      playerId: contract.playerId,
      clubId: contract.clubId,
    },
  });

  assert.deepEqual(renewed.activeContractIds, [contractId]);
  assert.deepEqual(renewed.contractIds, [previousContractId, contractId]);
  assert.equal(renewed.contractHistory[historyId]?.event, "renewed");
  assert.equal(createSeniorSquadState(gameState, renewed), renewed);
});

test("renewal batch is atomic and matches ordered single-contract activation", () => {
  const gameState = gameStateFixture();
  const state = createSeniorSquadState(gameState, seniorSquadFixture());
  const initialContractId = state.activeContractIds[0]!;
  const firstContractId = playerContractId("contract:player-01-renewed-first");
  const secondContractId = playerContractId("contract:player-01-renewed-second");
  const firstInput = {
    previousContractId: initialContractId,
    contract: {
      ...state.contracts[initialContractId]!,
      id: firstContractId,
      startsOn: gameDate(20_200),
      endsOn: gameDate(21_600),
    },
    historyEntry: {
      id: playerContractHistoryEntryId("contract-history:player-01-renewed-first"),
      sequenceNumber: 2,
      occurredOn: gameDate(20_200),
      event: "renewed" as const,
      contractId: firstContractId,
      playerId: playerId("player:01"),
      clubId: clubId("club:01"),
    },
  };
  const secondInput = {
    previousContractId: firstContractId,
    contract: {
      ...firstInput.contract,
      id: secondContractId,
      startsOn: gameDate(20_400),
      endsOn: gameDate(22_000),
    },
    historyEntry: {
      id: playerContractHistoryEntryId("contract-history:player-01-renewed-second"),
      sequenceNumber: 3,
      occurredOn: gameDate(20_400),
      event: "renewed" as const,
      contractId: secondContractId,
      playerId: playerId("player:01"),
      clubId: clubId("club:01"),
    },
  };
  const sequential = activateRenewedPlayerContract(
    gameState,
    activateRenewedPlayerContract(gameState, state, firstInput),
    secondInput,
  );
  const batched = activateRenewedPlayerContracts(gameState, state, [firstInput, secondInput]);

  assert.deepEqual(batched, sequential);
  assert.throws(
    () => activateRenewedPlayerContracts(gameState, state, [
      firstInput,
      { ...secondInput, historyEntry: { ...secondInput.historyEntry, sequenceNumber: 99 } },
    ]),
    (error) => error instanceof SeniorSquadStateError && error.code === "history_contract_mismatch",
  );
  assert.deepEqual(state.activeContractIds, [initialContractId]);
  assert.equal(state.contracts[firstContractId], undefined);
});

test("a renewal may graduate a youth agreement but never downgrade a professional one", () => {
  const gameState = gameStateFixture();
  const youthFixture = seniorSquadFixture("youth");
  const youthState = createSeniorSquadState(gameState, youthFixture);
  const youthContractId = youthState.activeContractIds[0]!;
  const professionalContractId = playerContractId("contract:player-01-professional");
  const professionalHistoryId = playerContractHistoryEntryId("contract-history:player-01-professional");
  const professionalContract = {
    ...youthState.contracts[youthContractId]!,
    id: professionalContractId,
    type: "professional" as const,
    startsOn: gameDate(20_200),
    endsOn: gameDate(21_600),
  };

  const graduated = activateRenewedPlayerContract(gameState, youthState, {
    previousContractId: youthContractId,
    contract: professionalContract,
    historyEntry: {
      id: professionalHistoryId,
      sequenceNumber: 2,
      occurredOn: gameDate(20_200),
      event: "renewed",
      contractId: professionalContractId,
      playerId: professionalContract.playerId,
      clubId: professionalContract.clubId,
    },
  });

  assert.equal(graduated.contracts[professionalContractId]?.type, "professional");
  assert.throws(
    () => activateRenewedPlayerContract(gameState, createSeniorSquadState(gameState, seniorSquadFixture()), {
      previousContractId: playerContractId("contract:player-01-initial"),
      contract: {
        ...professionalContract,
        id: playerContractId("contract:player-01-invalid-youth"),
        type: "youth",
      },
      historyEntry: {
        id: playerContractHistoryEntryId("contract-history:player-01-invalid-youth"),
        sequenceNumber: 2,
        occurredOn: gameDate(20_200),
        event: "renewed",
        contractId: playerContractId("contract:player-01-invalid-youth"),
        playerId: professionalContract.playerId,
        clubId: professionalContract.clubId,
      },
    }),
    (error) => error instanceof SeniorSquadStateError && error.code === "active_contract_ownership_mismatch",
  );
});

function seniorSquadFixture(type: "professional" | "youth" = "professional"): SeniorSquadState {
  const registrationId = seniorSquadRegistrationId("registration:club-01-player-01");
  const contractId = playerContractId("contract:player-01-initial");
  const historyId = playerContractHistoryEntryId("contract-history:player-01-initial");
  return {
    registrations: {
      [registrationId]: {
        id: registrationId,
        clubId: clubId("club:01"),
        playerId: playerId("player:01"),
        shirtNumber: 9,
        registeredOn: gameDate(20_000),
      },
    },
    registrationIds: [registrationId],
    contracts: {
      [contractId]: {
        id: contractId,
        clubId: clubId("club:01"),
        playerId: playerId("player:01"),
        type,
        startsOn: gameDate(19_600),
        endsOn: gameDate(20_800),
        annualWage: nonNegativeMoney(60_000_00),
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: nonNegativeMoney(5_000_00),
          appearanceBonus: nonNegativeMoney(500_00),
          goalBonus: nonNegativeMoney(750_00),
        },
      },
    },
    contractIds: [contractId],
    activeContractIds: [contractId],
    contractHistory: {
      [historyId]: {
        id: historyId,
        sequenceNumber: 1,
        occurredOn: gameDate(19_600),
        event: "signed",
        contractId,
        clubId: clubId("club:01"),
        playerId: playerId("player:01"),
      },
    },
    contractHistoryEntryIds: [historyId],
  };
}

function gameStateFixture(withSecondPlayer = false): GameState {
  const first = playerId("player:01");
  const second = playerId("player:02");
  const players = {
    [first]: playerFixture(first),
    ...(withSecondPlayer ? { [second]: playerFixture(second) } : {}),
  };
  const playerIds = withSecondPlayer ? [first, second] : [first];
  return {
    meta: { seed: "senior-squad-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: seasonId("season:test") },
    players,
    playerIds,
    playerStates: {},
    clubs: {
      [clubId("club:01")]: {
        id: clubId("club:01"),
        name: "Club 01",
        shortName: "C01",
        category: "third_division",
        reputation: 5,
        playerIds,
      },
    },
    clubIds: [clubId("club:01")],
    fixtures: {},
    fixtureIds: [],
  };
}

function playerFixture(id: ReturnType<typeof playerId>): GameState["players"][ReturnType<typeof playerId>] {
  const abilities = {
    technical: { finishing: 10, passing: 10, longPassing: 10, crossing: 10, dribbling: 10, technique: 10, tackling: 10, penalties: 10, freeKicks: 10 },
    physical: { pace: 10, strength: 10, stamina: 10, agility: 10, heading: 10 },
    mental: { positioning: 10, vision: 10, anticipation: 10, composure: 10, determination: 10, leadership: 10 },
    goalkeeping: { reflexes: 0, handling: 0, rushingOut: 0, goalkeeperPositioning: 0, footwork: 0 },
  } as GameState["players"][ReturnType<typeof playerId>]["abilities"];
  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: ["st"],
    primaryRole: "striker",
    abilities,
    potential: abilities,
  };
}
