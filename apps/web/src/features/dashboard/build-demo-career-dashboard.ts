import {
  buildCareerDashboardView,
  type BuildCareerDashboardViewInput,
  type CareerDashboardPreparationInput,
  type CareerDashboardView,
} from "@game/ui";
import { toISO } from "@game/shared";

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

/** Minimal structural matchday state consumed by the dashboard adapter. */
export interface DemoDashboardMatchdayState {
  /** Successful played result produced by the web matchday adapter. */
  readonly playedResult?: {
    readonly careerState: {
      readonly gameState: {
        readonly calendar: {
          readonly currentDate: number;
          readonly currentSeasonId: string;
        };
        readonly clubs: Readonly<Record<string, { readonly playerIds: readonly string[] } | undefined>>;
        readonly playerStates: Readonly<Record<string, { readonly fitness: number } | undefined>>;
      };
      readonly selectedClubId: string;
    };
    readonly fixtureAfter: {
      readonly id: string;
      readonly homeClubId: string;
      readonly awayClubId: string;
      readonly result?: {
        readonly homeGoals: number;
        readonly awayGoals: number;
      };
    };
  };
}

/**
 * Builds the explicit input facts for the demo career dashboard.
 *
 * This is the narrow replacement point for a future real save adapter: a later
 * adapter should return the same `BuildCareerDashboardViewInput` shape after
 * loading a career save.
 */
export function buildDemoCareerDashboardInput(
  preparation?: CareerDashboardPreparationInput,
  matchdayState?: DemoDashboardMatchdayState,
): BuildCareerDashboardViewInput {
  const playedResult = matchdayState?.playedResult;

  if (playedResult !== undefined) {
    return buildPlayedMatchdayDashboardInput(playedResult);
  }

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
    preparation:
      preparation ?? {
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
export function buildDemoCareerDashboard(
  preparation?: CareerDashboardPreparationInput,
  matchdayState?: DemoDashboardMatchdayState,
): CareerDashboardView {
  return buildCareerDashboardView(buildDemoCareerDashboardInput(preparation, matchdayState));
}

function buildPlayedMatchdayDashboardInput(
  playedResult: NonNullable<DemoDashboardMatchdayState["playedResult"]>,
): BuildCareerDashboardViewInput {
  const selectedClubState = playedResult.careerState.gameState.clubs[playedResult.careerState.selectedClubId];
  const playerIds = selectedClubState?.playerIds ?? [];
  const result = playedResult.fixtureAfter.result;

  return {
    saveId: WEB_DEMO_DASHBOARD_SAVE_ID,
    worldSeed: WEB_DEMO_DASHBOARD_SEED,
    generatorVersion: 1,
    currentDateIso: toISO(playedResult.careerState.gameState.calendar.currentDate),
    currentSeasonId: playedResult.careerState.gameState.calendar.currentSeasonId,
    selectedClub: SELECTED_CLUB,
    preparation: {
      hasSavedLineup: true,
      hasSavedTactic: true,
    },
    playerConditions: playerIds.map((playerId) => ({
      playerId,
      fitness: playedResult.careerState.gameState.playerStates[playerId]?.fitness ?? 0,
    })),
    ...(result === undefined
      ? {}
      : {
          recentMatch: {
            fixtureId: playedResult.fixtureAfter.id,
            homeClub: playedResult.fixtureAfter.homeClubId === NEXT_OPPONENT.clubId ? NEXT_OPPONENT : SELECTED_CLUB,
            awayClub: playedResult.fixtureAfter.awayClubId === SELECTED_CLUB.clubId ? SELECTED_CLUB : NEXT_OPPONENT,
            homeGoals: result.homeGoals,
            awayGoals: result.awayGoals,
          },
        }),
  };
}
