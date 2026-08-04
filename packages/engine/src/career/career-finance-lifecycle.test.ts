import { createLineupSlot } from "../match-engine/index.ts";
import type { CanonicalPlayerRole } from "@game/domain";
import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  MATCH_EVENT_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  contractNegotiationId,
  competitionId,
  createCareerState,
  createSeniorSquadState,
  fixtureId,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
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
  type LeagueTableRow,
  type MatchReport,
  type Player,
  type PlayerAbilities,
  type PlayerContract,
  type PlayerId,
  type SeniorSquadState,
} from "@game/domain";

import type { MatchTeamContext } from "../match-engine/match-context.ts";
import { deriveMarketPendingExposure } from "./market-pending-exposure.ts";
import { prepareSeniorSquadDeparture } from "./senior-squad-transfer.ts";
import { offerContractRenewal as offerContractRenewalWithPolicy } from "./contract-negotiation.ts";
import {
  applyContractActivationFinance,
  checkContractOfferAffordability as checkContractOfferAffordabilityWithPolicy,
  refreshAnnualTransferBudgetAvailability,
  reconcileActiveContractWageCommitments,
  reallocateTransferBudgetToWages,
  reallocateTransferBudgetsToWages,
  settleAnnualPayroll,
  settleFixtureContractBonuses,
  settleSeasonDistribution,
} from "./career-finance-lifecycle.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


function offerContractRenewal(
  input: Omit<Parameters<typeof offerContractRenewalWithPolicy>[0], "wagePolicy">,
) {
  return offerContractRenewalWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
  });
}

function checkContractOfferAffordability(
  input: Omit<
    Parameters<typeof checkContractOfferAffordabilityWithPolicy>[0],
    "wagePolicy"
  >,
) {
  return checkContractOfferAffordabilityWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
  });
}

/**
 * Finance lifecycle tests protect the exact-once money boundaries that make
 * salaries, bonuses, and competition prizes durable career facts.
 */

test("annual payroll charges one complete wage per active contract and replays exactly once", () => {
  const state = careerFixture();
  const first = settleAnnualPayroll({
    careerState: state,
    seasonId: SEASON,
    occurredOn: gameDate(20_000),
  });

  assert.equal(first.status, "applied");
  if (first.status !== "applied") return;
  assert.equal(first.payroll.seasonId, SEASON);
  assert.equal(first.payroll.chargedContractCount, 2);
  assert.equal(first.postedEntryIds.length, 2);
  assert.equal(first.careerState.playerParticipationLedger, undefined);
  assert.equal(first.careerState.clubFinanceState?.accounts[HOME]?.cashBalance, 8_800_000_00);
  assert.deepEqual(
    first.postedEntryIds.map((id) => first.careerState.clubFinanceState?.ledgerEntries[id]?.reason),
    ["annual_base_wage", "annual_base_wage"],
  );

  const replayed = settleAnnualPayroll({
    careerState: first.careerState,
    seasonId: SEASON,
    occurredOn: gameDate(20_000),
  });
  assert.equal(replayed.status, "applied");
  if (replayed.status !== "applied") return;
  assert.deepEqual(replayed.postedEntryIds, []);
  assert.deepEqual(replayed.careerState, first.careerState);
});

test("contract activation reconciles wages, pays signing bonus once, and rejects unaffordable proposals atomically", () => {
  const state = careerFixture();
  const currentContract = state.seniorSquadState?.contracts[HOME_CONTRACT];
  assert.ok(currentContract);
  const proposedContract: PlayerContract = {
    ...currentContract,
    annualWage: nonNegativeMoney(1_500_000_00),
    bonuses: {
      ...currentContract.bonuses,
      signingBonus: nonNegativeMoney(200_000_00),
    },
  };
  const proposedSquad = createSeniorSquadState(state.gameState, replaceContract(state, proposedContract));
  const first = applyContractActivationFinance({
    careerState: state,
    seniorSquadState: proposedSquad,
    activatedContractIds: [HOME_CONTRACT],
    occurredOn: state.gameState.calendar.currentDate,
  });

  assert.equal(first.status, "applied");
  if (first.status !== "applied") return;
  assert.equal(first.postedEntryIds.length, 1);
  assert.equal(
    first.careerState.clubFinanceState?.accounts[HOME]?.committedAnnualWage,
    proposedContract.annualWage,
  );
  assert.equal(first.careerState.clubFinanceState?.accounts[HOME]?.cashBalance, 9_800_000_00);

  const replayed = applyContractActivationFinance({
    careerState: first.careerState,
    seniorSquadState: proposedSquad,
    activatedContractIds: [HOME_CONTRACT],
    occurredOn: state.gameState.calendar.currentDate,
  });
  assert.equal(replayed.status, "applied");
  if (replayed.status !== "applied") return;
  assert.deepEqual(replayed.postedEntryIds, []);
  assert.deepEqual(replayed.careerState, first.careerState);

  const excessiveContract: PlayerContract = {
    ...currentContract,
    annualWage: nonNegativeMoney(9_000_000_00),
  };
  const rejected = applyContractActivationFinance({
    careerState: state,
    seniorSquadState: createSeniorSquadState(state.gameState, replaceContract(state, excessiveContract)),
    activatedContractIds: [HOME_CONTRACT],
    occurredOn: state.gameState.calendar.currentDate,
  });
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.reason, "wage_budget_exceeded");
  assert.strictEqual(rejected.careerState, state);
});

test("contract departure rebuilds annual wage commitments without charging cash", () => {
  const state = careerFixture();
  const senior = state.seniorSquadState;
  assert.ok(senior);
  const departure = prepareSeniorSquadDeparture({
    gameState: state.gameState,
    seniorSquadState: senior,
    playerId: HOME_PLAYER,
    occurredOn: state.gameState.calendar.currentDate,
    transitionSequence: 1,
    event: "released",
  });
  const reconciled = reconcileActiveContractWageCommitments({
    careerState: state,
    gameState: departure.gameState,
    seniorSquadState: departure.seniorSquadState,
  });

  assert.equal(reconciled.status, "applied");
  if (reconciled.status !== "applied") return;
  assert.deepEqual(reconciled.postedEntryIds, []);
  assert.equal(reconciled.careerState.clubFinanceState?.accounts[HOME]?.committedAnnualWage, 0);
  assert.equal(
    reconciled.careerState.clubFinanceState?.accounts[HOME]?.cashBalance,
    state.clubFinanceState?.accounts[HOME]?.cashBalance,
  );
  assert.strictEqual(reconciled.careerState.seniorSquadState, departure.seniorSquadState);
});

test("transfer allocation can fund wage headroom without changing cash or creating ledger entries", () => {
  const state = careerFixture();
  const amount = nonNegativeMoney(500_000_00);
  const moved = reallocateTransferBudgetToWages({ careerState: state, clubId: HOME, amount });

  assert.equal(moved.status, "applied");
  if (moved.status !== "applied") return;
  assert.deepEqual(moved.postedEntryIds, []);
  const before = state.clubFinanceState?.accounts[HOME];
  const after = moved.careerState.clubFinanceState?.accounts[HOME];
  assert.equal(after?.cashBalance, before?.cashBalance);
  assert.equal(after?.annualTransferBudget, (before?.annualTransferBudget ?? 0) - amount);
  assert.equal(after?.availableTransferBudget, (before?.availableTransferBudget ?? 0) - amount);
  assert.equal(after?.annualWageBudget, (before?.annualWageBudget ?? 0) + amount);

  const affordable = checkContractOfferAffordability({
    careerState: moved.careerState,
    clubId: HOME,
    replacedContractId: HOME_CONTRACT,
    terms: {
      durationYears: 2,
      annualWage: nonNegativeMoney(2_500_000_00),
      squadStatus: "regular_starter",
      bonuses: {
        signingBonus: nonNegativeMoney(100_000_00),
        appearanceBonus: nonNegativeMoney(10_000_00),
      },
    },
  });
  assert.equal(affordable.status, "affordable");

  const rejected = reallocateTransferBudgetToWages({
    careerState: state,
    clubId: HOME,
    amount: nonNegativeMoney(2_000_000_00 + 1),
  });
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.reason, "transfer_budget_insufficient");
  assert.strictEqual(rejected.careerState, state);
});

test("transfer allocation cannot consume sale proceeds beyond the remaining annual allocation", () => {
  const state = careerFixture();
  const finance = state.clubFinanceState;
  const account = finance?.accounts[HOME];
  assert.ok(finance !== undefined && account !== undefined);
  if (finance === undefined || account === undefined) return;
  const annualTransferBudget = nonNegativeMoney(100_000_00);
  const stateWithSaleProceeds = createCareerState({
    ...state,
    clubFinanceState: {
      ...finance,
      accounts: {
        ...finance.accounts,
        [HOME]: {
          ...account,
          annualTransferBudget,
          availableTransferBudget: nonNegativeMoney(500_000_00),
        },
      },
    },
  });

  const rejected = reallocateTransferBudgetToWages({
    careerState: stateWithSaleProceeds,
    clubId: HOME,
    amount: nonNegativeMoney(annualTransferBudget + 1),
  });

  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.reason, "transfer_budget_insufficient");
  assert.equal(rejected.availableAmount, annualTransferBudget);
  assert.strictEqual(rejected.careerState, stateWithSaleProceeds);
});

test("structural squad repair may convert real sale proceeds after the annual allocation is exhausted", () => {
  const state = careerFixture();
  const finance = state.clubFinanceState;
  const account = finance?.accounts[HOME];
  assert.ok(finance !== undefined && account !== undefined);
  if (finance === undefined || account === undefined) return;
  const annualTransferBudget = nonNegativeMoney(100_000_00);
  const availableTransferBudget = nonNegativeMoney(500_000_00);
  const amount = nonNegativeMoney(150_000_00);
  const stateWithSaleProceeds = createCareerState({
    ...state,
    clubFinanceState: {
      ...finance,
      accounts: {
        ...finance.accounts,
        [HOME]: {
          ...account,
          annualTransferBudget,
          availableTransferBudget,
        },
      },
    },
  });

  const moved = reallocateTransferBudgetsToWages({
    careerState: stateWithSaleProceeds,
    allocations: [{ clubId: HOME, amount, allowSaleProceeds: true }],
  });

  assert.equal(moved.status, "applied");
  if (moved.status !== "applied") return;
  const nextAccount = moved.careerState.clubFinanceState?.accounts[HOME];
  assert.equal(nextAccount?.annualTransferBudget, 0);
  assert.equal(
    nextAccount?.availableTransferBudget,
    availableTransferBudget - amount,
  );
  assert.equal(
    nextAccount?.annualWageBudget,
    account.annualWageBudget + amount,
  );
  assert.equal(nextAccount?.cashBalance, account.cashBalance);
});

test("season boundary reopens spent transfer allocation without inventing cash or erasing sale proceeds", () => {
  const state = careerFixture();
  const finance = state.clubFinanceState;
  const home = finance?.accounts[HOME];
  const away = finance?.accounts[AWAY];
  assert.ok(finance !== undefined && home !== undefined && away !== undefined);
  if (finance === undefined || home === undefined || away === undefined) return;
  const spentAvailability = nonNegativeMoney(250_000_00);
  const saleProceedsAvailability = nonNegativeMoney(3_000_000_00);
  const stateAtSeasonBoundary = createCareerState({
    ...state,
    clubFinanceState: {
      ...finance,
      accounts: {
        ...finance.accounts,
        [HOME]: { ...home, availableTransferBudget: spentAvailability },
        [AWAY]: { ...away, availableTransferBudget: saleProceedsAvailability },
      },
    },
  });

  const refreshed = refreshAnnualTransferBudgetAvailability({ careerState: stateAtSeasonBoundary });

  assert.equal(refreshed.status, "applied");
  if (refreshed.status !== "applied") return;
  assert.deepEqual(refreshed.postedEntryIds, []);
  assert.equal(
    refreshed.careerState.clubFinanceState?.accounts[HOME]?.availableTransferBudget,
    home.annualTransferBudget,
  );
  assert.equal(
    refreshed.careerState.clubFinanceState?.accounts[AWAY]?.availableTransferBudget,
    saleProceedsAvailability,
  );
  assert.equal(refreshed.careerState.clubFinanceState?.accounts[HOME]?.cashBalance, home.cashBalance);
  assert.equal(refreshed.careerState.clubFinanceState?.accounts[HOME]?.annualWageBudget, home.annualWageBudget);
  assert.deepEqual(
    refreshAnnualTransferBudgetAvailability({ careerState: refreshed.careerState }),
    { status: "applied", careerState: refreshed.careerState, postedEntryIds: [] },
  );
});

test("an unresolved wage-cut offer does not release annual wage budget before acceptance", () => {
  const state = careerFixture();
  const contract = state.seniorSquadState?.contracts[HOME_CONTRACT];
  const account = state.clubFinanceState?.accounts[HOME];
  assert.ok(contract !== undefined && account !== undefined);
  if (contract === undefined || account === undefined) return;

  const offered = offerContractRenewal({
    careerState: state,
    negotiationId: contractNegotiationId("contract-negotiation:test:wage-cut-reservation"),
    playerId: contract.playerId,
    clubId: contract.clubId,
    offeredOn: state.gameState.calendar.currentDate,
    terms: {
      durationYears: 2,
      annualWage: nonNegativeMoney(contract.annualWage - 100_000_00),
      squadStatus: contract.squadStatus,
      bonuses: {
        signingBonus: nonNegativeMoney(0),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
  });
  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;

  // The offer never touches the finance account, and an unresolved wage cut
  // contributes no pending exposure (it is not a saving until accepted).
  assert.equal(
    offered.careerState.clubFinanceState?.accounts[contract.clubId]?.committedAnnualWage,
    account.committedAnnualWage,
  );
  const exposure = deriveMarketPendingExposure(offered.careerState, contract.clubId);
  assert.equal(exposure.pendingAnnualWageExposure, nonNegativeMoney(0));
});

test("an unresolved raise contributes wage and signing exposure without touching finance", () => {
  const state = careerFixture();
  const contract = state.seniorSquadState?.contracts[HOME_CONTRACT];
  const account = state.clubFinanceState?.accounts[HOME];
  assert.ok(contract !== undefined && account !== undefined);
  if (contract === undefined || account === undefined) return;

  const raise = 50_000_00;
  const signing = 10_000_00;
  const offered = offerContractRenewal({
    careerState: state,
    negotiationId: contractNegotiationId("contract-negotiation:test:raise-exposure"),
    playerId: contract.playerId,
    clubId: contract.clubId,
    offeredOn: state.gameState.calendar.currentDate,
    terms: {
      durationYears: 2,
      annualWage: nonNegativeMoney(contract.annualWage + raise),
      squadStatus: contract.squadStatus,
      bonuses: {
        signingBonus: nonNegativeMoney(signing),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
  });
  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;

  // Finance is untouched by the pending offer, but exposure reflects the risk.
  assert.equal(
    offered.careerState.clubFinanceState?.accounts[HOME]?.committedAnnualWage,
    account.committedAnnualWage,
  );
  assert.equal(
    offered.careerState.clubFinanceState?.accounts[HOME]?.cashBalance,
    account.cashBalance,
  );
  const exposure = deriveMarketPendingExposure(offered.careerState, contract.clubId);
  assert.equal(exposure.pendingAnnualWageExposure, nonNegativeMoney(raise));
  assert.equal(exposure.pendingSigningExposure, nonNegativeMoney(signing));
});

test("full-time settlement charges appearance, goal, and clean-sheet bonuses from committed facts once", () => {
  const state = careerFixture();
  const fixture = fixtureFact();
  const homeContext = teamContext(HOME, HOME_PLAYER, "striker");
  const awayContext = teamContext(AWAY, AWAY_PLAYER, "goalkeeper");
  const report = reportFact();
  const first = settleFixtureContractBonuses({
    careerState: state,
    fixture,
    report,
    participationSides: [
      { side: "home", initialContext: homeContext, finalContext: homeContext },
      { side: "away", initialContext: awayContext, finalContext: awayContext },
    ],
  });

  assert.equal(first.status, "applied");
  if (first.status !== "applied") return;
  assert.equal(first.postedEntryIds.length, 4);
  assert.deepEqual(
    first.postedEntryIds.map((id) => first.careerState.clubFinanceState?.ledgerEntries[id]?.reason),
    ["appearance_bonus", "goal_bonus", "clean_sheet_bonus", "appearance_bonus"],
  );
  assert.equal(first.careerState.clubFinanceState?.accounts[HOME]?.cashBalance, 9_999_400_00);
  assert.equal(first.careerState.clubFinanceState?.accounts[AWAY]?.cashBalance, 9_999_900_00);

  const replayed = settleFixtureContractBonuses({
    careerState: first.careerState,
    fixture,
    report,
    participationSides: [
      { side: "home", initialContext: homeContext, finalContext: homeContext },
      { side: "away", initialContext: awayContext, finalContext: awayContext },
    ],
  });
  assert.equal(replayed.status, "applied");
  if (replayed.status !== "applied") return;
  assert.deepEqual(replayed.postedEntryIds, []);
  assert.strictEqual(replayed.careerState, first.careerState);
});

test("season distributions credit each final position once and reject malformed data without partial credit", () => {
  const state = careerFixture();
  const finalTable = tableRows();
  const first = settleSeasonDistribution({
    careerState: state,
    seasonId: SEASON,
    occurredOn: gameDate(20_300),
    distribution: {
      currency: "EUR",
      prizes: [
        { position: 1, amount: nonNegativeMoney(1_000_000_00) },
        { position: 2, amount: nonNegativeMoney(500_000_00) },
      ],
    },
    finalTable,
  });

  assert.equal(first.status, "applied");
  if (first.status !== "applied") return;
  assert.equal(first.careerState.clubFinanceState?.accounts[HOME]?.cashBalance, 11_000_000_00);
  assert.equal(first.careerState.clubFinanceState?.accounts[AWAY]?.cashBalance, 10_500_000_00);

  const replayed = settleSeasonDistribution({
    careerState: first.careerState,
    seasonId: SEASON,
    occurredOn: gameDate(20_300),
    distribution: {
      currency: "EUR",
      prizes: [
        { position: 1, amount: nonNegativeMoney(1_000_000_00) },
        { position: 2, amount: nonNegativeMoney(500_000_00) },
      ],
    },
    finalTable,
  });
  assert.equal(replayed.status, "applied");
  if (replayed.status !== "applied") return;
  assert.deepEqual(replayed.postedEntryIds, []);

  const rejected = settleSeasonDistribution({
    careerState: state,
    seasonId: SEASON,
    occurredOn: gameDate(20_300),
    distribution: {
      currency: "EUR",
      prizes: [{ position: 1, amount: nonNegativeMoney(1_000_000_00) }],
    },
    finalTable,
  });
  assert.equal(rejected.status, "rejected");
  assert.strictEqual(rejected.careerState, state);
});

const HOME = clubId("club:home");
const AWAY = clubId("club:away");
const HOME_PLAYER = playerId("player:home");
const AWAY_PLAYER = playerId("player:away");
const HOME_CONTRACT = playerContractId("contract:home");
const AWAY_CONTRACT = playerContractId("contract:away");
const SEASON = seasonId("season:finance");

function careerFixture(): CareerState {
  const gameState = gameStateFixture();
  const seniorSquadState = seniorSquadFixture();
  return createCareerState({
    saveId: saveId("save:finance-lifecycle"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: HOME,
    gameState,
    transferHistory: [],
    seniorSquadState,
    clubFinanceState: financeFixture(),
  });
}

function gameStateFixture(): GameState {
  const players = {
    [HOME_PLAYER]: playerFixture(HOME_PLAYER, "striker"),
    [AWAY_PLAYER]: playerFixture(AWAY_PLAYER, "goalkeeper"),
  };
  return {
    meta: { seed: "finance-lifecycle", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: SEASON },
    players,
    playerIds: [HOME_PLAYER, AWAY_PLAYER],
    playerStates: {
      [HOME_PLAYER]: { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
      [AWAY_PLAYER]: { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
    },
    clubs: {
      [HOME]: clubFixture(HOME, HOME_PLAYER),
      [AWAY]: clubFixture(AWAY, AWAY_PLAYER),
    },
    clubIds: [HOME, AWAY],
    fixtures: { [fixtureFact().id]: fixtureFact() },
    fixtureIds: [fixtureFact().id],
  };
}

function clubFixture(id: ClubId, ownedPlayerId: PlayerId): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice(-4),
    category: "third_division",
    reputation: 5,
    playerIds: [ownedPlayerId],
  };
}

function playerFixture(id: PlayerId, primaryRole: NonNullable<Player["primaryRole"]>): Player {
  return {
    id,
    firstName: "Finance",
    lastName: String(id),
    birthDate: gameDate(12_000),
    naturalPositions: primaryRole === "goalkeeper" ? ["gk"] : ["st"],
    primaryRole,
    abilities: abilitySet(10),
    potential: abilitySet(12),
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

function seniorSquadFixture(): SeniorSquadState {
  const contracts = {
    [HOME_CONTRACT]: contractFixture(HOME_CONTRACT, HOME, HOME_PLAYER),
    [AWAY_CONTRACT]: contractFixture(AWAY_CONTRACT, AWAY, AWAY_PLAYER),
  };
  const homeRegistration = seniorSquadRegistrationId("registration:home");
  const awayRegistration = seniorSquadRegistrationId("registration:away");
  const homeHistory = playerContractHistoryEntryId("contract-history:home");
  const awayHistory = playerContractHistoryEntryId("contract-history:away");
  return {
    registrations: {
      [homeRegistration]: {
        id: homeRegistration,
        clubId: HOME,
        playerId: HOME_PLAYER,
        shirtNumber: 9,
        registeredOn: gameDate(19_900),
      },
      [awayRegistration]: {
        id: awayRegistration,
        clubId: AWAY,
        playerId: AWAY_PLAYER,
        shirtNumber: 1,
        registeredOn: gameDate(19_900),
      },
    },
    registrationIds: [homeRegistration, awayRegistration],
    contracts,
    contractIds: [HOME_CONTRACT, AWAY_CONTRACT],
    activeContractIds: [HOME_CONTRACT, AWAY_CONTRACT],
    contractHistory: {
      [homeHistory]: {
        id: homeHistory,
        sequenceNumber: 1,
        occurredOn: gameDate(19_900),
        event: "signed",
        contractId: HOME_CONTRACT,
        clubId: HOME,
        playerId: HOME_PLAYER,
      },
      [awayHistory]: {
        id: awayHistory,
        sequenceNumber: 2,
        occurredOn: gameDate(19_900),
        event: "signed",
        contractId: AWAY_CONTRACT,
        clubId: AWAY,
        playerId: AWAY_PLAYER,
      },
    },
    contractHistoryEntryIds: [homeHistory, awayHistory],
  };
}

function contractFixture(
  id: typeof HOME_CONTRACT | typeof AWAY_CONTRACT,
  club: ClubId,
  player: PlayerId,
): PlayerContract {
  return {
    id,
    clubId: club,
    playerId: player,
    type: "professional",
    startsOn: gameDate(19_900),
    endsOn: gameDate(20_800),
    annualWage: nonNegativeMoney(1_200_000_00),
    squadStatus: "regular_starter",
    bonuses: {
      signingBonus: nonNegativeMoney(100_000_00),
      appearanceBonus: nonNegativeMoney(100_00),
      goalBonus: nonNegativeMoney(200_00),
      cleanSheetBonus: nonNegativeMoney(300_00),
    },
  };
}

function financeFixture(): ClubFinanceState {
  const homeOpening = clubFinanceLedgerEntryId("finance-ledger:opening:home");
  const awayOpening = clubFinanceLedgerEntryId("finance-ledger:opening:away");
  return {
    currency: "EUR",
    clubIds: [HOME, AWAY],
    accounts: {
      [HOME]: accountFixture(HOME),
      [AWAY]: accountFixture(AWAY),
    },
    ledgerEntries: {
      [homeOpening]: {
        id: homeOpening,
        sequenceNumber: 1,
        clubId: HOME,
        occurredOn: gameDate(20_000),
        currency: "EUR",
        reason: "opening_capital",
        direction: "credit",
        amount: nonNegativeMoney(10_000_000_00),
        balanceAfter: nonNegativeMoney(10_000_000_00),
        referenceId: "world:home",
      },
      [awayOpening]: {
        id: awayOpening,
        sequenceNumber: 2,
        clubId: AWAY,
        occurredOn: gameDate(20_000),
        currency: "EUR",
        reason: "opening_capital",
        direction: "credit",
        amount: nonNegativeMoney(10_000_000_00),
        balanceAfter: nonNegativeMoney(10_000_000_00),
        referenceId: "world:away",
      },
    },
    ledgerEntryIds: [homeOpening, awayOpening],
  };
}

function accountFixture(club: ClubId): ClubFinanceState["accounts"][ClubId] {
  return {
    clubId: club,
    currency: "EUR",
    cashBalance: nonNegativeMoney(10_000_000_00),
    annualTransferBudget: nonNegativeMoney(2_000_000_00),
    availableTransferBudget: nonNegativeMoney(2_000_000_00),
    annualWageBudget: nonNegativeMoney(2_000_000_00),
    committedAnnualWage: nonNegativeMoney(1_200_000_00),
    seasonIncome: nonNegativeMoney(0),
    seasonExpenses: nonNegativeMoney(0),
  };
}

function replaceContract(state: CareerState, contract: PlayerContract): SeniorSquadState {
  const senior = state.seniorSquadState;
  assert.ok(senior);
  return {
    ...senior,
    contracts: { ...senior.contracts, [contract.id]: contract },
  };
}

function fixtureFact() {
  return {
    id: fixtureId("fixture:finance"),
    competitionId: competitionId("competition:finance"),
    seasonId: SEASON,
    roundNumber: 1,
    date: gameDate(20_010),
    homeClubId: HOME,
    awayClubId: AWAY,
  };
}

function teamContext(club: ClubId, player: PlayerId, canonicalRole: CanonicalPlayerRole): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: club,
    lineup: [createLineupSlot({ slotId: `slot:${club}`, playerId: player, canonicalRole })],
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
  });
}

function reportFact(): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: fixtureFact().id,
    finalMinute: 90,
    score: { home: 1, away: 0 },
    stats: {
      home: { opportunities: 1, shots: 1, shotsOnTarget: 1, goals: 1 },
      away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
    },
    events: [{
      type: "goal",
      shot: {
        minute: 40,
        side: "home",
        quality: 0.6,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
      },
      scorerPlayerId: HOME_PLAYER,
    }],
  };
}

function tableRows(): readonly LeagueTableRow[] {
  return [
    { position: 1, clubId: HOME, played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 3 },
    { position: 2, clubId: AWAY, played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 1, goalDifference: -1, points: 0 },
  ];
}
