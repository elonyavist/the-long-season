import assert from "node:assert/strict";
import {
  abilityValue,
  CAREER_STATE_SCHEMA_VERSION,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  createCareerState,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  preliminaryAgreementId,
  saveId,
  seasonId,
  seasonTransferWindows,
  seniorSquadRegistrationId,
  stateValue,
  type CareerState,
  type Club,
  type GameDate,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerContract,
  type SeniorSquadState,
} from "@game/domain";
import { test } from "vitest";

import {
  deriveContractDemand as deriveContractDemandWithPolicy,
} from "./contract-negotiation-demand.ts";
import {
  advanceAiContractLifecycle as advanceAiContractLifecycleWithPolicy,
} from "./ai-contract-lifecycle.ts";
import {
  advancePreliminaryAgreementLifecycle as advancePreliminaryAgreementLifecycleWithPolicy,
  submitPreliminaryAgreementOffer as submitPreliminaryAgreementOfferWithPolicy,
} from "./preliminary-agreement.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

const WAGE_POLICY = playerWagePolicyConfigFixture();
const MARKET_BEHAVIOR_POLICY = marketBehaviorConfigFixture();

function deriveContractDemand(
  input: Omit<Parameters<typeof deriveContractDemandWithPolicy>[0], "wagePolicy">,
) {
  return deriveContractDemandWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function advanceAiContractLifecycle(
  input: Omit<
    Parameters<typeof advanceAiContractLifecycleWithPolicy>[0],
    "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return advanceAiContractLifecycleWithPolicy({
    ...input,
    wagePolicy: WAGE_POLICY,
    marketBehaviorPolicy: MARKET_BEHAVIOR_POLICY,
  });
}

function advancePreliminaryAgreementLifecycle(
  input: Omit<
    Parameters<typeof advancePreliminaryAgreementLifecycleWithPolicy>[0],
    "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return advancePreliminaryAgreementLifecycleWithPolicy({
    ...input,
    wagePolicy: WAGE_POLICY,
    marketBehaviorPolicy: MARKET_BEHAVIOR_POLICY,
  });
}

function submitPreliminaryAgreementOffer(
  input: Omit<
    Parameters<typeof submitPreliminaryAgreementOfferWithPolicy>[0],
    "wagePolicy"
  >,
) {
  return submitPreliminaryAgreementOfferWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

const SELLER = clubId("club:preliminary-seller");
const BUYER = clubId("club:preliminary-buyer");
const TARGET = playerId("player:preliminary-target");
const BUYER_PLAYER = playerId("player:preliminary-buyer-player");
const TODAY = gameDate(20_000);

test("preliminary approaches are allowed only in the final 183 days, including outside windows", () => {
  const outsideWindow = closedWindows();
  const tooEarly = careerFixture(gameDate(TODAY + 184));
  const blocked = submit(tooEarly, preliminaryAgreementId("preliminary-agreement:boundary:184"), TODAY);
  assert.equal(blocked.status === "rejected" ? blocked.reason : undefined, "not_in_final_six_months");

  const boundary = careerFixture(gameDate(TODAY + 183));
  const allowed = submit(
    boundary,
    preliminaryAgreementId("preliminary-agreement:boundary:183"),
    TODAY,
    outsideWindow,
  );
  assert.equal(allowed.status, "applied");

  const finalDay = careerFixture(gameDate(TODAY + 1));
  assert.equal(
    submit(finalDay, preliminaryAgreementId("preliminary-agreement:boundary:1"), TODAY).status,
    "applied",
  );

  const expiryDay = careerFixture(TODAY);
  const expired = submit(
    expiryDay,
    preliminaryAgreementId("preliminary-agreement:boundary:0"),
    TODAY,
  );
  assert.equal(expired.status === "rejected" ? expired.reason : undefined, "player_contract_not_found");
});

test("an accepted future agreement changes no ownership, registration, contract, or finance before expiry", () => {
  const contractEnd = gameDate(TODAY + 90);
  const initial = careerFixture(contractEnd);
  const submitted = submit(
    initial,
    preliminaryAgreementId("preliminary-agreement:no-early-move"),
    TODAY,
  );
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.agreement.status !== "offer_submitted") return;

  const agreed = advancePreliminaryAgreementLifecycle({
    careerState: submitted.careerState,
    throughDate: submitted.agreement.clock.responseDueOn,
  });
  const agreement = agreed.careerState.preliminaryAgreementState?.agreements[submitted.agreement.id];
  assert.equal(agreement?.status, "agreed");
  assert.equal(agreed.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), true);
  assert.equal(agreed.careerState.gameState.clubs[BUYER]?.playerIds.includes(TARGET), false);
  assert.equal(activeContract(agreed.careerState, TARGET)?.clubId, SELLER);
  assert.equal(
    agreed.careerState.clubFinanceState?.accounts[BUYER]?.cashBalance,
    initial.clubFinanceState?.accounts[BUYER]?.cashBalance,
  );
  assert.equal(
    agreed.careerState.clubFinanceState?.ledgerEntryIds.length,
    initial.clubFinanceState?.ledgerEntryIds.length,
  );
});

test("expiry activation is atomic, fee-free, financed once, and idempotent", () => {
  const contractEnd = gameDate(TODAY + 30);
  const initial = careerFixture(contractEnd);
  const submitted = submit(
    initial,
    preliminaryAgreementId("preliminary-agreement:atomic-activation"),
    TODAY,
  );
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.agreement.status !== "offer_submitted") return;
  const agreed = advancePreliminaryAgreementLifecycle({
    careerState: submitted.careerState,
    throughDate: submitted.agreement.clock.responseDueOn,
  });
  assert.equal(
    agreed.careerState.preliminaryAgreementState?.agreements[submitted.agreement.id]?.status,
    "agreed",
  );

  const activated = advanceAiContractLifecycle({
    careerState: agreed.careerState,
    fromDate: TODAY,
    throughDate: contractEnd,
  });
  assert.equal(activated.preliminaryAgreementFacts[0]?.event, "activated");
  const agreement = activated.careerState.preliminaryAgreementState?.agreements[submitted.agreement.id];
  assert.equal(agreement?.status, "activated");
  assert.equal(activated.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), false);
  assert.equal(activated.careerState.gameState.clubs[BUYER]?.playerIds.includes(TARGET), true);
  assert.equal(activeContract(activated.careerState, TARGET)?.clubId, BUYER);
  assert.equal(activated.careerState.transferHistory.length, 0);
  assert.equal(
    activated.careerState.seniorSquadState?.contractHistoryEntryIds.length,
    (initial.seniorSquadState?.contractHistoryEntryIds.length ?? 0) + 2,
  );
  const ledgerCount = activated.careerState.clubFinanceState?.ledgerEntryIds.length ?? 0;
  assert.equal(ledgerCount, (initial.clubFinanceState?.ledgerEntryIds.length ?? 0) + 1);

  const replay = advancePreliminaryAgreementLifecycle({
    careerState: activated.careerState,
    throughDate: gameDate(contractEnd + 7),
  });
  assert.equal(replay.careerState, activated.careerState);
  assert.deepEqual(replay.facts, []);
  assert.equal(replay.careerState.clubFinanceState?.ledgerEntryIds.length, ledgerCount);
});

function submit(
  careerState: CareerState,
  agreementId: ReturnType<typeof preliminaryAgreementId>,
  submittedOn: GameDate,
  transferWindows = closedWindows(),
) {
  const currentContract = activeContract(careerState, TARGET);
  if (currentContract === undefined) throw new Error("Target contract not found.");
  const terms = deriveContractDemand({
    careerState,
    playerId: TARGET,
    clubId: BUYER,
    evaluatedOn: submittedOn,
    currentContract,
    isFreeAgent: false,
  }).preferredTerms;
  return submitPreliminaryAgreementOffer({
    careerState,
    agreementId,
    playerId: TARGET,
    offeringClubId: BUYER,
    submittedOn,
    terms,
    transferWindows,
  });
}

function closedWindows() {
  return seasonTransferWindows({
    competitionId: competitionId("competition:preliminary-test"),
    seasonId: seasonId("season:preliminary-test"),
    windows: [
      { opensOn: gameDate(TODAY + 300), closesOn: gameDate(TODAY + 330) },
      { opensOn: gameDate(TODAY + 500), closesOn: gameDate(TODAY + 530) },
    ],
  });
}

function careerFixture(targetContractEnd: GameDate): CareerState {
  const target = playerFixture(TARGET, 12);
  const buyerPlayer = playerFixture(BUYER_PLAYER, 9);
  const seller = clubFixture(SELLER, "Seller", 5, [TARGET]);
  const buyer = clubFixture(BUYER, "Buyer", 9, [BUYER_PLAYER]);
  const gameState = gameStateFixture([seller, buyer], [target, buyerPlayer]);
  const seniorSquadState = seniorSquadFixture(gameState, targetContractEnd);
  return createCareerState({
    saveId: saveId("save:preliminary-agreement-test"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: BUYER,
    gameState,
    seniorSquadState,
    clubFinanceState: financeFixture(seniorSquadState),
    transferHistory: [],
  });
}

function activeContract(careerState: CareerState, targetPlayerId: Player["id"]): PlayerContract | undefined {
  for (const contractId of careerState.seniorSquadState?.activeContractIds ?? []) {
    const contract = careerState.seniorSquadState?.contracts[contractId];
    if (contract?.playerId === targetPlayerId) return contract;
  }
  return undefined;
}

function clubFixture(
  id: Club["id"],
  name: string,
  reputation: number,
  playerIds: readonly Player["id"][],
): Club {
  return {
    id,
    name,
    shortName: name,
    category: "third_division",
    reputation,
    playerIds,
  };
}

function playerFixture(id: Player["id"], ability: number): Player {
  return {
    id,
    firstName: "Test",
    lastName: String(id).slice(7),
    birthDate: gameDate(TODAY - 24 * 365),
    naturalPositions: ["cm"],
    primaryRole: "central_midfielder",
    abilities: abilitiesFixture(ability),
    potential: abilitiesFixture(ability + 2),
  };
}

function gameStateFixture(clubs: readonly Club[], players: readonly Player[]): GameState {
  return {
    meta: { seed: "preliminary-test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: TODAY, currentSeasonId: seasonId("season:preliminary-test") },
    players: Object.fromEntries(players.map((player) => [player.id, player])),
    playerIds: players.map((player) => player.id),
    playerStates: Object.fromEntries(players.map((player) => [
      player.id,
      { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
    ])),
    clubs: Object.fromEntries(clubs.map((club) => [club.id, club])),
    clubIds: clubs.map((club) => club.id),
    fixtures: {},
    fixtureIds: [],
  };
}

function seniorSquadFixture(
  gameState: GameState,
  targetContractEnd: GameDate,
): SeniorSquadState {
  const registrations: Record<string, unknown> = {};
  const contracts: Record<string, unknown> = {};
  const contractHistory: Record<string, unknown> = {};
  const registrationIds: unknown[] = [];
  const contractIds: unknown[] = [];
  const contractHistoryEntryIds: unknown[] = [];

  gameState.clubIds.forEach((ownerClubId, clubIndex) => {
    const club = gameState.clubs[ownerClubId];
    club?.playerIds.forEach((ownedPlayerId, playerIndex) => {
      const suffix = `${clubIndex}:${playerIndex}`;
      const registrationId = seniorSquadRegistrationId(`registration:preliminary:${suffix}`);
      const contractId = playerContractId(`contract:preliminary:${suffix}`);
      const historyId = playerContractHistoryEntryId(`contract-history:preliminary:${suffix}`);
      registrations[registrationId] = {
        id: registrationId,
        playerId: ownedPlayerId,
        clubId: ownerClubId,
        shirtNumber: playerIndex + 1,
        registeredOn: gameDate(TODAY - 500),
      };
      contracts[contractId] = {
        id: contractId,
        playerId: ownedPlayerId,
        clubId: ownerClubId,
        type: "professional",
        startsOn: gameDate(TODAY - 500),
        endsOn: ownedPlayerId === TARGET ? targetContractEnd : gameDate(TODAY + 700),
        annualWage: nonNegativeMoney(1_000_000_00),
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: nonNegativeMoney(100_000_00),
          appearanceBonus: nonNegativeMoney(10_000_00),
        },
      };
      contractHistory[historyId] = {
        id: historyId,
        sequenceNumber: contractHistoryEntryIds.length + 1,
        occurredOn: gameDate(TODAY - 500),
        event: "signed",
        contractId,
        playerId: ownedPlayerId,
        clubId: ownerClubId,
      };
      registrationIds.push(registrationId);
      contractIds.push(contractId);
      contractHistoryEntryIds.push(historyId);
    });
  });

  return {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: contractIds,
    contractHistory,
    contractHistoryEntryIds,
  } as never as SeniorSquadState;
}

function financeFixture(seniorSquadState: SeniorSquadState) {
  const accounts: Record<string, unknown> = {};
  const ledgerEntries: Record<string, unknown> = {};
  const ledgerEntryIds: unknown[] = [];
  for (const ownerClubId of [SELLER, BUYER]) {
    const committedAnnualWage = seniorSquadState.activeContractIds.reduce((sum, contractId) => {
      const contract = seniorSquadState.contracts[contractId];
      return sum + (contract?.clubId === ownerClubId ? contract.annualWage : 0);
    }, 0);
    accounts[ownerClubId] = {
      clubId: ownerClubId,
      currency: "EUR",
      cashBalance: nonNegativeMoney(50_000_000_00),
      annualTransferBudget: nonNegativeMoney(20_000_000_00),
      availableTransferBudget: nonNegativeMoney(20_000_000_00),
      annualWageBudget: nonNegativeMoney(50_000_000_00),
      committedAnnualWage: nonNegativeMoney(committedAnnualWage),
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:preliminary:${ownerClubId}`);
    ledgerEntries[entryId] = {
      id: entryId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId: ownerClubId,
      occurredOn: TODAY,
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: nonNegativeMoney(50_000_000_00),
      balanceAfter: nonNegativeMoney(50_000_000_00),
      referenceId: `preliminary:${ownerClubId}`,
    };
    ledgerEntryIds.push(entryId);
  }
  return {
    currency: "EUR",
    accounts,
    clubIds: [SELLER, BUYER],
    ledgerEntries,
    ledgerEntryIds,
  } as never;
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
  } as PlayerAbilities;
}
