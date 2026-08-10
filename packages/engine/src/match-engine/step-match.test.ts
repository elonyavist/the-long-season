import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId, type ShotChanceType } from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchEngineConfig } from "./match-engine-config.ts";
import { buildMatchRngKey, matchRngKeyParts, type MatchContext, type MatchTeamContext } from "./match-context.ts";
import { buildLiveMatchProjection } from "./live-match-projection.ts";
import {
  createInitialMatchSimulationState,
  telemetryFor,
  type MatchSide,
  type MatchSimulationState,
} from "./match-simulation-state.ts";
import type { OccasionResolver, OccasionResolution, ResolveOccasionInput } from "./occasion-resolver.ts";
import { OPPORTUNITY_ROUTE_CHANCE_TYPE } from "./opportunity-route.ts";
import { stepMatch, type MatchShotOutcomeStepEvent } from "./step-match.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import type { TacticalShapeProfile } from "./tactical-shape.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


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

test("zero-opportunity minute advances deterministically without visible events", () => {
  const context = validContext({
    fixtureValue: "fixture:no-event-minute-000001",
    baseOpportunityRatePerMinute: 0,
    maxOpportunityRatePerMinute: 0,
  });
  const firstRunRng = rngFor(context);
  const secondRunRng = rngFor(context);
  const firstRunKickoff = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: firstRunRng,
  });
  const firstRunNoEvent = stepMatch({
    simulation: firstRunKickoff.simulation,
    rng: firstRunRng,
  });
  const secondRunKickoff = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: secondRunRng,
  });
  const secondRunNoEvent = stepMatch({
    simulation: secondRunKickoff.simulation,
    rng: secondRunRng,
  });

  assert.deepEqual(firstRunKickoff.events, [{ type: "kickoff", minute: 0 }]);
  assert.deepEqual(firstRunNoEvent.events, []);
  assert.equal(firstRunNoEvent.simulation.minute, 2);
  assert.deepEqual(firstRunNoEvent.events, secondRunNoEvent.events);
  assert.deepEqual(firstRunNoEvent.simulation, secondRunNoEvent.simulation);
  assert.deepEqual(firstRunNoEvent.processedSides, secondRunNoEvent.processedSides);
  assert.deepEqual(
    {
      home: firstRunNoEvent.simulation.stats.home,
      away: firstRunNoEvent.simulation.stats.away,
    },
    {
    home: {
      opportunities: 0,
      shots: 0,
      shotsOnTarget: 0,
      goals: 0,
    },
    away: {
      opportunities: 0,
      shots: 0,
      shotsOnTarget: 0,
      goals: 0,
    },
    },
  );
});

test("one resolved shot per side accumulates truthful causal statistics and condition", () => {
  const context = withGoalkeeperTeams(validContext({
    baseOpportunityRatePerMinute: 1,
    maxOpportunityRatePerMinute: 1,
  }));
  const result = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver({
      outcome: "save",
      quality: 0.8,
      isShotOnTarget: true,
      expectedGoals: 0.42,
      resultsInCorner: true,
    }),
  });
  const projection = buildLiveMatchProjection({ simulation: result.simulation, events: result.events });

  assert.equal(projection.statistics.home.possessionShare + projection.statistics.away.possessionShare, 1);
  assert.deepEqual(projection.statistics.home, {
    possessionShare: projection.statistics.home.possessionShare,
    shots: 1,
    shotsOnTarget: 1,
    expectedGoals: 0.42,
    corners: 1,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 1,
    goals: 0,
  });
  assert.deepEqual(projection.statistics.away, {
    ...projection.statistics.home,
    possessionShare: projection.statistics.away.possessionShare,
  });
  const telemetry = telemetryFor(result.simulation);
  assert.ok((telemetry.playerCondition[playerId("player:home-field")] ?? 100) < 100);
  assert.ok(
    (telemetry.playerCondition[playerId("player:home-gk")] ?? 0) >
      (telemetry.playerCondition[playerId("player:home-field")] ?? 100),
  );
});

test("numerical advantage increases deterministic minute control", () => {
  const context = validContext({ baseOpportunityRatePerMinute: 0, maxOpportunityRatePerMinute: 0 });
  const result = stepMatch({
    simulation: createInitialMatchSimulationState({
      ...context,
      home: goalkeeperTeam("home", context.home.tacticalDistribution, 10),
      away: validTeam("away", 10, context.away.tacticalDistribution),
    }),
    rng: rngFor(context),
  });
  const control = telemetryFor(result.simulation).controlUnits;

  assert.ok(control.home > control.away, `expected home control ${control.home} to exceed away ${control.away}`);
});

test("lower-possession teams can still win through deterministic conversion", () => {
  let counterattackingWin:
    | { readonly fixture: string; readonly possession: number; readonly score: string }
    | undefined;

  for (let index = 0; index < 400; index += 1) {
    const context = withGoalkeeperTeams(validContext({
      fixtureValue: `fixture:counter-sample-${String(index).padStart(6, "0")}`,
      homeStrength: 10,
      awayStrength: 10,
      homeTacticalDistribution: { directness: -1, pressing: 1, width: 0.5, risk: 0.5, mentality: "balanced" },
      awayTacticalDistribution: { directness: 1, pressing: -1, width: 0, risk: 0, mentality: "balanced" },
    }));
    const simulation = runSteps(context, 90);
    const telemetry = telemetryFor(simulation);
    const totalControl = telemetry.controlUnits.home + telemetry.controlUnits.away;
    const awayPossession = telemetry.controlUnits.away / totalControl;

    if (simulation.score.away > simulation.score.home && awayPossession < 0.5) {
      counterattackingWin = {
        fixture: String(context.fixtureId),
        possession: awayPossession,
        score: `${simulation.score.home}-${simulation.score.away}`,
      };
      break;
    }
  }

  assert.ok(counterattackingWin, "expected at least one deterministic lower-possession away win");
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
  assert.ok(
    strongOutput >= weakOutput * 1.3,
    `expected strength separation to be material, got strong=${strongOutput} weak=${weakOutput}`,
  );
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

test("shot step events are deterministic for one seed", () => {
  const context = {
    ...validContext({
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: goalkeeperTeam("home", { directness: 0, pressing: 0, width: 1, risk: 0, mentality: "balanced" }),
    away: goalkeeperTeam("away", { directness: 1, pressing: 0, width: 0, risk: 1, mentality: "balanced" }),
  };
  const resolution = { outcome: "save", quality: 0.802, isShotOnTarget: true } as const;

  const first = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver(resolution),
  });
  const second = stepMatch({
    simulation: createInitialMatchSimulationState(context),
    rng: rngFor(context),
    occasionResolver: fixedResolver(resolution),
  });

  const shots = first.events.filter((event) => event.type === "shot_outcome");
  assert.deepEqual(shots, second.events.filter((event) => event.type === "shot_outcome"));
  assert.equal(shots.length > 0, true, "the test needs at least one shot to be asserting anything");
});

test("the chance type a shot carries is decided by the route it came down", () => {
  // Route choice is a draw against the plan's weights, so one minute proves
  // nothing: a wide side can still be handed a counter. What must hold is that
  // moving the knobs that own a route moves that route's chance type across
  // many minutes. Asserting a single draw would pin the RNG, not the model.
  const crossing = chanceTypeCounts({ directness: 0, pressing: 0, width: 1, risk: 0, mentality: "balanced" });
  const counterPressing = chanceTypeCounts({ directness: 0, pressing: 1, width: 0, risk: 0, mentality: "balanced" });

  assert.equal(
    (crossing.cross ?? 0) > (counterPressing.cross ?? 0),
    true,
    "the side told to use the flanks must produce more crosses",
  );
  assert.equal(
    (counterPressing.counter ?? 0) > (crossing.counter ?? 0),
    true,
    "the side told to press must produce more counters",
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
    assert.equal(typeof event.selectedCreatorPlayerId, "string");
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

test("goal step events carry deterministic assist attribution", () => {
  // Which team-mate is credited belongs to `chance-actors`, and moves whenever
  // chance type does - it is now a fact about the route the goal came down.
  // What the minute loop owns is the wiring: every goal reaches the event with
  // exactly one credited team-mate, never the scorer, and identically for one
  // seed. Pinning the names here would re-test actor selection through an RNG
  // chain and would break on every route change that is working as intended.
  const context = {
    ...validContext({
      fixtureValue: "fixture:assist-step-000001",
      baseOpportunityRatePerMinute: 1,
      maxOpportunityRatePerMinute: 1,
    }),
    home: assistTeam("home"),
    away: assistTeam("away"),
  };
  const goalsFor = () =>
    stepMatch({
      simulation: createInitialMatchSimulationState(context),
      rng: rngFor(context),
      occasionResolver: fixedResolver({ outcome: "goal", quality: 0.802, isShotOnTarget: true }),
    }).events.filter((event) => event.type === "shot_outcome" && event.outcome === "goal");

  const goalEvents = goalsFor();

  assert.deepEqual(goalEvents, goalsFor());
  assert.equal(goalEvents.length > 0, true, "the test needs at least one goal to be asserting anything");

  for (const goal of goalEvents) {
    const credited = [goal.assistPlayerId, goal.creatorPlayerId].filter((id) => id !== undefined);

    assert.equal(typeof goal.selectedCreatorPlayerId, "string");
    assert.equal(credited.length, 1, `${goal.side} goal credited ${credited.length} team-mates`);
    assert.equal(credited[0] === goal.scorerPlayerId, false, "a goal may never be assisted by its own scorer");
  }
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

  // The claim is that the engine names the blocker itself, and that the blocker
  // is one of the players actually defending. Which of them it picks is a
  // weighted draw on the actor stream, and that stream is seeded partly by the
  // chance type - so pinning one name here would pin which route the minute
  // took, which is a different test and a fragile one.
  assert.deepEqual(blockEvents.map((event) => event.side), ["home", "away"]);
  for (const event of blockEvents) {
    const defendingLineup = event.side === "home" ? context.away.lineup : context.home.lineup;
    assert.equal(
      defendingLineup.some((slot) => slot.playerId === event.primaryDefenderPlayerId),
      true,
      `${event.primaryDefenderPlayerId} was not defending`,
    );
  }
});

test("the outcome cannot change who was involved or how the chance was worked", () => {
  // Causal ordering where the minute loop can break it. The same minute is run
  // twice with the only difference being what the resolver decides, and the two
  // shots must agree on every fact that existed before it decided: the route,
  // the chance and shot type, and the attacking player on the end of it.
  //
  // Under the path this replaced they could not have: the shot type read the
  // resolved quality, and the actor stream was seeded with that shot type, so
  // forcing a different outcome quietly picked a different player.
  const context = {
    ...validContext({ baseOpportunityRatePerMinute: 1, maxOpportunityRatePerMinute: 1 }),
    home: assistTeam("home"),
    away: assistTeam("away"),
  };
  const shotsWhen = (resolver: OccasionResolver): readonly MatchShotOutcomeStepEvent[] =>
    stepMatch({
      simulation: createInitialMatchSimulationState(context),
      rng: rngFor(context),
      occasionResolver: resolver,
    }).events.filter(isShotOutcomeStepEvent);

  const scored = shotsWhen(fixedResolver({ outcome: "goal", quality: 0.8, isShotOnTarget: true }));
  const blocked = shotsWhen(fixedResolver({ outcome: "block", quality: 0.2, isShotOnTarget: false }));

  assert.equal(scored.length, 2);
  assert.equal(blocked.length, scored.length);

  // The first opportunity has the same pre-resolution context in both arms.
  // Its outcome then changes the score seen by the second side, so comparing a
  // later opportunity would incorrectly require actors to ignore real state.
  const goal = scored[0];
  const block = blocked[0];
  assert.ok(goal !== undefined && block !== undefined);
  assert.equal(goal.side, block.side);
  assert.equal(goal.route, block.route);
  assert.equal(goal.chanceType, block.chanceType);
  assert.equal(goal.shotType, block.shotType);
  assert.equal(
    goal.outcome === "goal" ? goal.scorerPlayerId : undefined,
    block.outcome === "block" ? block.shooterPlayerId : undefined,
    "the player who scored it and the player whose shot was blocked are the same man",
  );
});

test("every shot event agrees with the route it says it came down", () => {
  // Event coherence. `chanceType` is derived from `route`, so an event carrying
  // a pair the route model cannot produce would mean the projection had invented
  // one of them rather than read both off the same occasion.
  const context = withGoalkeeperTeams(
    validContext({ baseOpportunityRatePerMinute: 1, maxOpportunityRatePerMinute: 1 }),
  );
  let simulation = createInitialMatchSimulationState(context);
  const rng = rngFor(context);
  let shotCount = 0;

  for (let step = 0; step < 90; step += 1) {
    const result = stepMatch({ simulation, rng });
    simulation = result.simulation;

    for (const event of result.events.filter(isShotOutcomeStepEvent)) {
      if (event.chanceType === "dead_ball") {
        assert.equal(event.route, undefined, "a penalty was never worked down a route");
        continue;
      }

      assert.ok(event.route !== undefined, "an open-play shot must say which way it came");
      assert.equal(OPPORTUNITY_ROUTE_CHANCE_TYPE[event.route], event.chanceType);
      shotCount += 1;
    }

    if (result.isComplete) break;
  }

  assert.ok(shotCount > 0, "the fixture must produce shots for this to prove anything");
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
 * Counts the chance types one tactic produces for the home side.
 *
 * Each draw is an opening minute of a different fixture, which is the cheapest
 * way to sample many independent route choices without threading simulation
 * state through the test.
 */
function chanceTypeCounts(
  homeTactics: MatchTeamContext["tacticalDistribution"],
  draws = 300,
): Partial<Record<ShotChanceType, number>> {
  const counts: Partial<Record<ShotChanceType, number>> = {};

  for (let draw = 0; draw < draws; draw += 1) {
    const context = {
      ...validContext({
        fixtureValue: `fixture:${String(draw).padStart(6, "0")}`,
        baseOpportunityRatePerMinute: 1,
        maxOpportunityRatePerMinute: 1,
      }),
      home: goalkeeperTeam("home", homeTactics),
      away: goalkeeperTeam("away"),
    };
    const result = stepMatch({
      simulation: createInitialMatchSimulationState(context),
      rng: rngFor(context),
      occasionResolver: fixedResolver({ outcome: "save", quality: 0.802, isShotOnTarget: true }),
    });

    for (const event of result.events) {
      if (event.type === "shot_outcome" && event.side === "home") {
        counts[event.chanceType] = (counts[event.chanceType] ?? 0) + 1;
      }
    }
  }

  return counts;
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
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
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
    mentality: "balanced",
  },
): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [createLineupSlot({ slotId: `slot:${side}:one`, playerId: playerId(`player:${side}-000001`), canonicalRole: "central_midfielder" })],
    strength: {
      attack: strength,
      midfield: strength,
      defense: strength,
      goalkeeper: strength,
      overall: strength,
    },
    shape: shapeForStrength(strength),
    tacticalDistribution,
  });
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
    mentality: "balanced",
  },
  strength = 10,
): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
      createLineupSlot({
        slotId: `slot:${side}:field`,
        playerId: playerId(`player:${side}-field`),
        canonicalRole: "central_midfielder",
      }),
    ],
    strength: {
      attack: strength,
      midfield: strength,
      defense: strength,
      goalkeeper: strength,
      overall: strength,
    },
    shape: shapeForStrength(strength),
    tacticalDistribution,
  });
}

/**
 * Narrows a step event to any resolved shot outcome.
 */
function isShotOutcomeStepEvent(event: unknown): event is MatchShotOutcomeStepEvent {
  return typeof event === "object" && event !== null && "type" in event && event.type === "shot_outcome";
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
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: `slot:${side}:def`, playerId: playerId(`player:${side}-def`), canonicalRole: "center_back" }),
      createLineupSlot({ slotId: `slot:${side}:mid`, playerId: playerId(`player:${side}-mid`), canonicalRole: "central_midfielder" }),
      createLineupSlot({ slotId: `slot:${side}:att`, playerId: playerId(`player:${side}-att`), canonicalRole: "striker" }),
    ],
    strength: {
      attack: 10,
      midfield: 10,
      defense: 10,
      goalkeeper: 10,
      overall: 10,
    },
    shape: shapeForStrength(10),
    tacticalDistribution: {
      directness: 1,
      pressing: 0,
      width: 0,
      risk: 1,
      mentality: "balanced",
    },
  });
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
function fixedResolver(
  resolution: Omit<OccasionResolution, "expectedGoals" | "resultsInCorner"> &
    Partial<Pick<OccasionResolution, "expectedGoals" | "resultsInCorner">>,
): OccasionResolver {
  const completeResolution: OccasionResolution = {
    ...resolution,
    expectedGoals: resolution.expectedGoals ?? 0.2,
    resultsInCorner: resolution.resultsInCorner ?? false,
  };

  return {
    resolveOccasion(_input: ResolveOccasionInput): OccasionResolution {
      return completeResolution;
    },
  };
}

/**
 * A shape whose capacities follow the strength the fixture asked for.
 *
 * Production cannot separate the two: both come from one scoring pass, so a
 * better eleven has better capacities by construction. A hand-built context
 * that pinned every shape at the same value would quietly test a world where
 * quality stopped reaching the route model.
 */
function shapeForStrength(strength: number): TacticalShapeProfile {
  return tacticalShapeProfileFixture({ uniformCapacity: strength / (strength + 10) });
}
