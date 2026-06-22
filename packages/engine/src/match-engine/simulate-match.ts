import type { MatchContext } from "./match-context.ts";
import {
  runMatchSimulation,
  SimulateMatchError,
  type SimulateMatchErrorCode,
  type SimulateMatchOptions,
  type SimulateMatchResult,
} from "./match-simulation-runner.ts";

export {
  SimulateMatchError,
  type SimulateMatchErrorCode,
  type SimulateMatchOptions,
  type SimulateMatchResult,
} from "./match-simulation-runner.ts";

/**
 * Runs a full deterministic batch match over the shared `stepMatch` loop.
 *
 * @example
 * const result = simulateMatch(context);
 */
export function simulateMatch(context: MatchContext, options: SimulateMatchOptions = {}): SimulateMatchResult {
  return runMatchSimulation({ context, ...options });
}
