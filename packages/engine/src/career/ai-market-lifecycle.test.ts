import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  createCareerState,
  createClubFinanceState,
  createSeniorSquadState,
  gameDate,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerContractId,
  playerId,
  saveId,
  seasonTransferWindows,
  seasonId,
  seniorSquadRegistrationId,
  stateValue,
  type CareerState,
  type Club,
  type ClubFinanceState,
  type ClubId,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeniorSquadState,
} from "@game/domain";

import {
  advanceAiMarketLifecycle as advanceAiMarketLifecycleWithConfig,
  aiMarketTargetDepartment,
  deriveAiMarketTargetScore,
  deriveAiTransferAffordabilitySnapshot,
  deriveAiTransferOfferFee,
  deriveAiMarketNeeds as deriveAiMarketNeedsWithPolicy,
} from "./ai-market-lifecycle.ts";
import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { askingPriceConfigFixture } from "../test-fixtures/asking-price-config.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";

/** Tests for deterministic AI market behavior through canonical negotiations. */

const VALUATION_CONFIG = playerValuationConfigFixture();
const ASKING_PRICE_CONFIG = askingPriceConfigFixture();
const MARKET_BEHAVIOR_POLICY = marketBehaviorConfigFixture();

test("live AI market policy cannot bypass the canonical public assessment", () => {
  const liveOwnerPaths = [
    "./ai-market-lifecycle.ts",
    "./ai-contract-lifecycle.ts",
    "../team-selection/ai-squad-selection.ts",
    "../market/player-willingness.ts",
    "./contract-negotiation-demand.ts",
    "./progress-fixture.ts",
    "../use-cases/simulate-season.ts",
    "./youth-promotion.ts",
    "./youth-lifecycle.ts",
    "../../../../apps/cli/src/commands/career/roster-output.ts",
  ] as const;
  const forbiddenPatterns = [
    /derivePlayerMarketAbility/,
    /\bplayer\s*\.\s*potential\b/,
    /\bderivePlayerPotentialProjection\b/,
    /\brolePotentialAbility\b/,
    /\bstoredCeiling\b/,
  ] as const;

  for (const relativePath of liveOwnerPaths) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    for (const forbiddenPattern of forbiddenPatterns) {
      assert.doesNotMatch(
        source,
        forbiddenPattern,
        `${relativePath} bypasses PublicPlayerAssessment through ${String(forbiddenPattern)}`,
      );
    }
  }
});

test("AI clubs penalize wider public uncertainty according to category risk appetite", () => {
  const narrowAssessment = publicAssessmentFixture({ upperAbility: 14, upperStars: 4 });
  const wideAssessment = publicAssessmentFixture({ upperAbility: 18, upperStars: 5.5 });
  const sharedInputs = {
    roleNeedScore: 50,
    affordabilityScore: 50,
    policy: MARKET_BEHAVIOR_POLICY,
  } as const;

  const narrowFirstDivisionScore = deriveAiMarketTargetScore({
    ...sharedInputs,
    assessment: narrowAssessment,
    buyingClubCategory: "first_division",
  });
  const wideFirstDivisionScore = deriveAiMarketTargetScore({
    ...sharedInputs,
    assessment: wideAssessment,
    buyingClubCategory: "first_division",
  });
  const wideThirdDivisionScore = deriveAiMarketTargetScore({
    ...sharedInputs,
    assessment: wideAssessment,
    buyingClubCategory: "third_division",
  });

  assert.equal(narrowFirstDivisionScore, 5_400);
  assert.equal(wideFirstDivisionScore, 5_360);
  assert.equal(wideThirdDivisionScore, 5_280);
  assert.equal(narrowFirstDivisionScore > wideFirstDivisionScore, true);
  assert.equal(wideFirstDivisionScore > wideThirdDivisionScore, true);
});

function publicAssessmentFixture(input: {
  readonly upperAbility: number;
  readonly upperStars: PublicPlayerAssessment["upperRating"]["stars"];
}): PublicPlayerAssessment {
  return {
    playerId: playerId("player:risk-appetite"),
    assessedOn: gameDate(20_000),
    age: 18,
    roleFamily: "outfield",
    currentAbility: 10,
    p50Ability: 14,
    upperAbility: input.upperAbility,
    currentRating: { stars: 3 },
    p50Rating: { stars: 4 },
    upperRating: { stars: input.upperStars },
  };
}

function deriveAiMarketNeeds(
  input: Omit<
    Parameters<typeof deriveAiMarketNeedsWithPolicy>[0],
    "valuationConfig" | "marketBehaviorPolicy"
  >,
) {
  return deriveAiMarketNeedsWithPolicy({
    ...input,
    valuationConfig: VALUATION_CONFIG,
    marketBehaviorPolicy: MARKET_BEHAVIOR_POLICY,
  });
}

function advanceAiMarketLifecycle(
  input: Omit<
    Parameters<typeof advanceAiMarketLifecycleWithConfig>[0],
    "valuationConfig" | "askingPriceConfig" | "wagePolicy" | "marketBehaviorPolicy"
  >,
) {
  return advanceAiMarketLifecycleWithConfig({
    ...input,
    valuationConfig: VALUATION_CONFIG,
    askingPriceConfig: ASKING_PRICE_CONFIG,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: MARKET_BEHAVIOR_POLICY,
  });
}

test("AI offer policy deterministically reaches reject, counter, and asking bands within capacity", () => {
  const askingPrice = nonNegativeMoney(10_000_000);
  const observedOffers = new Set<number>();
  for (let index = 0; index < 200; index += 1) {
    observedOffers.add(deriveAiTransferOfferFee({
      askingPrice,
      maximumAffordableFee: askingPrice,
      buyingClubId: clubId("club:buyer"),
      playerId: playerId(`player:offer-band-${index}`),
      submittedOn: gameDate(20_000),
      policy: MARKET_BEHAVIOR_POLICY.aiTransferOffer,
    }));
  }

  assert.equal([...observedOffers].some((fee) => fee < askingPrice * 0.75), true);
  assert.equal(
    [...observedOffers].some(
      (fee) => fee >= askingPrice * 0.75 && fee < askingPrice,
    ),
    true,
  );
  assert.equal(observedOffers.has(askingPrice), true);
  assert.equal(
    deriveAiTransferOfferFee({
      askingPrice,
      maximumAffordableFee: nonNegativeMoney(6_000_000),
      buyingClubId: clubId("club:buyer"),
      playerId: playerId("player:affordability-bound"),
      submittedOn: gameDate(20_000),
      policy: MARKET_BEHAVIOR_POLICY.aiTransferOffer,
    }) <= 6_000_000,
    true,
  );
  assert.deepEqual(
    deriveAiTransferAffordabilitySnapshot({
      account: {
        clubId: clubId("club:buyer"),
        currency: "EUR",
        cashBalance: nonNegativeMoney(100_000_000),
        annualTransferBudget: nonNegativeMoney(50_000_000),
        availableTransferBudget: nonNegativeMoney(50_000_000),
        annualWageBudget: nonNegativeMoney(20_000_000),
        committedAnnualWage: nonNegativeMoney(0),
        seasonIncome: nonNegativeMoney(0),
        seasonExpenses: nonNegativeMoney(0),
      },
      policy: MARKET_BEHAVIOR_POLICY.affordability,
    }),
    {
      availableTransferCapacity: nonNegativeMoney(45_000_000),
      availableCashCapacity: nonNegativeMoney(98_000_000),
      maximumAffordableFee: nonNegativeMoney(45_000_000),
    },
  );
});

test("deriveAiMarketNeeds orders structural department gaps before softer needs", () => {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, balancedSeniorSquad("seller")),
  ]);

  const needs = deriveAiMarketNeeds({
    careerState,
    asOf: gameDate(20_000),
  });

  assert.equal(needs[0]?.clubId, buyer);
  assert.equal(needs[0]?.reasons[0], "structural_depth");
  assert.equal(needs.filter((need) => need.clubId === buyer).length, 3);
  assert.deepEqual(
    needs.filter((need) => need.clubId === buyer).map((need) =>
      aiMarketTargetDepartment(need.target)
    ),
    ["defender", "midfielder", "attacker"],
  );
});

test("advanceAiMarketLifecycle starts no permanent negotiation outside a window", () => {
  const careerState = marketFixture();
  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_020),
    transferWindows: marketWindows({
      summer: [19_900, 19_950],
      winter: [20_200, 20_220],
    }),
  });

  assert.equal(result.facts.some((fact) => fact.event === "club_offer_submitted"), false);
  assert.equal(
    result.diagnostics.some(
      (fact) =>
        fact.event === "permanent_target_unavailable"
        && fact.reason === "transfer_window_closed",
    ),
    true,
  );
  assert.equal(result.careerState.transferNegotiationState?.negotiationIds.length ?? 0, 0);
  assert.equal(result.careerState.transferHistory.length, 0);
});

test("advanceAiMarketLifecycle is deterministic and completes transfers through canonical state", () => {
  const careerState = marketFixture();
  const input = {
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  } as const;

  const first = advanceAiMarketLifecycle(input);
  const second = advanceAiMarketLifecycle(input);

  assert.deepEqual(second, first);
  assert.equal(first.diagnostics.some((fact) => fact.event === "need_evaluated"), true);
  assert.equal(first.diagnostics.some((fact) => fact.event === "permanent_target_found"), true);
  assert.equal(first.facts.some((fact) => fact.event === "club_offer_submitted"), true);
  assert.equal(first.facts.some((fact) => fact.event === "transfer_completed"), true);
  assert.equal(first.careerState.transferHistory.length > 0, true);
  assert.equal(
    first.careerState.seniorSquadState?.contractHistoryEntryIds.length,
    first.careerState.transferHistory.length * 2,
  );
});

test("advanceAiMarketLifecycle lets the strongest first-division squad prioritize a lower-tier six-star prospect", () => {
  const higherReputationBuyer = clubId("club:elite-buyer");
  const strongestBuyer = clubId("club:elite-strongest");
  const secondDivisionClub = clubId("club:elite-second");
  const seller = clubId("club:elite-seller");
  const prospect = playerWithPotentialFixture(
    playerId("player:elite-prospect"),
    "cm",
    10,
    17,
  );
  const baseCareerState = careerStateFixture(
    [
      clubFixture(
        higherReputationBuyer,
        10,
        balancedSeniorSquad("elite-buyer"),
      ),
      clubFixture(
        strongestBuyer,
        9,
        balancedSeniorSquadAtAbility("elite-strongest", 14),
      ),
      clubFixture(
        secondDivisionClub,
        6,
        balancedSeniorSquad("elite-second"),
      ),
      clubFixture(seller, 4, [
        prospect.id,
        ...balancedSeniorSquad("elite-seller"),
      ]),
    ],
    new Map([
      [higherReputationBuyer, "first_division"],
      [strongestBuyer, "first_division"],
      [secondDivisionClub, "second_division"],
      [seller, "third_division"],
    ]),
  );
  const expiringBuyerMidfielderId =
    baseCareerState.gameState.clubs[strongestBuyer]?.playerIds.find(
      (candidateId) =>
        baseCareerState.gameState.players[candidateId]?.primaryRole
          === "central_midfielder",
    );
  assert.notEqual(expiringBuyerMidfielderId, undefined);
  const careerState = withContractEndDate(
    baseCareerState,
    expiringBuyerMidfielderId!,
    gameDate(20_100),
  );
  const ordinaryBuyerNeeds = deriveAiMarketNeeds({
    careerState,
    asOf: gameDate(20_000),
  }).filter((need) => need.clubId === strongestBuyer);
  assert.equal(
    ordinaryBuyerNeeds.some((need) =>
      need.target.kind === "department" && need.target.department === "midfielder"
    ),
    true,
  );

  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  });

  assert.equal(
    result.facts.some(
      (fact) =>
        fact.buyingClubId === strongestBuyer
        && fact.playerId === prospect.id
        && fact.event === "club_offer_submitted"
        && fact.reason === "elite_prospect_opportunity",
    ),
    true,
  );
  assert.equal(
    result.facts.some(
      (fact) =>
        fact.buyingClubId === strongestBuyer
        && fact.playerId === prospect.id
        && fact.event === "transfer_completed",
    ),
    true,
  );
  assert.equal(
    result.careerState.gameState.clubs[strongestBuyer]?.playerIds.includes(
      prospect.id,
    ),
    true,
  );
});

test("advanceAiMarketLifecycle protects the selected club and seller department floors", () => {
  const buyer = clubId("club:buyer");
  const protectedSeller = clubId("club:protected-seller");
  const careerState = careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(protectedSeller, 6, [
      ...playersForClub("protected-seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ]),
    ]),
  ]);
  const selectedClubId = careerState.selectedClubId;
  const selectedBefore = careerState.gameState.clubs[selectedClubId]?.playerIds;
  const protectedBefore = careerState.gameState.clubs[protectedSeller]?.playerIds;
  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  });

  assert.deepEqual(result.careerState.gameState.clubs[selectedClubId]?.playerIds, selectedBefore);
  assert.equal(
    result.facts.some((fact) =>
      fact.buyingClubId === selectedClubId || fact.sellingClubId === selectedClubId
    ),
    false,
  );
  const protectedAfter = result.careerState.gameState.clubs[protectedSeller]?.playerIds ?? [];
  const remainingDefenders = protectedAfter.filter((playerIdValue) =>
    careerState.gameState.players[playerIdValue]?.naturalPositions.includes("cb")
  ).length;
  assert.equal((protectedBefore?.length ?? 0) >= protectedAfter.length, true);
  assert.equal(protectedAfter.length >= 18, true);
  assert.equal(remainingDefenders, 6);
});

test("deriveAiMarketNeeds identifies a weak depth outlier as a current squad upgrade", () => {
  const careerState = withContractEndDate(
    upgradeNeedFixture(),
    playerId("player:upgrade-weak-defender"),
    gameDate(20_150),
  );
  const needs = deriveAiMarketNeeds({
    careerState,
    asOf: gameDate(20_000),
  });
  const defenderNeed = needs.find(
    (need) =>
      need.clubId === clubId("club:buyer")
      && need.target.kind === "department"
      && need.target.department === "defender",
  );

  assert.notEqual(defenderNeed, undefined);
  assert.equal(defenderNeed?.currentDepth, 10);
  assert.equal(defenderNeed?.targetDepth, 7);
  assert.deepEqual(defenderNeed?.reasons, ["quality_gap"]);
});

test("role succession recruits the exact role through the canonical transfer path", () => {
  const buyer = clubId("club:succession-buyer");
  const seller = clubId("club:succession-seller");
  const buyerPlayers = balancedSeniorSquad("succession-buyer").map((id) => {
    const player = playerLookup.get(id);
    assert.ok(player !== undefined);
    if (player.primaryRole !== "striker") return id;
    const aging = { ...player, birthDate: gameDate(20_000 - 34 * 365) };
    playerLookup.set(id, aging);
    return id;
  });
  const movableStriker = playerFixture(
    playerId("player:succession-striker"),
    "st",
    12,
  );
  const careerState = careerStateFixture([
    clubFixture(buyer, 6, buyerPlayers),
    clubFixture(seller, 5, [
      movableStriker.id,
      ...balancedSeniorSquad("succession-seller"),
    ]),
  ]);
  const needs = deriveAiMarketNeeds({ careerState, asOf: gameDate(20_000) });
  const need = needs.find(({ clubId: needClubId, target }) =>
    needClubId === buyer && target.kind === "role" && target.role === "striker"
  );

  assert.notEqual(need, undefined);
  assert.deepEqual(need?.reasons, ["role_succession"]);
  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  });

  assert.equal(
    result.diagnostics.some((fact) =>
      fact.clubId === buyer
      && fact.target.kind === "role"
      && fact.target.role === "striker"
      && fact.event === "permanent_target_found"
    ),
    true,
  );
  assert.equal(
    result.facts.some((fact) =>
      fact.buyingClubId === buyer
      && fact.playerId === movableStriker.id
      && fact.event === "transfer_completed"
    ),
    true,
  );
});

test("a financially constrained club may still make no permanent offer in an open window", () => {
  const careerState = marketFixture();
  const buyer = clubId("club:buyer");
  const buyerAccount = careerState.clubFinanceState?.accounts[buyer];
  assert.notEqual(buyerAccount, undefined);
  const constrainedState: CareerState = {
    ...careerState,
    clubFinanceState: {
      ...careerState.clubFinanceState!,
      accounts: {
        ...careerState.clubFinanceState?.accounts,
        [buyer]: {
          ...buyerAccount!,
          cashBalance: nonNegativeMoney(0),
          availableTransferBudget: nonNegativeMoney(0),
        },
      },
    },
  };
  const result = advanceAiMarketLifecycle({
    careerState: constrainedState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_030),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  });

  assert.equal(
    result.facts.some(
      (fact) => fact.buyingClubId === buyer && fact.event === "club_offer_submitted",
    ),
    false,
  );
  assert.equal(
    result.diagnostics.some(
      (fact) => fact.clubId === buyer && fact.reason === "club_cannot_recruit",
    ),
    true,
  );
});

test("an in-window preliminary fallback waits until every permanent department need is evaluated", () => {
  const careerState = withContractEndDate(
    fallbackPriorityFixture(),
    playerId("player:seller-01"),
    gameDate(20_150),
  );
  const result = advanceAiMarketLifecycle({
    careerState,
    fromDate: gameDate(20_000),
    throughDate: gameDate(20_001),
    transferWindows: marketWindows({
      summer: [19_990, 20_050],
      winter: [20_200, 20_220],
    }),
  });

  assert.equal(
    result.diagnostics.some(
      (fact) =>
        fact.clubId === clubId("club:buyer")
        && fact.target.kind === "department"
        && fact.target.department === "goalkeeper"
        && fact.reason === "seller_department_floor",
    ),
    true,
  );
  assert.equal(
    result.facts.some(
      (fact) =>
        fact.buyingClubId === clubId("club:buyer")
        && fact.event === "club_offer_submitted",
    ),
    true,
  );
});

function marketFixture(): CareerState {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  return careerStateFixture([
    clubFixture(buyer, 5, playersForClub("buyer", ["gk", "gk", "cb", "cm", "st"])),
    clubFixture(seller, 6, [
      playerFixture(playerId("player:movable"), "cb", 15).id,
      ...playersForClubAtAbility("seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st", "st", "st",
      ], 10),
    ]),
  ]);
}

function fallbackPriorityFixture(): CareerState {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  return careerStateFixture([
    clubFixture(buyer, 5, [
      ...playersForClubAtAbility("buyer-gk", ["gk"], 10),
      ...playersForClubAtAbility("buyer-def", ["cb", "cb", "cb", "cb", "cb", "cb"], 5),
      ...playersForClubAtAbility("buyer-mid", ["cm", "cm", "cm", "cm", "cm", "cm", "cm"], 15),
      ...playersForClubAtAbility("buyer-att", ["st", "st", "st", "st"], 15),
    ]),
    clubFixture(seller, 6, [
      ...playersForClubAtAbility("seller", [
        "gk", "gk",
        "cb", "cb", "cb", "cb", "cb", "cb", "cb",
        "cm", "cm", "cm", "cm", "cm", "cm", "cm",
        "st", "st", "st", "st",
      ], 10),
    ]),
  ]);
}

function upgradeNeedFixture(): CareerState {
  const buyer = clubId("club:buyer");
  const seller = clubId("club:seller");
  return careerStateFixture([
    clubFixture(buyer, 5, [
      ...playersForClubAtAbility("upgrade-gk", ["gk", "gk"], 10),
      playerFixture(playerId("player:upgrade-weak-defender"), "cb", 2).id,
      ...playersForClubAtAbility(
        "upgrade-def",
        ["cb", "cb", "cb", "cb", "cb", "cb", "cb", "cb", "cb"],
        10,
      ),
      ...playersForClubAtAbility(
        "upgrade-mid",
        ["cm", "cm", "cm", "cm", "cm", "cm"],
        10,
      ),
      ...playersForClubAtAbility("upgrade-att", ["st", "st", "st", "st"], 10),
    ]),
    clubFixture(seller, 6, balancedSeniorSquad("upgrade-seller")),
  ]);
}

function withContractEndDate(
  careerState: CareerState,
  targetPlayerId: PlayerId,
  endsOn: ReturnType<typeof gameDate>,
): CareerState {
  const contractId = careerState.seniorSquadState?.activeContractIds.find(
    (candidateId) =>
      careerState.seniorSquadState?.contracts[candidateId]?.playerId === targetPlayerId,
  );
  const contract = contractId === undefined
    ? undefined
    : careerState.seniorSquadState?.contracts[contractId];
  assert.notEqual(contract, undefined);
  return {
    ...careerState,
    seniorSquadState: {
      ...careerState.seniorSquadState!,
      contracts: {
        ...careerState.seniorSquadState?.contracts,
        [contractId!]: { ...contract!, endsOn },
      },
    },
  };
}

function balancedSeniorSquad(prefix: string): PlayerId[] {
  return playersForClub(prefix, [
    "gk", "gk",
    "cb", "cb", "cb", "cb", "cb", "cb",
    "cm", "cm", "cm", "cm", "cm", "cm", "cm",
    "st", "st", "st", "st", "st", "st",
  ]);
}

function balancedSeniorSquadAtAbility(
  prefix: string,
  ability: number,
): PlayerId[] {
  return playersForClubAtAbility(prefix, [
    "gk", "gk",
    "cb", "cb", "cb", "cb", "cb", "cb",
    "cm", "cm", "cm", "cm", "cm", "cm", "cm",
    "st", "st", "st", "st", "st", "st",
  ], ability);
}

function marketWindows(input: {
  readonly summer: readonly [number, number];
  readonly winter: readonly [number, number];
}) {
  return seasonTransferWindows({
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:0001"),
    windows: [
      { opensOn: gameDate(input.summer[0]), closesOn: gameDate(input.summer[1]) },
      { opensOn: gameDate(input.winter[0]), closesOn: gameDate(input.winter[1]) },
    ],
  });
}

function careerStateFixture(
  clubs: readonly Club[],
  categoryByClubId: ReadonlyMap<ClubId, Club["category"]> = new Map(),
): CareerState {
  const selectedClub = clubFixture(clubId("club:user"), 5, []);
  const worldClubs = [selectedClub, ...clubs].map((club, index): Club => ({
    ...club,
    category: categoryByClubId.get(club.id)
      ?? (
        index === 0
          ? "first_division"
          : index === 1
            ? "second_division"
            : "third_division"
      ),
  }));
  const players: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const club of worldClubs) {
    for (const clubPlayerId of club.playerIds) {
      const player = playerLookup.get(clubPlayerId);
      if (player === undefined) {
        throw new Error(`missing fixture player: ${clubPlayerId}`);
      }
      players[clubPlayerId] = player;
      playerIds.push(clubPlayerId);
      playerStates[clubPlayerId] = playerStateFixture();
    }
  }

  const selectedClubId = selectedClub.id;
  const firstCompetitionId = competitionId("competition:test-first");
  const secondCompetitionId = competitionId("competition:test-second");
  const thirdCompetitionId = competitionId("competition:test-third");
  const gameState: GameState = {
    meta: {
      seed: "transfer-turnover-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players: players as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: Object.fromEntries(worldClubs.map((club) => [club.id, club])) as GameState["clubs"],
    clubIds: worldClubs.map((club) => club.id),
    fixtures: {},
    fixtureIds: [],
    domesticCompetitionWorld: {
      competitionIds: [
        firstCompetitionId,
        secondCompetitionId,
        thirdCompetitionId,
      ],
      competitions: {
        [firstCompetitionId]: competitionFixture(
          firstCompetitionId,
          "First",
          worldClubs
            .filter(({ category }) => category === "first_division")
            .map(({ id }) => id),
        ),
        [secondCompetitionId]: competitionFixture(
          secondCompetitionId,
          "Second",
          worldClubs
            .filter(({ category }) => category === "second_division")
            .map(({ id }) => id),
        ),
        [thirdCompetitionId]: competitionFixture(
          thirdCompetitionId,
          "Third",
          worldClubs
            .filter(({ category }) => category === "third_division")
            .map(({ id }) => id),
        ),
      },
      seasonHistory: [],
    },
  };
  const seniorSquadState = canonicalSeniorSquadState(gameState);

  return createCareerState({
    saveId: saveId("save:transfer-turnover"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState,
    transferHistory: [],
    seniorSquadState,
    clubFinanceState: canonicalClubFinanceState(gameState, seniorSquadState),
  });
}

function competitionFixture(
  id: ReturnType<typeof competitionId>,
  name: string,
  clubIds: readonly ClubId[],
) {
  return {
    id,
    name,
    clubIds,
    matchRules: {
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
  };
}

function canonicalSeniorSquadState(gameState: GameState): SeniorSquadState {
  const registrations: Record<string, SeniorSquadState["registrations"][keyof SeniorSquadState["registrations"]]> = {};
  const registrationIds: SeniorSquadState["registrationIds"][number][] = [];
  const contracts: Record<string, SeniorSquadState["contracts"][keyof SeniorSquadState["contracts"]]> = {};
  const contractIds: SeniorSquadState["contractIds"][number][] = [];

  for (const clubIdValue of gameState.clubIds) {
    const club = gameState.clubs[clubIdValue];
    if (club === undefined) continue;
    for (let index = 0; index < club.playerIds.length; index += 1) {
      const ownedPlayerId = club.playerIds[index];
      if (ownedPlayerId === undefined) continue;
      const suffix = `${String(clubIdValue).slice(5)}:${String(ownedPlayerId).slice(7)}`;
      const registrationId = seniorSquadRegistrationId(`registration:${suffix}`);
      const contractId = playerContractId(`contract:${suffix}`);
      registrations[registrationId] = {
        id: registrationId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
        shirtNumber: index + 1,
        registeredOn: gameDate(19_000),
      };
      contracts[contractId] = {
        id: contractId,
        playerId: ownedPlayerId,
        clubId: clubIdValue,
        type: "professional",
        startsOn: gameDate(19_000),
        endsOn: gameDate(21_000),
        annualWage: nonNegativeMoney(100_000_00),
        squadStatus: "squad_player",
        bonuses: {
          signingBonus: nonNegativeMoney(0),
          appearanceBonus: nonNegativeMoney(1_000_00),
        },
      };
      registrationIds.push(registrationId);
      contractIds.push(contractId);
    }
  }

  return createSeniorSquadState(gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: contractIds,
    contractHistory: {},
    contractHistoryEntryIds: [],
  });
}

function canonicalClubFinanceState(gameState: GameState, seniorSquadState: SeniorSquadState): ClubFinanceState {
  const accounts: Record<string, ClubFinanceState["accounts"][keyof ClubFinanceState["accounts"]]> = {};
  const ledgerEntries: Record<string, ClubFinanceState["ledgerEntries"][keyof ClubFinanceState["ledgerEntries"]]> = {};
  const ledgerEntryIds: ClubFinanceState["ledgerEntryIds"][number][] = [];

  for (const clubIdValue of gameState.clubIds) {
    const committedAnnualWage = seniorSquadState.activeContractIds.reduce((total, contractId) => {
      const contract = seniorSquadState.contracts[contractId];
      return contract?.clubId === clubIdValue ? total + contract.annualWage : total;
    }, 0);
    const cashBalance = nonNegativeMoney(1_000_000_000_00);
    accounts[clubIdValue] = {
      clubId: clubIdValue,
      currency: "EUR",
      cashBalance,
      annualTransferBudget: nonNegativeMoney(500_000_000_00),
      availableTransferBudget: nonNegativeMoney(500_000_000_00),
      annualWageBudget: nonNegativeMoney(500_000_000_00),
      committedAnnualWage: nonNegativeMoney(committedAnnualWage),
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:opening:${String(clubIdValue).slice(5)}`);
    ledgerEntries[entryId] = {
      id: entryId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId: clubIdValue,
      occurredOn: gameDate(20_000),
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: cashBalance,
      balanceAfter: cashBalance,
      referenceId: `opening:${clubIdValue}`,
    };
    ledgerEntryIds.push(entryId);
  }

  return createClubFinanceState(gameState, seniorSquadState, {
    currency: "EUR",
    accounts,
    clubIds: gameState.clubIds,
    ledgerEntries,
    ledgerEntryIds,
  });
}

const playerLookup = new Map<PlayerId, Player>();

function clubFixture(
  id: ClubId,
  reputation: number,
  playerIds: readonly PlayerId[],
  category: Club["category"] = "third_division",
): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category,
    reputation,
    playerIds,
  };
}

function playersForClub(prefix: string, positions: readonly PlayerPosition[]): PlayerId[] {
  return positions.map((position, index) => playerFixture(playerId(`player:${prefix}-${String(index + 1).padStart(2, "0")}`), position, 7).id);
}

function playersForClubAtAbility(
  prefix: string,
  positions: readonly PlayerPosition[],
  ability: number,
): PlayerId[] {
  return positions.map((position, index) =>
    playerFixture(playerId(`player:${prefix}-${String(index + 1).padStart(2, "0")}`), position, ability).id
  );
}

function playerFixture(
  id: PlayerId,
  position: PlayerPosition,
  ability: number,
  abilities = abilitySet(ability),
): Player {
  const player: Player = {
    id,
    firstName: String(id),
    lastName: "Turnover",
    birthDate: gameDate(20_000 - 24 * 365),
    naturalPositions: [position],
    primaryRole: primaryRoleForPosition(position),
    abilities,
    potential: mapPlayerAbilities(abilities, (value) => abilityValue(Math.min(20, Number(value) + 1))),
  };
  playerLookup.set(id, player);
  return player;
}

function playerWithPotentialFixture(
  id: PlayerId,
  position: PlayerPosition,
  currentAbility: number,
  potentialAbility: number,
): Player {
  const player = {
    ...playerFixture(id, position, currentAbility),
    birthDate: gameDate(20_000 - 17 * 365),
    potential: abilitySet(potentialAbility),
  };
  playerLookup.set(id, player);
  return player;
}

function primaryRoleForPosition(position: PlayerPosition): PlayerRole {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "cb":
      return "center_back";
    case "dm":
      return "defensive_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
    case "lw":
      return "winger";
    case "st":
      return "striker";
    case "cm":
    default:
      return "central_midfielder";
  }
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
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
