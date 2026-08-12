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
import { fromISO } from "@game/shared";
import type { SimulateSeasonInput, SimulateSeasonTeamInput } from "@game/engine";

import {
  DEFAULT_LONG_RUN_SEASON_COUNT,
  longRunSeasonSeed,
  runLongRunSimulation,
} from "./long-runner.ts";
import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";
import { matchDisciplineConfigFixture } from "../test-fixtures/match-engine-config.ts";
import { seasonTeamInputFixture } from "../test-fixtures/season-team-input.ts";


test("runLongRunSimulation uses the default ten-season count", () => {
  const result = runLongRunSimulation({
    seed: "long-run-default",
    createSeasonInput: ({ seasonSeed }) => seasonInput(seasonSeed),
  });

  assert.equal(result.seasonCount, DEFAULT_LONG_RUN_SEASON_COUNT);
  assert.equal(result.seasons.length, DEFAULT_LONG_RUN_SEASON_COUNT);
  assert.equal(result.seasons[0]?.seasonSeed, "long-run-default-season-001");
});

test("runLongRunSimulation respects an explicit season count", () => {
  const result = runLongRunSimulation({
    seed: "long-run-two",
    seasonCount: 2,
    createSeasonInput: ({ seasonSeed }) => seasonInput(seasonSeed),
  });

  assert.equal(result.seasonCount, 2);
  assert.equal(result.seasons.length, 2);
  assert.deepEqual(
    result.seasons.map((season) => season.seasonNumber),
    [1, 2],
  );
});

test("runLongRunSimulation is stable for the same seed", () => {
  const input = {
    seed: "long-run-stable",
    seasonCount: 3,
    createSeasonInput: ({ seasonSeed }: { readonly seasonSeed: string }) => seasonInput(seasonSeed),
  };

  assert.deepEqual(runLongRunSimulation(input), runLongRunSimulation(input));
});

test("runLongRunSimulation rejects invalid season counts", () => {
  assert.throws(
    () =>
      runLongRunSimulation({
        seed: "long-run-invalid",
        seasonCount: 0,
        createSeasonInput: ({ seasonSeed }) => seasonInput(seasonSeed),
      }),
    /positive safe integer/,
  );
});

test("longRunSeasonSeed pads season numbers for stable lexical ordering", () => {
  assert.equal(longRunSeasonSeed("world-a", 7), "world-a-season-007");
  assert.equal(longRunSeasonSeed("world-a", 12), "world-a-season-012");
});

/**
 * Builds a tiny deterministic season input for runner tests.
 */
function seasonInput(seed: string): SimulateSeasonInput {
  const firstClubId = clubId("club:test-alpha");
  const secondClubId = clubId("club:test-beta");
  const clubIds = [firstClubId, secondClubId];

  return {
    seed,
    seasonId: seasonId("season:test"),
    competitionId: competitionId("competition:test"),
    clubIds,
    seasonStartDate: gameDate(fromISO("2026-08-01")),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    teamsByClubId: {
      [firstClubId]: teamInput(firstClubId, 12),
      [secondClubId]: teamInput(secondClubId, 10),
    },
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
 * Builds a two-player team context with one goalkeeper and one outfield player.
 */
function teamInput(id: ClubId, rating: number): SimulateSeasonTeamInput {
  return seasonTeamInputFixture(String(id).slice("club:".length), rating);
}
