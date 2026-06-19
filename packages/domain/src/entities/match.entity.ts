import type { FixtureId } from "../types/ids.ts";
import type { MatchEvent } from "./match-event.entity.ts";

/**
 * Current persisted match-event schema version.
 */
export const MATCH_EVENT_SCHEMA_VERSION = 5;

/**
 * Score for one completed or in-progress match.
 */
export interface MatchScore {
  /** Goals scored by the home team. */
  readonly home: number;
  /** Goals scored by the away team. */
  readonly away: number;
}

/**
 * Minimal statistics for one side of a match.
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
 * Minimal match statistics persisted in a report.
 */
export interface MatchStats {
  /** Home-side statistics. */
  readonly home: MatchSideStats;
  /** Away-side statistics. */
  readonly away: MatchSideStats;
}

/**
 * Durable serializable match report.
 *
 * `MatchReport` is rich enough for narration and later fixture application, but
 * it is not the source of truth for league tables until a later fixture step
 * applies its score to fixture state.
 */
export interface MatchReport {
  /** Schema version for all events inside this report. */
  readonly eventSchemaVersion: typeof MATCH_EVENT_SCHEMA_VERSION;
  /** Fixture that produced this report. */
  readonly fixtureId: FixtureId;
  /** Final simulated minute. */
  readonly finalMinute: number;
  /** Final score. */
  readonly score: MatchScore;
  /** Final aggregate statistics. */
  readonly stats: MatchStats;
  /** Sparse language-agnostic events. */
  readonly events: readonly MatchEvent[];
}
