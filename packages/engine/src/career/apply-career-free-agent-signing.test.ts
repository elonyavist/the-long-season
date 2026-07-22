import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  contractNegotiationId,
  createCareerState,
  createSeniorSquadState,
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
  type ClubFinanceState,
  type ClubId,
  type ContractOfferTerms,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerContract,
  type PlayerContractHistoryEntry,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeniorSquadState,
  type SeniorSquadRegistration,
} from "@game/domain";

import { applyCareerFreeAgentSigning } from "./apply-career-free-agent-signing.ts";
import { offerContractRenewal } from "./contract-negotiation.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import { replenishSeniorSquadsFromFreeAgents } from "./senior-squad-replenishment.ts";

/**
 * Free-agent signing tests protect the atomic boundary shared by explicit
 * manager commands, AI recruitment, and deterministic long-run adapters.
 */

const SELECTED_CLUB = clubId("club:selected");
const AI_CLUB = clubId("club:ai");
const CURRENT_DATE = gameDate(20_000);
const STANDARD_WAGE = nonNegativeMoney(100_000_00);

test("applyCareerFreeAgentSigning commits ownership, registration, contract, and finance atomically", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 1 });
  const freeAgentId = fixture.freeAgentIds[0]!;
  const beforeAccount = fixture.careerState.clubFinanceState?.accounts[AI_CLUB];
  const result = applyCareerFreeAgentSigning({
    careerState: fixture.careerState,
    playerId: freeAgentId,
    clubId: AI_CLUB,
    occurredOn: CURRENT_DATE,
    acceptedTerms: acceptedTerms(),
    preferredShirtNumber: 25,
  });

  assert.equal(result.status, "applied");
  if (result.status !== "applied") return;
  assert.equal(result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(freeAgentId), true);
  assert.equal(
    result.careerState.seniorSquadState?.registrationIds.some((id) =>
      result.careerState.seniorSquadState?.registrations[id]?.playerId === freeAgentId,
    ),
    true,
  );
  assert.equal(result.careerState.seniorSquadState?.activeContractIds.includes(result.activatedContractId), true);
  assert.equal(
    result.careerState.clubFinanceState?.accounts[AI_CLUB]?.committedAnnualWage,
    (beforeAccount?.committedAnnualWage ?? 0) + acceptedTerms().annualWage,
  );
  assert.equal(
    result.careerState.clubFinanceState?.accounts[AI_CLUB]?.cashBalance,
    (beforeAccount?.cashBalance ?? 0) - acceptedTerms().bonuses.signingBonus,
  );
  assert.equal(selectFreeAgentPlayerIds(result.careerState).includes(freeAgentId), false);
  assert.equal(fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(freeAgentId), false);
});

test("applyCareerFreeAgentSigning rejects unaffordable terms without publishing partial state", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 1 });
  const freeAgentId = fixture.freeAgentIds[0]!;
  const result = applyCareerFreeAgentSigning({
    careerState: fixture.careerState,
    playerId: freeAgentId,
    clubId: AI_CLUB,
    occurredOn: CURRENT_DATE,
    acceptedTerms: {
      ...acceptedTerms(),
      annualWage: nonNegativeMoney(500_000_000_00),
    },
  });

  assert.equal(result.status, "rejected");
  if (result.status !== "rejected") return;
  assert.equal(result.reason, "wage_budget_exceeded");
  assert.strictEqual(result.careerState, fixture.careerState);
  assert.equal(selectFreeAgentPlayerIds(result.careerState).includes(freeAgentId), true);
});

test("applyCareerFreeAgentSigning preserves annual wages promised by an unresolved renewal", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 1 });
  const renewingPlayerId = fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds[0]!;
  const offered = offerContractRenewal({
    careerState: fixture.careerState,
    negotiationId: contractNegotiationId("contract-negotiation:reserved-wage"),
    playerId: renewingPlayerId,
    clubId: AI_CLUB,
    offeredOn: CURRENT_DATE,
    terms: {
      ...acceptedTerms(),
      annualWage: nonNegativeMoney(48_100_000_00),
      bonuses: { ...acceptedTerms().bonuses, signingBonus: nonNegativeMoney(0) },
    },
  });
  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;

  const result = applyCareerFreeAgentSigning({
    careerState: offered.careerState,
    playerId: fixture.freeAgentIds[0]!,
    clubId: AI_CLUB,
    occurredOn: CURRENT_DATE,
    acceptedTerms: acceptedTerms(),
  });

  assert.equal(result.status, "rejected");
  if (result.status !== "rejected") return;
  assert.equal(result.reason, "wage_budget_exceeded");
  assert.strictEqual(result.careerState, offered.careerState);
});

test("applyCareerFreeAgentSigning preserves cash promised by an unresolved renewal", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 1 });
  const renewingPlayerId = fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds[0]!;
  const offered = offerContractRenewal({
    careerState: fixture.careerState,
    negotiationId: contractNegotiationId("contract-negotiation:reserved-cash"),
    playerId: renewingPlayerId,
    clubId: AI_CLUB,
    offeredOn: CURRENT_DATE,
    terms: {
      ...acceptedTerms(),
      annualWage: STANDARD_WAGE,
      bonuses: {
        ...acceptedTerms().bonuses,
        signingBonus: nonNegativeMoney(99_990_000_00),
      },
    },
  });
  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;

  const result = applyCareerFreeAgentSigning({
    careerState: offered.careerState,
    playerId: fixture.freeAgentIds[0]!,
    clubId: AI_CLUB,
    occurredOn: CURRENT_DATE,
    acceptedTerms: acceptedTerms(),
  });

  assert.equal(result.status, "rejected");
  if (result.status !== "rejected") return;
  assert.equal(result.reason, "insufficient_cash");
  assert.strictEqual(result.careerState, offered.careerState);
});

test("selectFreeAgentPlayerIds reserves unresolved youth promotion candidates for their academy club", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 1 });
  const candidateId = fixture.freeAgentIds[0]!;
  const careerState = createCareerState({
    ...fixture.careerState,
    youthAcademyState: {
      clubRosters: {
        [SELECTED_CLUB]: { clubId: SELECTED_CLUB, playerIds: [] },
        [AI_CLUB]: { clubId: AI_CLUB, playerIds: [] },
      },
      clubRosterIds: [SELECTED_CLUB, AI_CLUB],
      playerLifecycle: {
        [candidateId]: {
          playerId: candidateId,
          clubId: AI_CLUB,
          status: "promotion_candidate",
          academyEntrySeasonId: seasonId("season:academy"),
          academyEntryDate: gameDate(19_000),
        },
      },
      playerLifecycleIds: [candidateId],
    },
  });

  assert.equal(selectFreeAgentPlayerIds(careerState).includes(candidateId), false);
});

test("replenishSeniorSquadsFromFreeAgents restores AI depth while leaving the selected club untouched", () => {
  const fixture = careerFixture({ aiPlayerCount: 16, freeAgentCount: 8 });
  const selectedBefore = fixture.careerState.gameState.clubs[SELECTED_CLUB]?.playerIds;
  const result = replenishSeniorSquadsFromFreeAgents({
    careerState: fixture.careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  const record = result.records[0];
  assert.equal(record?.clubId, AI_CLUB);
  assert.equal(record?.beforeSquadSize, 16);
  assert.equal(record?.afterSquadSize, 22);
  assert.equal(record?.addedPlayerIds.length, 6);
  assert.deepEqual(record?.warnings, []);
  assert.deepEqual(result.careerState.gameState.clubs[SELECTED_CLUB]?.playerIds, selectedBefore);
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.filter((id) =>
      result.careerState.gameState.players[id]?.primaryRole === "goalkeeper",
    ).length,
    2,
  );
  assert.equal(selectFreeAgentPlayerIds(result.careerState).length, 2);
});

test("replenishSeniorSquadsFromFreeAgents changes the selected club only when the caller explicitly requests it", () => {
  const fixture = careerFixture({ aiPlayerCount: 16, freeAgentCount: 8 });
  const selectedAiCareerState: CareerState = {
    ...fixture.careerState,
    selectedClubId: AI_CLUB,
  };
  const result = replenishSeniorSquadsFromFreeAgents({
    careerState: selectedAiCareerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  const record = result.records[0];
  assert.equal(record?.clubId, AI_CLUB);
  assert.equal(record?.beforeSquadSize, 16);
  assert.equal(record?.afterSquadSize, 22);
  assert.equal(record?.addedPlayerIds.length, 6);
});

test("replenishSeniorSquadsFromFreeAgents may re-sign a same-day departure only to recover from zero goalkeepers", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 0 });
  const goalkeeperId = fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds[0]!;
  const careerState = expirePlayerFromClub(fixture.careerState, AI_CLUB, goalkeeperId);

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.addedPlayerIds[0], goalkeeperId);
  assert.equal(result.records[0]?.warnings.includes("no_natural_goalkeeper"), false);
  assert.equal(result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(goalkeeperId), true);
  assert.equal(selectFreeAgentPlayerIds(result.careerState).includes(goalkeeperId), false);
});

test("replenishSeniorSquadsFromFreeAgents does not immediately re-sign a departure when goalkeeper cover remains", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 0 });
  const reserveGoalkeeperId = fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds[1]!;
  const reserveGoalkeeper = createPlayer(reserveGoalkeeperId, "gk", "goalkeeper", 8);
  const careerStateWithCover = createCareerState({
    ...fixture.careerState,
    gameState: {
      ...fixture.careerState.gameState,
      players: {
        ...fixture.careerState.gameState.players,
        [reserveGoalkeeperId]: reserveGoalkeeper,
      },
    },
  });
  const goalkeeperIds = careerStateWithCover.gameState.clubs[AI_CLUB]?.playerIds.filter((id) =>
    careerStateWithCover.gameState.players[id]?.primaryRole === "goalkeeper",
  ) ?? [];
  const departingGoalkeeperId = goalkeeperIds[0]!;
  const careerState = expirePlayerFromClub(careerStateWithCover, AI_CLUB, departingGoalkeeperId);

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.addedPlayerIds.includes(departingGoalkeeperId), false);
  assert.equal(selectFreeAgentPlayerIds(result.careerState).includes(departingGoalkeeperId), true);
});

function careerFixture(input: {
  readonly aiPlayerCount: number;
  readonly freeAgentCount: number;
}): { readonly careerState: CareerState; readonly freeAgentIds: readonly PlayerId[] } {
  const selectedPlayers = [createPlayer(playerId("player:selected:01"), "gk", "goalkeeper", 9)];
  const aiPlayers = Array.from({ length: input.aiPlayerCount }, (_, index) => {
    const position = positionForIndex(index);
    return createPlayer(
      playerId(`player:ai:${String(index + 1).padStart(2, "0")}`),
      position,
      roleForPosition(position),
      7 + (index % 4),
    );
  });
  const freeAgents = Array.from({ length: input.freeAgentCount }, (_, index) => {
    const position: PlayerPosition = index === 0 ? "gk" : index % 3 === 0 ? "st" : "cm";
    return createPlayer(
      playerId(`player:free:${String(index + 1).padStart(2, "0")}`),
      position,
      roleForPosition(position),
      12 - (index % 5),
    );
  });
  const allPlayers = [...selectedPlayers, ...aiPlayers, ...freeAgents];
  const gameState: GameState = {
    meta: { seed: "free-agent-signing", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: CURRENT_DATE, currentSeasonId: seasonId("season:signing") },
    players: Object.fromEntries(allPlayers.map((player) => [player.id, player])),
    playerIds: allPlayers.map((player) => player.id),
    playerStates: Object.fromEntries(allPlayers.map((player) => [
      player.id,
      { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
    ])),
    clubs: {
      [SELECTED_CLUB]: club(SELECTED_CLUB, selectedPlayers.map(({ id }) => id)),
      [AI_CLUB]: club(AI_CLUB, aiPlayers.map(({ id }) => id)),
    },
    clubIds: [SELECTED_CLUB, AI_CLUB],
    fixtures: {},
    fixtureIds: [],
  };
  const seniorSquadState = seniorSquadFixture(gameState, [
    ...selectedPlayers.map((player) => ({ player, clubId: SELECTED_CLUB })),
    ...aiPlayers.map((player) => ({ player, clubId: AI_CLUB })),
  ]);
  return {
    careerState: createCareerState({
      saveId: saveId("save:free-agent-signing"),
      schemaVersion: CAREER_STATE_SCHEMA_VERSION,
      selectedClubId: SELECTED_CLUB,
      gameState,
      transferHistory: [],
      seniorSquadState,
      clubFinanceState: financeFixture(seniorSquadState),
    }),
    freeAgentIds: freeAgents.map(({ id }) => id),
  };
}

function seniorSquadFixture(
  gameState: GameState,
  owned: readonly { readonly player: Player; readonly clubId: ClubId }[],
): SeniorSquadState {
  const registrations: Record<string, SeniorSquadRegistration> = {};
  const contracts: Record<string, PlayerContract> = {};
  const history: Record<string, PlayerContractHistoryEntry> = {};
  const registrationIds: ReturnType<typeof seniorSquadRegistrationId>[] = [];
  const contractIds: ReturnType<typeof playerContractId>[] = [];
  const historyIds: ReturnType<typeof playerContractHistoryEntryId>[] = [];

  owned.forEach(({ player, clubId: owner }, index) => {
    const registrationId = seniorSquadRegistrationId(`registration:${player.id}`);
    const contractId = playerContractId(`contract:${player.id}`);
    const historyId = playerContractHistoryEntryId(`contract-history:${player.id}`);
    registrations[registrationId] = {
      id: registrationId,
      playerId: player.id,
      clubId: owner,
      shirtNumber: index + 1,
      registeredOn: gameDate(19_500),
    };
    contracts[contractId] = {
      id: contractId,
      playerId: player.id,
      clubId: owner,
      type: "professional",
      startsOn: gameDate(19_500),
      endsOn: gameDate(22_000),
      annualWage: STANDARD_WAGE,
      squadStatus: "squad_player",
      bonuses: { signingBonus: nonNegativeMoney(0), appearanceBonus: nonNegativeMoney(0) },
    };
    history[historyId] = {
      id: historyId,
      sequenceNumber: index + 1,
      occurredOn: gameDate(19_500),
      event: "signed",
      contractId,
      playerId: player.id,
      clubId: owner,
    };
    registrationIds.push(registrationId);
    contractIds.push(contractId);
    historyIds.push(historyId);
  });

  return createSeniorSquadState(gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: contractIds,
    contractHistory: history,
    contractHistoryEntryIds: historyIds,
  });
}

function expirePlayerFromClub(
  careerState: CareerState,
  owner: ClubId,
  departingPlayerId: PlayerId,
): CareerState {
  const senior = careerState.seniorSquadState!;
  const registrationId = senior.registrationIds.find((id) =>
    senior.registrations[id]?.playerId === departingPlayerId,
  )!;
  const contractId = senior.activeContractIds.find((id) =>
    senior.contracts[id]?.playerId === departingPlayerId,
  )!;
  const historyId = playerContractHistoryEntryId(`contract-history:expired:${departingPlayerId}`);
  const gameState: GameState = {
    ...careerState.gameState,
    clubs: {
      ...careerState.gameState.clubs,
      [owner]: {
        ...careerState.gameState.clubs[owner]!,
        playerIds: careerState.gameState.clubs[owner]!.playerIds.filter((id) => id !== departingPlayerId),
      },
    },
  };
  const nextSenior = createSeniorSquadState(gameState, {
    ...senior,
    registrationIds: senior.registrationIds.filter((id) => id !== registrationId),
    activeContractIds: senior.activeContractIds.filter((id) => id !== contractId),
    contractHistory: {
      ...senior.contractHistory,
      [historyId]: {
        id: historyId,
        sequenceNumber: senior.contractHistoryEntryIds.length + 1,
        occurredOn: CURRENT_DATE,
        event: "expired",
        contractId,
        playerId: departingPlayerId,
        clubId: owner,
      },
    },
    contractHistoryEntryIds: [...senior.contractHistoryEntryIds, historyId],
  });

  return createCareerState({
    ...careerState,
    gameState,
    seniorSquadState: nextSenior,
    clubFinanceState: financeFixture(nextSenior),
  });
}

function financeFixture(senior: SeniorSquadState): ClubFinanceState {
  const openingCash = nonNegativeMoney(100_000_000_00);
  const selectedLedger = clubFinanceLedgerEntryId("finance-ledger:selected:opening");
  const aiLedger = clubFinanceLedgerEntryId("finance-ledger:ai:opening");
  return {
    currency: "EUR",
    clubIds: [SELECTED_CLUB, AI_CLUB],
    accounts: {
      [SELECTED_CLUB]: financeAccount(SELECTED_CLUB, senior),
      [AI_CLUB]: financeAccount(AI_CLUB, senior),
    },
    ledgerEntries: {
      [selectedLedger]: openingLedger(selectedLedger, SELECTED_CLUB, 1, openingCash),
      [aiLedger]: openingLedger(aiLedger, AI_CLUB, 2, openingCash),
    },
    ledgerEntryIds: [selectedLedger, aiLedger],
  };
}

function financeAccount(owner: ClubId, senior: SeniorSquadState) {
  const committed = senior.activeContractIds.reduce((sum, id) => {
    const contract = senior.contracts[id];
    return contract?.clubId === owner ? sum + contract.annualWage : sum;
  }, 0);
  return {
    clubId: owner,
    currency: "EUR" as const,
    cashBalance: nonNegativeMoney(100_000_000_00),
    annualTransferBudget: nonNegativeMoney(25_000_000_00),
    availableTransferBudget: nonNegativeMoney(25_000_000_00),
    annualWageBudget: nonNegativeMoney(50_000_000_00),
    committedAnnualWage: nonNegativeMoney(committed),
    seasonIncome: nonNegativeMoney(0),
    seasonExpenses: nonNegativeMoney(0),
  };
}

function openingLedger(
  id: ReturnType<typeof clubFinanceLedgerEntryId>,
  owner: ClubId,
  sequenceNumber: number,
  amount: ReturnType<typeof nonNegativeMoney>,
) {
  return {
    id,
    sequenceNumber,
    clubId: owner,
    occurredOn: CURRENT_DATE,
    currency: "EUR" as const,
    reason: "opening_capital" as const,
    direction: "credit" as const,
    amount,
    balanceAfter: amount,
    referenceId: `opening:${owner}`,
  };
}

function acceptedTerms(): ContractOfferTerms {
  return {
    annualWage: nonNegativeMoney(250_000_00),
    durationYears: 2,
    squadStatus: "squad_player",
    bonuses: {
      signingBonus: nonNegativeMoney(25_000_00),
      appearanceBonus: nonNegativeMoney(2_000_00),
    },
  };
}

function positionForIndex(index: number): PlayerPosition {
  if (index < 1) return "gk";
  if (index < 7) return "cb";
  if (index < 13) return "cm";
  return "st";
}

function roleForPosition(position: PlayerPosition): PlayerRole {
  if (position === "gk") return "goalkeeper";
  if (position === "cb") return "center_back";
  if (position === "cm") return "central_midfielder";
  return "striker";
}

function createPlayer(
  id: PlayerId,
  position: PlayerPosition,
  primaryRole: PlayerRole,
  ability: number,
): Player {
  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: [position],
    primaryRole,
    abilities: abilities(ability),
    potential: abilities(Math.min(20, ability + 1)),
  };
}

function club(id: ClubId, playerIds: readonly PlayerId[]) {
  return {
    id,
    name: String(id),
    shortName: String(id),
    category: "third_division" as const,
    reputation: 5,
    playerIds,
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
