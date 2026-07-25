import type { CompetitionId, SeasonId } from "../types/ids.ts";
import type { GameDate } from "./game-date.ts";

/**
 * One inclusive transfer registration window.
 *
 * Both boundaries are inclusive game dates: a move is legal on `opensOn`,
 * on `closesOn`, and on every day in between. Comparisons always use canonical
 * `GameDate` epoch-day semantics.
 */
export interface TransferWindow {
  /** First day the window is open, inclusive. */
  readonly opensOn: GameDate;
  /** Last day the window is open, inclusive. */
  readonly closesOn: GameDate;
}

/**
 * One resolved season's exactly two transfer windows for one competition.
 *
 * The identity fields let engine consumers relate a resolved window set back to
 * the competition and season it belongs to without importing content. The
 * windows tuple is always ordered and non-overlapping (see `seasonTransferWindows`).
 */
export interface SeasonTransferWindows {
  readonly competitionId: CompetitionId;
  readonly seasonId: SeasonId;
  /** Exactly two ordered, non-overlapping inclusive windows. */
  readonly windows: readonly [TransferWindow, TransferWindow];
}

/** Machine-readable transfer-window validation failures. */
export type TransferWindowErrorCode =
  | "not_two_windows"
  | "reversed_window"
  | "unordered_windows"
  | "overlapping_windows";

/** Typed error raised when transfer-window content declares impossible dates. */
export class TransferWindowError extends Error {
  /** Stable failure key for adapters and tests. */
  public readonly code: TransferWindowErrorCode;

  /** Creates one transfer-window validation error. */
  public constructor(code: TransferWindowErrorCode, message: string) {
    super(message);
    this.name = "TransferWindowError";
    this.code = code;
  }
}

/** Input for building one validated resolved-season window set. */
export interface SeasonTransferWindowsInput {
  readonly competitionId: CompetitionId;
  readonly seasonId: SeasonId;
  /** Candidate windows; must be exactly two, ordered, and non-overlapping. */
  readonly windows: readonly TransferWindow[];
}

/**
 * Builds one validated `SeasonTransferWindows`.
 *
 * Rejects any competition that does not declare exactly two windows, a window
 * whose close precedes its open, windows given out of chronological order, or
 * windows that overlap or touch. Every supported competition has exactly two
 * registration windows per season.
 *
 * @example
 * const resolved = seasonTransferWindows({
 *   competitionId,
 *   seasonId,
 *   windows: [
 *     { opensOn: gameDate(fromISO("2026-07-01")), closesOn: gameDate(fromISO("2026-09-01")) },
 *     { opensOn: gameDate(fromISO("2027-01-02")), closesOn: gameDate(fromISO("2027-02-01")) },
 *   ],
 * });
 */
export function seasonTransferWindows(
  input: SeasonTransferWindowsInput,
): SeasonTransferWindows {
  if (input.windows.length !== 2) {
    throw new TransferWindowError(
      "not_two_windows",
      `A competition season must declare exactly two transfer windows: got ${input.windows.length}`,
    );
  }

  const [first, second] = input.windows as readonly [TransferWindow, TransferWindow];
  assertForwardWindow(first);
  assertForwardWindow(second);

  if (second.opensOn <= first.opensOn) {
    throw new TransferWindowError(
      "unordered_windows",
      "The second transfer window must open strictly after the first window opens.",
    );
  }
  // Inclusive boundaries: the first window must fully close before the second
  // opens, so a single day never legally belongs to two windows at once.
  if (second.opensOn <= first.closesOn) {
    throw new TransferWindowError(
      "overlapping_windows",
      "Transfer windows must not overlap or touch; the second must open after the first closes.",
    );
  }

  return {
    competitionId: input.competitionId,
    seasonId: input.seasonId,
    windows: [first, second],
  };
}

/** Current transfer-registration status resolved for one game date. */
export type TransferWindowStatus =
  | {
      readonly state: "open";
      /** The window that currently contains the queried date. */
      readonly window: TransferWindow;
    }
  | {
      readonly state: "closed";
      /**
       * Next opening date within this resolved season, if any window still lies
       * ahead. Absent once the season's final window has closed; a later season
       * must be resolved to find the next opening.
       */
      readonly nextOpensOn?: GameDate;
    };

/**
 * Resolves whether transfers are open on `date` for one resolved season.
 *
 * Both window boundaries are inclusive. When closed, the result exposes the
 * next opening date inside the same season when one still lies ahead.
 *
 * @example
 * const status = resolveTransferWindowStatus(resolved, gameDate(fromISO("2026-08-01")));
 * // { state: "open", window: { ... } }
 */
export function resolveTransferWindowStatus(
  windows: SeasonTransferWindows,
  date: GameDate,
): TransferWindowStatus {
  for (const window of windows.windows) {
    if (date >= window.opensOn && date <= window.closesOn) {
      return { state: "open", window };
    }
  }

  const nextWindow = windows.windows.find((window) => window.opensOn > date);
  return nextWindow === undefined
    ? { state: "closed" }
    : { state: "closed", nextOpensOn: nextWindow.opensOn };
}

/** Rejects a window whose inclusive close precedes its open. */
function assertForwardWindow(window: TransferWindow): void {
  if (window.closesOn < window.opensOn) {
    throw new TransferWindowError(
      "reversed_window",
      "A transfer window must not close before it opens.",
    );
  }
}
