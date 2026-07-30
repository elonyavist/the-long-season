import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  contractNegotiationId,
  createContractNegotiationState,
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
  type PlayerId,
  type PlayerPosition,
  type SeniorSquadState,
} from "@game/domain";

import {
  advanceAiContractLifecycle as advanceAiContractLifecycleWithPolicy,
} from "./ai-contract-lifecycle.ts";
import { advanceCareerMonths as advanceCareerMonthsWithPolicy } from "./advance-career-month.ts";
import { deriveMarketPendingExposure } from "./market-pending-exposure.ts";
import {
  advanceContractNegotiations as advanceContractNegotiationsWithPolicy,
  chooseAiReleaseAtContractExpiry,
  offerContractRenewal as offerContractRenewalWithPolicy,
} from "./contract-negotiation.ts";
import {
  deriveContractDemand as deriveContractDemandWithPolicy,
} from "./contract-negotiation-demand.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

const WAGE_POLICY = playerWagePolicyConfigFixture();
const MARKET_BEHAVIOR_POLICY = marketBehaviorConfigFixture();

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

function advanceCareerMonths(
  input: Omit<
    Parameters<typeof advanceCareerMonthsWithPolicy>[0],
    "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return advanceCareerMonthsWithPolicy({
    ...input,
    wagePolicy: WAGE_POLICY,
    marketBehaviorPolicy: MARKET_BEHAVIOR_POLICY,
  });
}

function deriveContractDemand(
  input: Omit<Parameters<typeof deriveContractDemandWithPolicy>[0], "wagePolicy">,
) {
  return deriveContractDemandWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
}

function offerContractRenewal(
  input: Omit<Parameters<typeof offerContractRenewalWithPolicy>[0], "wagePolicy">,
) {
  return offerContractRenewalWithPolicy({ ...input, wagePolicy: WAGE_POLICY });
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

const SELECTED_CLUB = clubId("club:selected");
const AI_CLUB = clubId("club:ai");
const SEASON = seasonId("season:ai-contracts");
const CURRENT_DATE = gameDate(20_000);
const EXPIRY_DATE = gameDate(20_300);
const RENEWAL_BOUNDARY = gameDate(20_057);
const STANDARD_WAGE = nonNegativeMoney(100_000_00);

/** AI lifecycle tests use full registered squads so structural policy is real. */

test("AI renews a structurally required player early and never automates the selected club", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, targetIndex: 0 });
  const first = advanceCareerMonths({
    careerState: fixture.careerState,
    worldSeed: fixture.careerState.gameState.meta.seed,
    fromDate: gameDate(RENEWAL_BOUNDARY - 7),
    toDate: gameDate(RENEWAL_BOUNDARY + 10),
  });

  assert.deepEqual(first.contractLifecycle?.facts.map(({ event, playerId }) => ({ event, playerId })), [
    { event: "renewal_started", playerId: fixture.targetPlayerId },
  ]);
  assert.equal(
    first.careerState.seniorSquadState?.activeContractIds.includes(fixture.targetContractId),
    false,
  );
  const aiNegotiation = first.careerState.contractNegotiationState?.negotiationIds
    .map((id) => first.careerState.contractNegotiationState?.negotiations[id])
    .find((negotiation) => negotiation?.clubId === AI_CLUB);
  assert.equal(aiNegotiation?.status, "accepted");
  assert.equal(
    first.careerState.contractNegotiationState?.negotiationIds.some((id) =>
      first.careerState.contractNegotiationState?.negotiations[id]?.clubId === SELECTED_CLUB,
    ),
    false,
  );
  assert.equal(
    first.careerState.seniorSquadState?.activeContractIds.includes(fixture.selectedContractId),
    true,
  );

  const replay = advanceAiContractLifecycle({
    careerState: first.careerState,
    fromDate: gameDate(RENEWAL_BOUNDARY - 7),
    throughDate: gameDate(RENEWAL_BOUNDARY + 10),
  });
  assert.strictEqual(replay.careerState, first.careerState);
  assert.deepEqual(replay.facts, []);
  assert.deepEqual(replay.negotiationFacts, []);
});

test("AI renews a one-year veteran contract at most once in one lifecycle interval", () => {
  const fixture = careerFixture({
    aiPlayerCount: 18,
    targetIndex: 0,
    targetBirthDate: gameDate(CURRENT_DATE - 34 * 365),
  });
  const advanced = advanceAiContractLifecycle({
    careerState: fixture.careerState,
    fromDate: CURRENT_DATE,
    throughDate: gameDate(CURRENT_DATE + 365),
  });

  assert.equal(
    advanced.facts.filter(({ event, playerId }) =>
      event === "renewal_started" && playerId === fixture.targetPlayerId
    ).length,
    1,
  );
  const acceptedRenewals = advanced.careerState.seniorSquadState?.contractHistoryEntryIds
    .map((id) => advanced.careerState.seniorSquadState?.contractHistory[id])
    .filter((entry) =>
      entry?.event === "renewed" && entry.playerId === fixture.targetPlayerId
    ) ?? [];
  assert.equal(acceptedRenewals.length, 1);
});

test("AI records one surplus release and expiry creates one ownership-derived free agent", () => {
  const fixture = careerFixture({ aiPlayerCount: 19, targetIndex: 18 });
  const decided = advanceAiContractLifecycle({
    careerState: fixture.careerState,
    fromDate: gameDate(RENEWAL_BOUNDARY - 7),
    throughDate: gameDate(RENEWAL_BOUNDARY + 1),
  });
  const decision = decided.careerState.contractNegotiationState?.negotiationIds
    .map((id) => decided.careerState.contractNegotiationState?.negotiations[id])
    .find((negotiation) => negotiation?.playerId === fixture.targetPlayerId);
  assert.equal(decision?.status, "release_at_expiry");
  assert.equal(decided.facts[0]?.event, "renewal_not_offered");

  const expired = advanceAiContractLifecycle({
    careerState: decided.careerState,
    fromDate: gameDate(EXPIRY_DATE - 1),
    throughDate: EXPIRY_DATE,
  });
  assert.deepEqual(expired.facts.map(({ event }) => event), [
    "contract_expired",
    "free_agent_created",
  ]);
  assert.equal(
    expired.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(fixture.targetPlayerId),
    false,
  );
  assert.equal(
    expired.careerState.seniorSquadState?.activeContractIds.includes(fixture.targetContractId),
    false,
  );
  assert.equal(
    expired.careerState.seniorSquadState?.registrationIds.some((id) =>
      expired.careerState.seniorSquadState?.registrations[id]?.playerId === fixture.targetPlayerId,
    ),
    false,
  );
  const expiryHistoryId = expired.careerState.seniorSquadState?.contractHistoryEntryIds.at(-1);
  assert.equal(
    expiryHistoryId === undefined
      ? undefined
      : expired.careerState.seniorSquadState?.contractHistory[expiryHistoryId]?.event,
    "expired",
  );
  assert.deepEqual(selectFreeAgentPlayerIds(expired.careerState), [fixture.targetPlayerId]);
  assert.equal(
    expired.careerState.clubFinanceState?.accounts[AI_CLUB]?.committedAnnualWage,
    STANDARD_WAGE * 18,
  );
  assert.equal(
    expired.careerState.seniorSquadState?.activeContractIds.includes(fixture.selectedContractId),
    true,
  );

  const replay = advanceAiContractLifecycle({
    careerState: expired.careerState,
    fromDate: gameDate(EXPIRY_DATE - 1),
    throughDate: EXPIRY_DATE,
  });
  assert.strictEqual(replay.careerState, expired.careerState);
  assert.deepEqual(replay.facts, []);
});

test("an accepted AI negotiation leaves runtime state when its replacement contract expires", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, targetIndex: 0 });
  const renewed = advanceCareerMonths({
    careerState: fixture.careerState,
    worldSeed: fixture.careerState.gameState.meta.seed,
    fromDate: gameDate(RENEWAL_BOUNDARY - 7),
    toDate: gameDate(RENEWAL_BOUNDARY + 10),
  });
  const acceptedId = renewed.careerState.contractNegotiationState?.negotiationIds.find((id) =>
    renewed.careerState.contractNegotiationState?.negotiations[id]?.status === "accepted",
  );
  const accepted = acceptedId === undefined
    ? undefined
    : renewed.careerState.contractNegotiationState?.negotiations[acceptedId];
  assert.equal(accepted?.status, "accepted");
  if (accepted?.status !== "accepted") throw new Error("expected accepted AI renewal");
  const replacement = renewed.careerState.seniorSquadState?.contracts[accepted.activatedContractId];
  if (replacement === undefined) throw new Error("expected active replacement contract");

  const release = chooseAiReleaseAtContractExpiry({
    careerState: renewed.careerState,
    negotiationId: contractNegotiationId("contract-negotiation:release-renewed-ai-contract"),
    playerId: replacement.playerId,
    clubId: replacement.clubId,
    decidedOn: gameDate(replacement.endsOn - 1),
  });
  assert.equal(release.status, "applied");
  if (release.status !== "applied") throw new Error("expected AI release decision");

  const expired = advanceAiContractLifecycle({
    careerState: release.careerState,
    fromDate: gameDate(replacement.endsOn - 1),
    throughDate: replacement.endsOn,
  });
  assert.equal(expired.careerState.contractNegotiationState?.negotiations[accepted.id], undefined);
  assert.equal(
    expired.careerState.seniorSquadState?.activeContractIds.includes(replacement.id),
    false,
  );
  assert.equal(selectFreeAgentPlayerIds(expired.careerState).includes(replacement.playerId), true);
});

test("AI counter decisions preserve wages promised by the other open negotiations", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, targetIndex: 0 });
  const playerIds = fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds.slice(0, 2) ?? [];
  let offeredState = fixture.careerState;
  const responseDates: number[] = [];

  playerIds.forEach((renewingPlayerId, index) => {
    const demand = deriveContractDemand({
      careerState: offeredState,
      playerId: renewingPlayerId,
      clubId: AI_CLUB,
      evaluatedOn: CURRENT_DATE,
    });
    const offered = offerContractRenewal({
      careerState: offeredState,
      negotiationId: contractNegotiationId(`contract-negotiation:reserved-counter:${index}`),
      playerId: renewingPlayerId,
      clubId: AI_CLUB,
      offeredOn: CURRENT_DATE,
      terms: demand.minimumTerms,
    });
    assert.equal(offered.status, "applied");
    if (offered.status !== "applied" || offered.negotiation.status !== "awaiting_response") {
      throw new Error("expected submitted AI renewal");
    }
    offeredState = offered.careerState;
    responseDates.push(offered.negotiation.submittedOffer.responseDueOn);
  });

  const throughDate = gameDate(Math.max(...responseDates));
  const counteredState = advanceContractNegotiations(offeredState, throughDate).careerState;
  const counters = counteredState.contractNegotiationState?.negotiationIds.flatMap((id) => {
    const negotiation = counteredState.contractNegotiationState?.negotiations[id];
    return negotiation?.status === "countered" ? [negotiation] : [];
  }) ?? [];
  assert.equal(counters.length, 2);

  const negotiationState = counteredState.contractNegotiationState;
  if (negotiationState === undefined) throw new Error("expected AI negotiation state");
  const counterAnnualWage = nonNegativeMoney(5_000_000_00);
  const constrainedNegotiations = Object.fromEntries(
    negotiationState.negotiationIds.map((id) => {
      const negotiation = negotiationState.negotiations[id];
      if (negotiation?.status !== "countered") return [id, negotiation];
      return [id, {
        ...negotiation,
        counterOffer: {
          ...negotiation.counterOffer,
          terms: {
            ...negotiation.counterOffer.terms,
            annualWage: counterAnnualWage,
          },
        },
      }];
    }),
  );
  const constrainedNegotiationState = createContractNegotiationState(
    counteredState.gameState,
    counteredState.seniorSquadState,
    {
      negotiations: constrainedNegotiations,
      negotiationIds: negotiationState.negotiationIds,
    },
  );
  const account = counteredState.clubFinanceState?.accounts[AI_CLUB];
  if (account === undefined) throw new Error("expected AI finance account");
  const individuallyAffordableBudget = Math.max(...counters.map((negotiation) => {
    const contract = counteredState.seniorSquadState?.contracts[negotiation.currentContractId];
    if (contract === undefined) throw new Error("expected current AI contract");
    return account.committedAnnualWage
      - contract.annualWage
      + counterAnnualWage;
  }));
  const constrainedState = createCareerState({
    ...counteredState,
    contractNegotiationState: constrainedNegotiationState,
    clubFinanceState: {
      ...counteredState.clubFinanceState!,
      accounts: {
        ...counteredState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account,
          annualWageBudget: nonNegativeMoney(individuallyAffordableBudget),
          availableTransferBudget: nonNegativeMoney(0),
        },
      },
    },
  });

  const resolved = advanceAiContractLifecycle({
    careerState: constrainedState,
    fromDate: CURRENT_DATE,
    throughDate,
  });
  const decisions = resolved.careerState.contractNegotiationState?.negotiationIds.flatMap((id) => {
    const negotiation = resolved.careerState.contractNegotiationState?.negotiations[id];
    return negotiation === undefined ? [] : [negotiation.status];
  }) ?? [];
  assert.equal(decisions.filter((status) => status === "accepted").length, 1);
  assert.equal(decisions.filter((status) => status === "rejected").length, 1);
  const resolvedAccount = resolved.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.ok((resolvedAccount?.committedAnnualWage ?? Infinity) <= (resolvedAccount?.annualWageBudget ?? 0));
});

test("renewal submission does not spend wage room promised by another open offer", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, targetIndex: 0 });
  const renewingPlayerIds = fixture.careerState.gameState.clubs[AI_CLUB]?.playerIds.slice(0, 2) ?? [];
  const contracts = renewingPlayerIds.map((renewingPlayerId) =>
    fixture.careerState.seniorSquadState?.activeContractIds
      .map((id) => fixture.careerState.seniorSquadState?.contracts[id])
      .find((contract) => contract?.playerId === renewingPlayerId && contract.clubId === AI_CLUB)
  );
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.equal(contracts.length, 2);
  assert.ok(account !== undefined && contracts.every((contract) => contract !== undefined));
  if (account === undefined || contracts.some((contract) => contract === undefined)) return;

  const wageIncrease = 1_000_000_00;
  const constrainedState = createCareerState({
    ...fixture.careerState,
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account,
          annualWageBudget: nonNegativeMoney(
            account.committedAnnualWage + wageIncrease * 2 - 1,
          ),
        },
      },
    },
  });
  const termsFor = (contract: PlayerContract): ContractOfferTerms => ({
    durationYears: 2,
    annualWage: nonNegativeMoney(contract.annualWage + wageIncrease),
    squadStatus: contract.squadStatus,
    bonuses: {
      signingBonus: nonNegativeMoney(0),
      appearanceBonus: nonNegativeMoney(0),
    },
  });
  const firstContract = contracts[0]!;
  const secondContract = contracts[1]!;
  const first = offerContractRenewal({
    careerState: constrainedState,
    negotiationId: contractNegotiationId("contract-negotiation:reserved-submission:1"),
    playerId: firstContract.playerId,
    clubId: AI_CLUB,
    offeredOn: CURRENT_DATE,
    terms: termsFor(firstContract),
  });
  assert.equal(first.status, "applied");
  if (first.status !== "applied") return;

  const second = offerContractRenewal({
    careerState: first.careerState,
    negotiationId: contractNegotiationId("contract-negotiation:reserved-submission:2"),
    playerId: secondContract.playerId,
    clubId: AI_CLUB,
    offeredOn: CURRENT_DATE,
    terms: termsFor(secondContract),
  });
  // Phase 79 locked rule: an open offer never reserves wage room. Both
  // submissions are judged against committed contracts only and succeed; the
  // combined risk is visible only as informational pending exposure.
  assert.equal(second.status, "applied");
  if (second.status !== "applied") return;
  const exposure = deriveMarketPendingExposure(second.careerState, AI_CLUB);
  assert.equal(exposure.pendingAnnualWageExposure, nonNegativeMoney(wageIncrease * 2));
});

function careerFixture(input: {
  readonly aiPlayerCount: 18 | 19;
  readonly targetIndex: number;
  readonly targetBirthDate?: ReturnType<typeof gameDate>;
}): {
  readonly careerState: CareerState;
  readonly targetPlayerId: PlayerId;
  readonly targetContractId: PlayerContract["id"];
  readonly selectedContractId: PlayerContract["id"];
} {
  const aiPlayers = Array.from({ length: input.aiPlayerCount }, (_, index) =>
    createPlayer(
      AI_CLUB,
      index,
      positionForIndex(index),
      index === input.targetIndex ? 5 : 10,
      index === input.targetIndex ? input.targetBirthDate : undefined,
    ),
  );
  const selectedPlayer = createPlayer(SELECTED_CLUB, 0, "st", 10);
  const players = [...aiPlayers, selectedPlayer];
  const targetPlayer = aiPlayers[input.targetIndex]!;
  const gameState = gameStateFixture(aiPlayers, selectedPlayer);
  const seniorSquadState = seniorSquadFixture(gameState, players, targetPlayer.id);
  const careerState = createCareerState({
    saveId: saveId("save:ai-contract-lifecycle"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: SELECTED_CLUB,
    gameState,
    transferHistory: [],
    seniorSquadState,
    clubFinanceState: financeFixture(input.aiPlayerCount),
  });
  return {
    careerState,
    targetPlayerId: targetPlayer.id,
    targetContractId: contractIdFor(targetPlayer.id),
    selectedContractId: contractIdFor(selectedPlayer.id),
  };
}

function gameStateFixture(aiPlayers: readonly Player[], selectedPlayer: Player): GameState {
  const allPlayers = [...aiPlayers, selectedPlayer];
  return {
    meta: { seed: "ai-contract-lifecycle", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: CURRENT_DATE, currentSeasonId: SEASON },
    players: Object.fromEntries(allPlayers.map((player) => [player.id, player])),
    playerIds: allPlayers.map((player) => player.id),
    playerStates: Object.fromEntries(allPlayers.map((player) => [
      player.id,
      { fitness: stateValue(100), form: stateValue(50), morale: stateValue(50) },
    ])),
    clubs: {
      [SELECTED_CLUB]: club(SELECTED_CLUB, "Selected Club", [selectedPlayer.id]),
      [AI_CLUB]: club(AI_CLUB, "AI Club", aiPlayers.map((player) => player.id)),
    },
    clubIds: [SELECTED_CLUB, AI_CLUB],
    fixtures: {},
    fixtureIds: [],
  };
}

function seniorSquadFixture(
  gameState: GameState,
  players: readonly Player[],
  targetPlayerId: PlayerId,
): SeniorSquadState {
  const registrations: SeniorSquadState["registrations"] extends Readonly<Record<string, infer T>>
    ? Record<string, T>
    : never = {};
  const contracts: Record<string, PlayerContract> = {};
  const contractHistory: SeniorSquadState["contractHistory"] extends Readonly<Record<string, infer T>>
    ? Record<string, T>
    : never = {};
  const registrationIds = [] as ReturnType<typeof seniorSquadRegistrationId>[];
  const contractIds = [] as ReturnType<typeof playerContractId>[];
  const historyIds = [] as ReturnType<typeof playerContractHistoryEntryId>[];

  players.forEach((player, index) => {
    const registrationId = seniorSquadRegistrationId(`registration:${player.id}`);
    const contractId = contractIdFor(player.id);
    const historyId = playerContractHistoryEntryId(`contract-history:${player.id}`);
    registrations[registrationId] = {
      id: registrationId,
      playerId: player.id,
      clubId: player.id === SELECTED_PLAYER_ID ? SELECTED_CLUB : AI_CLUB,
      shirtNumber: index + 1,
      registeredOn: gameDate(19_500),
    };
    contracts[contractId] = {
      id: contractId,
      playerId: player.id,
      clubId: player.id === SELECTED_PLAYER_ID ? SELECTED_CLUB : AI_CLUB,
      type: "professional",
      startsOn: gameDate(19_500),
      endsOn: player.id === targetPlayerId || player.id === SELECTED_PLAYER_ID
        ? EXPIRY_DATE
        : gameDate(21_000),
      annualWage: STANDARD_WAGE,
      squadStatus: index < 11 ? "regular_starter" : "squad_player",
      bonuses: {
        signingBonus: nonNegativeMoney(10_000_00),
        appearanceBonus: nonNegativeMoney(1_000_00),
        goalBonus: nonNegativeMoney(1_000_00),
      },
    };
    contractHistory[historyId] = {
      id: historyId,
      sequenceNumber: index + 1,
      occurredOn: gameDate(19_500),
      event: "signed",
      contractId,
      playerId: player.id,
      clubId: player.id === SELECTED_PLAYER_ID ? SELECTED_CLUB : AI_CLUB,
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
    contractHistory,
    contractHistoryEntryIds: historyIds,
  });
}

function financeFixture(aiPlayerCount: number): ClubFinanceState {
  const selectedLedger = clubFinanceLedgerEntryId("finance-ledger:selected:opening");
  const aiLedger = clubFinanceLedgerEntryId("finance-ledger:ai:opening");
  const openingCash = nonNegativeMoney(100_000_000_00);
  return {
    currency: "EUR",
    clubIds: [SELECTED_CLUB, AI_CLUB],
    accounts: {
      [SELECTED_CLUB]: financeAccount(SELECTED_CLUB, STANDARD_WAGE, openingCash),
      [AI_CLUB]: financeAccount(AI_CLUB, nonNegativeMoney(STANDARD_WAGE * aiPlayerCount), openingCash),
    },
    ledgerEntries: {
      [selectedLedger]: openingLedger(selectedLedger, SELECTED_CLUB, 1, openingCash),
      [aiLedger]: openingLedger(aiLedger, AI_CLUB, 2, openingCash),
    },
    ledgerEntryIds: [selectedLedger, aiLedger],
  };
}

function createPlayer(
  clubIdValue: ClubId,
  index: number,
  position: PlayerPosition,
  ability: number,
  birthDate?: ReturnType<typeof gameDate>,
): Player {
  const id = clubIdValue === SELECTED_CLUB
    ? SELECTED_PLAYER_ID
    : playerId(`player:ai:${String(index).padStart(2, "0")}`);
  return {
    id,
    firstName: "Test",
    lastName: `${position.toUpperCase()} ${index}`,
    birthDate: birthDate ?? gameDate(index === 18 ? 7_500 : 10_500),
    naturalPositions: [position],
    primaryRole: roleForPosition(position),
    abilities: abilities(ability),
    potential: abilities(ability + 1),
  };
}

function positionForIndex(index: number): PlayerPosition {
  if (index < 2) return "gk";
  if (index < 8) return "cb";
  if (index < 14) return "cm";
  return "st";
}

function roleForPosition(position: PlayerPosition): NonNullable<Player["primaryRole"]> {
  if (position === "gk") return "goalkeeper";
  if (position === "cb") return "center_back";
  if (position === "cm") return "central_midfielder";
  return "striker";
}

function club(id: ClubId, name: string, playerIds: readonly PlayerId[]) {
  return { id, name, shortName: name, category: "third_division" as const, reputation: 5, playerIds };
}

function contractIdFor(id: PlayerId) {
  return playerContractId(`contract:${id}`);
}

function financeAccount(clubIdValue: ClubId, committedAnnualWage: number, cashBalance: number) {
  return {
    clubId: clubIdValue,
    currency: "EUR" as const,
    cashBalance: nonNegativeMoney(cashBalance),
    annualTransferBudget: nonNegativeMoney(10_000_000_00),
    availableTransferBudget: nonNegativeMoney(10_000_000_00),
    annualWageBudget: nonNegativeMoney(25_000_000_00),
    committedAnnualWage: nonNegativeMoney(committedAnnualWage),
    seasonIncome: nonNegativeMoney(0),
    seasonExpenses: nonNegativeMoney(0),
  };
}

function openingLedger(
  id: ReturnType<typeof clubFinanceLedgerEntryId>,
  clubIdValue: ClubId,
  sequenceNumber: number,
  cashBalance: number,
) {
  return {
    id,
    sequenceNumber,
    clubId: clubIdValue,
    occurredOn: CURRENT_DATE,
    currency: "EUR" as const,
    reason: "opening_capital" as const,
    direction: "credit" as const,
    amount: nonNegativeMoney(cashBalance),
    balanceAfter: nonNegativeMoney(cashBalance),
    referenceId: `world:${clubIdValue}`,
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

const SELECTED_PLAYER_ID = playerId("player:selected");
