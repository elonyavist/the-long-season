import assert from "node:assert/strict";
import { test } from "vitest";

import {
  fixtureId,
  MATCH_EVENT_SCHEMA_VERSION,
  playerId,
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

test("match event schema version is bumped for durable causal context", () => {
  assert.equal(MATCH_EVENT_SCHEMA_VERSION, 8);
});

test("the route a chance came down survives into the durable report", () => {
  // The point of bumping the contract. A cross down the left and one down the
  // right are the same `chanceType`, so without the route a manager who moved
  // his width could never see in the report that his chances moved with it.
  const report = createMatchReport(simulatedResultWithGoals());
  const shots = report.events.filter((event) => "shot" in event);

  assert.ok(shots.length > 0, "the fixture must contain at least one shot to carry a route");
  for (const shot of shots) {
    assert.equal("shot" in shot && shot.shot.route !== undefined, true, `${shot.type} lost its route`);
  }
});

test("a scored penalty carries no route, because it was awarded rather than worked", () => {
  const report = createMatchReport(resultWithPenaltyGoal());
  const penaltyGoal = report.events.find((event) => event.type === "goal" && event.shot.chanceType === "dead_ball");

  assert.ok(penaltyGoal !== undefined, "the fixture must contain the scored penalty");
  assert.equal(penaltyGoal.type === "goal" && penaltyGoal.shot.route, undefined);
});

test("report preserves goal scorer IDs", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const goalEvents = report.events.filter((event) => event.type === "goal");

  assert.deepEqual(
    goalEvents.map((event) => event.scorerPlayerId),
    [playerId("player:home-scorer"), playerId("player:away-scorer")],
  );
});

test("report preserves optional goal assist IDs", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const goalEvents = report.events.filter((event) => event.type === "goal");

  assert.deepEqual(
    goalEvents.map((event) => event.assistPlayerId),
    [playerId("player:home-assist"), undefined],
  );
});

test("report preserves optional goal creator IDs when not duplicated by assist", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const goalEvents = report.events.filter((event) => event.type === "goal");

  assert.deepEqual(
    goalEvents.map((event) => event.creatorPlayerId),
    [undefined, playerId("player:away-creator")],
  );
});

test("report preserves save goalkeeper IDs", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const saveEvents = report.events.filter((event) => event.type === "save");

  assert.deepEqual(
    saveEvents.map((event) => event.goalkeeperPlayerId),
    [playerId("player:home-gk")],
  );
});

test("report preserves non-goal shot shooter IDs", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const shotEvents = report.events.filter((event) =>
    event.type === "save" || event.type === "miss" || event.type === "block"
  );

  assert.deepEqual(
    shotEvents.map((event) => event.shooterPlayerId),
    [
      playerId("player:away-shooter"),
      playerId("player:home-shooter"),
      playerId("player:home-blocked-shooter"),
    ],
  );
});

test("report preserves block primary defender IDs", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const blockEvents = report.events.filter((event) => event.type === "block");

  assert.deepEqual(
    blockEvents.map((event) => event.primaryDefenderPlayerId),
    [playerId("player:away-blocker")],
  );
});

test("report preserves structured shot context for every shot outcome", () => {
  const report = createMatchReport(simulatedResultWithGoals());
  const shotEvents = report.events.filter((event) =>
    event.type === "goal" || event.type === "save" || event.type === "miss" || event.type === "block"
  );

  assert.deepEqual(
    shotEvents.map((event) => event.shot),
    [
      {
        minute: 8,
        side: "home",
        quality: 0.74,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
      },
      {
        minute: 12,
        side: "away",
        quality: 0.63,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "counter",
        route: "transition",
      },
      {
        minute: 25,
        side: "home",
        quality: 0.48,
        isShotOnTarget: false,
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
      },
      {
        minute: 52,
        side: "home",
        quality: 0.36,
        isShotOnTarget: false,
        shotType: "header",
        chanceType: "cross",
        route: "left",
      },
      {
        minute: 77,
        side: "away",
        quality: 0.81,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
      },
    ],
  );
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
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
        scorerPlayerId: playerId("player:home-scorer"),
        assistPlayerId: playerId("player:home-assist"),
      },
      {
        type: "shot_outcome",
        minute: 12,
        side: "away",
        outcome: "save",
        quality: 0.63,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "counter",
        route: "transition",
        shooterPlayerId: playerId("player:away-shooter"),
        goalkeeperPlayerId: playerId("player:home-gk"),
      },
      {
        type: "shot_outcome",
        minute: 25,
        side: "home",
        outcome: "miss",
        quality: 0.48,
        isShotOnTarget: false,
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
        shooterPlayerId: playerId("player:home-shooter"),
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
        shotType: "header",
        chanceType: "cross",
        route: "left",
        shooterPlayerId: playerId("player:home-blocked-shooter"),
        primaryDefenderPlayerId: playerId("player:away-blocker"),
      },
      {
        type: "shot_outcome",
        minute: 77,
        side: "away",
        outcome: "goal",
        quality: 0.81,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
        scorerPlayerId: playerId("player:away-scorer"),
        creatorPlayerId: playerId("player:away-creator"),
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
 * Builds a result whose only goal is the scored penalty the route model skips.
 */
function resultWithPenaltyGoal(): SimulateMatchResult {
  return {
    fixtureId: fixtureId("fixture:report-000002"),
    finalMinute: 90,
    isComplete: true,
    score: { home: 1, away: 0 },
    stats: {
      home: { opportunities: 1, shots: 1, shotsOnTarget: 1, goals: 1 },
      away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
    },
    events: [
      { type: "kickoff", minute: 0 },
      {
        type: "shot_outcome",
        minute: 61,
        side: "home",
        outcome: "goal",
        quality: 0.76,
        isShotOnTarget: true,
        shotType: "set_piece",
        chanceType: "dead_ball",
        scorerPlayerId: playerId("player:home-taker"),
      },
      { type: "full_time", minute: 90, score: { home: 1, away: 0 } },
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
