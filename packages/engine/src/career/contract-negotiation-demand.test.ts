import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  gameDate,
  nonNegativeMoney,
  playerContractId,
  playerId,
  seniorSquadRegistrationId,
  type CareerState,
  type PlayerAbilities,
  type PlayerId,
} from "@game/domain";

import {
  ContractDemandError,
  deriveContractDemand as deriveContractDemandWithPolicy,
  evaluateContractOffer,
} from "./contract-negotiation-demand.ts";
import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";
import { createRenewalNegotiationId } from "./contract-negotiation.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";

function deriveContractDemand(
  input: Omit<
    Parameters<typeof deriveContractDemandWithPolicy>[0],
    "wagePolicy" | "publicAssessment"
  > & { readonly publicAssessment?: PublicPlayerAssessment },
) {
  const { publicAssessment, ...demandInput } = input;
  return deriveContractDemandWithPolicy({
    ...demandInput,
    publicAssessment: publicAssessment ?? publicAssessmentFixture({
      playerId: demandInput.playerId,
      assessedOn: demandInput.evaluatedOn,
    }),
    wagePolicy: playerWagePolicyConfigFixture(),
  });
}

/** Demand tests compare football contexts rather than opaque random outcomes. */

test("demand is deterministic and distinguishes age, club level, and free-agent leverage", () => {
  const base = demandCareer();
  const young = deriveContractDemand({ careerState: base, playerId: PLAYER, clubId: CLUB, evaluatedOn: TODAY });
  const repeated = deriveContractDemand({ careerState: base, playerId: PLAYER, clubId: CLUB, evaluatedOn: TODAY });
  assert.deepEqual(repeated, young);
  assert.equal(young.preferredTerms.durationYears, 4);
  assert.equal(young.publicPotentialP50Ability, 12);

  const veteranState = withPlayerAge(base, 34);
  const veteran = deriveContractDemand({
    careerState: veteranState,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
    publicAssessment: publicAssessmentFixture({ age: 34, p50Ability: 10 }),
  });
  assert.equal(veteran.preferredTerms.durationYears, 1);

  const strongClubState: CareerState = {
    ...base,
    gameState: {
      ...base.gameState,
      clubs: {
        ...base.gameState.clubs,
        [CLUB]: { ...base.gameState.clubs[CLUB]!, category: "first_division", reputation: 18 },
      },
    },
  };
  const strongClub = deriveContractDemand({ careerState: strongClubState, playerId: PLAYER, clubId: CLUB, evaluatedOn: TODAY });
  assert.ok(strongClub.preferredTerms.annualWage > young.preferredTerms.annualWage);

  const freeAgent = deriveContractDemand({
    careerState: base,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
    isFreeAgent: true,
  });
  assert.equal(freeAgent.currentAnnualWage, 0);
  assert.equal(freeAgent.remainingContractDays, 0);
  assert.equal(freeAgent.freeAgentLeverageBasisPoints, 1_200);
});

test("uses public P50 rather than the stored ceiling for prospect terms", () => {
  const careerState = withStrongerSquadPeers(demandCareer(), 9);
  const narrow = deriveContractDemand({
    careerState,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
    publicAssessment: publicAssessmentFixture({ p50Ability: 10 }),
  });
  const expectedUpside = deriveContractDemand({
    careerState,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
    publicAssessment: publicAssessmentFixture({ p50Ability: 17, upperAbility: 17 }),
  });

  assert.equal(narrow.publicPotentialP50Ability, 10);
  assert.equal(narrow.expectedSquadStatus, "regular_starter");
  assert.equal(expectedUpside.publicPotentialP50Ability, 17);
  assert.equal(expectedUpside.expectedSquadStatus, "prospect");
  assert.ok(expectedUpside.preferredTerms.durationYears > narrow.preferredTerms.durationYears);

  const wageBaselineState = demandCareer();
  const currentOnlyWage = deriveContractDemand({
    careerState: wageBaselineState,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
    publicAssessment: publicAssessmentFixture({ p50Ability: 10 }),
  });
  const expectedUpsideWage = deriveContractDemand({
    careerState: wageBaselineState,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
    publicAssessment: publicAssessmentFixture({ p50Ability: 17, upperAbility: 17 }),
  });
  assert.ok(
    expectedUpsideWage.preferredTerms.annualWage
      > currentOnlyWage.preferredTerms.annualWage,
  );
});

test("rejects a public assessment for another player or date", () => {
  const careerState = demandCareer();
  assert.throws(
    () => deriveContractDemand({
      careerState,
      playerId: PLAYER,
      clubId: CLUB,
      evaluatedOn: TODAY,
      publicAssessment: publicAssessmentFixture({ playerId: playerId("player:other") }),
    }),
    (error) => error instanceof ContractDemandError
      && error.code === "public_assessment_player_mismatch",
  );
  assert.throws(
    () => deriveContractDemand({
      careerState,
      playerId: PLAYER,
      clubId: CLUB,
      evaluatedOn: TODAY,
      publicAssessment: publicAssessmentFixture({ assessedOn: gameDate(TODAY - 1) }),
    }),
    (error) => error instanceof ContractDemandError
      && error.code === "public_assessment_date_mismatch",
  );
});

test("evaluation considers every supported term and returns stable reasons", () => {
  const careerState = demandCareer();
  const demand = deriveContractDemand({ careerState, playerId: PLAYER, clubId: CLUB, evaluatedOn: TODAY });
  const preferred = evaluateContractOffer({
    worldSeed: "demand-test",
    negotiationId: createRenewalNegotiationId(PLAYER, 1),
    evaluatedOn: TODAY,
    offer: demand.preferredTerms,
    demand,
  });
  assert.equal(preferred.decision, "accepted");
  assert.deepEqual(preferred.reasons, ["meets_all_demands"]);

  const poor = evaluateContractOffer({
    worldSeed: "demand-test",
    negotiationId: createRenewalNegotiationId(PLAYER, 1),
    evaluatedOn: TODAY,
    offer: {
      durationYears: 1,
      annualWage: nonNegativeMoney(1_00),
      squadStatus: "fringe_player",
      bonuses: { signingBonus: nonNegativeMoney(0), appearanceBonus: nonNegativeMoney(0) },
    },
    demand,
  });
  assert.equal(poor.decision, "rejected");
  assert.ok(poor.reasons.includes("annual_wage_below_demand"));
  assert.ok(poor.reasons.includes("duration_below_demand"));
  assert.ok(poor.reasons.includes("squad_status_below_expectation"));
  assert.ok(poor.reasons.includes("signing_bonus_below_demand"));
  assert.ok(poor.reasons.includes("appearance_bonus_below_demand"));
  assert.ok(poor.reasons.includes("goal_bonus_below_demand"));
});

const CLUB = clubId("club:demand");
const PLAYER = playerId("player:demand");
const CONTRACT = playerContractId("contract:demand");
const REGISTRATION = seniorSquadRegistrationId("registration:demand");
const TODAY = gameDate(20_000);

function demandCareer(): CareerState {
  const abilities = abilitySet(10);
  return createCareerState({
    saveId: "save:demand" as CareerState["saveId"],
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: CLUB,
    gameState: {
      meta: { seed: "demand-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
      calendar: { currentDate: TODAY, currentSeasonId: "season:demand" as CareerState["gameState"]["calendar"]["currentSeasonId"] },
      players: {
        [PLAYER]: {
          id: PLAYER,
          firstName: "Youth",
          lastName: "Prospect",
          birthDate: gameDate(TODAY - 18 * 365),
          naturalPositions: ["st"],
          primaryRole: "striker",
          abilities,
          potential: abilitySet(15),
        },
      },
      playerIds: [PLAYER],
      playerStates: {},
      clubs: {
        [CLUB]: {
          id: CLUB,
          name: "Demand Club",
          shortName: "DC",
          category: "third_division",
          reputation: 5,
          playerIds: [PLAYER],
        },
      },
      clubIds: [CLUB],
      fixtures: {},
      fixtureIds: [],
    },
    transferHistory: [],
    seniorSquadState: {
      registrations: {
        [REGISTRATION]: {
          id: REGISTRATION,
          playerId: PLAYER,
          clubId: CLUB,
          shirtNumber: 9,
          registeredOn: gameDate(19_500),
        },
      },
      registrationIds: [REGISTRATION],
      contracts: {
        [CONTRACT]: {
          id: CONTRACT,
          playerId: PLAYER,
          clubId: CLUB,
          type: "professional",
          startsOn: gameDate(19_500),
          endsOn: gameDate(21_000),
          annualWage: nonNegativeMoney(100_000_00),
          squadStatus: "regular_starter",
          bonuses: { signingBonus: nonNegativeMoney(0), appearanceBonus: nonNegativeMoney(0) },
        },
      },
      contractIds: [CONTRACT],
      activeContractIds: [CONTRACT],
      contractHistory: {},
      contractHistoryEntryIds: [],
    },
  });
}

function withPlayerAge(state: CareerState, age: number): CareerState {
  return {
    ...state,
    gameState: {
      ...state.gameState,
      players: {
        ...state.gameState.players,
        [PLAYER]: { ...state.gameState.players[PLAYER]!, birthDate: gameDate(TODAY - age * 365) },
      },
    },
  };
}

function withStrongerSquadPeers(state: CareerState, peerCount: number): CareerState {
  const players = { ...state.gameState.players };
  const playerIds = [...state.gameState.playerIds];
  const clubPlayerIds: PlayerId[] = [];
  for (let index = 0; index < peerCount; index += 1) {
    const peerId = playerId(`player:demand-peer-${index + 1}`);
    players[peerId] = {
      ...players[PLAYER]!,
      id: peerId,
      firstName: "Senior",
      lastName: `Peer ${index + 1}`,
      abilities: abilitySet(11),
      potential: abilitySet(11),
    };
    playerIds.push(peerId);
    clubPlayerIds.push(peerId);
  }
  return {
    ...state,
    gameState: {
      ...state.gameState,
      players,
      playerIds,
      clubs: {
        ...state.gameState.clubs,
        [CLUB]: {
          ...state.gameState.clubs[CLUB]!,
          playerIds: [...clubPlayerIds, PLAYER],
        },
      },
    },
  };
}

function publicAssessmentFixture(overrides: Partial<PublicPlayerAssessment> = {}): PublicPlayerAssessment {
  return {
    playerId: PLAYER,
    assessedOn: TODAY,
    age: 18,
    roleFamily: "outfield",
    currentAbility: 10,
    p50Ability: 12,
    upperAbility: 15,
    currentRating: { stars: 3 },
    p50Rating: { stars: 3.5 },
    upperRating: { stars: 4.5 },
    ...overrides,
  };
}

function abilitySet(value: number): PlayerAbilities {
  const score = abilityValue(value);
  return {
    technical: { finishing: score, passing: score, longPassing: score, crossing: score, dribbling: score, technique: score, tackling: score, penalties: score, freeKicks: score },
    physical: { pace: score, strength: score, stamina: score, agility: score, heading: score },
    mental: { positioning: score, vision: score, anticipation: score, composure: score, determination: score, leadership: score },
    goalkeeping: { reflexes: score, handling: score, rushingOut: score, goalkeeperPositioning: score, footwork: score },
  };
}
