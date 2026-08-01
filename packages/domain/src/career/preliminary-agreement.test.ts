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
import { createNegotiationStageClock } from "./negotiation-stage-clock.ts";
import {
  createPreliminaryAgreementState,
  preliminaryAgreementId,
  publishPreliminaryAgreement,
  type PreliminaryAgreementState,
  type SubmittedPreliminaryAgreement,
} from "./preliminary-agreement.ts";
import { createSeniorSquadState } from "./senior-squad.ts";

const PLAYER = playerId("player:preliminary-target");
const CURRENT_CLUB = clubId("club:current");
const OFFERING_CLUB = clubId("club:offering");
const CONTRACT = playerContractId("contract:preliminary-target-current");
const AGREEMENT = preliminaryAgreementId("preliminary-agreement:target-01");
const SECOND_AGREEMENT = preliminaryAgreementId("preliminary-agreement:target-02");

test("preliminary agreement preserves current ownership and exact future start", () => {
  const gameState = gameStateFixture();
  const seniorSquadState = seniorSquadFixture(gameState);
  const state = createPreliminaryAgreementState(
    gameState,
    seniorSquadState,
    agreementState(submittedAgreement(AGREEMENT)),
  );

  assert.equal(state.agreements[AGREEMENT]?.futureStartsOn, gameDate(20_180));
  assert.deepEqual(gameState.clubs[CURRENT_CLUB]?.playerIds, [PLAYER]);
  assert.deepEqual(gameState.clubs[OFFERING_CLUB]?.playerIds, []);
  assert.deepEqual(seniorSquadState.activeContractIds, [CONTRACT]);
});

test("one player cannot hold two live future agreements", () => {
  const gameState = gameStateFixture();
  const seniorSquadState = seniorSquadFixture(gameState);
  assert.throws(() => createPreliminaryAgreementState(gameState, seniorSquadState, {
    agreements: {
      [AGREEMENT]: submittedAgreement(AGREEMENT),
      [SECOND_AGREEMENT]: submittedAgreement(SECOND_AGREEMENT),
    },
    agreementIds: [AGREEMENT, SECOND_AGREEMENT],
  }));
});

test("future terms cannot overlap or drift from current contract expiry", () => {
  const gameState = gameStateFixture();
  const seniorSquadState = seniorSquadFixture(gameState);
  assert.throws(() => createPreliminaryAgreementState(
    gameState,
    seniorSquadState,
    agreementState({
      ...submittedAgreement(AGREEMENT),
      futureStartsOn: gameDate(20_179),
    }),
  ));
});

test("publishing a terminal outcome keeps the immutable agreement identity", () => {
  const gameState = gameStateFixture();
  const seniorSquadState = seniorSquadFixture(gameState);
  const initial = createPreliminaryAgreementState(
    gameState,
    seniorSquadState,
    agreementState(submittedAgreement(AGREEMENT)),
  );
  const withdrawn = publishPreliminaryAgreement(
    gameState,
    seniorSquadState,
    initial,
    {
      id: AGREEMENT,
      playerId: PLAYER,
      currentClubId: CURRENT_CLUB,
      offeringClubId: OFFERING_CLUB,
      currentContractId: CONTRACT,
      createdOn: gameDate(20_000),
      futureStartsOn: gameDate(20_180),
      status: "withdrawn",
      withdrawnOn: gameDate(20_001),
    },
  );

  assert.equal(withdrawn.agreements[AGREEMENT]?.status, "withdrawn");
  assert.deepEqual(withdrawn.agreementIds, [AGREEMENT]);
});

function agreementState(agreement: SubmittedPreliminaryAgreement): PreliminaryAgreementState {
  return { agreements: { [agreement.id]: agreement }, agreementIds: [agreement.id] };
}

function submittedAgreement(id: ReturnType<typeof preliminaryAgreementId>): SubmittedPreliminaryAgreement {
  const terms = {
    durationYears: 3,
    annualWage: nonNegativeMoney(90_000_00),
    squadStatus: "regular_starter" as const,
    bonuses: {
      signingBonus: nonNegativeMoney(9_000_00),
      appearanceBonus: nonNegativeMoney(900_00),
    },
  };
  return {
    id,
    playerId: PLAYER,
    currentClubId: CURRENT_CLUB,
    offeringClubId: OFFERING_CLUB,
    currentContractId: CONTRACT,
    createdOn: gameDate(20_000),
    futureStartsOn: gameDate(20_180),
    status: "offer_submitted",
    offeredTerms: terms,
    demand: {
      evaluatedOn: gameDate(20_000),
      age: 27,
      currentAbility: 10,
      publicPotentialP50Ability: 11,
      role: "striker",
      expectedSquadStatus: "regular_starter",
      currentAnnualWage: nonNegativeMoney(60_000_00),
      remainingContractDays: 180,
      clubReputation: 6,
      clubCategory: "third_division",
      freeAgentLeverageBasisPoints: 0,
      preferredTerms: terms,
      minimumTerms: terms,
    },
    clock: createNegotiationStageClock({
      submittedOn: gameDate(20_000),
      responseDelayDays: 2,
      mustResolveBy: gameDate(20_179),
    }),
  };
}

function seniorSquadFixture(gameState: GameState) {
  const registration = seniorSquadRegistrationId("registration:preliminary-target-current");
  const history = playerContractHistoryEntryId("contract-history:preliminary-target-current");
  return createSeniorSquadState(gameState, {
    registrations: {
      [registration]: {
        id: registration,
        playerId: PLAYER,
        clubId: CURRENT_CLUB,
        shirtNumber: 9,
        registeredOn: gameDate(19_800),
      },
    },
    registrationIds: [registration],
    contracts: {
      [CONTRACT]: {
        id: CONTRACT,
        playerId: PLAYER,
        clubId: CURRENT_CLUB,
        type: "professional",
        startsOn: gameDate(19_800),
        endsOn: gameDate(20_180),
        annualWage: nonNegativeMoney(60_000_00),
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: nonNegativeMoney(5_000_00),
          appearanceBonus: nonNegativeMoney(500_00),
        },
      },
    },
    contractIds: [CONTRACT],
    activeContractIds: [CONTRACT],
    contractHistory: {
      [history]: {
        id: history,
        sequenceNumber: 1,
        occurredOn: gameDate(19_800),
        event: "signed",
        contractId: CONTRACT,
        playerId: PLAYER,
        clubId: CURRENT_CLUB,
      },
    },
    contractHistoryEntryIds: [history],
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
    meta: { seed: "preliminary-agreement-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: seasonId("season:test") },
    players: {
      [PLAYER]: {
        id: PLAYER,
        firstName: "Future",
        lastName: "Signing",
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
      [CURRENT_CLUB]: {
        id: CURRENT_CLUB,
        name: "Current Club",
        shortName: "CUR",
        category: "third_division",
        reputation: 5,
        playerIds: [PLAYER],
      },
      [OFFERING_CLUB]: {
        id: OFFERING_CLUB,
        name: "Offering Club",
        shortName: "OFF",
        category: "third_division",
        reputation: 6,
        playerIds: [],
      },
    },
    clubIds: [CURRENT_CLUB, OFFERING_CLUB],
    fixtures: {},
    fixtureIds: [],
  };
}
