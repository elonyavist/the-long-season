import assert from "node:assert/strict";
import { test } from "vitest";

import { abilityValue, clubId, playerId, stateValue, type Player, type PlayerDynamicState, type PlayerId } from "@game/domain";

import { createInitialStagedMatchState, progressStagedMatchToHalfTime, type MatchContext, type MatchEngineConfig, type MatchTeamContext } from "../match-engine/index.ts";
import { applyAiHalfTimeSubstitutions, selectAiHalfTimeSubstitutions } from "./ai-half-time-substitution.ts";

/** Tests for deterministic AI half-time substitutions. */

test("selectAiHalfTimeSubstitutions replaces a tired poor performer with a credible bench option", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(contextFixture()));
  const selection = selectAiHalfTimeSubstitutions({
    state: halfTime.state,
    side: "home",
    benchPlayerIds: [HOME_BENCH_STRONG],
    players: playerLookup(),
    playerStates: {
      [HOME_STARTER_TIRED]: stateFixture(66),
    } as Record<PlayerId, PlayerDynamicState>,
    provisionalRatings: [{ playerId: HOME_STARTER_TIRED, side: "home", goals: 0, assists: 0, chancesCreated: 0, shots: 0, shotsOnTarget: 0, saves: 0, blocks: 0, misses: 2, blockedShots: 0, rating: 5.4 }],
  });

  assert.deepEqual(selection.decisions, [{
    outgoingPlayerId: HOME_STARTER_TIRED,
    incomingPlayerId: HOME_BENCH_STRONG,
    reasonKey: "half_time_manager_decision",
  }]);
  assert.equal(selection.reasons[0]?.reasonKey, "fitness_protection");
});

test("applyAiHalfTimeSubstitutions updates the selected AI side state", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(contextFixture()));
  const applied = applyAiHalfTimeSubstitutions({
    state: halfTime.state,
    side: "home",
    benchPlayerIds: [HOME_BENCH_STRONG],
    players: playerLookup(),
    playerStates: {
      [HOME_STARTER_TIRED]: stateFixture(66),
    } as Record<PlayerId, PlayerDynamicState>,
    provisionalRatings: [{ playerId: HOME_STARTER_TIRED, side: "home", goals: 0, assists: 0, chancesCreated: 0, shots: 0, shotsOnTarget: 0, saves: 0, blocks: 0, misses: 2, blockedShots: 0, rating: 5.4 }],
  });

  assert.equal(applied.appliedSubstitutions.length, 1);
  assert.equal(applied.state.simulation.context.home.lineup.some((slot) => slot.playerId === HOME_BENCH_STRONG), true);
  assert.equal(applied.state.simulation.context.home.lineup.some((slot) => slot.playerId === HOME_STARTER_TIRED), false);
});

test("selectAiHalfTimeSubstitutions protects goalkeepers from cosmetic changes", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(contextFixture()));
  const selection = selectAiHalfTimeSubstitutions({
    state: halfTime.state,
    side: "home",
    benchPlayerIds: [HOME_BENCH_STRONG],
    players: playerLookup(),
    playerStates: {
      [HOME_GOALKEEPER]: stateFixture(55),
    } as Record<PlayerId, PlayerDynamicState>,
    provisionalRatings: [{ playerId: HOME_GOALKEEPER, side: "home", goals: 0, assists: 0, chancesCreated: 0, shots: 0, shotsOnTarget: 0, saves: 0, blocks: 0, misses: 0, blockedShots: 0, rating: 5.1 }],
  });

  assert.deepEqual(selection.decisions, []);
  assert.equal(selection.reasons[0]?.reasonKey, "goalkeeper_protected");
});

test("selectAiHalfTimeSubstitutions skips unavailable or weak bench options", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(contextFixture()));
  const selection = selectAiHalfTimeSubstitutions({
    state: halfTime.state,
    side: "home",
    benchPlayerIds: [HOME_BENCH_WEAK],
    players: playerLookup(),
    playerStates: {
      [HOME_STARTER_TIRED]: stateFixture(74),
    } as Record<PlayerId, PlayerDynamicState>,
    provisionalRatings: [{ playerId: HOME_STARTER_TIRED, side: "home", goals: 0, assists: 0, chancesCreated: 0, shots: 0, shotsOnTarget: 0, saves: 0, blocks: 0, misses: 2, blockedShots: 0, rating: 5.7 }],
  });

  assert.deepEqual(selection.decisions, []);
  assert.equal(selection.reasons[0]?.reasonKey, "no_bench_upgrade");
});

const HOME_GOALKEEPER = playerId("player:home-gk");
const HOME_STARTER_TIRED = playerId("player:home-tired");
const HOME_STARTER_OK = playerId("player:home-ok");
const HOME_BENCH_STRONG = playerId("player:home-bench-strong");
const HOME_BENCH_WEAK = playerId("player:home-bench-weak");
const AWAY_STARTER_ONE = playerId("player:away-one");
const AWAY_STARTER_TWO = playerId("player:away-two");

function contextFixture(): MatchContext {
  return {
    fixtureId: "fixture:ai-half-time-000001" as MatchContext["fixtureId"],
    seed: "phase75-ai-half-time",
    home: teamFixture("home", [HOME_GOALKEEPER, HOME_STARTER_TIRED, HOME_STARTER_OK]),
    away: teamFixture("away", [AWAY_STARTER_ONE, AWAY_STARTER_TWO]),
    engineConfig: configFixture(),
  };
}

function teamFixture(side: "home" | "away", playerIds: readonly PlayerId[]): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: playerIds.map((id, index) => ({
      slotId: `slot:${side}:${index}`,
      playerId: id,
      roleKey: index === 0 ? "gk" : "attacker",
    })),
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 },
  };
}

function playerLookup(): Record<PlayerId, Player> {
  return Object.fromEntries([
    playerFixture(HOME_GOALKEEPER, "goalkeeper", 10),
    playerFixture(HOME_STARTER_TIRED, "striker", 8),
    playerFixture(HOME_STARTER_OK, "striker", 10),
    playerFixture(HOME_BENCH_STRONG, "striker", 12),
    playerFixture(HOME_BENCH_WEAK, "striker", 7),
    playerFixture(AWAY_STARTER_ONE, "striker", 10),
    playerFixture(AWAY_STARTER_TWO, "striker", 10),
  ].map((player) => [player.id, player]));
}

function playerFixture(id: PlayerId, role: NonNullable<Player["primaryRole"]>, value: number): Player {
  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: 10_000 as Player["birthDate"],
    naturalPositions: role === "goalkeeper" ? ["gk"] : ["st"],
    primaryRole: role,
    naturalRoles: [role],
    adaptedRoles: [],
    weakRoles: [],
    roleFamiliarity: { [role]: "natural" },
    abilities: abilitiesFixture(value),
    potential: abilitiesFixture(value),
  };
}

function abilitiesFixture(value: number): Player["abilities"] {
  const ability = abilityValue(value);
  return {
    technical: { finishing: ability, passing: ability, longPassing: ability, crossing: ability, dribbling: ability, technique: ability, tackling: ability, penalties: ability, freeKicks: ability },
    physical: { pace: ability, strength: ability, stamina: ability, agility: ability, heading: ability },
    mental: { positioning: ability, vision: ability, anticipation: ability, composure: ability, determination: ability, leadership: ability },
    goalkeeping: { reflexes: ability, handling: ability, rushingOut: ability, goalkeeperPositioning: ability, footwork: ability },
  };
}

function stateFixture(fitness: number): PlayerDynamicState {
  return {
    fitness: stateValue(fitness),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

function configFixture(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.1, maxOpportunityRatePerMinute: 0.4 },
    conversionBands: [{ bandKey: "open", minQualityInclusive: 0, maxQualityExclusive: 1.01, goalProbability: 0.1 }],
    homeAdvantageFactor: 1,
    tacticalDistributionCaps: {
      directness: { minInclusive: -1, maxInclusive: 1 },
      pressing: { minInclusive: -1, maxInclusive: 1 },
      width: { minInclusive: -1, maxInclusive: 1 },
      risk: { minInclusive: -1, maxInclusive: 1 },
    },
  };
}
