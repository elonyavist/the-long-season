import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCareerMatchdayPhaseView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildDemoMatchPreparationView,
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
  saveDemoMatchPreparation,
} from "../match-preparation/match-preparation-demo";
import {
  applyDemoHalfTimeSubstitutions,
  buildDemoHalfTimeSubstitutionPanel,
  buildDemoMatchdayView,
  buildDemoMatchdayPhaseView,
  createInitialDemoMatchdayState,
  playDemoMatchdayFirstHalf,
  playDemoMatchdayFixture,
  playDemoMatchdaySecondHalf,
} from "./matchday-demo";
import { CareerMatchdayScreen } from "./CareerMatchdayScreen";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";

describe("CareerMatchdayScreen", () => {
  it("renders a blocked matchday with preparation action", () => {
    const markup = renderMatchday(buildDemoMatchdayView(
      createInitialDemoMatchdayState(),
      createInitialDemoMatchPreparationState(),
    ));

    expect(markup).toContain("tls-matchday-panel");
    expect(markup).toContain("Matchday blocked");
    expect(markup).toContain("missing saved lineup");
    expect(markup).toContain("missing saved tactic");
    expect(markup).toContain("Prepare match");
    expect(markup).not.toContain("Key events");
    expect(markup).not.toContain("Player stats");
  });

  it("renders a ready matchday with play action", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const markup = renderMatchday(buildDemoMatchdayView(createInitialDemoMatchdayState(), savedPreparation));

    expect(markup).toContain("Ready to play");
    expect(markup).toContain("tls-match-broadcast-frame");
    expect(markup).toContain("Match centre");
    expect(markup).toContain("tls-matchday-scoreboard");
    expect(markup).toContain("tls-match-centre-phase-rail");
    expect(markup).toContain("U.S. Pisa");
    expect(markup).toContain("S.S. Perugia");
    expect(markup).toContain("U.S. Pisa vs S.S. Perugia is ready");
    expect(markup).toContain("Fixture");
    expect(markup).toContain("Start match");
    expect(markup.match(/Start match/g) ?? []).toHaveLength(1);
    expect(markup).not.toContain("Live line");
    expect(markup).not.toContain("Next command");
    expect(markup).not.toContain("tls-matchday-context-strip");
    expect(markup).not.toContain("Key events");
    expect(markup).not.toContain("Player stats");
    expect(markup).not.toContain("No events yet");
    expect(markup).not.toContain("Tactical board");
    expect(markup).not.toContain("tls-matchday-dashboard");
    expect(markup).not.toContain("Form and morale");
  });

  it("renders phase progress as passive indicators instead of controls", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const markup = renderMatchday(buildDemoMatchdayView(createInitialDemoMatchdayState(), savedPreparation));
    const phaseRail = markup.slice(markup.indexOf("tls-match-centre-phase-rail"), markup.indexOf("</ol>") + 5);

    expect(phaseRail).toContain('aria-label="Match phase progress"');
    expect(phaseRail).toContain('aria-current="step"');
    expect(phaseRail).toContain('data-phase="pre_match"');
    expect(phaseRail).toContain('data-status="current"');
    expect(phaseRail).not.toContain("<button");
    expect(phaseRail).not.toContain("<a ");
  });

  it("renders first-half facts as a live event screen with one advance command", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const markup = renderMatchday(
      buildDemoMatchdayView(createInitialDemoMatchdayState(), savedPreparation),
      buildPresenterPhaseView([
        { eventId: "event:first-half-goal", minute: 22, kind: "goal", club: presenterHomeClub, playerName: "Filippo Costa" },
        { eventId: "event:first-half-save", minute: 38, kind: "save", club: presenterAwayClub, playerName: "Davide Valentini" },
      ], "first_half"),
    );

    expect(markup).toContain("First half");
    expect(markup).toContain("Play to half-time");
    expect(markup.match(/Play to half-time/g) ?? []).toHaveLength(1);
    expect(markup).toContain("tls-match-centre-live-phase");
    expect(markup).toContain("tls-match-centre-live-event is-goal");
    expect(markup).toContain("tls-match-centre-live-event is-detail");
    expect(markup).toContain("22&#x27; Goal U.S. Pisa Filippo Costa");
    expect(markup).toContain("Filippo Costa");
    expect(markup).toContain("Davide Valentini");
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("Final ratings");
    expect(markup).not.toContain("Player stats");
  });

  it("renders second-half facts as a live pressure screen with one full-time command", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const markup = renderMatchday(
      buildDemoMatchdayView(createInitialDemoMatchdayState(), savedPreparation),
      buildPresenterPhaseView([
        { eventId: "event:first-half-context-goal", minute: 22, kind: "goal", club: presenterHomeClub, playerName: "Filippo Costa" },
        { eventId: "event:second-half-goal", minute: 63, kind: "goal", club: presenterHomeClub, playerName: "Tommaso Leoni" },
        { eventId: "event:second-half-save", minute: 72, kind: "save", club: presenterAwayClub, playerName: "Davide Valentini" },
      ], "second_half"),
    );

    expect(markup).toContain("Second half");
    expect(markup).toContain("Play to full time");
    expect(markup.match(/Play to full time/g) ?? []).toHaveLength(1);
    expect(markup).toContain("tls-match-centre-live-phase");
    expect(markup).toContain("tls-match-centre-pressure-strip");
    expect(markup).toContain("Match pressure");
    expect(markup).toContain("Your side");
    expect(markup).toContain("tls-match-centre-live-event is-goal");
    expect(markup).toContain("tls-match-centre-live-event is-detail");
    expect(markup).toContain("Tommaso Leoni");
    expect(markup).toContain("Davide Valentini");
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("Final ratings");
    expect(markup).not.toContain("Player stats");
  });

  it("renders half-time as a decision phase without full-time consequences", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTimeState = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const markup = renderMatchday(
      buildDemoMatchdayView(halfTimeState, savedPreparation),
      buildDemoMatchdayPhaseView(halfTimeState),
      buildDemoHalfTimeSubstitutionPanel(halfTimeState),
      savedPreparation,
    );

    expect(markup).toContain("Half-time");
    expect(markup).toContain("Start second half");
    expect(markup.match(/Start second half/g) ?? []).toHaveLength(1);
    expect(markup).toContain("Half-time score");
    expect(markup).toContain("First-half tabellino");
    expect(markup).toContain("Decision signals");
    expect(markup).toContain("Watch list");
    expect(markup).toContain("Key contributors");
    expect(markup).toContain("Half-time board");
    expect(markup).toContain("First-half review");
    expect(markup).toContain("Tactical board");
    expect(markup).toContain("tls-tactical-bench-board");
    expect(markup).toContain("Current shape");
    expect(markup).toContain("Contribution");
    expect(markup).not.toContain("Player signals");
    expect(markup).not.toContain("Timeline");
    expect(markup).not.toContain("Form and morale");
    expect(markup).not.toContain("Player off");
    expect(markup).not.toContain("Apply substitution");
  });

  it("renders applied and invalid half-time substitution feedback", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTimeState = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const outgoingPlayerId = halfTimeState.stagedProgress?.state.simulation.context.away.lineup[1]?.playerId;
    const incomingPlayerId = halfTimeState.stagedProgress?.selectedBenchPlayerIds[0];

    if (outgoingPlayerId === undefined || incomingPlayerId === undefined) {
      throw new Error("Expected selected-club away lineup and bench for screen substitution feedback test");
    }

    const substituted = applyDemoHalfTimeSubstitutions(halfTimeState, [{ outgoingPlayerId, incomingPlayerId }]);
    const nextOutgoingPlayerId = substituted.stagedProgress?.state.simulation.context.away.lineup
      .find((slot) => slot.playerId !== incomingPlayerId)
      ?.playerId;

    if (nextOutgoingPlayerId === undefined) {
      throw new Error("Expected a remaining selected-club player for invalid screen substitution feedback test");
    }

    const invalid = applyDemoHalfTimeSubstitutions(substituted, [{
      outgoingPlayerId: nextOutgoingPlayerId,
      incomingPlayerId,
    }]);
    const markup = renderMatchday(
      buildDemoMatchdayView(invalid, savedPreparation),
      buildDemoMatchdayPhaseView(invalid),
      buildDemoHalfTimeSubstitutionPanel(invalid),
    );

    expect(markup).toContain("Applied substitutions");
    expect(markup).toContain("The incoming player is already on the pitch.");
  });

  it("renders played result as a post-match review ordered by tabellino, ratings, and consequences", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTimeState = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const playedState = playDemoMatchdaySecondHalf(halfTimeState, savedPreparation);
    const markup = renderMatchday(
      buildDemoMatchdayView(playedState, savedPreparation),
      buildDemoMatchdayPhaseView(playedState),
    );

    expect(markup).toContain("Full time");
    expect(markup).toContain("tls-matchday-scoreboard");
    expect(markup).toContain("tls-match-centre-full-time");
    expect(markup).toContain("Match tabellino");
    expect(markup).toContain("tls-match-centre-tabellino-event is-goal");
    expect(markup).toContain("Final ratings");
    expect(markup).toContain('aria-label="Player ratings table"');
    expect(markup).toContain("Post-match state");
    expect(markup).toContain("Condition");
    expect(markup).toContain("Form and morale");
    expect(markup).toContain("Return to dashboard");
    expect(markup).not.toContain(">Continue</button>");
    expect(markup).not.toContain("Timeline");
    expect(markup).not.toContain("Play to full time");
    expect(markup).not.toContain("Start second half");
    expect(markup).not.toContain("Half-time board");
    expect(markup).not.toContain("tls-match-centre-live-phase");
    expect(markup).not.toContain("tls-matchday-dashboard");

    const tabellinoIndex = markup.indexOf("Match tabellino");
    const ratingsIndex = markup.indexOf("Final ratings");
    const consequencesIndex = markup.indexOf("Post-match state");

    expect(tabellinoIndex).toBeGreaterThan(-1);
    expect(ratingsIndex).toBeGreaterThan(-1);
    expect(consequencesIndex).toBeGreaterThan(-1);
    expect(tabellinoIndex).toBeLessThan(ratingsIndex);
    expect(ratingsIndex).toBeLessThan(consequencesIndex);
  });

  it("keeps the legacy full-time report compatible while the app wiring migrates", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const playedState = playDemoMatchdayFixture(createInitialDemoMatchdayState(), savedPreparation);
    const markup = renderMatchday(buildDemoMatchdayView(playedState, savedPreparation));

    expect(markup).toContain("Full time");
    expect(markup).toContain("Match tabellino");
    expect(markup).toContain("Post-match state");
  });
});

describe("career matchday presentation contract", () => {
  it("groups goals, penalties, and real structured facts into the tabellino lane", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([
      { eventId: "event:miss", minute: 6, kind: "miss", club: presenterHomeClub, playerName: "Filippo Costa" },
      { eventId: "event:penalty", minute: 12, kind: "penalty_goal", club: presenterHomeClub, playerName: "Filippo Costa" },
      { eventId: "event:card", minute: 20, kind: "yellow_card", club: presenterAwayClub, playerName: "Nico Rinaldi" },
      { eventId: "event:sub", minute: 46, kind: "substitution", club: presenterAwayClub, playerName: "Marco Esposito" },
      { eventId: "event:goal", minute: 82, kind: "goal", club: presenterHomeClub, playerName: "Tommaso Leoni" },
      { eventId: "event:save", minute: 88, kind: "save", club: presenterAwayClub, playerName: "Davide Valentini" },
    ]));

    expect(presentation.eventGroups.hasTabellino).toBe(true);
    expect(presentation.eventGroups.tabellino.map((event) => `${event.visualPriority}:${event.event.kind}`)).toEqual([
      "goal:goal",
      "high:penalty_goal",
      "secondary:yellow_card",
      "secondary:substitution",
    ]);
    expect(presentation.eventGroups.liveFeed.map((event) => event.event.kind)).toEqual(["miss", "save"]);
  });

  it("keeps empty event phases explicit without inventing fake match facts", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([]));

    expect(presentation.eventGroups.hasTabellino).toBe(false);
    expect(presentation.eventGroups.hasLiveFeed).toBe(false);
    expect(presentation.eventGroups.tabellino).toEqual([]);
    expect(presentation.eventGroups.liveFeed).toEqual([]);
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
  });

  it("selects full-time progression as the only second-half command", () => {
    const presentation = buildCareerMatchdayPresentationView(buildPresenterPhaseView([], "second_half"));

    expect(presentation.primaryAction?.actionId).toBe("continue_to_full_time");
    expect(presentation.phaseIndicators.map((phase) => `${phase.phase}:${phase.status}`)).toEqual([
      "pre_match:complete",
      "first_half:complete",
      "half_time:complete",
      "second_half:current",
      "full_time:upcoming",
    ]);
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
    case "half_time":
      return 45;
    case "second_half":
    case "full_time":
      return 90;
    case "extra_time":
    case "penalties":
      return 120;
  }
}

function renderMatchday(
  view: Parameters<typeof CareerMatchdayScreen>[0]["view"],
  phaseView?: Parameters<typeof CareerMatchdayScreen>[0]["phaseView"],
  halfTimeSubstitutions?: Parameters<typeof CareerMatchdayScreen>[0]["halfTimeSubstitutions"],
  matchPreparationState?: ReturnType<typeof saveDemoMatchPreparation>["state"],
): string {
  return renderToStaticMarkup(
    React.createElement(CareerMatchdayScreen, {
      view,
      text: createWebTranslator("en"),
      onBackToMenu: () => undefined,
      onBackToDashboard: () => undefined,
      onContinueCareer: () => undefined,
      onInboxActionClick: () => undefined,
      onPrepareMatch: () => undefined,
      onPlayFixture: () => undefined,
      ...(phaseView === undefined ? {} : { phaseView }),
      ...(halfTimeSubstitutions === undefined ? {} : { halfTimeSubstitutions }),
      ...(matchPreparationState === undefined
        ? {}
        : {
            matchPreparationView: buildDemoMatchPreparationView(matchPreparationState),
            tacticalBoardDraft: matchPreparationState.tacticalBoardDraft,
          }),
      onApplyHalfTimeSubstitution: () => undefined,
    }),
  );
}
