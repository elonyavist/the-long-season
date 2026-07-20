import { useEffect, useMemo, useState } from "react";
import type { CareerMatchdayPhaseEventView } from "@game/ui";

import {
  matchdayNarrativeEvents,
  matchdayNarrativeHoldMs,
} from "./matchday-playback";

interface NarrativeFrameState {
  readonly frameKey: string;
  readonly eventIndex: number;
}

/** Current presentation frame for bounded penalty and goal storytelling. */
export interface MatchdayNarrativeFrame {
  readonly currentEventId?: string;
  readonly holdActive: boolean;
}

/**
 * Sequences the important events generated in one minute. Timers only gate the
 * next web request; they never mutate simulation, persistence, or career state.
 */
export function useMatchdayNarrativeFrame(
  events: readonly CareerMatchdayPhaseEventView[],
  currentMinute: number,
  advanceFrames: boolean,
): MatchdayNarrativeFrame {
  const narrativeEvents = useMemo(
    () => matchdayNarrativeEvents(events, currentMinute),
    [currentMinute, events],
  );
  const frameKey = narrativeEvents.map((event) => event.eventId).join("|");
  const [state, setState] = useState<NarrativeFrameState>({ frameKey: "", eventIndex: 0 });
  const eventIndex = state.frameKey === frameKey ? state.eventIndex : 0;
  const currentEvent = narrativeEvents[eventIndex];
  const currentEventId = currentEvent?.eventId;
  const currentHoldMs = currentEvent === undefined ? 0 : matchdayNarrativeHoldMs(currentEvent);
  const holdActive = currentEvent !== undefined;

  useEffect(() => {
    if (state.frameKey === frameKey) return;
    setState({ frameKey, eventIndex: 0 });
  }, [frameKey, state.frameKey]);

  useEffect(() => {
    if (currentEventId === undefined || !advanceFrames) return;

    const timeout = window.setTimeout(() => {
      setState((current) => current.frameKey === frameKey
        ? { ...current, eventIndex: current.eventIndex + 1 }
        : current);
    }, currentHoldMs);

    return () => window.clearTimeout(timeout);
  }, [advanceFrames, currentEventId, currentHoldMs, frameKey]);

  return {
    ...(currentEventId === undefined ? {} : { currentEventId }),
    holdActive,
  };
}
