import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "../types/ids.ts";
import {
  ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION,
  ActiveMatchCheckpointError,
  createActiveMatchCheckpoint,
  type ActiveMatchCheckpoint,
} from "./active-match-checkpoint.ts";

test("active match checkpoint survives a structured clone", () => {
  const checkpoint = createActiveMatchCheckpoint(validCheckpoint());

  assert.deepEqual(JSON.parse(JSON.stringify(checkpoint)), checkpoint);
  assert.notEqual(checkpoint.initialContext, validCheckpoint().initialContext);
});

test("active match checkpoint rejects completed or inconsistent state", () => {
  assert.throws(
    () => createActiveMatchCheckpoint({ ...validCheckpoint(), simulation: { ...validCheckpoint().simulation, minute: 46 } }),
    (error: unknown) => error instanceof ActiveMatchCheckpointError && error.code === "phase_minute_mismatch",
  );
  assert.throws(
    () => createActiveMatchCheckpoint({
      ...validCheckpoint(),
      simulation: { ...validCheckpoint().simulation, local: { ...validCheckpoint().simulation.local, hasReachedFullTime: true as false } },
    }),
    (error: unknown) => error instanceof ActiveMatchCheckpointError && error.code === "completed_match",
  );
});

/** Builds a minimal valid half-time checkpoint. */
function validCheckpoint(): ActiveMatchCheckpoint {
  const fixture = fixtureId("fixture:checkpoint-000001");
  const homePlayer = playerId("player:home-000001");
  const awayPlayer = playerId("player:away-000001");

  return {
    schemaVersion: ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION,
    fixtureId: fixture,
    selectedClubSide: "home",
    phase: "half_time",
    initialContext: {
      fixtureId: fixture,
      seed: "checkpoint-seed",
      home: team("home", homePlayer),
      away: team("away", awayPlayer),
      engineConfig: {
        minuteCount: 90,
        rates: { baseOpportunityRatePerMinute: 0.1, maxOpportunityRatePerMinute: 0.3 },
        conversionBands: [{ bandKey: "all", minQualityInclusive: 0, maxQualityExclusive: 1.01, goalProbability: 0.1 }],
        homeAdvantageFactor: 1.05,
        tacticalDistributionCaps: {
          directness: { minInclusive: -1, maxInclusive: 1 },
          pressing: { minInclusive: -1, maxInclusive: 1 },
          width: { minInclusive: -1, maxInclusive: 1 },
          risk: { minInclusive: -1, maxInclusive: 1 },
        },
      },
    },
    simulation: {
      minute: 45,
      score: { home: 0, away: 0 },
      stats: { home: sideStats(), away: sideStats() },
      local: { hasKickedOff: true, hasReachedHalfTime: true, hasReachedFullTime: false },
    },
    events: [{ type: "kickoff", minute: 0 }, { type: "half_time", minute: 45, score: { home: 0, away: 0 } }],
    selectedClubBenchSlots: [],
    appliedSubstitutions: [],
  };
}

function team(side: "home" | "away", assignedPlayerId: ReturnType<typeof playerId>) {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [{ slotId: `slot:${side}:1`, playerId: assignedPlayerId, roleKey: "balanced" }],
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0 },
  };
}

function sideStats() {
  return { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 };
}
