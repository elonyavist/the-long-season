import {
  gameDate,
  seasonTransferWindows,
  type CompetitionId,
  type SeasonId,
  type SeasonTransferWindows,
} from "@game/domain";
import { fromISO, toISO } from "@game/shared";

/**
 * Month/day boundary of one transfer window, resolved against a season year.
 *
 * These are content facts, not user settings. `month` is `1..12` and `day` is a
 * valid day for that month. The catalog stays deterministic: the same template
 * plus the same season year always resolves to the same absolute dates.
 */
export interface TransferWindowBoundaryTemplate {
  readonly month: number;
  readonly day: number;
}

/**
 * One competition's two-window month/day template.
 *
 * The summer window opens and closes in the season's starting calendar year;
 * the winter window opens and closes in the following calendar year. This
 * matches a European season that spans two years.
 */
export interface TransferWindowTemplate {
  readonly summerOpens: TransferWindowBoundaryTemplate;
  readonly summerCloses: TransferWindowBoundaryTemplate;
  readonly winterOpens: TransferWindowBoundaryTemplate;
  readonly winterCloses: TransferWindowBoundaryTemplate;
  /** Source citation recorded in `docs/audits/TRANSFER_WINDOW_SOURCE_AUDIT.md`. */
  readonly sourceKey: string;
}

/**
 * Source-backed transfer-window templates for competitions the game can play.
 *
 * Only the current playable Italian professional third-tier demo competition
 * exists here. Adding another playable competition later requires its own cited
 * row; the game ships no speculative rows for leagues it cannot start.
 *
 * FIGC 2026/27 professional registration periods: summer `2026-07-01..2026-09-01`,
 * winter `2027-01-02..2027-02-01`, both inclusive.
 */
const TRANSFER_WINDOW_TEMPLATES: Readonly<Record<string, TransferWindowTemplate>> = {
  "competition:demo-third-division": {
    summerOpens: { month: 7, day: 1 },
    summerCloses: { month: 9, day: 1 },
    winterOpens: { month: 1, day: 2 },
    winterCloses: { month: 2, day: 1 },
    sourceKey: "figc-2026-27-professional",
  },
};

/** Returns the window template for a playable competition, or `undefined`. */
export function transferWindowTemplateFor(
  competitionId: CompetitionId,
): TransferWindowTemplate | undefined {
  return TRANSFER_WINDOW_TEMPLATES[competitionId as unknown as string];
}

/** Input for resolving one competition season's absolute transfer windows. */
export interface ResolveSeasonTransferWindowsInput {
  readonly competitionId: CompetitionId;
  readonly seasonId: SeasonId;
  /** Calendar year in which the season starts (summer window year). */
  readonly seasonStartYear: number;
}

/**
 * Resolves one competition season's two absolute transfer windows.
 *
 * Rolls the competition-owned month/day template forward to the requested
 * season year with no wall-clock access: the summer window uses
 * `seasonStartYear` and the winter window uses `seasonStartYear + 1`. The result
 * is validated by the domain constructor, so overlapping, reversed, or
 * mis-ordered content dates fail loudly.
 *
 * @throws When the competition has no playable window template.
 * @example
 * const windows = resolveSeasonTransferWindows({
 *   competitionId,
 *   seasonId,
 *   seasonStartYear: 2026,
 * });
 */
export function resolveSeasonTransferWindows(
  input: ResolveSeasonTransferWindowsInput,
): SeasonTransferWindows {
  const template = transferWindowTemplateFor(input.competitionId);
  if (template === undefined) {
    throw new Error(
      `No playable transfer-window template for competition: ${String(input.competitionId)}`,
    );
  }

  return seasonTransferWindows({
    competitionId: input.competitionId,
    seasonId: input.seasonId,
    windows: [
      {
        opensOn: gameDate(fromISO(boundaryIso(input.seasonStartYear, template.summerOpens))),
        closesOn: gameDate(fromISO(boundaryIso(input.seasonStartYear, template.summerCloses))),
      },
      {
        opensOn: gameDate(fromISO(boundaryIso(input.seasonStartYear + 1, template.winterOpens))),
        closesOn: gameDate(fromISO(boundaryIso(input.seasonStartYear + 1, template.winterCloses))),
      },
    ],
  });
}

/** Reads the starting calendar year of a season from its first fixture date. */
export function seasonStartYearFromDate(seasonStartDate: number): number {
  return Number(toISO(seasonStartDate).slice(0, 4));
}

/** Builds an ISO date from a resolved year and a content boundary template. */
function boundaryIso(year: number, boundary: TransferWindowBoundaryTemplate): string {
  const month = String(boundary.month).padStart(2, "0");
  const day = String(boundary.day).padStart(2, "0");
  return `${String(year).padStart(4, "0")}-${month}-${day}`;
}
