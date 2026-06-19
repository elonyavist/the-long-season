import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchEngineConfig } from "./match-engine-config.ts";
import { buildMatchRngKey, matchRngKeyParts, type MatchContext, type MatchTeamContext } from "./match-context.ts";
import { createInitialMatchSimulationState, type MatchSide, type MatchSimulationState } from "./match-simulation-state.ts";
import type { OccasionResolver, OccasionResolution, ResolveOccasionInput } from "./occasion-resolver.ts";
import { stepMatch, type MatchShotOutcomeStepEvent } from "./step-match.ts";

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
  const strongContext = withGoalkeeperTeams(validContext({
    homeStrength: 18,
    awayStrength: 5,
    fixtureValue: "fixture:strong-sample",
    minuteCount: 4_000,
  }));
  const weakContext = withGoalkeeperTeams(validContext({
    homeStrength: 5,
    awayStrength: 18,
    fixtureValue: "fixture:weak-sample",
    minuteCount: 4_000,
  }));
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
  const context = withGoalkeeperTeams(validContext({
    baseOpportunityRatePerMinute: 1,
    maxOpportunityRatePerMinute: 1,
  }));
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "goal", quality: 0.8, isShotOnTarget: true }),
  });
  const goalEvents = result.events.filter((event) => event.type === "shot_outcome" && event.outcome === "goal");

  assert.equal(goalEvents.length, 2);

  for (const event of goalEvents) {
    const expectedPlayerId = playerId(`player:${event.side}-field`);
    assert.equal(event.scorerPlayerId, expectedPlayerId);
  }
});

test("shot step events include deterministic structured shot context", () => {
  const context = {
    ...validContext({
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: goalkeeperTeam("home", { directness: 0, pressing: 0, width: 1, risk: 0 }),
    away: goalkeeperTeam("away", { directness: 1, pressing: 0, width: 0, risk: 1 }),
  };
  const first = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "save", quality: 0.802, isShotOnTarget: true }),
  });
  const second = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "save", quality: 0.802, isShotOnTarget: true }),
  });
  const firstShotEvents = first.events.filter((event) => event.type === "shot_outcome");
  const secondShotEvents = second.events.filter((event) => event.type === "shot_outcome");

  assert.deepEqual(firstShotEvents, secondShotEvents);
  assert.deepEqual(
    firstShotEvents.map((event) => ({
      side: event.side,
      shotType: event.shotType,
      chanceType: event.chanceType,
    })),
    [
      { side: "home", shotType: "header", chanceType: "cross" },
      { side: "away", shotType: "normal", chanceType: "counter" },
    ],
  );
});

test("save step events include the defending goalkeeper", () => {
  const context = {
    ...validContext({
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: goalkeeperTeam("home"),
    away: goalkeeperTeam("away"),
  };
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "save", quality: 0.8, isShotOnTarget: true }),
  });
  const saveEvents = result.events.filter(isSaveStepEvent);

  assert.equal(saveEvents.length, 2);

  for (const event of saveEvents) {
    const expectedGoalkeeperId = event.side === "home" ? playerId("player:away-gk") : playerId("player:home-gk");
    assert.equal(event.goalkeeperPlayerId, expectedGoalkeeperId);
  }
});

test("non-goal step events include a shooter from the attacking side lineup", () => {
  const context = {
    ...validContext({
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: goalkeeperTeam("home"),
    away: goalkeeperTeam("away"),
  };
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "miss", quality: 0.8, isShotOnTarget: false }),
  });
  const shotEvents = result.events.filter((event) => event.type === "shot_outcome" && event.outcome !== "goal");

  assert.equal(shotEvents.length, 2);

  for (const event of shotEvents) {
    const expectedShooterId = event.side === "home" ? playerId("player:home-field") : playerId("player:away-field");
    assert.equal(event.shooterPlayerId, expectedShooterId);
  }
});

test("save step events fail clearly when the defending team has no goalkeeper", () => {
  const context = validContext({
    baseOpportunityRatePerMinute: 1,
    maxOpportunityRatePerMinute: 1,
  });

  assert.throws(
    () =>
      stepMatch({
        simulation: createInitialMatchSimulationState(context),
        rng: rngFor(context),
        occasionResolver: fixedResolver({ outcome: "save", quality: 0.8, isShotOnTarget: true }),
      }),
    /without a goalkeeper slot/,
  );
});

test("goal step events can include deterministic assist attribution", () => {
  const context = {
    ...validContext({
      fixtureValue: "fixture:assist-step-000001",
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: assistTeam("home"),
    away: assistTeam("away"),
  };
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "goal", quality: 0.802, isShotOnTarget: true }),
  });
  const goalEvents = result.events.filter((event) => event.type === "shot_outcome" && event.outcome === "goal");

  assert.deepEqual(
    goalEvents.map((event) => ({
      side: event.side,
      scorerPlayerId: event.scorerPlayerId,
      assistPlayerId: event.assistPlayerId,
      creatorPlayerId: event.creatorPlayerId,
    })),
    [
      {
        side: "away",
        scorerPlayerId: playerId("player:away-att"),
        assistPlayerId: playerId("player:away-mid"),
        creatorPlayerId: undefined,
      },
      {
        side: "home",
        scorerPlayerId: playerId("player:home-att"),
        assistPlayerId: undefined,
        creatorPlayerId: playerId("player:home-mid"),
      },
    ],
  );
});

test("goal assists remain optional and never equal the scorer", () => {
  const context = {
    ...validContext({
      fixtureValue: "fixture:assist-optional-000001",
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: assistTeam("home"),
    away: assistTeam("away"),
  };
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "goal", quality: 0.802, isShotOnTarget: true }),
  });
  const goalEvents = result.events.filter((event) => event.type === "shot_outcome" && event.outcome === "goal");

  assert.equal(goalEvents.length, 2);

  for (const event of goalEvents) {
    if (event.assistPlayerId !== undefined) {
      assert.notEqual(event.assistPlayerId, event.scorerPlayerId);
    }
  }
});

test("non-goal step events include shooter attribution without scorer attribution", () => {
  const context = withGoalkeeperTeams(validContext({
    baseOpportunityRatePerMinute: 1,
    maxOpportunityRatePerMinute: 1,
  }));
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "miss", quality: 0.8, isShotOnTarget: false }),
  });
  const shotEvents = result.events.filter((event) => event.type === "shot_outcome");

  assert.equal(shotEvents.length, 2);

  for (const event of shotEvents) {
    assert.equal("scorerPlayerId" in event, false);
    assert.equal("shooterPlayerId" in event, true);
  }
});

test("block step events keep the selected primary defender engine-local", () => {
  const context = {
    ...validContext({
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: assistTeam("home"),
    away: assistTeam("away"),
  };
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({ outcome: "block", quality: 0.8, isShotOnTarget: false }),
  });
  const blockEvents = result.events.filter(isBlockStepEvent);

  assert.deepEqual(
    blockEvents.map((event) => ({
      side: event.side,
      primaryDefenderPlayerId: event.primaryDefenderPlayerId,
    })),
    [
      {
        side: "home",
        primaryDefenderPlayerId: playerId("player:away-mid"),
      },
      {
        side: "away",
        primaryDefenderPlayerId: playerId("player:home-def"),
      },
    ],
  );
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
    readonly homeTacticalDistribution?: MatchTeamContext["tacticalDistribution"];
    readonly awayTacticalDistribution?: MatchTeamContext["tacticalDistribution"];
  } = {},
): MatchContext {
  return {
    fixtureId: fixtureId(options.fixtureValue ?? "fixture:000001"),
    seed: "demo-001",
    home: validTeam("home", options.homeStrength ?? 12, options.homeTacticalDistribution),
    away: validTeam("away", options.awayStrength ?? 10, options.awayTacticalDistribution),
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
function validTeam(
  side: MatchSide,
  strength: number,
  tacticalDistribution: MatchTeamContext["tacticalDistribution"] = {
    directness: 0,
    pressing: 0,
    width: 0,
    risk: 0,
  },
): MatchTeamContext {
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
    tacticalDistribution,
  };
}

/**
 * Replaces both sides with goalkeeper-bearing lineups while preserving strengths.
 */
function withGoalkeeperTeams(context: MatchContext): MatchContext {
  return {
    ...context,
    home: goalkeeperTeam("home", context.home.tacticalDistribution, context.home.strength.overall),
    away: goalkeeperTeam("away", context.away.tacticalDistribution, context.away.strength.overall),
  };
}

/**
 * Builds a team context with a goalkeeper slot for save-attribution tests.
 */
function goalkeeperTeam(
  side: MatchSide,
  tacticalDistribution: MatchTeamContext["tacticalDistribution"] = {
    directness: 0,
    pressing: 0,
    width: 0,
    risk: 0,
  },
  strength = 10,
): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [
      {
        slotId: `slot:${side}:gk`,
        playerId: playerId(`player:${side}-gk`),
        roleKey: "gk",
      },
      {
        slotId: `slot:${side}:field`,
        playerId: playerId(`player:${side}-field`),
        roleKey: "balanced",
      },
    ],
    strength: {
      attack: strength,
      midfield: strength,
      defense: strength,
      goalkeeper: strength,
      overall: strength,
    },
    tacticalDistribution,
  };
}

/**
 * Narrows a step event to a saved-shot event.
 */
function isSaveStepEvent(event: unknown): event is MatchShotOutcomeStepEvent & { readonly outcome: "save" } {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    event.type === "shot_outcome" &&
    "outcome" in event &&
    event.outcome === "save"
  );
}

/**
 * Narrows a step event to a blocked-shot event.
 */
function isBlockStepEvent(event: unknown): event is MatchShotOutcomeStepEvent & { readonly outcome: "block" } {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    event.type === "shot_outcome" &&
    "outcome" in event &&
    event.outcome === "block"
  );
}

/**
 * Builds a multi-role team context used by causal actor integration tests.
 */
function assistTeam(side: MatchSide): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [
      {
        slotId: `slot:${side}:gk`,
        playerId: playerId(`player:${side}-gk`),
        roleKey: "gk",
      },
      {
        slotId: `slot:${side}:def`,
        playerId: playerId(`player:${side}-def`),
        roleKey: "defender",
      },
      {
        slotId: `slot:${side}:mid`,
        playerId: playerId(`player:${side}-mid`),
        roleKey: "midfielder",
      },
      {
        slotId: `slot:${side}:att`,
        playerId: playerId(`player:${side}-att`),
        roleKey: "attacker",
      },
    ],
    strength: {
      attack: 10,
      midfield: 10,
      defense: 10,
      goalkeeper: 10,
      overall: 10,
    },
    tacticalDistribution: {
      directness: 1,
      pressing: 0,
      width: 0,
      risk: 1,
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
