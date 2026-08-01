import { describe, expect, it } from "vitest";

import type { CareerDashboardView } from "./career-dashboard-view.ts";

describe("CareerDashboardView", () => {
  it("stores career dashboard facts without rendered UI prose", () => {
    const view: CareerDashboardView = {
      screenKey: "career.dashboard",
      context: {
        saveId: "save:phase48",
        worldSeed: "world-a",
        generatorVersion: 1,
        currentDateIso: "2026-08-01",
        currentSeasonId: "season:demo-001",
      },
      selectedClub: {
        clubId: "club:pro01",
        name: "A.C. Perugia",
        rosterSize: 22,
        developmentEnvironmentLabelKey: "career.clubDevelopmentEnvironment.state.adequate",
      },
      nextFixture: {
        status: "available",
        fixtureId: "fixture:000001",
        dateIso: "2026-08-01",
        round: 1,
        homeClubId: "club:pro01",
        homeClubName: "A.C. Perugia",
        awayClubId: "club:pro02",
        awayClubName: "F.C. Como",
        selectedClubSide: "home",
      },
      preparation: {
        lineupStatus: "missing",
        tacticStatus: "missing",
        blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
      },
      conditionSummary: {
        playerCount: 22,
        lowestFitness: 92,
        averageFitness: 98,
        lowFitnessPlayerCount: 0,
      },
      tableContext: {
        status: "available",
        position: 8,
        played: 0,
        points: 0,
        goalDifference: 0,
      },
      recentMatch: {
        status: "available",
        fixtureId: "fixture:000000",
        homeClubId: "club:pro01",
        homeClubName: "A.C. Perugia",
        awayClubId: "club:pro02",
        awayClubName: "F.C. Como",
        homeGoals: 2,
        awayGoals: 1,
      },
      leagueTable: {
        status: "available",
        selectedClubPosition: 8,
        rows: [
          {
            position: 8,
            clubId: "club:pro01",
            clubName: "A.C. Perugia",
            played: 1,
            wins: 1,
            draws: 0,
            losses: 0,
            goalDifference: 1,
            points: 3,
            isSelectedClub: true,
          },
        ],
      },
      leagueResults: {
        status: "available",
        round: 1,
        results: [
          {
            fixtureId: "fixture:000000",
            homeClubId: "club:pro01",
            homeClubName: "A.C. Perugia",
            awayClubId: "club:pro02",
            awayClubName: "F.C. Como",
            homeGoals: 2,
            awayGoals: 1,
            isSelectedClubFixture: true,
          },
        ],
      },
      alertKeys: ["missing_saved_lineup", "missing_saved_tactic"],
      actions: [
        {
          actionId: "prepare_match",
          status: "available",
          blockerKeys: [],
          labelKey: "career.dashboard.action.prepare_match",
        },
        {
          actionId: "advance_next_fixture",
          status: "blocked",
          blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
          labelKey: "career.dashboard.action.advance_next_fixture",
        },
      ],
    };

    expect(view.screenKey).toBe("career.dashboard");
    expect(view.selectedClub.developmentEnvironmentLabelKey).toBe(
      "career.clubDevelopmentEnvironment.state.adequate",
    );
    expect(view.nextFixture.selectedClubSide).toBe("home");
    expect(view.recentMatch.homeGoals).toBe(2);
    expect(view.leagueTable.rows[0]?.isSelectedClub).toBe(true);
    expect(view.leagueResults.results[0]?.isSelectedClubFixture).toBe(true);
    expect(view.actions[1]?.status).toBe("blocked");
    expect(view.alertKeys).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
  });
});
