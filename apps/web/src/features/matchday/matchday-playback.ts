/**
 * Presentation-only cadence for the progressive Matchday clock.
 *
 * This module never predicts events or owns simulation state. Each elapsed
 * delay authorizes the screen to request one exact minute from the runtime.
 */

import type { CareerMatchdayPhaseEventView } from "@game/ui";

const BASE_MINUTE_DELAY_MS = 700;
const REDUCED_MOTION_MINUTE_DELAY_MS = 350;

/** Playback speeds available while the canonical engine session is running. */
export const MATCHDAY_PLAYBACK_SPEEDS = [1, 2, 4] as const;

/** Presentation speed multiplier; it never alters match probabilities. */
export type MatchdayPlaybackSpeed = (typeof MATCHDAY_PLAYBACK_SPEEDS)[number];

/**
 * Returns the bounded presentation hold for the only interrupting narrative
 * facts. Red cards and forced injuries also have engine-owned decision pauses;
 * this short hold only gives their decisive event one readable narrative frame.
 */
export function matchdayNarrativeHoldMs(
  event: Pick<CareerMatchdayPhaseEventView, "kind" | "detailKeys">,
): number {
  switch (event.kind) {
    case "penalty":
      return 1_200;
    case "penalty_goal":
    case "penalty_miss":
    case "penalty_save":
      return 1_600;
    case "goal":
      return 2_000;
    case "red_card":
    case "second_yellow":
      return 1_400;
    case "injury":
      return event.detailKeys?.includes("requires_substitution") === true
        ? 1_400
        : 0;
    default:
      return 0;
  }
}

/** Selects narrative events for the current minute in canonical sequence order. */
export function matchdayNarrativeEvents(
  events: readonly CareerMatchdayPhaseEventView[],
  currentMinute: number,
): readonly CareerMatchdayPhaseEventView[] {
  return events
    .filter((event) => (
      event.minute === currentMinute
      && matchdayNarrativeHoldMs(event) > 0
    ))
    .toSorted((first, second) => (
      first.sequence - second.sequence
      || first.eventId.localeCompare(second.eventId)
    ));
}

/**
 * Returns the delay before requesting the next engine minute.
 * Reduced motion removes decorative pacing while retaining an observable clock.
 */
export function matchdayMinuteDelayMs(
  speed: MatchdayPlaybackSpeed,
  reducedMotion: boolean,
): number {
  const baseDelay = reducedMotion ? REDUCED_MOTION_MINUTE_DELAY_MS : BASE_MINUTE_DELAY_MS;
  return Math.round(baseDelay / speed);
}
