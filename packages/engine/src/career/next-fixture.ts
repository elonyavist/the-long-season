import type { CareerState, Fixture, FixtureId } from "@game/domain";

/** Machine-readable invalid-state reasons for next-fixture selection. */
export type NextCareerFixtureInvalidReason =
  | "selected_club_not_found"
  | "selected_club_not_ordered"
  | "fixture_missing"
  | "fixture_home_club_not_found"
  | "fixture_away_club_not_found";

/** Result returned when the selected club has a playable next fixture. */
export interface NextCareerFixtureFound {
  /** Discriminator for callers that need to branch without exceptions. */
  readonly status: "found";
  /** Stable fixture ID selected from `gameState.fixtureIds`. */
  readonly fixtureId: FixtureId;
  /** Scheduled, unplayed fixture involving the selected club. */
  readonly fixture: Fixture;
}

/** Result returned when the selected club has no remaining unplayed fixture. */
export interface NextCareerFixtureNone {
  /** Discriminator for the completed/no-fixture branch. */
  readonly status: "none";
}

/** Result returned when saved state is internally inconsistent. */
export interface NextCareerFixtureInvalid {
  /** Discriminator for validation failures. */
  readonly status: "invalid";
  /** Stable invalid-state reason. */
  readonly reason: NextCareerFixtureInvalidReason;
  /** Fixture ID related to the failure when the problem is fixture-specific. */
  readonly fixtureId?: FixtureId;
}

/** Pure next-fixture lookup result for the selected career club. */
export type NextCareerFixtureResult =
  | NextCareerFixtureFound
  | NextCareerFixtureInvalid
  | NextCareerFixtureNone;

/**
 * Finds the next unplayed fixture involving the selected career club.
 *
 * The function is intentionally read-only: it does not simulate the fixture,
 * advance dates, mutate the game state, or persist anything. It uses
 * `gameState.fixtureIds` as the only traversal order, because fixture lookup
 * object keys are not a deterministic scheduling contract.
 */
export function findNextCareerFixture(careerState: CareerState): NextCareerFixtureResult {
  if (careerState.gameState.clubs[careerState.selectedClubId] === undefined) {
    return { status: "invalid", reason: "selected_club_not_found" };
  }

  if (!containsSelectedClubInOrder(careerState)) {
    return { status: "invalid", reason: "selected_club_not_ordered" };
  }

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined) {
      return { status: "invalid", reason: "fixture_missing", fixtureId };
    }

    if (careerState.gameState.clubs[fixture.homeClubId] === undefined) {
      return { status: "invalid", reason: "fixture_home_club_not_found", fixtureId };
    }

    if (careerState.gameState.clubs[fixture.awayClubId] === undefined) {
      return { status: "invalid", reason: "fixture_away_club_not_found", fixtureId };
    }

    if (fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return {
        status: "found",
        fixtureId,
        fixture,
      };
    }
  }

  return { status: "none" };
}

function containsSelectedClubInOrder(careerState: CareerState): boolean {
  for (const clubId of careerState.gameState.clubIds) {
    if (clubId === careerState.selectedClubId) {
      return true;
    }
  }

  return false;
}
