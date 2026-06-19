import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchEngineConfig } from "./match-engine-config.ts";
import { buildMatchRngKey, matchRngKeyParts, type MatchContext, type MatchTeamContext } from "./match-context.ts";
import { createInitialMatchSimulationState, type MatchSide, type MatchSimulationState } from "./match-simulation-state.ts";
import type { OccasionResolver, OccasionResolution, ResolveOccasionInput } from "./occasion-resolver.ts";
import { stepMatch } from "./step-match.ts";

/**
 * Step-match tests prove that the minute loop is deterministic, local, and
 * driven by aggregate strength before the full match driver exists.
 */

test("one step advances the minute exactly once", () => {
  const context = validContext();
  const simulation = createInitialMatchSimulationState(context);
  const result = stepMatch({ simulation, rng: rngFor(context) });

  assert.equal(result.simulation.minute, 1);
  assert.equal(result.isComplete, false);
  assert.deepEqual(result.events[0], { type: "kickoff", minute: 0 });
});

test("same seed and context produce the same events and state", () => {
  const context = validContext();
  const first = stepMatch({ simulation: createInitialMatchSimulationState(context), rng: rngFor(context) });
  const second = stepMatch({ simulation: createInitialMatchSimulationState(context), rng: rngFor(context) });

  assert.deepEqual(first.events, second.events);
  assert.deepEqual(first.simulation, second.simulation);
  assert.deepEqual(first.processedSides, second.processedSides);
});

test("stronger teams produce more shots or goals over a deterministic sample", () => {
  const strongContext = validContext({
    homeStrength: 18,
    awayStrength: 5,
    fixtureValue: "fixture:strong-sample",
    minuteCount: 4_000,
  });
  const weakContext = validContext({
    homeStrength: 5,
    awayStrength: 18,
    fixtureValue: "fixture:weak-sample",
    minuteCount: 4_000,
  });
  const strongSample = runSteps(strongContext, 4_000);
  const weakSample = runSteps(weakContext, 4_000);
  const strongOutput = strongSample.stats.home.shots + strongSample.stats.home.goals;
  const weakOutput = weakSample.stats.home.shots + weakSample.stats.home.goals;

  assert.ok(strongOutput > weakOutput, `expected strong home output ${strongOutput} to beat weak home output ${weakOutput}`);
});

test("home and away processing order does not always favor the same side", () => {
  const context = validContext({ minuteCount: 60, baseOpportunityRatePerMinute: 0 });
  let simulation = createInitialMatchSimulationState(context);
  const rng = rngFor(context);
  const firstSides: MatchSide[] = [];

  for (let index = 0; index < 60; index += 1) {
    const result = stepMatch({ simulation, rng });
    firstSides.push(result.processedSides[0]);
    simulation = result.simulation;
  }

  assert.ok(firstSides.includes("home"));
  assert.ok(firstSides.includes("away"));
});

test("goal step events include a scorer from the scoring side lineup", () => {
  const context = validContext({
    baseOpportunityRatePerMinute: 1,
    maxOpportunityRatePerMinute: 1,
  });
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "goal", quality: 0.8, isShotOnTarget: true }),
  });
  const goalEvents = result.events.filter((event) => event.type === "shot_outcome" && event.outcome === "goal");

  assert.equal(goalEvents.length, 2);

  for (const event of goalEvents) {
    const expectedPlayerId = playerId(`player:${event.side}-000001`);
    assert.equal(event.scorerPlayerId, expectedPlayerId);
  }
});

test("non-goal step events do not include scorer attribution", () => {
  const context = validContext({
    baseOpportunityRatePerMinute: 1,
    maxOpportunityRatePerMinute: 1,
  });
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "save", quality: 0.8, isShotOnTarget: true }),
  });
  const shotEvents = result.events.filter((event) => event.type === "shot_outcome");

  assert.equal(shotEvents.length, 2);

  for (const event of shotEvents) {
    assert.equal("scorerPlayerId" in event, false);
  }
});

test("stepMatch does not mutate the input simulation state", () => {
  const context = validContext();
  const simulation = createInitialMatchSimulationState(context);
  const before = JSON.parse(JSON.stringify(simulation)) as MatchSimulationState;

  stepMatch({ simulation, rng: rngFor(context) });

  assert.deepEqual(simulation, before);
});

/**
 * Runs a bounded number of step calls as a test-only sample helper.
 */
function runSteps(context: MatchContext, stepCount: number): MatchSimulationState {
  let simulation = createInitialMatchSimulationState(context);
  const rng = rngFor(context);

  for (let index = 0; index < stepCount; index += 1) {
    const result = stepMatch({ simulation, rng });
    simulation = result.simulation;
    if (result.isComplete) {
      break;
    }
  }

  return simulation;
}

/**
 * Creates the deterministic match RNG for one context fixture.
 */
function rngFor(context: MatchContext) {
  const key = buildMatchRngKey(context);
  return deriveRng(key.seed, key.streamName, ...matchRngKeyParts(key));
}

/**
 * Builds a valid context with optional strength and timing overrides.
 */
function validContext(
  options: {
    readonly homeStrength?: number;
    readonly awayStrength?: number;
    readonly fixtureValue?: string;
    readonly minuteCount?: number;
    readonly baseOpportunityRatePerMinute?: number;
    readonly maxOpportunityRatePerMinute?: number;
  } = {},
): MatchContext {
  return {
    fixtureId: fixtureId(options.fixtureValue ?? "fixture:000001"),
    seed: "demo-001",
    home: validTeam("home", options.homeStrength ?? 12),
    away: validTeam("away", options.awayStrength ?? 10),
    engineConfig: validConfig({
      minuteCount: options.minuteCount ?? 90,
      baseOpportunityRatePerMinute: options.baseOpportunityRatePerMinute ?? 0.08,
      maxOpportunityRatePerMinute: options.maxOpportunityRatePerMinute ?? 0.4,
    }),
  };
}

/**
 * Builds one side context fixture at a given aggregate strength.
 */
function validTeam(side: MatchSide, strength: number): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [{ slotId: `slot:${side}:one`, playerId: playerId(`player:${side}-000001`), roleKey: "balanced" }],
    strength: {
      attack: strength,
      midfield: strength,
      defense: strength,
      goalkeeper: strength,
      overall: strength,
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
 * Builds a valid match-engine config fixture.
 */
function validConfig(options: {
  readonly minuteCount: number;
  readonly baseOpportunityRatePerMinute: number;
  readonly maxOpportunityRatePerMinute: number;
}): MatchEngineConfig {
  return {
    minuteCount: options.minuteCount,
    rates: {
      baseOpportunityRatePerMinute: options.baseOpportunityRatePerMinute,
      maxOpportunityRatePerMinute: options.maxOpportunityRatePerMinute,
    },
    conversionBands: [
      {
        bandKey: "low",
        minQualityInclusive: 0,
        maxQualityExclusive: 0.35,
        goalProbability: 0.05,
      },
      {
        bandKey: "medium",
        minQualityInclusive: 0.35,
        maxQualityExclusive: 0.7,
        goalProbability: 0.12,
      },
      {
        bandKey: "high",
        minQualityInclusive: 0.7,
        maxQualityExclusive: 1.01,
        goalProbability: 0.24,
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

/**
 * Builds a deterministic test resolver that always emits the same outcome.
 */
function fixedResolver(resolution: OccasionResolution): OccasionResolver {
  return {
    resolveOccasion(_input: ResolveOccasionInput): OccasionResolution {
      return resolution;
    },
  };
}
