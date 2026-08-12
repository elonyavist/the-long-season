import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  fixtureId,
  playerId,
  TACTICAL_SHAPE_CAPACITIES,
  type FixtureId,
  type TacticalShapeCapacity,
} from "@game/domain";

import {
  assertValidMatchContext,
  buildMatchRngKey,
  isValidMatchContext,
  matchRngKeyParts,
  MatchContextError,
  type MatchContext,
  type MatchEngineConfig,
  type MatchTeamContext,
  type TacticalShapeProfile,
} from "../index.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { matchDisciplineConfigFixture } from "../test-fixtures/match-engine-config.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


/**
 * Match-context tests prove one match can be described and validated without
 * reading global game state or running simulation behavior.
 */

test("valid context passes validation", () => {
  const context = validContext();

  assert.doesNotThrow(() => assertValidMatchContext(context));
  assert.equal(isValidMatchContext(context), true);
});

test("missing fixture ID fails", () => {
  const context = {
    ...validContext(),
    fixtureId: "" as FixtureId,
  };

  assert.throws(
    () => assertValidMatchContext(context),
    (error: unknown) => error instanceof MatchContextError && error.code === "missing_fixture_id",
  );
});

test("fixture IDs follow the domain fixture namespace", () => {
  const context = {
    ...validContext(),
    fixtureId: "fx_000001" as FixtureId,
  };

  assert.throws(
    () => assertValidMatchContext(context),
    (error: unknown) => error instanceof MatchContextError && error.code === "invalid_fixture_id",
  );
});

test("missing team strength fails", () => {
  const context = {
    ...validContext(),
    home: {
      ...validTeam("home"),
      strength: undefined,
    },
  } as unknown as MatchContext;

  assert.throws(
    () => assertValidMatchContext(context),
    (error: unknown) => error instanceof MatchContextError && error.code === "missing_team_strength",
  );
});

test("the match RNG key is stable for the same seed and fixture ID", () => {
  const first = buildMatchRngKey(validContext());
  const second = buildMatchRngKey(validContext());

  assert.deepEqual(first, second);
  assert.equal(first.seed, "demo-001");
  assert.equal(first.streamName, "match");
  assert.deepEqual(matchRngKeyParts(first), [fixtureId("fixture:000001")]);
});

test("home and away team order is explicit", () => {
  const context = validContext();

  assert.equal(context.home.clubId, clubId("club:home"));
  assert.equal(context.away.clubId, clubId("club:away"));
  assert.notEqual(context.home.clubId, context.away.clubId);
});

test("context stays JSON serializable", () => {
  const context = validContext();

  assert.deepEqual(JSON.parse(JSON.stringify(context)), context);
});

test("a context without an intrinsic shape cannot be simulated", () => {
  const context = validContext();
  const { shape: _removed, ...homeWithoutShape } = context.home;

  assertRejected(
    { ...context, home: homeWithoutShape as MatchContext["home"] },
    "invalid_tactical_shape",
  );
});

test("a shape must be complete and bounded", () => {
  assert.equal(isValidMatchContext(withHomeShape(shapeFor(0.4))), true);

  assertShapeRejected({ ...shapeFor(0.4), policyVersion: "  " });
  assertShapeRejected(shapeFor(1));
  assertShapeRejected({
    ...shapeFor(0.4),
    capacities: { ...completeCapacities(0.4), rest_defence: Number.NaN },
  });
});

test("a shape derived under another policy version is refused, not silently used", () => {
  // Its numbers still look valid, so nothing downstream would notice. The stamp
  // is the only evidence that context and shape came from the same calibration.
  assertRejected(
    withHomeShape({ ...shapeFor(0.4), policyVersion: "match-tactics-someone-else" }),
    "mismatched_tactics_policy_version",
  );
});

test("a context carrying an intrinsic shape stays JSON serializable", () => {
  const context = withHomeShape(shapeFor(0.4));

  assert.deepEqual(JSON.parse(JSON.stringify(context)), context);
});

/** A complete flat shape stamped with the version this context's calibration uses. */
function shapeFor(value: number): TacticalShapeProfile {
  return {
    policyVersion: matchTacticsCalibrationFixture().version,
    capacities: completeCapacities(value),
  };
}

function withHomeShape(shape: TacticalShapeProfile): MatchContext {
  const context = validContext();

  return { ...context, home: { ...context.home, shape } };
}

function assertShapeRejected(shape: TacticalShapeProfile): void {
  assertRejected(withHomeShape(shape), "invalid_tactical_shape");
}

function assertRejected(context: MatchContext, code: string): void {
  assert.throws(
    () => {
      assertValidMatchContext(context);
    },
    (error: unknown) => error instanceof MatchContextError && error.code === code,
    `expected ${code}`,
  );
}

function completeCapacities(value: number): Record<TacticalShapeCapacity, number> {
  return Object.fromEntries(TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, value])) as Record<
    TacticalShapeCapacity,
    number
  >;
}

/**
 * Builds a complete valid match context fixture.
 */
function validContext(): MatchContext {
  return {
    fixtureId: fixtureId("fixture:000001"),
    seed: "demo-001",
    home: validTeam("home"),
    away: validTeam("away"),
    engineConfig: validConfig(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
}

/**
 * Builds a minimal side context for validation tests.
 */
function validTeam(side: "home" | "away"): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [createLineupSlot({ slotId: `slot:${side}:one`, playerId: playerId(`player:${side}-000001`), canonicalRole: "central_midfielder" })],
    strength: {
      attack: 10,
      midfield: 10,
      defense: 10,
      goalkeeper: 10,
      overall: 10,
    },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: {
      directness: 0,
      pressing: 0,
      width: 0,
      risk: 0,
      mentality: "balanced",
    },
  });
}

/**
 * Builds a minimal valid engine config fixture.
 */
function validConfig(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: {
      baseOpportunityRatePerMinute: 0.04,
      maxOpportunityRatePerMinute: 0.2,
    },
    conversionBands: [
      {
        bandKey: "low",
        minQualityInclusive: 0,
        maxQualityExclusive: 1,
        goalProbability: 0.1,
      },
    ],
    homeAdvantageFactor: 1.05,
    strengthGapMultiplier: 1,
    discipline: matchDisciplineConfigFixture(),
    tacticalDistributionCaps: {
      directness: { minInclusive: -1, maxInclusive: 1 },
      pressing: { minInclusive: -1, maxInclusive: 1 },
      width: { minInclusive: -1, maxInclusive: 1 },
      risk: { minInclusive: -1, maxInclusive: 1 },
    },
  };
}
