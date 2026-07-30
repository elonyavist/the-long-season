import assert from "node:assert/strict";
import { test } from "vitest";

import {
  buildCareerPlayerStatisticsView,
  type CareerPlayerStatisticsInput,
} from "./career-player-statistics-view.ts";

test("keeps complete current and partial career totals with explicit coverage", () => {
  const view = buildCareerPlayerStatisticsView(statisticsInput(), { isGoalkeeper: true });

  assert.equal(view.currentSeasonId, "season:current");
  assert.deepEqual(view.currentSeason, {
    scope: "current_season",
    labelKey: "career.playerProfile.statistics.scope.current_season",
    participation: {
      coverage: "complete",
      starts: 4,
      substituteAppearances: 2,
      appearances: 6,
      minutes: 420,
      averageRating: 7.25,
    },
    events: {
      coverage: "complete",
      goals: 2,
      assists: 3,
      saves: 14,
    },
  });
  assert.equal(view.career.participation.coverage, "partial");
  assert.equal(view.career.events.coverage, "partial");
});

test("omits unavailable source values instead of presenting invented zeroes", () => {
  const input = statisticsInput();
  const view = buildCareerPlayerStatisticsView({
    ...input,
    currentSeason: {
      ...input.currentSeason,
      starts: 0,
      substituteAppearances: 0,
      appearances: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      participationCoverage: "unavailable",
      eventCoverage: "unavailable",
    },
  }, { isGoalkeeper: true });

  assert.deepEqual(view.currentSeason.participation, { coverage: "unavailable" });
  assert.deepEqual(view.currentSeason.events, { coverage: "unavailable" });
  assert.equal("starts" in view.currentSeason.participation, false);
  assert.equal("goals" in view.currentSeason.events, false);
});

test("preserves truthful complete zeroes and omits an absent average rating", () => {
  const input = statisticsInput();
  const view = buildCareerPlayerStatisticsView({
    ...input,
    currentSeason: {
      starts: 0,
      substituteAppearances: 0,
      appearances: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      saves: 0,
      participationCoverage: "complete",
      eventCoverage: "complete",
    },
  }, { isGoalkeeper: false });

  assert.deepEqual(view.currentSeason.participation, {
    coverage: "complete",
    starts: 0,
    substituteAppearances: 0,
    appearances: 0,
    minutes: 0,
  });
  assert.deepEqual(view.currentSeason.events, {
    coverage: "complete",
    goals: 0,
    assists: 0,
  });
});

test("never projects goalkeeper saves onto an outfield statistics view", () => {
  const view = buildCareerPlayerStatisticsView(statisticsInput(), { isGoalkeeper: false });

  assert.equal(view.currentSeason.events.coverage, "complete");
  assert.equal("saves" in view.currentSeason.events, false);
  assert.equal(view.career.events.coverage, "partial");
  assert.equal("saves" in view.career.events, false);
});

test("rejects a summary whose appearance derivation is inconsistent", () => {
  const input = statisticsInput();

  assert.throws(
    () => buildCareerPlayerStatisticsView({
      ...input,
      currentSeason: { ...input.currentSeason, appearances: 99 },
    }, { isGoalkeeper: false }),
    /Invalid current season appearances total/,
  );
});

function statisticsInput(): CareerPlayerStatisticsInput {
  return {
    currentSeasonId: "season:current",
    currentSeason: {
      starts: 4,
      substituteAppearances: 2,
      appearances: 6,
      minutes: 420,
      averageRating: 7.25,
      goals: 2,
      assists: 3,
      saves: 14,
      participationCoverage: "complete",
      eventCoverage: "complete",
    },
    career: {
      starts: 30,
      substituteAppearances: 8,
      appearances: 38,
      minutes: 2_700,
      averageRating: 7.1,
      goals: 8,
      assists: 12,
      saves: 80,
      participationCoverage: "partial",
      eventCoverage: "partial",
    },
  };
}
