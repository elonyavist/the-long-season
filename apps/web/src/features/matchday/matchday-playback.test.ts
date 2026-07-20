import { describe, expect, it } from "vitest";
import type { CareerMatchdayPhaseEventView } from "@game/ui";

import {
  MATCHDAY_PLAYBACK_SPEEDS,
  matchdayMinuteDelayMs,
  matchdayNarrativeEvents,
  matchdayNarrativeHoldMs,
} from "./matchday-playback";

describe("matchday playback cadence", () => {
  it("offers only the documented presentation speeds", () => {
    expect(MATCHDAY_PLAYBACK_SPEEDS).toEqual([1, 2, 4]);
  });

  it("requests one minute faster without changing engine semantics", () => {
    expect(matchdayMinuteDelayMs(1, false)).toBe(700);
    expect(matchdayMinuteDelayMs(2, false)).toBe(350);
    expect(matchdayMinuteDelayMs(4, false)).toBe(175);
  });

  it("uses a compact non-animated cadence when reduced motion is requested", () => {
    expect(matchdayMinuteDelayMs(1, true)).toBe(350);
    expect(matchdayMinuteDelayMs(2, true)).toBe(175);
    expect(matchdayMinuteDelayMs(4, true)).toBe(88);
  });

  it("holds exactly penalties, outcomes, goals, dismissals, and forced-exit injuries", () => {
    expect(matchdayNarrativeHoldMs({ kind: "penalty" })).toBe(1_200);
    expect(matchdayNarrativeHoldMs({ kind: "penalty_goal" })).toBe(1_600);
    expect(matchdayNarrativeHoldMs({ kind: "penalty_miss" })).toBe(1_600);
    expect(matchdayNarrativeHoldMs({ kind: "penalty_save" })).toBe(1_600);
    expect(matchdayNarrativeHoldMs({ kind: "goal" })).toBe(2_000);

    expect(matchdayNarrativeHoldMs({ kind: "red_card" })).toBe(1_400);
    expect(matchdayNarrativeHoldMs({ kind: "second_yellow" })).toBe(1_400);
    expect(matchdayNarrativeHoldMs({
      kind: "injury",
      detailKeys: ["severity:moderate", "requires_substitution"],
    })).toBe(1_400);
    expect(matchdayNarrativeHoldMs({
      kind: "injury",
      detailKeys: ["severity:serious", "requires_substitution"],
    })).toBe(1_400);
    expect(matchdayNarrativeHoldMs({ kind: "injury", detailKeys: ["severity:moderate"] })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "injury", detailKeys: ["severity:minor"] })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "injury", detailKeys: ["severity:knock"] })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "yellow_card" })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "foul" })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "corner" })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "miss" })).toBe(0);
    expect(matchdayNarrativeHoldMs({ kind: "save" })).toBe(0);
  });

  it("sequences only current-minute narrative facts", () => {
    const events = [
      event("event:goal", 20, 3, "goal"),
      event("event:yellow", 20, 2, "yellow_card"),
      event("event:penalty", 20, 1, "penalty"),
      event("event:old-goal", 19, 0, "goal"),
    ];

    expect(matchdayNarrativeEvents(events, 20).map((item) => item.eventId)).toEqual([
      "event:penalty",
      "event:goal",
    ]);
  });
});

function event(
  eventId: string,
  minute: number,
  sequence: number,
  kind: CareerMatchdayPhaseEventView["kind"],
): CareerMatchdayPhaseEventView {
  return {
    eventId,
    minute,
    sequence,
    kind,
    club: { clubId: "club:home", name: "Home" },
    labelKey: `career.matchday.event.${kind}`,
    cardPriority: kind === "goal" ? "major" : "normal",
  };
}
