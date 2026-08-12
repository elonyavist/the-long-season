import {
  type MatchContext,
} from "./match-context.ts";
import {
  buildManualTacticChangeSchedule,
  type ManualTacticChange,
  type ManualTacticChangeSchedule,
} from "./manual-tactic-change.ts";
import type { MatchSimulationState } from "./match-simulation-state.ts";
import { runMatchSimulation } from "./match-simulation-runner.ts";
import type { OccasionResolver } from "./occasion-resolver.ts";
import type { MatchLateralFocusBySide } from "./step-match.ts";
import { simulateMatch, type SimulateMatchResult } from "./simulate-match.ts";

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
  /** Whether to include deterministic explanation trace data in the result. */
  readonly includeExplanationTrace?: boolean;
  /** Match-local lateral instructions shared with the canonical minute loop. */
  readonly lateralFocusBySide?: MatchLateralFocusBySide;
}

/**
 * Runs one deterministic match while applying caller-declared tactic changes.
 *
 * This is not a live match session. All changes are supplied before execution,
 * and the engine only applies them at their declared minute. With no changes,
 * this function delegates to `simulateMatch` so default behavior stays exactly
 * aligned with the existing batch path.
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
      ...(options.includeExplanationTrace === undefined ? {} : { includeExplanationTrace: options.includeExplanationTrace }),
      ...(options.lateralFocusBySide === undefined ? {} : { lateralFocusBySide: options.lateralFocusBySide }),
    });
  }

  const schedule = buildManualTacticChangeSchedule({
    minuteCount: context.engineConfig.minuteCount,
    changes: options.manualTacticChanges,
  });
  return runMatchSimulation({
    context,
    ...(options.occasionResolver === undefined ? {} : { occasionResolver: options.occasionResolver }),
    ...(options.maxStepCount === undefined ? {} : { maxStepCount: options.maxStepCount }),
    ...(options.includeExplanationTrace === undefined ? {} : { includeExplanationTrace: options.includeExplanationTrace }),
    ...(options.lateralFocusBySide === undefined ? {} : { lateralFocusBySide: options.lateralFocusBySide }),
    beforeStep: (simulation, currentMinute) => ({
      ...simulation,
      context: applyScheduledManualTacticChanges(simulation.context, schedule, currentMinute),
    }),
  });
}

/**
 * Applies all manual changes that become active at a given minute.
 */
function applyScheduledManualTacticChanges(
  context: MatchSimulationState["context"],
  schedule: ManualTacticChangeSchedule,
  minute: number,
): MatchSimulationState["context"] {
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
