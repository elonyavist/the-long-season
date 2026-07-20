import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";
import { MatchdayFullTimePhase } from "./MatchdayFullTimePhase";
import { MatchdayTeamRatings } from "./MatchdayTeamRatings";

const selectedClub = { clubId: "club:selected", name: "S.S. Perugia" };
const opponentClub = { clubId: "club:opponent", name: "U.S. Pisa" };

describe("MatchdayFullTimePhase", () => {
  it("opens on final statistics and exposes three focused review tabs", () => {
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
    expect(markup).toContain('data-motion-tab-panel="summary"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(3);
    expect(markup).toContain("Match summary");
    expect(markup).toContain("Possession");
    expect(markup).toContain("Shots on target");
    expect(markup).not.toContain("Nico Rinaldi");
    expect(markup).not.toContain("Consequences");
    expect(markup).not.toContain("Next action");
    expect(markup).not.toContain("unknown");
    expect(markup).not.toContain(">none<");
    expect(markup).not.toContain("Match tabellino");
    expect(markup).not.toContain("tls-match-centre-full-time-event");
  });

  it("keeps the removed standalone consequence panel out of the final review", () => {
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
    expect(markup).not.toContain("Consequences");
  });

  it("renders selected-club consequences inside the relevant player row", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPhase());
    const review = presentation.fullTimeReview;
    if (review === undefined) throw new Error("Expected a full-time review");

    const markup = renderToStaticMarkup(
      React.createElement(MatchdayTeamRatings, {
        clubName: review.selectedClubName,
        consequences: review.selectedTeamConsequences,
        rows: review.selectedTeamPlayers,
        text: createWebTranslator("en"),
        variant: "final",
      }),
    );

    expect(markup).toContain("Nico Rinaldi");
    expect(markup).toContain("Condition 100 -&gt; 91 (-9)");
    expect(markup).toContain("Form 50 -&gt; 52 (+2)");
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
    statistics: {
      home: {
        possessionShare: 0.55,
        shots: 10,
        shotsOnTarget: 5,
        expectedGoals: 1.7,
        corners: 4,
        fouls: 8,
        yellowCards: 1,
        redCards: 0,
        saves: 2,
        goals: 2,
      },
      away: {
        possessionShare: 0.45,
        shots: 7,
        shotsOnTarget: 3,
        expectedGoals: 1.1,
        corners: 3,
        fouls: 10,
        yellowCards: 2,
        redCards: 0,
        saves: 3,
        goals: 1,
      },
    },
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
