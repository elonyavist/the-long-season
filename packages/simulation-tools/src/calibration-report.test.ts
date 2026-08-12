import { createLineupSlot } from "@game/engine";
import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  gameDate,
  playerId,
  seasonId,
  type ClubId,
} from "@game/domain";
import { type SimulateSeasonInput, type SimulateSeasonTeamInput } from "@game/engine";
import { fromISO } from "@game/shared";

import {
  createCalibrationReport,
  type CalibrationMetricKey,
  type CalibrationTarget,
} from "./calibration-report.ts";
import { matchTacticsCalibrationFixture } from "./test-fixtures/match-tactics-calibration.ts";
import { matchDisciplineConfigFixture } from "./test-fixtures/match-engine-config.ts";
import { seasonTeamInputFixture } from "./test-fixtures/season-team-input.ts";


/**
 * Calibration report tests prove deterministic aggregate metrics without
 * importing content, real data, storage, or app shells.
 */

test("report is deterministic for the same seed and season count", () => {
  const first = createCalibrationReport({
    seedPrefix: "balance",
    seasonCount: 2,
    targets: broadTargets,
    createSeasonInput: seasonInput,
  });
  const second = createCalibrationReport({
    seedPrefix: "balance",
    seasonCount: 2,
    targets: broadTargets,
    createSeasonInput: seasonInput,
  });

  assert.deepEqual(first, second);
});

test("report includes all required metrics", () => {
  const report = createCalibrationReport({
    seedPrefix: "metrics",
    seasonCount: 1,
    targets: broadTargets,
    createSeasonInput: seasonInput,
  });
  const metricKeys = report.metrics.map((metric) => metric.metric);

  assert.deepEqual(metricKeys, [
    "goals_per_match",
    "home_win_rate",
    "draw_rate",
    "away_win_rate",
    "first_place_points",
    "last_place_points",
    "table_points_spread",
    "upset_rate",
  ]);
});

test("targets are hand-authored aggregate values", () => {
  for (const target of broadTargets) {
    assert.equal(target.label.length > 0, true);
    assert.equal(Number.isFinite(target.minInclusive), true);
    assert.equal(Number.isFinite(target.maxInclusive), true);
    assert.equal(target.maxInclusive >= target.minInclusive, true);
  }
});

test("PASS and FAIL respect tolerance bands", () => {
  const passingReport = createCalibrationReport({
    seedPrefix: "passing",
    seasonCount: 1,
    targets: broadTargets,
    createSeasonInput: seasonInput,
  });
  const failingReport = createCalibrationReport({
    seedPrefix: "failing",
    seasonCount: 1,
    targets: impossibleTargets,
    createSeasonInput: seasonInput,
  });

  assert.equal(passingReport.status, "pass");
  assert.equal(failingReport.status, "fail");
  assert.equal(failingReport.metrics[0]?.status, "fail");
});

/**
 * Builds deterministic season input with synthetic team contexts.
 */
function seasonInput(seed: string): SimulateSeasonInput {
  const clubIds = demoClubIds();

  return {
    seed,
    seasonId: seasonId("season:balance-test"),
    competitionId: competitionId("competition:balance-test"),
    clubIds,
    seasonStartDate: gameDate(fromISO("2026-08-01")),
    teamsByClubId: teamsByClubId(clubIds),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    matchRules: {
      maximumSubstitutions: 5,
      substitutionWindowLimit: 3,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
    matchEngineConfig: {
      minuteCount: 12,
      rates: {
        baseOpportunityRatePerMinute: 0.06,
        maxOpportunityRatePerMinute: 0.18,
      },
      conversionBands: [
        {
          bandKey: "low",
          minQualityInclusive: 0,
          maxQualityExclusive: 0.5,
          goalProbability: 0.1,
        },
        {
          bandKey: "high",
          minQualityInclusive: 0.5,
          maxQualityExclusive: 1.01,
          goalProbability: 0.25,
        },
      ],
      homeAdvantageFactor: 1.05,
      strengthGapMultiplier: 1,
      discipline: matchDisciplineConfigFixture(),
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

/**
 * Builds 18 namespaced club IDs.
 */
function demoClubIds(): readonly ClubId[] {
  const clubIds: ClubId[] = [];

  for (let clubNumber = 1; clubNumber <= 18; clubNumber += 1) {
    clubIds.push(clubId(`club:balance-${String(clubNumber).padStart(2, "0")}`));
  }

  return clubIds;
}

/**
 * Builds team contexts keyed by club ID.
 */
function teamsByClubId(clubIds: readonly ClubId[]): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teams: Record<ClubId, SimulateSeasonTeamInput> = {};

  for (let index = 0; index < clubIds.length; index += 1) {
    const id = clubIds[index];
    assert.ok(id !== undefined);

    const rating = 8 + (clubIds.length - index) / 3;
    teams[id] = seasonTeamInputFixture(`balance-${String(index + 1).padStart(2, "0")}`, rating);
  }

  return teams;
}

/** Broad test targets expected to pass for the synthetic test season. */
const broadTargets: readonly CalibrationTarget[] = [
  target("goals_per_match", 0, 10),
  target("home_win_rate", 0, 1),
  target("draw_rate", 0, 1),
  target("away_win_rate", 0, 1),
  target("first_place_points", 0, 102),
  target("last_place_points", 0, 102),
  target("table_points_spread", 0, 102),
  target("upset_rate", 0, 1),
];

/** Impossible target expected to fail. */
const impossibleTargets: readonly CalibrationTarget[] = [target("goals_per_match", 99, 100)];

/**
 * Builds one test calibration target.
 */
function target(metric: CalibrationMetricKey, minInclusive: number, maxInclusive: number): CalibrationTarget {
  return {
    metric,
    label: metric,
    minInclusive,
    maxInclusive,
  };
}
