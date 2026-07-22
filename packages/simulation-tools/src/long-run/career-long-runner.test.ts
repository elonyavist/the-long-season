import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  competitionId,
  createCareerState,
  gameDate,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type ClubId,
} from "@game/domain";
import type { SimulateSeasonInput, SimulateSeasonTeamInput } from "@game/engine";

import type { LongRunContractFinanceSeasonRow } from "./contract-finance-stability.ts";
import { runCareerLongRunSimulation } from "./career-long-runner.ts";

test("runCareerLongRunSimulation sequences season simulation and refresh hooks", () => {
  const initialCareerState = careerStateFixture();
  const result = runCareerLongRunSimulation({
    seed: "career-long-run",
    seasonCount: 2,
    initialCareerState,
    createSeasonInput: ({ seasonSeed }) => seasonInput(seasonSeed),
    advanceCareerState: ({ careerState, seasonNumber }) => ({
      careerState,
      refresh: {
        contractFinance: contractFinanceRow(seasonNumber),
        exitCount: seasonNumber,
        exitReasons: {
          retirement: 1,
          released: 0,
          careerStepDown: 0,
        },
        intakeCount: seasonNumber + 1,
        squadMaintenanceAddedCount: seasonNumber + 2,
        youthPromotionCount: seasonNumber + 4,
        youthIntakeCount: seasonNumber + 5,
        youthExitCount: seasonNumber + 6,
        transferTurnoverCount: seasonNumber + 3,
        seniorPlayerCount: 44,
        youthPlayerCount: 16,
        activePlayerCount: 60,
        minimumSquadSize: 21,
        averageSquadSize: 22,
        maximumSquadSize: 23,
        clubsBelowMinimumSquadSize: 0,
        clubsWithoutNaturalGoalkeeper: 0,
        roleCoverageWarningCount: 1,
        minimumYouthRosterSize: 8,
        averageYouthRosterSize: 8,
        maximumYouthRosterSize: 8,
        selectedClubYouthSize: 8,
        clubsAboveYouthTarget: 0,
        clubsBelowYouthMinimum: 0,
      },
    }),
  });

  assert.equal(result.seasonCount, 2);
  assert.equal(result.seasons[0]?.seasonSeed, "career-long-run-season-001");
  assert.equal(result.seasons[1]?.refresh.transferTurnoverCount, 5);
  assert.deepEqual(result.finalCareerState, initialCareerState);
});

test("runCareerLongRunSimulation rejects invalid season counts", () => {
  assert.throws(
    () =>
      runCareerLongRunSimulation({
        seed: "invalid",
        seasonCount: 0,
        initialCareerState: careerStateFixture(),
        createSeasonInput: ({ seasonSeed }) => seasonInput(seasonSeed),
        advanceCareerState: ({ careerState }) => ({
          careerState,
          refresh: {
            contractFinance: contractFinanceRow(1),
            exitCount: 0,
            exitReasons: {
              retirement: 0,
              released: 0,
              careerStepDown: 0,
            },
            intakeCount: 0,
            squadMaintenanceAddedCount: 0,
            youthPromotionCount: 0,
            youthIntakeCount: 0,
            youthExitCount: 0,
            transferTurnoverCount: 0,
            seniorPlayerCount: 0,
            youthPlayerCount: 0,
            activePlayerCount: 0,
            minimumSquadSize: 22,
            averageSquadSize: 22,
            maximumSquadSize: 22,
            clubsBelowMinimumSquadSize: 0,
            clubsWithoutNaturalGoalkeeper: 0,
            roleCoverageWarningCount: 0,
            minimumYouthRosterSize: 8,
            averageYouthRosterSize: 8,
            maximumYouthRosterSize: 8,
            selectedClubYouthSize: 8,
            clubsAboveYouthTarget: 0,
            clubsBelowYouthMinimum: 0,
          },
        }),
      }),
    /positive safe integer/,
  );
});

test("runCareerLongRunSimulation projects retained seasons only after career advancement", () => {
  const initialCareerState = careerStateFixture();
  let advanceReceivedRichReport = false;
  let mapperRanAfterAdvancement = false;
  const result = runCareerLongRunSimulation({
    seed: "career-long-run-compact",
    seasonCount: 1,
    initialCareerState,
    retainSeasonResult: (seasonResult) => {
      mapperRanAfterAdvancement = advanceReceivedRichReport;

      return {
        fixtureCount: seasonResult.fixtures.length,
        table: seasonResult.table,
      };
    },
    createSeasonInput: ({ seasonSeed }) => seasonInput(seasonSeed),
    advanceCareerState: ({ careerState, seasonResult }) => {
      advanceReceivedRichReport = seasonResult.fixtures.some((fixture) => fixture.result?.report !== undefined);

      return {
        careerState,
        refresh: {
          contractFinance: contractFinanceRow(1),
          exitCount: 0,
          exitReasons: {
            retirement: 0,
            released: 0,
            careerStepDown: 0,
          },
          intakeCount: 0,
          squadMaintenanceAddedCount: 0,
          youthPromotionCount: 0,
          youthIntakeCount: 0,
          youthExitCount: 0,
          transferTurnoverCount: 0,
          seniorPlayerCount: 44,
          youthPlayerCount: 16,
          activePlayerCount: 60,
          minimumSquadSize: 22,
          averageSquadSize: 22,
          maximumSquadSize: 22,
          clubsBelowMinimumSquadSize: 0,
          clubsWithoutNaturalGoalkeeper: 0,
          roleCoverageWarningCount: 0,
          minimumYouthRosterSize: 8,
          averageYouthRosterSize: 8,
          maximumYouthRosterSize: 8,
          selectedClubYouthSize: 8,
          clubsAboveYouthTarget: 0,
          clubsBelowYouthMinimum: 0,
        },
      };
    },
  });

  assert.equal(advanceReceivedRichReport, true);
  assert.equal(mapperRanAfterAdvancement, true);
  assert.equal(result.seasons[0]?.result.table.length, 2);
  assert.equal(result.seasons[0]?.result.fixtureCount, 2);
});

function contractFinanceRow(seasonNumber: number): LongRunContractFinanceSeasonRow {
  return {
    seasonNumber,
    currentDate: 20_000 + seasonNumber * 365,
    ownedSeniorPlayerCount: 44,
    freeAgentCount: 0,
    freeAgentShare: 0,
    missingStateCount: 0,
    seniorSquadInvariantViolationCount: 0,
    ownershipInvariantViolationCount: 0,
    activeContractDateViolationCount: 0,
    selectedClubExpiredDecisionCount: 0,
    freeAgentInvariantViolationCount: 0,
    negotiationInvariantViolationCount: 0,
    unaffordableAiOfferCount: 0,
    financeInvariantViolationCount: 0,
    duplicateLedgerBusinessFactCount: 0,
    annualPayrollReconciliationViolationCount: 0,
    financeLimitViolationCount: 0,
    minimumCashBalance: 1,
    maximumWageBudgetUtilization: 0.5,
    minimumSquadSize: 22,
    maximumSquadSize: 22,
    minimumGoalkeeperCount: 2,
    minimumDefenderCount: 7,
    minimumMidfielderCount: 8,
    minimumAttackerCount: 5,
    minimumAge: 18,
    averageAge: 25,
    maximumAge: 34,
    minimumAnnualWage: 1,
    averageAnnualWage: 2,
    maximumAnnualWage: 3,
    valuationSampleCount: 0,
    minimumPlayerValue: 0,
    averagePlayerValue: 0,
    maximumPlayerValue: 0,
    expiringContractCount: 0,
    openNegotiationCount: 0,
    renewalCount: 0,
    releaseCount: 0,
    expiryCount: 0,
    ledgerReasonAmounts: {
      opening_capital: 0,
      season_distribution: 0,
      transfer_fee_paid: 0,
      transfer_fee_received: 0,
      contract_signing_bonus: 0,
      annual_base_wage: 0,
      appearance_bonus: 0,
      goal_bonus: 0,
      clean_sheet_bonus: 0,
    },
    selectedPlanObservationCount: 0,
    selectedPlanRetainedPlayerMissingCount: 0,
    selectedPlanHiddenReplacementCount: 0,
  };
}

function careerStateFixture(): CareerState {
  const firstClubId = clubId("club:test-alpha");
  const secondClubId = clubId("club:test-beta");

  return createCareerState({
    saveId: saveId("save:career-long-run"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: firstClubId,
    gameState: {
      meta: {
        seed: "career-long-run-test",
        rngAlgorithmVersion: "test",
        saveSchemaVersion: 1,
      },
      calendar: {
        currentDate: gameDate(20_000),
        currentSeasonId: seasonId("season:0001"),
      },
      players: {},
      playerIds: [],
      playerStates: {},
      clubs: {
        [firstClubId]: {
          id: firstClubId,
          name: "Alpha",
          shortName: "ALP",
          category: "third_division",
          reputation: 5,
          playerIds: [],
        },
        [secondClubId]: {
          id: secondClubId,
          name: "Beta",
          shortName: "BET",
          category: "third_division",
          reputation: 5,
          playerIds: [],
        },
      },
      clubIds: [firstClubId, secondClubId],
      fixtures: {},
      fixtureIds: [],
    },
    transferHistory: [],
  });
}

function seasonInput(seed: string): SimulateSeasonInput {
  const firstClubId = clubId("club:test-alpha");
  const secondClubId = clubId("club:test-beta");
  const clubIds = [firstClubId, secondClubId];

  return {
    seed,
    seasonId: seasonId("season:test"),
    competitionId: competitionId("competition:test"),
    clubIds,
    seasonStartDate: gameDate(20_000),
    teamsByClubId: {
      [firstClubId]: teamInput(firstClubId, 12),
      [secondClubId]: teamInput(secondClubId, 10),
    },
    matchEngineConfig: {
      minuteCount: 3,
      rates: {
        baseOpportunityRatePerMinute: 0.08,
        maxOpportunityRatePerMinute: 0.2,
      },
      conversionBands: [
        {
          bandKey: "standard",
          minQualityInclusive: 0,
          maxQualityExclusive: 1.01,
          goalProbability: 0.2,
        },
      ],
      homeAdvantageFactor: 1,
      tacticalDistributionCaps: {
        directness: { minInclusive: 0, maxInclusive: 1 },
        pressing: { minInclusive: 0, maxInclusive: 1 },
        width: { minInclusive: 0, maxInclusive: 1 },
        risk: { minInclusive: 0, maxInclusive: 1 },
      },
    },
    tableRules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  };
}

function teamInput(id: ClubId, rating: number): SimulateSeasonTeamInput {
  const clubSlug = String(id).slice("club:".length);

  return {
    lineup: [
      {
        slotId: "slot:01",
        playerId: playerId(`player:${clubSlug}-01`),
        roleKey: "gk",
      },
      {
        slotId: "slot:02",
        playerId: playerId(`player:${clubSlug}-02`),
        roleKey: "attacker",
      },
    ],
    strength: {
      attack: rating,
      midfield: rating,
      defense: rating,
      goalkeeper: rating,
      overall: rating,
    },
    tacticalDistribution: {
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
    },
  };
}
