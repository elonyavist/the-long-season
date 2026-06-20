import { deriveRng } from "@game/shared";

import {
  buildMatchRngKey,
  matchRngKeyParts,
  type MatchContext,
} from "./match-context.ts";
import {
  buildManualTacticChangeSchedule,
  type ManualTacticChange,
  type ManualTacticChangeSchedule,
} from "./manual-tactic-change.ts";
import { createInitialMatchSimulationState } from "./match-simulation-state.ts";
import type { OccasionResolver } from "./occasion-resolver.ts";
import { simulateMatch, SimulateMatchError, type SimulateMatchResult } from "./simulate-match.ts";
import { stepMatch, type MatchStepEvent } from "./step-match.ts";

/**
 * Options for simulating one fixture with explicit manual tactic changes.
 */
export interface SimulateMatchWithManualTacticsOptions {
  /** Caller-declared tactic changes, applied from their minute onward. */
  readonly manualTacticChanges?: readonly ManualTacticChange[];
  /** Optional resolver override for tests and future resolver swaps. */
  readonly occasionResolver?: OccasionResolver;
  /** Optional loop guard. Defaults to `minuteCount + 1`. */
  readonly maxStepCount?: number;
}

/**
 * Runs one deterministic match while applying caller-declared tactic changes.
 *
 * This is not a live match session. All changes are supplied before execution,
 * and the engine only applies them at their declared minute. With no changes,
 * this function delegates to `simulateMatch` so default behavior stays exactly
 * compatible with the existing batch path.
 *
 * @example
 * const result = simulateMatchWithManualTactics(context, {
 *   manualTacticChanges: [{ side: "home", minute: 46, team: attackingTeam }],
 * });
 */
export function simulateMatchWithManualTactics(
  context: MatchContext,
  options: SimulateMatchWithManualTacticsOptions = {},
): SimulateMatchResult {
  if (options.manualTacticChanges === undefined || options.manualTacticChanges.length === 0) {
    return simulateMatch(context, {
      ...(options.occasionResolver === undefined ? {} : { occasionResolver: options.occasionResolver }),
      ...(options.maxStepCount === undefined ? {} : { maxStepCount: options.maxStepCount }),
    });
  }

  const schedule = buildManualTacticChangeSchedule({
    minuteCount: context.engineConfig.minuteCount,
    changes: options.manualTacticChanges,
  });
  const rngKey = buildMatchRngKey(context);
  const rng = deriveRng(rngKey.seed, rngKey.streamName, ...matchRngKeyParts(rngKey));
  const maxStepCount = options.maxStepCount ?? context.engineConfig.minuteCount + 1;

  if (!Number.isSafeInteger(maxStepCount) || maxStepCount <= 0) {
    throw new SimulateMatchError("invalid_max_step_count", `maxStepCount must be a positive safe integer: ${maxStepCount}`);
  }

  let simulation = createInitialMatchSimulationState(context);
  const events: MatchStepEvent[] = [];

  for (let stepCount = 0; stepCount < maxStepCount; stepCount += 1) {
    const currentMinute = simulation.minute + 1;
    simulation = {
      ...simulation,
      context: applyScheduledManualTacticChanges(simulation.context, schedule, currentMinute),
    };

    const stepResult =
      options.occasionResolver === undefined
        ? stepMatch({ simulation, rng })
        : stepMatch({
            simulation,
            rng,
            occasionResolver: options.occasionResolver,
          });

    simulation = stepResult.simulation;
    events.push(...stepResult.events);

    if (stepResult.isComplete) {
      return {
        fixtureId: context.fixtureId,
        finalMinute: simulation.minute,
        isComplete: true,
        score: simulation.score,
        stats: simulation.stats,
        events,
      };
    }
  }

  throw new SimulateMatchError(
    "step_limit_exceeded",
    `Match did not complete within ${maxStepCount} steps for fixture ${context.fixtureId}`,
  );
}

/**
 * Applies all manual changes that become active at a given minute.
 */
function applyScheduledManualTacticChanges(
  context: MatchContext,
  schedule: ManualTacticChangeSchedule,
  minute: number,
): MatchContext {
  let home = context.home;
  let away = context.away;

  for (const change of schedule.changes) {
    if (change.minute !== minute) {
      continue;
    }

    if (change.side === "home") {
      home = change.team;
    } else {
      away = change.team;
    }
  }

  if (home === context.home && away === context.away) {
    return context;
  }

  return {
    ...context,
    home,
    away,
  };
}
