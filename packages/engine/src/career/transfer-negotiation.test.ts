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
  saveId,
  seasonId,
  seasonTransferWindows,
  seniorSquadRegistrationId,
  transferNegotiationId,
  type CareerState,
  type Club,
  type ContractOfferTerms,
  type GameState,
  type Player,
  type PlayerAbilities,
  type SeasonTransferWindows,
  type SeniorSquadState,
} from "@game/domain";
import { test } from "vitest";

import {
  acceptTransferCounter,
  advanceTransferNegotiations,
  deriveSellerTransferWillingness,
  submitTransferOffer,
  withdrawTransferNegotiation,
} from "./transfer-negotiation.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import {
  advanceTransferPlayerNegotiations,
  submitTransferPlayerOffer,
} from "./transfer-player-negotiation.ts";

const SELLER = clubId("club:pro18");
const BUYER = clubId("club:pro01");
const TARGET = playerId("player:target");
const SUBMITTED_ON = gameDate(20_000);
const NEG_ID = transferNegotiationId("transfer-negotiation:demo:1");

/** Windows so that SUBMITTED_ON (20_000) is inside an open window. */
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

/** Windows that both open after SUBMITTED_ON, so the market is closed then. */
function closedWindows(): SeasonTransferWindows {
  return seasonTransferWindows({
    competitionId: competitionId("competition:demo-third-division"),
    seasonId: seasonId("season:demo-001"),
    windows: [
      { opensOn: gameDate(20_100), closesOn: gameDate(20_150) },
      { opensOn: gameDate(20_300), closesOn: gameDate(20_330) },
    ],
  });
}

test("submitting a fee offer inside a window schedules a seller reply within three days", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const result = submitTransferOffer({
    careerState: state,
    negotiationId: NEG_ID,
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee: nonNegativeMoney(1_000_000_00),
    submittedOn: SUBMITTED_ON,
    transferWindows: windows(),
  });
  assert.equal(result.status, "applied");
  if (result.status !== "applied") return;
  assert.equal(result.negotiation.status, "submitted");
  if (result.negotiation.status !== "submitted") return;
  assert.ok(result.negotiation.clock.deadline <= gameDate(SUBMITTED_ON + 3));
  assert.ok(result.negotiation.clock.responseDueOn <= result.negotiation.clock.deadline);
});

test("submitting outside a window is rejected", () => {
  const result = submitTransferOffer({
    careerState: careerFixture({}),
    negotiationId: NEG_ID,
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee: nonNegativeMoney(1_000_000_00),
    submittedOn: SUBMITTED_ON,
    transferWindows: closedWindows(),
  });
  assert.equal(result.status === "rejected" ? result.reason : undefined, "outside_transfer_window");
});

test("a second open offer for the same player and buyer is rejected", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const first = submitTransferOffer({
    careerState: state,
    negotiationId: NEG_ID,
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee: nonNegativeMoney(1_000_000_00),
    submittedOn: SUBMITTED_ON,
    transferWindows: windows(),
  });
  assert.equal(first.status, "applied");
  if (first.status !== "applied") return;
  const second = submitTransferOffer({
    careerState: first.careerState,
    negotiationId: transferNegotiationId("transfer-negotiation:demo:2"),
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee: nonNegativeMoney(2_000_000_00),
    submittedOn: SUBMITTED_ON,
    transferWindows: windows(),
  });
  assert.equal(second.status === "rejected" ? second.reason : undefined, "duplicate_open_negotiation");
});

test("a fee at or above the asking value is accepted, leaving ownership unchanged", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const asking = askingFeeFor(state, nonNegativeMoney(1));
  const submitted = submit(state, nonNegativeMoney(asking + 1));
  const advanced = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: dueDate(submitted),
  });
  const negotiation = advanced.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "accepted");
  // Ownership and finance are untouched by a provisional club agreement.
  assert.deepEqual(advanced.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), true);
  assert.deepEqual(
    advanced.careerState.clubFinanceState?.accounts[BUYER]?.availableTransferBudget,
    state.clubFinanceState?.accounts[BUYER]?.availableTransferBudget,
  );
});

test("a fee well below the asking value is rejected", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const submitted = submit(state, nonNegativeMoney(1));
  const advanced = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: dueDate(submitted),
  });
  const negotiation = advanced.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "rejected");
  assert.equal(negotiation?.status === "rejected" ? negotiation.reason : undefined, "fee_below_valuation");
});

test("a fee in the counter band produces a counteroffer that keeps the deadline", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const asking = askingFeeFor(state, nonNegativeMoney(1));
  const submitted = submit(state, nonNegativeMoney(Math.round(asking * 0.8)));
  const advanced = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: dueDate(submitted),
  });
  const negotiation = advanced.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "countered");
  if (negotiation?.status !== "countered") return;
  assert.equal(negotiation.clock.deadline, submitted.negotiation.status === "submitted" ? submitted.negotiation.clock.deadline : undefined);
  assert.equal(negotiation.counterFee, asking);
});

test("an accepted seller reply the buyer can no longer fund is cancelled as unaffordable", () => {
  const state = careerFixture({ buyerBudget: 100_00 });
  const asking = askingFeeFor(state, nonNegativeMoney(1));
  const submitted = submit(state, nonNegativeMoney(asking + 1));
  const advanced = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: dueDate(submitted),
  });
  const negotiation = advanced.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "unaffordable");
});

test("an unresolved stage expires at its deadline", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const submitted = submit(state, nonNegativeMoney(1_000_000_00));
  const advanced = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: gameDate(submitted.negotiation.status === "submitted" ? submitted.negotiation.clock.deadline + 1 : 0),
  });
  const negotiation = advanced.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "expired");
});

test("advancing twice does not re-resolve a settled negotiation", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const submitted = submit(state, nonNegativeMoney(1));
  const once = advanceTransferNegotiations({ careerState: submitted.careerState, throughDate: dueDate(submitted) });
  const twice = advanceTransferNegotiations({ careerState: once.careerState, throughDate: gameDate(dueDate(submitted) + 5) });
  assert.equal(twice.resolved.length, 0);
  assert.equal(twice.careerState, once.careerState);
});

test("the buyer can withdraw an open negotiation", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const submitted = submit(state, nonNegativeMoney(1_000_000_00));
  const result = withdrawTransferNegotiation({
    careerState: submitted.careerState,
    negotiationId: NEG_ID,
    decidedOn: SUBMITTED_ON,
  });
  assert.equal(result.status, "applied");
  assert.equal(
    result.status === "applied" ? result.negotiation.status : undefined,
    "withdrawn",
  );
});

test("accepting a counter at the countered fee provisionally agrees the deal", () => {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const asking = askingFeeFor(state, nonNegativeMoney(1));
  const submitted = submit(state, nonNegativeMoney(Math.round(asking * 0.8)));
  const advanced = advanceTransferNegotiations({ careerState: submitted.careerState, throughDate: dueDate(submitted) });
  const accepted = acceptTransferCounter({
    careerState: advanced.careerState,
    negotiationId: NEG_ID,
    decidedOn: dueDate(submitted),
  });
  assert.equal(accepted.status, "applied");
  if (accepted.status !== "applied") return;
  assert.equal(accepted.negotiation.status, "accepted");
  assert.equal(
    accepted.negotiation.status === "accepted" ? accepted.negotiation.agreedFee : undefined,
    asking,
  );
});

test("the player-contract table gets its own deadline and reserves no money", () => {
  const agreement = acceptedClubAgreement();
  const budgetBefore = agreement.careerState.clubFinanceState?.accounts[BUYER]?.availableTransferBudget;
  const submitted = submitTransferPlayerOffer({
    careerState: agreement.careerState,
    negotiationId: NEG_ID,
    submittedOn: SUBMITTED_ON,
    terms: preferredPlayerTerms(agreement.careerState),
    transferWindows: windows(),
  });

  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "player_offer_submitted") return;
  assert.ok(submitted.negotiation.clock.deadline <= gameDate(SUBMITTED_ON + 3));
  assert.equal(
    submitted.careerState.clubFinanceState?.accounts[BUYER]?.availableTransferBudget,
    budgetBefore,
  );
  assert.equal(submitted.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), true);
});

test("the player can reject contract terms without changing ownership or finance", () => {
  const agreement = acceptedClubAgreement();
  const terms = preferredPlayerTerms(agreement.careerState);
  const submitted = submitTransferPlayerOffer({
    careerState: agreement.careerState,
    negotiationId: NEG_ID,
    submittedOn: SUBMITTED_ON,
    terms: {
      ...terms,
      annualWage: nonNegativeMoney(0),
      bonuses: {
        signingBonus: nonNegativeMoney(0),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
    transferWindows: windows(),
  });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "player_offer_submitted") return;

  const advanced = advanceTransferPlayerNegotiations({
    careerState: submitted.careerState,
    throughDate: submitted.negotiation.clock.responseDueOn,
    transferWindows: windows(),
  });
  assert.equal(
    advanced.careerState.transferNegotiationState?.negotiations[NEG_ID]?.status,
    "player_rejected",
  );
  assert.equal(advanced.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), true);
  assert.equal(
    advanced.careerState.clubFinanceState?.accounts[BUYER]?.availableTransferBudget,
    agreement.careerState.clubFinanceState?.accounts[BUYER]?.availableTransferBudget,
  );
});

test("accepted player terms complete the agreed transfer atomically and once", () => {
  const agreement = acceptedClubAgreement();
  const terms = preferredPlayerTerms(agreement.careerState);
  const agreedFee = agreement.negotiation.status === "accepted"
    ? agreement.negotiation.agreedFee
    : nonNegativeMoney(0);
  const submitted = submitTransferPlayerOffer({
    careerState: agreement.careerState,
    negotiationId: NEG_ID,
    submittedOn: SUBMITTED_ON,
    terms,
    transferWindows: windows(),
  });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "player_offer_submitted") return;

  const completed = advanceTransferPlayerNegotiations({
    careerState: submitted.careerState,
    throughDate: submitted.negotiation.clock.responseDueOn,
    transferWindows: windows(),
  });
  const negotiation = completed.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "completed");
  assert.deepEqual(completed.careerState.gameState.clubs[BUYER]?.playerIds.includes(TARGET), true);
  assert.deepEqual(completed.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), false);
  assert.equal(completed.careerState.transferHistory.at(-1)?.transferFee, agreedFee);
  const activeContract = completed.careerState.seniorSquadState?.activeContractIds
    .map((id) => completed.careerState.seniorSquadState?.contracts[id])
    .find((contract) => contract?.playerId === TARGET && contract.clubId === BUYER);
  assert.equal(activeContract?.annualWage, terms.annualWage);
  assert.equal(activeContract?.squadStatus, terms.squadStatus);

  const replayed = advanceTransferPlayerNegotiations({
    careerState: completed.careerState,
    throughDate: gameDate(SUBMITTED_ON + 10),
    transferWindows: windows(),
  });
  assert.equal(replayed.careerState, completed.careerState);
  assert.deepEqual(replayed.resolved, []);
  assert.equal(replayed.careerState.transferHistory.length, 1);
});

test("a newly unaffordable accepted player deal fails without a partial transfer", () => {
  const agreement = acceptedClubAgreement();
  const submitted = submitTransferPlayerOffer({
    careerState: agreement.careerState,
    negotiationId: NEG_ID,
    submittedOn: SUBMITTED_ON,
    terms: preferredPlayerTerms(agreement.careerState),
    transferWindows: windows(),
  });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "player_offer_submitted") return;
  const buyerAccount = submitted.careerState.clubFinanceState?.accounts[BUYER];
  assert.ok(buyerAccount !== undefined);
  if (buyerAccount === undefined || submitted.careerState.clubFinanceState === undefined) return;
  const unfunded: CareerState = {
    ...submitted.careerState,
    clubFinanceState: {
      ...submitted.careerState.clubFinanceState,
      accounts: {
        ...submitted.careerState.clubFinanceState.accounts,
        [BUYER]: {
          ...buyerAccount,
          cashBalance: nonNegativeMoney(1),
          availableTransferBudget: nonNegativeMoney(1),
        },
      },
    },
  };

  const failed = advanceTransferPlayerNegotiations({
    careerState: unfunded,
    throughDate: submitted.negotiation.clock.responseDueOn,
    transferWindows: windows(),
  });
  const negotiation = failed.careerState.transferNegotiationState?.negotiations[NEG_ID];
  assert.equal(negotiation?.status, "completion_failed");
  assert.equal(
    negotiation?.status === "completion_failed" ? negotiation.reason : undefined,
    "unaffordable",
  );
  assert.equal(failed.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), true);
  assert.equal(failed.careerState.gameState.clubs[BUYER]?.playerIds.includes(TARGET), false);
  assert.deepEqual(failed.careerState.transferHistory, []);
});

test("an unanswered player-contract table expires after its deadline", () => {
  const agreement = acceptedClubAgreement();
  const submitted = submitTransferPlayerOffer({
    careerState: agreement.careerState,
    negotiationId: NEG_ID,
    submittedOn: SUBMITTED_ON,
    terms: preferredPlayerTerms(agreement.careerState),
    transferWindows: windows(),
  });
  assert.equal(submitted.status, "applied");
  if (submitted.status !== "applied" || submitted.negotiation.status !== "player_offer_submitted") return;
  const expired = advanceTransferPlayerNegotiations({
    careerState: submitted.careerState,
    throughDate: gameDate(submitted.negotiation.clock.deadline + 1),
    transferWindows: windows(),
  });
  assert.equal(
    expired.careerState.transferNegotiationState?.negotiations[NEG_ID]?.status,
    "player_expired",
  );
  assert.equal(expired.careerState.gameState.clubs[SELLER]?.playerIds.includes(TARGET), true);
});

// --- helpers -------------------------------------------------------------

function acceptedClubAgreement() {
  const state = careerFixture({ buyerBudget: 500_000_000_00 });
  const asking = askingFeeFor(state, nonNegativeMoney(1));
  const submitted = submit(state, nonNegativeMoney(asking + 1));
  const advanced = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: dueDate(submitted),
  });
  const negotiation = advanced.careerState.transferNegotiationState?.negotiations[NEG_ID];
  if (negotiation?.status !== "accepted") throw new Error("club agreement was not accepted");
  return { careerState: advanced.careerState, negotiation };
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

function submit(state: CareerState, offeredFee: ReturnType<typeof nonNegativeMoney>) {
  const result = submitTransferOffer({
    careerState: state,
    negotiationId: NEG_ID,
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    offeredFee,
    submittedOn: SUBMITTED_ON,
    transferWindows: windows(),
  });
  if (result.status !== "applied") throw new Error(`submit failed: ${result.reason}`);
  return result;
}

function dueDate(submitted: ReturnType<typeof submit>): ReturnType<typeof gameDate> {
  return submitted.negotiation.status === "submitted"
    ? submitted.negotiation.clock.responseDueOn
    : gameDate(SUBMITTED_ON + 3);
}

function askingFeeFor(state: CareerState, offeredFee: ReturnType<typeof nonNegativeMoney>): number {
  const decision = deriveSellerTransferWillingness({
    careerState: state,
    negotiation: { buyingClubId: BUYER, sellingClubId: SELLER, playerId: TARGET, offeredFee, submittedOn: SUBMITTED_ON },
  });
  return decision.askingFee ?? 0;
}

function careerFixture(input: { readonly buyerBudget?: number }): CareerState {
  const seller = clubFixture(SELLER, [TARGET, playerId("player:s2"), playerId("player:s3")]);
  const buyer = clubFixture(BUYER, [playerId("player:b1")]);
  const players = [
    playerFixture(TARGET, 12),
    playerFixture(playerId("player:s2"), 9),
    playerFixture(playerId("player:s3"), 9),
    playerFixture(playerId("player:b1"), 9),
  ];
  const gameState = gameStateFixture([seller, buyer], players);
  const seniorSquadState = seniorSquadStateFixture(gameState);
  return createCareerState({
    saveId: saveId("save:transfer-neg"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: BUYER,
    gameState,
    seniorSquadState,
    clubFinanceState: financeFixture(seniorSquadState, input.buyerBudget ?? 500_000_000_00),
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

function seniorSquadStateFixture(gameState: GameState): SeniorSquadState {
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
        endsOn: gameDate(21_000),
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
