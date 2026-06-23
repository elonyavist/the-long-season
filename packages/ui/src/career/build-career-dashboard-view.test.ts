import { describe, expect, it } from "vitest";

import { buildCareerDashboardView, type BuildCareerDashboardViewInput } from "./build-career-dashboard-view.ts";

const selectedClub = {
  clubId: "club:perugia",
  name: "S.S. Perugia",
  rosterSize: 22,
};

const baseInput: BuildCareerDashboardViewInput = {
  saveId: "save:phase48",
  worldSeed: "world-a",
  generatorVersion: 1,
  currentDateIso: "2026-08-01",
  currentSeasonId: "season:demo-001",
  selectedClub,
  nextFixture: {
    fixtureId: "fixture:000003",
    dateIso: "2026-08-01",
    round: 1,
    homeClub: {
      clubId: "club:pisa",
      name: "U.S. Pisa",
    },
    awayClub: selectedClub,
    selectedClubSide: "away",
  },
  playerConditions: [
    { playerId: "player:001", fitness: 100 },
    { playerId: "player:002", fitness: 92 },
    { playerId: "player:003", fitness: 96 },
  ],
  tableRow: {
    position: 8,
    played: 0,
    points: 0,
    goalDifference: 0,
  },
};

describe("buildCareerDashboardView", () => {
  it("builds a new career dashboard with missing preparation blockers", () => {
    const view = buildCareerDashboardView(baseInput);

    expect(view.preparation.lineupStatus).toBe("missing");
    expect(view.preparation.tacticStatus).toBe("missing");
    expect(view.alertKeys).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(view.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("blocked");
  });

  it("builds a prepared dashboard with advance action available", () => {
    const view = buildCareerDashboardView({
      ...baseInput,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
        targetFixtureId: "fixture:000003",
      },
    });

    expect(view.preparation.blockerKeys).toEqual([]);
    expect(view.preparation.targetFixtureId).toBe("fixture:000003");
    expect(view.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("available");
  });

  it("blocks advance when there is no next selected-club fixture", () => {
    const { nextFixture: _nextFixture, ...inputWithoutNextFixture } = baseInput;
    const view = buildCareerDashboardView({
      ...inputWithoutNextFixture,
      preparation: {
        hasSavedLineup: true,
        hasSavedTactic: true,
      },
    });

    expect(view.nextFixture.status).toBe("none");
    expect(view.alertKeys).toEqual(["no_next_fixture"]);
    expect(view.actions.find((action) => action.actionId === "advance_next_fixture")?.blockerKeys).toEqual(["no_next_fixture"]);
  });

  it("summarizes low-condition players without exposing recommendations", () => {
    const view = buildCareerDashboardView({
      ...baseInput,
      playerConditions: [
        { playerId: "player:001", fitness: 65 },
        { playerId: "player:002", fitness: 80 },
        { playerId: "player:003", fitness: 100 },
      ],
      lowFitnessThreshold: 70,
    });

    expect(view.conditionSummary).toEqual({
      playerCount: 3,
      lowestFitness: 65,
      averageFitness: 81.67,
      lowFitnessPlayerCount: 1,
    });
  });

  it("returns deterministic output for the same explicit input", () => {
    const first = buildCareerDashboardView(baseInput);
    const second = buildCareerDashboardView(baseInput);

    expect(second).toEqual(first);
  });
});
