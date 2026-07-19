import type {
  CareerMatchdayPhaseActionId,
  CareerMatchdayPhaseActionView,
  CareerMatchdayPhaseEventView,
  CareerMatchdayPhasePlayerView,
  CareerMatchdayPhaseView,
} from "@game/ui";

const MATCHDAY_PHASES = ["pre_match", "first_half", "half_time", "second_half", "full_time"] as const;

const GOAL_EVENT_KINDS = new Set(["goal"]);
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
export type MatchdayEventVisualPriority = "goal" | "secondary" | "detail";

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

/** One event enriched with screen-only priority for the current live moment. */
export interface MatchdayPresentedEventView {
  /** Original structured event from the shared read model. */
  readonly event: CareerMatchdayPhaseEventView;
  /** Visual hierarchy for rendering. */
  readonly visualPriority: MatchdayEventVisualPriority;
}

/** One current structured incident used by the replace-in-place live line. */
export interface MatchdayLiveMomentView {
  /** Current event, absent during intentional opening and closing transitions. */
  readonly event?: MatchdayPresentedEventView;
  /** Visual hierarchy for the stable commentary region. */
  readonly visualPriority: MatchdayEventVisualPriority | "transition";
}

/** Fixture side that owns one tabellino incident. */
export type MatchdayTabellinoSide = "home" | "away";

/** One real incident kept in the persistent compact match record. */
export interface MatchdayTabellinoIncidentView {
  /** Original structured event from the shared read model. */
  readonly event: CareerMatchdayPhaseEventView;
  /** Fixture side used to place the incident in the correct visual lane. */
  readonly side: MatchdayTabellinoSide;
  /** Goals dominate; other currently supported incidents stay quieter. */
  readonly visualPriority: "goal" | "secondary";
}

/** One chronological compact record shared by live, half-time, and full-time. */
export interface MatchdayTabellinoView {
  /** Home club identity for the desktop lane heading. */
  readonly homeClubName: string;
  /** Away club identity for the desktop lane heading. */
  readonly awayClubName: string;
  /** Current real incidents in deterministic chronological order. */
  readonly incidents: readonly MatchdayTabellinoIncidentView[];
}

/** Decision-grade first-half facts shown before the tactical workspace. */
export interface MatchdayHalfTimeReviewView {
  /** Existing selected-club identity for the team tab heading. */
  readonly selectedClubName: string;
  /** Existing opponent identity for the opponent tab heading. */
  readonly opponentClubName: string;
  /** Selected-club rows ordered for a live half-time review. */
  readonly selectedTeamPlayers: readonly CareerMatchdayPhasePlayerView[];
  /** Opponent rows containing only observed match facts. */
  readonly opponentPlayers: readonly CareerMatchdayPhasePlayerView[];
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

/** Concise full-time facts for both teams and the selected club's durable review. */
export interface MatchdayFullTimeReviewView {
  /** Existing selected-club identity for the default ratings tab. */
  readonly selectedClubName: string;
  /** Existing opponent identity for the observed-facts ratings tab. */
  readonly opponentClubName: string;
  /** Final selected-club rows ordered for review. */
  readonly selectedTeamPlayers: readonly CareerMatchdayPhasePlayerView[];
  /** Final opponent rows containing only observed match facts. */
  readonly opponentPlayers: readonly CareerMatchdayPhasePlayerView[];
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
  /** Persistent chronological match record. */
  readonly tabellino: MatchdayTabellinoView;
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

  return {
    scoreHeader: buildMatchdayScoreHeader(phaseView),
    phaseIndicators: buildMatchdayPhaseIndicators(phaseView.phase),
    ...(primaryAction === undefined ? {} : { primaryAction }),
    tabellino: buildMatchdayTabellinoView(phaseView),
    ...(phaseView.phase === "half_time"
      ? { halfTimeReview: buildMatchdayHalfTimeReviewView(phaseView) }
      : {}),
    ...(phaseView.phase === "full_time"
      ? { fullTimeReview: buildMatchdayFullTimeReviewView(phaseView) }
      : {}),
  };
}

/**
 * Selects only half-time facts that can reasonably change the manager's plan.
 * Score, minute, phase, and substitution count stay with their existing owners.
 */
export function buildMatchdayHalfTimeReviewView(
  phaseView: CareerMatchdayPhaseView,
): MatchdayHalfTimeReviewView {
  const opponentClub = phaseView.fixture.homeClub.clubId === phaseView.selectedClub.clubId
    ? phaseView.fixture.awayClub
    : phaseView.fixture.homeClub;
  const selectedTeamPlayers = phaseView.playerRows
    .filter((row) => row.club.clubId === phaseView.selectedClub.clubId)
    .toSorted(compareHalfTimeTeamRows);
  const opponentPlayers = phaseView.playerRows
    .filter((row) => row.club.clubId === opponentClub.clubId)
    .toSorted(compareHalfTimeTeamRows);
  const selectedPlayersOnPitch = selectedTeamPlayers.filter((row) => isActivePlayerStatus(row.status));
  const watchList = selectedPlayersOnPitch
    .filter(needsHalfTimeAttention)
    .toSorted(compareHalfTimeAttention)
    .slice(0, 3);
  const watchedPlayerIds = new Set(watchList.map((row) => row.playerId));
  const contributors = selectedPlayersOnPitch
    .filter((row) => !watchedPlayerIds.has(row.playerId) && isHalfTimeContributor(row))
    .toSorted(compareHalfTimeContribution)
    .slice(0, 3);

  return {
    selectedClubName: phaseView.selectedClub.name,
    opponentClubName: opponentClub.name,
    selectedTeamPlayers,
    opponentPlayers,
    watchList,
    contributors,
  };
}

/**
 * Builds one full-time review from existing match and career consequences.
 * Both teams expose the same observed match facts; unchanged state and
 * duplicate next-action facts are not part of this presentation contract.
 */
export function buildMatchdayFullTimeReviewView(
  phaseView: CareerMatchdayPhaseView,
): MatchdayFullTimeReviewView {
  const opponentClub = phaseView.fixture.homeClub.clubId === phaseView.selectedClub.clubId
    ? phaseView.fixture.awayClub
    : phaseView.fixture.homeClub;
  const selectedTeamPlayers = phaseView.playerRows
    .filter((row) => row.club.clubId === phaseView.selectedClub.clubId)
    .toSorted(compareFullTimeRatings);
  const opponentPlayers = phaseView.playerRows
    .filter((row) => row.club.clubId === opponentClub.clubId)
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
    opponentClubName: opponentClub.name,
    selectedTeamPlayers,
    opponentPlayers,
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
 * Builds the single persistent match record from event kinds produced by the
 * current game. Unsupported future incident branches are intentionally absent.
 */
export function buildMatchdayTabellinoView(
  phaseView: Pick<CareerMatchdayPhaseView, "fixture" | "timelineEvents">,
): MatchdayTabellinoView {
  const incidents = phaseView.timelineEvents
    .flatMap((event): readonly MatchdayTabellinoIncidentView[] => {
      const visualPriority = tabellinoPriority(event);
      if (visualPriority === undefined) return [];

      const side = event.club.clubId === phaseView.fixture.homeClub.clubId
        ? "home"
        : event.club.clubId === phaseView.fixture.awayClub.clubId
          ? "away"
          : undefined;
      if (side === undefined) return [];

      return [{ event, side, visualPriority }];
    })
    .toSorted(compareTabellinoIncidents);

  return {
    homeClubName: phaseView.fixture.homeClub.name,
    awayClubName: phaseView.fixture.awayClub.name,
    incidents,
  };
}

/**
 * Selects the event that owns the current live moment. A playback frame may
 * reveal several chronological events, so callers can provide the event ID
 * that determined the frame hold instead of assuming the last event is the
 * decisive one.
 */
export function buildMatchdayLiveMoment(
  events: readonly CareerMatchdayPhaseEventView[],
  currentEventId?: string,
): MatchdayLiveMomentView {
  const currentEvent = currentEventId === undefined
    ? events.at(-1)
    : events.find((event) => event.eventId === currentEventId);

  if (currentEvent === undefined) {
    return { visualPriority: "transition" };
  }

  const presentedEvent: MatchdayPresentedEventView = {
    event: currentEvent,
    visualPriority: liveEventPriority(currentEvent),
  };
  return {
    event: presentedEvent,
    visualPriority: presentedEvent.visualPriority,
  };
}

function liveEventPriority(event: CareerMatchdayPhaseEventView): MatchdayEventVisualPriority {
  if (GOAL_EVENT_KINDS.has(event.kind)) return "goal";
  if (SUBSTITUTION_EVENT_KINDS.has(event.kind)) return "secondary";
  return "detail";
}

function tabellinoPriority(
  event: CareerMatchdayPhaseEventView,
): MatchdayTabellinoIncidentView["visualPriority"] | undefined {
  if (GOAL_EVENT_KINDS.has(event.kind)) return "goal";
  if (SUBSTITUTION_EVENT_KINDS.has(event.kind)) return "secondary";
  return undefined;
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

function compareHalfTimeTeamRows(
  first: CareerMatchdayPhasePlayerView,
  second: CareerMatchdayPhasePlayerView,
): number {
  return halfTimeStatusRank(first.status) - halfTimeStatusRank(second.status)
    || (second.rating ?? -1) - (first.rating ?? -1)
    || second.impactScore - first.impactScore
    || first.playerName.localeCompare(second.playerName);
}

function halfTimeStatusRank(status: CareerMatchdayPhasePlayerView["status"]): number {
  if (isActivePlayerStatus(status)) return 0;
  if (status === "substituted_off") return 1;
  return 2;
}

function isActivePlayerStatus(status: CareerMatchdayPhasePlayerView["status"]): boolean {
  return status === "on_pitch" || status === "substituted_on";
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

function compareTabellinoIncidents(
  first: MatchdayTabellinoIncidentView,
  second: MatchdayTabellinoIncidentView,
): number {
  return first.event.minute - second.event.minute
    || first.event.sequence - second.event.sequence
    || first.event.eventId.localeCompare(second.event.eventId);
}
