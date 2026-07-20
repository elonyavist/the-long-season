import type { PlayerId } from "@game/domain";

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
  /**
   * Live-only causal telemetry carried by the canonical minute state.
   *
   * Optionality is temporary for the Phase 77 legacy staged adapter. New
   * simulations always include it and Step 06 removes the old shape.
   */
  readonly telemetry?: MatchSimulationTelemetry;
}

/** Causal cumulative statistics owned by the live minute engine. */
export interface MatchCausalSideStats {
  /** Completed shot outcomes. */
  readonly shots: number;
  /** Goal and saved-shot outcomes. */
  readonly shotsOnTarget: number;
  /** Sum of the calibrated conversion probability for every shot. */
  readonly expectedGoals: number;
  /** Shot outcomes that produced a corner. */
  readonly corners: number;
  /** Fouls emitted by the disciplinary model. Zero until that model runs. */
  readonly fouls: number;
  /** Yellow cards emitted by the disciplinary model. */
  readonly yellowCards: number;
  /** Red cards emitted by the disciplinary model. */
  readonly redCards: number;
  /** Saves made by this side's goalkeeper. */
  readonly saves: number;
  /** Goals scored by this side. */
  readonly goals: number;
}

/** Raw cumulative control units used to derive possession shares. */
export interface MatchControlUnits {
  readonly home: number;
  readonly away: number;
}

/** Engine-owned facts needed by live and final match projections. */
export interface MatchSimulationTelemetry {
  readonly controlUnits: MatchControlUnits;
  readonly stats: {
    readonly home: MatchCausalSideStats;
    readonly away: MatchCausalSideStats;
  };
  /** Match-relative condition for every player who has entered the pitch. */
  readonly playerCondition: Readonly<Partial<Record<PlayerId, number>>>;
  /** Cards accumulated inside this match before a possible dismissal. */
  readonly yellowCardsByPlayer: Readonly<Partial<Record<PlayerId, number>>>;
  /** Injuries already emitted in this match and whether play continued. */
  readonly injuriesByPlayer: Readonly<Partial<Record<PlayerId, MatchPlayerInjuryState>>>;
}

/** Match-local injury state used by performance and aggravation policies. */
export interface MatchPlayerInjuryState {
  readonly severity: "knock" | "minor" | "moderate" | "serious";
  readonly continued: boolean;
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
      telemetry: createInitialTelemetry(context),
    },
    local: {
      hasKickedOff: false,
      hasReachedHalfTime: false,
      hasReachedFullTime: false,
    },
  };
}

/** Returns live telemetry, rebuilding only the legacy adapter's absent shape. */
export function telemetryFor(simulation: MatchSimulationState): MatchSimulationTelemetry {
  return simulation.stats.telemetry ?? createInitialTelemetry(simulation.context);
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

function createInitialTelemetry(context: MatchContext): MatchSimulationTelemetry {
  const playerCondition: Partial<Record<PlayerId, number>> = {};

  for (const team of [context.home, context.away]) {
    for (const slot of team.lineup) {
      const profile = team.incidentProfiles?.find((candidate) => candidate.playerId === slot.playerId);
      playerCondition[slot.playerId] = profile?.startingFitness ?? 100;
    }
  }

  return {
    controlUnits: { home: 0, away: 0 },
    stats: {
      home: createEmptyCausalSideStats(),
      away: createEmptyCausalSideStats(),
    },
    playerCondition,
    yellowCardsByPlayer: {},
    injuriesByPlayer: {},
  };
}

function createEmptyCausalSideStats(): MatchCausalSideStats {
  return {
    shots: 0,
    shotsOnTarget: 0,
    expectedGoals: 0,
    corners: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    goals: 0,
  };
}
