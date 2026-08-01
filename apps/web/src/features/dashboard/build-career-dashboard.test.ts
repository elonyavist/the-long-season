import { describe, expect, it } from "vitest";

import { buildWebCareerState, type WebCareerSaveId } from "../../runtime/web-career-runtime";
import {
  applyMatchPreparationSelectionAction,
  buildDurableMatchPreparation,
  createMatchPreparationDraft,
  selectMatchPreparationTactic,
} from "../match-preparation/match-preparation-adapter";
import { buildCareerDashboard, buildCareerDashboardInput } from "./build-career-dashboard";

describe("buildCareerDashboard", () => {
  it("maps the loaded club, calendar, fixture, conditions, and preparation without demo facts", () => {
    const career = buildWebCareerState({
      saveId: "save:dashboard-loaded" as WebCareerSaveId,
      worldSeed: "dashboard-loaded-seed",
    });

    const input = buildCareerDashboardInput(career);
    const view = buildCareerDashboard(career);
    const selectedClub = career.gameState.clubs[career.selectedClubId];

    expect(input.saveId).toBe(career.saveId);
    expect(input.worldSeed).toBe("dashboard-loaded-seed");
    expect(input.selectedClub.name).toBe(selectedClub?.name);
    expect(input.selectedClub.developmentEnvironmentKey).toMatch(
      /^(?:very_poor|poor|limited|adequate|good|very_good|excellent)$/,
    );
    expect(view.selectedClub.developmentEnvironmentLabelKey).toBe(
      `career.clubDevelopmentEnvironment.state.${input.selectedClub.developmentEnvironmentKey}`,
    );
    expect(input.playerConditions).toHaveLength(selectedClub?.playerIds.length ?? 0);
    expect(view.nextFixture.status).toBe("available");
    expect(view.preparation).toMatchObject({ lineupStatus: "missing", tacticStatus: "missing" });
    expect(view.recentMatch.status).toBe("none");
  });

  it("derives the same dashboard after reconstructing an equal durable state", () => {
    const identity = {
      saveId: "save:dashboard-refresh" as WebCareerSaveId,
      worldSeed: "dashboard-refresh-seed",
    };

    expect(buildCareerDashboard(buildWebCareerState(identity))).toEqual(
      buildCareerDashboard(buildWebCareerState(identity)),
    );
  });

  it("does not present a carried previous-fixture plan as ready for the next match", () => {
    const career = buildWebCareerState({
      saveId: "save:dashboard-carried-plan" as WebCareerSaveId,
      worldSeed: "dashboard-carried-plan-seed",
    });
    const selected = applyMatchPreparationSelectionAction(
      career,
      createMatchPreparationDraft(career),
      "auto",
    );
    const prepared = buildDurableMatchPreparation(
      career,
      selectMatchPreparationTactic(selected, "tactic:balanced"),
    );
    if (prepared === undefined) throw new Error("Expected complete preparation");

    const { targetFixtureId: _completedFixtureId, ...carriedPreparation } = prepared;
    const view = buildCareerDashboard({ ...career, matchPreparation: carriedPreparation });

    expect(view.preparation).toMatchObject({ lineupStatus: "missing", tacticStatus: "missing" });
    expect(view.actions.find((action) => action.actionId === "prepare_match")?.status).toBe("available");
    expect(view.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("blocked");
  });

  it("derives the current table and latest league-round results from played fixtures", () => {
    const career = buildWebCareerState({
      saveId: "save:dashboard-football-context" as WebCareerSaveId,
      worldSeed: "dashboard-football-context-seed",
    });
    const selectedFixtureIds = career.gameState.fixtureIds.filter((fixtureId) => {
      const fixture = career.gameState.fixtures[fixtureId];
      return fixture?.homeClubId === career.selectedClubId || fixture?.awayClubId === career.selectedClubId;
    }).slice(0, 2);
    const firstFixture = career.gameState.fixtures[selectedFixtureIds[0]!];
    const secondFixture = career.gameState.fixtures[selectedFixtureIds[1]!];
    if (firstFixture === undefined || secondFixture === undefined) throw new Error("Expected two selected-club fixtures");

    const playedCareer = {
      ...career,
      gameState: {
        ...career.gameState,
        fixtures: {
          ...career.gameState.fixtures,
          [firstFixture.id]: {
            ...firstFixture,
            result: firstFixture.homeClubId === career.selectedClubId
              ? { played: true as const, homeGoals: 2, awayGoals: 0 }
              : { played: true as const, homeGoals: 0, awayGoals: 2 },
          },
          [secondFixture.id]: {
            ...secondFixture,
            result: secondFixture.homeClubId === career.selectedClubId
              ? { played: true as const, homeGoals: 1, awayGoals: 3 }
              : { played: true as const, homeGoals: 3, awayGoals: 1 },
          },
        },
      },
    };

    const view = buildCareerDashboard(playedCareer);

    expect(view.leagueTable.status).toBe("available");
    expect(view.leagueTable.rows).toHaveLength(5);
    expect(view.leagueTable.rows.some((row) => row.isSelectedClub)).toBe(true);
    expect(view.leagueResults.status).toBe("available");
    expect(view.leagueResults.round).toBe(secondFixture.roundNumber);
    expect(view.leagueResults.results).toHaveLength(1);
    expect(view.leagueResults.results[0]?.fixtureId).toBe(secondFixture.id);
    expect(view.leagueResults.results[0]?.isSelectedClubFixture).toBe(true);
    expect(view.recentMatch).toMatchObject({ fixtureId: secondFixture.id });
  });
});
