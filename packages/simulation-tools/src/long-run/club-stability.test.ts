import assert from "node:assert/strict";
import { test } from "vitest";

import { createLongRunClubStabilityReport } from "./club-stability.ts";

test("createLongRunClubStabilityReport tracks champions and selected-club finishes", () => {
  const report = createLongRunClubStabilityReport([
    season(1, "club:a", "Alpha", 72, 2, 66),
    season(2, "club:a", "Alpha", 70, 1, 70),
    season(3, "club:b", "Beta", 68, 5, 52),
    season(4, "club:a", "Alpha", 74, 3, 61),
  ]);

  assert.equal(report.uniqueChampionCount, 2);
  assert.equal(report.mostTitledClubName, "Alpha");
  assert.equal(report.mostTitledClubTitles, 3);
  assert.equal(report.longestChampionStreak, 2);
  assert.equal(report.selectedClubAveragePosition, 2.75);
  assert.equal(report.selectedClubBestPosition, 1);
  assert.equal(report.selectedClubWorstPosition, 5);
  assert.equal(report.selectedClubAveragePoints, 62.25);
});

test("createLongRunClubStabilityReport marks unavailable systems explicitly", () => {
  const report = createLongRunClubStabilityReport([
    season(1, "club:a", "Alpha", 72, 2, 66),
  ]);

  assert.equal(report.transferTurnoverAvailable, false);
  assert.equal(report.squadTurnoverAvailable, false);
  assert.equal(report.clubsBelowMinimumSquadSizeCount, 0);
  assert.equal(report.clubsWithoutNaturalGoalkeeperCount, 0);
});

test("createLongRunClubStabilityReport includes refresh health totals", () => {
  const report = createLongRunClubStabilityReport([season(1, "club:a", "Alpha", 72, 2, 66)], {
    transferTurnoverCount: 3,
    playerExitCount: 2,
    retirementExitCount: 1,
    releasedExitCount: 1,
    careerStepDownExitCount: 0,
    playerIntakeCount: 8,
    squadMaintenanceAddedCount: 2,
    minimumSquadSizeObserved: 21,
    maximumSquadSizeObserved: 23,
    averageSquadSizeObserved: 22.1,
    clubsBelowMinimumSquadSizeCount: 0,
    clubsWithoutNaturalGoalkeeperCount: 0,
    roleCoverageWarningCount: 4,
  });

  assert.equal(report.transferTurnoverCount, 3);
  assert.equal(report.retirementExitCount, 1);
  assert.equal(report.releasedExitCount, 1);
  assert.equal(report.averageSquadSizeObserved, 22.1);
  assert.equal(report.roleCoverageWarningCount, 4);
});

function season(
  seasonNumber: number,
  championClubId: string,
  championClubName: string,
  championPoints: number,
  selectedClubPosition: number,
  selectedClubPoints: number,
) {
  return {
    seasonNumber,
    championClubId,
    championClubName,
    championPoints,
    selectedClubPosition,
    selectedClubPoints,
  };
}
