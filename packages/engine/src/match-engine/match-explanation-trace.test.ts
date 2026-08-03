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

test("route diagnostics are relational, so the two sides do not see the same routes", () => {
  const trace = builtTrace();
  const home = trace.home.routes.find((row) => row.route === "left");
  const away = trace.away.routes.find((row) => row.route === "left");

  assert.notEqual(home, undefined);
  assert.notEqual(home?.capacity, away?.capacity);
  assert.equal(home?.bottleneck !== undefined, true, "the limiting phase is always named");
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

function traceTeam(side: "home" | "away", shape: TacticalShapeProfile): MatchTeamContext {
  return {
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
    tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 },
  };
}

function traceConfig(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.04, maxOpportunityRatePerMinute: 0.2 },
    conversionBands: [{ bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 1, goalProbability: 0.1 }],
    homeAdvantageFactor: 1.05,
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
      },
    },
    variance: {
      rngStreamName: "match",
      fixtureKey: fixtureId("fixture:trace-000001"),
      markers: ["normal_event_volume", "high_conversion"],
    },
  };
}
