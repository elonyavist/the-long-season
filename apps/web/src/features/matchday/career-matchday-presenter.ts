import type {
  CareerMatchdayPhaseActionId,
  CareerMatchdayPhaseActionView,
  CareerMatchdayPhaseEventView,
  CareerMatchdayPhasePlayerView,
  CareerMatchdayPhaseView,
} from "@game/ui";

const MATCHDAY_PHASES = ["pre_match", "first_half", "half_time", "second_half", "full_time"] as const;

const GOAL_EVENT_KINDS = new Set(["goal"]);
const PENALTY_EVENT_KINDS = new Set(["penalty", "penalty_goal", "penalty_miss", "penalty_save"]);
const CARD_EVENT_KINDS = new Set(["yellow_card", "red_card", "second_yellow"]);
const INJURY_EVENT_KINDS = new Set(["injury"]);
const SUBSTITUTION_EVENT_KINDS = new Set(["substitution"]);
const TEAM_RESULT_REASON_KEYS = new Set([
  "result_win",
  "result_draw",
  "result_loss",
  "team_clean_sheet",
  "team_heavy_loss",
]);
const FULL_TIME_CONDITION_ATTENTION_THRESHOLD = 75;
const FULL_TIME_CONDITION_DELTA_ATTENTION = 15;
const FULL_TIME_STATE_DELTA_ATTENTION = 3;

/** Five-state matchday phase shown as a passive visual indicator. */
export type MatchdayPresenterPhase = (typeof MATCHDAY_PHASES)[number];

/** Visual state for one matchday phase marker. */
export type MatchdayPhaseIndicatorStatus = "complete" | "current" | "upcoming";

/** Football-first event priority used by the matchday screen. */
export type MatchdayEventVisualPriority = "goal" | "high" | "secondary" | "detail";

/** Stable event lane for the matchday screen. */
export type MatchdayEventLane = "tabellino" | "live_feed";

/** Manager decision exposed by the web matchday after reveal-only actions are removed. */
export type MatchdayManagerActionId = Exclude<
  CareerMatchdayPhaseActionId,
  "continue_to_half_time" | "continue_to_full_time"
>;

/** Matchday action whose invocation changes manager-owned state or navigation. */
export type MatchdayManagerActionView = Omit<CareerMatchdayPhaseActionView, "actionId"> & {
  readonly actionId: MatchdayManagerActionId;
};

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

/** Decision-grade first-half facts shown before the tactical workspace. */
export interface MatchdayHalfTimeReviewView {
  /** Decisive first-half events already classified for football-first rendering. */
  readonly decisiveEvents: readonly MatchdayPresentedEventView[];
  /** Selected-club players whose rating or condition warrants attention. */
  readonly watchList: readonly CareerMatchdayPhasePlayerView[];
  /** Selected-club players making a positive structured contribution. */
  readonly contributors: readonly CareerMatchdayPhasePlayerView[];
}

/** One selected-club player whose durable post-match state actually changed. */
export interface MatchdayFullTimeConsequenceView {
  /** Stable player identifier used to merge structured consequence facts. */
  readonly playerId: string;
  /** Existing generated player name. */
  readonly playerName: string;
  /** Fitness consequence when the value changed. */
  readonly condition?: CareerMatchdayPhaseView["conditionChanges"][number];
  /** Form or morale consequence when either value changed or has a reason. */
  readonly playerState?: CareerMatchdayPhaseView["playerStateChanges"][number];
}

/** Concise full-time facts for the selected club's final review. */
export interface MatchdayFullTimeReviewView {
  /** Existing selected-club identity for the ratings heading. */
  readonly selectedClubName: string;
  /** Prioritized structured incidents; no narrative events are added. */
  readonly events: readonly MatchdayPresentedEventView[];
  /** Final ratings for the selected club only. */
  readonly ratings: readonly CareerMatchdayPhasePlayerView[];
  /** Non-zero durable consequences merged by player. */
  readonly consequences: readonly MatchdayFullTimeConsequenceView[];
}

/** Complete matchday presentation contract consumed by React screens. */
export interface CareerMatchdayPresentationView {
  /** Compact score header for the active phase. */
  readonly scoreHeader: MatchdayScoreHeaderView;
  /** Passive visual phase markers. */
  readonly phaseIndicators: readonly MatchdayPhaseIndicatorView[];
  /** Main command for the current phase, if one exists. */
  readonly primaryAction?: MatchdayManagerActionView;
  /** Prioritized and grouped event facts. */
  readonly eventGroups: MatchdayEventGroupsView;
  /** Half-time-only facts that support a manager decision without duplicating the scoreboard. */
  readonly halfTimeReview?: MatchdayHalfTimeReviewView;
  /** Full-time-only football and durable-state review facts. */
  readonly fullTimeReview?: MatchdayFullTimeReviewView;
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
  const eventGroups = buildMatchdayEventGroups(phaseView.timelineEvents);

  return {
    scoreHeader: buildMatchdayScoreHeader(phaseView),
    phaseIndicators: buildMatchdayPhaseIndicators(phaseView.phase),
    ...(primaryAction === undefined ? {} : { primaryAction }),
    eventGroups,
    ...(phaseView.phase === "half_time"
      ? { halfTimeReview: buildMatchdayHalfTimeReviewView(phaseView, eventGroups) }
      : {}),
    ...(phaseView.phase === "full_time"
      ? { fullTimeReview: buildMatchdayFullTimeReviewView(phaseView, eventGroups) }
      : {}),
  };
}

/**
 * Selects only half-time facts that can reasonably change the manager's plan.
 * Score, minute, phase, and substitution count stay with their existing owners.
 */
export function buildMatchdayHalfTimeReviewView(
  phaseView: CareerMatchdayPhaseView,
  eventGroups: MatchdayEventGroupsView = buildMatchdayEventGroups(phaseView.timelineEvents),
): MatchdayHalfTimeReviewView {
  const selectedPlayers = phaseView.playerRows.filter((row) =>
    row.club.clubId === phaseView.selectedClub.clubId && row.status === "on_pitch"
  );
  const watchList = selectedPlayers
    .filter(needsHalfTimeAttention)
    .toSorted(compareHalfTimeAttention)
    .slice(0, 3);
  const watchedPlayerIds = new Set(watchList.map((row) => row.playerId));
  const contributors = selectedPlayers
    .filter((row) => !watchedPlayerIds.has(row.playerId) && isHalfTimeContributor(row))
    .toSorted(compareHalfTimeContribution)
    .slice(0, 3);

  return {
    decisiveEvents: eventGroups.tabellino,
    watchList,
    contributors,
  };
}

/**
 * Builds one full-time review from existing match and career consequences.
 * Opponent ratings, unchanged state, and duplicate next-action facts are not
 * part of this presentation contract.
 */
export function buildMatchdayFullTimeReviewView(
  phaseView: CareerMatchdayPhaseView,
  eventGroups: MatchdayEventGroupsView = buildMatchdayEventGroups(phaseView.timelineEvents),
): MatchdayFullTimeReviewView {
  const ratings = phaseView.playerRows
    .filter((row) => row.club.clubId === phaseView.selectedClub.clubId)
    .toSorted(compareFullTimeRatings);
  const conditionByPlayerId = new Map(
    phaseView.conditionChanges
      .filter((change) => change.delta !== 0)
      .map((change) => [change.playerId, change] as const),
  );
  const stateByPlayerId = new Map(
    phaseView.playerStateChanges
      .filter((change) => (
        change.reasonKeys.some((reason) => !TEAM_RESULT_REASON_KEYS.has(reason))
        || change.reasonKeys.length === 0 && (
          Math.abs(change.formDelta) >= FULL_TIME_STATE_DELTA_ATTENTION
          || Math.abs(change.moraleDelta) >= FULL_TIME_STATE_DELTA_ATTENTION
        )
      ))
      .map((change) => [change.playerId, change] as const),
  );
  const notableConditionPlayerIds = [...conditionByPlayerId.values()]
    .filter((change) => (
      change.after < FULL_TIME_CONDITION_ATTENTION_THRESHOLD
      || Math.abs(change.delta) >= FULL_TIME_CONDITION_DELTA_ATTENTION
    ))
    .map((change) => change.playerId);
  const playerIds = new Set([...notableConditionPlayerIds, ...stateByPlayerId.keys()]);
  const consequences = [...playerIds]
    .map((playerId): MatchdayFullTimeConsequenceView => {
      const condition = conditionByPlayerId.get(playerId);
      const playerState = stateByPlayerId.get(playerId);
      return {
        playerId,
        playerName: condition?.playerName ?? playerState?.playerName ?? playerId,
        ...(condition === undefined ? {} : { condition }),
        ...(playerState === undefined ? {} : { playerState }),
      };
    })
    .toSorted(compareFullTimeConsequences);

  return {
    selectedClubName: phaseView.selectedClub.name,
    events: eventGroups.tabellino,
    ratings,
    consequences,
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
): MatchdayManagerActionView | undefined {
  const managerActions = phaseView.actions.filter(isManagerMatchdayAction);
  const nextAction = phaseView.nextActionId === undefined
    ? undefined
    : managerActions.find((action) => action.actionId === phaseView.nextActionId && action.status !== "unavailable");

  return nextAction
    ?? managerActions.find((action) => action.status === "available")
    ?? managerActions.find((action) => action.status === "blocked");
}

function isManagerMatchdayAction(
  action: CareerMatchdayPhaseActionView,
): action is MatchdayManagerActionView {
  return action.actionId !== "continue_to_half_time"
    && action.actionId !== "continue_to_full_time";
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

function needsHalfTimeAttention(row: CareerMatchdayPhasePlayerView): boolean {
  return (row.rating ?? 10) < 6.5 || (row.condition ?? 100) < 75;
}

function compareHalfTimeAttention(
  first: CareerMatchdayPhasePlayerView,
  second: CareerMatchdayPhasePlayerView,
): number {
  return (first.rating ?? 10) - (second.rating ?? 10)
    || (first.condition ?? 100) - (second.condition ?? 100)
    || first.playerName.localeCompare(second.playerName);
}

function isHalfTimeContributor(row: CareerMatchdayPhasePlayerView): boolean {
  return structuredContributionCount(row) > 0 || (row.rating ?? 0) >= 7;
}

function compareHalfTimeContribution(
  first: CareerMatchdayPhasePlayerView,
  second: CareerMatchdayPhasePlayerView,
): number {
  return halfTimeContributionScore(second) - halfTimeContributionScore(first)
    || first.playerName.localeCompare(second.playerName);
}

function halfTimeContributionScore(row: CareerMatchdayPhasePlayerView): number {
  return (row.rating ?? 0)
    + row.goals * 4
    + row.assists * 3
    + row.saves * 0.8
    + row.blocks
    + row.shotsOnTarget * 0.5;
}

function structuredContributionCount(row: CareerMatchdayPhasePlayerView): number {
  return row.goals + row.assists + row.saves + row.blocks + row.shotsOnTarget;
}

function compareFullTimeRatings(
  first: CareerMatchdayPhasePlayerView,
  second: CareerMatchdayPhasePlayerView,
): number {
  return (second.rating ?? -1) - (first.rating ?? -1)
    || second.impactScore - first.impactScore
    || first.playerName.localeCompare(second.playerName);
}

function compareFullTimeConsequences(
  first: MatchdayFullTimeConsequenceView,
  second: MatchdayFullTimeConsequenceView,
): number {
  return fullTimeConsequenceWeight(second) - fullTimeConsequenceWeight(first)
    || first.playerName.localeCompare(second.playerName);
}

function fullTimeConsequenceWeight(change: MatchdayFullTimeConsequenceView): number {
  return Math.abs(change.condition?.delta ?? 0)
    + Math.abs(change.playerState?.formDelta ?? 0)
    + Math.abs(change.playerState?.moraleDelta ?? 0);
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
