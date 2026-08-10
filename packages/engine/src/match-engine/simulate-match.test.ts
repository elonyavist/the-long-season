import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import {
  simulateMatch,
  SimulateMatchError,
  type MatchContext,
  type MatchEngineConfig,
  type MatchSide,
  type MatchStepEvent,
  type MatchTeamContext,
  type SimulateMatchResult,
} from "../index.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import type { TacticalShapeProfile } from "./tactical-shape.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


/**
 * Simulate-match tests prove that the batch driver reuses `stepMatch` while
 * preserving full-match reproducibility.
 */

test("same seed and fixture ID produce identical match output", () => {
  const first = simulateMatch(validContext());
  const second = simulateMatch(validContext());

  assert.deepEqual(first, second);
});

test("same fixed context produces the expected golden output", () => {
  const result = simulateMatch(validContext());
  const { telemetry, ...aggregateStats } = result.stats;

  assert.ok(telemetry !== undefined);
  assert.deepEqual({ ...result, stats: aggregateStats }, GOLDEN_MATCH_RESULT);
});

test("zero-opportunity match stays deterministic without shot events", () => {
  const context = {
    ...validContext({ fixtureValue: "fixture:zero-opportunity-000001", minuteCount: 12 }),
    engineConfig: {
      ...validConfig(12),
      rates: {
        baseOpportunityRatePerMinute: 0,
        maxOpportunityRatePerMinute: 0,
      },
    },
  };
  const first = simulateMatch(context);
  const second = simulateMatch(context);

  assert.deepEqual(first, second);
  assert.deepEqual(first.score, { home: 0, away: 0 });
  assert.deepEqual({ home: first.stats.home, away: first.stats.away }, {
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
  });
  assert.deepEqual(
    first.events.map((event) => event.type),
    ["kickoff", "foul", "yellow_card", "foul", "half_time", "foul", "foul", "full_time"],
  );
});

test("serializing two identical match outputs to JSON produces identical strings", () => {
  const first = JSON.stringify(simulateMatch(validContext()));
  const second = JSON.stringify(simulateMatch(validContext()));

  assert.equal(first, second);
});

test("optional explanation trace does not change score, events, or stats", () => {
  const withoutTrace = simulateMatch(validContext());
  const withTrace = simulateMatch(validContext(), { includeExplanationTrace: true });

  assert.deepEqual(stripExplanationTrace(withTrace), withoutTrace);
  assert.deepEqual(withTrace.score, withoutTrace.score);
  assert.deepEqual(withTrace.events, withoutTrace.events);
  assert.deepEqual(withTrace.stats, withoutTrace.stats);
  assert.notEqual(withTrace.explanationTrace, undefined);
});

test("optional explanation trace is deterministic for the same seed", () => {
  const first = simulateMatch(validContext(), { includeExplanationTrace: true });
  const second = simulateMatch(validContext(), { includeExplanationTrace: true });

  assert.deepEqual(first.explanationTrace, second.explanationTrace);
  assert.equal(JSON.stringify(first.explanationTrace), JSON.stringify(second.explanationTrace));
});

test("different fixture IDs can produce different output with the same seed", () => {
  const first = JSON.stringify(simulateMatch(validContext({ fixtureValue: "fixture:variance-a", minuteCount: 90 })));
  const second = JSON.stringify(simulateMatch(validContext({ fixtureValue: "fixture:variance-b", minuteCount: 90 })));

  assert.notEqual(first, second);
});

test("a match reaches full time", () => {
  const result = simulateMatch(validContext({ minuteCount: 90 }));

  assert.equal(result.finalMinute, 90);
  assert.equal(result.isComplete, true);
  assert.equal(result.events[result.events.length - 1]?.type, "full_time");
});

test("final score equals the goal events emitted", () => {
  const result = simulateMatch(validContext({ minuteCount: 90 }));
  const goalCounts = countGoalEvents(result.events);

  assert.deepEqual(result.score, goalCounts);
  assert.equal(result.stats.home.goals, goalCounts.home);
  assert.equal(result.stats.away.goals, goalCounts.away);
});

test("1000 deterministic matches complete without crash", () => {
  for (let index = 0; index < 1_000; index += 1) {
    const result = simulateMatch(
      validContext({
        fixtureValue: `fixture:batch-${String(index).padStart(4, "0")}`,
        minuteCount: 90,
      }),
    );

    assert.equal(result.isComplete, true);
    assert.equal(result.finalMinute, 90);
  }
});

test("controlled strength profiles produce directional match-flow separation", () => {
  const equal = aggregateMatches(
    "fixture:flow-equal",
    profiledContext({
      home: teamProfile("home", { attack: 10, midfield: 10, defense: 10, goalkeeper: 10 }),
      away: teamProfile("away", { attack: 10, midfield: 10, defense: 10, goalkeeper: 10 }),
    }),
  );
  const strongHome = aggregateMatches(
    "fixture:flow-strong-home",
    profiledContext({
      home: teamProfile("home", { attack: 16, midfield: 15, defense: 14, goalkeeper: 14 }),
      away: teamProfile("away", { attack: 8, midfield: 8, defense: 8, goalkeeper: 8 }),
    }),
  );
  const strongAway = aggregateMatches(
    "fixture:flow-strong-away",
    profiledContext({
      home: teamProfile("home", { attack: 8, midfield: 8, defense: 8, goalkeeper: 8 }),
      away: teamProfile("away", { attack: 16, midfield: 15, defense: 14, goalkeeper: 14 }),
    }),
  );
  const strongAttackWeakDefense = aggregateMatches(
    "fixture:flow-strong-attack",
    profiledContext({
      home: teamProfile("home", { attack: 18, midfield: 13, defense: 10, goalkeeper: 10 }),
      away: teamProfile("away", { attack: 10, midfield: 10, defense: 6, goalkeeper: 6 }),
    }),
  );
  const weakAttackStrongDefense = aggregateMatches(
    "fixture:flow-weak-attack",
    profiledContext({
      home: teamProfile("home", { attack: 6, midfield: 9, defense: 10, goalkeeper: 10 }),
      away: teamProfile("away", { attack: 10, midfield: 10, defense: 18, goalkeeper: 18 }),
    }),
  );

  assert.ok(equal.home.opportunities > 0);
  assert.ok(equal.away.opportunities > 0);
  assert.ok(strongHome.home.opportunities > equal.home.opportunities);
  assert.ok(strongHome.home.goals > equal.home.goals);
  assert.ok(strongHome.homeWins > strongHome.awayWins);
  assert.ok(strongAway.away.opportunities > equal.away.opportunities);
  assert.ok(strongAway.awayWins > strongAway.homeWins);
  assert.ok(strongAttackWeakDefense.home.opportunities > weakAttackStrongDefense.home.opportunities);
  assert.ok(strongAttackWeakDefense.home.goals > weakAttackStrongDefense.home.goals);
});

/**
 * `shotsOnTarget` is deliberately absent from the department-profile assertions
 * above, and that is a claim about the metric rather than a relaxed invariant.
 *
 * The resolver marks a shot on target when it is a goal *or a save*, and save
 * probability is driven by the defending goalkeeper: `0.166` for the strong
 * attack facing a weak keeper against `0.402` for the weak attack facing a
 * strong one. A poor attack therefore forces more saves - more "shots on
 * target" - precisely because the keeper reaches them. The count measures how
 * often the keeper had to intervene, not how well the attack struck the ball,
 * so requiring the stronger attack to lead it asserts something the engine has
 * never meant.
 *
 * Attacking flow is `opportunities` and `goals`, and both separate sharply
 * here: `3190` against `2647` chances, `713` against `178` goals. The old
 * strength-difference volume model separated these same profiles `3.6x` on
 * chances, which buried the metric's behaviour rather than fixing it.
 */


test("step limit prevents accidental infinite loops", () => {
  assert.throws(
    () => simulateMatch(validContext({ minuteCount: 90 }), { maxStepCount: 10 }),
    (error: unknown) => error instanceof SimulateMatchError && error.code === "step_limit_exceeded",
  );
});

/**
 * Counts goal events by side.
 */
function countGoalEvents(events: readonly MatchStepEvent[]): SimulateMatchResult["score"] {
  const score = {
    home: 0,
    away: 0,
  };

  for (const event of events) {
    if (event.type !== "shot_outcome" || event.outcome !== "goal") {
      continue;
    }

    score[event.side] += 1;
  }

  return score;
}

/**
 * Removes optional trace data so trace-on output can be compared with the
 * default simulation result.
 */
function stripExplanationTrace(result: SimulateMatchResult): Omit<SimulateMatchResult, "explanationTrace"> {
  const { explanationTrace, ...withoutTrace } = result;
  void explanationTrace;
  return withoutTrace;
}

/** Aggregate one side's match-flow output over deterministic fixture variants. */
interface MatchFlowAggregate {
  readonly home: {
    readonly opportunities: number;
    readonly shotsOnTarget: number;
    readonly goals: number;
  };
  readonly away: {
    readonly opportunities: number;
    readonly shotsOnTarget: number;
    readonly goals: number;
  };
  readonly homeWins: number;
  readonly awayWins: number;
}

/**
 * Runs one controlled profile over multiple fixture IDs for stable flow evidence.
 */
function aggregateMatches(prefix: string, context: MatchContext): MatchFlowAggregate {
  const aggregate = {
    home: {
      opportunities: 0,
      shotsOnTarget: 0,
      goals: 0,
    },
    away: {
      opportunities: 0,
      shotsOnTarget: 0,
      goals: 0,
    },
    homeWins: 0,
    awayWins: 0,
  };

  for (let index = 0; index < 200; index += 1) {
    const result = simulateMatch({
      ...context,
      fixtureId: fixtureId(`${prefix}-${String(index).padStart(4, "0")}`),
    });

    aggregate.home.opportunities += result.stats.home.opportunities;
    aggregate.home.shotsOnTarget += result.stats.home.shotsOnTarget;
    aggregate.home.goals += result.score.home;
    aggregate.away.opportunities += result.stats.away.opportunities;
    aggregate.away.shotsOnTarget += result.stats.away.shotsOnTarget;
    aggregate.away.goals += result.score.away;

    if (result.score.home > result.score.away) {
      aggregate.homeWins += 1;
    }

    if (result.score.away > result.score.home) {
      aggregate.awayWins += 1;
    }
  }

  return aggregate;
}

/**
 * Builds a match context from explicit home and away strength profiles.
 */
function profiledContext(input: { readonly home: MatchTeamContext; readonly away: MatchTeamContext }): MatchContext {
  return {
    fixtureId: fixtureId("fixture:profiled-000001"),
    seed: "demo-001",
    home: input.home,
    away: input.away,
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    engineConfig: validConfig(90),
  };
}

/**
 * Builds one side context with explicit department strengths.
 */
function teamProfile(
  side: MatchSide,
  strength: {
    readonly attack: number;
    readonly midfield: number;
    readonly defense: number;
    readonly goalkeeper: number;
  },
): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
      createLineupSlot({
        slotId: `slot:${side}:field`,
        playerId: playerId(`player:${side}-000001`),
        canonicalRole: "central_midfielder",
      }),
    ],
    strength: {
      ...strength,
      overall: (strength.attack + strength.midfield + strength.defense + strength.goalkeeper) / 4,
    },
    shape: shapeForStrength(
      (strength.attack + strength.midfield + strength.defense + strength.goalkeeper) / 4,
    ),
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
 * Builds a valid context with optional fixture and timing overrides.
 */
function validContext(
  options: {
    readonly fixtureValue?: string;
    readonly minuteCount?: number;
  } = {},
): MatchContext {
  return {
    fixtureId: fixtureId(options.fixtureValue ?? "fixture:golden-000001"),
    seed: "demo-001",
    home: validTeam("home", 12),
    away: validTeam("away", 10),
    engineConfig: validConfig(options.minuteCount ?? 12),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
}

/**
 * Builds one side context fixture at a given aggregate strength.
 */
function validTeam(side: MatchSide, strength: number): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
      createLineupSlot({
        slotId: `slot:${side}:field`,
        playerId: playerId(`player:${side}-000001`),
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
 * Builds a valid match-engine config fixture.
 */
function validConfig(minuteCount: number): MatchEngineConfig {
  return {
    minuteCount,
    rates: {
      baseOpportunityRatePerMinute: 0.16,
      maxOpportunityRatePerMinute: 0.4,
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
 * Golden full-match output for the fixed reproducibility fixture.
 *
 * Re-declared at Step 06 block 3 with exactly two fields moved, both `quality`,
 * and every minute, shooter, chance type, outcome and score untouched. That is
 * the whole visible consequence of the route reaching the shot: the away chance
 * came down a route its shape does not own and is worth `0.489` instead of
 * `0.511`, the home counter came down one it does and is worth `0.592` instead
 * of `0.586`. Before the change every shape produced chances of identical
 * quality at identical squad quality, whatever the eleven were doing.
 */
const GOLDEN_MATCH_RESULT: SimulateMatchResult = {
  fixtureId: fixtureId("fixture:golden-000001"),
  finalMinute: 12,
  isComplete: true,
  score: {
    home: 0,
    away: 0,
  },
  stats: {
    home: {
      opportunities: 1,
      shots: 1,
      shotsOnTarget: 1,
      goals: 0,
    },
    away: {
      opportunities: 1,
      shots: 1,
      shotsOnTarget: 1,
      goals: 0,
    },
  },
  events: [
    {
      type: "kickoff",
      minute: 0,
    },
    {
      type: "foul",
      minute: 2,
      side: "home",
      committedByPlayerId: playerId("player:home-000001"),
      sufferedByPlayerId: playerId("player:away-000001"),
      zoneDanger: 0.217,
    },
    {
      type: "foul",
      minute: 2,
      side: "away",
      committedByPlayerId: playerId("player:away-000001"),
      sufferedByPlayerId: playerId("player:home-000001"),
      zoneDanger: 0.451,
    },
    {
      type: "shot_outcome",
      minute: 3,
      side: "away",
      // Both shots in this golden turned from wide into saved when shooting
      // accuracy stopped reading raw attack strength. These two elevens are
      // ordinary, so under the old reading their accuracy sat near its floor
      // and almost nothing reached a keeper; accuracy now follows the quality
      // of the position, and an even contest puts about a third of its shots on
      // target. Same minute, quality, shooter and chance type - the keeper is
      // simply in the event now, because he had something to save.
      //
      // Step 07 added `route` and changed nothing else here. Both `central` and
      // `direct` are `open_play`, so the chance type could never say which of
      // them this was - which is the whole reason the finer fact is persisted.
      outcome: "save",
      quality: 0.4893385191819542,
      isShotOnTarget: true,
      shotType: "normal",
      chanceType: "open_play",
      route: "direct",
      selectedCreatorPlayerId: playerId("player:away-000001"),
      shooterPlayerId: playerId("player:away-000001"),
      goalkeeperPlayerId: playerId("player:home-gk"),
    },
    {
      type: "shot_outcome",
      minute: 5,
      side: "home",
      outcome: "save",
      quality: 0.5917270209652412,
      isShotOnTarget: true,
      shotType: "normal",
      // This line moved earlier, when chance type stopped being inferred from
      // the minute and started naming the route the chance came down.
      chanceType: "counter",
      route: "transition",
      selectedCreatorPlayerId: playerId("player:home-000001"),
      shooterPlayerId: playerId("player:home-000001"),
      goalkeeperPlayerId: playerId("player:away-gk"),
    },
    {
      type: "half_time",
      minute: 6,
      score: {
        home: 0,
        away: 0,
      },
    },
    {
      type: "foul",
      minute: 8,
      side: "home",
      committedByPlayerId: playerId("player:home-000001"),
      sufferedByPlayerId: playerId("player:away-000001"),
      zoneDanger: 0.665,
    },
    {
      type: "yellow_card",
      minute: 8,
      side: "home",
      playerId: playerId("player:home-000001"),
    },
    {
      type: "foul",
      minute: 12,
      side: "home",
      committedByPlayerId: playerId("player:home-000001"),
      sufferedByPlayerId: playerId("player:away-000001"),
      zoneDanger: 0.232,
    },
    {
      type: "full_time",
      minute: 12,
      score: {
        home: 0,
        away: 0,
      },
    },
  ],
};

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
