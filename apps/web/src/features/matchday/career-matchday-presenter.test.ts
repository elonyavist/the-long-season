import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import {
  buildCareerMatchdayPresentationView,
  buildMatchdayFullTimeReviewView,
  buildMatchdayHalfTimeReviewView,
  buildMatchdayLiveMoment,
} from "./career-matchday-presenter";

const selectedClub = { clubId: "club:selected", name: "S.S. Perugia" };
const opponentClub = { clubId: "club:opponent", name: "U.S. Pisa" };

describe("half-time matchday presentation", () => {
  it("separates both teams and orders active players before observed substitutes", () => {
    const phaseView = buildCareerMatchdayPhaseView({
      saveId: "save:half-time-presenter",
      currentDateIso: "2026-08-01",
      selectedClub,
      fixture: {
        fixtureId: "fixture:half-time-presenter",
        dateIso: "2026-08-01",
        round: 1,
        homeClub: opponentClub,
        awayClub: selectedClub,
        selectedClubSide: "away",
      },
      phase: "half_time",
      currentMinute: 45,
      scoreboard: { homeGoals: 0, awayGoals: 0 },
      events: [],
      players: [
        { ...player("selected:bench", "Selected Bench", selectedClub, 8.5, 0), status: "bench" },
        { ...player("selected:active-low", "Selected Active Low", selectedClub, 6.1, 0), condition: 70 },
        { ...player("selected:active-high", "Selected Active High", selectedClub, 7.4, 1) },
        { ...player("opponent:bench", "Opponent Bench", opponentClub, 9.0, 0), status: "bench" },
        { ...player("opponent:active", "Opponent Active", opponentClub, 6.3, 0) },
      ],
      halfTimeSubstitutions: { canApply: true, appliedCount: 0, maxCount: 5 },
    });
    const review = buildMatchdayHalfTimeReviewView(phaseView);

    expect(review.selectedClubName).toBe("S.S. Perugia");
    expect(review.opponentClubName).toBe("U.S. Pisa");
    expect(review.selectedTeamPlayers.map((row) => row.playerId)).toEqual([
      "selected:active-high",
      "selected:active-low",
      "selected:bench",
    ]);
    expect(review.opponentPlayers.map((row) => row.playerId)).toEqual([
      "opponent:active",
      "opponent:bench",
    ]);
    expect(review.watchList.map((row) => row.playerId)).toEqual(["selected:active-low"]);
    expect(review.contributors.map((row) => row.playerId)).toEqual(["selected:active-high"]);
  });
});

describe("full-time matchday presentation", () => {
  it("separates both teams' final ratings and merges only decision-relevant durable consequences", () => {
    const phaseView = buildFullTimePhase({ homeGoals: 2, awayGoals: 1 });
    const review = buildMatchdayFullTimeReviewView(phaseView);

    expect(review.selectedClubName).toBe("S.S. Perugia");
    expect(review.opponentClubName).toBe("U.S. Pisa");
    expect(review.selectedTeamPlayers.map((row) => row.playerId)).toEqual([
      "player:selected-scorer",
      "player:selected-keeper",
    ]);
    expect(review.opponentPlayers.map((row) => row.playerId)).toEqual(["player:opponent"]);
    expect(review.consequences).toHaveLength(1);
    expect(review.consequences[0]).toMatchObject({
      playerId: "player:selected-scorer",
      condition: { delta: -8 },
      playerState: { formDelta: 2, moraleDelta: -1 },
    });
  });

  it("keeps a severe condition decline even without a separate form or morale change", () => {
    const phaseView = buildFullTimePhase({ homeGoals: 2, awayGoals: 1 });
    const review = buildMatchdayFullTimeReviewView({
      ...phaseView,
      conditionChanges: phaseView.conditionChanges.map((change) => (
        change.playerId === "player:selected-keeper"
          ? { ...change, after: 70, delta: -30 }
          : change
      )),
    });

    expect(review.consequences.map((change) => change.playerId)).toEqual([
      "player:selected-keeper",
      "player:selected-scorer",
    ]);
  });

  it.each([
    [{ homeGoals: 1, awayGoals: 2 }, "leading"],
    [{ homeGoals: 1, awayGoals: 1 }, "drawing"],
    [{ homeGoals: 2, awayGoals: 1 }, "trailing"],
  ] as const)("preserves deterministic win, draw, and loss score states", (scoreboard, expected) => {
    const presentation = buildCareerMatchdayPresentationView(buildFullTimePhase(scoreboard));

    expect(presentation.scoreHeader.selectedClubScoreState).toBe(expected);
    expect(presentation.fullTimeReview).toBeDefined();
  });

  it("keeps an event-light match record empty instead of inventing a story", () => {
    const phaseView = buildFullTimePhase({ homeGoals: 0, awayGoals: 0 });
    const presentation = buildCareerMatchdayPresentationView({
      ...phaseView,
      timelineEvents: [],
      keyEventCards: [],
    });

    expect(presentation.tabellino.incidents).toEqual([]);
  });
});

describe("persistent matchday tabellino", () => {
  it("keeps only current goal and substitution facts in chronological fixture lanes", () => {
    const presentation = buildCareerMatchdayPresentationView(buildFullTimePhase({ homeGoals: 2, awayGoals: 1 }));

    expect(presentation.tabellino).toMatchObject({
      homeClubName: "U.S. Pisa",
      awayClubName: "S.S. Perugia",
    });
    expect(presentation.tabellino.incidents.map((incident) => ({
      eventId: incident.event.eventId,
      kind: incident.event.kind,
      side: incident.side,
      visualPriority: incident.visualPriority,
    }))).toEqual([
      { eventId: "event:goal", kind: "goal", side: "away", visualPriority: "goal" },
      { eventId: "event:sub", kind: "substitution", side: "home", visualPriority: "secondary" },
    ]);
  });
});

describe("live matchday moment", () => {
  it("uses the frame-selected decisive event instead of the latest revealed detail", () => {
    const events = buildFullTimePhase({ homeGoals: 2, awayGoals: 1 }).timelineEvents;
    const moment = buildMatchdayLiveMoment(events, "event:goal");

    expect(moment).toMatchObject({
      visualPriority: "goal",
      event: { event: { eventId: "event:goal", playerName: "Nico Rinaldi" } },
    });
  });

  it("falls back to the latest fact outside timed playback and stays empty for an unknown frame event", () => {
    const events = buildFullTimePhase({ homeGoals: 2, awayGoals: 1 }).timelineEvents;

    expect(buildMatchdayLiveMoment(events)).toMatchObject({
      visualPriority: "detail",
      event: { event: { eventId: "event:save" } },
    });
    expect(buildMatchdayLiveMoment(events, "event:missing")).toEqual({
      visualPriority: "transition",
    });
  });
});

function buildFullTimePhase(scoreboard: Readonly<{ homeGoals: number; awayGoals: number }>) {
  return buildCareerMatchdayPhaseView({
    saveId: "save:full-time-presenter",
    currentDateIso: "2026-08-01",
    selectedClub,
    fixture: {
      fixtureId: "fixture:full-time-presenter",
      dateIso: "2026-08-01",
      round: 1,
      homeClub: opponentClub,
      awayClub: selectedClub,
      selectedClubSide: "away",
    },
    phase: "full_time",
    currentMinute: 90,
    scoreboard,
    events: [
      {
        eventId: "event:goal",
        minute: 55,
        kind: "goal",
        club: selectedClub,
        playerName: "Nico Rinaldi",
      },
      {
        eventId: "event:sub",
        minute: 72,
        kind: "substitution",
        club: opponentClub,
        playerName: "Lorenzo Marini",
      },
      {
        eventId: "event:save",
        minute: 86,
        kind: "save",
        club: selectedClub,
        playerName: "Davide Valentini",
      },
    ],
    players: [
      player("player:opponent", "Lorenzo Marini", opponentClub, 8.4, 1),
      player("player:selected-scorer", "Nico Rinaldi", selectedClub, 7.6, 1),
      player("player:selected-keeper", "Davide Valentini", selectedClub, 6.7, 0),
    ],
    conditionChanges: [
      {
        playerId: "player:selected-scorer",
        playerName: "Nico Rinaldi",
        before: 100,
        after: 92,
        delta: -8,
      },
      {
        playerId: "player:selected-keeper",
        playerName: "Davide Valentini",
        before: 100,
        after: 92,
        delta: -8,
      },
    ],
    playerStateChanges: [
      {
        playerId: "player:selected-scorer",
        playerName: "Nico Rinaldi",
        formBefore: 50,
        formAfter: 52,
        formDelta: 2,
        moraleBefore: 50,
        moraleAfter: 49,
        moraleDelta: -1,
        reasonKeys: ["player_goal"],
      },
      {
        playerId: "player:selected-keeper",
        playerName: "Davide Valentini",
        formBefore: 50,
        formAfter: 49,
        formDelta: -1,
        moraleBefore: 50,
        moraleAfter: 48,
        moraleDelta: -2,
        reasonKeys: ["result_loss"],
      },
    ],
    nextActionId: "back_to_dashboard",
  });
}

function player(
  playerId: string,
  playerName: string,
  club: typeof selectedClub,
  rating: number,
  goals: number,
) {
  return {
    playerId,
    playerName,
    club,
    roleKey: goals > 0 ? "attacker" : "goalkeeper",
    rating,
    condition: 92,
    status: "on_pitch" as const,
    goals,
    assists: 0,
    shots: goals,
    shotsOnTarget: goals,
    saves: goals > 0 ? 0 : 2,
    blocks: 0,
  };
}
