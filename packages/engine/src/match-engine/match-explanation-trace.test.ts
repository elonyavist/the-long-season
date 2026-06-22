import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import {
  MATCH_EXPLANATION_TRACE_SCHEMA_VERSION,
  type MatchExplanationFactorKey,
  type MatchExplanationTrace,
} from "../index.ts";

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

const REQUIRED_FACTORS: readonly MatchExplanationFactorKey[] = [
  "team_strength",
  "tactic_distribution",
  "lineup_roles",
  "condition_impact",
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
        slots: [{ slotId: "slot:01", playerId: playerId("player:home-000001"), roleKey: "striker" }],
      },
      conditionImpact: {
        tracking: "not_tracked",
        effectDirection: "unknown",
        affectedPlayerCount: 0,
      },
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
        slots: [{ slotId: "slot:01", playerId: playerId("player:away-000001"), roleKey: "goalkeeper" }],
      },
      conditionImpact: {
        tracking: "tracked",
        effectDirection: "negative",
        affectedPlayerCount: 2,
        averageMultiplier: 0.94,
      },
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
