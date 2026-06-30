import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerId, type HalfTimeTacticalDecisionPlan, type PlayerId } from "@game/domain";

import {
  applyHalfTimeSubstitutions,
  createInitialStagedMatchState,
  progressStagedMatchToFullTime,
  progressStagedMatchToHalfTime,
  type MatchContext,
  type MatchEngineConfig,
  type MatchSide,
  type MatchTeamContext,
} from "../index.ts";

const HOME_STARTER_ONE = playerId("player:home-starter-one");
const HOME_STARTER_TWO = playerId("player:home-starter-two");
const HOME_BENCH_ONE = playerId("player:home-bench-one");
const HOME_BENCH_TWO = playerId("player:home-bench-two");
const AWAY_STARTER_ONE = playerId("player:away-starter-one");

test("valid half-time substitution changes the second-half selected-club context", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const applied = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE, HOME_BENCH_TWO],
    decisions: [
      {
        outgoingPlayerId: HOME_STARTER_ONE,
        incomingPlayerId: HOME_BENCH_ONE,
        reasonKey: "half_time_manager_decision",
      },
    ],
  });

  assert.equal(applied.status, "applied");

  if (applied.status !== "applied") {
    return;
  }

  assert.equal(applied.appliedSubstitutions.length, 1);
  assert.equal(applied.state.appliedSubstitutions.length, 1);
  assert.equal(lineupHas(applied.state.simulation.context.home, HOME_BENCH_ONE), true);
  assert.equal(lineupHas(applied.state.simulation.context.home, HOME_STARTER_ONE), false);

  const fullTime = progressStagedMatchToFullTime(applied.state);
  assert.equal(fullTime.snapshot.phase, "full_time");
  assert.equal(fullTime.snapshot.appliedSubstitutions.length, 1);
  assert.equal(lineupHas(fullTime.state.simulation.context.home, HOME_BENCH_ONE), true);
});

test("empty half-time decisions do not create hidden automatic selected-club changes", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const applied = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE, HOME_BENCH_TWO],
    decisions: [],
  });

  assert.equal(applied.status, "applied");

  if (applied.status !== "applied") {
    return;
  }

  assert.deepEqual(applied.state, halfTime.state);
  assert.deepEqual(applied.appliedSubstitutions, []);
});

test("valid half-time tactical plan becomes the selected-club second-half lineup", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const tacticalPlan: HalfTimeTacticalDecisionPlan = {
    baseFormationId: "4-4-2",
    currentShape: "4-3-3",
    requiredLineupSize: 2,
    lineupSlots: [
      { slotId: "slot:home:gk", playerId: HOME_STARTER_ONE, roleKey: "gk", positionKey: "gk" },
      { slotId: "slot:home:advanced-right", playerId: HOME_BENCH_ONE, roleKey: "right_winger" },
    ],
    benchSlots: [
      { slotId: "bench:one", playerId: HOME_STARTER_TWO },
      { slotId: "bench:two", playerId: HOME_BENCH_TWO },
    ],
    substitutions: [
      {
        outgoingPlayerId: HOME_STARTER_TWO,
        incomingPlayerId: HOME_BENCH_ONE,
        reasonKey: "half_time_manager_decision",
      },
    ],
  };

  const applied = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE, HOME_BENCH_TWO],
    decisions: [],
    tacticalPlan,
  });

  assert.equal(applied.status, "applied");

  if (applied.status !== "applied") {
    return;
  }

  assert.equal(applied.appliedSubstitutions.length, 1);
  assert.deepEqual(applied.tacticalPlan, tacticalPlan);
  assert.deepEqual(applied.state.halfTimeTacticalPlan, tacticalPlan);
  assert.deepEqual(applied.state.simulation.context.home.lineup, [
    { slotId: "slot:home:gk", playerId: HOME_STARTER_ONE, roleKey: "gk" },
    { slotId: "slot:home:advanced-right", playerId: HOME_BENCH_ONE, roleKey: "right_winger" },
  ]);
});

test("invalid half-time tactical plan returns structured validation facts", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const tacticalPlan: HalfTimeTacticalDecisionPlan = {
    baseFormationId: "4-4-2",
    currentShape: "4-4-2",
    requiredLineupSize: 2,
    lineupSlots: [
      { slotId: "slot:home:gk", playerId: HOME_STARTER_ONE, roleKey: "gk", positionKey: "gk" },
      { slotId: "slot:home:empty", playerId: null, roleKey: "striker" },
    ],
    benchSlots: [],
    substitutions: [],
  };

  const result = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE],
    decisions: [],
    tacticalPlan,
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" ? result.reason : undefined, "invalid_half_time_tactical_plan");
  assert.deepEqual(result.status === "invalid" ? result.tacticalPlanFacts : [], [
    {
      key: "missing_lineup_slot",
      slotId: "slot:home:empty",
    },
  ]);
});

test("rejects an outgoing player who is not on the selected-club pitch", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const result = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE],
    decisions: [
      {
        outgoingPlayerId: playerId("player:not-on-pitch"),
        incomingPlayerId: HOME_BENCH_ONE,
        reasonKey: "half_time_manager_decision",
      },
    ],
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" ? result.reason : undefined, "outgoing_not_on_pitch");
});

test("rejects an incoming player who is not on the selected-club bench", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const result = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE],
    decisions: [
      {
        outgoingPlayerId: HOME_STARTER_ONE,
        incomingPlayerId: HOME_BENCH_TWO,
        reasonKey: "half_time_manager_decision",
      },
    ],
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" ? result.reason : undefined, "incoming_not_on_bench");
});

test("rejects an incoming player already on the pitch", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const result = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_STARTER_TWO],
    decisions: [
      {
        outgoingPlayerId: HOME_STARTER_ONE,
        incomingPlayerId: HOME_STARTER_TWO,
        reasonKey: "half_time_manager_decision",
      },
    ],
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" ? result.reason : undefined, "incoming_already_on_pitch");
});

test("rejects duplicate incoming substitutions", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const result = applyHalfTimeSubstitutions({
    state: halfTime.state,
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE],
    decisions: [
      {
        outgoingPlayerId: HOME_STARTER_ONE,
        incomingPlayerId: HOME_BENCH_ONE,
        reasonKey: "half_time_manager_decision",
      },
      {
        outgoingPlayerId: HOME_STARTER_TWO,
        incomingPlayerId: HOME_BENCH_ONE,
        reasonKey: "half_time_manager_decision",
      },
    ],
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" ? result.reason : undefined, "duplicate_incoming_player");
});

test("rejects substitutions outside half-time", () => {
  const result = applyHalfTimeSubstitutions({
    state: createInitialStagedMatchState(validContext()),
    selectedSide: "home",
    benchPlayerIds: [HOME_BENCH_ONE],
    decisions: [
      {
        outgoingPlayerId: HOME_STARTER_ONE,
        incomingPlayerId: HOME_BENCH_ONE,
        reasonKey: "half_time_manager_decision",
      },
    ],
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.status === "invalid" ? result.reason : undefined, "not_half_time");
});

function lineupHas(team: MatchTeamContext, player: PlayerId): boolean {
  return team.lineup.some((slot) => slot.playerId === player);
}

function validContext(): MatchContext {
  return {
    fixtureId: "fixture:substitution-000001" as MatchContext["fixtureId"],
    seed: "demo-001",
    home: validTeam("home", 12, [HOME_STARTER_ONE, HOME_STARTER_TWO]),
    away: validTeam("away", 10, [AWAY_STARTER_ONE, playerId("player:away-starter-two")]),
    engineConfig: validConfig(90),
  };
}

function validTeam(side: MatchSide, strength: number, players: readonly PlayerId[]): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: players.map((id, index) => ({
      slotId: `slot:${side}:${index + 1}`,
      playerId: id,
      roleKey: index === 0 ? "gk" : "balanced",
    })),
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
