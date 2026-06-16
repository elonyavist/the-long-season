import type { ClubId, CompetitionId, FixtureId, SeasonId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";

/**
 * One scheduled match fixture.
 *
 * Result data is intentionally absent in the calendar step. A later fixture
 * application step adds the played result as the source of truth for tables.
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
