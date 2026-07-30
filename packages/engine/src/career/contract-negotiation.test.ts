import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  createCareerState,
  createSeniorSquadState,
  fixtureId,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  postClubFinanceLedgerEntry,
  saveId,
  seasonId,
  seniorSquadRegistrationId,
  stateValue,
  type CareerState,
  type ClubFinanceState,
  type ContractOfferTerms,
  type GameState,
  type GameDate,
  type PlayerAbilities,
  type PlayerContractType,
  type SeniorSquadState,
} from "@game/domain";
import { addDays } from "@game/shared";

import { deriveContractDemand as deriveContractDemandWithPolicy } from "./contract-negotiation-demand.ts";
import { createMatchdayAttention } from "./continue-career.ts";
import {
  acceptContractCounterOffer as acceptContractCounterOfferWithPolicy,
  advanceContractNegotiations as advanceContractNegotiationsWithPolicy,
  chooseReleaseAtContractExpiry,
  createContractNegotiationDraft,
  createRenewalNegotiationId,
  offerSelectedClubRenewal as offerSelectedClubRenewalWithPolicy,
  rejectContractCounterOffer as rejectContractCounterOfferWithPolicy,
  reviseContractOffer,
  submitContractOffer as submitContractOfferWithPolicy,
  withdrawContractNegotiation as withdrawContractNegotiationWithPolicy,
} from "./contract-negotiation.ts";
import {
  advanceSelectedClubWorkflowsToAttention as advanceSelectedClubWorkflowsToAttentionWithConfig,
} from "./selected-club-contract-workflow.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

/** Lifecycle tests cover every decision without relying on UI or persistence. */

const VALUATION_CONFIG = playerValuationConfigFixture();
const WAGE_POLICY = playerWagePolicyConfigFixture();
const MARKET_BEHAVIOR_POLICY = marketBehaviorConfigFixture();

function deriveContractDemand(
  input: Omit<Parameters<typeof deriveContractDemandWithPolicy>[0], "wagePolicy">,
) {
  return deriveContractDemandWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function submitContractOffer(
  input: Omit<Parameters<typeof submitContractOfferWithPolicy>[0], "wagePolicy">,
) {
  return submitContractOfferWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function advanceContractNegotiations(
  careerState: Parameters<typeof advanceContractNegotiationsWithPolicy>[0],
  throughDate: Parameters<typeof advanceContractNegotiationsWithPolicy>[1],
  clubFilter?: Parameters<typeof advanceContractNegotiationsWithPolicy>[3],
) {
  return advanceContractNegotiationsWithPolicy(
    careerState,
    throughDate,
    WAGE_POLICY,
    clubFilter,
  );
}

function acceptContractCounterOffer(
  input: Omit<Parameters<typeof acceptContractCounterOfferWithPolicy>[0], "wagePolicy">,
) {
  return acceptContractCounterOfferWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function rejectContractCounterOffer(
  input: Omit<Parameters<typeof rejectContractCounterOfferWithPolicy>[0], "wagePolicy">,
) {
  return rejectContractCounterOfferWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function offerSelectedClubRenewal(
  input: Omit<Parameters<typeof offerSelectedClubRenewalWithPolicy>[0], "wagePolicy">,
) {
  return offerSelectedClubRenewalWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function withdrawContractNegotiation(
  input: Omit<Parameters<typeof withdrawContractNegotiationWithPolicy>[0], "wagePolicy">,
) {
  return withdrawContractNegotiationWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function advanceSelectedClubWorkflowsToAttention(
  input: Omit<
    Parameters<typeof advanceSelectedClubWorkflowsToAttentionWithConfig>[0],
    "valuationConfig" | "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return advanceSelectedClubWorkflowsToAttentionWithConfig({
    ...input,
    valuationConfig: VALUATION_CONFIG,
    wagePolicy: WAGE_POLICY,
    marketBehaviorPolicy: MARKET_BEHAVIOR_POLICY,
  });
}

test("preferred renewal waits for its due date and activates contract plus finance exactly once", () => {
  const initial = careerFixture();
  const demand = deriveContractDemand({
    careerState: initial,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
  });
  const drafted = createContractNegotiationDraft({
    careerState: initial,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    createdOn: TODAY,
    terms: demand.preferredTerms,
  });
  assert.equal(drafted.status, "applied");
  if (drafted.status !== "applied") return;
  const submitted = submitContractOffer({
    careerState: drafted.careerState,
    negotiationId: NEGOTIATION,
    submittedOn: TODAY,
  });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "awaiting_response") return;
  assert.ok(submitted.negotiation.submittedOffer.responseDueOn > TODAY);

  const early = advanceContractNegotiations(
    submitted.careerState,
    gameDate(submitted.negotiation.submittedOffer.responseDueOn - 1),
  );
  assert.strictEqual(early.careerState, submitted.careerState);
  assert.deepEqual(early.facts, []);

  const resolved = advanceContractNegotiations(
    submitted.careerState,
    submitted.negotiation.submittedOffer.responseDueOn,
  );
  const accepted = resolved.careerState.contractNegotiationState?.negotiations[NEGOTIATION];
  assert.equal(accepted?.status, "accepted");
  if (accepted?.status !== "accepted") return;
  assert.equal(accepted.acceptedSource, "submitted_offer");
  assert.ok(resolved.careerState.seniorSquadState?.contracts[CURRENT_CONTRACT]);
  const activatedContract = resolved.careerState.seniorSquadState?.contracts[accepted.activatedContractId];
  assert.ok(activatedContract);
  assert.equal(activatedContract?.startsOn, accepted.acceptedOn);
  assert.ok((activatedContract?.endsOn ?? 0) > 21_000);
  assert.deepEqual(resolved.careerState.seniorSquadState?.activeContractIds, [accepted.activatedContractId]);
  assert.equal(
    resolved.careerState.clubFinanceState?.accounts[CLUB]?.committedAnnualWage,
    demand.preferredTerms.annualWage,
  );
  assert.equal(
    resolved.careerState.clubFinanceState?.accounts[CLUB]?.cashBalance,
    OPENING_CASH - demand.preferredTerms.bonuses.signingBonus,
  );
  assert.equal(
    resolved.careerState.seniorSquadState?.contractHistoryEntryIds.length,
    2,
  );

  const replayed = advanceContractNegotiations(
    resolved.careerState,
    gameDate(addDays(accepted.acceptedOn, 30)),
  );
  assert.strictEqual(replayed.careerState, resolved.careerState);
  assert.deepEqual(replayed.facts, []);
});

test("an adult youth player graduates to a professional agreement when renewal is accepted", () => {
  const initial = careerFixture({
    contractType: "youth",
    birthDate: gameDate(TODAY - 19 * 365),
  });
  const demand = deriveContractDemand({
    careerState: initial,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: TODAY,
  });
  const drafted = createContractNegotiationDraft({
    careerState: initial,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    createdOn: TODAY,
    terms: demand.preferredTerms,
  });
  assert.equal(drafted.status, "applied");
  if (drafted.status !== "applied") return;
  const submitted = submitContractOffer({
    careerState: drafted.careerState,
    negotiationId: NEGOTIATION,
    submittedOn: TODAY,
  });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "awaiting_response") return;

  const resolved = advanceContractNegotiations(
    submitted.careerState,
    submitted.negotiation.submittedOffer.responseDueOn,
  );
  const accepted = resolved.careerState.contractNegotiationState?.negotiations[NEGOTIATION];
  assert.equal(accepted?.status, "accepted");
  if (accepted?.status !== "accepted") return;
  assert.equal(
    resolved.careerState.seniorSquadState?.contracts[accepted.activatedContractId]?.type,
    "professional",
  );
  assert.equal(resolved.careerState.seniorSquadState?.contracts[CURRENT_CONTRACT]?.type, "youth");
});

test("minimum credible terms produce a stable counter that the club can accept or reject", () => {
  const countered = reachCounter(careerFixture());
  assert.equal(countered.negotiation.status, "countered");
  if (countered.negotiation.status !== "countered") return;

  const accepted = acceptContractCounterOffer({
    careerState: countered.careerState,
    negotiationId: NEGOTIATION,
    decidedOn: gameDate(addDays(countered.negotiation.counterOffer.issuedOn, 1)),
  });
  assert.equal(accepted.status, "applied");
  assert.equal(accepted.status === "applied" ? accepted.negotiation.status : undefined, "accepted");
  assert.equal(
    accepted.status === "applied" && accepted.negotiation.status === "accepted"
      ? accepted.negotiation.acceptedSource
      : undefined,
    "counter_offer",
  );

  const rejectedCounter = reachCounter(careerFixture());
  assert.equal(rejectedCounter.negotiation.status, "countered");
  if (rejectedCounter.negotiation.status !== "countered") return;
  const rejected = rejectContractCounterOffer({
    careerState: rejectedCounter.careerState,
    negotiationId: NEGOTIATION,
    decidedOn: gameDate(addDays(rejectedCounter.negotiation.counterOffer.issuedOn, 1)),
  });
  assert.equal(rejected.status, "applied");
  assert.equal(rejected.status === "applied" ? rejected.negotiation.status : undefined, "rejected");
});

test("a counter can be revised into one explicit submitted club offer", () => {
  const countered = reachCounter(careerFixture());
  assert.equal(countered.negotiation.status, "countered");
  if (countered.negotiation.status !== "countered") return;
  const demand = deriveContractDemand({
    careerState: countered.careerState,
    playerId: PLAYER,
    clubId: CLUB,
    evaluatedOn: countered.negotiation.counterOffer.issuedOn,
  });
  const revised = reviseContractOffer({
    careerState: countered.careerState,
    negotiationId: NEGOTIATION,
    revisedOn: countered.negotiation.counterOffer.issuedOn,
    terms: demand.preferredTerms,
  });

  assert.equal(revised.status, "applied");
  if (revised.status !== "applied") return;
  assert.equal(revised.negotiation.status, "draft");
  assert.equal(revised.facts[0]?.event, "club_revised_offer");

  const submitted = submitContractOffer({
    careerState: revised.careerState,
    negotiationId: NEGOTIATION,
    submittedOn: countered.negotiation.counterOffer.issuedOn,
  });
  assert.equal(submitted.status, "applied");
  assert.equal(submitted.status === "applied" ? submitted.negotiation.status : undefined, "awaiting_response");
});

test("the selected club can explicitly retain no replacement contract at expiry", () => {
  const initial = careerFixture();
  const released = chooseReleaseAtContractExpiry({
    careerState: initial,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    decidedOn: TODAY,
  });

  assert.equal(released.status, "applied");
  if (released.status !== "applied") return;
  assert.equal(released.negotiation.status, "release_at_expiry");
  assert.deepEqual(released.careerState.seniorSquadState?.activeContractIds, [CURRENT_CONTRACT]);
  assert.equal(released.facts[0]?.event, "club_chose_release_at_expiry");
});

test("selected-club renewal helper creates one submitted negotiation without hidden terms", () => {
  const initial = careerFixture();
  const demand = deriveContractDemand({ careerState: initial, playerId: PLAYER, clubId: CLUB, evaluatedOn: TODAY });
  const offered = offerSelectedClubRenewal({
    careerState: initial,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    offeredOn: TODAY,
    terms: demand.preferredTerms,
  });

  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;
  assert.equal(offered.negotiation.status, "awaiting_response");
  if (offered.negotiation.status !== "awaiting_response") return;
  assert.deepEqual(offered.negotiation.submittedOffer.terms, demand.preferredTerms);
});

test("Continue delivers a renewal reminder without stopping and blocks on the final expiry decision", () => {
  const reminderBoundary = gameDate(21_000 - 243);
  const reminder = advanceSelectedClubWorkflowsToAttention({
    careerState: careerFixture(),
    boundaryDate: reminderBoundary,
  });

  assert.equal(reminder.result.stopReason, "no_attention");
  assert.equal(reminder.result.stopDate, reminderBoundary);
  assert.equal(reminder.careerState.currentSeasonInbox?.[0]?.category, "contract_reminder");
  assert.equal(reminder.careerState.currentSeasonInbox?.[0]?.continuePolicy, "never");

  const finalBoundary = gameDate(21_000 - 30);
  const final = advanceSelectedClubWorkflowsToAttention({
    careerState: reminder.careerState,
    boundaryDate: finalBoundary,
  });
  assert.equal(final.result.stopReason, "attention");
  assert.equal(final.result.stopDate, finalBoundary);
  assert.equal(final.result.stopDateMessages[0]?.category, "contract_expiry_decision");
});

test("Continue resolves one delayed response and stops on a player counter at its due date", () => {
  const submitted = submittedMinimumOffer(careerFixture());
  const responseDueOn = submitted.negotiation.submittedOffer.responseDueOn;
  const advanced = advanceSelectedClubWorkflowsToAttention({
    careerState: submitted.careerState,
    boundaryDate: gameDate(addDays(responseDueOn, 30)),
  });

  assert.equal(advanced.result.stopReason, "attention");
  assert.equal(advanced.result.stopDate, responseDueOn);
  assert.equal(advanced.result.stopDateMessages[0]?.category, "contract_counteroffer");
  assert.equal(advanced.careerState.contractNegotiationState?.negotiations[NEGOTIATION]?.status, "countered");
});

test("an earlier matchday stop never resolves a future contract response", () => {
  const submitted = submittedMinimumOffer(careerFixture());
  const matchdayDate = gameDate(submitted.negotiation.submittedOffer.responseDueOn - 1);
  const matchday = createMatchdayAttention({
    fixtureId: STOP_FIXTURE,
    clubId: CLUB,
    date: matchdayDate,
    preparation: { hasSavedLineup: true, hasSavedTactic: true },
  });
  const advanced = advanceSelectedClubWorkflowsToAttention({
    careerState: submitted.careerState,
    boundaryDate: submitted.negotiation.submittedOffer.responseDueOn,
    additionalMessages: [matchday.message],
  });

  assert.equal(advanced.result.stopDate, matchdayDate);
  assert.equal(advanced.careerState.contractNegotiationState?.negotiations[NEGOTIATION]?.status, "awaiting_response");
});

test("low offer is rejected, draft can be withdrawn, and an untouched counter expires", () => {
  const state = careerFixture();
  const lowTerms = terms(10_000_00, 100_00, "fringe_player", 1);
  const lowDraft = createContractNegotiationDraft({
    careerState: state,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    createdOn: TODAY,
    terms: lowTerms,
  });
  assert.equal(lowDraft.status, "applied");
  if (lowDraft.status !== "applied") return;
  const lowSubmitted = submitContractOffer({
    careerState: lowDraft.careerState,
    negotiationId: NEGOTIATION,
    submittedOn: TODAY,
  });
  assert.equal(lowSubmitted.status, "applied");
  if (lowSubmitted.status !== "applied" || lowSubmitted.negotiation.status !== "awaiting_response") return;
  const lowResolved = advanceContractNegotiations(
    lowSubmitted.careerState,
    lowSubmitted.negotiation.submittedOffer.responseDueOn,
  );
  assert.equal(lowResolved.careerState.contractNegotiationState?.negotiations[NEGOTIATION]?.status, "rejected");

  const withdrawState = careerFixture();
  const withdrawDraft = createContractNegotiationDraft({
    careerState: withdrawState,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    createdOn: TODAY,
    terms: lowTerms,
  });
  assert.equal(withdrawDraft.status, "applied");
  if (withdrawDraft.status !== "applied") return;
  const withdrawn = withdrawContractNegotiation({
    careerState: withdrawDraft.careerState,
    negotiationId: NEGOTIATION,
    decidedOn: TODAY,
  });
  assert.equal(withdrawn.status, "applied");
  assert.equal(withdrawn.status === "applied" ? withdrawn.negotiation.status : undefined, "withdrawn");

  const countered = reachCounter(careerFixture());
  assert.equal(countered.negotiation.status, "countered");
  if (countered.negotiation.status !== "countered") return;
  const expired = advanceContractNegotiations(
    countered.careerState,
    countered.negotiation.counterOffer.expiresOn,
  );
  assert.equal(expired.careerState.contractNegotiationState?.negotiations[NEGOTIATION]?.status, "expired");
});

test("submission and counter acceptance recheck affordability without partial mutation", () => {
  const initial = careerFixture();
  const tooExpensive = terms(20_000_000_00, 100_00, "key_player", 3);
  const draft = createContractNegotiationDraft({
    careerState: initial,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    createdOn: TODAY,
    terms: tooExpensive,
  });
  assert.equal(draft.status, "applied");
  if (draft.status !== "applied") return;
  const rejectedSubmission = submitContractOffer({
    careerState: draft.careerState,
    negotiationId: NEGOTIATION,
    submittedOn: TODAY,
  });
  assert.equal(rejectedSubmission.status, "rejected");
  assert.equal(rejectedSubmission.status === "rejected" ? rejectedSubmission.reason : undefined, "wage_budget_exceeded");
  assert.strictEqual(rejectedSubmission.careerState, draft.careerState);

  const countered = reachCounter(careerFixture());
  assert.equal(countered.negotiation.status, "countered");
  if (countered.negotiation.status !== "countered") return;
  const financeState = countered.careerState.clubFinanceState;
  assert.ok(financeState);
  if (financeState === undefined) return;
  const depletedFinanceState = postClubFinanceLedgerEntry(financeState, {
    id: clubFinanceLedgerEntryId("finance-ledger:contract-test-cash-depletion"),
    clubId: CLUB,
    occurredOn: TODAY,
    currency: "EUR",
    reason: "transfer_fee_paid",
    direction: "debit",
    amount: OPENING_CASH,
    referenceId: "transfer:test-cash-depletion",
  });
  const cashReduced = createCareerState({
    ...countered.careerState,
    clubFinanceState: depletedFinanceState,
  });
  const rejectedAcceptance = acceptContractCounterOffer({
    careerState: cashReduced,
    negotiationId: NEGOTIATION,
    decidedOn: gameDate(addDays(countered.negotiation.counterOffer.issuedOn, 1)),
  });
  assert.equal(rejectedAcceptance.status, "applied");
  assert.equal(rejectedAcceptance.status === "applied" ? rejectedAcceptance.negotiation.status : undefined, "rejected");
  assert.deepEqual(
    rejectedAcceptance.status === "applied"
      ? rejectedAcceptance.facts.map(({ event, reason }) => ({ event, reason }))
      : [],
    [{ event: "club_could_not_complete", reason: "insufficient_cash" }],
  );
  assert.deepEqual(rejectedAcceptance.careerState.seniorSquadState, cashReduced.seniorSquadState);
});

function reachCounter(state: CareerState) {
  const submitted = submittedMinimumOffer(state);
  const result = advanceContractNegotiations(submitted.careerState, submitted.negotiation.submittedOffer.responseDueOn);
  const negotiation = result.careerState.contractNegotiationState?.negotiations[NEGOTIATION];
  if (negotiation === undefined) throw new Error("counter fixture negotiation missing");
  return { careerState: result.careerState, negotiation };
}

function submittedMinimumOffer(state: CareerState) {
  const demand = deriveContractDemand({ careerState: state, playerId: PLAYER, clubId: CLUB, evaluatedOn: TODAY });
  const draft = createContractNegotiationDraft({
    careerState: state,
    negotiationId: NEGOTIATION,
    playerId: PLAYER,
    clubId: CLUB,
    createdOn: TODAY,
    terms: demand.minimumTerms,
  });
  assert.equal(draft.status, "applied");
  if (draft.status !== "applied") throw new Error("counter fixture draft rejected");
  const submitted = submitContractOffer({ careerState: draft.careerState, negotiationId: NEGOTIATION, submittedOn: TODAY });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "awaiting_response") {
    throw new Error("counter fixture submission rejected");
  }
  return {
    careerState: submitted.careerState,
    negotiation: submitted.negotiation,
  };
}

const CLUB = clubId("club:contract-test");
const PLAYER = playerId("player:contract-test");
const SEASON = seasonId("season:contract-test");
const TODAY = gameDate(20_000);
const CURRENT_CONTRACT = playerContractId("contract:contract-test-current");
const NEGOTIATION = createRenewalNegotiationId(PLAYER, 1);
const STOP_FIXTURE = fixtureId("fixture:contract-stop");
const OPENING_CASH = nonNegativeMoney(10_000_000_00);

function careerFixture(options: {
  readonly contractType?: PlayerContractType;
  readonly birthDate?: GameDate;
} = {}): CareerState {
  const gameState = gameStateFixture(options.birthDate);
  const seniorSquadState = seniorSquadFixture(gameState, options.contractType);
  return createCareerState({
    saveId: saveId("save:contract-negotiation"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: CLUB,
    gameState,
    transferHistory: [],
    seniorSquadState,
    clubFinanceState: financeFixture(),
  });
}

function gameStateFixture(birthDate: GameDate = gameDate(10_140)): GameState {
  return {
    meta: { seed: "contract-negotiation-lifecycle", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: TODAY, currentSeasonId: SEASON },
    players: {
      [PLAYER]: {
        id: PLAYER,
        firstName: "Luca",
        lastName: "Rossi",
        birthDate,
        naturalPositions: ["st"],
        primaryRole: "striker",
        abilities: abilities(10),
        potential: abilities(12),
      },
    },
    playerIds: [PLAYER],
    playerStates: {
      [PLAYER]: { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
    },
    clubs: {
      [CLUB]: {
        id: CLUB,
        name: "Contract Test",
        shortName: "CT",
        category: "third_division",
        reputation: 5,
        playerIds: [PLAYER],
      },
    },
    clubIds: [CLUB],
    fixtures: {
      [STOP_FIXTURE]: {
        id: STOP_FIXTURE,
        competitionId: competitionId("competition:contract-test"),
        seasonId: SEASON,
        roundNumber: 1,
        date: TODAY,
        homeClubId: CLUB,
        awayClubId: CLUB,
      },
    },
    fixtureIds: [STOP_FIXTURE],
  };
}

function seniorSquadFixture(
  gameState: GameState,
  contractType: PlayerContractType = "professional",
): SeniorSquadState {
  const registrationId = seniorSquadRegistrationId("registration:contract-test");
  const historyId = playerContractHistoryEntryId("contract-history:contract-test-current");
  return createSeniorSquadState(gameState, {
    registrations: {
      [registrationId]: {
        id: registrationId,
        playerId: PLAYER,
        clubId: CLUB,
        shirtNumber: 9,
        registeredOn: gameDate(19_500),
      },
    },
    registrationIds: [registrationId],
    contracts: {
      [CURRENT_CONTRACT]: {
        id: CURRENT_CONTRACT,
        playerId: PLAYER,
        clubId: CLUB,
        type: contractType,
        startsOn: gameDate(19_500),
        endsOn: gameDate(21_000),
        annualWage: nonNegativeMoney(1_200_000_00),
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: nonNegativeMoney(100_000_00),
          appearanceBonus: nonNegativeMoney(10_000_00),
          goalBonus: nonNegativeMoney(15_000_00),
        },
      },
    },
    contractIds: [CURRENT_CONTRACT],
    activeContractIds: [CURRENT_CONTRACT],
    contractHistory: {
      [historyId]: {
        id: historyId,
        sequenceNumber: 1,
        occurredOn: gameDate(19_500),
        event: "signed",
        contractId: CURRENT_CONTRACT,
        playerId: PLAYER,
        clubId: CLUB,
      },
    },
    contractHistoryEntryIds: [historyId],
  });
}

function financeFixture(): ClubFinanceState {
  const ledgerId = clubFinanceLedgerEntryId("finance-ledger:contract-test-opening");
  return {
    currency: "EUR",
    clubIds: [CLUB],
    accounts: {
      [CLUB]: {
        clubId: CLUB,
        currency: "EUR",
        cashBalance: OPENING_CASH,
        annualTransferBudget: nonNegativeMoney(2_000_000_00),
        availableTransferBudget: nonNegativeMoney(2_000_000_00),
        annualWageBudget: nonNegativeMoney(5_000_000_00),
        committedAnnualWage: nonNegativeMoney(1_200_000_00),
        seasonIncome: nonNegativeMoney(0),
        seasonExpenses: nonNegativeMoney(0),
      },
    },
    ledgerEntries: {
      [ledgerId]: {
        id: ledgerId,
        sequenceNumber: 1,
        clubId: CLUB,
        occurredOn: TODAY,
        currency: "EUR",
        reason: "opening_capital",
        direction: "credit",
        amount: OPENING_CASH,
        balanceAfter: OPENING_CASH,
        referenceId: "world:contract-test",
      },
    },
    ledgerEntryIds: [ledgerId],
  };
}

function terms(
  annualWage: number,
  signingBonus: number,
  squadStatus: ContractOfferTerms["squadStatus"],
  durationYears: number,
): ContractOfferTerms {
  return {
    durationYears,
    annualWage: nonNegativeMoney(annualWage),
    squadStatus,
    bonuses: {
      signingBonus: nonNegativeMoney(signingBonus),
      appearanceBonus: nonNegativeMoney(100_00),
      goalBonus: nonNegativeMoney(100_00),
    },
  };
}

function abilities(value: number): PlayerAbilities {
  const score = abilityValue(value);
  return {
    technical: { finishing: score, passing: score, longPassing: score, crossing: score, dribbling: score, technique: score, tackling: score, penalties: score, freeKicks: score },
    physical: { pace: score, strength: score, stamina: score, agility: score, heading: score },
    mental: { positioning: score, vision: score, anticipation: score, composure: score, determination: score, leadership: score },
    goalkeeping: { reflexes: score, handling: score, rushingOut: score, goalkeeperPositioning: score, footwork: score },
  };
}
