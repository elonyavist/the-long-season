import assert from "node:assert/strict";
import { test } from "vitest";

import { playerId } from "../types/ids.ts";
import {
  CareerPlayerStatisticsContractError,
  createCareerPlayerSeasonStatistics,
  type CareerPlayerSeasonStatistics,
  type CareerPlayerSeasonStatisticsRow,
} from "./player-statistics.ts";

/** Domain tests protect the durable, language-agnostic player-statistics contract. */

test("createCareerPlayerSeasonStatistics normalizes missing legacy data as unavailable", () => {
  assert.deepEqual(createCareerPlayerSeasonStatistics(undefined), {
    participationCoverage: "unavailable",
    eventCoverage: "unavailable",
    rows: [],
  });
});

test("createCareerPlayerSeasonStatistics preserves ordered rows through a defensive copy", () => {
  const input: CareerPlayerSeasonStatistics = {
    participationCoverage: "complete",
    eventCoverage: "partial",
    rows: [
      rowFixture("player:alpha", { starts: 4, ratingTotal: 31.5, ratingSamples: 4 }),
      rowFixture("player:beta", { substituteAppearances: 2, goals: 1 }),
    ],
  };

  const statistics = createCareerPlayerSeasonStatistics(input);

  assert.deepEqual(statistics, input);
  assert.notEqual(statistics, input);
  assert.notEqual(statistics.rows, input.rows);
  assert.notEqual(statistics.rows[0], input.rows[0]);
});

test("createCareerPlayerSeasonStatistics rejects invalid counts and ratings", () => {
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([rowFixture("player:alpha", { minutes: -1 })])),
    "invalid_count",
  );
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([
      rowFixture("player:alpha", { ratingTotal: 10.1, ratingSamples: 1 }),
    ])),
    "invalid_rating",
  );
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([
      rowFixture("player:alpha", { ratingTotal: 0.9, ratingSamples: 1 }),
    ])),
    "invalid_rating",
  );
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([
      rowFixture("player:alpha", { ratingTotal: 1, ratingSamples: 0 }),
    ])),
    "invalid_rating",
  );
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([
      rowFixture("player:alpha", { ratingTotal: 7, ratingSamples: 1 }),
    ])),
    "invalid_rating",
  );
});

test("createCareerPlayerSeasonStatistics rejects duplicate and unordered player rows", () => {
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([
      rowFixture("player:alpha"),
      rowFixture("player:alpha"),
    ])),
    "duplicate_player",
  );
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics(statisticsFixture([
      rowFixture("player:beta"),
      rowFixture("player:alpha"),
    ])),
    "unordered_player",
  );
});

test("createCareerPlayerSeasonStatistics rejects unsupported runtime coverage", () => {
  assertStatisticsError(
    () => createCareerPlayerSeasonStatistics({
      ...statisticsFixture([]),
      participationCoverage: "unknown" as CareerPlayerSeasonStatistics["participationCoverage"],
    }),
    "invalid_coverage",
  );
});

/** Builds a complete statistics slice around the supplied rows. */
function statisticsFixture(
  rows: readonly CareerPlayerSeasonStatisticsRow[],
): CareerPlayerSeasonStatistics {
  return {
    participationCoverage: "complete",
    eventCoverage: "complete",
    rows,
  };
}

/** Builds one valid row with targeted overrides. */
function rowFixture(
  id: string,
  overrides: Partial<Omit<CareerPlayerSeasonStatisticsRow, "playerId">> = {},
): CareerPlayerSeasonStatisticsRow {
  return {
    playerId: playerId(id),
    starts: 0,
    substituteAppearances: 0,
    minutes: 0,
    ratingTotal: 0,
    ratingSamples: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    ...overrides,
  };
}

/** Asserts a typed player-statistics contract failure. */
function assertStatisticsError(
  action: () => void,
  code: CareerPlayerStatisticsContractError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof CareerPlayerStatisticsContractError && error.code === code,
  );
}
