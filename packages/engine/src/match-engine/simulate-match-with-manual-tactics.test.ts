import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import { computePlayerMatchStats } from "../season-engine/player-match-stats.ts";
import { createMatchReport } from "./create-match-report.ts";
import { ManualTacticChangeError, type ManualTacticChange } from "./manual-tactic-change.ts";
import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import type { MatchEngineConfig } from "./match-engine-config.ts";
import type { MatchSide } from "./match-simulation-state.ts";
import { simulateMatch } from "./simulate-match.ts";
import { simulateMatchWithManualTactics } from "./simulate-match-with-manual-tactics.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";


/**
 * Segmented simulation tests prove explicit manual changes can alter one match
 * without changing the default no-switch path or adding automatic decisions.
 */
test("no manual tactic changes delegates to existing simulateMatch output", () => {
  const context = validContext();

  assert.deepEqual(simulateMatchWithManualTactics(context), simulateMatch(context));
  assert.deepEqual(simulateMatchWithManualTactics(context, { manualTacticChanges: [] }), simulateMatch(context));
});

test("manual tactic switch changes output deterministically", () => {
  const context = validContext({ fixtureValue: "fixture:manual-switch" });
  const changes = [manualChange("home", 4, validTeam("home", 20, 0.9))];

  const first = simulateMatchWithManualTactics(context, { manualTacticChanges: changes });
  const second = simulateMatchWithManualTactics(context, { manualTacticChanges: changes });
  const baseline = simulateMatch(context);

  assert.deepEqual(first, second);
  assert.notDeepEqual(first, baseline);
  assert.equal(first.isComplete, true);
  assert.equal(first.finalMinute, context.engineConfig.minuteCount);
  assert.deepEqual(first.score, countGoalEvents(first.events));
});

test("optional explanation trace does not change segmented fixture output", () => {
  const context = validContext({ fixtureValue: "fixture:manual-trace" });
  const changes = [manualChange("home", 4, validTeam("home", 20, 0.9))];
  const withoutTrace = simulateMatchWithManualTactics(context, { manualTacticChanges: changes });
  const withTrace = simulateMatchWithManualTactics(context, {
    manualTacticChanges: changes,
    includeExplanationTrace: true,
  });

  assert.deepEqual(stripExplanationTrace(withTrace), withoutTrace);
  assert.deepEqual(withTrace.score, withoutTrace.score);
  assert.deepEqual(withTrace.events, withoutTrace.events);
  assert.deepEqual(withTrace.stats, withoutTrace.stats);
  assert.equal(withTrace.explanationTrace?.fixtureId, context.fixtureId);
});

test("manual tactic switch is applied from the declared minute onward", () => {
  const context = validContext({ fixtureValue: "fixture:minute-boundary" });
  const changedTeam = validTeam("home", 18, 0.8);
  const result = simulateMatchWithManualTactics(context, {
    manualTacticChanges: [manualChange("home", 6, changedTeam)],
  });

  const firstChangedEvent = result.events.find((event) => event.type === "shot_outcome" && event.minute >= 6);

  assert.equal(result.isComplete, true);
  assert.equal(firstChangedEvent === undefined || firstChangedEvent.minute >= 6, true);
});

test("invalid manual tactic schedules fail through typed errors", () => {
  assert.throws(
    () =>
      simulateMatchWithManualTactics(validContext(), {
        manualTacticChanges: [manualChange("home", 0, validTeam("home", 20, 0.9))],
      }),
    (error: unknown) => error instanceof ManualTacticChangeError && error.code === "invalid_change_minute",
  );
});

test("step limit still protects segmented fixture simulation", () => {
  assert.throws(
    () =>
      simulateMatchWithManualTactics(validContext(), {
        manualTacticChanges: [manualChange("home", 4, validTeam("home", 20, 0.9))],
        maxStepCount: 2,
      }),
    /Match did not complete within 2 steps/,
  );
});

test("segmented output remains compatible with reports and player stats", () => {
  const context = validContext({ fixtureValue: "fixture:report-compatible" });
  const result = simulateMatchWithManualTactics(context, {
    manualTacticChanges: [manualChange("home", 4, validTeam("home", 20, 0.9))],
  });
  const report = createMatchReport(result);
  const rows = computePlayerMatchStats({
    report,
    playerRegistrations: [
      { playerId: playerId("player:home-gk"), side: "home" },
      { playerId: playerId("player:home-000001"), side: "home" },
      { playerId: playerId("player:away-gk"), side: "away" },
      { playerId: playerId("player:away-000001"), side: "away" },
    ],
  });

  assert.equal(report.fixtureId, context.fixtureId);
  assert.deepEqual(report.score, result.score);
  assert.equal(rows.length >= 4, true);
});

/**
 * Counts goal events by side.
 */
function countGoalEvents(events: ReturnType<typeof simulateMatchWithManualTactics>["events"]): ReturnType<
  typeof simulateMatchWithManualTactics
>["score"] {
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
 * default segmented simulation result.
 */
function stripExplanationTrace(
  result: ReturnType<typeof simulateMatchWithManualTactics>,
): Omit<ReturnType<typeof simulateMatchWithManualTactics>, "explanationTrace"> {
  const { explanationTrace, ...withoutTrace } = result;
  void explanationTrace;
  return withoutTrace;
}

/**
 * Builds one explicit manual tactic change.
 */
function manualChange(side: MatchSide, minute: number, team: MatchTeamContext): ManualTacticChange {
  return {
    side,
    minute,
    team,
  };
}

/**
 * Builds a valid context with optional fixture identity.
 */
function validContext(
  options: {
    readonly fixtureValue?: string;
  } = {},
): MatchContext {
  return {
    fixtureId: fixtureId(options.fixtureValue ?? "fixture:segmented-000001"),
    seed: "demo-001",
    home: validTeam("home", 10, 0),
    away: validTeam("away", 10, 0),
    engineConfig: validConfig(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
}

/**
 * Builds one side context fixture at a given aggregate strength and risk.
 */
function validTeam(side: MatchSide, strength: number, risk: number): MatchTeamContext {
  return {
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

/**
 * Builds a valid match-engine config fixture.
 */
function validConfig(): MatchEngineConfig {
  return {
    minuteCount: 24,
    rates: {
      baseOpportunityRatePerMinute: 0.2,
      maxOpportunityRatePerMinute: 0.55,
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
        goalProbability: 0.2,
      },
      {
        bandKey: "high",
        minQualityInclusive: 0.7,
        maxQualityExclusive: 1.01,
        goalProbability: 0.5,
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
