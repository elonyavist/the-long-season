import type { CareerDashboardActionAvailability, CareerDashboardBlockerKey } from "./career-dashboard-actions.ts";

/** Stable status key for dashboard sections that may be unavailable. */
export type CareerDashboardAvailabilityStatus = "available" | "missing" | "none" | "unknown";

/** Stable side key for a selected club in a fixture. */
export type CareerDashboardFixtureSide = "home" | "away";

/** Save and world context shown at the top of the career dashboard. */
export interface CareerDashboardContextView {
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
}

/** Selected club summary for the loaded career save. */
export interface CareerDashboardSelectedClubView {
  /** Stable club identifier. */
  readonly clubId: string;
  /** Existing club display name, not a translated label. */
  readonly name: string;
  /** Number of senior players currently attached to the club. */
  readonly rosterSize: number;
}

/** Compact next-fixture data for the selected club. */
export interface CareerDashboardNextFixtureView {
  /** Availability status for next selected-club fixture data. */
  readonly status: "available" | "none";
  /** Stable fixture identifier when a fixture exists. */
  readonly fixtureId?: string;
  /** Fixture date in display-ready ISO shape. */
  readonly dateIso?: string;
  /** Competition round number when available. */
  readonly round?: number;
  /** Home club identifier when a fixture exists. */
  readonly homeClubId?: string;
  /** Home club display name when a fixture exists. */
  readonly homeClubName?: string;
  /** Away club identifier when a fixture exists. */
  readonly awayClubId?: string;
  /** Away club display name when a fixture exists. */
  readonly awayClubName?: string;
  /** Whether the selected club plays at home or away. */
  readonly selectedClubSide?: CareerDashboardFixtureSide;
}

/** Saved preparation status used by the matchday hub. */
export interface CareerDashboardPreparationView {
  /** Whether a lineup is saved for the next match flow. */
  readonly lineupStatus: CareerDashboardAvailabilityStatus;
  /** Whether a tactic is saved for the next match flow. */
  readonly tacticStatus: CareerDashboardAvailabilityStatus;
  /** Optional fixture targeted by saved preparation. */
  readonly targetFixtureId?: string;
  /** Blockers caused by missing preparation. */
  readonly blockerKeys: readonly CareerDashboardBlockerKey[];
}

/** Compact selected-club condition summary for first-screen readiness. */
export interface CareerDashboardConditionSummaryView {
  /** Number of selected-club senior players included in the summary. */
  readonly playerCount: number;
  /** Lowest fitness value among summarized players. */
  readonly lowestFitness: number;
  /** Average fitness value among summarized players. */
  readonly averageFitness: number;
  /** Count of players below the low-fitness threshold chosen by the builder. */
  readonly lowFitnessPlayerCount: number;
}

/** Compact table row for the selected club. */
export interface CareerDashboardTableContextView {
  /** Whether table context could be computed. */
  readonly status: CareerDashboardAvailabilityStatus;
  /** Selected-club league position when available. */
  readonly position?: number;
  /** Played matches when available. */
  readonly played?: number;
  /** Points when available. */
  readonly points?: number;
  /** Goal difference when available. */
  readonly goalDifference?: number;
}

/** Last selected-club result when a played fixture exists. */
export interface CareerDashboardRecentMatchView {
  /** Whether recent-match context exists. */
  readonly status: "available" | "none";
  /** Stable fixture identifier when a recent match exists. */
  readonly fixtureId?: string;
  /** Home club identifier when a recent match exists. */
  readonly homeClubId?: string;
  /** Home club display name when a recent match exists. */
  readonly homeClubName?: string;
  /** Away club identifier when a recent match exists. */
  readonly awayClubId?: string;
  /** Away club display name when a recent match exists. */
  readonly awayClubName?: string;
  /** Home goals when a recent match exists. */
  readonly homeGoals?: number;
  /** Away goals when a recent match exists. */
  readonly awayGoals?: number;
}

/** Structured first post-load career dashboard view. */
export interface CareerDashboardView {
  /** Stable screen key for routing and tests. */
  readonly screenKey: "career.dashboard";
  /** Save, world, date, and season context. */
  readonly context: CareerDashboardContextView;
  /** Selected club summary. */
  readonly selectedClub: CareerDashboardSelectedClubView;
  /** Next selected-club fixture context. */
  readonly nextFixture: CareerDashboardNextFixtureView;
  /** Saved lineup/tactic readiness. */
  readonly preparation: CareerDashboardPreparationView;
  /** Compact selected-club condition summary. */
  readonly conditionSummary: CareerDashboardConditionSummaryView;
  /** Compact table context for the selected club. */
  readonly tableContext: CareerDashboardTableContextView;
  /** Last selected-club result context. */
  readonly recentMatch: CareerDashboardRecentMatchView;
  /** Dashboard alert and blocker keys. */
  readonly alertKeys: readonly CareerDashboardBlockerKey[];
  /** Manager actions available from this screen. */
  readonly actions: readonly CareerDashboardActionAvailability[];
}
