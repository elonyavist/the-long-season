import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createLongRunAnomalyReport,
  LONG_RUN_ANOMALY_KEYS,
  longRunAnomalySemanticClass,
  projectLongRunAnomalyCheckForWorldGate,
  worstLongRunAnomalyStatus,
} from "./anomaly-scoring.ts";
import type { LongRunClubStabilityReport } from "./club-stability.ts";
import type { LongRunPlayerEvolutionReport } from "./player-evolution.ts";

test("worstLongRunAnomalyStatus combines independent report sections", () => {
  assert.equal(worstLongRunAnomalyStatus(["pass", "pass"]), "pass");
  assert.equal(worstLongRunAnomalyStatus(["pass", "warn"]), "warn");
  assert.equal(worstLongRunAnomalyStatus(["warn", "fail"]), "fail");
});

test("anomaly semantics are total and keep raw status separate from gate projection", () => {
  assert.deepEqual(
    LONG_RUN_ANOMALY_KEYS.map((key) => [key, longRunAnomalySemanticClass(key)]),
    [
      ["goals_per_match_avg", "monitor"],
      ["table_points_spread_avg", "story"],
      ["top_assist_max", "story"],
      ["top_creator_goal_share_max", "monitor"],
      ["top_three_creator_goal_share_max", "monitor"],
      ["champion_streak", "story"],
      ["useful_players_after_long_run", "monitor"],
      ["age_30_plus_share", "monitor"],
      ["transfer_turnover_available", "monitor"],
      ["squad_turnover_available", "monitor"],
      ["clubs_below_minimum_squad_size", "structural"],
      ["clubs_without_natural_goalkeeper", "structural"],
      ["role_coverage_warning_count", "monitor"],
    ],
  );

  const story = projectLongRunAnomalyCheckForWorldGate({
    key: "table_points_spread_avg",
    status: "fail",
    value: 28,
    threshold: "unchanged raw threshold",
  });
  const structural = projectLongRunAnomalyCheckForWorldGate({
    key: "clubs_below_minimum_squad_size",
    status: "fail",
    value: 1,
    threshold: "unchanged raw threshold",
  });

  assert.equal(story.status, "fail");
  assert.equal(story.semanticClass, "story");
  assert.equal(story.worldGateStatus, "warn");
  assert.equal(structural.status, "fail");
  assert.equal(structural.semanticClass, "structural");
  assert.equal(structural.worldGateStatus, "fail");
});

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

test("createLongRunAnomalyReport treats seven-title smoke streaks as warnings", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.8, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 13, topShare: 0.24, topThreeShare: 0.45, seasonCount: 10 }),
    clubStability: {
      ...clubStability({ streak: 7, seasonCount: 10 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 40,
      playerExitCount: 190,
      squadMaintenanceAddedCount: 40,
    },
  });

  assert.equal(report.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "champion_streak")?.status, "warn");
});

test("createLongRunAnomalyReport still fails extreme smoke champion streaks", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.8, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 13, topShare: 0.24, topThreeShare: 0.45, seasonCount: 10 }),
    clubStability: {
      ...clubStability({ streak: 8, seasonCount: 10 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 40,
      playerExitCount: 190,
      squadMaintenanceAddedCount: 40,
    },
  });

  assert.equal(report.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "champion_streak")?.status, "fail");
});

test("createLongRunAnomalyReport keeps thirty-season champion streak failure threshold unchanged", () => {
  const report = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.8, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 13, topShare: 0.24, topThreeShare: 0.45, seasonCount: 30 }),
    clubStability: {
      ...clubStability({ streak: 9, seasonCount: 30 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 120,
      playerExitCount: 700,
      squadMaintenanceAddedCount: 700,
    },
  });

  assert.equal(report.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "champion_streak")?.status, "fail");
});

test("createLongRunAnomalyReport treats rare fifty-season dynasties as warnings before structural failure", () => {
  const warningReport = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.8, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 13, topShare: 0.24, topThreeShare: 0.45, seasonCount: 50 }),
    clubStability: {
      ...clubStability({ streak: 16, seasonCount: 50 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 200,
      playerExitCount: 1_100,
      squadMaintenanceAddedCount: 1_100,
    },
  });
  const failureReport = createLongRunAnomalyReport({
    balance: [{ goalsPerMatch: 2.8, firstPlacePoints: 72, lastPlacePoints: 28, tablePointsSpread: 44 }],
    playerEvolution: playerEvolution({ topAssists: 13, topShare: 0.24, topThreeShare: 0.45, seasonCount: 50 }),
    clubStability: {
      ...clubStability({ streak: 17, seasonCount: 50 }),
      transferTurnoverAvailable: true,
      squadTurnoverAvailable: true,
      transferTurnoverCount: 200,
      playerExitCount: 1_100,
      squadMaintenanceAddedCount: 1_100,
    },
  });

  assert.equal(warningReport.status, "warn");
  assert.equal(warningReport.checks.find((check) => check.key === "champion_streak")?.status, "warn");
  assert.equal(failureReport.status, "fail");
  assert.equal(failureReport.checks.find((check) => check.key === "champion_streak")?.status, "fail");
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
    playersWithCompressedPotentialRoom: 0,
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
