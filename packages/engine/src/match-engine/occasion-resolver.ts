import type { Rng } from "@game/shared";

import type { OccasionContext } from "./occasion-context.ts";
import type { MatchSimulationState } from "./match-simulation-state.ts";

/**
 * Shot outcome emitted by the early aggregate opportunity resolver.
 */
export type OccasionOutcome = "goal" | "save" | "miss" | "block";

/**
 * Input passed to an opportunity resolver.
 *
 * Two values only. The occasion says what this chance is - the route it came
 * down, the four players on it, and how far each of them tilts the one question
 * he is asked - and the simulation supplies the team strengths and the
 * calibrated bands everything is measured against. A resolver never chooses an
 * actor, and nothing after it may change who was involved.
 */
export interface ResolveOccasionInput {
  /** Match state before the current opportunity is applied. */
  readonly simulation: MatchSimulationState;
  /** Complete pre-resolution description of the chance being resolved. */
  readonly occasion: OccasionContext;
}

/**
 * Result of resolving one opportunity.
 */
export interface OccasionResolution {
  /** Final aggregate outcome. */
  readonly outcome: OccasionOutcome;
  /** Normalized quality in the `[0, 1]` range. */
  readonly quality: number;
  /** Whether the outcome counts as a shot on target. */
  readonly isShotOnTarget: boolean;
  /** Calibrated conversion probability accumulated as xG exactly once. */
  readonly expectedGoals: number;
  /** Whether this concrete non-goal shot outcome awards a corner. */
  readonly resultsInCorner: boolean;
}

/**
 * Swappable interface for opportunity resolution.
 *
 * Step 1.1 uses an aggregate implementation. A later duel resolver can satisfy
 * the same interface without rewriting the minute loop.
 */
export interface OccasionResolver {
  /**
   * Resolves one generated opportunity using the caller-provided RNG stream.
   */
  resolveOccasion(input: ResolveOccasionInput, rng: Rng): OccasionResolution;
}
