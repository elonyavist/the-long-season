import type { CareerPlayerStatisticsCoverage } from "@game/domain";

/** Statistics totals supplied by the canonical engine selector for one scope. */
export interface CareerPlayerStatisticsSummaryInput {
  /** Starts recorded by the participation source. */
  readonly starts: number;
  /** Substitute appearances recorded by the participation source. */
  readonly substituteAppearances: number;
  /** Starts plus substitute appearances, derived by the canonical selector. */
  readonly appearances: number;
  /** Minutes recorded by the participation source. */
  readonly minutes: number;
  /** Weighted average rating, absent when no rating sample exists. */
  readonly averageRating?: number;
  /** Goals recorded by the structured event source. */
  readonly goals: number;
  /** Assists recorded by the structured event source. */
  readonly assists: number;
  /** Goalkeeper saves recorded by the structured event source. */
  readonly saves: number;
  /** Coverage of appearances, minutes, and ratings. */
  readonly participationCoverage: CareerPlayerStatisticsCoverage;
  /** Coverage of goals, assists, and saves. */
  readonly eventCoverage: CareerPlayerStatisticsCoverage;
}

/** Current-season and cumulative facts supplied by the canonical engine selector. */
export interface CareerPlayerStatisticsInput {
  /** Stable current-season identifier used only as structured context. */
  readonly currentSeasonId: string;
  /** Totals for the active season. */
  readonly currentSeason: CareerPlayerStatisticsSummaryInput;
  /** Weighted totals across archived seasons and the active season. */
  readonly career: CareerPlayerStatisticsSummaryInput;
}

/**
 * Participation facts remain absent when their source is unavailable.
 *
 * Partial totals are still useful, but the coverage discriminator prevents a
 * renderer from presenting them as complete.
 */
export type CareerPlayerParticipationStatisticsView =
  | {
      readonly coverage: "unavailable";
    }
  | {
      readonly coverage: "complete" | "partial";
      readonly starts: number;
      readonly substituteAppearances: number;
      readonly appearances: number;
      readonly minutes: number;
      readonly averageRating?: number;
    };

/**
 * Structured event facts remain absent when their source is unavailable.
 *
 * Saves are projected only for a goalkeeper so outfield profiles do not show
 * an irrelevant goalkeeper statistic.
 */
export type CareerPlayerEventStatisticsView =
  | {
      readonly coverage: "unavailable";
    }
  | {
      readonly coverage: "complete" | "partial";
      readonly goals: number;
      readonly assists: number;
      readonly saves?: number;
    };

/** Stable statistics scopes rendered as two plainly labelled blocks. */
export type CareerPlayerStatisticsScope = "current_season" | "career";

/** One coverage-aware block in the player statistics tab. */
export interface CareerPlayerStatisticsScopeView {
  readonly scope: CareerPlayerStatisticsScope;
  readonly labelKey: string;
  readonly participation: CareerPlayerParticipationStatisticsView;
  readonly events: CareerPlayerEventStatisticsView;
}

/** Truthful current-season and whole-career statistics for one player. */
export interface CareerPlayerStatisticsView {
  readonly currentSeasonId: string;
  readonly currentSeason: CareerPlayerStatisticsScopeView;
  readonly career: CareerPlayerStatisticsScopeView;
}

/**
 * Builds display-safe statistics without converting unavailable sources to
 * zeroes or recalculating weighted career values in the presentation layer.
 */
export function buildCareerPlayerStatisticsView(
  input: CareerPlayerStatisticsInput,
  options: Readonly<{ isGoalkeeper: boolean }>,
): CareerPlayerStatisticsView {
  assertStatisticsInput(input);
  return {
    currentSeasonId: input.currentSeasonId,
    currentSeason: buildScopeView(
      "current_season",
      input.currentSeason,
      options.isGoalkeeper,
    ),
    career: buildScopeView("career", input.career, options.isGoalkeeper),
  };
}

/** Copies one scope while omitting every value backed by unavailable coverage. */
function buildScopeView(
  scope: CareerPlayerStatisticsScope,
  input: CareerPlayerStatisticsSummaryInput,
  isGoalkeeper: boolean,
): CareerPlayerStatisticsScopeView {
  return {
    scope,
    labelKey: `career.playerProfile.statistics.scope.${scope}`,
    participation: input.participationCoverage === "unavailable"
      ? { coverage: "unavailable" }
      : {
          coverage: input.participationCoverage,
          starts: input.starts,
          substituteAppearances: input.substituteAppearances,
          appearances: input.appearances,
          minutes: input.minutes,
          ...(input.averageRating === undefined
            ? {}
            : { averageRating: input.averageRating }),
        },
    events: input.eventCoverage === "unavailable"
      ? { coverage: "unavailable" }
      : {
          coverage: input.eventCoverage,
          goals: input.goals,
          assists: input.assists,
          ...(isGoalkeeper ? { saves: input.saves } : {}),
        },
  };
}

/** Rejects inconsistent selector facts before they reach a browser renderer. */
function assertStatisticsInput(input: CareerPlayerStatisticsInput): void {
  if (input.currentSeasonId.trim().length === 0) {
    throw new RangeError("Player statistics require a current season ID");
  }
  assertSummary(input.currentSeason, "current season");
  assertSummary(input.career, "career");
}

/** Validates counts and derived totals without inventing missing values. */
function assertSummary(input: CareerPlayerStatisticsSummaryInput, scope: string): void {
  const counts = [
    ["starts", input.starts],
    ["substitute appearances", input.substituteAppearances],
    ["appearances", input.appearances],
    ["minutes", input.minutes],
    ["goals", input.goals],
    ["assists", input.assists],
    ["saves", input.saves],
  ] as const;
  for (const [label, value] of counts) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError(`Invalid ${scope} ${label}: ${value}`);
    }
  }
  if (input.appearances !== input.starts + input.substituteAppearances) {
    throw new RangeError(`Invalid ${scope} appearances total: ${input.appearances}`);
  }
  if (
    input.averageRating !== undefined
    && (!Number.isFinite(input.averageRating)
      || input.averageRating < 1
      || input.averageRating > 10)
  ) {
    throw new RangeError(`Invalid ${scope} average rating: ${input.averageRating}`);
  }
}
