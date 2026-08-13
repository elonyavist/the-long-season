import { describe, expect, it } from "vitest";
import { competitionId, fixtureId as matchFixtureId, playerId } from "@game/domain";

import {
  buildCareerMatchdayPhaseView,
  type BuildCareerMatchdayPhaseViewInput,
  type CareerMatchdayPhasePlayerInput,
} from "./career-matchday-phase-view.ts";
import type { CareerMatchdayClubInput, CareerMatchdayFixtureInput } from "./career-matchday-view.ts";

const selectedClub: CareerMatchdayClubInput = {
  clubId: "club:perugia",
  name: "S.S. Perugia",
};

const opponent: CareerMatchdayClubInput = {
  clubId: "club:pisa",
  name: "U.S. Pisa",
};

const fixture: CareerMatchdayFixtureInput = {
  fixtureId: "fixture:000003",
  dateIso: "2026-08-01",
  round: 1,
  homeClub: opponent,
  awayClub: selectedClub,
  selectedClubSide: "away",
};

describe("buildCareerMatchdayPhaseView", () => {
  it("builds a pre-match state with start action", () => {
    const view = buildCareerMatchdayPhaseView(baseInput("pre_match"));

    expect(view.status).toBe("pre_match");
    expect(view.periodLabelKey).toBe("career.matchday.phase.pre_match");
    expect(view.actions.map((action) => action.actionId)).toEqual(["start_first_half"]);
    expect(view.actions[0]?.status).toBe("available");
  });

  it("builds a first-half live state with timeline facts", () => {
    const view = buildCareerMatchdayPhaseView({
      ...baseInput("first_half"),
      currentMinute: 24,
      scoreboard: { homeGoals: 1, awayGoals: 0 },
      events: [
        {
          eventId: "event:goal",
          minute: 18,
          kind: "goal",
          club: opponent,
          playerName: "Lorenzo Marini",
        },
      ],
    });

    expect(view.status).toBe("live");
    expect(view.scoreboard.selectedClubScoreState).toBe("trailing");
    expect(view.timelineEvents[0]?.labelKey).toBe("career.matchday.event.goal");
    expect(view.keyEventCards.map((event) => event.eventId)).toEqual(["event:goal"]);
    expect(view.actions.map((action) => action.actionId)).toEqual(["resume_match"]);
  });

  it("passes through engine-owned cumulative statistics without recalculating them", () => {
    const statistics = {
      home: {
        possessionShare: 0.54,
        shots: 6,
        shotsOnTarget: 3,
        expectedGoals: 1.18,
        corners: 2,
        fouls: 4,
        yellowCards: 1,
        redCards: 0,
        saves: 1,
        goals: 1,
      },
      away: {
        possessionShare: 0.46,
        shots: 4,
        shotsOnTarget: 2,
        expectedGoals: 0.72,
        corners: 1,
        fouls: 5,
        yellowCards: 0,
        redCards: 0,
        saves: 2,
        goals: 0,
      },
    } as const;

    const view = buildCareerMatchdayPhaseView({
      ...baseInput("first_half"),
      statistics,
    });

    expect(view.statistics).toEqual(statistics);
    expect(view.statistics).not.toBe(statistics);
  });

  it("shows substitution action only at half-time", () => {
    const halfTime = buildCareerMatchdayPhaseView({
      ...baseInput("half_time"),
      currentMinute: 45,
      halfTimeSubstitutions: {
        canApply: true,
        appliedCount: 0,
        maxCount: 5,
      },
    });
    const secondHalf = buildCareerMatchdayPhaseView({
      ...baseInput("second_half"),
      currentMinute: 60,
      halfTimeSubstitutions: {
        canApply: true,
        appliedCount: 0,
        maxCount: 5,
      },
    });

    expect(halfTime.status).toBe("decision");
    expect(halfTime.actions.map((action) => action.actionId)).toEqual(["start_second_half"]);
    expect(secondHalf.actions.map((action) => action.actionId)).toEqual(["resume_match"]);
  });

  it("keeps an incident decision ahead of the half-time restart", () => {
    const view = buildCareerMatchdayPhaseView({
      ...baseInput("half_time"),
      currentMinute: 45,
      liveControl: {
        runState: "paused",
        pauseReason: "selected_club_red_card",
        pendingDecision: {
          type: "red_card_reorganization",
          minute: 45,
          side: "away",
          playerId: playerId("player:quiet"),
        },
      },
    });

    expect(view.actions.map((action) => action.actionId)).toEqual(["resolve_incident"]);
  });

  it("builds a second-half live state", () => {
    const view = buildCareerMatchdayPhaseView({
      ...baseInput("second_half"),
      currentMinute: 72,
      scoreboard: { homeGoals: 1, awayGoals: 1 },
    });

    expect(view.status).toBe("live");
    expect(view.scoreboard.selectedClubScoreState).toBe("drawing");
    expect(view.actions.map((action) => action.actionId)).toEqual(["resume_match"]);
  });

  it("shows consequences only at full time", () => {
    const notFullTime = buildCareerMatchdayPhaseView({
      ...baseInput("half_time"),
      currentMinute: 45,
      conditionChanges: [conditionChange()],
      playerStateChanges: [playerStateChange()],
      availabilityConsequences: [availabilityConsequence()],
      tacticalChapters: [tacticalChapter()],
    });
    const fullTime = buildCareerMatchdayPhaseView({
      ...baseInput("full_time"),
      currentMinute: 90,
      scoreboard: { homeGoals: 1, awayGoals: 2 },
      conditionChanges: [conditionChange()],
      playerStateChanges: [playerStateChange()],
      availabilityConsequences: [availabilityConsequence()],
      tacticalChapters: [tacticalChapter()],
      nextActionId: "back_to_dashboard",
    });

    expect(notFullTime.conditionChanges).toEqual([]);
    expect(notFullTime.playerStateChanges).toEqual([]);
    expect(notFullTime.availabilityConsequences).toEqual([]);
    expect(notFullTime.tacticalChapters).toEqual([]);
    expect(fullTime.status).toBe("complete");
    expect(fullTime.conditionChanges).toHaveLength(1);
    expect(fullTime.playerStateChanges).toHaveLength(1);
    expect(fullTime.availabilityConsequences).toEqual([availabilityConsequence()]);
    expect(fullTime.tacticalChapters).toEqual([tacticalChapter()]);
    expect(fullTime.nextActionId).toBe("back_to_dashboard");
    expect(fullTime.actions.map((action) => action.actionId)).toEqual(["back_to_dashboard"]);
  });

  it("orders player rows by useful impact", () => {
    const view = buildCareerMatchdayPhaseView({
      ...baseInput("half_time"),
      currentMinute: 45,
      players: [
        playerRow("player:quiet", "Quiet Player", 6),
        { ...playerRow("player:scorer", "Scorer", 7.1), goals: 1 },
      ],
    });

    expect(view.playerRows.map((row) => row.playerId)).toEqual(["player:scorer", "player:quiet"]);
  });
});

function baseInput(phase: BuildCareerMatchdayPhaseViewInput["phase"]): BuildCareerMatchdayPhaseViewInput {
  return {
    saveId: "save:phase66",
    currentDateIso: "2026-08-01",
    selectedClub,
    fixture,
    phase,
    currentMinute: 0,
    scoreboard: { homeGoals: 0, awayGoals: 0 },
    events: [],
    players: [playerRow("player:quiet", "Quiet Player", 6)],
  };
}

function playerRow(playerId: string, playerName: string, rating: number): CareerMatchdayPhasePlayerInput {
  return {
    playerId,
    playerName,
    club: selectedClub,
    roleKey: "attacker",
    rating,
    condition: 92,
    status: "on_pitch",
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    saves: 0,
    blocks: 0,
  };
}

function conditionChange() {
  return {
    playerId: "player:quiet",
    playerName: "Quiet Player",
    before: 100,
    after: 92,
    delta: -8,
  };
}

function playerStateChange() {
  return {
    playerId: "player:quiet",
    playerName: "Quiet Player",
    formBefore: 50,
    formAfter: 51,
    formDelta: 1,
    moraleBefore: 50,
    moraleAfter: 51,
    moraleDelta: 1,
    reasonKeys: ["match_result_win"],
  };
}

function availabilityConsequence() {
  return {
    type: "suspension" as const,
    fixtureId: matchFixtureId("fixture:000003"),
    competitionId: competitionId("competition:demo"),
    playerId: playerId("player:quiet"),
    reason: "straight_red" as const,
    matches: 3,
  };
}

function tacticalChapter() {
  const empty = {
    shots: 0,
    goals: 0,
    expectedGoals: 0,
    averageChanceQuality: "not_observed" as const,
    attemptedRoutes: [],
    scoringRoutes: [],
  };
  return {
    startMinute: 1,
    endMinute: 90,
    trigger: { type: "kickoff" as const },
    home: empty,
    away: empty,
  };
}
