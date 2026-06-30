import type { MatchPhase } from "@game/domain";

import type {
  CareerMatchdayClubInput,
  CareerMatchdayConditionChangeInput,
  CareerMatchdayFixtureInput,
  CareerMatchdayPlayerStateChangeInput,
} from "./career-matchday-view.ts";

/** Phase-aware matchday action IDs. Execution belongs to app adapters. */
export type CareerMatchdayPhaseActionId =
  | "prepare_match"
  | "start_first_half"
  | "continue_to_half_time"
  | "apply_half_time_substitutions"
  | "start_second_half"
  | "continue_to_full_time"
  | "back_to_dashboard";

/** Availability status for one phase-aware action. */
export type CareerMatchdayPhaseActionStatus = "available" | "blocked" | "unavailable";

/** Player status shown in the match-centre player table. */
export type CareerMatchdayPlayerPhaseStatus = "on_pitch" | "bench" | "substituted_on" | "substituted_off";

/** Matchday phase state used by presentation layers. */
export type CareerMatchdayPhaseViewStatus = "pre_match" | "live" | "decision" | "complete" | "future_unavailable";

/** Scoreboard facts for any phase. */
export interface CareerMatchdayPhaseScoreboardInput {
  /** Home club goals at the current phase. */
  readonly homeGoals: number;
  /** Away club goals at the current phase. */
  readonly awayGoals: number;
}

/** Timeline event fact supplied by an app adapter from engine/domain facts. */
export interface CareerMatchdayPhaseEventInput {
  /** Stable event identifier. */
  readonly eventId: string;
  /** Event minute. */
  readonly minute: number;
  /** Optional deterministic sequence inside the same minute. */
  readonly sequence?: number;
  /** Stable event kind such as `goal`, `save`, `miss`, or `block`. */
  readonly kind: string;
  /** Club associated with this event. */
  readonly club: CareerMatchdayClubInput;
  /** Primary player name when known. */
  readonly playerName?: string;
  /** Secondary player name when known. */
  readonly secondaryPlayerName?: string;
  /** Optional stable detail keys for shot/chance context. */
  readonly detailKeys?: readonly string[];
}

/** Player row for live, half-time, and full-time match-centre tables. */
export interface CareerMatchdayPhasePlayerInput {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Existing generated player display name. */
  readonly playerName: string;
  /** Club shown for this player. */
  readonly club: CareerMatchdayClubInput;
  /** Stable role key when available. */
  readonly roleKey?: string;
  /** Current rating when available. */
  readonly rating?: number;
  /** Current fitness/condition when available. */
  readonly condition?: number;
  /** Current player match status. */
  readonly status: CareerMatchdayPlayerPhaseStatus;
  /** Goals credited so far. */
  readonly goals: number;
  /** Assists credited so far. */
  readonly assists: number;
  /** Shots credited so far. */
  readonly shots: number;
  /** Shots on target credited so far. */
  readonly shotsOnTarget: number;
  /** Saves credited so far. */
  readonly saves: number;
  /** Blocks credited so far. */
  readonly blocks: number;
}

/** Half-time substitution action facts. */
export interface CareerMatchdayHalfTimeSubstitutionInput {
  /** Whether substitution decisions are currently allowed. */
  readonly canApply: boolean;
  /** Already applied substitution count. */
  readonly appliedCount: number;
  /** Maximum substitutions available in the current v1 rule context. */
  readonly maxCount: number;
  /** Stable blocker keys when applying substitutions is blocked. */
  readonly blockerKeys?: readonly string[];
}

/** Explicit input required to build a phase-aware matchday view. */
export interface BuildCareerMatchdayPhaseViewInput {
  /** Stable save identifier. */
  readonly saveId: string;
  /** Current in-game date in display-ready ISO shape. */
  readonly currentDateIso: string;
  /** Selected club identity. */
  readonly selectedClub: CareerMatchdayClubInput;
  /** Fixture being played. */
  readonly fixture: CareerMatchdayFixtureInput;
  /** Current match phase. */
  readonly phase: MatchPhase;
  /** Completed simulated minute. */
  readonly currentMinute: number;
  /** Current score. */
  readonly scoreboard: CareerMatchdayPhaseScoreboardInput;
  /** Timeline events visible at this phase. */
  readonly events: readonly CareerMatchdayPhaseEventInput[];
  /** Player rows visible at this phase. */
  readonly players: readonly CareerMatchdayPhasePlayerInput[];
  /** Half-time substitution action facts. */
  readonly halfTimeSubstitutions?: CareerMatchdayHalfTimeSubstitutionInput;
  /** Full-time-only condition changes. Ignored before full time. */
  readonly conditionChanges?: readonly CareerMatchdayConditionChangeInput[];
  /** Full-time-only form/morale changes. Ignored before full time. */
  readonly playerStateChanges?: readonly CareerMatchdayPlayerStateChangeInput[];
  /** Stable next action when known. */
  readonly nextActionId?: CareerMatchdayPhaseActionId;
}

/** UI-facing phase action. */
export interface CareerMatchdayPhaseActionView {
  /** Stable action ID. */
  readonly actionId: CareerMatchdayPhaseActionId;
  /** Whether the action can currently run. */
  readonly status: CareerMatchdayPhaseActionStatus;
  /** Translation key for renderers. */
  readonly labelKey: string;
  /** Stable blockers explaining a blocked action. */
  readonly blockerKeys: readonly string[];
}

/** Normalized scoreboard facts. */
export interface CareerMatchdayPhaseScoreboardView extends CareerMatchdayPhaseScoreboardInput {
  /** Selected-club live score state. */
  readonly selectedClubScoreState: "leading" | "drawing" | "trailing";
}

/** Timeline row with normalized ordering and label key. */
export interface CareerMatchdayPhaseEventView extends CareerMatchdayPhaseEventInput {
  /** Normalized deterministic sequence. */
  readonly sequence: number;
  /** Translation key for the event kind. */
  readonly labelKey: string;
  /** Whether this event should become a larger card in visual presentation. */
  readonly cardPriority: "major" | "normal";
}

/** Player table row with deterministic ordering support. */
export interface CareerMatchdayPhasePlayerView extends CareerMatchdayPhasePlayerInput {
  /** Deterministic ordering score for useful player-table presentation. */
  readonly impactScore: number;
}

/** Structured phase-aware matchday view. */
export interface CareerMatchdayPhaseView {
  /** Stable view key for routing and tests. */
  readonly viewKey: "career.matchday.phase";
  /** Stable save identifier. */
  readonly saveId: string;
  /** Current in-game date in display-ready ISO shape. */
  readonly currentDateIso: string;
  /** Selected club identity. */
  readonly selectedClub: CareerMatchdayClubInput;
  /** Fixture being played. */
  readonly fixture: CareerMatchdayFixtureInput;
  /** Current match phase. */
  readonly phase: MatchPhase;
  /** Phase view status. */
  readonly status: CareerMatchdayPhaseViewStatus;
  /** Translation key for the active period. */
  readonly periodLabelKey: string;
  /** Completed simulated minute. */
  readonly currentMinute: number;
  /** Scoreboard facts. */
  readonly scoreboard: CareerMatchdayPhaseScoreboardView;
  /** Ordered timeline rows. */
  readonly timelineEvents: readonly CareerMatchdayPhaseEventView[];
  /** Major event cards. */
  readonly keyEventCards: readonly CareerMatchdayPhaseEventView[];
  /** Ordered player rating/stat rows. */
  readonly playerRows: readonly CareerMatchdayPhasePlayerView[];
  /** Actions available for the current phase. */
  readonly actions: readonly CareerMatchdayPhaseActionView[];
  /** Full-time-only condition changes. */
  readonly conditionChanges: readonly CareerMatchdayConditionChangeInput[];
  /** Full-time-only form/morale changes. */
  readonly playerStateChanges: readonly CareerMatchdayPlayerStateChangeInput[];
  /** Stable next action when known. */
  readonly nextActionId?: CareerMatchdayPhaseActionId;
}

/**
 * Builds a framework-free, phase-aware matchday read model.
 *
 * Engine/adapters own match facts and ratings. This builder owns only UI facts:
 * ordering, action visibility, label keys, and hiding full-time consequences
 * until the match is actually complete.
 */
export function buildCareerMatchdayPhaseView(input: BuildCareerMatchdayPhaseViewInput): CareerMatchdayPhaseView {
  const timelineEvents = orderEvents(input.events);
  const playerRows = orderPlayers(input.players);
  const actions = buildActions(input);
  const isFullTime = input.phase === "full_time";

  return {
    viewKey: "career.matchday.phase",
    saveId: input.saveId,
    currentDateIso: input.currentDateIso,
    selectedClub: input.selectedClub,
    fixture: input.fixture,
    phase: input.phase,
    status: statusForPhase(input.phase),
    periodLabelKey: `career.matchday.phase.${input.phase}`,
    currentMinute: input.currentMinute,
    scoreboard: {
      ...input.scoreboard,
      selectedClubScoreState: selectedClubScoreState(input.fixture.selectedClubSide, input.scoreboard),
    },
    timelineEvents,
    keyEventCards: timelineEvents.filter((event) => event.cardPriority === "major"),
    playerRows,
    actions,
    conditionChanges: isFullTime ? input.conditionChanges ?? [] : [],
    playerStateChanges: isFullTime ? input.playerStateChanges ?? [] : [],
    ...(input.nextActionId === undefined ? {} : { nextActionId: input.nextActionId }),
  };
}

function statusForPhase(phase: MatchPhase): CareerMatchdayPhaseViewStatus {
  switch (phase) {
    case "pre_match":
      return "pre_match";
    case "first_half":
    case "second_half":
      return "live";
    case "half_time":
      return "decision";
    case "full_time":
      return "complete";
    case "extra_time":
    case "penalties":
      return "future_unavailable";
  }
}

function selectedClubScoreState(
  selectedClubSide: CareerMatchdayFixtureInput["selectedClubSide"],
  scoreboard: CareerMatchdayPhaseScoreboardInput,
): CareerMatchdayPhaseScoreboardView["selectedClubScoreState"] {
  const selectedGoals = selectedClubSide === "home" ? scoreboard.homeGoals : scoreboard.awayGoals;
  const opponentGoals = selectedClubSide === "home" ? scoreboard.awayGoals : scoreboard.homeGoals;

  if (selectedGoals === opponentGoals) {
    return "drawing";
  }

  return selectedGoals > opponentGoals ? "leading" : "trailing";
}

function orderEvents(events: readonly CareerMatchdayPhaseEventInput[]): readonly CareerMatchdayPhaseEventView[] {
  return events
    .map((event, index) => ({
      ...event,
      sequence: event.sequence ?? index,
      labelKey: `career.matchday.event.${event.kind}`,
      cardPriority: event.kind === "goal" ? "major" as const : "normal" as const,
    }))
    .toSorted(compareEvents);
}

function compareEvents(first: CareerMatchdayPhaseEventView, second: CareerMatchdayPhaseEventView): number {
  return first.minute - second.minute
    || first.sequence - second.sequence
    || first.eventId.localeCompare(second.eventId);
}

function orderPlayers(players: readonly CareerMatchdayPhasePlayerInput[]): readonly CareerMatchdayPhasePlayerView[] {
  return players
    .map((player) => ({
      ...player,
      impactScore: player.goals * 12
        + player.assists * 8
        + player.saves * 4
        + player.blocks * 3
        + player.shotsOnTarget * 2
        + player.shots
        + (player.rating ?? 0),
    }))
    .toSorted(comparePlayers);
}

function comparePlayers(first: CareerMatchdayPhasePlayerView, second: CareerMatchdayPhasePlayerView): number {
  return second.impactScore - first.impactScore
    || first.club.name.localeCompare(second.club.name)
    || first.playerName.localeCompare(second.playerName)
    || first.playerId.localeCompare(second.playerId);
}

function buildActions(input: BuildCareerMatchdayPhaseViewInput): readonly CareerMatchdayPhaseActionView[] {
  switch (input.phase) {
    case "pre_match":
      return [action("start_first_half", "available", [])];
    case "first_half":
      return [action("continue_to_half_time", "available", [])];
    case "half_time":
      return [action("start_second_half", "available", [])];
    case "second_half":
      return [action("continue_to_full_time", "available", [])];
    case "full_time":
      return [action("back_to_dashboard", "available", [])];
    case "extra_time":
    case "penalties":
      return [];
  }
}

function action(
  actionId: CareerMatchdayPhaseActionId,
  status: CareerMatchdayPhaseActionStatus,
  blockerKeys: readonly string[],
): CareerMatchdayPhaseActionView {
  return {
    actionId,
    status,
    labelKey: `career.matchday.action.${actionId}`,
    blockerKeys,
  };
}
