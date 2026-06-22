import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createLongRunYouthStabilityReport,
  type LongRunYouthSeasonRow,
} from "./youth-stability.ts";

test("createLongRunYouthStabilityReport aggregates bounded youth population metrics", () => {
  const report = createLongRunYouthStabilityReport([
    seasonRow({ seasonNumber: 1, youthIntakeCount: 54, youthExitCount: 8, youthPromotionCount: 2, activePlayerCount: 560 }),
    seasonRow({
      seasonNumber: 2,
      averageYouthRosterSize: 9,
      maximumYouthRosterSize: 10,
      selectedClubYouthSize: 9,
      youthIntakeCount: 48,
      youthExitCount: 12,
      youthPromotionCount: 4,
      activePlayerCount: 580,
    }),
  ]);

  assert.equal(report.status, "pass");
  assert.equal(report.minimumYouthRosterSizeObserved, 8);
  assert.equal(report.averageYouthRosterSizeObserved, 8.5);
  assert.equal(report.maximumYouthRosterSizeObserved, 10);
  assert.equal(report.minimumActivePlayerCountObserved, 560);
  assert.equal(report.averageActivePlayerCountObserved, 570);
  assert.equal(report.maximumActivePlayerCountObserved, 580);
  assert.equal(report.youthIntakeCount, 102);
  assert.equal(report.youthExitCount, 20);
  assert.equal(report.youthPromotionCount, 6);
  assert.equal(report.selectedClubYouthMinimumSize, 8);
  assert.equal(report.selectedClubYouthAverageSize, 8.5);
  assert.equal(report.selectedClubYouthMaximumSize, 9);
  assert.equal(report.checks.every((check) => check.status === "pass"), true);
});

test("createLongRunYouthStabilityReport fails overpopulation and warns underpopulation separately", () => {
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
  assert.equal(report.checks.find((check) => check.key === "youth_roster_min_size")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "clubs_below_youth_minimum")?.status, "warn");
  assert.equal(report.checks.find((check) => check.key === "active_player_population")?.status, "warn");
});

function seasonRow(input: Partial<LongRunYouthSeasonRow> & Pick<LongRunYouthSeasonRow, "seasonNumber">): LongRunYouthSeasonRow {
  return {
    seasonNumber: input.seasonNumber,
    seniorPlayerCount: input.seniorPlayerCount ?? 414,
    youthPlayerCount: input.youthPlayerCount ?? 146,
    activePlayerCount: input.activePlayerCount ?? 560,
    minimumYouthRosterSize: input.minimumYouthRosterSize ?? 8,
    averageYouthRosterSize: input.averageYouthRosterSize ?? 8,
    maximumYouthRosterSize: input.maximumYouthRosterSize ?? 8,
    youthIntakeCount: input.youthIntakeCount ?? 0,
    youthExitCount: input.youthExitCount ?? 0,
    youthPromotionCount: input.youthPromotionCount ?? 0,
    selectedClubYouthSize: input.selectedClubYouthSize ?? 8,
    clubsAboveYouthTarget: input.clubsAboveYouthTarget ?? 0,
    clubsBelowYouthMinimum: input.clubsBelowYouthMinimum ?? 0,
  };
}
