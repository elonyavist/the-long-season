import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
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
  seasonTransferWindows,
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

import {
  applyCareerFreeAgentSigning as applyCareerFreeAgentSigningWithConfig,
} from "./apply-career-free-agent-signing.ts";
import { askingPriceConfigFixture } from "../test-fixtures/asking-price-config.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

function applyCareerFreeAgentSigning(
  input: Omit<
    Parameters<typeof applyCareerFreeAgentSigningWithConfig>[0],
    "valuationConfig" | "askingPriceConfig" | "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return applyCareerFreeAgentSigningWithConfig({
    ...input,
    valuationConfig: playerValuationConfigFixture(),
    askingPriceConfig: askingPriceConfigFixture(),
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
  });
}
import {
  offerContractRenewal as offerContractRenewalWithPolicy,
} from "./contract-negotiation.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import {
  replenishSeniorSquadsFromFreeAgents as replenishSeniorSquadsFromFreeAgentsWithPolicy,
} from "./senior-squad-replenishment.ts";

function offerContractRenewal(
  input: Omit<Parameters<typeof offerContractRenewalWithPolicy>[0], "wagePolicy">,
) {
  return offerContractRenewalWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
  });
}

function replenishSeniorSquadsFromFreeAgents(
  input: Omit<
    Parameters<typeof replenishSeniorSquadsFromFreeAgentsWithPolicy>[0],
    "wagePolicy" | "marketBehaviorPolicy" | "valuationConfig"
  >,
) {
  return replenishSeniorSquadsFromFreeAgentsWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    valuationConfig: playerValuationConfigFixture(),
  });
}

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
    transferWindows: openWindows(),
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
  assert.equal(result.completedFee, 0);
  assert.ok(result.publicValue > 0);
  assert.deepEqual(result.careerState.transferHistory.at(-1), {
    kind: "free_agent_signing",
    sequenceNumber: 1,
    occurredOn: CURRENT_DATE,
    buyingClubId: AI_CLUB,
    playerId: freeAgentId,
    publicValue: result.publicValue,
    completedFee: nonNegativeMoney(0),
  });
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
    transferWindows: openWindows(),
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

test("applyCareerFreeAgentSigning is not blocked by an unresolved renewal offer's pending wages", () => {
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
    transferWindows: openWindows(),
    acceptedTerms: acceptedTerms(),
  });

  // The pending renewal does not reserve wage budget; the signing is judged
  // against committed contracts only and completes.
  assert.equal(result.status, "applied");
});

test("applyCareerFreeAgentSigning is not blocked by an unresolved renewal offer's pending cash", () => {
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
    transferWindows: openWindows(),
    acceptedTerms: acceptedTerms(),
  });

  // The pending renewal's signing bonus does not reserve cash; the signing is
  // judged against the current cash balance only and completes.
  assert.equal(result.status, "applied");
});

test("applyCareerFreeAgentSigning rejects registration outside the transfer window", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 1 });
  const result = applyCareerFreeAgentSigning({
    careerState: fixture.careerState,
    playerId: fixture.freeAgentIds[0]!,
    clubId: AI_CLUB,
    occurredOn: CURRENT_DATE,
    transferWindows: closedWindows(),
    acceptedTerms: acceptedTerms(),
  });

  assert.equal(result.status, "rejected");
  if (result.status !== "rejected") return;
  assert.equal(result.reason, "outside_transfer_window");
  assert.strictEqual(result.careerState, fixture.careerState);
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

test("replenishSeniorSquadsFromFreeAgents gives hard violations priority over soft target depth", () => {
  const fixture = careerFixture({ aiPlayerCount: 22, freeAgentCount: 1 });
  const result = replenishSeniorSquadsFromFreeAgents({
    careerState: fixture.careerState,
    clubIds: [AI_CLUB, SELECTED_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.deepEqual(
    result.records.map(({ clubId: owner }) => owner),
    [SELECTED_CLUB, AI_CLUB],
  );
  assert.equal(result.records[0]?.beforeSquadSize, 1);
  assert.equal(result.records[0]?.addedPlayerIds.length, 1);
  assert.equal(result.records[1]?.beforeSquadSize, 22);
  assert.deepEqual(result.records[1]?.addedPlayerIds, []);
});

test("replenishSeniorSquadsFromFreeAgents shares a limited pool across every hard squad floor before adding depth", () => {
  const fixture = careerFixture({ aiPlayerCount: 17, freeAgentCount: 18 });
  const defenderIds = fixture.freeAgentIds.slice(1, 5);
  const careerState = createCareerState({
    ...fixture.careerState,
    gameState: {
      ...fixture.careerState.gameState,
      players: {
        ...fixture.careerState.gameState.players,
        ...Object.fromEntries(
          defenderIds.map((candidateId) => [
            candidateId,
            createPlayer(candidateId, "cb", "center_back", 8),
          ]),
        ),
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [SELECTED_CLUB, AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(
    result.careerState.gameState.clubs[SELECTED_CLUB]?.playerIds.length,
    18,
  );
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.length,
    18,
  );
  assert.equal(selectFreeAgentPlayerIds(result.careerState).length, 0);
});

test("replenishSeniorSquadsFromFreeAgents materializes one bounded reserve when exits exhaust the free-agent pool", () => {
  const fixture = careerFixture({ aiPlayerCount: 17, freeAgentCount: 0 });
  const reservePlayerId = playerId("player:intake:reserve-goalkeeper");

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState: fixture.careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
    intakeCandidates: [{
      player: createPlayer(
        reservePlayerId,
        "gk",
        "goalkeeper",
        8,
      ),
      playerState: {
        fitness: stateValue(100),
        form: stateValue(50),
        morale: stateValue(50),
      },
      targetClubId: AI_CLUB,
    }],
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.deepEqual(result.records[0]?.addedPlayerIds, [reservePlayerId]);
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(
      reservePlayerId,
    ),
    true,
  );
  assert.equal(selectFreeAgentPlayerIds(result.careerState).length, 0);
});

test("replenishSeniorSquadsFromFreeAgents grosses up budget reallocation for the wage utilization ceiling", () => {
  const fixture = careerFixture({ aiPlayerCount: 21, freeAgentCount: 1 });
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.notEqual(account, undefined);
  const constrainedAnnualWageBudget = nonNegativeMoney(
    Math.ceil(Number(account!.committedAnnualWage) * 10_000 / 9_800),
  );
  const careerState = createCareerState({
    ...fixture.careerState,
    gameState: {
      ...fixture.careerState.gameState,
      players: {
        ...fixture.careerState.gameState.players,
        [playerId("player:ai:02")]: createPlayer(
          playerId("player:ai:02"),
          "gk",
          "goalkeeper",
          8,
        ),
        [playerId("player:ai:14")]: createPlayer(
          playerId("player:ai:14"),
          "cb",
          "center_back",
          8,
        ),
      },
    },
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account!,
          annualWageBudget: constrainedAnnualWageBudget,
        },
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 22);
  assert.equal(result.records[0]?.addedPlayerIds.length, 1);
  assert.equal(result.wageBudgetReallocations.length, 1);
  const nextAccount = result.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.ok(
    Number(nextAccount?.committedAnnualWage ?? 0)
      <= Math.floor(Number(nextAccount?.annualWageBudget ?? 0) * 9_800 / 10_000),
  );
});

test("replenishSeniorSquadsFromFreeAgents repairs the structural wage ceiling within the calibrated tier maximum", () => {
  const fixture = careerFixture({ aiPlayerCount: 17, freeAgentCount: 1 });
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.notEqual(account, undefined);
  const constrainedAnnualWageBudget = nonNegativeMoney(
    Math.ceil(Number(account!.committedAnnualWage) * 10_000 / 9_800),
  );
  const careerState = createCareerState({
    ...fixture.careerState,
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account!,
          annualTransferBudget: nonNegativeMoney(0),
          availableTransferBudget: nonNegativeMoney(0),
          annualWageBudget: constrainedAnnualWageBudget,
        },
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.deepEqual(result.wageBudgetReallocations, []);
  assert.equal(result.structuralWageBudgetTopUps.length, 1);
  const nextAccount = result.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.ok(
    Number(nextAccount?.annualWageBudget ?? 0)
      <= 450_000_000,
  );
});

test("replenishSeniorSquadsFromFreeAgents replaces one costly outfielder when the hard floor is budget-blocked", () => {
  const fixture = careerFixture({ aiPlayerCount: 17, freeAgentCount: 2 });
  const senior = fixture.careerState.seniorSquadState!;
  const contracts = Object.fromEntries(
    senior.contractIds.map((contractId) => {
      const contract = senior.contracts[contractId]!;
      const annualWage = contract.playerId === playerId("player:ai:02")
        ? nonNegativeMoney(150_000_000)
        : nonNegativeMoney(18_687_500);
      return [
        contractId,
        contract.clubId === AI_CLUB
          ? { ...contract, annualWage }
          : contract,
      ];
    }),
  ) as SeniorSquadState["contracts"];
  const seniorSquadState = createSeniorSquadState(
    fixture.careerState.gameState,
    { ...senior, contracts },
  );
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB]!;
  const careerState = createCareerState({
    ...fixture.careerState,
    seniorSquadState,
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account,
          annualTransferBudget: nonNegativeMoney(0),
          availableTransferBudget: nonNegativeMoney(0),
          annualWageBudget: nonNegativeMoney(450_000_000),
          committedAnnualWage: nonNegativeMoney(449_000_000),
        },
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.equal(result.records[0]?.addedPlayerIds.length, 2);
  assert.equal(result.structuralReleases.length, 1);
  const releasedPlayerId = result.structuralReleases[0]?.playerId;
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(
      releasedPlayerId!,
    ),
    false,
  );
  assert.equal(
    selectFreeAgentPlayerIds(result.careerState).includes(releasedPlayerId!),
    true,
  );
  const nextAccount = result.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.ok(
    Number(nextAccount?.committedAnnualWage ?? 0)
      <= Number(nextAccount?.annualWageBudget ?? 0),
  );
});

test("replenishSeniorSquadsFromFreeAgents never releases the sole player in a broad department", () => {
  const fixture = careerFixture({ aiPlayerCount: 17, freeAgentCount: 2 });
  const soleDefenderId = playerId("player:ai:02");
  const releasableAttackerId = playerId("player:ai:03");
  const convertedDefenderIds = [
    playerId("player:ai:03"),
    playerId("player:ai:04"),
    playerId("player:ai:05"),
    playerId("player:ai:06"),
    playerId("player:ai:07"),
  ];
  const gameState: GameState = {
    ...fixture.careerState.gameState,
    players: {
      ...fixture.careerState.gameState.players,
      ...Object.fromEntries(
        convertedDefenderIds.map((candidateId) => [
          candidateId,
          createPlayer(candidateId, "st", "striker", 8),
        ]),
      ),
    },
  };
  const senior = fixture.careerState.seniorSquadState!;
  const contracts = Object.fromEntries(
    senior.contractIds.map((contractId) => {
      const contract = senior.contracts[contractId]!;
      if (contract.clubId !== AI_CLUB) return [contractId, contract];
      const annualWage = contract.playerId === soleDefenderId
        ? nonNegativeMoney(150_000_000)
        : contract.playerId === releasableAttackerId
          ? nonNegativeMoney(140_000_000)
          : nonNegativeMoney(10_600_000);
      return [contractId, { ...contract, annualWage }];
    }),
  ) as SeniorSquadState["contracts"];
  const seniorSquadState = createSeniorSquadState(gameState, {
    ...senior,
    contracts,
  });
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB]!;
  const careerState = createCareerState({
    ...fixture.careerState,
    gameState,
    seniorSquadState,
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account,
          annualTransferBudget: nonNegativeMoney(0),
          availableTransferBudget: nonNegativeMoney(0),
          annualWageBudget: nonNegativeMoney(450_000_000),
          committedAnnualWage: nonNegativeMoney(449_000_000),
        },
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(
      soleDefenderId,
    ),
    true,
  );
  assert.equal(
    result.structuralReleases.some(
      ({ playerId: releasedPlayerId }) =>
        releasedPlayerId === releasableAttackerId,
    ),
    true,
  );
});

test("replenishSeniorSquadsFromFreeAgents preserves wage room for the whole hard squad floor", () => {
  const fixture = careerFixture({ aiPlayerCount: 7, freeAgentCount: 30 });
  const senior = fixture.careerState.seniorSquadState!;
  let aiContractIndex = 0;
  const contracts = Object.fromEntries(
    senior.contractIds.map((contractId) => {
      const contract = senior.contracts[contractId]!;
      if (contract.clubId !== AI_CLUB) return [contractId, contract];
      const annualWage = nonNegativeMoney(
        aiContractIndex === 0 ? 64_142_858 : 64_142_857,
      );
      aiContractIndex += 1;
      return [contractId, { ...contract, annualWage }];
    }),
  ) as SeniorSquadState["contracts"];
  const seniorSquadState = createSeniorSquadState(
    fixture.careerState.gameState,
    { ...senior, contracts },
  );
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB]!;
  const careerState = createCareerState({
    ...fixture.careerState,
    seniorSquadState,
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account,
          annualTransferBudget: nonNegativeMoney(0),
          availableTransferBudget: nonNegativeMoney(0),
          annualWageBudget: nonNegativeMoney(450_000_000),
          committedAnnualWage: nonNegativeMoney(449_000_000),
        },
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.ok((result.records[0]?.afterSquadSize ?? 0) >= 18);
  assert.equal(
    result.records[0]?.warnings.includes("below_minimum_squad_size"),
    false,
  );
  const nextAccount = result.careerState.clubFinanceState?.accounts[AI_CLUB];
  assert.ok(
    Number(nextAccount?.committedAnnualWage ?? 0)
      <= Number(nextAccount?.annualWageBudget ?? 0),
  );
});

test("replenishSeniorSquadsFromFreeAgents replaces one costly outfielder to restore a missing department", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 2 });
  const midfielderId = fixture.freeAgentIds[1]!;
  const midfielderIds = fixture.careerState.gameState.clubs[AI_CLUB]!.playerIds.filter(
    (candidateId) =>
      fixture.careerState.gameState.players[candidateId]?.primaryRole
        === "central_midfielder",
  );
  const players = {
    ...fixture.careerState.gameState.players,
    [playerId("player:ai:02")]: createPlayer(
      playerId("player:ai:02"),
      "gk",
      "goalkeeper",
      8,
    ),
    ...Object.fromEntries(
      midfielderIds.map((candidateId) => [
        candidateId,
        createPlayer(candidateId, "cb", "center_back", 8),
      ]),
    ),
  } as GameState["players"];
  const gameState: GameState = {
    ...fixture.careerState.gameState,
    players,
  };
  const senior = fixture.careerState.seniorSquadState!;
  const contracts = Object.fromEntries(
    senior.contractIds.map((contractId) => {
      const contract = senior.contracts[contractId]!;
      return [
        contractId,
        contract.clubId === AI_CLUB
          ? {
              ...contract,
              annualWage: contract.playerId === playerId("player:ai:03")
                ? nonNegativeMoney(150_000_000)
                : nonNegativeMoney(17_647_058),
            }
          : contract,
      ];
    }),
  ) as SeniorSquadState["contracts"];
  const seniorSquadState = createSeniorSquadState(gameState, {
    ...senior,
    contracts,
  });
  const account = fixture.careerState.clubFinanceState?.accounts[AI_CLUB]!;
  const committedAnnualWage = nonNegativeMoney(
    seniorSquadState.activeContractIds.reduce((sum, contractId) => {
      const contract = seniorSquadState.contracts[contractId];
      return contract?.clubId === AI_CLUB ? sum + contract.annualWage : sum;
    }, 0),
  );
  const careerState = createCareerState({
    ...fixture.careerState,
    selectedClubId: AI_CLUB,
    gameState,
    seniorSquadState,
    clubFinanceState: {
      ...fixture.careerState.clubFinanceState!,
      accounts: {
        ...fixture.careerState.clubFinanceState!.accounts,
        [AI_CLUB]: {
          ...account,
          annualTransferBudget: nonNegativeMoney(0),
          availableTransferBudget: nonNegativeMoney(0),
          annualWageBudget: nonNegativeMoney(450_000_000),
          committedAnnualWage,
        },
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.equal(result.records[0]?.addedPlayerIds.includes(midfielderId), true);
  assert.equal(result.structuralReleases.length, 1);
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.some(
      (candidateId) =>
        result.careerState.gameState.players[candidateId]?.primaryRole
          === "central_midfielder",
    ),
    true,
  );
});

test("replenishSeniorSquadsFromFreeAgents gives a useful prime-age free agent credible priority", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 8 });
  const usefulGoalkeeperId = fixture.freeAgentIds[0]!;
  const result = replenishSeniorSquadsFromFreeAgents({
    careerState: fixture.careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.addedPlayerIds[0], usefulGoalkeeperId);
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(usefulGoalkeeperId),
    true,
  );
});

test("replenishSeniorSquadsFromFreeAgents restores the hard squad minimum when the preferred department is unavailable", () => {
  const fixture = careerFixture({ aiPlayerCount: 17, freeAgentCount: 1 });
  const fallbackPlayerId = fixture.freeAgentIds[0]!;
  const careerState = createCareerState({
    ...fixture.careerState,
    gameState: {
      ...fixture.careerState.gameState,
      players: {
        ...fixture.careerState.gameState.players,
        [fallbackPlayerId]: createPlayer(
          fallbackPlayerId,
          "cm",
          "central_midfielder",
          10,
        ),
      },
    },
  });

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.equal(result.records[0]?.addedPlayerIds[0], fallbackPlayerId);
  assert.equal(result.records[0]?.warnings.includes("below_minimum_squad_size"), false);
  assert.equal(result.records[0]?.warnings.includes("weak_goalkeeper_depth"), true);
});

test("replenishSeniorSquadsFromFreeAgents does not pad a structurally complete squad", () => {
  const fixture = careerFixture({ aiPlayerCount: 22, freeAgentCount: 8 });
  const replacementGoalkeeperId = playerId("player:ai:22");
  const structurallyComplete = createCareerState({
    ...fixture.careerState,
    gameState: {
      ...fixture.careerState.gameState,
      players: {
        ...fixture.careerState.gameState.players,
        [replacementGoalkeeperId]: createPlayer(
          replacementGoalkeeperId,
          "gk",
          "goalkeeper",
          8,
        ),
      },
    },
  });
  const result = replenishSeniorSquadsFromFreeAgents({
    careerState: structurallyComplete,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.deepEqual(result.records[0]?.addedPlayerIds, []);
  assert.equal(result.records[0]?.afterSquadSize, 22);
  assert.equal(selectFreeAgentPlayerIds(result.careerState).length, 8);
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

test("replenishSeniorSquadsFromFreeAgents may re-sign a same-day departure to recover a zero-coverage department", () => {
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

test("replenishSeniorSquadsFromFreeAgents may re-sign a same-day midfielder when the department reaches zero", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 0 });
  const midfielderIds = fixture.careerState.gameState.clubs[AI_CLUB]!.playerIds.filter(
    (candidateId) =>
      fixture.careerState.gameState.players[candidateId]?.primaryRole
        === "central_midfielder",
  );
  const departingMidfielderId = midfielderIds[0]!;
  const gameState: GameState = {
    ...fixture.careerState.gameState,
    players: {
      ...fixture.careerState.gameState.players,
      ...Object.fromEntries(
        midfielderIds.slice(1).map((candidateId) => [
          candidateId,
          createPlayer(candidateId, "cb", "center_back", 8),
        ]),
      ),
    },
  };
  const careerStateWithOneMidfielder = createCareerState({
    ...fixture.careerState,
    gameState,
    seniorSquadState: createSeniorSquadState(
      gameState,
      fixture.careerState.seniorSquadState!,
    ),
  });
  const careerState = expirePlayerFromClub(
    careerStateWithOneMidfielder,
    AI_CLUB,
    departingMidfielderId,
  );

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.equal(result.records[0]?.addedPlayerIds[0], departingMidfielderId);
  assert.equal(
    result.records[0]?.warnings.includes("weak_midfielder_depth"),
    true,
  );
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(
      departingMidfielderId,
    ),
    true,
  );
});

test("replenishSeniorSquadsFromFreeAgents may re-sign a same-day departure only to restore the hard squad floor", () => {
  const fixture = careerFixture({ aiPlayerCount: 18, freeAgentCount: 0 });
  const departingAttackerId = fixture.careerState.gameState.clubs[AI_CLUB]!.playerIds.at(-1)!;
  const careerState = expirePlayerFromClub(
    fixture.careerState,
    AI_CLUB,
    departingAttackerId,
  );

  const result = replenishSeniorSquadsFromFreeAgents({
    careerState,
    clubIds: [AI_CLUB],
    occurredOn: CURRENT_DATE,
  });

  assert.equal(result.records[0]?.afterSquadSize, 18);
  assert.equal(result.records[0]?.addedPlayerIds[0], departingAttackerId);
  assert.equal(
    result.careerState.gameState.clubs[AI_CLUB]?.playerIds.includes(
      departingAttackerId,
    ),
    true,
  );
});

test("replenishSeniorSquadsFromFreeAgents does not immediately re-sign a departure when goalkeeper cover remains", () => {
  const fixture = careerFixture({ aiPlayerCount: 19, freeAgentCount: 0 });
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

function openWindows() {
  return seasonTransferWindows({
    competitionId: competitionId("competition:signing"),
    seasonId: seasonId("season:signing"),
    windows: [
      { opensOn: gameDate(CURRENT_DATE - 5), closesOn: gameDate(CURRENT_DATE + 5) },
      { opensOn: gameDate(CURRENT_DATE + 100), closesOn: gameDate(CURRENT_DATE + 110) },
    ],
  });
}

function closedWindows() {
  return seasonTransferWindows({
    competitionId: competitionId("competition:signing"),
    seasonId: seasonId("season:signing"),
    windows: [
      { opensOn: gameDate(CURRENT_DATE - 20), closesOn: gameDate(CURRENT_DATE - 10) },
      { opensOn: gameDate(CURRENT_DATE + 100), closesOn: gameDate(CURRENT_DATE + 110) },
    ],
  });
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
