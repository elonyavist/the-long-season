import assert from "node:assert/strict";
import { test } from "vitest";

import { createLongRunAnomalyReport } from "./anomaly-scoring.ts";
import type { LongRunClubStabilityReport } from "./club-stability.ts";
import type { LongRunPlayerEvolutionReport } from "./player-evolution.ts";

test("createLongRunAnomalyReport warns when only missing market metrics are unavailable", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.7, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 12, topShare: 0.22, topThreeShare: 0.5 }),
    clubStability: clubStability({ streak: 2 }),
  });

  assert.equal(report.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "goals_per_match_avg")?.status, "pass");
  assert.equal(report.checks.find((check) => check.key === "transfer_turnover_available")?.status, "warn");
});

test("createLongRunAnomalyReport fails repeated impossible assist output", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.7, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 21, topShare: 0.45, topThreeShare: 0.8 }),
    clubStability: clubStability({ streak: 2 }),
  });

  assert.equal(report.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "top_assist_max")?.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "top_creator_goal_share_max")?.status, "fail");
});

test("createLongRunAnomalyReport warns on high but non-concentrated assist output", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.7, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 19, topShare: 0.28, topThreeShare: 0.49 }),
    clubStability: {
      ...clubStability({ streak: 2 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 4,
      playerExitCount: 12,
      squadMaintenanceAddedCount: 8,
    },
  });

  assert.equal(report.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "top_assist_max")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "top_creator_goal_share_max")?.status, "pass");
  assert.equal(report.checks.find((check) => check.key === "top_three_creator_goal_share_max")?.status, "pass");
});

test("createLongRunAnomalyReport scales rare production maxima on thirty-season runs", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.7, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 22, topShare: 0.34, topThreeShare: 0.55, seasonCount: 30 }),
    clubStability: {
      ...clubStability({ streak: 8, seasonCount: 30 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 120,
      playerExitCount: 700,
      squadMaintenanceAddedCount: 700,
    },
  });

  assert.equal(report.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "top_assist_max")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "champion_streak")?.status, "warn");
});

test("createLongRunAnomalyReport fails structural squad collapse", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.7, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 12, topShare: 0.22, topThreeShare: 0.5 }),
    clubStability: {
      ...clubStability({ streak: 2 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 3,
      playerExitCount: 2,
      squadMaintenanceAddedCount: 2,
      clubsBelowMinimumSquadSizeCount: 1,
      clubsWithoutNaturalGoalkeeperCount: 1,
    },
  });

  assert.equal(report.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "clubs_below_minimum_squad_size")?.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "clubs_without_natural_goalkeeper")?.status, "fail");
});

function playerEvolution(input: {
  readonly topAssists: number;
  readonly topShare: number;
  readonly topThreeShare: number;
  readonly seasonCount?: number;
}): LongRunPlayerEvolutionReport {
  const seasonCount = input.seasonCount ?? 1;

  return {
    startAverageCurrentAbility: 8,
    endAverageCurrentAbility: 8.4,
    playersImproved: 10,
    playersDeclined: 2,
    seriousProspects: 4,
    rareProdigies: 1,
    usefulAfterLongRun: 2,
    finalAgeUnder22: 2,
    finalAge22To29: 12,
    finalAge30Plus: 4,
    topImprovers: [],
    biggestDecliners: [],
    production: Array.from({ length: seasonCount }, (_, index) => ({
      seasonNumber: index + 1,
      topScorerName: "Scorer",
      topScorerGoals: 18,
      topAssistName: "Creator",
      topAssists: index === seasonCount - 1 ? input.topAssists : 12,
      topCreatorClubName: "Club A",
      topCreatorName: "Creator",
      topCreatorAssists: index === seasonCount - 1 ? input.topAssists : 12,
      topCreatorClubGoals: 50,
      topCreatorClubTopScorerName: "Scorer",
      topCreatorClubTopScorerGoals: 18,
      assistPlayersAtLeastFive: 5,
      assistPlayersAtLeastEight: 3,
      assistPlayersAtLeastTen: 2,
      assistPlayersAtLeastTwelve: 1,
      topAssistClubGoalShare: index === seasonCount - 1 ? input.topShare : 0.22,
      topThreeAssistClubGoalShare: index === seasonCount - 1 ? input.topThreeShare : 0.5,
    })),
  };
}

function clubStability(input: { readonly streak: number; readonly seasonCount?: number }): LongRunClubStabilityReport {
  return {
    uniqueChampionCount: 3,
    mostTitledClubName: "Alpha",
    mostTitledClubTitles: 2,
    longestChampionStreak: input.streak,
    selectedClubAveragePosition: 4,
    selectedClubBestPosition: 1,
    selectedClubWorstPosition: 8,
    selectedClubAveragePoints: 58,
    transferTurnoverAvailable: false,
    squadTurnoverAvailable: false,
    transferTurnoverCount: 0,
    playerExitCount: 0,
    retirementExitCount: 0,
    releasedExitCount: 0,
    careerStepDownExitCount: 0,
    playerIntakeCount: 0,
    squadMaintenanceAddedCount: 0,
    minimumSquadSizeObserved: 0,
    maximumSquadSizeObserved: 0,
    averageSquadSizeObserved: 0,
    clubsBelowMinimumSquadSizeCount: 0,
    clubsWithoutNaturalGoalkeeperCount: 0,
    roleCoverageWarningCount: 0,
    seasons: Array.from({ length: input.seasonCount ?? 0 }, (_, index) => ({
      seasonNumber: index + 1,
      championClubId: index < input.streak ? "club:alpha" : `club:${index}`,
      championClubName: index < input.streak ? "Alpha" : `Club ${index}`,
      championPoints: 70,
      selectedClubPosition: 4,
      selectedClubPoints: 58,
    })),
  };
}
