import assert from "node:assert/strict";
import { test } from "vitest";

import { createLongRunPlayerEvolutionReport } from "./player-evolution.ts";

test("createLongRunPlayerEvolutionReport summarizes growth, decline, and age buckets", () => {
  const report = createLongRunPlayerEvolutionReport({
    initialPlayers: [
      player("player:a", "Alpha", 18, 9, 4),
      player("player:b", "Beta", 25, 11, 1),
      player("player:c", "Gamma", 32, 10, 0),
    ],
    finalPlayers: [
      player("player:a", "Alpha", 28, 13, 1),
      player("player:b", "Beta", 35, 10, 0),
      player("player:c", "Gamma", 42, 8, 0),
    ],
    production: [],
    usefulPlayerCurrentAbilityThreshold: 12,
  });

  assert.equal(report.startAverageCurrentAbility, 10);
  assert.equal(report.endAverageCurrentAbility, 10.33);
  assert.equal(report.playersImproved, 1);
  assert.equal(report.playersDeclined, 2);
  assert.equal(report.seriousProspects, 1);
  assert.equal(report.rareProdigies, 0);
  assert.equal(report.usefulAfterLongRun, 1);
  assert.equal(report.playersWithCompressedPotentialRoom, 2);
  assert.equal(report.finalAgeUnder22, 0);
  assert.equal(report.finalAge22To29, 1);
  assert.equal(report.finalAge30Plus, 2);
  assert.equal(report.topImprovers[0]?.playerId, "player:a");
  assert.equal(report.biggestDecliners[0]?.playerId, "player:c");
});

test("createLongRunPlayerEvolutionReport preserves production rows", () => {
  const report = createLongRunPlayerEvolutionReport({
    initialPlayers: [player("player:a", "Alpha", 18, 9, 4)],
    finalPlayers: [player("player:a", "Alpha", 19, 10, 3)],
    production: [
      {
        seasonNumber: 1,
        topScorerName: "Alpha",
        topScorerGoals: 18,
        topAssistName: "Beta",
        topAssists: 11,
        topCreatorClubName: "Club A",
        topCreatorName: "Beta",
        topCreatorAssists: 11,
        topCreatorClubGoals: 50,
        topCreatorClubTopScorerName: "Alpha",
        topCreatorClubTopScorerGoals: 18,
        assistPlayersAtLeastFive: 4,
        assistPlayersAtLeastEight: 2,
        assistPlayersAtLeastTen: 1,
        assistPlayersAtLeastTwelve: 0,
        topAssistClubGoalShare: 0.22,
        topThreeAssistClubGoalShare: 0.51,
      },
    ],
    usefulPlayerCurrentAbilityThreshold: 12,
  });

  assert.deepEqual(report.production.map((row) => row.seasonNumber), [1]);
  assert.equal(report.production[0]?.topAssists, 11);
});

test("createLongRunPlayerEvolutionReport emits representative trajectory samples", () => {
  const report = createLongRunPlayerEvolutionReport({
    initialPlayers: [
      player("player:young", "Young", 18, 8, 5, { minutes: 900, starts: 10, roleExposureCount: 1 }),
      player("player:prime", "Prime", 26, 11, 1, { minutes: 2100, starts: 24, averageRating: 6.8 }),
      player("player:veteran", "Veteran", 36, 9, 0, { substituteAppearances: 12 }),
    ],
    finalPlayers: [
      player("player:young", "Young", 25, 11, 2),
      player("player:prime", "Prime", 33, 11.5, 0.4),
      player("player:veteran", "Veteran", 43, 7.8, 0),
    ],
    production: [],
    usefulPlayerCurrentAbilityThreshold: 12,
  });

  const diagnostics = report.trajectoryDiagnostics;

  if (diagnostics === undefined) {
    throw new Error("Expected trajectory diagnostics");
  }
  assert.deepEqual(diagnostics.sampleAges, [16, 18, 21, 24, 26, 29, 32, 36, 40]);
  assert.equal(diagnostics.samples.some((sample) => sample.targetAge === 26 && sample.playerId === "player:prime"), true);
  assert.equal(diagnostics.samples.some((sample) => sample.targetAge === 36 && sample.playerId === "player:veteran"), true);
  assert.equal(diagnostics.samples.find((sample) => sample.playerId === "player:young")?.minutes, 900);
});

test("createLongRunPlayerEvolutionReport names players that break diagnostics", () => {
  const report = createLongRunPlayerEvolutionReport({
    initialPlayers: [
      player("player:mature", "Mature", 27, 10, 5),
      player("player:broken", "Broken", 19, 9, -0.5, { physicalCurrentMinimum: 6.5 }),
    ],
    finalPlayers: [
      player("player:mature", "Mature", 34, 14, 1),
      player("player:broken", "Broken", 26, 9, -0.5, { physicalCurrentMinimum: 6.5 }),
    ],
    production: [],
    usefulPlayerCurrentAbilityThreshold: 12,
  });

  const diagnostics = report.trajectoryDiagnostics;

  if (diagnostics === undefined) {
    throw new Error("Expected trajectory diagnostics");
  }

  assert.deepEqual(
    diagnostics.checks
      .filter((check) => check.status !== "pass")
      .map((check) => [check.key, check.playerId]),
    [
      ["potential_room_non_negative", "player:broken"],
      ["mature_growth_feasibility", "player:mature"],
      ["physical_floor", "player:broken"],
    ],
  );
});

function player(
  playerId: string,
  displayName: string,
  age: number,
  currentAbility: number,
  potentialRoom: number,
  extras: Partial<{
    minutes: number;
    starts: number;
    substituteAppearances: number;
    averageRating: number;
    roleExposureCount: number;
    physicalCurrentMinimum: number;
  }> = {},
) {
  return {
    playerId,
    displayName,
    age,
    currentAbility,
    potentialRoom,
    ...extras,
  };
}
