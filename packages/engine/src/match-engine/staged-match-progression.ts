import {
  isInactiveFutureMatchPhase,
  type MatchPhase,
  type MatchReport,
  type AppliedMatchSubstitution,
  type HalfTimeTacticalDecisionPlan,
  type RegulationMatchPhase,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { createMatchReport } from "./create-match-report.ts";
import { buildMatchRngKey, matchRngKeyParts, type MatchContext } from "./match-context.ts";
import { createInitialMatchSimulationState, type MatchScore, type MatchSimulationState, type MatchSimulationStats } from "./match-simulation-state.ts";
import type { OccasionResolver } from "./occasion-resolver.ts";
import { buildPlayerMatchRatings, playerRatingRegistrationsFromContext, type PlayerMatchRatingRow } from "./player-match-rating.ts";
import type { SimulateMatchResult } from "./simulate-match.ts";
import { stepMatch, type MatchStepEvent } from "./step-match.ts";

/** Active phase targets that the current staged match engine can complete. */
export type StagedMatchTargetPhase = Extract<RegulationMatchPhase, "half_time" | "full_time">;

/** Error categories exposed by staged match progression. */
export type StagedMatchProgressionErrorCode =
  | "inactive_future_phase"
  | "invalid_max_step_count"
  | "target_before_current_minute"
  | "step_limit_exceeded";

/**
 * Typed error thrown when staged progression cannot safely advance.
 */
export class StagedMatchProgressionError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: StagedMatchProgressionErrorCode;

  /**
   * Creates a staged match progression error.
   */
  public constructor(code: StagedMatchProgressionErrorCode, message: string) {
    super(message);
    this.name = "StagedMatchProgressionError";
    this.code = code;
  }
}

/**
 * Serializable state for a match that may stop at half-time and resume later.
 *
 * The state intentionally stores the initial context and current simulation
 * state, but not the mutable RNG stream. Resuming reconstructs the RNG cursor by
 * replaying the already-completed minutes from the original seed and fixture ID.
 */
export interface StagedMatchState {
  /** Immutable context used to start the match and replay the RNG cursor. */
  readonly initialContext: MatchContext;
  /** Current match-local simulation state. */
  readonly simulation: MatchSimulationState;
  /** Accumulated sparse step events emitted so far. */
  readonly events: readonly MatchStepEvent[];
  /** Current lifecycle phase for the stored simulation minute. */
  readonly phase: RegulationMatchPhase;
  /** Manager-declared substitutions already applied to the staged match. */
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  /** Selected-club tactical plan applied at half-time, when the manager changed it. */
  readonly halfTimeTacticalPlan?: HalfTimeTacticalDecisionPlan;
}

/**
 * Phase snapshot exposed to callers after one staged progression operation.
 */
export interface StagedMatchSnapshot {
  /** Current lifecycle phase. */
  readonly phase: RegulationMatchPhase;
  /** Completed simulated minute. */
  readonly currentMinute: number;
  /** Score at the snapshot minute. */
  readonly score: MatchScore;
  /** Accumulated aggregate match stats. */
  readonly stats: MatchSimulationStats;
  /** Accumulated sparse step events visible at this phase. */
  readonly events: readonly MatchStepEvent[];
  /** Event-derived player ratings visible at this phase. */
  readonly playerRatings: readonly PlayerMatchRatingRow[];
  /** Structured substitution facts already applied to the match. */
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  /** Selected-club tactical plan applied at half-time, when present. */
  readonly halfTimeTacticalPlan?: HalfTimeTacticalDecisionPlan;
  /** Full-time durable report, present only when the match is complete. */
  readonly fullTimeReport?: MatchReport;
}

/** Result returned after a staged progression operation. */
export interface StagedMatchProgressionResult {
  /** Serializable state to store until the next staged action. */
  readonly state: StagedMatchState;
  /** Readable snapshot of the same state for UI/read-model adapters. */
  readonly snapshot: StagedMatchSnapshot;
}

/** Options accepted by staged match progression. */
export interface StagedMatchProgressionOptions {
  /** Optional resolver override for tests and future resolver swaps. */
  readonly occasionResolver?: OccasionResolver;
  /** Optional loop guard for newly simulated minutes. */
  readonly maxStepCount?: number;
}

/**
 * Creates the pre-match staged state from prepared home/away match contexts.
 */
export function createInitialStagedMatchState(context: MatchContext): StagedMatchState {
  return {
    initialContext: context,
    simulation: createInitialMatchSimulationState(context),
    events: [],
    phase: "pre_match",
    appliedSubstitutions: [],
  };
}

/**
 * Advances a staged match to half-time without simulating full time.
 */
export function progressStagedMatchToHalfTime(
  state: StagedMatchState,
  options: StagedMatchProgressionOptions = {},
): StagedMatchProgressionResult {
  return progressStagedMatchToPhase(state, "half_time", options);
}

/**
 * Advances a staged match to full time and creates the durable final report.
 */
export function progressStagedMatchToFullTime(
  state: StagedMatchState,
  options: StagedMatchProgressionOptions = {},
): StagedMatchProgressionResult {
  return progressStagedMatchToPhase(state, "full_time", options);
}

/**
 * Advances a staged match to a supported regulation-time phase.
 *
 * This function deliberately rejects inactive future phases so extra time and
 * penalties can exist as data values without becoming fake gameplay.
 */
export function progressStagedMatchToPhase(
  state: StagedMatchState,
  targetPhase: StagedMatchTargetPhase,
  options: StagedMatchProgressionOptions = {},
): StagedMatchProgressionResult {
  assertActiveTargetPhase(targetPhase);

  const targetMinute = minuteForTargetPhase(state.initialContext, targetPhase);

  if (targetMinute < state.simulation.minute) {
    throw new StagedMatchProgressionError(
      "target_before_current_minute",
      `Cannot progress staged match from minute ${state.simulation.minute} back to ${targetMinute}`,
    );
  }

  const rng = replayRngToCurrentMinute(state, options);
  const next = runFromCurrentMinute(state, targetMinute, rng, options);
  const phase = phaseForMinute(next.simulation);
  const fullTimeReport = phase === "full_time" ? createMatchReport(toSimulationResult(next.simulation, next.events)) : undefined;
  const playerRatings = buildPlayerMatchRatings({
    events: next.events,
    playerRegistrations: playerRatingRegistrationsFromContext(next.simulation.context),
  });
  const nextState: StagedMatchState = {
    initialContext: state.initialContext,
    simulation: next.simulation,
    events: next.events,
    phase,
    appliedSubstitutions: state.appliedSubstitutions,
    ...(state.halfTimeTacticalPlan === undefined ? {} : { halfTimeTacticalPlan: state.halfTimeTacticalPlan }),
  };

  return {
    state: nextState,
    snapshot: {
      phase,
      currentMinute: next.simulation.minute,
      score: next.simulation.score,
      stats: next.simulation.stats,
      events: next.events,
      playerRatings,
      appliedSubstitutions: state.appliedSubstitutions,
      ...(state.halfTimeTacticalPlan === undefined ? {} : { halfTimeTacticalPlan: state.halfTimeTacticalPlan }),
      ...(fullTimeReport === undefined ? {} : { fullTimeReport }),
    },
  };
}

/**
 * Derives the active phase from the completed simulation minute.
 */
export function phaseForMinute(simulation: MatchSimulationState): RegulationMatchPhase {
  if (simulation.minute <= 0) {
    return "pre_match";
  }

  const halfTimeMinute = halfTimeMinuteFor(simulation.context);

  if (simulation.minute < halfTimeMinute) {
    return "first_half";
  }

  if (simulation.minute === halfTimeMinute && simulation.minute < simulation.context.engineConfig.minuteCount) {
    return "half_time";
  }

  if (simulation.minute < simulation.context.engineConfig.minuteCount) {
    return "second_half";
  }

  return "full_time";
}

function assertActiveTargetPhase(targetPhase: MatchPhase): asserts targetPhase is StagedMatchTargetPhase {
  if (isInactiveFutureMatchPhase(targetPhase)) {
    throw new StagedMatchProgressionError(
      "inactive_future_phase",
      `${targetPhase} is a future match phase and is not active for regulation league matches`,
    );
  }
}

function minuteForTargetPhase(context: MatchContext, targetPhase: StagedMatchTargetPhase): number {
  return targetPhase === "half_time" ? halfTimeMinuteFor(context) : context.engineConfig.minuteCount;
}

function halfTimeMinuteFor(context: MatchContext): number {
  return Math.floor(context.engineConfig.minuteCount / 2);
}

function replayRngToCurrentMinute(
  state: StagedMatchState,
  options: StagedMatchProgressionOptions,
): ReturnType<typeof deriveRng> {
  const rngKey = buildMatchRngKey(state.initialContext);
  const rng = deriveRng(rngKey.seed, rngKey.streamName, ...matchRngKeyParts(rngKey));
  let replay = createInitialMatchSimulationState(state.initialContext);

  while (replay.minute < state.simulation.minute) {
    const stepResult = options.occasionResolver === undefined
      ? stepMatch({ simulation: replay, rng })
      : stepMatch({ simulation: replay, rng, occasionResolver: options.occasionResolver });
    replay = stepResult.simulation;
  }

  return rng;
}

function runFromCurrentMinute(
  state: StagedMatchState,
  targetMinute: number,
  rng: ReturnType<typeof deriveRng>,
  options: StagedMatchProgressionOptions,
): Pick<StagedMatchState, "simulation" | "events"> {
  const maxStepCount = options.maxStepCount ?? targetMinute - state.simulation.minute + 1;

  if (!Number.isSafeInteger(maxStepCount) || maxStepCount <= 0) {
    throw new StagedMatchProgressionError("invalid_max_step_count", `maxStepCount must be a positive safe integer: ${maxStepCount}`);
  }

  let simulation = state.simulation;
  const events: MatchStepEvent[] = [...state.events];

  for (let stepCount = 0; simulation.minute < targetMinute && stepCount < maxStepCount; stepCount += 1) {
    const stepResult = options.occasionResolver === undefined
      ? stepMatch({ simulation, rng })
      : stepMatch({ simulation, rng, occasionResolver: options.occasionResolver });
    simulation = stepResult.simulation;
    events.push(...stepResult.events);
  }

  if (simulation.minute < targetMinute) {
    throw new StagedMatchProgressionError(
      "step_limit_exceeded",
      `Staged match did not reach minute ${targetMinute} within ${maxStepCount} steps`,
    );
  }

  return { simulation, events };
}

function toSimulationResult(simulation: MatchSimulationState, events: readonly MatchStepEvent[]): SimulateMatchResult {
  return {
    fixtureId: simulation.context.fixtureId,
    finalMinute: simulation.minute,
    isComplete: simulation.minute >= simulation.context.engineConfig.minuteCount,
    score: simulation.score,
    stats: simulation.stats,
    events,
  };
}
