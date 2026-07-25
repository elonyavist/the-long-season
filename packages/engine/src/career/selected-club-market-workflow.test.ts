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
  transferNegotiationId,
  type CareerState,
  type Club,
  type ContractOfferTerms,
  type GameDate,
  type GameState,
  type Player,
  type PlayerAbilities,
  type SeasonTransferWindows,
  type SeniorSquadState,
} from "@game/domain";
import { test } from "vitest";

import { openCareerInboxMessage } from "./career-inbox-lifecycle.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import { submitPreliminaryAgreementOffer } from "./preliminary-agreement.ts";
import { advanceSelectedClubWorkflowsToAttention } from "./selected-club-contract-workflow.ts";
import { projectSelectedClubMarketAttention } from "./selected-club-market-workflow.ts";
import {
  acceptTransferCounter,
  deriveSellerTransferWillingness,
  submitTransferOffer,
  withdrawTransferNegotiation,
} from "./transfer-negotiation.ts";
import { submitTransferPlayerOffer } from "./transfer-player-negotiation.ts";

const SELLER = clubId("club:pro18");
const BUYER = clubId("club:pro01");
const TARGET = playerId("player:target");
const SUBMITTED_ON = gameDate(20_000);
const NEG_ID = transferNegotiationId("transfer-negotiation:demo:1");
const AGREEMENT_ID = preliminaryAgreementId("preliminary-agreement:demo:1");

function windows(): SeasonTransferWindows {
  return seasonTransferWindows({
    competitionId: competitionId("competition:demo-third-division"),
    seasonId: seasonId("season:demo-001"),
    windows: [
      { opensOn: gameDate(19_990), closesOn: gameDate(20_050) },
      { opensOn: gameDate(20_200), closesOn: gameDate(20_230) },
    ],
  });
}

test("Continue stops on the day the selling club accepts the fee", () => {
  const state = careerFixture({});
  const asking = askingFeeFor(state);
  const submitted = submit(state, asking + 1);
  const advanced = advanceSelectedClubWorkflowsToAttention({
    careerState: submitted.careerState,
    boundaryDate: gameDate(SUBMITTED_ON + 5),
    transferWindows: windows(),
  });

  assert.equal(advanced.result.stopReason, "attention");
  assert.equal(advanced.result.stopDate, responseDueOn(submitted));
  const message = advanced.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === `inbox:market-club-accepted:${NEG_ID}`,
  );
  assert.equal(message?.category, "market_club_accepted");
  assert.equal(message?.level, "blocking");
  assert.equal(message?.continuePolicy, "until_resolved");
  assert.deepEqual(message?.actionIds, ["open_market_negotiation"]);
  assert.equal(String(message?.related.playerId), String(TARGET));
  assert.equal(
    advanced.careerState.transferNegotiationState?.negotiations[NEG_ID]?.status,
    "accepted",
  );
});

test("a seller counteroffer blocks Continue and resolves after the buyer accepts it", () => {
  const state = careerFixture({});
  const asking = askingFeeFor(state);
  const submitted = submit(state, Math.round(asking * 0.8));
  const countered = advanceSelectedClubWorkflowsToAttention({
    careerState: submitted.careerState,
    boundaryDate: gameDate(SUBMITTED_ON + 5),
    transferWindows: windows(),
  });

  const counterMessageId = `inbox:market-club-counteroffer:${NEG_ID}`;
  const counterMessage = countered.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === counterMessageId,
  );
  assert.equal(countered.result.stopReason, "attention");
  assert.equal(counterMessage?.level, "blocking");
  assert.equal(counterMessage?.lifecycle.resolved, false);

  const accepted = acceptTransferCounter({
    careerState: countered.careerState,
    negotiationId: NEG_ID,
    decidedOn: countered.result.stopDate,
  });
  assert.equal(accepted.status, "applied");
  if (accepted.status !== "applied") return;

  const reconciled = advanceSelectedClubWorkflowsToAttention({
    careerState: accepted.careerState,
    boundaryDate: countered.result.stopDate,
    transferWindows: windows(),
  });
  const resolvedCounter = reconciled.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === counterMessageId,
  );
  assert.equal(resolvedCounter?.lifecycle.resolved, true);
  const acceptedMessage = reconciled.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === `inbox:market-club-accepted:${NEG_ID}`,
  );
  assert.equal(acceptedMessage?.lifecycle.resolved, false);
});

test("a manager withdrawal stays informational and never stops Continue", () => {
  const state = careerFixture({});
  const submitted = submit(state, 1_000_000_00);
  const withdrawn = withdrawTransferNegotiation({
    careerState: submitted.careerState,
    negotiationId: NEG_ID,
    decidedOn: SUBMITTED_ON,
  });
  assert.equal(withdrawn.status, "applied");
  if (withdrawn.status !== "applied") return;

  const advanced = advanceSelectedClubWorkflowsToAttention({
    careerState: withdrawn.careerState,
    boundaryDate: gameDate(SUBMITTED_ON + 5),
    transferWindows: windows(),
  });
  assert.equal(advanced.result.stopReason, "no_attention");
  const message = advanced.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === `inbox:market-offer-withdrawn:${NEG_ID}`,
  );
  assert.equal(message?.level, "informational");
  assert.equal(message?.lifecycle.resolved, true);
});

test("accepted player terms complete the transfer and stop Continue once, without duplicates", () => {
  const state = careerFixture({});
  const asking = askingFeeFor(state);
  const submitted = submit(state, asking + 1);
  const clubAccepted = advanceSelectedClubWorkflowsToAttention({
    careerState: submitted.careerState,
    boundaryDate: responseDueOn(submitted),
    transferWindows: windows(),
  });
  const playerOffer = submitTransferPlayerOffer({
    careerState: clubAccepted.careerState,
    negotiationId: NEG_ID,
    submittedOn: clubAccepted.result.stopDate,
    terms: preferredPlayerTerms(clubAccepted.careerState),
    transferWindows: windows(),
  });
  assert.equal(playerOffer.status, "applied");
  if (playerOffer.status !== "applied") return;

  const completed = advanceSelectedClubWorkflowsToAttention({
    careerState: playerOffer.careerState,
    boundaryDate: gameDate(SUBMITTED_ON + 10),
    transferWindows: windows(),
  });
  assert.equal(completed.result.stopReason, "attention");
  const completionMessageId = `inbox:market-transfer-completed:${NEG_ID}`;
  const message = completed.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === completionMessageId,
  );
  assert.equal(message?.category, "market_transfer_completed");
  assert.equal(message?.level, "important");
  assert.equal(message?.continuePolicy, "until_acknowledged");
  assert.equal(
    completed.careerState.gameState.clubs[BUYER]?.playerIds.includes(TARGET),
    true,
  );

  const opened = openCareerInboxMessage(completed.careerState, message!.id);
  const repeated = advanceSelectedClubWorkflowsToAttention({
    careerState: opened,
    boundaryDate: gameDate(SUBMITTED_ON + 10),
    transferWindows: windows(),
  });
  const copies = (repeated.careerState.currentSeasonInbox ?? []).filter(
    (candidate) => String(candidate.id) === completionMessageId,
  );
  assert.equal(copies.length, 1);
  assert.equal(copies[0]?.lifecycle.read, true);
});

test("a rejected preliminary offer surfaces one important player-reply message", () => {
  const state = careerFixture({ targetContractEndsOn: gameDate(20_100) });
  const submittedAgreement = submitPreliminaryAgreementOffer({
    careerState: state,
    agreementId: AGREEMENT_ID,
    playerId: TARGET,
    offeringClubId: BUYER,
    submittedOn: SUBMITTED_ON,
    terms: zeroTerms(),
    transferWindows: windows(),
  });
  assert.equal(submittedAgreement.status, "applied");
  if (submittedAgreement.status !== "applied") return;

  const advanced = advanceSelectedClubWorkflowsToAttention({
    careerState: submittedAgreement.careerState,
    boundaryDate: gameDate(SUBMITTED_ON + 5),
    transferWindows: windows(),
  });
  const agreement = advanced.careerState.preliminaryAgreementState?.agreements[AGREEMENT_ID];
  assert.equal(agreement?.status, "rejected");
  const message = advanced.careerState.currentSeasonInbox?.find(
    (candidate) => String(candidate.id) === `inbox:market-player-rejected:${AGREEMENT_ID}`,
  );
  assert.equal(message?.category, "market_player_rejected");
  assert.equal(message?.level, "important");
  assert.equal(String(message?.related.preliminaryAgreementId), String(AGREEMENT_ID));
});

test("negotiations started by other clubs never produce selected-club messages", () => {
  const state = careerFixture({});
  const foreign = submitTransferOffer({
    careerState: createCareerState({ ...state, selectedClubId: SELLER }),
    negotiationId: NEG_ID,
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee: nonNegativeMoney(1_000_000_00),
    submittedOn: SUBMITTED_ON,
    transferWindows: windows(),
  });
  assert.equal(foreign.status, "applied");
  if (foreign.status !== "applied") return;

  const projected = projectSelectedClubMarketAttention(
    foreign.careerState,
    gameDate(SUBMITTED_ON + 10),
  );
  assert.deepEqual(projected, []);
});

function submit(state: CareerState, offeredFee: number) {
  const result = submitTransferOffer({
    careerState: state,
    negotiationId: NEG_ID,
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee: nonNegativeMoney(offeredFee),
    submittedOn: SUBMITTED_ON,
    transferWindows: windows(),
  });
  if (result.status !== "applied") throw new Error(`submit failed: ${result.reason}`);
  return result;
}

function responseDueOn(submitted: ReturnType<typeof submit>): GameDate {
  if (submitted.negotiation.status !== "submitted") throw new Error("offer was not submitted");
  return submitted.negotiation.clock.responseDueOn;
}

function askingFeeFor(state: CareerState): number {
  const decision = deriveSellerTransferWillingness({
    careerState: state,
    negotiation: {
      buyingClubId: BUYER,
      sellingClubId: SELLER,
      playerId: TARGET,
      offeredFee: nonNegativeMoney(1),
      submittedOn: SUBMITTED_ON,
    },
  });
  return decision.askingFee ?? 0;
}

function preferredPlayerTerms(careerState: CareerState): ContractOfferTerms {
  const currentContract = careerState.seniorSquadState?.activeContractIds
    .map((id) => careerState.seniorSquadState?.contracts[id])
    .find((contract) => contract?.playerId === TARGET && contract.clubId === SELLER);
  if (currentContract === undefined) throw new Error("target contract not found");
  return deriveContractDemand({
    careerState,
    playerId: TARGET,
    clubId: BUYER,
    evaluatedOn: SUBMITTED_ON,
    currentContract,
    isFreeAgent: false,
  }).preferredTerms;
}

function zeroTerms(): ContractOfferTerms {
  return {
    durationYears: 1,
    annualWage: nonNegativeMoney(0),
    squadStatus: "fringe_player",
    bonuses: { signingBonus: nonNegativeMoney(0), appearanceBonus: nonNegativeMoney(0) },
  };
}

function careerFixture(input: { readonly targetContractEndsOn?: GameDate }): CareerState {
  // The seller keeps the canonical minimum squad size and midfielder depth
  // after the sale, so autonomous seller replies are depth-protected but real.
  const sellerFillerIds = Array.from(
    { length: 18 },
    (_, index) => playerId(`player:s${index + 2}`),
  );
  const seller = clubFixture(SELLER, [TARGET, ...sellerFillerIds]);
  const buyer = clubFixture(BUYER, [playerId("player:b1")]);
  const players = [
    playerFixture(TARGET, 12),
    ...sellerFillerIds.map((fillerId) => playerFixture(fillerId, 9)),
    playerFixture(playerId("player:b1"), 9),
  ];
  const gameState = gameStateFixture([seller, buyer], players);
  const seniorSquadState = seniorSquadStateFixture(gameState, input.targetContractEndsOn);
  return createCareerState({
    saveId: saveId("save:market-workflow"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: BUYER,
    gameState,
    seniorSquadState,
    clubFinanceState: financeFixture(seniorSquadState, 500_000_000_00),
    transferHistory: [],
  });
}

function clubFixture(id: Club["id"], playerIds: readonly Player["id"][]): Club {
  return { id, name: `Club ${id}`, shortName: id, category: "third_division", reputation: 5, playerIds };
}

function playerFixture(id: Player["id"], ability: number): Player {
  return {
    id,
    firstName: "Test",
    lastName: id,
    birthDate: gameDate(20_000 - 24 * 365),
    naturalPositions: ["cm"],
    primaryRole: "central_midfielder",
    abilities: abilitiesFixture(ability),
    potential: abilitiesFixture(ability + 2),
  };
}

function gameStateFixture(clubs: readonly Club[], players: readonly Player[]): GameState {
  const clubRecord: Record<Club["id"], Club> = {} as Record<Club["id"], Club>;
  const playerRecord: Record<Player["id"], Player> = {} as Record<Player["id"], Player>;
  for (const club of clubs) clubRecord[club.id] = club;
  for (const player of players) playerRecord[player.id] = player;
  return {
    meta: { seed: "test", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: SUBMITTED_ON, currentSeasonId: seasonId("season:test") },
    players: playerRecord,
    playerIds: players.map((player) => player.id),
    playerStates: {},
    clubs: clubRecord,
    clubIds: clubs.map((club) => club.id),
    fixtures: {},
    fixtureIds: [],
  };
}

function financeFixture(seniorSquadState: SeniorSquadState, buyerBudget: number) {
  const rows: readonly (readonly [Club["id"], number])[] = [
    [SELLER, 5_000_000_00],
    [BUYER, buyerBudget],
  ];
  const accounts: Record<string, unknown> = {};
  const clubIds: Club["id"][] = [];
  const ledgerEntries: Record<string, unknown> = {};
  const ledgerEntryIds: unknown[] = [];
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
      annualWageBudget: nonNegativeMoney(100_000_000_00),
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
  return {
    currency: "EUR" as const,
    accounts: accounts as never,
    clubIds,
    ledgerEntries: ledgerEntries as never,
    ledgerEntryIds: ledgerEntryIds as never,
  } as never;
}

function seniorSquadStateFixture(
  gameState: GameState,
  targetContractEndsOn?: GameDate,
): SeniorSquadState {
  const registrations: Record<string, unknown> = {};
  const contracts: Record<string, unknown> = {};
  const contractHistory: Record<string, unknown> = {};
  const registrationIds: unknown[] = [];
  const contractIds: unknown[] = [];
  const contractHistoryEntryIds: unknown[] = [];
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
        endsOn: ownedPlayerId === TARGET && targetContractEndsOn !== undefined
          ? targetContractEndsOn
          : gameDate(21_000),
        annualWage: nonNegativeMoney(100_000_00),
        squadStatus: "squad_player",
        bonuses: { signingBonus: nonNegativeMoney(10_000_00), appearanceBonus: nonNegativeMoney(1_000_00) },
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
  } as never as SeniorSquadState;
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
    physical: { pace: ability, strength: ability, stamina: ability, agility: ability, heading: ability },
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
