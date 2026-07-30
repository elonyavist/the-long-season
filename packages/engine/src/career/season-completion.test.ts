import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  clubId,
  competitionId,
  createCareerState,
  fixtureId,
  gameDate,
  saveId,
  seasonId,
  type CareerState,
  type Club,
  type ClubId,
  type Fixture,
  type GameState,
} from "@game/domain";

import { assessCareerSeasonCompletion } from "./season-completion.ts";

/**
 * Season-completion tests protect the pure career season boundary check before
 * any storage, CLI, or rollover code is allowed to depend on it.
 */

test("assessCareerSeasonCompletion returns complete when all current-season fixtures are played", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const currentSeasonId = seasonId("season:2026");
  const state = careerStateFixture({
    selectedClubId,
    currentSeasonId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), currentSeasonId, selectedClubId, otherClubId, true),
      fixtureFixture(fixtureId("fixture:000002"), currentSeasonId, otherClubId, selectedClubId, true),
      fixtureFixture(fixtureId("fixture:old001"), seasonId("season:2025"), selectedClubId, otherClubId, false),
    ],
  });
  const before = JSON.stringify(state);

  assert.deepEqual(assessCareerSeasonCompletion(state), {
    status: "complete",
    seasonId: currentSeasonId,
    fixtureCount: 2,
    playedFixtureCount: 2,
  });
  assert.equal(JSON.stringify(state), before);
});

test("assessCareerSeasonCompletion returns incomplete at the first unplayed current-season fixture", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const currentSeasonId = seasonId("season:2026");
  const unplayedFixtureId = fixtureId("fixture:000002");
  const state = careerStateFixture({
    selectedClubId,
    currentSeasonId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), currentSeasonId, selectedClubId, otherClubId, true),
      fixtureFixture(unplayedFixtureId, currentSeasonId, otherClubId, selectedClubId, false),
      fixtureFixture(fixtureId("fixture:000003"), currentSeasonId, selectedClubId, otherClubId, false),
    ],
  });

  assert.deepEqual(assessCareerSeasonCompletion(state), {
    status: "incomplete",
    seasonId: currentSeasonId,
    fixtureCount: 2,
    playedFixtureCount: 1,
    firstUnplayedFixtureId: unplayedFixtureId,
  });
});

test("assessCareerSeasonCompletion reports invalid fixture references", () => {
  const selectedClubId = clubId("club:selected");
  const currentSeasonId = seasonId("season:2026");
  const missingFixtureId = fixtureId("fixture:missing");
  const baseState = careerStateFixture({
    selectedClubId,
    currentSeasonId,
    clubs: [clubFixture(selectedClubId)],
    fixtures: [],
  });
  const state = {
    ...baseState,
    gameState: {
      ...baseState.gameState,
      fixtureIds: [missingFixtureId],
    },
  };

  assert.deepEqual(assessCareerSeasonCompletion(state), {
    status: "invalid",
    reason: "fixture_missing",
    fixtureId: missingFixtureId,
    seasonId: currentSeasonId,
  });
});

test("assessCareerSeasonCompletion reports missing fixture clubs", () => {
  const selectedClubId = clubId("club:selected");
  const missingClubId = clubId("club:missing");
  const currentSeasonId = seasonId("season:2026");
  const fixtureWithMissingAwayId = fixtureId("fixture:000001");
  const state = careerStateFixture({
    selectedClubId,
    currentSeasonId,
    clubs: [clubFixture(selectedClubId)],
    fixtures: [fixtureFixture(fixtureWithMissingAwayId, currentSeasonId, selectedClubId, missingClubId, true)],
  });

  assert.deepEqual(assessCareerSeasonCompletion(state), {
    status: "invalid",
    reason: "fixture_away_club_not_found",
    fixtureId: fixtureWithMissingAwayId,
    seasonId: currentSeasonId,
  });
});

test("assessCareerSeasonCompletion reports missing current-season fixtures", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const currentSeasonId = seasonId("season:2026");
  const state = careerStateFixture({
    selectedClubId,
    currentSeasonId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:old001"), seasonId("season:2025"), selectedClubId, otherClubId, true),
    ],
  });

  assert.deepEqual(assessCareerSeasonCompletion(state), {
    status: "invalid",
    reason: "no_current_season_fixtures",
    seasonId: currentSeasonId,
  });
});

test("assessCareerSeasonCompletion counts every ordered domestic competition", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const thirdClubId = clubId("club:third");
  const fourthClubId = clubId("club:fourth");
  const currentSeasonId = seasonId("season:2026");
  const firstCompetitionId = competitionId("competition:first");
  const secondCompetitionId = competitionId("competition:second");
  const fixtures = [
    fixtureFixture(
      fixtureId("fixture:first:2026:000001"),
      currentSeasonId,
      selectedClubId,
      otherClubId,
      true,
      firstCompetitionId,
    ),
    fixtureFixture(
      fixtureId("fixture:second:2026:000001"),
      currentSeasonId,
      thirdClubId,
      fourthClubId,
      true,
      secondCompetitionId,
    ),
  ];
  const base = gameStateFixture(
    currentSeasonId,
    [selectedClubId, otherClubId, thirdClubId, fourthClubId].map(clubFixture),
    fixtures,
  );
  const state = createCareerState({
    saveId: saveId("save:multi-completion"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: {
      ...base,
      domesticCompetitionWorld: {
        competitionIds: [secondCompetitionId, firstCompetitionId],
        competitions: {
          [firstCompetitionId]: competitionFixture(firstCompetitionId, [selectedClubId, otherClubId]),
          [secondCompetitionId]: competitionFixture(secondCompetitionId, [thirdClubId, fourthClubId]),
        },
        seasonHistory: [],
      },
    },
    transferHistory: [],
  });

  assert.deepEqual(assessCareerSeasonCompletion(state), {
    status: "complete",
    seasonId: currentSeasonId,
    fixtureCount: 2,
    playedFixtureCount: 2,
  });
});

function careerStateFixture(input: {
  readonly selectedClubId: ClubId;
  readonly currentSeasonId: GameState["calendar"]["currentSeasonId"];
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
}): CareerState {
  return createCareerState({
    saveId: saveId("save:career-season-completion"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: input.selectedClubId,
    gameState: gameStateFixture(input.currentSeasonId, input.clubs, input.fixtures),
    transferHistory: [],
  });
}

function gameStateFixture(
  currentSeasonId: GameState["calendar"]["currentSeasonId"],
  clubs: readonly Club[],
  fixtures: readonly Fixture[],
): GameState {
  const clubsById: Partial<Record<ClubId, Club>> = {};
  const clubIds: ClubId[] = [];
  const fixturesById: Partial<Record<Fixture["id"], Fixture>> = {};
  const fixtureIds: Fixture["id"][] = [];

  for (const club of clubs) {
    clubsById[club.id] = club;
    clubIds.push(club.id);
  }

  for (const fixture of fixtures) {
    fixturesById[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  return {
    meta: {
      seed: "career-season-completion-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId,
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: clubsById as GameState["clubs"],
    clubIds,
    fixtures: fixturesById as GameState["fixtures"],
    fixtureIds,
  };
}

function clubFixture(id: ClubId): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds: [],
  };
}

function fixtureFixture(
  id: Fixture["id"],
  fixtureSeasonId: Fixture["seasonId"],
  homeClubId: ClubId,
  awayClubId: ClubId,
  played: boolean,
  fixtureCompetitionId = competitionId("competition:test"),
): Fixture {
  return {
    id,
    competitionId: fixtureCompetitionId,
    seasonId: fixtureSeasonId,
    roundNumber: 1,
    date: gameDate(20_000),
    homeClubId,
    awayClubId,
    ...(played
      ? {
          result: {
            played: true,
            homeGoals: 1,
            awayGoals: 0,
          },
        }
      : {}),
  };
}

function competitionFixture(id: ReturnType<typeof competitionId>, clubIds: readonly ClubId[]) {
  return {
    id,
    name: String(id),
    clubIds,
    matchRules: {
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
  } as const;
}
