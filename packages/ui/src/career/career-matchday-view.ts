/** Stable side key for the selected club in a matchday fixture. */
export type CareerMatchdayFixtureSide = "home" | "away";

/** Stable state for the web matchday surface. */
export type CareerMatchdayStatus = "blocked" | "ready_to_play" | "played" | "unavailable";

/** Stable blockers that explain why matchday cannot be played. */
export type CareerMatchdayBlockerKey =
  | "missing_fixture"
  | "missing_saved_lineup"
  | "missing_saved_tactic"
  | "missing_match_report";

/** Stable matchday actions. Actual execution belongs to app adapters. */
export type CareerMatchdayActionId = "prepare_match" | "play_fixture" | "back_to_dashboard";

/** Availability status for one matchday action. */
export type CareerMatchdayActionStatus = "available" | "blocked" | "unavailable";

/** Club identity used by the matchday read model without importing content. */
export interface CareerMatchdayClubInput {
  /** Stable club identifier. */
  readonly clubId: string;
  /** Display name already stored in generated content or save data. */
  readonly name: string;
}

/** Fixture facts required to render matchday context. */
export interface CareerMatchdayFixtureInput {
  /** Stable fixture identifier. */
  readonly fixtureId: string;
  /** Fixture date in display-ready ISO shape. */
  readonly dateIso: string;
  /** Competition round number. */
  readonly round: number;
  /** Home club. */
  readonly homeClub: CareerMatchdayClubInput;
  /** Away club. */
  readonly awayClub: CareerMatchdayClubInput;
  /** Whether the selected club plays home or away. */
  readonly selectedClubSide: CareerMatchdayFixtureSide;
}

/** Saved preparation facts for the target fixture. */
export interface CareerMatchdayPreparationInput {
  /** Whether the manager has saved a lineup for this fixture. */
  readonly hasSavedLineup: boolean;
  /** Whether the manager has saved a tactic for this fixture. */
  readonly hasSavedTactic: boolean;
  /** Fixture targeted by saved preparation when known. */
  readonly targetFixtureId?: string;
}

/** One structured event shown in the post-match report. */
export interface CareerMatchdayEventInput {
  /** Stable event identifier or adapter-provided deterministic key. */
  readonly eventId: string;
  /** Minute in which the event happened. */
  readonly minute: number;
  /** Optional within-minute sequence for deterministic ordering. */
  readonly sequence?: number;
  /** Stable event kind such as `goal`, `miss`, `save`, or `block`. */
  readonly kind: string;
  /** Club attached to the event. */
  readonly club: CareerMatchdayClubInput;
  /** Primary player display name when the engine provides one. */
  readonly playerName?: string;
  /** Assist or secondary player display name when the engine provides one. */
  readonly secondaryPlayerName?: string;
  /** Stable shot/chance detail keys when provided by the engine. */
  readonly detailKeys?: readonly string[];
}

/** One player row in the compact matchday stat table. */
export interface CareerMatchdayPlayerStatInput {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Existing generated player display name. */
  readonly playerName: string;
  /** Club shown for the stat row. */
  readonly club: CareerMatchdayClubInput;
  /** Goals credited by the durable match report. */
  readonly goals: number;
  /** Assists credited by the durable match report. */
  readonly assists: number;
  /** Shots credited by the durable match report. */
  readonly shots: number;
  /** Shots on target credited by the durable match report. */
  readonly shotsOnTarget: number;
  /** Saves credited by the durable match report. */
  readonly saves: number;
}

/** Condition delta for one selected-club player after the fixture. */
export interface CareerMatchdayConditionChangeInput {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Existing generated player display name. */
  readonly playerName: string;
  /** Fitness before match consequences. */
  readonly before: number;
  /** Fitness after match consequences. */
  readonly after: number;
  /** Signed fitness delta. */
  readonly delta: number;
}

/** Form and morale delta for one selected-club player after the fixture. */
export interface CareerMatchdayPlayerStateChangeInput {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Existing generated player display name. */
  readonly playerName: string;
  /** Form value before post-match consequences. */
  readonly formBefore: number;
  /** Form value after post-match consequences. */
  readonly formAfter: number;
  /** Signed form delta. */
  readonly formDelta: number;
  /** Morale value before post-match consequences. */
  readonly moraleBefore: number;
  /** Morale value after post-match consequences. */
  readonly moraleAfter: number;
  /** Signed morale delta. */
  readonly moraleDelta: number;
  /** Stable reason keys supplied by the engine or adapter. */
  readonly reasonKeys: readonly string[];
}

/** Result facts shown once the fixture has been played. */
export interface CareerMatchdayResultInput {
  /** Final home goals. */
  readonly homeGoals: number;
  /** Final away goals. */
  readonly awayGoals: number;
  /** Ordered or sortable event facts. */
  readonly events: readonly CareerMatchdayEventInput[];
  /** Basic player stat rows. */
  readonly playerStats: readonly CareerMatchdayPlayerStatInput[];
  /** Selected-club condition changes. */
  readonly conditionChanges: readonly CareerMatchdayConditionChangeInput[];
  /** Selected-club form and morale changes. */
  readonly playerStateChanges: readonly CareerMatchdayPlayerStateChangeInput[];
}

/** Next stop facts after the matchday action completes. */
export interface CareerMatchdayNextStopInput {
  /** Stable stop reason from the career continuation layer. */
  readonly reason: string;
  /** Stop date in display-ready ISO shape. */
  readonly dateIso: string;
  /** Optional action that can resolve or open that stop. */
  readonly actionId?: string;
}

/** Explicit input required to build a matchday view. */
export interface BuildCareerMatchdayViewInput {
  /** Stable save identifier. */
  readonly saveId: string;
  /** Current in-game date in display-ready ISO shape. */
  readonly currentDateIso: string;
  /** Selected club identity. */
  readonly selectedClub: CareerMatchdayClubInput;
  /** Fixture being inspected or played. */
  readonly fixture?: CareerMatchdayFixtureInput;
  /** Saved preparation facts for this fixture. */
  readonly preparation?: CareerMatchdayPreparationInput;
  /** Result facts when the fixture has already been played in this flow. */
  readonly result?: CareerMatchdayResultInput;
  /** True when the adapter knows the fixture is already played but cannot supply a report. */
  readonly fixtureAlreadyPlayed?: boolean;
  /** Next stop facts after a played match. */
  readonly nextStop?: CareerMatchdayNextStopInput;
}

/** UI-facing action availability for matchday. */
export interface CareerMatchdayActionView {
  /** Stable action identifier. */
  readonly actionId: CareerMatchdayActionId;
  /** Whether the action can currently run. */
  readonly status: CareerMatchdayActionStatus;
  /** Stable blockers explaining a blocked action. */
  readonly blockerKeys: readonly CareerMatchdayBlockerKey[];
  /** Translation key for renderers. */
  readonly labelKey: string;
}

/** Fixture facts after availability normalization. */
export interface CareerMatchdayFixtureView {
  /** Whether fixture facts exist. */
  readonly status: "available" | "none";
  /** Stable fixture identifier when available. */
  readonly fixtureId?: string;
  /** Fixture date in display-ready ISO shape when available. */
  readonly dateIso?: string;
  /** Competition round number when available. */
  readonly round?: number;
  /** Home club ID when available. */
  readonly homeClubId?: string;
  /** Home club display name when available. */
  readonly homeClubName?: string;
  /** Away club ID when available. */
  readonly awayClubId?: string;
  /** Away club display name when available. */
  readonly awayClubName?: string;
  /** Whether the selected club is home or away when available. */
  readonly selectedClubSide?: CareerMatchdayFixtureSide;
}

/** Played score facts. */
export interface CareerMatchdayScoreView {
  /** Whether score facts exist. */
  readonly status: "available" | "none";
  /** Final home goals. */
  readonly homeGoals?: number;
  /** Final away goals. */
  readonly awayGoals?: number;
  /** Selected-club result key. */
  readonly selectedClubResult?: "win" | "draw" | "loss";
}

/** Ordered event row for renderers. */
export interface CareerMatchdayEventView extends CareerMatchdayEventInput {
  /** Normalized within-minute sequence. */
  readonly sequence: number;
}

/** Basic player stat row for renderers. */
export interface CareerMatchdayPlayerStatView extends CareerMatchdayPlayerStatInput {
  /** Derived impact score used only for deterministic row ordering. */
  readonly impactScore: number;
}

/** Next stop state after playing a fixture. */
export interface CareerMatchdayNextStopView {
  /** Whether next stop facts exist. */
  readonly status: "available" | "none";
  /** Stable stop reason when available. */
  readonly reason?: string;
  /** Stop date in display-ready ISO shape when available. */
  readonly dateIso?: string;
  /** Optional action ID when available. */
  readonly actionId?: string;
}

/** Structured web/CLI-ready matchday view. */
export interface CareerMatchdayView {
  /** Stable view key for routing and tests. */
  readonly viewKey: "career.matchday";
  /** Top-level matchday status. */
  readonly status: CareerMatchdayStatus;
  /** Stable save identifier. */
  readonly saveId: string;
  /** Current in-game date in display-ready ISO shape. */
  readonly currentDateIso: string;
  /** Selected club identity. */
  readonly selectedClub: CareerMatchdayClubInput;
  /** Fixture context. */
  readonly fixture: CareerMatchdayFixtureView;
  /** Blockers that prevent play. */
  readonly blockerKeys: readonly CareerMatchdayBlockerKey[];
  /** Available manager actions for this view. */
  readonly actions: readonly CareerMatchdayActionView[];
  /** Final score facts. */
  readonly score: CareerMatchdayScoreView;
  /** Ordered key events. */
  readonly events: readonly CareerMatchdayEventView[];
  /** Ordered player stats. */
  readonly playerStats: readonly CareerMatchdayPlayerStatView[];
  /** Selected-club condition changes in caller order. */
  readonly conditionChanges: readonly CareerMatchdayConditionChangeInput[];
  /** Selected-club form/morale changes in caller order. */
  readonly playerStateChanges: readonly CareerMatchdayPlayerStateChangeInput[];
  /** Next attention stop after playing. */
  readonly nextStop: CareerMatchdayNextStopView;
}

/**
 * Builds a framework-free matchday view from explicit career facts.
 *
 * The builder does not simulate matches, localize labels, choose players,
 * inspect saves, or invent missing match reports. App adapters must supply
 * coherent engine facts before a played state can be shown.
 */
export function buildCareerMatchdayView(input: BuildCareerMatchdayViewInput): CareerMatchdayView {
  const fixture = buildFixtureView(input.fixture);
  const blockerKeys = buildBlockerKeys(input);
  const status = buildMatchdayStatus(input, blockerKeys);
  const score = buildScoreView(input);

  return {
    viewKey: "career.matchday",
    status,
    saveId: input.saveId,
    currentDateIso: input.currentDateIso,
    selectedClub: input.selectedClub,
    fixture,
    blockerKeys,
    actions: buildActions(status, blockerKeys),
    score,
    events: orderEvents(input.result?.events ?? []),
    playerStats: orderPlayerStats(input.result?.playerStats ?? []),
    conditionChanges: input.result?.conditionChanges ?? [],
    playerStateChanges: input.result?.playerStateChanges ?? [],
    nextStop: buildNextStopView(input.nextStop),
  };
}

function buildFixtureView(fixture: CareerMatchdayFixtureInput | undefined): CareerMatchdayFixtureView {
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

function buildBlockerKeys(input: BuildCareerMatchdayViewInput): readonly CareerMatchdayBlockerKey[] {
  if (input.fixture === undefined) {
    return ["missing_fixture"];
  }

  const preparation = input.preparation ?? { hasSavedLineup: false, hasSavedTactic: false };
  const preparationBlockers: CareerMatchdayBlockerKey[] = [
    ...(preparation.hasSavedLineup ? [] : ["missing_saved_lineup" as const]),
    ...(preparation.hasSavedTactic ? [] : ["missing_saved_tactic" as const]),
  ];

  if (input.result === undefined && input.fixtureAlreadyPlayed === true) {
    return [...preparationBlockers, "missing_match_report"];
  }

  return preparationBlockers;
}

function buildMatchdayStatus(
  input: BuildCareerMatchdayViewInput,
  blockerKeys: readonly CareerMatchdayBlockerKey[],
): CareerMatchdayStatus {
  if (input.result !== undefined) {
    return "played";
  }

  if (input.fixture === undefined || blockerKeys.includes("missing_match_report")) {
    return "unavailable";
  }

  return blockerKeys.length === 0 ? "ready_to_play" : "blocked";
}

function buildActions(
  status: CareerMatchdayStatus,
  blockerKeys: readonly CareerMatchdayBlockerKey[],
): readonly CareerMatchdayActionView[] {
  return [
    action("prepare_match", status === "blocked" ? "available" : "unavailable", []),
    action("play_fixture", status === "ready_to_play" ? "available" : "blocked", blockerKeys),
    action("back_to_dashboard", "available", []),
  ];
}

function action(
  actionId: CareerMatchdayActionId,
  status: CareerMatchdayActionStatus,
  blockerKeys: readonly CareerMatchdayBlockerKey[],
): CareerMatchdayActionView {
  return {
    actionId,
    status,
    blockerKeys,
    labelKey: `career.matchday.action.${actionId}`,
  };
}

function buildScoreView(input: BuildCareerMatchdayViewInput): CareerMatchdayScoreView {
  if (input.fixture === undefined || input.result === undefined) {
    return { status: "none" };
  }

  return {
    status: "available",
    homeGoals: input.result.homeGoals,
    awayGoals: input.result.awayGoals,
    selectedClubResult: selectedClubResult(input.fixture.selectedClubSide, input.result.homeGoals, input.result.awayGoals),
  };
}

function selectedClubResult(
  selectedClubSide: CareerMatchdayFixtureSide,
  homeGoals: number,
  awayGoals: number,
): "win" | "draw" | "loss" {
  if (homeGoals === awayGoals) {
    return "draw";
  }

  const selectedClubGoals = selectedClubSide === "home" ? homeGoals : awayGoals;
  const opponentGoals = selectedClubSide === "home" ? awayGoals : homeGoals;

  return selectedClubGoals > opponentGoals ? "win" : "loss";
}

function orderEvents(events: readonly CareerMatchdayEventInput[]): readonly CareerMatchdayEventView[] {
  return events
    .map((event, index) => ({
      ...event,
      sequence: event.sequence ?? index,
    }))
    .toSorted(compareEvents);
}

function compareEvents(left: CareerMatchdayEventView, right: CareerMatchdayEventView): number {
  return left.minute - right.minute
    || left.sequence - right.sequence
    || left.eventId.localeCompare(right.eventId);
}

function orderPlayerStats(
  playerStats: readonly CareerMatchdayPlayerStatInput[],
): readonly CareerMatchdayPlayerStatView[] {
  return playerStats
    .map((row) => ({
      ...row,
      impactScore: row.goals * 10 + row.assists * 6 + row.saves * 4 + row.shotsOnTarget * 2 + row.shots,
    }))
    .toSorted(comparePlayerStats);
}

function comparePlayerStats(left: CareerMatchdayPlayerStatView, right: CareerMatchdayPlayerStatView): number {
  return right.impactScore - left.impactScore
    || left.club.name.localeCompare(right.club.name)
    || left.playerName.localeCompare(right.playerName)
    || left.playerId.localeCompare(right.playerId);
}

function buildNextStopView(nextStop: CareerMatchdayNextStopInput | undefined): CareerMatchdayNextStopView {
  if (nextStop === undefined) {
    return { status: "none" };
  }

  return {
    status: "available",
    reason: nextStop.reason,
    dateIso: nextStop.dateIso,
    ...(nextStop.actionId === undefined ? {} : { actionId: nextStop.actionId }),
  };
}
