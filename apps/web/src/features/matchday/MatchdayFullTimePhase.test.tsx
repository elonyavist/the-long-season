import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";
import { MatchdayFullTimePhase } from "./MatchdayFullTimePhase";

const selectedClub = { clubId: "club:selected", name: "S.S. Perugia" };
const opponentClub = { clubId: "club:opponent", name: "U.S. Pisa" };

describe("MatchdayFullTimePhase", () => {
  it("opens on selected-club ratings and exposes three focused review tabs", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPhase());
    const review = presentation.fullTimeReview;

    if (review === undefined) throw new Error("Expected a full-time review");

    const markup = renderToStaticMarkup(
      React.createElement(MatchdayFullTimePhase, {
        review,
        text: createWebTranslator("en"),
      }),
    );
    expect(markup).toContain('aria-label="Full-time review views"');
    expect(markup).toContain('data-motion-active="false"');
    expect(markup).toContain('data-motion-checkpoint-panel="full_time"');
    expect(markup).toContain('data-motion-tab-panel="selected_team"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(3);
    expect(markup).toContain("Nico Rinaldi");
    expect(markup).toContain("Davide Valentini");
    expect(markup).not.toContain("Lorenzo Marini");
    expect(markup).toContain(">Fit<");
    expect(markup).toContain("Final rating, condition, role, contribution, and match status.");
    expect(markup).not.toContain("Post-match state");
    expect(markup).not.toContain("Next action");
    expect(markup).not.toContain("unknown");
    expect(markup).not.toContain(">none<");
    expect(markup).not.toContain("Match tabellino");
    expect(markup).not.toContain("tls-match-centre-full-time-event");
  });

  it("keeps absent consequences out of the default team view", () => {
    const presentation = buildCareerMatchdayPresentationView({
      ...buildPhase(),
      timelineEvents: [],
      keyEventCards: [],
      conditionChanges: [],
      playerStateChanges: [],
    });
    const review = presentation.fullTimeReview;

    if (review === undefined) throw new Error("Expected a full-time review");

    const markup = renderToStaticMarkup(
      React.createElement(MatchdayFullTimePhase, {
        review,
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).not.toContain("Match tabellino");
    expect(markup).not.toContain("Post-match state");
    expect(markup).toContain("Consequences");
  });
});

function buildPhase() {
  return buildCareerMatchdayPhaseView({
    saveId: "save:full-time-component",
    currentDateIso: "2026-08-01",
    selectedClub,
    fixture: {
      fixtureId: "fixture:full-time-component",
      dateIso: "2026-08-01",
      round: 1,
      homeClub: opponentClub,
      awayClub: selectedClub,
      selectedClubSide: "away",
    },
    phase: "full_time",
    currentMinute: 90,
    scoreboard: { homeGoals: 2, awayGoals: 1 },
    events: [
      { eventId: "event:goal", minute: 52, kind: "goal", club: selectedClub, playerName: "Nico Rinaldi" },
      { eventId: "event:sub", minute: 78, kind: "substitution", club: opponentClub, playerName: "Lorenzo Marini" },
    ],
    players: [
      {
        playerId: "player:selected-scorer",
        playerName: "Nico Rinaldi",
        club: selectedClub,
        roleKey: "attacker",
        rating: 7.5,
        condition: 91,
        status: "on_pitch",
        goals: 1,
        assists: 0,
        shots: 2,
        shotsOnTarget: 1,
        saves: 0,
        blocks: 0,
      },
      {
        playerId: "player:selected-keeper",
        playerName: "Davide Valentini",
        club: selectedClub,
        roleKey: "goalkeeper",
        rating: 6.4,
        condition: 93,
        status: "on_pitch",
        goals: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        saves: 3,
        blocks: 0,
      },
      {
        playerId: "player:opponent",
        playerName: "Lorenzo Marini",
        club: opponentClub,
        roleKey: "attacker",
        rating: 8.2,
        condition: 90,
        status: "on_pitch",
        goals: 1,
        assists: 0,
        shots: 3,
        shotsOnTarget: 2,
        saves: 0,
        blocks: 0,
      },
    ],
    conditionChanges: [{
      playerId: "player:selected-scorer",
      playerName: "Nico Rinaldi",
      before: 100,
      after: 91,
      delta: -9,
    }],
    playerStateChanges: [{
      playerId: "player:selected-scorer",
      playerName: "Nico Rinaldi",
      formBefore: 50,
      formAfter: 52,
      formDelta: 2,
      moraleBefore: 50,
      moraleAfter: 50,
      moraleDelta: 0,
      reasonKeys: ["player_goal"],
    }],
    nextActionId: "back_to_dashboard",
  });
}
