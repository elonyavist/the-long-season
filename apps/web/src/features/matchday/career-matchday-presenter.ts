import type {
  CareerMatchdayPhaseActionView,
  CareerMatchdayPhaseEventView,
  CareerMatchdayPhaseView,
} from "@game/ui";

const MATCHDAY_PHASES = ["pre_match", "first_half", "half_time", "second_half", "full_time"] as const;

const GOAL_EVENT_KINDS = new Set(["goal"]);
const PENALTY_EVENT_KINDS = new Set(["penalty", "penalty_goal", "penalty_miss", "penalty_save"]);
const CARD_EVENT_KINDS = new Set(["yellow_card", "red_card", "second_yellow"]);
const INJURY_EVENT_KINDS = new Set(["injury"]);
const SUBSTITUTION_EVENT_KINDS = new Set(["substitution"]);

/** Five-state matchday phase shown as a passive visual indicator. */
export type MatchdayPresenterPhase = (typeof MATCHDAY_PHASES)[number];

/** Visual state for one matchday phase marker. */
export type MatchdayPhaseIndicatorStatus = "complete" | "current" | "upcoming";

/** Football-first event priority used by the matchday screen. */
export type MatchdayEventVisualPriority = "goal" | "high" | "secondary" | "detail";

/** Stable event lane for the matchday screen. */
export type MatchdayEventLane = "tabellino" | "live_feed";

/** Passive phase marker for the compact matchday flow bar. */
export interface MatchdayPhaseIndicatorView {
  /** Stable phase identifier. */
  readonly phase: MatchdayPresenterPhase;
  /** Existing i18n label key. */
  readonly labelKey: string;
  /** Visual progress state; renderers must not turn this into navigation. */
  readonly status: MatchdayPhaseIndicatorStatus;
}

/** Compact scoreboard facts shared by all live matchday layouts. */
export interface MatchdayScoreHeaderView {
  /** Home club name. */
  readonly homeClubName: string;
  /** Away club name. */
  readonly awayClubName: string;
  /** Home goals at the current phase. */
  readonly homeGoals: number;
  /** Away goals at the current phase. */
  readonly awayGoals: number;
  /** Current match phase. */
  readonly phase: CareerMatchdayPhaseView["phase"];
  /** Existing i18n label key for the current phase. */
  readonly phaseLabelKey: string;
  /** Current simulated minute. */
  readonly minute: number;
  /** Fixture round number. */
  readonly round: number;
  /** Selected-club score state from the shared read model. */
  readonly selectedClubScoreState: CareerMatchdayPhaseView["scoreboard"]["selectedClubScoreState"];
}

/** One event enriched with screen-only priority and lane metadata. */
export interface MatchdayPresentedEventView {
  /** Original structured event from the shared read model. */
  readonly event: CareerMatchdayPhaseEventView;
  /** Visual hierarchy for rendering. */
  readonly visualPriority: MatchdayEventVisualPriority;
  /** Screen lane where this fact belongs. */
  readonly lane: MatchdayEventLane;
  /** Whether this event deserves tabellino prominence. */
  readonly isHeadline: boolean;
}

/** Grouped event facts for a live phase or full-time review. */
export interface MatchdayEventGroupsView {
  /** Football tabellino facts: goals first, then real high/secondary match facts. */
  readonly tabellino: readonly MatchdayPresentedEventView[];
  /** Live-detail facts such as misses, saves, blocks, and errors. */
  readonly liveFeed: readonly MatchdayPresentedEventView[];
  /** Convenience flag for empty-state rendering. */
  readonly hasTabellino: boolean;
  /** Convenience flag for empty-state rendering. */
  readonly hasLiveFeed: boolean;
}

/** Complete matchday presentation contract consumed by React screens. */
export interface CareerMatchdayPresentationView {
  /** Compact score header for the active phase. */
  readonly scoreHeader: MatchdayScoreHeaderView;
  /** Passive visual phase markers. */
  readonly phaseIndicators: readonly MatchdayPhaseIndicatorView[];
  /** Main command for the current phase, if one exists. */
  readonly primaryAction?: CareerMatchdayPhaseActionView;
  /** Prioritized and grouped event facts. */
  readonly eventGroups: MatchdayEventGroupsView;
}

/**
 * Builds the screen-only matchday presentation contract from the shared phase
 * read model. The function does not create prose: it only ranks and groups
 * existing structured facts for React renderers.
 */
export function buildCareerMatchdayPresentationView(
  phaseView: CareerMatchdayPhaseView,
): CareerMatchdayPresentationView {
  const primaryAction = selectMatchdayPrimaryAction(phaseView);

  return {
    scoreHeader: buildMatchdayScoreHeader(phaseView),
    phaseIndicators: buildMatchdayPhaseIndicators(phaseView.phase),
    ...(primaryAction === undefined ? {} : { primaryAction }),
    eventGroups: buildMatchdayEventGroups(phaseView.timelineEvents),
  };
}

/**
 * Builds compact scoreboard facts without formatting text for a specific
 * language. Rendering components own typography and localization.
 */
export function buildMatchdayScoreHeader(phaseView: CareerMatchdayPhaseView): MatchdayScoreHeaderView {
  return {
    homeClubName: phaseView.fixture.homeClub.name,
    awayClubName: phaseView.fixture.awayClub.name,
    homeGoals: phaseView.scoreboard.homeGoals,
    awayGoals: phaseView.scoreboard.awayGoals,
    phase: phaseView.phase,
    phaseLabelKey: phaseView.periodLabelKey,
    minute: phaseView.currentMinute,
    round: phaseView.fixture.round,
    selectedClubScoreState: phaseView.scoreboard.selectedClubScoreState,
  };
}

/**
 * Builds passive visual markers for the five v1 matchday phases. These facts
 * are intentionally not actions; the manager advances with the primary command.
 */
export function buildMatchdayPhaseIndicators(
  activePhase: CareerMatchdayPhaseView["phase"],
): readonly MatchdayPhaseIndicatorView[] {
  const activeIndex = MATCHDAY_PHASES.findIndex((phase) => phase === activePhase);

  return MATCHDAY_PHASES.map((phase, index) => ({
    phase,
    labelKey: `career.matchday.phase.${phase}`,
    status: phaseIndicatorStatus(index, activeIndex),
  }));
}

/**
 * Selects the command that should be visually dominant for the active matchday
 * phase, preferring an explicit next action when the read model provides it.
 */
export function selectMatchdayPrimaryAction(
  phaseView: Pick<CareerMatchdayPhaseView, "actions" | "nextActionId">,
): CareerMatchdayPhaseActionView | undefined {
  const nextAction = phaseView.nextActionId === undefined
    ? undefined
    : phaseView.actions.find((action) => action.actionId === phaseView.nextActionId && action.status !== "unavailable");

  return nextAction
    ?? phaseView.actions.find((action) => action.status === "available")
    ?? phaseView.actions.find((action) => action.status === "blocked");
}

/**
 * Groups structured match events into a prominent tabellino lane and a quieter
 * live-feed lane. No unavailable event kinds are invented here.
 */
export function buildMatchdayEventGroups(
  events: readonly CareerMatchdayPhaseEventView[],
): MatchdayEventGroupsView {
  const presentedEvents = events.map(presentMatchdayEvent);
  const tabellino = presentedEvents
    .filter((event) => event.lane === "tabellino")
    .toSorted(compareTabellinoEvents);
  const liveFeed = presentedEvents
    .filter((event) => event.lane === "live_feed")
    .toSorted(compareChronologicalEvents);

  return {
    tabellino,
    liveFeed,
    hasTabellino: tabellino.length > 0,
    hasLiveFeed: liveFeed.length > 0,
  };
}

/**
 * Classifies a single structured event for football-first rendering. Goals are
 * the strongest visual priority; misses, saves, blocks, and errors remain live
 * detail unless the shared read model marks them as major.
 */
export function presentMatchdayEvent(event: CareerMatchdayPhaseEventView): MatchdayPresentedEventView {
  if (GOAL_EVENT_KINDS.has(event.kind)) {
    return presentedEvent(event, "goal", "tabellino", true);
  }

  if (PENALTY_EVENT_KINDS.has(event.kind)) {
    return presentedEvent(event, "high", "tabellino", true);
  }

  if (CARD_EVENT_KINDS.has(event.kind) || INJURY_EVENT_KINDS.has(event.kind) || SUBSTITUTION_EVENT_KINDS.has(event.kind)) {
    return presentedEvent(event, "secondary", "tabellino", false);
  }

  if (event.cardPriority === "major") {
    return presentedEvent(event, "secondary", "tabellino", false);
  }

  return presentedEvent(event, "detail", "live_feed", false);
}

function presentedEvent(
  event: CareerMatchdayPhaseEventView,
  visualPriority: MatchdayEventVisualPriority,
  lane: MatchdayEventLane,
  isHeadline: boolean,
): MatchdayPresentedEventView {
  return {
    event,
    visualPriority,
    lane,
    isHeadline,
  };
}

function phaseIndicatorStatus(index: number, activeIndex: number): MatchdayPhaseIndicatorStatus {
  if (activeIndex < 0) {
    return "complete";
  }

  if (index < activeIndex) {
    return "complete";
  }

  if (index === activeIndex) {
    return "current";
  }

  return "upcoming";
}

function compareTabellinoEvents(first: MatchdayPresentedEventView, second: MatchdayPresentedEventView): number {
  return eventVisualRank(first.visualPriority) - eventVisualRank(second.visualPriority)
    || compareChronologicalEvents(first, second);
}

function compareChronologicalEvents(first: MatchdayPresentedEventView, second: MatchdayPresentedEventView): number {
  return first.event.minute - second.event.minute
    || first.event.sequence - second.event.sequence
    || first.event.eventId.localeCompare(second.event.eventId);
}

function eventVisualRank(priority: MatchdayEventVisualPriority): number {
  switch (priority) {
    case "goal":
      return 0;
    case "high":
      return 1;
    case "secondary":
      return 2;
    case "detail":
      return 3;
  }
}
