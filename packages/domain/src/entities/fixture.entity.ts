import type { ClubId, CompetitionId, FixtureId, SeasonId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { MatchReport } from "./match.entity.ts";

/**
 * Result applied to one played fixture.
 *
 * Tables and other competition summaries must read goals from this compact
 * value. The optional report can keep the richer match memory available without
 * making event history required for standings.
 *
 * @example
 * const result: FixtureResult = {
 *   played: true,
 *   homeGoals: 2,
 *   awayGoals: 1,
 * };
 */
export interface FixtureResult {
  /** Explicit completion flag so unplayed fixtures can omit the whole result. */
  readonly played: true;
  /** Goals scored by the home club. */
  readonly homeGoals: number;
  /** Goals scored by the away club. */
  readonly awayGoals: number;
  /** Optional rich match report reference for narration and audit views. */
  readonly report?: MatchReport;
}

/**
 * One scheduled match fixture.
 *
 * A fixture becomes authoritative for standings only after `result` is applied.
 * Before that point, the fixture is just a scheduled game.
 */
export interface Fixture {
  /** Stable namespaced fixture ID, for example `fixture:000001`. */
  readonly id: FixtureId;
  /** Competition this fixture belongs to. */
  readonly competitionId: CompetitionId;
  /** Season this fixture belongs to. */
  readonly seasonId: SeasonId;
  /** Sporting round number, independent from the global game clock. */
  readonly roundNumber: number;
  /** Scheduled in-world date. */
  readonly date: GameDate;
  /** Home club ID. */
  readonly homeClubId: ClubId;
  /** Away club ID. */
  readonly awayClubId: ClubId;
  /** Played result, absent while the fixture is still unplayed. */
  readonly result?: FixtureResult;
}

/**
 * One sporting round in a competition calendar.
 */
export interface Round {
  /** One-based sporting round number. */
  readonly roundNumber: number;
  /** Scheduled date shared by fixtures in this simple early calendar. */
  readonly date: GameDate;
  /** Explicit ordered fixture IDs in this round. */
  readonly fixtureIds: readonly FixtureId[];
}
