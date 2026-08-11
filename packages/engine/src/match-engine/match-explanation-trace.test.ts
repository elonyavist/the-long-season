import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CANONICAL_PLAYER_ROLES,
  clubId,
  fixtureId,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  playerId,
  TACTICAL_ROUTES,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_TASKS,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type TacticalRoute,
  type TacticalShapeCapacity,
  type TacticalShapeTask,
} from "@game/domain";

import {
  createLineupSlot,
  createMatchExplanationTrace,
  MATCH_EXPLANATION_TRACE_SCHEMA_VERSION,
  type MatchContext,
  type MatchEngineConfig,
  type MatchExplanationFactorKey,
  type MatchExplanationTrace,
  type MatchTeamContext,
  type TacticalShapeProfile,
} from "../index.ts";
import {
  flatMatchTacticsCalibrationFixture,
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


/**
 * Match-explanation trace tests lock the data contract before simulation starts
 * emitting traces in a later step.
 */

test("trace contract includes every required factor as stable machine keys", () => {
  const trace = sampleTrace();

  assert.deepEqual(trace.factors, REQUIRED_FACTORS);
  assert.equal(trace.schemaVersion, MATCH_EXPLANATION_TRACE_SCHEMA_VERSION);
});

test("trace contract is deterministic and JSON serializable", () => {
  const first = sampleTrace();
  const second = sampleTrace();

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
});

test("trace contract keeps presentation text out of engine data", () => {
  const serialized = JSON.stringify(sampleTrace());

  assert.equal(serialized.includes("label"), false);
  assert.equal(serialized.includes("description"), false);
  assert.equal(serialized.includes("advice"), false);
});

test("every side reports one row per route, in the declared route order", () => {
  assert.deepEqual(builtTrace().home.routes.map((row) => row.route), [...TACTICAL_ROUTES]);
  assert.deepEqual(builtTrace().away.routes.map((row) => row.route), [...TACTICAL_ROUTES]);
});

test("the trace counts which routes the chances actually came down, and who took them", () => {
  // The route rows above say what this shape *could* open against this opponent.
  // These say what it used. Without both, a manager who widened his team and saw
  // nothing change could not tell whether the flank never opened or whether the
  // side never went down it.
  const summary = traceOverEvents().opportunitySummary.home;

  assert.deepEqual(summary.routeCounts, [
    { key: "central", count: 1 },
    { key: "left", count: 2 },
  ]);
  assert.deepEqual(summary.shooterCounts, [
    { key: "player:home-scorer", count: 1 },
    { key: "player:home-winger", count: 2 },
  ]);
});

test("a penalty is in no route bucket, so the buckets need not sum to the shots", () => {
  const summary = traceOverEvents().opportunitySummary.away;

  assert.deepEqual(summary.routeCounts, []);
  assert.deepEqual(summary.shooterCounts, [{ key: "player:away-taker", count: 1 }]);
  assert.deepEqual(summary.chanceTypeCounts, [{ key: "dead_ball", count: 1 }]);
});

test("route diagnostics are relational, so the two sides do not see the same routes", () => {
  const trace = builtTrace();
  const home = trace.home.routes.find((row) => row.route === "left");
  const away = trace.away.routes.find((row) => row.route === "left");

  assert.notEqual(home, undefined);
  assert.notEqual(home?.capacity, away?.capacity);
  assert.equal(home?.bottleneck !== undefined, true, "the limiting phase is always named");
});

test("the route rows describe the plan the minutes were played with, not a bare matchup", () => {
  // The corrected defect. These rows used to come from `deriveTacticalMatchup`
  // with no tactic applied at all, while its own JSDoc claimed the minute loop
  // ran the same derivation. A manager who widened his team read back the flank
  // capacity of a team that had been told nothing, and the explanation
  // contradicted the football the minutes had actually resolved.
  const neutral = tacticallyBuiltTrace({ width: 0 });
  const stretched = tacticallyBuiltTrace({ width: 1 });

  assert.equal(
    capacityOf(stretched.home, "left") > capacityOf(neutral.home, "left"),
    true,
    "going wide must show up on the flank the instruction is about",
  );
  assert.equal(
    capacityOf(stretched.away, "central") > capacityOf(neutral.away, "central"),
    true,
    "and the middle it hands over must show up on the other side's rows",
  );
});

test("a built trace stays deterministic and JSON serializable with routes", () => {
  const trace = builtTrace();

  assert.deepEqual(builtTrace(), trace);
  assert.deepEqual(JSON.parse(JSON.stringify(trace)), trace);
});

/**
 * Builds a trace through the real entry point rather than as a literal, which
 * is the only way to exercise the route wiring.
 *
 * The two sides get deliberately different shapes: a matchup that reported the
 * same rows for both sides would pass a symmetric fixture without being
 * relational at all.
 */
function builtTrace(): MatchExplanationTrace {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:000001"),
    seed: "trace-seed",
    home: traceTeam("home", BALANCED_SHAPE),
    away: traceTeam("away", FRONT_LOADED_SHAPE),
    engineConfig: traceConfig(),
    matchTacticsCalibration: traceCalibration(),
  };

  return createMatchExplanationTrace({
    context,
    score: { home: 1, away: 0 },
    stats: {
      home: { opportunities: 6, shots: 5, shotsOnTarget: 3, goals: 1 },
      away: { opportunities: 4, shots: 3, shotsOnTarget: 1, goals: 0 },
    },
    events: [],
  });
}

/**
 * Builds a trace over concrete shot events rather than an empty event list.
 *
 * `home` works three chances down two different routes with two shooters, and
 * `away` has only the scored penalty the route model never produced.
 */
function traceOverEvents(): MatchExplanationTrace {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:000002"),
    seed: "trace-seed",
    home: traceTeam("home", BALANCED_SHAPE),
    away: traceTeam("away", FRONT_LOADED_SHAPE),
    engineConfig: traceConfig(),
    matchTacticsCalibration: traceCalibration(),
  };

  return createMatchExplanationTrace({
    context,
    score: { home: 1, away: 1 },
    stats: {
      home: { opportunities: 3, shots: 3, shotsOnTarget: 2, goals: 1 },
      away: { opportunities: 1, shots: 1, shotsOnTarget: 1, goals: 1 },
    },
    events: [
      {
        type: "shot_outcome",
        minute: 12,
        side: "home",
        outcome: "goal",
        quality: 0.7,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
        route: "central",
        scorerPlayerId: playerId("player:home-scorer"),
      },
      {
        type: "shot_outcome",
        minute: 31,
        side: "home",
        outcome: "save",
        quality: 0.6,
        isShotOnTarget: true,
        shotType: "header",
        chanceType: "cross",
        route: "left",
        shooterPlayerId: playerId("player:home-winger"),
        goalkeeperPlayerId: playerId("player:away-000001"),
      },
      {
        type: "shot_outcome",
        minute: 58,
        side: "home",
        outcome: "miss",
        quality: 0.4,
        isShotOnTarget: false,
        shotType: "normal",
        chanceType: "cross",
        route: "left",
        shooterPlayerId: playerId("player:home-winger"),
      },
      {
        type: "shot_outcome",
        minute: 74,
        side: "away",
        outcome: "goal",
        quality: 0.76,
        isShotOnTarget: true,
        shotType: "set_piece",
        chanceType: "dead_ball",
        scorerPlayerId: playerId("player:away-taker"),
      },
    ],
  });
}

function traceTeam(
  side: "home" | "away",
  shape: TacticalShapeProfile,
  width = 0,
): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({
        slotId: `slot:${side}`,
        playerId: playerId(`player:${side}-000001`),
        canonicalRole: "central_midfielder",
      }),
    ],
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape,
    tacticalDistribution: { directness: 0, pressing: 0, width, risk: 0, mentality: "balanced" },
  });
}

/**
 * Builds a trace where only the home side's width instruction varies.
 *
 * Everything else - shapes, elevens, calibration, caps - is the fixture's, so a
 * difference between two of these can only have come through the tactic seam.
 */
function tacticallyBuiltTrace(options: { readonly width: number }): MatchExplanationTrace {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:000003"),
    seed: "trace-seed",
    home: traceTeam("home", BALANCED_SHAPE, options.width),
    away: traceTeam("away", FRONT_LOADED_SHAPE),
    engineConfig: traceConfig(),
    matchTacticsCalibration: traceCalibration(),
  };

  return createMatchExplanationTrace({
    context,
    score: { home: 0, away: 0 },
    stats: {
      home: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
      away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
    },
    events: [],
  });
}

/** Reads one route's capacity out of a side's snapshot. */
function capacityOf(side: MatchExplanationTrace["home"], route: TacticalRoute): number {
  const row = side.routes.find((candidate) => candidate.route === route);
  assert.notEqual(row, undefined, `no row for ${route}`);

  return row?.capacity ?? Number.NaN;
}

function traceConfig(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.04, maxOpportunityRatePerMinute: 0.2 },
    conversionBands: [{ bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 1, goalProbability: 0.1 }],
    homeAdvantageFactor: 1.05,
    strengthGapMultiplier: 1,
    tacticalDistributionCaps: {
      directness: { minInclusive: -1, maxInclusive: 1 },
      pressing: { minInclusive: -1, maxInclusive: 1 },
      width: { minInclusive: -1, maxInclusive: 1 },
      risk: { minInclusive: -1, maxInclusive: 1 },
    },
  };
}

function shapeProfile(overrides: Partial<Record<TacticalShapeCapacity, number>>): TacticalShapeProfile {
  return tacticalShapeProfileFixture({
    uniformCapacity: 0.52,
    overrides,
    policyVersion: TRACE_POLICY_VERSION,
  });
}

/** The trace fixture's own policy stamp, shared by its calibration and shapes. */
const TRACE_POLICY_VERSION = "match-tactics-trace-fixture";

const BALANCED_SHAPE = shapeProfile({});
const FRONT_LOADED_SHAPE = shapeProfile({
  left_coverage: 0.29,
  right_coverage: 0.29,
  final_third_presence: 0.61,
});

function traceCalibration(): MatchTacticsCalibrationConfig {
  return flatMatchTacticsCalibrationFixture({ version: TRACE_POLICY_VERSION });
}

const REQUIRED_FACTORS: readonly MatchExplanationFactorKey[] = [
  "team_strength",
  "tactic_distribution",
  "lineup_roles",
  "condition_impact",
  "tactical_matchup",
  "opportunity_context",
  "variance",
];

/**
 * Builds a complete sample trace without running a match.
 */
function sampleTrace(): MatchExplanationTrace {
  return {
    schemaVersion: MATCH_EXPLANATION_TRACE_SCHEMA_VERSION,
    fixtureId: fixtureId("fixture:trace-000001"),
    seed: "trace-seed",
    factors: REQUIRED_FACTORS,
    home: {
      side: "home",
      clubId: clubId("club:home"),
      strength: {
        attack: 12,
        midfield: 11,
        defense: 10,
        goalkeeper: 9,
        overall: 10.5,
      },
      tacticDistribution: {
        directness: 0.5,
        pressing: 0.4,
        width: 0.3,
        risk: 0.2,
        mentality: "balanced",
      },
      lineup: {
        slots: [{ slotId: "slot:01", playerId: playerId("player:home-000001"), canonicalRole: "striker" }],
      },
      conditionImpact: {
        tracking: "not_tracked",
        effectDirection: "unknown",
        affectedPlayerCount: 0,
      },
      routes: [],
    },
    away: {
      side: "away",
      clubId: clubId("club:away"),
      strength: {
        attack: 9,
        midfield: 10,
        defense: 11,
        goalkeeper: 12,
        overall: 10.5,
      },
      tacticDistribution: {
        directness: 0.2,
        pressing: 0.3,
        width: 0.4,
        risk: 0.5,
        mentality: "balanced",
      },
      lineup: {
        slots: [{ slotId: "slot:01", playerId: playerId("player:away-000001"), canonicalRole: "goalkeeper" }],
      },
      conditionImpact: {
        tracking: "tracked",
        effectDirection: "negative",
        affectedPlayerCount: 2,
        averageMultiplier: 0.94,
      },
      routes: [],
    },
    opportunitySummary: {
      home: {
        opportunities: 6,
        shots: 5,
        shotsOnTarget: 3,
        goals: 2,
        blockedShots: 1,
        savedShots: 1,
        chanceTypeCounts: [{ key: "counter", count: 3 }],
        shotTypeCounts: [{ key: "normal", count: 5 }],
        routeCounts: [{ key: "transition", count: 3 }],
        shooterCounts: [{ key: "player:home-000001", count: 5 }],
      },
      away: {
        opportunities: 4,
        shots: 3,
        shotsOnTarget: 1,
        goals: 0,
        blockedShots: 0,
        savedShots: 1,
        chanceTypeCounts: [{ key: "cross", count: 2 }],
        shotTypeCounts: [{ key: "header", count: 1 }],
        routeCounts: [{ key: "left", count: 2 }],
        shooterCounts: [{ key: "player:away-000001", count: 3 }],
      },
    },
    variance: {
      rngStreamName: "match",
      fixtureKey: fixtureId("fixture:trace-000001"),
      markers: ["normal_event_volume", "high_conversion"],
    },
  };
}
