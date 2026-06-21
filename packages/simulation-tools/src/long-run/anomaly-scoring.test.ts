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

function playerEvolution(input: {
  readonly topAssists: number;
  readonly topShare: number;
  readonly topThreeShare: number;
}): LongRunPlayerEvolutionReport {
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
    production: [
      {
        seasonNumber: 1,
        topScorerName: "Scorer",
        topScorerGoals: 18,
        topAssistName: "Creator",
        topAssists: input.topAssists,
        assistPlayersAtLeastFive: 5,
        assistPlayersAtLeastEight: 3,
        assistPlayersAtLeastTen: 2,
        assistPlayersAtLeastTwelve: 1,
        topAssistClubGoalShare: input.topShare,
        topThreeAssistClubGoalShare: input.topThreeShare,
      },
    ],
  };
}

function clubStability(input: { readonly streak: number }): LongRunClubStabilityReport {
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
    seasons: [],
  };
}
