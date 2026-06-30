import { describe, expect, it } from "vitest";

import {
  buildCareerMatchdayView,
  type BuildCareerMatchdayViewInput,
  type CareerMatchdayFixtureInput,
  type CareerMatchdayResultInput,
} from "./career-matchday-view.ts";

const selectedClub = {
  clubId: "club:perugia",
  name: "S.S. Perugia",
};

const opponent = {
  clubId: "club:pisa",
  name: "U.S. Pisa",
};

const fixture: CareerMatchdayFixtureInput = {
  fixtureId: "fixture:000003",
  dateIso: "2026-08-01",
  round: 1,
  homeClub: opponent,
  awayClub: selectedClub,
  selectedClubSide: "away",
};

const baseInput: BuildCareerMatchdayViewInput = {
  saveId: "save:phase65",
  currentDateIso: "2026-08-01",
  selectedClub,
  fixture,
};

const playedResult: CareerMatchdayResultInput = {
  homeGoals: 1,
  awayGoals: 2,
  events: [
    {
      eventId: "event:late",
      minute: 70,
      kind: "goal",
      club: selectedClub,
      playerName: "Nico Rinaldi",
    },
    {
      eventId: "event:early-second",
      minute: 12,
      sequence: 2,
      kind: "save",
      club: selectedClub,
      playerName: "Davide Valentini",
    },
    {
      eventId: "event:early-first",
      minute: 12,
      sequence: 1,
      kind: "miss",
      club: opponent,
    },
  ],
  playerStats: [
    {
      playerId: "player:keeper",
      playerName: "Davide Valentini",
      club: selectedClub,
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      saves: 3,
    },
    {
      playerId: "player:striker",
      playerName: "Nico Rinaldi",
      club: selectedClub,
      goals: 2,
      assists: 0,
      shots: 3,
      shotsOnTarget: 2,
      saves: 0,
    },
  ],
  conditionChanges: [
    {
      playerId: "player:striker",
      playerName: "Nico Rinaldi",
      before: 100,
      after: 92,
      delta: -8,
    },
  ],
  playerStateChanges: [
    {
      playerId: "player:striker",
      playerName: "Nico Rinaldi",
      formBefore: 50,
      formAfter: 54,
      formDelta: 4,
      moraleBefore: 50,
      moraleAfter: 52,
      moraleDelta: 2,
      reasonKeys: ["match_result_win", "goal"],
    },
    {
      playerId: "player:keeper",
      playerName: "Davide Valentini",
      formBefore: 50,
      formAfter: 51,
      formDelta: 1,
      moraleBefore: 50,
      moraleAfter: 50,
      moraleDelta: 0,
      reasonKeys: ["goalkeeper_saves"],
    },
  ],
};

describe("buildCareerMatchdayView", () => {
  it("builds a blocked pre-play state when preparation is missing", () => {
    const view = buildCareerMatchdayView(baseInput);

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(view.actions.find((action) => action.actionId === "prepare_match")?.status).toBe("available");
    expect(view.actions.find((action) => action.actionId === "play_fixture")?.status).toBe("blocked");
    expect(view.score.status).toBe("none");
  });

  it("builds a playable state when fixture and preparation are ready", () => {
    const view = buildCareerMatchdayView({
      ...baseInput,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
        targetFixtureId: "fixture:000003",
      },
    });

    expect(view.status).toBe("ready_to_play");
    expect(view.blockerKeys).toEqual([]);
    expect(view.actions.find((action) => action.actionId === "play_fixture")?.status).toBe("available");
    expect(view.fixture.homeClubName).toBe("U.S. Pisa");
  });

  it("builds a played result state with ordered facts", () => {
    const view = buildCareerMatchdayView({
      ...baseInput,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
        targetFixtureId: "fixture:000003",
      },
      result: playedResult,
      nextStop: {
        reason: "match_preparation_required",
        dateIso: "2026-08-08",
        actionId: "prepare_match",
      },
    });

    expect(view.status).toBe("played");
    expect(view.score).toMatchObject({
      status: "available",
      homeGoals: 1,
      awayGoals: 2,
      selectedClubResult: "win",
    });
    expect(view.events.map((event) => event.eventId)).toEqual([
      "event:early-first",
      "event:early-second",
      "event:late",
    ]);
    expect(view.playerStats.map((row) => row.playerId)).toEqual(["player:striker", "player:keeper"]);
    expect(view.playerStateChanges.map((row) => row.playerId)).toEqual(["player:striker", "player:keeper"]);
    expect(view.nextStop).toMatchObject({
      status: "available",
      reason: "match_preparation_required",
      actionId: "prepare_match",
    });
  });

  it("keeps the legacy result-only view compatible while phase view evolves separately", () => {
    const view = buildCareerMatchdayView({
      ...baseInput,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
        targetFixtureId: "fixture:000003",
      },
      result: playedResult,
    });

    expect(view.viewKey).toBe("career.matchday");
    expect(view.status).toBe("played");
  });

  it("does not invent result facts when a played fixture has no report", () => {
    const view = buildCareerMatchdayView({
      ...baseInput,
      fixtureAlreadyPlayed: true,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
      },
    });

    expect(view.status).toBe("unavailable");
    expect(view.blockerKeys).toEqual(["missing_match_report"]);
    expect(view.score.status).toBe("none");
    expect(view.events).toEqual([]);
    expect(view.actions.find((action) => action.actionId === "play_fixture")?.status).toBe("blocked");
  });

  it("returns unavailable empty facts when fixture is missing", () => {
    const view = buildCareerMatchdayView({
      saveId: "save:phase65",
      currentDateIso: "2026-08-01",
      selectedClub,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
      },
    });

    expect(view.status).toBe("unavailable");
    expect(view.fixture.status).toBe("none");
    expect(view.blockerKeys).toEqual(["missing_fixture"]);
    expect(view.conditionChanges).toEqual([]);
    expect(view.playerStateChanges).toEqual([]);
  });
});
