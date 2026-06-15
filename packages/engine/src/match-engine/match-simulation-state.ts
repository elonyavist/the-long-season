import { assertValidMatchContext, type MatchContext } from "./match-context.ts";

/**
 * Side key used by match simulation state, events, and resolver inputs.
 */
export type MatchSide = "home" | "away";

/**
 * Score accumulated by the local match simulation state.
 */
export interface MatchScore {
  /** Goals scored by the home team. */
  readonly home: number;
  /** Goals scored by the away team. */
  readonly away: number;
}

/**
 * Minimal accumulated statistics for one side.
 */
export interface MatchSideStats {
  /** Generated opportunities, including blocked, missed, saved, and scored shots. */
  readonly opportunities: number;
  /** Total shot outcomes resolved from opportunities. */
  readonly shots: number;
  /** Goals plus saved shots. */
  readonly shotsOnTarget: number;
  /** Goals scored by this side. */
  readonly goals: number;
}

/**
 * Minimal accumulated match statistics.
 */
export interface MatchSimulationStats {
  /** Home-side statistics. */
  readonly home: MatchSideStats;
  /** Away-side statistics. */
  readonly away: MatchSideStats;
}

/**
 * Match-local flags needed to emit sparse marker events once.
 */
export interface MatchLocalState {
  /** Whether kickoff has already been emitted. */
  readonly hasKickedOff: boolean;
  /** Whether half time has already been emitted. */
  readonly hasReachedHalfTime: boolean;
  /** Whether full time has already been emitted. */
  readonly hasReachedFullTime: boolean;
}

/**
 * Serializable local state for a match in progress.
 *
 * This state belongs to the match hot loop only. It must not update or embed
 * mutable `GameState` references.
 *
 * @example
 * const simulation = createInitialMatchSimulationState(context);
 */
export interface MatchSimulationState {
  /** Serializable input contract for this match. */
  readonly context: MatchContext;
  /** Completed simulated minutes. A new match starts at `0`. */
  readonly minute: number;
  /** Current score. */
  readonly score: MatchScore;
  /** Accumulated minimal statistics. */
  readonly stats: MatchSimulationStats;
  /** Match-local marker flags. */
  readonly local: MatchLocalState;
}

/**
 * Creates a valid match-local state at minute zero.
 *
 * @example
 * const simulation = createInitialMatchSimulationState(context);
 */
export function createInitialMatchSimulationState(context: MatchContext): MatchSimulationState {
  assertValidMatchContext(context);

  return {
    context,
    minute: 0,
    score: {
      home: 0,
      away: 0,
    },
    stats: {
      home: createEmptySideStats(),
      away: createEmptySideStats(),
    },
    local: {
      hasKickedOff: false,
      hasReachedHalfTime: false,
      hasReachedFullTime: false,
    },
  };
}

/**
 * Reports whether a simulation state has reached the configured final minute.
 */
export function isMatchSimulationComplete(simulation: MatchSimulationState): boolean {
  return simulation.minute >= simulation.context.engineConfig.minuteCount;
}

/**
 * Creates zeroed side statistics.
 */
function createEmptySideStats(): MatchSideStats {
  return {
    opportunities: 0,
    shots: 0,
    shotsOnTarget: 0,
    goals: 0,
  };
}
