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

function player(
  playerId: string,
  displayName: string,
  age: number,
  currentAbility: number,
  potentialRoom: number,
) {
  return {
    playerId,
    displayName,
    age,
    currentAbility,
    potentialRoom,
  };
}
