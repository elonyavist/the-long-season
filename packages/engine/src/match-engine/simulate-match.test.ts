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

  assert.deepEqual(result, GOLDEN_MATCH_RESULT);
});

test("serializing two identical match outputs to JSON produces identical strings", () => {
  const first = JSON.stringify(simulateMatch(validContext()));
  const second = JSON.stringify(simulateMatch(validContext()));

  assert.equal(first, second);
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
      shotsOnTarget: 0,
      goals: 0,
    },
    away: {
      opportunities: 1,
      shots: 1,
      shotsOnTarget: 0,
      goals: 0,
    },
  },
  events: [
    {
      type: "kickoff",
      minute: 0,
    },
    {
      type: "shot_outcome",
      minute: 3,
      side: "away",
      outcome: "miss",
      quality: 0.5105017347726971,
      isShotOnTarget: false,
      shotType: "normal",
      chanceType: "open_play",
    },
    {
      type: "shot_outcome",
      minute: 5,
      side: "home",
      outcome: "miss",
      quality: 0.5862922383565455,
      isShotOnTarget: false,
      shotType: "normal",
      chanceType: "open_play",
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
      type: "full_time",
      minute: 12,
      score: {
        home: 0,
        away: 0,
      },
    },
  ],
};
