import assert from "node:assert/strict";
import { test } from "vitest";

import {
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  MATCH_EVENT_SCHEMA_VERSION,
  seasonId,
  type Fixture,
  type FixtureId,
  type GameState,
  type MatchReport,
} from "@game/domain";

import { ApplyMatchReportToFixtureError, applyMatchReportToFixture } from "../index.ts";

/**
 * Fixture-result tests prove that completed match reports update fixture state
 * without mutating the original game state or computing standings.
 */

test("applying a report sets the fixture result", () => {
  const id = fixtureId("fixture:result-000001");
  const state = stateWithFixture(id);
  const report = matchReport(id, { home: 2, away: 1 });

  const nextState = applyMatchReportToFixture({ state, fixtureId: id, report });
  const fixture = fixtureFromState(nextState, id);

  assert.deepEqual(fixture.result, {
    played: true,
    homeGoals: 2,
    awayGoals: 1,
    report,
  });
});

test("applying a report does not mutate the original game state", () => {
  const id = fixtureId("fixture:result-000002");
  const state = stateWithFixture(id);
  const originalFixture = fixtureFromState(state, id);
  const report = matchReport(id, { home: 0, away: 3 });

  const nextState = applyMatchReportToFixture({ state, fixtureId: id, report });

  assert.notEqual(nextState, state);
  assert.notEqual(nextState.fixtures, state.fixtures);
  assert.notEqual(fixtureFromState(nextState, id), originalFixture);
  assert.equal(originalFixture.result, undefined);
  assert.equal(nextState.fixtureIds, state.fixtureIds);
  assert.equal(nextState.clubs, state.clubs);
});

test("mismatched fixture ID fails with a typed error", () => {
  const id = fixtureId("fixture:result-000003");
  const state = stateWithFixture(id);
  const report = matchReport(fixtureId("fixture:other-000003"), { home: 1, away: 1 });

  assert.throws(
    () => applyMatchReportToFixture({ state, fixtureId: id, report }),
    (error) =>
      error instanceof ApplyMatchReportToFixtureError &&
      error.code === "fixture_report_mismatch",
  );
});

test("re-applying to a played fixture fails by default", () => {
  const id = fixtureId("fixture:result-000004");
  const firstReport = matchReport(id, { home: 1, away: 0 });
  const playedState = applyMatchReportToFixture({
    state: stateWithFixture(id),
    fixtureId: id,
    report: firstReport,
  });
  const secondReport = matchReport(id, { home: 2, away: 2 });

  assert.throws(
    () => applyMatchReportToFixture({ state: playedState, fixtureId: id, report: secondReport }),
    (error) =>
      error instanceof ApplyMatchReportToFixtureError &&
      error.code === "fixture_already_played",
  );
});

test("debug option allows overwriting a played fixture", () => {
  const id = fixtureId("fixture:result-000005");
  const firstReport = matchReport(id, { home: 1, away: 0 });
  const playedState = applyMatchReportToFixture({
    state: stateWithFixture(id),
    fixtureId: id,
    report: firstReport,
  });
  const secondReport = matchReport(id, { home: 2, away: 2 });

  const nextState = applyMatchReportToFixture({
    state: playedState,
    fixtureId: id,
    report: secondReport,
    options: { allowOverwrite: true },
  });

  assert.equal(fixtureFromState(nextState, id).result?.homeGoals, 2);
  assert.equal(fixtureFromState(nextState, id).result?.awayGoals, 2);
});

test("fixture result is enough to compute goals without reading events", () => {
  const id = fixtureId("fixture:result-000006");
  const state = stateWithFixture(id);
  const report = matchReport(id, { home: 4, away: 2 });

  const nextState = applyMatchReportToFixture({ state, fixtureId: id, report });
  const result = fixtureFromState(nextState, id).result;

  assert.equal(result?.played, true);
  assert.equal(result.homeGoals, 4);
  assert.equal(result.awayGoals, 2);
});

/**
 * Builds a minimal state with one scheduled fixture.
 */
function stateWithFixture(id: FixtureId): GameState {
  const fixture: Fixture = {
    id,
    competitionId: competitionId("competition:result-test"),
    seasonId: seasonId("season:2026"),
    roundNumber: 1,
    date: gameDate(20_000),
    homeClubId: clubId("club:home"),
    awayClubId: clubId("club:away"),
  };

  return {
    meta: {
      seed: "fixture-result-seed",
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:2026"),
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: {},
    clubIds: [],
    fixtures: {
      [id]: fixture,
    },
    fixtureIds: [id],
  };
}

/**
 * Builds the smallest completed report needed by fixture application.
 */
function matchReport(
  id: FixtureId,
  score: { readonly home: number; readonly away: number },
): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: id,
    finalMinute: 90,
    score,
    stats: {
      home: {
        opportunities: score.home,
        shots: score.home,
        shotsOnTarget: score.home,
        goals: score.home,
      },
      away: {
        opportunities: score.away,
        shots: score.away,
        shotsOnTarget: score.away,
        goals: score.away,
      },
    },
    events: [],
  };
}

/**
 * Reads one fixture from state and fails loudly if the fixture is absent.
 */
function fixtureFromState(state: GameState, id: FixtureId): Fixture {
  const fixture = state.fixtures[id];

  if (fixture === undefined) {
    throw new Error(`Fixture not found in test state: ${id}`);
  }

  return fixture;
}
