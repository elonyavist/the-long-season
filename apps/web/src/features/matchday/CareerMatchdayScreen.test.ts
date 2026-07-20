import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { buildMatchPreparationView } from "../match-preparation/match-preparation-adapter";
import {
  createFullTimeTestFixture,
  createHalfTimeTestFixture,
  createPreMatchTestFixture,
  createTestCareerFixture,
  type TestCareerFixture,
} from "../../test-fixtures/career-fixture";
import {
  buildWebMatchdayPhaseView,
  buildWebMatchdayView,
  createWebMatchdayState,
} from "./matchday-adapter";
import { CareerMatchdayScreen } from "./CareerMatchdayScreen";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";

describe("CareerMatchdayScreen", () => {
  it("renders a blocked matchday with preparation action", () => {
    const fixture = createTestCareerFixture("screen-blocked");
    const state = createWebMatchdayState(fixture.career);
    const markup = renderMatchday(
      buildWebMatchdayView(state, fixture.draft),
      buildWebMatchdayPhaseView(state),
    );

    expect(markup).toContain("tls-matchday-panel");
    expect(markup).toContain("<span>Pre-match</span>");
    expect(markup).toContain("missing saved lineup");
    expect(markup).toContain("missing saved tactic");
    expect(markup).toContain("Prepare match");
    expect(markup).not.toContain("Key events");
    expect(markup).not.toContain("Player stats");
  });

  it("renders a ready matchday with play action", () => {
    const fixture = createPreMatchTestFixture("screen-ready");
    const markup = renderMatchday(fixture.view, fixture.phaseView);

    expect(markup).toContain("tls-match-broadcast-frame");
    expect(markup).toContain('data-motion-active="false"');
    expect(markup).toContain('data-motion-checkpoint="pre_match"');
    expect(markup).toContain("Match centre");
    expect(markup).toContain("tls-matchday-scoreboard");
    expect(markup.match(/data-score-motion=/g) ?? []).toHaveLength(2);
    expect(markup).not.toContain("tls-matchday-clock");
    expect(markup).not.toContain('data-score-changed="true"');
    expect(markup).toContain("tls-match-centre-phase-rail");
    expect(markup).toContain(fixture.phaseView.fixture.homeClub.name);
    expect(markup).toContain(fixture.phaseView.fixture.awayClub.name);
    expect(markup).toContain("Start match");
    expect(markup).toContain('data-state="idle"');
    expect(markup.match(/Start match/g) ?? []).toHaveLength(1);
    const screenHeader = markup.slice(
      markup.indexOf("tls-matchday-header"),
      markup.indexOf("</header>") + 9,
    );
    expect(screenHeader).toContain("Matchday");
    expect(screenHeader).toContain("tls-matchday-primary-action");
    expect(screenHeader).toContain("Start match");
    expect(markup.indexOf("tls-matchday-header")).toBeLessThan(markup.indexOf("tls-match-broadcast-frame"));
    expect(markup).not.toContain("Live line");
    expect(markup).not.toContain("Next command");
    expect(markup).not.toContain("tls-matchday-context-strip");
    expect(markup).not.toContain("Key events");
    expect(markup).not.toContain("Player stats");
    expect(markup).not.toContain("No events yet");
    expect(markup).not.toContain("Tactical board");
    expect(markup).not.toContain("tls-matchday-dashboard");
    expect(markup).not.toContain("Form and morale");
    expect(markup).not.toContain("tls-match-centre-pre-match");
    expect(markup).not.toContain("Ready to play");
    expect(markup).not.toContain(">Fixture<");
    expect(markup).not.toContain(">Venue<");
  });

  it("renders phase progress as passive indicators instead of controls", () => {
    const fixture = createPreMatchTestFixture("screen-phase-rail");
    const markup = renderMatchday(fixture.view, fixture.phaseView);
    const phaseRail = markup.slice(markup.indexOf("tls-match-centre-phase-rail"), markup.indexOf("</ol>") + 5);

    expect(phaseRail).toContain('aria-label="Match phase progress"');
    expect(phaseRail).toContain('aria-current="step"');
    expect(phaseRail).toContain('data-phase="pre_match"');
    expect(phaseRail).toContain('data-status="current"');
    expect(phaseRail).not.toContain("<button");
    expect(phaseRail).not.toContain("<a ");
  });

  it("renders first-half playback facts without a second reveal command", () => {
    const fixture = createPreMatchTestFixture("screen-first-half");
    const markup = renderMatchday(
      fixture.view,
      buildPresenterPhaseView([
        { eventId: "event:first-half-goal", minute: 22, kind: "goal", club: presenterHomeClub, playerName: "Filippo Costa" },
        { eventId: "event:first-half-save", minute: 38, kind: "save", club: presenterAwayClub, playerName: "Davide Valentini" },
      ], "first_half"),
    );

    expect(markup).toContain("First half");
    expect(markup).toContain('class="tls-matchday-clock"');
    expect(markup).toContain('data-clock-running="false"');
    expect(markup).toContain('data-motion-clock-minute="38"');
    expect(markup).toContain('aria-label="Minute 38"');
    const screenHeader = markup.slice(
      markup.indexOf("tls-matchday-header"),
      markup.indexOf("</header>") + 9,
    );
    expect(screenHeader).toContain("tls-matchday-playback-controls");
    expect(markup.indexOf("tls-match-centre-phase-rail"))
      .toBeLessThan(markup.indexOf("tls-match-broadcast-live-line"));
    expect(markup).not.toContain("tls-matchday-score-status");
    expect(markup).not.toContain("Play to half-time");
    expect(markup).not.toContain("tls-match-centre-live-phase");
    expect(markup).not.toContain("tls-match-centre-live-event");
    expect(markup).toContain('class="tls-match-broadcast-live-line"');
    expect(markup.match(/data-motion-commentary-key=/g) ?? []).toHaveLength(1);
    expect(markup).toContain("38&#x27; Save: S.S. Perugia - Davide Valentini");
    expect(markup).toContain("Davide Valentini");
    expect(markup.match(/tls-match-broadcast-live-line/g) ?? []).toHaveLength(1);
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("Final ratings");
    expect(markup).not.toContain("Player stats");
  });

  it("renders second-half facts as a live pressure screen without a reveal command", () => {
    const fixture = createPreMatchTestFixture("screen-second-half");
    const markup = renderMatchday(
      fixture.view,
      buildPresenterPhaseView([
        { eventId: "event:first-half-context-goal", minute: 22, kind: "goal", club: presenterHomeClub, playerName: "Filippo Costa" },
        { eventId: "event:second-half-goal", minute: 63, kind: "goal", club: presenterHomeClub, playerName: "Tommaso Leoni" },
        { eventId: "event:second-half-save", minute: 72, kind: "save", club: presenterAwayClub, playerName: "Davide Valentini" },
      ], "second_half"),
    );

    expect(markup).toContain("Second half");
    expect(markup).not.toContain("Play to full time");
    expect(markup).not.toContain("tls-match-centre-live-phase");
    expect(markup).not.toContain("tls-match-centre-pressure-strip");
    expect(markup).not.toContain("tls-match-centre-live-event");
    expect(markup).toContain("72&#x27; Save: S.S. Perugia - Davide Valentini");
    expect(markup).toContain("Davide Valentini");
    expect(markup.match(/tls-match-broadcast-live-line/g) ?? []).toHaveLength(1);
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("Final ratings");
    expect(markup).not.toContain("Player stats");
  });

  it("renders half-time as a decision phase without full-time consequences", () => {
    const fixture = createHalfTimeTestFixture("screen-half-time");
    const markup = renderMatchday(
      fixture.view,
      fixture.phaseView,
      fixture.teamControlPanel,
      fixture,
    );

    expect(markup).toContain("Half-time");
    expect(markup).toContain('data-motion-checkpoint="half_time"');
    expect(markup).toContain('data-motion-checkpoint-panel="half_time"');
    expect(markup).toContain("Start second half");
    expect(markup.match(/Start second half/g) ?? []).toHaveLength(1);
    expect(markup).toContain('aria-label="Half-time views"');
    expect(markup).toContain("Summary");
    expect(markup).toContain("Tactics");
    expect(markup).toContain("Your team");
    expect(markup).toContain("Opponent");
    expect(markup).not.toContain("Decision signals");
    expect(markup).toContain("Watch list");
    expect(markup).toContain("Key contributors");
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("Tactical board");
    expect(markup).not.toContain("tls-tactical-bench-board");
    expect(markup).not.toContain("Current shape");
    expect(markup).not.toContain("0/5 changes");
    expect(markup).not.toContain("Half-time score");
    expect(markup).not.toContain("First-half tabellino");
    expect(markup).not.toContain("Player signals");
    expect(markup).not.toContain("Timeline");
    expect(markup).not.toContain("Form and morale");
    expect(markup).not.toContain("Player off");
    expect(markup).not.toContain("Apply substitution");
  });

  it("uses half-time validation instead of stale pre-match blockers after a tactical edit", () => {
    const fixture = createHalfTimeTestFixture("screen-half-time-tactical-edit");
    const markup = renderMatchday(
      {
        ...fixture.view,
        blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
      },
      fixture.phaseView,
      fixture.teamControlPanel,
      fixture,
    );

    expect(markup).toContain("Start second half");
    expect(markup).not.toContain("Prepare match");
    expect(markup).not.toContain("missing saved lineup");
    expect(markup).not.toContain("missing saved tactic");
  });

  it("renders played result as a stable score and tabellino above one tabbed post-match review", () => {
    const fixture = createFullTimeTestFixture("screen-full-time-events");
    const markup = renderMatchday(
      fixture.view,
      fixture.phaseView,
    );

    expect(markup).toContain("Full time");
    expect(markup).toContain('data-motion-checkpoint="full_time"');
    expect(markup).toContain('data-motion-checkpoint-panel="full_time"');
    expect(markup).toContain("tls-matchday-scoreboard");
    expect(markup).toContain("tls-match-centre-full-time");
    expect(markup).toContain("Match tabellino");
    expect(markup).toContain("Match summary");
    expect(markup).toContain('aria-label="Full-time review views"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(3);
    expect(markup).toContain('aria-label="Match statistics"');
    expect(markup).not.toContain('aria-label="Player ratings table"');
    expect(markup).not.toContain("Post-match state");
    expect(markup).toContain("Continue");
    expect(markup.match(/data-action-id="back_to_dashboard"/g) ?? []).toHaveLength(1);
    expect(markup).not.toContain("Final ratings");
    expect(markup).not.toContain("Next action");
    expect(markup).not.toContain(">unknown<");
    expect(markup).not.toContain("on pitch");
    expect(markup).not.toContain("tls-matchday-table");
    expect(markup).not.toContain("Timeline");
    expect(markup).not.toContain("Play to full time");
    expect(markup).not.toContain("Start second half");
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("tls-match-centre-live-phase");
    expect(markup).not.toContain("tls-matchday-dashboard");

    const tabellinoIndex = markup.indexOf("Match tabellino");
    const summaryIndex = markup.indexOf("Match summary");

    expect(tabellinoIndex).toBeGreaterThan(-1);
    expect(summaryIndex).toBeGreaterThan(-1);
    expect(tabellinoIndex).toBeLessThan(summaryIndex);
  });

});

describe("career matchday presentation contract", () => {
  it("keeps only current goal and substitution facts in the persistent tabellino", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([
      { eventId: "event:miss", minute: 6, kind: "miss", club: presenterHomeClub, playerName: "Filippo Costa" },
      { eventId: "event:sub", minute: 46, kind: "substitution", club: presenterAwayClub, playerName: "Marco Esposito" },
      { eventId: "event:goal", minute: 82, kind: "goal", club: presenterHomeClub, playerName: "Tommaso Leoni" },
      { eventId: "event:save", minute: 88, kind: "save", club: presenterAwayClub, playerName: "Davide Valentini" },
    ]));

    expect(presentation.tabellino.incidents.map((incident) => `${incident.side}:${incident.visualPriority}:${incident.event.kind}`)).toEqual([
      "home:goal:goal",
      "away:secondary:substitution",
    ]);
  });

  it("keeps empty event phases explicit without inventing fake match facts", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([]));

    expect(presentation.tabellino.incidents).toEqual([]);
  });

  it("builds compact score, phase markers, and primary command facts", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([], "half_time"));

    expect(presentation.scoreHeader).toMatchObject({
      homeClubName: "U.S. Pisa",
      awayClubName: "S.S. Perugia",
      homeGoals: 1,
      awayGoals: 0,
      phase: "half_time",
      phaseLabelKey: "career.matchday.phase.half_time",
      minute: 45,
      round: 1,
      selectedClubScoreState: "trailing",
    });
    expect(presentation.primaryAction?.actionId).toBe("start_second_half");
    expect(presentation.phaseIndicators.map((phase) => `${phase.phase}:${phase.status}`)).toEqual([
      "pre_match:complete",
      "first_half:complete",
      "half_time:current",
      "second_half:upcoming",
      "full_time:upcoming",
    ]);
    expect(presentation.halfTimeReview).toBeDefined();
    expect(presentation.halfTimeReview?.watchList.map((row) => row.playerId)).toEqual(["player:valentini"]);
    expect(presentation.halfTimeReview?.contributors).toEqual([]);
  });

  it("replaces the obsolete second-half reveal command with a resume command", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([], "second_half"));

    expect(presentation.primaryAction?.actionId).toBe("resume_match");
    expect(presentation.phaseIndicators.map((phase) => `${phase.phase}:${phase.status}`)).toEqual([
      "pre_match:complete",
      "first_half:complete",
      "half_time:complete",
      "second_half:current",
      "full_time:upcoming",
    ]);
  });

  it("replaces the obsolete first-half reveal command with a resume command", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([], "first_half"));

    expect(presentation.primaryAction?.actionId).toBe("resume_match");
    expect(presentation.phaseIndicators.find((phase) => phase.phase === "first_half")?.status).toBe("current");
  });
});

const presenterAwayClub = {
  clubId: "club:perugia",
  name: "S.S. Perugia",
};

const presenterHomeClub = {
  clubId: "club:pisa",
  name: "U.S. Pisa",
};

function buildPresenterPhaseView(
  events: Parameters<typeof buildCareerMatchdayPhaseView>[0]["events"],
  phase: Parameters<typeof buildCareerMatchdayPhaseView>[0]["phase"] = "full_time",
) {
  return buildCareerMatchdayPhaseView({
    saveId: "save:presenter",
    currentDateIso: "2026-08-01",
    selectedClub: presenterAwayClub,
    fixture: {
      fixtureId: "fixture:000003",
      dateIso: "2026-08-01",
      round: 1,
      homeClub: presenterHomeClub,
      awayClub: presenterAwayClub,
      selectedClubSide: "away",
    },
    phase,
    currentMinute: minuteForPresenterPhase(phase),
    scoreboard: { homeGoals: 1, awayGoals: 0 },
    events,
    players: [
      {
        playerId: "player:valentini",
        playerName: "Davide Valentini",
        club: presenterAwayClub,
        roleKey: "goalkeeper",
        rating: 6.4,
        condition: 92,
        status: "on_pitch",
        goals: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        saves: 2,
        blocks: 0,
      },
    ],
  });
}

function minuteForPresenterPhase(phase: Parameters<typeof buildCareerMatchdayPhaseView>[0]["phase"]): number {
  switch (phase) {
    case "pre_match":
      return 0;
    case "first_half":
      return 38;
    case "half_time":
      return 45;
    case "second_half":
      return 72;
    case "full_time":
      return 90;
    case "extra_time":
    case "penalties":
      return 120;
  }
}

function renderMatchday(
  view: Parameters<typeof CareerMatchdayScreen>[0]["view"],
  phaseView: Parameters<typeof CareerMatchdayScreen>[0]["phaseView"],
  teamControlPanel?: Parameters<typeof CareerMatchdayScreen>[0]["teamControlPanel"],
  matchPreparationFixture?: TestCareerFixture,
): string {
  return renderToStaticMarkup(
    React.createElement(CareerMatchdayScreen, {
      view,
      text: createWebTranslator("en"),
      onBackToMenu: () => undefined,
      onBackToDashboard: () => undefined,
      onInboxActionClick: () => undefined,
      onPrepareMatch: () => undefined,
      onStartFirstHalf: () => undefined,
      onAdvanceMatchMinute: async () => undefined,
      onPauseMatch: () => undefined,
      onResumeMatch: () => undefined,
      onResolveIncident: () => undefined,
      onStartSecondHalf: () => undefined,
      phaseView,
      ...(teamControlPanel === undefined ? {} : { teamControlPanel }),
      ...(matchPreparationFixture === undefined
        ? {}
        : {
            matchPreparationView: buildMatchPreparationView(
              matchPreparationFixture.career,
              matchPreparationFixture.draft,
            ),
            tacticalBoardDraft: matchPreparationFixture.draft.tacticalBoardDraft,
          }),
      onApplyHalfTimeSubstitution: () => undefined,
    }),
  );
}
