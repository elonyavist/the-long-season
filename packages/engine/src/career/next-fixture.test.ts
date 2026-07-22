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

import { findNextCareerFixture } from "./next-fixture.ts";

/**
 * Next-fixture tests protect the pure career progression selector before any
 * CLI or persistence step is allowed to advance a save.
 */

test("findNextCareerFixture returns the first unplayed fixture for the selected club in fixture order", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const thirdClubId = clubId("club:third");
  const firstSelectedFixtureId = fixtureId("fixture:000002");
  const state = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId), clubFixture(thirdClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), otherClubId, thirdClubId),
      fixtureFixture(firstSelectedFixtureId, otherClubId, selectedClubId),
      fixtureFixture(fixtureId("fixture:000003"), selectedClubId, thirdClubId),
    ],
  });
  const before = JSON.stringify(state);

  const result = findNextCareerFixture(state);

  assert.equal(result.status, "found");
  if (result.status === "found") {
    assert.equal(result.fixtureId, firstSelectedFixtureId);
    assert.equal(result.fixture.id, firstSelectedFixtureId);
  }
  assert.equal(JSON.stringify(state), before);
});

test("findNextCareerFixture skips played selected-club fixtures", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const nextFixtureId = fixtureId("fixture:000002");
  const state = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId, true),
      fixtureFixture(nextFixtureId, otherClubId, selectedClubId),
    ],
  });

  const result = findNextCareerFixture(state);

  assert.equal(result.status, "found");
  if (result.status === "found") {
    assert.equal(result.fixtureId, nextFixtureId);
  }
});

test("findNextCareerFixture returns none when no selected-club fixture is available", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const state = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId, true)],
  });

  assert.deepEqual(findNextCareerFixture(state), { status: "none" });
});

test("findNextCareerFixture reports missing fixture references as invalid state", () => {
  const selectedClubId = clubId("club:selected");
  const missingFixtureId = fixtureId("fixture:missing");
  const baseState = careerStateFixture({
    selectedClubId,
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

  assert.deepEqual(findNextCareerFixture(state), {
    status: "invalid",
    reason: "fixture_missing",
    fixtureId: missingFixtureId,
  });
});

test("findNextCareerFixture reports missing selected club as invalid state", () => {
  const selectedClubId = clubId("club:selected");
  const state = {
    ...careerStateFixture({
      selectedClubId,
      clubs: [clubFixture(selectedClubId)],
      fixtures: [],
    }),
    selectedClubId: clubId("club:missing"),
  } as CareerState;

  assert.deepEqual(findNextCareerFixture(state), {
    status: "invalid",
    reason: "selected_club_not_found",
  });
});

function careerStateFixture(input: {
  readonly selectedClubId: ClubId;
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
}): CareerState {
  return createCareerState({
    saveId: saveId("save:career-next-fixture"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: input.selectedClubId,
    gameState: gameStateFixture(input.clubs, input.fixtures),
    transferHistory: [],
  });
}

function gameStateFixture(clubs: readonly Club[], fixtures: readonly Fixture[]): GameState {
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
      seed: "career-next-fixture-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:test"),
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

function fixtureFixture(id: Fixture["id"], homeClubId: ClubId, awayClubId: ClubId, played = false): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:test"),
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
