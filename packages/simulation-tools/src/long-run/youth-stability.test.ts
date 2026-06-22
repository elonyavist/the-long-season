import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createLongRunYouthStabilityReport,
  type LongRunYouthSeasonRow,
} from "./youth-stability.ts";

test("createLongRunYouthStabilityReport aggregates bounded youth population metrics", () => {
  const report = createLongRunYouthStabilityReport([
    seasonRow({ seasonNumber: 1, youthIntakeCount: 54, youthExitCount: 8, youthPromotionCount: 2, activePlayerCount: 594 }),
    seasonRow({
      seasonNumber: 2,
      seniorPlayerCount: 432,
      youthPlayerCount: 198,
      averageYouthRosterSize: 11,
      maximumYouthRosterSize: 11,
      selectedClubYouthSize: 11,
      youthIntakeCount: 48,
      youthExitCount: 12,
      youthPromotionCount: 4,
      activePlayerCount: 630,
    }),
  ]);

  assert.equal(report.status, "pass");
  assert.equal(report.minimumSeniorPlayerCountObserved, 396);
  assert.equal(report.maximumSeniorPlayerCountObserved, 432);
  assert.equal(report.minimumYouthPlayerCountObserved, 198);
  assert.equal(report.maximumYouthPlayerCountObserved, 198);
  assert.equal(report.minimumYouthRosterSizeObserved, 11);
  assert.equal(report.averageYouthRosterSizeObserved, 11);
  assert.equal(report.maximumYouthRosterSizeObserved, 11);
  assert.equal(report.minimumActivePlayerCountObserved, 594);
  assert.equal(report.averageActivePlayerCountObserved, 612);
  assert.equal(report.maximumActivePlayerCountObserved, 630);
  assert.equal(report.youthIntakeCount, 102);
  assert.equal(report.youthExitCount, 20);
  assert.equal(report.youthPromotionCount, 6);
  assert.equal(report.selectedClubYouthMinimumSize, 11);
  assert.equal(report.selectedClubYouthAverageSize, 11);
  assert.equal(report.selectedClubYouthMaximumSize, 11);
  assert.equal(report.checks.every((check) => check.status === "pass"), true);
});

test("createLongRunYouthStabilityReport splits senior youth and total population semantics", () => {
  const report = createLongRunYouthStabilityReport([
    seasonRow({
      seasonNumber: 1,
      seniorPlayerCount: 396,
      youthPlayerCount: 198,
      activePlayerCount: 594,
    }),
  ]);

  assert.equal(report.status, "pass");
  assert.equal(report.checks.find((check) => check.key === "senior_active_player_population")?.status, "pass");
  assert.equal(report.checks.find((check) => check.key === "youth_active_player_population")?.status, "pass");
  assert.equal(report.checks.find((check) => check.key === "total_active_player_population")?.status, "pass");
});

test("createLongRunYouthStabilityReport fails youth shape and warns population drift", () => {
  const report = createLongRunYouthStabilityReport([
    seasonRow({
      seasonNumber: 1,
      minimumYouthRosterSize: 7,
      maximumYouthRosterSize: 13,
      clubsAboveYouthTarget: 1,
      clubsBelowYouthMinimum: 2,
      activePlayerCount: 700,
    }),
  ]);

  assert.equal(report.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "youth_roster_max_size")?.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "clubs_above_youth_target")?.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "youth_roster_min_size")?.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "clubs_below_youth_minimum")?.status, "fail");
  assert.equal(report.checks.find((check) => check.key === "total_active_player_population")?.status, "warn");
});

function seasonRow(input: Partial<LongRunYouthSeasonRow> & Pick<LongRunYouthSeasonRow, "seasonNumber">): LongRunYouthSeasonRow {
  return {
    seasonNumber: input.seasonNumber,
    seniorPlayerCount: input.seniorPlayerCount ?? 396,
    youthPlayerCount: input.youthPlayerCount ?? 198,
    activePlayerCount: input.activePlayerCount ?? 594,
    minimumYouthRosterSize: input.minimumYouthRosterSize ?? 11,
    averageYouthRosterSize: input.averageYouthRosterSize ?? 11,
    maximumYouthRosterSize: input.maximumYouthRosterSize ?? 11,
    youthIntakeCount: input.youthIntakeCount ?? 0,
    youthExitCount: input.youthExitCount ?? 0,
    youthPromotionCount: input.youthPromotionCount ?? 0,
    selectedClubYouthSize: input.selectedClubYouthSize ?? 11,
    clubsAboveYouthTarget: input.clubsAboveYouthTarget ?? 0,
    clubsBelowYouthMinimum: input.clubsBelowYouthMinimum ?? 0,
  };
}
