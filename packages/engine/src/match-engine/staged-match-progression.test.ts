import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, isInactiveFutureMatchPhase, playerId, type HalfTimeTacticalDecisionPlan } from "@game/domain";

import {
  applyHalfTimeSubstitutions,
  createInitialStagedMatchState,
  progressStagedMatchToFullTime,
  progressStagedMatchToHalfTime,
  progressStagedMatchToPhase,
  simulateMatch,
  StagedMatchProgressionError,
  type MatchContext,
  type MatchEngineConfig,
  type MatchSide,
  type MatchTeamContext,
} from "../index.ts";

test("same seed and setup produce deterministic half-time staged snapshots", () => {
  const first = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const second = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));

  assert.deepEqual(first.snapshot, second.snapshot);
  assert.deepEqual(first.state, second.state);
  assert.equal(first.snapshot.phase, "half_time");
  assert.equal(first.snapshot.currentMinute, 45);
});

test("progressing to half-time does not secretly simulate full time", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));

  assert.equal(halfTime.snapshot.fullTimeReport, undefined);
  assert.equal(halfTime.snapshot.playerRatings.length, 4);
  assert.deepEqual(halfTime.snapshot.appliedSubstitutions, []);
  assert.equal(halfTime.snapshot.events.some((event) => event.type === "full_time"), false);
  assert.equal(halfTime.snapshot.events.every((event) => event.minute <= 45), true);
  assert.equal(halfTime.state.simulation.local.hasReachedFullTime, false);
});

test("continuing from half-time reaches full time and matches batch simulation", () => {
  const context = validContext();
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(context));
  const fullTime = progressStagedMatchToFullTime(halfTime.state);
  const batch = simulateMatch(context);

  assert.equal(fullTime.snapshot.phase, "full_time");
  assert.equal(fullTime.snapshot.currentMinute, 90);
  assert.equal(fullTime.snapshot.fullTimeReport?.finalMinute, 90);
  assert.equal(fullTime.snapshot.playerRatings.length, 4);
  assert.deepEqual(fullTime.snapshot.score, batch.score);
  assert.deepEqual(fullTime.snapshot.stats, batch.stats);
  assert.deepEqual(fullTime.snapshot.events, batch.events);
});

test("same half-time state produces deterministic full-time continuation", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const first = progressStagedMatchToFullTime(halfTime.state);
  const second = progressStagedMatchToFullTime(halfTime.state);

  assert.deepEqual(first.snapshot, second.snapshot);
  assert.deepEqual(first.state, second.state);
});

test("staged progression preserves the selected-club half-time tactical plan", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const tacticalPlan: HalfTimeTacticalDecisionPlan = {
    baseFormationId: "4-4-2",
    currentShape: "4-3-3",
    requiredLineupSize: 2,
    lineupSlots: [
      { slotId: "slot:home:gk", playerId: playerId("player:home-gk"), roleKey: "gk", positionKey: "gk" },
      { slotId: "slot:home:field", playerId: playerId("player:home-000001"), roleKey: "right_winger" },
    ],
    benchSlots: [],
    substitutions: [],
  };
  const applied = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [],
    decisions: [],
    tacticalPlan,
  });

  assert.equal(applied.status, "applied");

  if (applied.status !== "applied") {
    return;
  }

  const fullTime = progressStagedMatchToFullTime(applied.state);

  assert.deepEqual(fullTime.state.halfTimeTacticalPlan, tacticalPlan);
  assert.deepEqual(fullTime.snapshot.halfTimeTacticalPlan, tacticalPlan);
});

test("inactive future phases exist only as data values", () => {
  assert.equal(isInactiveFutureMatchPhase("extra_time"), true);
  assert.equal(isInactiveFutureMatchPhase("penalties"), true);
  assert.equal(isInactiveFutureMatchPhase("full_time"), false);

  assert.throws(
    () => progressStagedMatchToPhase(createInitialStagedMatchState(validContext()), "extra_time" as never),
    (error: unknown) => error instanceof StagedMatchProgressionError && error.code === "inactive_future_phase",
  );
});

test("step limit prevents staged progression from silently completing", () => {
  assert.throws(
    () => progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()), { maxStepCount: 3 }),
    (error: unknown) => error instanceof StagedMatchProgressionError && error.code === "step_limit_exceeded",
  );
});

/**
 * Builds a valid context with a regulation-time fixture.
 */
function validContext(): MatchContext {
  return {
    fixtureId: fixtureId("fixture:staged-000001"),
    seed: "demo-001",
    home: validTeam("home", 12),
    away: validTeam("away", 10),
    engineConfig: validConfig(90),
  };
}

/**
 * Builds one side context fixture at a given aggregate strength.
 */
function validTeam(side: MatchSide, strength: number): MatchTeamContext {
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
        playerId: playerId(`player:${side}-000001`),
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
