import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId, type FixtureId } from "@game/domain";

import {
  assertValidMatchContext,
  buildMatchRngKey,
  isValidMatchContext,
  matchRngKeyParts,
  MatchContextError,
  type MatchContext,
  type MatchEngineConfig,
  type MatchTeamContext,
} from "../index.ts";

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
  };
}

/**
 * Builds a minimal side context for validation tests.
 */
function validTeam(side: "home" | "away"): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [createLineupSlot({ slotId: `slot:${side}:one`, playerId: playerId(`player:${side}-000001`), canonicalRole: "central_midfielder" })],
    strength: {
      attack: 10,
      midfield: 10,
      defense: 10,
      goalkeeper: 10,
      overall: 10,
    },
    tacticalDistribution: {
      directness: 0,
      pressing: 0,
      width: 0,
      risk: 0,
    },
  };
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
    tacticalDistributionCaps: {
      directness: { minInclusive: -1, maxInclusive: 1 },
      pressing: { minInclusive: -1, maxInclusive: 1 },
      width: { minInclusive: -1, maxInclusive: 1 },
      risk: { minInclusive: -1, maxInclusive: 1 },
    },
  };
}
