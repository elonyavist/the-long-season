import assert from "node:assert/strict";
import { test } from "vitest";

import type { GameState } from "../state/game-state.ts";
import {
  clubId,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  seasonId,
  seniorSquadRegistrationId,
} from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import { createSeniorSquadState, type SeniorSquadState } from "./senior-squad.ts";
import {
  ContractNegotiationStateError,
  contractNegotiationId,
  createContractNegotiationState,
  publishContractNegotiation,
  publishContractNegotiations,
  type AcceptedContractNegotiation,
  type ContractNegotiationState,
  type ContractOfferEvaluation,
  type ContractOfferTerms,
} from "./contract-negotiation.ts";

/** Domain tests keep malformed negotiation snapshots out of every adapter. */

test("contract negotiation state preserves one open renewal per player and club", () => {
  const gameState = gameStateFixture();
  const seniorSquad = seniorSquadFixture(gameState);
  const state = createContractNegotiationState(gameState, seniorSquad, negotiationFixture());

  assert.deepEqual(state.negotiationIds, [NEGOTIATION]);
  assert.equal(state.negotiations[NEGOTIATION]?.status, "draft");

  assert.throws(
    () => createContractNegotiationState(gameState, seniorSquad, {
      negotiations: {
        ...state.negotiations,
        [SECOND_NEGOTIATION]: {
          ...state.negotiations[NEGOTIATION]!,
          id: SECOND_NEGOTIATION,
        },
      },
      negotiationIds: [NEGOTIATION, SECOND_NEGOTIATION],
    }),
    (error) => error instanceof ContractNegotiationStateError && error.code === "duplicate_open_negotiation",
  );
});

test("contract negotiation state rejects unsupported duration and negative money", () => {
  const gameState = gameStateFixture();
  const seniorSquad = seniorSquadFixture(gameState);
  const fixture = negotiationFixture();
  const draft = fixture.negotiations[NEGOTIATION];
  assert.ok(draft?.status === "draft");

  assert.throws(
    () => createContractNegotiationState(gameState, seniorSquad, {
      negotiations: {
        [NEGOTIATION]: {
          ...draft,
          draft: {
            ...draft.draft,
            terms: { ...draft.draft.terms, durationYears: 6 },
          },
        },
      },
      negotiationIds: [NEGOTIATION],
    }),
    (error) => error instanceof ContractNegotiationStateError && error.code === "invalid_offer_terms",
  );
});

test("publishing one response transition preserves canonical negotiation state", () => {
  const gameState = gameStateFixture();
  const seniorSquad = seniorSquadFixture(gameState);
  const state = createContractNegotiationState(gameState, seniorSquad, negotiationFixture());
  const draft = state.negotiations[NEGOTIATION];
  assert.ok(draft?.status === "draft");
  const awaiting = {
    id: draft.id,
    playerId: draft.playerId,
    clubId: draft.clubId,
    currentContractId: draft.currentContractId,
    createdOn: draft.createdOn,
    status: "awaiting_response" as const,
    submittedOffer: {
      submittedOn: gameDate(20_001),
      responseDueOn: gameDate(20_004),
      terms: draft.draft.terms,
    },
  };

  const published = publishContractNegotiation(
    gameState,
    seniorSquad,
    state,
    awaiting,
  );

  assert.equal(published.negotiations[NEGOTIATION]?.status, "awaiting_response");
  assert.equal(createContractNegotiationState(gameState, seniorSquad, published), published);
});

test("publishing a negotiation batch commits all valid rows through one snapshot", () => {
  const gameState = gameStateFixture();
  const seniorSquad = seniorSquadFixture(gameState);
  const state = createContractNegotiationState(gameState, seniorSquad, negotiationFixture());
  const draft = state.negotiations[NEGOTIATION];
  assert.ok(draft?.status === "draft");
  const awaiting = {
    id: draft.id,
    playerId: draft.playerId,
    clubId: draft.clubId,
    currentContractId: draft.currentContractId,
    createdOn: draft.createdOn,
    status: "awaiting_response" as const,
    submittedOffer: {
      submittedOn: gameDate(20_001),
      responseDueOn: gameDate(20_004),
      terms: draft.draft.terms,
    },
  };
  const release = {
    id: SECOND_NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    currentContractId: CURRENT_CONTRACT,
    createdOn: gameDate(20_002),
    status: "release_at_expiry" as const,
    decidedOn: gameDate(20_002),
  };

  const published = publishContractNegotiations(gameState, seniorSquad, state, [
    { negotiation: awaiting },
    { negotiation: release, append: true },
  ]);

  assert.deepEqual(published.negotiationIds, [NEGOTIATION, SECOND_NEGOTIATION]);
  assert.equal(published.negotiations[NEGOTIATION]?.status, "awaiting_response");
  assert.equal(published.negotiations[SECOND_NEGOTIATION]?.status, "release_at_expiry");
  assert.equal(createContractNegotiationState(gameState, seniorSquad, published), published);
});

test("publishing a negotiation batch rejects duplicate open talks atomically", () => {
  const gameState = gameStateFixture();
  const seniorSquad = seniorSquadFixture(gameState);
  const state = createContractNegotiationState(gameState, seniorSquad, negotiationFixture());
  const draft = state.negotiations[NEGOTIATION];
  assert.ok(draft?.status === "draft");

  assert.throws(
    () => publishContractNegotiations(gameState, seniorSquad, state, [{
      append: true,
      negotiation: {
        ...draft,
        id: SECOND_NEGOTIATION,
      },
    }]),
    (error) => error instanceof ContractNegotiationStateError && error.code === "duplicate_open_negotiation",
  );
  assert.deepEqual(state.negotiationIds, [NEGOTIATION]);
  assert.equal(state.negotiations[SECOND_NEGOTIATION], undefined);
});

test("accepted renewal must point to the matching active replacement contract", () => {
  const gameState = gameStateFixture();
  const initial = seniorSquadFixture(gameState);
  const renewedContractId = playerContractId("contract:player-01-renewal-20005");
  const renewedHistoryId = playerContractHistoryEntryId("contract-history:player-01-renewal-20005");
  const renewedSquad = createSeniorSquadState(gameState, {
    ...initial,
    contracts: {
      ...initial.contracts,
      [renewedContractId]: {
        ...initial.contracts[CURRENT_CONTRACT]!,
        id: renewedContractId,
        startsOn: gameDate(20_005),
        endsOn: gameDate(21_100),
      },
    },
    contractIds: [...initial.contractIds, renewedContractId],
    activeContractIds: [renewedContractId],
    contractHistory: {
      ...initial.contractHistory,
      [renewedHistoryId]: {
        id: renewedHistoryId,
        sequenceNumber: 2,
        occurredOn: gameDate(20_005),
        event: "renewed",
        contractId: renewedContractId,
        playerId: PLAYER,
        clubId: CLUB,
      },
    },
    contractHistoryEntryIds: [...initial.contractHistoryEntryIds, renewedHistoryId],
  });
  const accepted = acceptedNegotiation(renewedContractId);
  const state = createContractNegotiationState(gameState, renewedSquad, {
    negotiations: { [NEGOTIATION]: accepted },
    negotiationIds: [NEGOTIATION],
  });

  assert.equal(state.negotiations[NEGOTIATION]?.status, "accepted");

  assert.throws(
    () => createContractNegotiationState(gameState, initial, {
      negotiations: { [NEGOTIATION]: accepted },
      negotiationIds: [NEGOTIATION],
    }),
    (error) => error instanceof ContractNegotiationStateError && error.code === "accepted_contract_not_found",
  );
});

const PLAYER = playerId("player:01");
const CLUB = clubId("club:01");
const CURRENT_CONTRACT = playerContractId("contract:player-01-initial");
const NEGOTIATION = contractNegotiationId("contract-negotiation:player-01-renewal-01");
const SECOND_NEGOTIATION = contractNegotiationId("contract-negotiation:player-01-renewal-02");

function offerTerms(): ContractOfferTerms {
  return {
    durationYears: 3,
    annualWage: nonNegativeMoney(90_000_00),
    squadStatus: "regular_starter",
    bonuses: {
      signingBonus: nonNegativeMoney(9_000_00),
      appearanceBonus: nonNegativeMoney(900_00),
      goalBonus: nonNegativeMoney(1_200_00),
    },
  };
}

function negotiationFixture(): ContractNegotiationState {
  return {
    negotiations: {
      [NEGOTIATION]: {
        id: NEGOTIATION,
        playerId: PLAYER,
        clubId: CLUB,
        currentContractId: CURRENT_CONTRACT,
        createdOn: gameDate(20_000),
        status: "draft",
        draft: { createdOn: gameDate(20_000), terms: offerTerms() },
      },
    },
    negotiationIds: [NEGOTIATION],
  };
}

function acceptedNegotiation(activatedContractId: ReturnType<typeof playerContractId>): AcceptedContractNegotiation {
  const terms = offerTerms();
  return {
    id: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    currentContractId: CURRENT_CONTRACT,
    createdOn: gameDate(20_000),
    status: "accepted",
    submittedOffer: { submittedOn: gameDate(20_000), responseDueOn: gameDate(20_005), terms },
    acceptedOn: gameDate(20_005),
    acceptedTerms: terms,
    acceptedSource: "submitted_offer",
    evaluation: evaluationFixture(terms),
    activatedContractId,
  };
}

function evaluationFixture(terms: ContractOfferTerms): ContractOfferEvaluation {
  return {
    decision: "accepted",
    scoreBasisPoints: 10_000,
    reasons: ["meets_all_demands"],
    demand: {
      evaluatedOn: gameDate(20_005),
      age: 27,
      currentAbility: 10,
      reachablePotential: 11,
      role: "striker",
      expectedSquadStatus: "regular_starter",
      currentAnnualWage: nonNegativeMoney(60_000_00),
      remainingContractDays: 795,
      clubReputation: 5,
      clubCategory: "third_division",
      freeAgentLeverageBasisPoints: 0,
      preferredTerms: terms,
      minimumTerms: terms,
    },
  };
}

function seniorSquadFixture(gameState: GameState): SeniorSquadState {
  const registrationId = seniorSquadRegistrationId("registration:club-01-player-01");
  const historyId = playerContractHistoryEntryId("contract-history:player-01-initial");
  return createSeniorSquadState(gameState, {
    registrations: {
      [registrationId]: {
        id: registrationId,
        clubId: CLUB,
        playerId: PLAYER,
        shirtNumber: 9,
        registeredOn: gameDate(20_000),
      },
    },
    registrationIds: [registrationId],
    contracts: {
      [CURRENT_CONTRACT]: {
        id: CURRENT_CONTRACT,
        clubId: CLUB,
        playerId: PLAYER,
        type: "professional",
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
    contractIds: [CURRENT_CONTRACT],
    activeContractIds: [CURRENT_CONTRACT],
    contractHistory: {
      [historyId]: {
        id: historyId,
        sequenceNumber: 1,
        occurredOn: gameDate(19_600),
        event: "signed",
        contractId: CURRENT_CONTRACT,
        clubId: CLUB,
        playerId: PLAYER,
      },
    },
    contractHistoryEntryIds: [historyId],
  });
}

function gameStateFixture(): GameState {
  const abilities = {
    technical: { finishing: 10, passing: 10, longPassing: 10, crossing: 10, dribbling: 10, technique: 10, tackling: 10, penalties: 10, freeKicks: 10 },
    physical: { pace: 10, strength: 10, stamina: 10, agility: 10, heading: 10 },
    mental: { positioning: 10, vision: 10, anticipation: 10, composure: 10, determination: 10, leadership: 10 },
    goalkeeping: { reflexes: 0, handling: 0, rushingOut: 0, goalkeeperPositioning: 0, footwork: 0 },
  } as GameState["players"][typeof PLAYER]["abilities"];
  return {
    meta: { seed: "contract-negotiation-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: seasonId("season:test") },
    players: {
      [PLAYER]: {
        id: PLAYER,
        firstName: "Test",
        lastName: "Forward",
        birthDate: gameDate(10_150),
        naturalPositions: ["st"],
        primaryRole: "striker",
        abilities,
        potential: abilities,
      },
    },
    playerIds: [PLAYER],
    playerStates: {},
    clubs: {
      [CLUB]: {
        id: CLUB,
        name: "Club 01",
        shortName: "C01",
        category: "third_division",
        reputation: 5,
        playerIds: [PLAYER],
      },
    },
    clubIds: [CLUB],
    fixtures: {},
    fixtureIds: [],
  };
}
