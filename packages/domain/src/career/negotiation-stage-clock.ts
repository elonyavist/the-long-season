import { gameDate, type GameDate } from "../value-objects/game-date.ts";

/**
 * Maximum length of one negotiation stage, in calendar game days.
 *
 * Both the club-to-club stage and the player-contract stage of a transfer are
 * bounded to at most three days. A counteroffer never extends this.
 */
export const NEGOTIATION_STAGE_MAX_DAYS = 3;

/** Machine-readable negotiation-stage-clock validation failures. */
export type NegotiationStageClockErrorCode =
  | "invalid_response_delay"
  | "closed_before_submission";

/** Typed error raised when a negotiation stage is built with impossible dates. */
export class NegotiationStageClockError extends Error {
  /** Stable failure key for adapters and tests. */
  public readonly code: NegotiationStageClockErrorCode;

  /** Creates one negotiation-stage-clock validation error. */
  public constructor(code: NegotiationStageClockErrorCode, message: string) {
    super(message);
    this.name = "NegotiationStageClockError";
    this.code = code;
  }
}

/**
 * Immutable timing facts for one negotiation stage.
 *
 * `deadline` is at most `NEGOTIATION_STAGE_MAX_DAYS` after `submittedOn`, and is
 * additionally capped at the window close instant when one is supplied, so an
 * unresolved stage cannot cross a closing window. `responseDueOn` is the
 * deterministic day the counterparty answers and never falls after `deadline`.
 */
export interface NegotiationStageClock {
  readonly submittedOn: GameDate;
  readonly responseDueOn: GameDate;
  readonly deadline: GameDate;
}

/** Input for building one negotiation-stage clock. */
export interface CreateNegotiationStageClockInput {
  readonly submittedOn: GameDate;
  /**
   * Deterministic answer delay in days, seeded by the caller. Clamped into
   * `0..NEGOTIATION_STAGE_MAX_DAYS` against the effective deadline.
   */
  readonly responseDelayDays: number;
  /** Window close instant that caps the deadline, when the stage is window-bound. */
  readonly windowClosesOn?: GameDate;
  /** Non-window hard stop, such as the last active day of an existing contract. */
  readonly mustResolveBy?: GameDate;
}

/**
 * Builds one validated negotiation-stage clock.
 *
 * @throws When the response delay is negative or the supplied window already
 * closed before submission.
 * @example
 * const clock = createNegotiationStageClock({ submittedOn, responseDelayDays: 2 });
 */
export function createNegotiationStageClock(
  input: CreateNegotiationStageClockInput,
): NegotiationStageClock {
  if (!Number.isInteger(input.responseDelayDays) || input.responseDelayDays < 0) {
    throw new NegotiationStageClockError(
      "invalid_response_delay",
      `Negotiation response delay must be a non-negative integer: ${input.responseDelayDays}`,
    );
  }
  if (
    (input.windowClosesOn !== undefined && input.windowClosesOn < input.submittedOn)
    || (input.mustResolveBy !== undefined && input.mustResolveBy < input.submittedOn)
  ) {
    throw new NegotiationStageClockError(
      "closed_before_submission",
      "A negotiation stage cannot start after its effective hard deadline.",
    );
  }

  const maxDeadline = gameDate(input.submittedOn + NEGOTIATION_STAGE_MAX_DAYS);
  const deadline = [input.windowClosesOn, input.mustResolveBy]
    .filter((date): date is GameDate => date !== undefined)
    .reduce((earliest, date) => date < earliest ? date : earliest, maxDeadline);
  const requestedResponse = gameDate(input.submittedOn + input.responseDelayDays);
  const responseDueOn = requestedResponse > deadline ? deadline : requestedResponse;

  return { submittedOn: input.submittedOn, responseDueOn, deadline };
}

/**
 * Re-times a stage after a counteroffer without resetting its deadline.
 *
 * A counter produces a new answer date but keeps the original stage deadline:
 * the stage clock never restarts. The new response date is clamped to the
 * unchanged deadline.
 */
export function counterResponseClock(
  clock: NegotiationStageClock,
  counterResponseDelayDays: number,
): NegotiationStageClock {
  if (!Number.isInteger(counterResponseDelayDays) || counterResponseDelayDays < 0) {
    throw new NegotiationStageClockError(
      "invalid_response_delay",
      `Counter response delay must be a non-negative integer: ${counterResponseDelayDays}`,
    );
  }
  const requestedResponse = gameDate(clock.submittedOn + counterResponseDelayDays);
  const responseDueOn = requestedResponse > clock.deadline ? clock.deadline : requestedResponse;
  return { submittedOn: clock.submittedOn, responseDueOn, deadline: clock.deadline };
}

/** Reports whether the counterparty answer is due on or before `asOf`. */
export function isNegotiationStageDue(clock: NegotiationStageClock, asOf: GameDate): boolean {
  return asOf >= clock.responseDueOn;
}

/** Reports whether the stage has passed its deadline without resolution. */
export function isNegotiationStageExpired(clock: NegotiationStageClock, asOf: GameDate): boolean {
  return asOf > clock.deadline;
}
