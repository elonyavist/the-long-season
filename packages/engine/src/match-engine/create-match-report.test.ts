import assert from "node:assert/strict";
import { test } from "vitest";

import {
  fixtureId,
  MATCH_EVENT_SCHEMA_VERSION,
  type MatchEvent,
  type MatchReport,
} from "@game/domain";

import {
  createMatchReport,
  type MatchStepEvent,
  type SimulateMatchResult,
} from "../index.ts";

/**
 * Match-report tests prove that engine-local simulation output maps to durable
 * domain report data without prose, storage schemas, or fixture updates.
 */

test("report score matches goal events", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const goalCounts = countReportGoals(report.events);

  assert.deepEqual(report.score, goalCounts);
  assert.equal(report.stats.home.goals, goalCounts.home);
  assert.equal(report.stats.away.goals, goalCounts.away);
});

test("report contains event schema version", () => {
  const report = createMatchReport(simulatedResultWithGoals());

  assert.equal(report.eventSchemaVersion, MATCH_EVENT_SCHEMA_VERSION);
});

test("report contains only IDs and primitives as leaf values", () => {
  const report = createMatchReport(simulatedResultWithGoals());

  assert.equal(hasOnlyPrimitiveLeaves(report), true);
});

test("unknown future event fields do not affect current report creation", () => {
  const result = simulatedResultWithGoals();
  const kickoff = result.events[0];
  const firstShot = result.events[1];
  assert.ok(kickoff !== undefined);
  assert.ok(firstShot !== undefined);

  const resultWithFutureFields: SimulateMatchResult = {
    ...result,
    events: [
      kickoff,
      {
        ...firstShot,
        renderedText: "Home scores in prose",
        futurePayload: {
          ignored: true,
        },
      } as unknown as MatchStepEvent,
      ...result.events.slice(2),
    ],
  };

  const report = createMatchReport(resultWithFutureFields);

  assert.deepEqual(report, createMatchReport(result));
  assert.equal(JSON.stringify(report).includes("renderedText"), false);
  assert.equal(JSON.stringify(report).includes("Home scores in prose"), false);
});

test("no event contains rendered text", () => {
  const report = createMatchReport(simulatedResultWithGoals());

  assert.equal(hasForbiddenTextKey(report.events), false);
});

test("match report is serializable", () => {
  const report = createMatchReport(simulatedResultWithGoals());

  assert.deepEqual(JSON.parse(JSON.stringify(report)), report);
});

/**
 * Builds a simulation result with all aggregate shot outcomes represented.
 */
function simulatedResultWithGoals(): SimulateMatchResult {
  return {
    fixtureId: fixtureId("fixture:report-000001"),
    finalMinute: 90,
    isComplete: true,
    score: {
      home: 1,
      away: 1,
    },
    stats: {
      home: {
        opportunities: 3,
        shots: 3,
        shotsOnTarget: 2,
        goals: 1,
      },
      away: {
        opportunities: 2,
        shots: 2,
        shotsOnTarget: 2,
        goals: 1,
      },
    },
    events: [
      {
        type: "kickoff",
        minute: 0,
      },
      {
        type: "shot_outcome",
        minute: 8,
        side: "home",
        outcome: "goal",
        quality: 0.74,
        isShotOnTarget: true,
      },
      {
        type: "shot_outcome",
        minute: 12,
        side: "away",
        outcome: "save",
        quality: 0.63,
        isShotOnTarget: true,
      },
      {
        type: "shot_outcome",
        minute: 25,
        side: "home",
        outcome: "miss",
        quality: 0.48,
        isShotOnTarget: false,
      },
      {
        type: "half_time",
        minute: 45,
        score: {
          home: 1,
          away: 0,
        },
      },
      {
        type: "shot_outcome",
        minute: 52,
        side: "home",
        outcome: "block",
        quality: 0.36,
        isShotOnTarget: false,
      },
      {
        type: "shot_outcome",
        minute: 77,
        side: "away",
        outcome: "goal",
        quality: 0.81,
        isShotOnTarget: true,
      },
      {
        type: "full_time",
        minute: 90,
        score: {
          home: 1,
          away: 1,
        },
      },
    ],
  };
}

/**
 * Counts goal events in one report.
 */
function countReportGoals(events: readonly MatchEvent[]): MatchReport["score"] {
  const score = {
    home: 0,
    away: 0,
  };

  for (const event of events) {
    if (event.type !== "goal") {
      continue;
    }

    score[event.shot.side] += 1;
  }

  return score;
}

/**
 * Reports whether all object leaves are primitives or arrays/objects.
 */
function hasOnlyPrimitiveLeaves(value: unknown): boolean {
  if (value === null) {
    return true;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!hasOnlyPrimitiveLeaves(item)) {
        return false;
      }
    }

    return true;
  }

  if (typeof value === "object") {
    for (const key in value) {
      if (!hasOnlyPrimitiveLeaves(value[key as keyof typeof value])) {
        return false;
      }
    }

    return true;
  }

  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/**
 * Detects text-oriented fields that must stay out of match events.
 */
function hasForbiddenTextKey(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (hasForbiddenTextKey(item)) {
        return true;
      }
    }

    return false;
  }

  for (const key in value) {
    if (key === "text" || key === "renderedText" || key === "headline" || key === "body" || key === "prose") {
      return true;
    }

    if (hasForbiddenTextKey(value[key as keyof typeof value])) {
      return true;
    }
  }

  return false;
}
