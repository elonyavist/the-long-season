import type { Rng } from "@game/shared";

import type { MatchSimulationState, MatchSide } from "./match-simulation-state.ts";

/**
 * Shot outcome emitted by the early aggregate opportunity resolver.
 */
export type OccasionOutcome = "goal" | "save" | "miss" | "block";

/**
 * Input passed to an opportunity resolver.
 */
export interface ResolveOccasionInput {
  /** Match state before the current opportunity is applied. */
  readonly simulation: MatchSimulationState;
  /** Team that generated the opportunity. */
  readonly attackingSide: MatchSide;
  /** Team defending the opportunity. */
  readonly defendingSide: MatchSide;
  /** Simulated minute of the opportunity. */
  readonly minute: number;
  /**
   * Bounded capacity of the route this opportunity actually came down.
   *
   * A chance worked down a flank the attack owns is a better chance than the
   * same chance forced down one it does not, so the way through has to reach
   * the shot. Without it the route decides only whether a chance exists and
   * what type it is, and two equal-quality elevens produce chances of identical
   * quality whatever shape they take.
   */
  readonly routeCapacity: number;
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
