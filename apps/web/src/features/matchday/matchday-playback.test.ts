import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import {
  buildFirstHalfPlaybackPlan,
  buildSecondHalfPlaybackPlan,
  projectFirstHalfPlaybackFrame,
  projectSecondHalfPlaybackFrame,
  scaledMatchdayPlaybackHoldMs,
} from "./matchday-playback";

describe("matchday playback", () => {
  it("builds a bounded deterministic plan that reveals every small event set", () => {
    const view = halfTimeView();
    const first = buildFirstHalfPlaybackPlan(view, false);
    const second = buildFirstHalfPlaybackPlan(view, false);

    expect(first).toEqual(second);
    expect(first.durationMs).toBe(9_400);
    expect(first.frames.map((frame) => frame.stage)).toEqual([
      "opening",
      "event",
      "event",
      "event",
      "closing",
    ]);
    expect(first.frames.map((frame) => [frame.priority, frame.holdMs])).toEqual([
      ["transition", 800],
      ["goal", 4_500],
      ["significant", 2_200],
      ["ordinary", 1_000],
      ["transition", 900],
    ]);
    expect(first.frames.map((frame) => frame.currentEventId)).toEqual([
      undefined,
      "event:goal",
      "event:save",
      "event:miss",
      undefined,
    ]);
    expect(first.frames.at(-1)).toMatchObject({ minute: 45, visibleEventCount: 3 });
  });

  it("scales visual holds without turning decisive facts into flashes", () => {
    const plan = buildFirstHalfPlaybackPlan(halfTimeView(), false);
    const goalFrame = plan.frames.find((frame) => frame.priority === "goal");
    const saveFrame = plan.frames.find((frame) => frame.priority === "significant");
    const ordinaryFrame = plan.frames.find((frame) => frame.priority === "ordinary");

    expect(goalFrame).toBeDefined();
    expect(saveFrame).toBeDefined();
    expect(ordinaryFrame).toBeDefined();
    expect(scaledMatchdayPlaybackHoldMs(goalFrame!, 4)).toBe(1_125);
    expect(scaledMatchdayPlaybackHoldMs(saveFrame!, 4)).toBe(550);
    expect(scaledMatchdayPlaybackHoldMs(ordinaryFrame!, 4)).toBe(250);
  });

  it("projects only revealed facts before restoring the exact checkpoint score", () => {
    const view = halfTimeView();
    const plan = buildFirstHalfPlaybackPlan(view, false);
    const opening = projectFirstHalfPlaybackFrame(view, plan.frames[0]!);
    const firstEvent = projectFirstHalfPlaybackFrame(view, plan.frames[1]!);
    const closing = projectFirstHalfPlaybackFrame(view, plan.frames.at(-1)!);

    expect(opening).toMatchObject({ phase: "first_half", currentMinute: 1, actions: [] });
    expect(opening.timelineEvents).toEqual([]);
    expect(opening.scoreboard).toMatchObject({ homeGoals: 0, awayGoals: 0 });
    expect(firstEvent.timelineEvents.map((event) => event.eventId)).toEqual(["event:goal"]);
    expect(firstEvent.scoreboard).toMatchObject({ homeGoals: 1, awayGoals: 0 });
    expect(closing.timelineEvents).toEqual(view.timelineEvents);
    expect(closing.scoreboard).toEqual(view.scoreboard);
    expect(closing.nextActionId).toBeUndefined();
  });

  it("collapses interpolation for reduced motion without changing facts", () => {
    const view = halfTimeView();
    const plan = buildFirstHalfPlaybackPlan(view, true);
    const projected = projectFirstHalfPlaybackFrame(view, plan.frames[0]!);

    expect(plan).toMatchObject({ reducedMotion: true, durationMs: 900 });
    expect(plan.frames).toHaveLength(1);
    expect(plan.frames[0]).toMatchObject({ priority: "transition", holdMs: 900 });
    expect(projected.currentMinute).toBe(45);
    expect(projected.scoreboard).toEqual(view.scoreboard);
    expect(projected.timelineEvents).toEqual(view.timelineEvents);
  });

  it("groups large event sets into at most eight event frames", () => {
    const view = halfTimeView(20);
    const plan = buildFirstHalfPlaybackPlan(view, false);

    expect(plan.frames.filter((frame) => frame.stage === "event")).toHaveLength(8);
    expect(plan.frames.at(-1)?.visibleEventCount).toBe(20);
    expect(plan.durationMs).toBeGreaterThan(2_600);
    expect(plan.frames[1]).toMatchObject({
      priority: "goal",
      currentEventId: "event:01",
      visibleEventCount: 3,
    });
  });

  it("reveals the second half from the half-time score and ends on exact full-time facts", () => {
    const view = fullTimeView();
    const first = buildSecondHalfPlaybackPlan(view, false);
    const second = buildSecondHalfPlaybackPlan(view, false);
    const opening = projectSecondHalfPlaybackFrame(view, first.frames[0]!);
    const firstEvent = projectSecondHalfPlaybackFrame(view, first.frames[1]!);
    const closing = projectSecondHalfPlaybackFrame(view, first.frames.at(-1)!);

    expect(first).toEqual(second);
    expect(first.durationMs).toBe(11_700);
    expect(first.frames.map((frame) => frame.stage)).toEqual([
      "opening",
      "event",
      "event",
      "event",
      "closing",
    ]);
    expect(opening).toMatchObject({ phase: "second_half", currentMinute: 46, actions: [] });
    expect(opening.timelineEvents).toEqual([]);
    expect(opening.scoreboard).toMatchObject({ homeGoals: 1, awayGoals: 0 });
    expect(firstEvent.timelineEvents.map((event) => event.eventId)).toEqual(["event:goal:second"]);
    expect(firstEvent.scoreboard).toMatchObject({ homeGoals: 2, awayGoals: 0 });
    expect(closing.currentMinute).toBe(90);
    expect(closing.timelineEvents.map((event) => event.eventId)).toEqual([
      "event:goal:second",
      "event:miss:second",
      "event:goal:late",
    ]);
    expect(closing.scoreboard).toEqual(view.scoreboard);
    expect(closing.conditionChanges).toEqual([]);
    expect(closing.playerStateChanges).toEqual([]);
    expect(closing.nextActionId).toBeUndefined();
  });

  it("collapses second-half interpolation for reduced motion", () => {
    const view = fullTimeView();
    const plan = buildSecondHalfPlaybackPlan(view, true);
    const projected = projectSecondHalfPlaybackFrame(view, plan.frames[0]!);

    expect(plan).toMatchObject({ reducedMotion: true, durationMs: 900 });
    expect(plan.frames).toHaveLength(1);
    expect(projected).toMatchObject({ phase: "second_half", currentMinute: 90 });
    expect(projected.scoreboard).toEqual(view.scoreboard);
    expect(projected.timelineEvents).toHaveLength(3);
  });
});

function halfTimeView(eventCount = 3) {
  const baseEvents = [
    { eventId: "event:goal", minute: 12, kind: "goal", club: homeClub, playerName: "Filippo Costa" },
    { eventId: "event:save", minute: 26, kind: "save", club: awayClub, playerName: "Davide Valentini" },
    { eventId: "event:miss", minute: 41, kind: "miss", club: awayClub, playerName: "Nico Rinaldi" },
  ];
  const events = eventCount === 3
    ? baseEvents
    : Array.from({ length: eventCount }, (_, index) => ({
        eventId: `event:${String(index + 1).padStart(2, "0")}`,
        minute: Math.min(44, index + 1),
        kind: index === 0 ? "goal" : "miss",
        club: index === 0 ? homeClub : awayClub,
        playerName: `Player ${index + 1}`,
      }));

  return buildCareerMatchdayPhaseView({
    saveId: "save:playback",
    currentDateIso: "2026-08-01",
    selectedClub: awayClub,
    fixture: {
      fixtureId: "fixture:playback",
      dateIso: "2026-08-01",
      round: 1,
      homeClub,
      awayClub,
      selectedClubSide: "away",
    },
    phase: "half_time",
    currentMinute: 45,
    scoreboard: { homeGoals: 1, awayGoals: 0 },
    events,
    players: [],
  });
}

function fullTimeView() {
  return buildCareerMatchdayPhaseView({
    saveId: "save:playback",
    currentDateIso: "2026-08-01",
    selectedClub: awayClub,
    fixture: {
      fixtureId: "fixture:playback",
      dateIso: "2026-08-01",
      round: 1,
      homeClub,
      awayClub,
      selectedClubSide: "away",
    },
    phase: "full_time",
    currentMinute: 90,
    scoreboard: { homeGoals: 3, awayGoals: 0 },
    events: [
      { eventId: "event:goal:first", minute: 12, kind: "goal", club: homeClub, playerName: "Filippo Costa" },
      { eventId: "event:save:first", minute: 26, kind: "save", club: awayClub, playerName: "Davide Valentini" },
      { eventId: "event:goal:second", minute: 49, kind: "goal", club: homeClub, playerName: "Tommaso Leoni" },
      { eventId: "event:miss:second", minute: 63, kind: "miss", club: awayClub, playerName: "Nico Rinaldi" },
      { eventId: "event:goal:late", minute: 80, kind: "goal", club: homeClub, playerName: "Lorenzo Marini" },
    ],
    players: [],
  });
}

const homeClub = { clubId: "club:home", name: "U.S. Pisa" };
const awayClub = { clubId: "club:away", name: "S.S. Perugia" };
