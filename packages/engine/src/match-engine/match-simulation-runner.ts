import type { FixtureId } from "@game/domain";
import { deriveRng } from "@game/shared";

import { buildMatchRngKey, matchRngKeyParts, type MatchContext } from "./match-context.ts";
import { createMatchExplanationTrace, type MatchExplanationTrace } from "./match-explanation-trace.ts";
import type { MatchScore, MatchSimulationState, MatchSimulationStats } from "./match-simulation-state.ts";
import type { OccasionResolver } from "./occasion-resolver.ts";
import {
  createProgressiveMatchSession,
  ProgressiveMatchSessionError,
  runProgressiveMatchToMinute,
} from "./progressive-match-session.ts";
import type { MatchStepEvent } from "./step-match.ts";

/**
 * Completed aggregate match simulation output.
 *
 * This is engine-local batch output. Durable domain reports are created by
 * mapping this result through `createMatchReport`.
 */
export interface SimulateMatchResult {
  /** Fixture that was simulated. */
  readonly fixtureId: FixtureId;
  /** Final simulated minute. */
  readonly finalMinute: number;
  /** Whether the simulation reached the configured full-time minute. */
  readonly isComplete: boolean;
  /** Final score. */
  readonly score: MatchScore;
  /** Final aggregate stats. */
  readonly stats: MatchSimulationStats;
  /** Sparse step events emitted by the minute loop. */
  readonly events: readonly MatchStepEvent[];
  /** Optional data-only explanation trace, present only when explicitly requested. */
  readonly explanationTrace?: MatchExplanationTrace;
}

/**
 * Options shared by batch match simulation entrypoints.
 */
export interface SimulateMatchOptions {
  /** Optional resolver override for tests and future resolver swaps. */
  readonly occasionResolver?: OccasionResolver;
  /** Optional loop guard. Defaults to `minuteCount + 1`. */
  readonly maxStepCount?: number;
  /** Whether to include deterministic explanation trace data in the result. */
  readonly includeExplanationTrace?: boolean;
}

/** Error categories exposed by batch match simulation. */
export type SimulateMatchErrorCode = "invalid_max_step_count" | "step_limit_exceeded";

/**
 * Typed error thrown when batch match simulation cannot safely complete.
 */
export class SimulateMatchError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: SimulateMatchErrorCode;

  /**
   * Creates a simulate-match error.
   */
  public constructor(code: SimulateMatchErrorCode, message: string) {
    super(message);
    this.name = "SimulateMatchError";
    this.code = code;
  }
}

/**
 * Input for the shared full-match loop.
 */
export interface RunMatchSimulationInput extends SimulateMatchOptions {
  /** Initial match context. */
  readonly context: MatchContext;
  /** Optional deterministic context adjustment before each minute step. */
  readonly beforeStep?: MatchSimulationBeforeStep;
}

/**
 * Hook used by specialized callers to adjust state before one minute step.
 */
export type MatchSimulationBeforeStep = (simulation: MatchSimulationState, nextMinute: number) => MatchSimulationState;

/**
 * Runs the deterministic full-match loop used by all batch match entrypoints.
 */
export function runMatchSimulation(input: RunMatchSimulationInput): SimulateMatchResult {
  const rngKey = buildMatchRngKey(input.context);
  const rng = deriveRng(rngKey.seed, rngKey.streamName, ...matchRngKeyParts(rngKey));
  const maxStepCount = input.maxStepCount ?? input.context.engineConfig.minuteCount + 1;

  if (!Number.isSafeInteger(maxStepCount) || maxStepCount <= 0) {
    throw new SimulateMatchError("invalid_max_step_count", `maxStepCount must be a positive safe integer: ${maxStepCount}`);
  }

  let completed;
  try {
    completed = runProgressiveMatchToMinute(
      createProgressiveMatchSession(input.context),
      rng,
      input.context.engineConfig.minuteCount,
      {
        maxStepCount,
        ...(input.occasionResolver === undefined ? {} : { occasionResolver: input.occasionResolver }),
        ...(input.beforeStep === undefined ? {} : { beforeMinute: input.beforeStep }),
      },
    ).state;
  } catch (error) {
    if (error instanceof ProgressiveMatchSessionError && error.code === "step_limit_exceeded") {
      throw new SimulateMatchError(
        "step_limit_exceeded",
        `Match did not complete within ${maxStepCount} steps for fixture ${input.context.fixtureId}`,
      );
    }
    throw error;
  }

  const result: SimulateMatchResult = {
    fixtureId: input.context.fixtureId,
    finalMinute: completed.simulation.minute,
    isComplete: completed.phase === "full_time",
    score: completed.simulation.score,
    stats: completed.simulation.stats,
    events: completed.events,
  };

  if (input.includeExplanationTrace !== true) return result;
  return {
    ...result,
    explanationTrace: createMatchExplanationTrace({
      context: completed.simulation.context,
      score: completed.simulation.score,
      stats: completed.simulation.stats,
      events: completed.events,
    }),
  };
}
