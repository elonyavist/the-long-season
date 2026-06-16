import type { ClubId } from "../types/ids.ts";

/**
 * Competition point rules used to derive a league table.
 *
 * This is intentionally small for the first season-simulation slice. Future
 * competition-specific penalties can extend the rules through a documented
 * step when a domain penalty contract exists.
 */
export interface LeagueTableRules {
  /** Points awarded for a win. */
  readonly pointsForWin: number;
  /** Points awarded for a draw. */
  readonly pointsForDraw: number;
  /** Points awarded for a loss. */
  readonly pointsForLoss: number;
}

/**
 * One derived row in a league table.
 *
 * Rows are computed from played fixture results, never persisted as source of
 * truth. Consumers can display `position`, but future rules such as playoffs or
 * promotion zones must be layered on top in their own documented step.
 */
export interface LeagueTableRow {
  /** One-based table position after deterministic sorting. */
  readonly position: number;
  /** Club represented by this table row. */
  readonly clubId: ClubId;
  /** Played fixtures. */
  readonly played: number;
  /** Won fixtures. */
  readonly wins: number;
  /** Drawn fixtures. */
  readonly draws: number;
  /** Lost fixtures. */
  readonly losses: number;
  /** Goals scored. */
  readonly goalsFor: number;
  /** Goals conceded. */
  readonly goalsAgainst: number;
  /** Goals scored minus goals conceded. */
  readonly goalDifference: number;
  /** Competition points after applying the current step's simple point rules. */
  readonly points: number;
}
