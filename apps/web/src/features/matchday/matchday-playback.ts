/**
 * Presentation-only playback over already computed match checkpoints.
 * No frame in this module mutates career or match-engine state.
 */
import type {
  CareerMatchdayPhaseEventView,
  CareerMatchdayPhaseView,
} from "@game/ui";

const FIRST_HALF_END_MINUTE = 45;
const SECOND_HALF_START_MINUTE = 46;
const SECOND_HALF_END_MINUTE = 90;
const MAX_EVENT_FRAMES = 8;
const MAX_PLAYBACK_DURATION_MS = 2_600;
const OPENING_HOLD_MS = 350;
const CLOSING_HOLD_MS = 450;
const MIN_EVENT_HOLD_MS = 180;
const MAX_EVENT_HOLD_MS = 420;

/** Stable visual stage shared by both bounded match-period playbacks. */
export type MatchdayPlaybackStage = "opening" | "event" | "closing";

/** One immutable presentation frame derived from canonical checkpoint facts. */
export interface MatchdayPlaybackFrame {
  /** Stable key used by React and visual QA. */
  readonly frameId: string;
  /** Visual stage used for hierarchy and accessibility. */
  readonly stage: MatchdayPlaybackStage;
  /** Match minute visible in this frame. */
  readonly minute: number;
  /** Number of chronological events revealed by this frame. */
  readonly visibleEventCount: number;
  /** Bounded time this frame remains visible before advancing. */
  readonly holdMs: number;
}

/** Complete playback plan for one already-computed match period. */
export interface MatchdayPlaybackPlan {
  /** Whether motion interpolation was intentionally omitted. */
  readonly reducedMotion: boolean;
  /** Ordered frames; the final frame always represents the checkpoint facts. */
  readonly frames: readonly MatchdayPlaybackFrame[];
  /** Total presentation duration, useful for deterministic QA. */
  readonly durationMs: number;
}

/**
 * Builds a short, deterministic reveal plan from the real half-time events.
 * Large event sets are grouped into at most eight visual updates so playback
 * remains informative without becoming a wall-clock simulation.
 */
export function buildFirstHalfPlaybackPlan(
  halfTimeView: CareerMatchdayPhaseView,
  reducedMotion: boolean,
): MatchdayPlaybackPlan {
  assertHalfTimeView(halfTimeView);
  return buildPlaybackPlan({
    events: firstHalfEvents(halfTimeView.timelineEvents),
    openingMinute: 1,
    closingMinute: FIRST_HALF_END_MINUTE,
    framePrefix: "first-half",
    reducedMotion,
  });
}

/** Builds the bounded second-half reveal ending at the canonical full-time view. */
export function buildSecondHalfPlaybackPlan(
  fullTimeView: CareerMatchdayPhaseView,
  reducedMotion: boolean,
): MatchdayPlaybackPlan {
  assertFullTimeView(fullTimeView);
  return buildPlaybackPlan({
    events: secondHalfEvents(fullTimeView.timelineEvents),
    openingMinute: SECOND_HALF_START_MINUTE,
    closingMinute: SECOND_HALF_END_MINUTE,
    framePrefix: "second-half",
    reducedMotion,
  });
}

/**
 * Projects one visual first-half frame from the canonical half-time view.
 * The score is recalculated only from revealed structured goal events; the
 * closing frame uses the exact checkpoint score to avoid presentation drift.
 */
export function projectFirstHalfPlaybackFrame(
  halfTimeView: CareerMatchdayPhaseView,
  frame: MatchdayPlaybackFrame,
): CareerMatchdayPhaseView {
  assertHalfTimeView(halfTimeView);
  const visibleEvents = firstHalfEvents(halfTimeView.timelineEvents)
    .slice(0, frame.visibleEventCount);
  const scoreboard = frame.stage === "closing"
    ? halfTimeView.scoreboard
    : playbackScoreboard(halfTimeView, visibleEvents);
  const { nextActionId: _nextActionId, ...baseView } = halfTimeView;

  return {
    ...baseView,
    phase: "first_half",
    status: "live",
    periodLabelKey: "career.matchday.phase.first_half",
    currentMinute: frame.minute,
    scoreboard,
    timelineEvents: visibleEvents,
    keyEventCards: visibleEvents.filter((event) => event.cardPriority === "major"),
    actions: [],
    conditionChanges: [],
    playerStateChanges: [],
  };
}

/**
 * Projects one second-half frame from the canonical full-time result. The
 * opening score is reconstructed from first-half goals, while the closing
 * frame restores the exact committed score before the full-time review opens.
 */
export function projectSecondHalfPlaybackFrame(
  fullTimeView: CareerMatchdayPhaseView,
  frame: MatchdayPlaybackFrame,
): CareerMatchdayPhaseView {
  assertFullTimeView(fullTimeView);
  const priorEvents = firstHalfEvents(fullTimeView.timelineEvents);
  const visibleEvents = secondHalfEvents(fullTimeView.timelineEvents)
    .slice(0, frame.visibleEventCount);
  const scoreboard = frame.stage === "closing"
    ? fullTimeView.scoreboard
    : playbackScoreboard(fullTimeView, [...priorEvents, ...visibleEvents]);
  const { nextActionId: _nextActionId, ...baseView } = fullTimeView;

  return {
    ...baseView,
    phase: "second_half",
    status: "live",
    periodLabelKey: "career.matchday.phase.second_half",
    currentMinute: frame.minute,
    scoreboard,
    timelineEvents: visibleEvents,
    keyEventCards: visibleEvents.filter((event) => event.cardPriority === "major"),
    actions: [],
    conditionChanges: [],
    playerStateChanges: [],
  };
}

/** Reads the current browser reduced-motion preference without owning it. */
export function prefersReducedMatchdayMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function firstHalfEvents(
  events: readonly CareerMatchdayPhaseEventView[],
): readonly CareerMatchdayPhaseEventView[] {
  return events.filter((event) => event.minute <= FIRST_HALF_END_MINUTE);
}

function secondHalfEvents(
  events: readonly CareerMatchdayPhaseEventView[],
): readonly CareerMatchdayPhaseEventView[] {
  return events.filter((event) => event.minute > FIRST_HALF_END_MINUTE);
}

function buildPlaybackPlan({
  events,
  openingMinute,
  closingMinute,
  framePrefix,
  reducedMotion,
}: Readonly<{
  events: readonly CareerMatchdayPhaseEventView[];
  openingMinute: number;
  closingMinute: number;
  framePrefix: "first-half" | "second-half";
  reducedMotion: boolean;
}>): MatchdayPlaybackPlan {
  if (reducedMotion) {
    const frame = closingFrame(framePrefix, closingMinute, events.length, 0);
    return { reducedMotion: true, frames: [frame], durationMs: 0 };
  }

  const visibleEventCounts = sampledEventCounts(events.length);
  const eventHoldMs = visibleEventCounts.length === 0
    ? 0
    : Math.min(
        MAX_EVENT_HOLD_MS,
        Math.max(
          MIN_EVENT_HOLD_MS,
          Math.floor(
            (MAX_PLAYBACK_DURATION_MS - OPENING_HOLD_MS - CLOSING_HOLD_MS)
              / visibleEventCounts.length,
          ),
        ),
      );
  const frames: MatchdayPlaybackFrame[] = [
    {
      frameId: `${framePrefix}:opening`,
      stage: "opening",
      minute: openingMinute,
      visibleEventCount: 0,
      holdMs: OPENING_HOLD_MS,
    },
    ...visibleEventCounts.map((visibleEventCount) => {
      const event = events[visibleEventCount - 1];
      if (event === undefined) {
        throw new Error(`${framePrefix} playback frame is missing its event`);
      }
      return {
        frameId: `${framePrefix}:event:${event.eventId}`,
        stage: "event" as const,
        minute: event.minute,
        visibleEventCount,
        holdMs: eventHoldMs,
      };
    }),
    closingFrame(framePrefix, closingMinute, events.length, CLOSING_HOLD_MS),
  ];

  return {
    reducedMotion: false,
    frames,
    durationMs: frames.reduce((total, frame) => total + frame.holdMs, 0),
  };
}

function sampledEventCounts(eventCount: number): readonly number[] {
  if (eventCount <= MAX_EVENT_FRAMES) {
    return Array.from({ length: eventCount }, (_, index) => index + 1);
  }

  return Array.from({ length: MAX_EVENT_FRAMES }, (_, index) => (
    Math.ceil(((index + 1) * eventCount) / MAX_EVENT_FRAMES)
  )).filter((count, index, counts) => index === 0 || count !== counts[index - 1]);
}

function closingFrame(
  framePrefix: "first-half" | "second-half",
  minute: number,
  eventCount: number,
  holdMs: number,
): MatchdayPlaybackFrame {
  return {
    frameId: `${framePrefix}:closing`,
    stage: "closing",
    minute,
    visibleEventCount: eventCount,
    holdMs,
  };
}

function playbackScoreboard(
  view: CareerMatchdayPhaseView,
  events: readonly CareerMatchdayPhaseEventView[],
): CareerMatchdayPhaseView["scoreboard"] {
  let homeGoals = 0;
  let awayGoals = 0;

  for (const event of events) {
    if (event.kind !== "goal" && event.kind !== "penalty_goal") continue;
    if (event.club.clubId === view.fixture.homeClub.clubId) homeGoals += 1;
    if (event.club.clubId === view.fixture.awayClub.clubId) awayGoals += 1;
  }

  const selectedGoals = view.fixture.selectedClubSide === "home" ? homeGoals : awayGoals;
  const opponentGoals = view.fixture.selectedClubSide === "home" ? awayGoals : homeGoals;

  return {
    homeGoals,
    awayGoals,
    selectedClubScoreState: selectedGoals === opponentGoals
      ? "drawing"
      : selectedGoals > opponentGoals
        ? "leading"
        : "trailing",
  };
}

function assertHalfTimeView(view: CareerMatchdayPhaseView): void {
  if (view.phase !== "half_time") {
    throw new Error(`First-half playback requires a half-time view, received ${view.phase}`);
  }
}

function assertFullTimeView(view: CareerMatchdayPhaseView): void {
  if (view.phase !== "full_time") {
    throw new Error(`Second-half playback requires a full-time view, received ${view.phase}`);
  }
}
