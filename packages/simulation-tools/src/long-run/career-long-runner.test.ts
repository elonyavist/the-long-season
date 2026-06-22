import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  competitionId,
  createCareerState,
  createMarketState,
  gameDate,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type ClubId,
} from "@game/domain";
import type { SimulateSeasonInput, SimulateSeasonTeamInput } from "@game/engine";

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
    marketState: createMarketState({
      clubBudgets: {},
      clubBudgetIds: [],
    }),
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
