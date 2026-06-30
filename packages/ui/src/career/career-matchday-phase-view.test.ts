import { describe, expect, it } from "vitest";

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
    expect(view.actions.map((action) => action.actionId)).toEqual(["continue_to_half_time"]);
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
    expect(secondHalf.actions.map((action) => action.actionId)).toEqual(["continue_to_full_time"]);
  });

  it("builds a second-half live state", () => {
    const view = buildCareerMatchdayPhaseView({
      ...baseInput("second_half"),
      currentMinute: 72,
      scoreboard: { homeGoals: 1, awayGoals: 1 },
    });

    expect(view.status).toBe("live");
    expect(view.scoreboard.selectedClubScoreState).toBe("drawing");
    expect(view.actions.map((action) => action.actionId)).toEqual(["continue_to_full_time"]);
  });

  it("shows consequences only at full time", () => {
    const notFullTime = buildCareerMatchdayPhaseView({
      ...baseInput("half_time"),
      currentMinute: 45,
      conditionChanges: [conditionChange()],
      playerStateChanges: [playerStateChange()],
    });
    const fullTime = buildCareerMatchdayPhaseView({
      ...baseInput("full_time"),
      currentMinute: 90,
      scoreboard: { homeGoals: 1, awayGoals: 2 },
      conditionChanges: [conditionChange()],
      playerStateChanges: [playerStateChange()],
      nextActionId: "back_to_dashboard",
    });

    expect(notFullTime.conditionChanges).toEqual([]);
    expect(notFullTime.playerStateChanges).toEqual([]);
    expect(fullTime.status).toBe("complete");
    expect(fullTime.conditionChanges).toHaveLength(1);
    expect(fullTime.playerStateChanges).toHaveLength(1);
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
