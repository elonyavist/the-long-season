import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";
import { deriveRng } from "@game/shared";

import { buildMatchRngKey, matchRngKeyParts, type MatchContext, type MatchTeamContext } from "./match-context.ts";
import type { MatchEngineConfig } from "./match-engine-config.ts";
import type { MatchSide } from "./match-simulation-state.ts";
import {
  advanceProgressiveMatchMinute,
  applyConfirmedProgressiveTeamChanges,
  createProgressiveMatchMinuteSnapshot,
  createProgressiveMatchSession,
  pauseProgressiveMatchSession,
  resumeProgressiveMatchSession,
  type ProgressiveMatchSessionState,
} from "./progressive-match-session.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";


test("paused minute snapshots contain completed facts only", () => {
  const context = validContext("fixture:progressive-pause");
  const rng = rngFor(context);
  let state = resumeProgressiveMatchSession(createProgressiveMatchSession(context));

  for (let minute = 1; minute <= 5; minute += 1) {
    state = advanceProgressiveMatchMinute(state, rng);
  }
  state = pauseProgressiveMatchSession(state);

  const snapshot = createProgressiveMatchMinuteSnapshot(state);
  assert.equal(snapshot.currentMinute, 5);
  assert.equal(snapshot.phase, "first_half");
  assert.equal(snapshot.runState, "paused");
  assert.equal(snapshot.pauseReason, "manual");
  assert.equal(snapshot.events.every((event) => event.minute <= 5), true);
  assert.equal(snapshot.events.some((event) => event.type === "full_time"), false);
});

test("unlimited manual pauses resume at the next minute boundary", () => {
  const context = validContext("fixture:progressive-repeated-pause");
  const rng = rngFor(context);
  let state = createProgressiveMatchSession(context);

  for (let minute = 1; minute <= 4; minute += 1) {
    state = resumeProgressiveMatchSession(state);
    state = advanceProgressiveMatchMinute(state, rng);
    state = pauseProgressiveMatchSession(state);
    assert.equal(state.simulation.minute, minute);
  }
});

test("a confirmed paused command preserves the prefix and applies from the next minute", () => {
  const context = validContext("fixture:progressive-command");
  const changedHome = validTeam("home", 18, 0.8, "player:home-substitute");
  const commandedRng = rngFor(context);
  const baselineRng = rngFor(context);
  let commanded = resumeProgressiveMatchSession(createProgressiveMatchSession(context));
  let baseline = resumeProgressiveMatchSession(createProgressiveMatchSession(context));

  for (let minute = 1; minute <= 5; minute += 1) {
    commanded = advanceProgressiveMatchMinute(commanded, commandedRng);
    baseline = advanceProgressiveMatchMinute(baseline, baselineRng);
  }
  assert.deepEqual(commanded.events, baseline.events);
  assert.deepEqual(commanded.simulation, baseline.simulation);

  commanded = pauseProgressiveMatchSession(commanded);
  commanded = applyConfirmedProgressiveTeamChanges(commanded, {
    side: "home",
    team: changedHome,
    availability: {
      bench: [{ slotId: "bench:home:1", playerId: playerId("player:home-000001"), status: "substituted_out" }],
      unavailable: [],
    },
    substitutions: [{
      side: "home",
      minute: 5,
      outgoingPlayerId: playerId("player:home-000001"),
      incomingPlayerId: playerId("player:home-substitute"),
      slotId: "slot:home:field",
      reasonKey: "manager_decision",
    }],
  });

  const paused = createProgressiveMatchMinuteSnapshot(commanded);
  assert.equal(paused.currentMinute, 5);
  assert.deepEqual(paused.events.slice(0, baseline.events.length), baseline.events);
  assert.deepEqual(paused.events.at(-1), {
    type: "substitution",
    minute: 5,
    side: "home",
    outgoingPlayerId: playerId("player:home-000001"),
    incomingPlayerId: playerId("player:home-substitute"),
    slotId: "slot:home:field",
    reasonKey: "manager_decision",
  });
  assert.equal(paused.home.team.lineup[1]?.playerId, playerId("player:home-substitute"));
  assert.equal(paused.home.bench[0]?.status, "substituted_out");
  assert.equal(paused.appliedSubstitutions.length, 1);

  commanded = resumeProgressiveMatchSession(commanded);
  commanded = advanceProgressiveMatchMinute(commanded, commandedRng);
  assert.equal(commanded.simulation.minute, 6);
  assert.equal(commanded.simulation.context.home.lineup[1]?.playerId, playerId("player:home-substitute"));
});

test("presentation cadence 1x, 2x, and 4x produces identical football facts", () => {
  const context = validContext("fixture:progressive-cadence");
  const one = runWithPresentationCadence(context, 1);
  const two = runWithPresentationCadence(context, 2);
  const four = runWithPresentationCadence(context, 4);

  assert.deepEqual(two, one);
  assert.deepEqual(four, one);
  assert.equal(one.phase, "full_time");
  assert.equal(one.simulation.minute, context.engineConfig.minuteCount);
});

/** Runs the same one-minute operation in presentation-sized groups. */
function runWithPresentationCadence(context: MatchContext, cadence: 1 | 2 | 4): ProgressiveMatchSessionState {
  const rng = rngFor(context);
  let state = createProgressiveMatchSession(context);

  while (state.phase !== "full_time") {
    if (state.runState === "paused") state = resumeProgressiveMatchSession(state);
    for (let visibleTick = 0; visibleTick < cadence && state.runState === "running"; visibleTick += 1) {
      state = advanceProgressiveMatchMinute(state, rng);
    }
  }

  return state;
}

/** Builds the deterministic RNG stream owned by one in-memory match runtime. */
function rngFor(context: MatchContext): ReturnType<typeof deriveRng> {
  const key = buildMatchRngKey(context);
  return deriveRng(key.seed, key.streamName, ...matchRngKeyParts(key));
}

/** Builds a compact valid deterministic match context for session tests. */
function validContext(fixtureValue: string): MatchContext {
  return {
    fixtureId: fixtureId(fixtureValue),
    seed: "phase-77-progressive",
    home: validTeam("home", 11, 0),
    away: validTeam("away", 10, 0),
    engineConfig: validConfig(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
}

/** Builds one side with an explicit goalkeeper and outfield slot. */
function validTeam(side: MatchSide, strength: number, risk: number, fieldPlayer?: string): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
      createLineupSlot({
        slotId: `slot:${side}:field`,
        playerId: playerId(fieldPlayer ?? `player:${side}-000001`),
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
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: {
      directness: risk,
      pressing: risk,
      width: risk,
      risk,
      mentality: "balanced",
    },
  };
}

/** Uses a short regulation match while retaining a real half-time boundary. */
function validConfig(): MatchEngineConfig {
  return {
    minuteCount: 24,
    rates: {
      baseOpportunityRatePerMinute: 0.2,
      maxOpportunityRatePerMinute: 0.55,
    },
    conversionBands: [
      { bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 0.35, goalProbability: 0.05 },
      { bandKey: "medium", minQualityInclusive: 0.35, maxQualityExclusive: 0.7, goalProbability: 0.2 },
      { bandKey: "high", minQualityInclusive: 0.7, maxQualityExclusive: 1.01, goalProbability: 0.5 },
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
