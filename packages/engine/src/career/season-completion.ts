import type { CareerState, FixtureId, SeasonId } from "@game/domain";

/** Invalid-state reasons for current-season completion checks. */
export type CareerSeasonCompletionInvalidReason =
  | "fixture_missing"
  | "fixture_home_club_not_found"
  | "fixture_away_club_not_found"
  | "no_current_season_fixtures";

/** Result returned when every current-season fixture has a played result. */
export interface CareerSeasonComplete {
  /** Discriminator for callers that branch without exceptions. */
  readonly status: "complete";
  /** Season that was checked. */
  readonly seasonId: SeasonId;
  /** Number of fixtures belonging to the current season. */
  readonly fixtureCount: number;
  /** Number of played fixtures belonging to the current season. */
  readonly playedFixtureCount: number;
}

/** Result returned when at least one current-season fixture is still unplayed. */
export interface CareerSeasonIncomplete {
  /** Discriminator for the not-yet-complete branch. */
  readonly status: "incomplete";
  /** Season that was checked. */
  readonly seasonId: SeasonId;
  /** Number of fixtures belonging to the current season. */
  readonly fixtureCount: number;
  /** Number of played fixtures belonging to the current season. */
  readonly playedFixtureCount: number;
  /** First unplayed current-season fixture in deterministic fixture order. */
  readonly firstUnplayedFixtureId: FixtureId;
}

/** Result returned when the save cannot be checked safely. */
export interface CareerSeasonCompletionInvalid {
  /** Discriminator for validation failures. */
  readonly status: "invalid";
  /** Stable invalid-state reason. */
  readonly reason: CareerSeasonCompletionInvalidReason;
  /** Fixture ID related to the invalid state when available. */
  readonly fixtureId?: FixtureId;
  /** Season that was being checked. */
  readonly seasonId: SeasonId;
}

/** Pure current-season completion result. */
export type CareerSeasonCompletionResult =
  | CareerSeasonComplete
  | CareerSeasonCompletionInvalid
  | CareerSeasonIncomplete;

/**
 * Checks whether the current career season has no unplayed fixtures left.
 *
 * The function is read-only and deterministic. It does not simulate fixtures,
 * create a new season, archive history, or write storage. It uses
 * `gameState.fixtureIds` as the only traversal order because fixture lookup
 * object keys are not an ordering contract.
 */
export function assessCareerSeasonCompletion(careerState: CareerState): CareerSeasonCompletionResult {
  const seasonId = careerState.gameState.calendar.currentSeasonId;
  let fixtureCount = 0;
  let playedFixtureCount = 0;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined) {
      return invalidResult(seasonId, "fixture_missing", fixtureId);
    }

    if (careerState.gameState.clubs[fixture.homeClubId] === undefined) {
      return invalidResult(seasonId, "fixture_home_club_not_found", fixtureId);
    }

    if (careerState.gameState.clubs[fixture.awayClubId] === undefined) {
      return invalidResult(seasonId, "fixture_away_club_not_found", fixtureId);
    }

    if (fixture.seasonId !== seasonId) {
      continue;
    }

    fixtureCount += 1;

    if (fixture.result?.played === true) {
      playedFixtureCount += 1;
      continue;
    }

    return {
      status: "incomplete",
      seasonId,
      fixtureCount,
      playedFixtureCount,
      firstUnplayedFixtureId: fixtureId,
    };
  }

  if (fixtureCount === 0) {
    return {
      status: "invalid",
      reason: "no_current_season_fixtures",
      seasonId,
    };
  }

  return {
    status: "complete",
    seasonId,
    fixtureCount,
    playedFixtureCount,
  };
}

function invalidResult(
  seasonId: SeasonId,
  reason: Exclude<CareerSeasonCompletionInvalidReason, "no_current_season_fixtures">,
  fixtureId: FixtureId,
): CareerSeasonCompletionInvalid {
  return {
    status: "invalid",
    reason,
    fixtureId,
    seasonId,
  };
}
