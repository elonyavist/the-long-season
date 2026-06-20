import type { MatchTeamContext } from "./match-context.ts";
import type { MatchSide } from "./match-simulation-state.ts";

/** Error categories exposed by manual tactic-change schedule validation. */
export type ManualTacticChangeErrorCode =
  | "invalid_minute_count"
  | "invalid_side"
  | "invalid_change_minute"
  | "missing_team_context"
  | "duplicate_side_minute";

/**
 * One explicit manager/caller tactic change during a match.
 *
 * The engine contract records caller intent only: at `minute`, replace the
 * selected side's active team context with `team`. It does not decide why the
 * change happens and does not inspect score, match events, or tactical needs.
 */
export interface ManualTacticChange {
  /** Match side whose active setup changes. */
  readonly side: MatchSide;
  /** First match minute where the new setup should apply. */
  readonly minute: number;
  /** Already-built team context to use from the change minute onward. */
  readonly team: MatchTeamContext;
}

/**
 * Input for building a deterministic manual tactic-change schedule.
 */
export interface BuildManualTacticChangeScheduleInput {
  /** Configured match length used to validate change minutes. */
  readonly minuteCount: number;
  /** Explicit changes requested by the caller or future match-session layer. */
  readonly changes: readonly ManualTacticChange[];
}

/**
 * Validated and deterministically ordered manual tactic-change schedule.
 */
export interface ManualTacticChangeSchedule {
  /** Configured match length used when this schedule was validated. */
  readonly minuteCount: number;
  /** Changes sorted by minute and side. */
  readonly changes: readonly ManualTacticChange[];
}

/**
 * Typed error thrown when a manual tactic-change schedule is invalid.
 */
export class ManualTacticChangeError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: ManualTacticChangeErrorCode;

  /** Creates a manual tactic-change validation error. */
  public constructor(code: ManualTacticChangeErrorCode, message: string) {
    super(message);
    this.name = "ManualTacticChangeError";
    this.code = code;
  }
}

/**
 * Builds a validated, deterministic manual tactic-change schedule.
 *
 * @example
 * const schedule = buildManualTacticChangeSchedule({
 *   minuteCount: 90,
 *   changes: [{ side: "home", minute: 46, team: attackingTeam }],
 * });
 */
export function buildManualTacticChangeSchedule(
  input: BuildManualTacticChangeScheduleInput,
): ManualTacticChangeSchedule {
  assertValidMinuteCount(input.minuteCount);

  const seenSideMinutes = new Set<string>();
  const changes = input.changes.map((change): ManualTacticChange => {
    assertValidSide(change.side);
    assertValidChangeMinute(change.minute, input.minuteCount);
    assertPresentTeamContext(change.team, change.side, change.minute);

    const key = sideMinuteKey(change.side, change.minute);

    if (seenSideMinutes.has(key)) {
      throw new ManualTacticChangeError(
        "duplicate_side_minute",
        `Duplicate manual tactic change for ${change.side} at minute ${change.minute}`,
      );
    }

    seenSideMinutes.add(key);

    return change;
  });

  return {
    minuteCount: input.minuteCount,
    changes: [...changes].sort(compareManualTacticChanges),
  };
}

/**
 * Reports whether a manual tactic-change schedule passes validation.
 */
export function isValidManualTacticChangeSchedule(input: BuildManualTacticChangeScheduleInput): boolean {
  try {
    buildManualTacticChangeSchedule(input);
    return true;
  } catch (error) {
    if (error instanceof ManualTacticChangeError) {
      return false;
    }

    throw error;
  }
}

/**
 * Sorts changes by application minute and then by explicit side order.
 */
function compareManualTacticChanges(left: ManualTacticChange, right: ManualTacticChange): number {
  const minuteComparison = left.minute - right.minute;

  if (minuteComparison !== 0) {
    return minuteComparison;
  }

  return sideSortValue(left.side) - sideSortValue(right.side);
}

/**
 * Converts a side into the deterministic schedule tie-breaker order.
 */
function sideSortValue(side: MatchSide): number {
  switch (side) {
    case "home":
      return 0;
    case "away":
      return 1;
  }
}

/**
 * Builds the duplicate-detection key for one side/minute pair.
 */
function sideMinuteKey(side: MatchSide, minute: number): string {
  return `${side}:${minute}`;
}

/**
 * Validates the configured match length.
 */
function assertValidMinuteCount(minuteCount: number): void {
  if (!Number.isSafeInteger(minuteCount) || minuteCount <= 0) {
    throw new ManualTacticChangeError(
      "invalid_minute_count",
      `minuteCount must be a positive safe integer: ${minuteCount}`,
    );
  }
}

/**
 * Validates the side key supplied by the caller.
 */
function assertValidSide(side: MatchSide): void {
  if (side !== "home" && side !== "away") {
    throw new ManualTacticChangeError("invalid_side", `Manual tactic change side must be home or away: ${side}`);
  }
}

/**
 * Validates one change minute against the match range.
 */
function assertValidChangeMinute(minute: number, minuteCount: number): void {
  if (!Number.isSafeInteger(minute) || minute < 1 || minute > minuteCount) {
    throw new ManualTacticChangeError(
      "invalid_change_minute",
      `Manual tactic change minute must be between 1 and ${minuteCount}: ${minute}`,
    );
  }
}

/**
 * Validates that a caller supplied the already-built team context.
 */
function assertPresentTeamContext(team: MatchTeamContext | undefined, side: MatchSide, minute: number): void {
  if (team === undefined) {
    throw new ManualTacticChangeError(
      "missing_team_context",
      `Manual tactic change for ${side} at minute ${minute} requires a team context`,
    );
  }
}
