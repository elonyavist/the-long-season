import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";
import { MatchdayLivePhase } from "./MatchdayLivePhase";

describe("MatchdayLivePhase", () => {
  it("renders score-relevant events as cards and announces one localized live line", () => {
    const phaseView = buildCareerMatchdayPhaseView({
      saveId: "save:live-phase",
      currentDateIso: "2026-08-01",
      selectedClub: awayClub,
      fixture: {
        fixtureId: "fixture:live-phase",
        dateIso: "2026-08-01",
        round: 1,
        homeClub,
        awayClub,
        selectedClubSide: "away",
      },
      phase: "first_half",
      currentMinute: 22,
      scoreboard: { homeGoals: 1, awayGoals: 0 },
      events: [{
        eventId: "event:goal",
        minute: 22,
        kind: "goal",
        club: homeClub,
        playerName: "Filippo Costa",
      }],
      players: [],
    });
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayLivePhase, {
        phaseView,
        presentation: buildCareerMatchdayPresentationView(phaseView),
        liveLine: "22' Goal: U.S. Pisa - Filippo Costa",
        text: createWebTranslator("en"),
        playbackStage: "event",
      }),
    );

    expect(markup).toContain('data-playback-stage="event"');
    expect(markup).toContain("tls-match-centre-live-event is-goal");
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup.match(/22&#x27; Goal: U\.S\. Pisa - Filippo Costa/g) ?? []).toHaveLength(2);
  });

  it("reuses the live composition for second-half pressure without exposing a reveal command", () => {
    const phaseView = buildCareerMatchdayPhaseView({
      saveId: "save:live-phase",
      currentDateIso: "2026-08-01",
      selectedClub: awayClub,
      fixture: {
        fixtureId: "fixture:live-phase",
        dateIso: "2026-08-01",
        round: 1,
        homeClub,
        awayClub,
        selectedClubSide: "away",
      },
      phase: "second_half",
      currentMinute: 63,
      scoreboard: { homeGoals: 1, awayGoals: 0 },
      events: [{
        eventId: "event:save",
        minute: 63,
        kind: "save",
        club: awayClub,
        playerName: "Davide Valentini",
      }],
      players: [],
    });
    const presentation = buildCareerMatchdayPresentationView(phaseView);
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayLivePhase, {
        phaseView,
        presentation,
        liveLine: "63' Save: S.S. Perugia - Davide Valentini",
        text: createWebTranslator("en"),
        playbackStage: "event",
      }),
    );

    expect(presentation.primaryAction).toBeUndefined();
    expect(markup).toContain("tls-match-centre-pressure-strip");
    expect(markup).toContain('data-playback-stage="event"');
    expect(markup).toContain("63&#x27;");
  });
});

const homeClub = { clubId: "club:home", name: "U.S. Pisa" };
const awayClub = { clubId: "club:away", name: "S.S. Perugia" };
