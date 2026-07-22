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
import { addDays } from "@game/shared";

import { generateNextSeasonCalendar } from "./next-season-calendar.ts";

/**
 * Next-season calendar tests keep rollover calendar generation deterministic
 * and separate from storage mutation.
 */

test("generateNextSeasonCalendar creates a deterministic next season without fixture ID collisions", () => {
  const state = completeCareerStateFixture();

  const first = generateNextSeasonCalendar(state);
  const second = generateNextSeasonCalendar(state);

  assert.deepEqual(first, second);
  assert.equal(first.status, "generated");
  if (first.status === "generated") {
    assert.equal(first.previousSeasonId, "season:0001");
    assert.equal(first.seasonId, "season:0002");
    assert.equal(first.competitionId, "competition:test");
    assert.equal(first.seasonStartDate, gameDate(addDays(gameDate(20_007), 70)));
    assert.deepEqual(first.fixtureIds, [fixtureId("fixture:000003"), fixtureId("fixture:000004")]);
    assert.equal(first.fixtures[0]?.seasonId, "season:0002");
    assert.equal(first.fixtures[1]?.seasonId, "season:0002");
    assert.equal(state.gameState.fixtures[fixtureId("fixture:000003")], undefined);
  }
});

test("generateNextSeasonCalendar appends -next when the current season ID is semantic", () => {
  const state = completeCareerStateFixture(seasonId("season:italy-third"));

  const result = generateNextSeasonCalendar(state);

  assert.equal(result.status, "generated");
  if (result.status === "generated") {
    assert.equal(result.seasonId, "season:italy-third-next");
  }
});

test("generateNextSeasonCalendar rejects incomplete current seasons", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const unplayedFixtureId = fixtureId("fixture:000002");
  const state = careerStateFixture({
    selectedClubId,
    currentSeasonId: seasonId("season:0001"),
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), seasonId("season:0001"), selectedClubId, otherClubId, true, gameDate(20_000)),
      fixtureFixture(unplayedFixtureId, seasonId("season:0001"), otherClubId, selectedClubId, false, gameDate(20_007)),
    ],
  });

  assert.deepEqual(generateNextSeasonCalendar(state), {
    status: "invalid",
    reason: "current_season_incomplete",
    fixtureId: unplayedFixtureId,
  });
});

test("generateNextSeasonCalendar rejects mixed current-season competitions", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const mixedFixtureId = fixtureId("fixture:000002");
  const state = careerStateFixture({
    selectedClubId,
    currentSeasonId: seasonId("season:0001"),
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), seasonId("season:0001"), selectedClubId, otherClubId, true, gameDate(20_000)),
      {
        ...fixtureFixture(mixedFixtureId, seasonId("season:0001"), otherClubId, selectedClubId, true, gameDate(20_007)),
        competitionId: competitionId("competition:other"),
      },
    ],
  });

  assert.deepEqual(generateNextSeasonCalendar(state), {
    status: "invalid",
    reason: "multiple_current_season_competitions",
    fixtureId: mixedFixtureId,
  });
});

function completeCareerStateFixture(currentSeasonId = seasonId("season:0001")): CareerState {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");

  return careerStateFixture({
    selectedClubId,
    currentSeasonId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), currentSeasonId, selectedClubId, otherClubId, true, gameDate(20_000)),
      fixtureFixture(fixtureId("fixture:000002"), currentSeasonId, otherClubId, selectedClubId, true, gameDate(20_007)),
    ],
  });
}

function careerStateFixture(input: {
  readonly selectedClubId: ClubId;
  readonly currentSeasonId: GameState["calendar"]["currentSeasonId"];
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
}): CareerState {
  return createCareerState({
    saveId: saveId("save:career-next-season-calendar"),
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
      seed: "career-next-season-calendar-test",
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
  date: Fixture["date"],
): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: fixtureSeasonId,
    roundNumber: 1,
    date,
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
