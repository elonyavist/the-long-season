import {
  buildCareerDashboardView,
  type BuildCareerDashboardViewInput,
  type CareerDashboardView,
} from "@game/ui";

/** Seed used by the deterministic web dashboard prototype. */
export const WEB_DEMO_DASHBOARD_SEED = "world-a";

/** Save identifier used only by the in-memory web dashboard prototype. */
export const WEB_DEMO_DASHBOARD_SAVE_ID = "save:phase49-demo";

const SELECTED_CLUB = {
  clubId: "club:perugia",
  name: "S.S. Perugia",
  rosterSize: 22,
} as const;

const NEXT_OPPONENT = {
  clubId: "club:pisa",
  name: "U.S. Pisa",
} as const;

/**
 * Builds the explicit input facts for the demo career dashboard.
 *
 * This is the narrow replacement point for a future real save adapter: a later
 * adapter should return the same `BuildCareerDashboardViewInput` shape after
 * loading a career save.
 */
export function buildDemoCareerDashboardInput(): BuildCareerDashboardViewInput {
  return {
    saveId: WEB_DEMO_DASHBOARD_SAVE_ID,
    worldSeed: WEB_DEMO_DASHBOARD_SEED,
    generatorVersion: 1,
    currentDateIso: "2026-08-01",
    currentSeasonId: "season:demo-001",
    selectedClub: SELECTED_CLUB,
    nextFixture: {
      fixtureId: "fixture:000003",
      dateIso: "2026-08-01",
      round: 1,
      homeClub: NEXT_OPPONENT,
      awayClub: SELECTED_CLUB,
      selectedClubSide: "away",
    },
    preparation: {
      hasSavedLineup: false,
      hasSavedTactic: false,
      targetFixtureId: "fixture:000003",
    },
    playerConditions: Array.from({ length: 22 }, (_, index) => ({
      playerId: `player:demo-${String(index + 1).padStart(2, "0")}`,
      fitness: 100,
    })),
  };
}

/** Builds the deterministic read-only demo dashboard view for the web app. */
export function buildDemoCareerDashboard(): CareerDashboardView {
  return buildCareerDashboardView(buildDemoCareerDashboardInput());
}
