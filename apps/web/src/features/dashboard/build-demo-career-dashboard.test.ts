import { describe, expect, it } from "vitest";

import {
  WEB_DEMO_DASHBOARD_SAVE_ID,
  WEB_DEMO_DASHBOARD_SEED,
  buildDemoCareerDashboard,
  buildDemoCareerDashboardInput,
} from "./build-demo-career-dashboard";
import {
  createCompleteUnsavedDemoMatchPreparationState,
  saveDemoMatchPreparation,
} from "../match-preparation/match-preparation-demo";
import {
  createInitialDemoMatchdayState,
  playDemoMatchdayFixture,
} from "../matchday/matchday-demo";

describe("buildDemoCareerDashboard", () => {
  it("builds deterministic dashboard facts without writing a save", () => {
    const first = buildDemoCareerDashboard();
    const second = buildDemoCareerDashboard();

    expect(second).toEqual(first);
    expect(first.context.saveId).toBe(WEB_DEMO_DASHBOARD_SAVE_ID);
    expect(first.context.worldSeed).toBe(WEB_DEMO_DASHBOARD_SEED);
  });

  it("matches the first dashboard readiness shape proven by the CLI smoke", () => {
    const view = buildDemoCareerDashboard();

    expect(view.selectedClub.name).toBe("S.S. Perugia");
    expect(view.nextFixture).toMatchObject({
      status: "available",
      fixtureId: "fixture:000003",
      homeClubName: "U.S. Pisa",
      awayClubName: "S.S. Perugia",
      selectedClubSide: "away",
    });
    expect(view.preparation.lineupStatus).toBe("missing");
    expect(view.preparation.tacticStatus).toBe("missing");
    expect(view.alertKeys).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(view.conditionSummary).toEqual({
      playerCount: 22,
      lowestFitness: 100,
      averageFitness: 100,
      lowFitnessPlayerCount: 0,
    });
    expect(view.tableContext.status).toBe("unknown");
    expect(view.recentMatch.status).toBe("none");
  });

  it("exposes the future real-save adapter replacement shape", () => {
    const input = buildDemoCareerDashboardInput();

    expect(input.saveId).toBe(WEB_DEMO_DASHBOARD_SAVE_ID);
    expect(input.playerConditions).toHaveLength(22);
    expect(input.preparation).toEqual({
      hasSavedLineup: false,
      hasSavedTactic: false,
      targetFixtureId: "fixture:000003",
    });
  });

  it("updates dashboard facts after the demo matchday is played", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const matchdayState = playDemoMatchdayFixture(createInitialDemoMatchdayState(), savedPreparation);
    const view = buildDemoCareerDashboard(undefined, matchdayState);

    expect(view.nextFixture.status).toBe("none");
    expect(view.alertKeys).toEqual(["no_next_fixture"]);
    expect(view.preparation.blockerKeys).toEqual([]);
    expect(view.conditionSummary.averageFitness).toBeLessThan(100);
    expect(view.recentMatch).toMatchObject({
      status: "available",
      fixtureId: "fixture:000003",
      homeClubName: "U.S. Pisa",
      awayClubName: "S.S. Perugia",
    });
  });
});
