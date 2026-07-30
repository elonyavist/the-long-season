import {
  EMPTY_PLAYER_AVAILABILITY,
  competitionIdForClub,
  findCareerFixtureEligibilityBlockers,
  type CareerFixtureEligibilityBlocker,
  type CareerState,
  type CompetitionId,
  type Fixture,
  type FixtureId,
  type PlayerId,
} from "@game/domain";

/** Machine-readable invalid-state reasons for next-fixture selection. */
export type NextCareerFixtureInvalidReason =
  | "selected_club_not_found"
  | "selected_club_not_ordered"
  | "selected_club_competition_not_found"
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

  const selectedCompetitionId = careerState.gameState.domesticCompetitionWorld === undefined
    ? undefined
    : competitionIdForClub(
        careerState.gameState.domesticCompetitionWorld,
        careerState.selectedClubId,
      );
  if (
    careerState.gameState.domesticCompetitionWorld !== undefined
    && selectedCompetitionId === undefined
  ) {
    return { status: "invalid", reason: "selected_club_competition_not_found" };
  }

  for (const fixtureId of orderedCareerFixtureIds(careerState, selectedCompetitionId)) {
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

/**
 * Returns fixture IDs in canonical competition order and then fixture order.
 *
 * A single-competition state crosses the same filter/traversal path with no
 * competition filter; there is no second legacy selection implementation.
 */
export function orderedCareerFixtureIds(
  careerState: CareerState,
  onlyCompetitionId?: CompetitionId,
): readonly FixtureId[] {
  const missingFixtureId = careerState.gameState.fixtureIds.find(
    (fixtureId) => careerState.gameState.fixtures[fixtureId] === undefined,
  );
  if (missingFixtureId !== undefined) return [missingFixtureId];
  const world = careerState.gameState.domesticCompetitionWorld;
  const competitionOrder = world?.competitionIds
    ?? (onlyCompetitionId === undefined ? [] : [onlyCompetitionId]);
  if (competitionOrder.length === 0) {
    return careerState.gameState.fixtureIds.filter((fixtureId) => {
      const fixture = careerState.gameState.fixtures[fixtureId];
      return onlyCompetitionId === undefined || fixture?.competitionId === onlyCompetitionId;
    });
  }

  const ordered: FixtureId[] = [];
  for (const competitionId of competitionOrder) {
    if (onlyCompetitionId !== undefined && competitionId !== onlyCompetitionId) continue;
    for (const fixtureId of careerState.gameState.fixtureIds) {
      if (careerState.gameState.fixtures[fixtureId]?.competitionId === competitionId) {
        ordered.push(fixtureId);
      }
    }
  }
  return ordered;
}

/**
 * Reports which explicitly selected players cannot enter the next fixture.
 *
 * The projection never changes or reconciles the manager's durable plan. An
 * unresolved next fixture returns no blockers and leaves lookup errors to the
 * normal next-fixture result.
 */
export function findNextFixtureEligibilityBlockers(
  careerState: CareerState,
  selectedPlayerIds: readonly PlayerId[],
): readonly CareerFixtureEligibilityBlocker[] {
  const nextFixture = findNextCareerFixture(careerState);
  if (nextFixture.status !== "found") return [];

  return findCareerFixtureEligibilityBlockers(
    careerState.playerAvailability ?? EMPTY_PLAYER_AVAILABILITY,
    selectedPlayerIds,
    nextFixture.fixture.date,
    nextFixture.fixture.competitionId,
  );
}

function containsSelectedClubInOrder(careerState: CareerState): boolean {
  for (const clubId of careerState.gameState.clubIds) {
    if (clubId === careerState.selectedClubId) {
      return true;
    }
  }

  return false;
}
