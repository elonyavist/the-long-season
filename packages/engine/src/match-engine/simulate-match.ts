import { deriveRng } from "@game/shared";
import type { FixtureId } from "@game/domain";

import { buildMatchRngKey, matchRngKeyParts, type MatchContext } from "./match-context.ts";
import { createInitialMatchSimulationState, type MatchScore, type MatchSimulationStats } from "./match-simulation-state.ts";
import type { OccasionResolver } from "./occasion-resolver.ts";
import { stepMatch, type MatchStepEvent } from "./step-match.ts";

/**
 * Completed aggregate match simulation output.
 *
 * This is still engine-local output, not the durable domain `MatchReport`
 * contract. The report contract is introduced by the next documented step.
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
}

/**
 * Options for batch match simulation.
 */
export interface SimulateMatchOptions {
  /** Optional resolver override for tests and future resolver swaps. */
  readonly occasionResolver?: OccasionResolver;
  /** Optional loop guard. Defaults to `minuteCount + 1`. */
  readonly maxStepCount?: number;
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
 * Runs a full deterministic batch match over the shared `stepMatch` loop.
 *
 * @example
 * const result = simulateMatch(context);
 */
export function simulateMatch(context: MatchContext, options: SimulateMatchOptions = {}): SimulateMatchResult {
  const rngKey = buildMatchRngKey(context);
  const rng = deriveRng(rngKey.seed, rngKey.streamName, ...matchRngKeyParts(rngKey));
  const maxStepCount = options.maxStepCount ?? context.engineConfig.minuteCount + 1;

  if (!Number.isSafeInteger(maxStepCount) || maxStepCount <= 0) {
    throw new SimulateMatchError("invalid_max_step_count", `maxStepCount must be a positive safe integer: ${maxStepCount}`);
  }

  let simulation = createInitialMatchSimulationState(context);
  const events: MatchStepEvent[] = [];

  for (let stepCount = 0; stepCount < maxStepCount; stepCount += 1) {
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
