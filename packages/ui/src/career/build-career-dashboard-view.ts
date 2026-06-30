import type {
  CareerDashboardFixtureSide,
  CareerDashboardView,
} from "./career-dashboard-view.ts";
import { careerDashboardActionAvailability } from "./career-dashboard-actions.ts";
import type {
  CareerDashboardActionAvailability,
  CareerDashboardActionAvailabilityStatus,
  CareerDashboardActionId,
  CareerDashboardBlockerKey,
} from "./career-dashboard-actions.ts";

/** Club identity used by the dashboard builder without importing domain state. */
export interface CareerDashboardClubInput {
  /** Stable club identifier. */
  readonly clubId: string;
  /** Display name already stored in game content/save data. */
  readonly name: string;
}

/** Player condition input used for compact selected-club readiness. */
export interface CareerDashboardPlayerConditionInput {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Current fitness value, expected in the same 0..100 scale as career state. */
  readonly fitness: number;
}

/** Fixture input for next or recent selected-club fixture facts. */
export interface CareerDashboardFixtureInput {
  /** Stable fixture identifier. */
  readonly fixtureId: string;
  /** Fixture date in display-ready ISO shape. */
  readonly dateIso: string;
  /** Competition round number. */
  readonly round: number;
  /** Home club. */
  readonly homeClub: CareerDashboardClubInput;
  /** Away club. */
  readonly awayClub: CareerDashboardClubInput;
  /** Whether the selected club is home or away. */
  readonly selectedClubSide: CareerDashboardFixtureSide;
}

/** Recent played fixture input for compact dashboard result context. */
export interface CareerDashboardRecentMatchInput {
  /** Stable fixture identifier. */
  readonly fixtureId: string;
  /** Home club. */
  readonly homeClub: CareerDashboardClubInput;
  /** Away club. */
  readonly awayClub: CareerDashboardClubInput;
  /** Home goals. */
  readonly homeGoals: number;
  /** Away goals. */
  readonly awayGoals: number;
}

/** Saved match-preparation input for the first career dashboard. */
export interface CareerDashboardPreparationInput {
  /** Whether a lineup is saved for the current match flow. */
  readonly hasSavedLineup: boolean;
  /** Whether a tactic is saved for the current match flow. */
  readonly hasSavedTactic: boolean;
  /** Optional targeted fixture. */
  readonly targetFixtureId?: string;
}

/** Compact selected-club league table input. */
export interface CareerDashboardTableRowInput {
  /** Selected-club league position. */
  readonly position: number;
  /** Played matches. */
  readonly played: number;
  /** Points. */
  readonly points: number;
  /** Goal difference. */
  readonly goalDifference: number;
}

/** Explicit source data needed to build a career dashboard view. */
export interface BuildCareerDashboardViewInput {
  /** Stable save identifier. */
  readonly saveId: string;
  /** Optional persisted career world seed. */
  readonly worldSeed?: string;
  /** Optional generated-world algorithm version. */
  readonly generatorVersion?: number;
  /** Current in-game date in display-ready ISO shape. */
  readonly currentDateIso: string;
  /** Current season identifier. */
  readonly currentSeasonId: string;
  /** Selected club summary. */
  readonly selectedClub: CareerDashboardClubInput & { readonly rosterSize: number };
  /** Next selected-club fixture when one exists. */
  readonly nextFixture?: CareerDashboardFixtureInput;
  /** Saved match-preparation status. */
  readonly preparation?: CareerDashboardPreparationInput;
  /** Selected-club condition rows included in the compact summary. */
  readonly playerConditions: readonly CareerDashboardPlayerConditionInput[];
  /** Selected-club compact table row when computable. */
  readonly tableRow?: CareerDashboardTableRowInput;
  /** Last selected-club result when available. */
  readonly recentMatch?: CareerDashboardRecentMatchInput;
  /** Fitness threshold used to count low-condition players. */
  readonly lowFitnessThreshold?: number;
}

const DASHBOARD_BLOCKER_ORDER: readonly CareerDashboardBlockerKey[] = [
  "missing_saved_lineup",
  "missing_saved_tactic",
  "no_next_fixture",
  "save_not_found",
  "invalid_career_state",
];

/**
 * Builds the structured first post-load career dashboard view.
 *
 * The function is pure: callers provide already-loaded career facts and the
 * builder maps them into UI-safe status keys, IDs, and numeric values. It does
 * not read saves, localize prose, simulate fixtures, or mutate input objects.
 */
export function buildCareerDashboardView(input: BuildCareerDashboardViewInput): CareerDashboardView {
  const preparation = input.preparation ?? { hasSavedLineup: false, hasSavedTactic: false };
  const preparationBlockers = [
    ...(preparation.hasSavedLineup ? [] : ["missing_saved_lineup" as const]),
    ...(preparation.hasSavedTactic ? [] : ["missing_saved_tactic" as const]),
  ];
  const blockerKeys = sortDashboardBlockerKeys([
    ...preparationBlockers,
    ...(input.nextFixture === undefined ? ["no_next_fixture" as const] : []),
  ]);

  return {
    screenKey: "career.dashboard",
    context: buildContextView(input),
    selectedClub: {
      clubId: input.selectedClub.clubId,
      name: input.selectedClub.name,
      rosterSize: input.selectedClub.rosterSize,
    },
    nextFixture: buildNextFixtureView(input.nextFixture),
    preparation: {
      lineupStatus: preparation.hasSavedLineup ? "available" : "missing",
      tacticStatus: preparation.hasSavedTactic ? "available" : "missing",
      ...(preparation.targetFixtureId === undefined ? {} : { targetFixtureId: preparation.targetFixtureId }),
      blockerKeys: sortDashboardBlockerKeys(preparationBlockers),
    },
    conditionSummary: buildConditionSummary(input.playerConditions, input.lowFitnessThreshold ?? 70),
    tableContext:
      input.tableRow === undefined
        ? { status: "unknown" }
        : {
            status: "available",
            position: input.tableRow.position,
            played: input.tableRow.played,
            points: input.tableRow.points,
            goalDifference: input.tableRow.goalDifference,
          },
    recentMatch: buildRecentMatchView(input.recentMatch),
    alertKeys: blockerKeys,
    actions: buildDashboardActions(blockerKeys),
  };
}

function buildContextView(input: BuildCareerDashboardViewInput): CareerDashboardView["context"] {
  return {
    saveId: input.saveId,
    ...(input.worldSeed === undefined ? {} : { worldSeed: input.worldSeed }),
    ...(input.generatorVersion === undefined ? {} : { generatorVersion: input.generatorVersion }),
    currentDateIso: input.currentDateIso,
    currentSeasonId: input.currentSeasonId,
  };
}

function buildNextFixtureView(fixture: CareerDashboardFixtureInput | undefined): CareerDashboardView["nextFixture"] {
  if (fixture === undefined) {
    return { status: "none" };
  }

  return {
    status: "available",
    fixtureId: fixture.fixtureId,
    dateIso: fixture.dateIso,
    round: fixture.round,
    homeClubId: fixture.homeClub.clubId,
    homeClubName: fixture.homeClub.name,
    awayClubId: fixture.awayClub.clubId,
    awayClubName: fixture.awayClub.name,
    selectedClubSide: fixture.selectedClubSide,
  };
}

function buildConditionSummary(
  playerConditions: readonly CareerDashboardPlayerConditionInput[],
  lowFitnessThreshold: number,
): CareerDashboardView["conditionSummary"] {
  if (playerConditions.length === 0) {
    return {
      playerCount: 0,
      lowestFitness: 0,
      averageFitness: 0,
      lowFitnessPlayerCount: 0,
    };
  }

  const fitnessValues = playerConditions.map((player) => player.fitness);
  const totalFitness = fitnessValues.reduce((sum, fitness) => sum + fitness, 0);
  const averageFitness = Number((totalFitness / fitnessValues.length).toFixed(2));

  return {
    playerCount: playerConditions.length,
    lowestFitness: Math.min(...fitnessValues),
    averageFitness,
    lowFitnessPlayerCount: fitnessValues.filter((fitness) => fitness < lowFitnessThreshold).length,
  };
}

function buildRecentMatchView(recentMatch: CareerDashboardRecentMatchInput | undefined): CareerDashboardView["recentMatch"] {
  if (recentMatch === undefined) {
    return { status: "none" };
  }

  return {
    status: "available",
    fixtureId: recentMatch.fixtureId,
    homeClubId: recentMatch.homeClub.clubId,
    homeClubName: recentMatch.homeClub.name,
    awayClubId: recentMatch.awayClub.clubId,
    awayClubName: recentMatch.awayClub.name,
    homeGoals: recentMatch.homeGoals,
    awayGoals: recentMatch.awayGoals,
  };
}

function buildDashboardActions(blockerKeys: readonly CareerDashboardBlockerKey[]): readonly CareerDashboardActionAvailability[] {
  const advanceBlockers = blockerKeys.filter((key) => key !== "save_not_found" && key !== "invalid_career_state");
  const canPrepareMatch = blockerKeys.includes("missing_saved_lineup") || blockerKeys.includes("missing_saved_tactic");

  return [
    action("prepare_match", canPrepareMatch ? "available" : "unavailable", []),
    action("advance_next_fixture", advanceBlockers.length === 0 ? "available" : "blocked", advanceBlockers),
  ];
}

function action(
  actionId: CareerDashboardActionId,
  status: CareerDashboardActionAvailabilityStatus,
  blockerKeys: readonly CareerDashboardBlockerKey[],
): CareerDashboardActionAvailability {
  return careerDashboardActionAvailability({
    actionId,
    status,
    blockerKeys,
  });
}

function sortDashboardBlockerKeys(blockerKeys: readonly CareerDashboardBlockerKey[]): readonly CareerDashboardBlockerKey[] {
  const uniqueKeys = new Set(blockerKeys);
  return DASHBOARD_BLOCKER_ORDER.filter((key) => uniqueKeys.has(key));
}
