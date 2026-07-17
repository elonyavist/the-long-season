import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import {
  completeStagedMatchCheckpoint,
  createStagedMatchCheckpoint,
  restoreStagedMatchCheckpoint,
} from "./active-match-checkpoint.ts";
import {
  createInitialStagedMatchState,
  progressStagedMatchToFullTime,
  progressStagedMatchToHalfTime,
} from "../match-engine/staged-match-progression.ts";
import type { MatchContext, MatchTeamContext } from "../match-engine/match-context.ts";
import type { MatchSide } from "../match-engine/match-simulation-state.ts";

test("serialized half-time checkpoint resumes to the uninterrupted full-time result", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const checkpoint = createStagedMatchCheckpoint({
    state: halfTime.state,
    selectedClubSide: "home",
    selectedClubBenchSlots: [],
  });
  const serialized = JSON.parse(JSON.stringify(checkpoint));
  const resumed = completeStagedMatchCheckpoint(serialized);
  const uninterrupted = progressStagedMatchToFullTime(halfTime.state);

  assert.deepEqual(resumed.snapshot.fullTimeReport, uninterrupted.snapshot.fullTimeReport);
  assert.deepEqual(resumed.snapshot.playerRatings, uninterrupted.snapshot.playerRatings);
  assert.deepEqual(resumed.state, uninterrupted.state);
});

test("restoring a checkpoint preserves selected-club match decisions without references", () => {
  const halfTime = progressStagedMatchToHalfTime(createInitialStagedMatchState(validContext()));
  const checkpoint = createStagedMatchCheckpoint({
    state: halfTime.state,
    selectedClubSide: "home",
    selectedClubBenchSlots: [{ slotId: "bench:1", playerId: null }],
  });
  const restored = restoreStagedMatchCheckpoint(checkpoint);

  assert.deepEqual(restored, halfTime.state);
  assert.notEqual(restored.initialContext, halfTime.state.initialContext);
});

function validContext(): MatchContext {
  return {
    fixtureId: fixtureId("fixture:checkpoint-000001"),
    seed: "checkpoint-seed",
    home: validTeam("home", 12),
    away: validTeam("away", 10),
    engineConfig: {
      minuteCount: 90,
      rates: { baseOpportunityRatePerMinute: 0.16, maxOpportunityRatePerMinute: 0.4 },
      conversionBands: [
        { bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 0.35, goalProbability: 0.05 },
        { bandKey: "high", minQualityInclusive: 0.35, maxQualityExclusive: 1.01, goalProbability: 0.2 },
      ],
      homeAdvantageFactor: 1.05,
      tacticalDistributionCaps: {
        directness: { minInclusive: -1, maxInclusive: 1 },
        pressing: { minInclusive: -1, maxInclusive: 1 },
        width: { minInclusive: -1, maxInclusive: 1 },
        risk: { minInclusive: -1, maxInclusive: 1 },
      },
    },
  };
}

function validTeam(side: MatchSide, strength: number): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [
      { slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), roleKey: "gk" },
      { slotId: `slot:${side}:field`, playerId: playerId(`player:${side}-field`), roleKey: "balanced" },
    ],
    strength: { attack: strength, midfield: strength, defense: strength, goalkeeper: strength, overall: strength },
    tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 },
  };
}
