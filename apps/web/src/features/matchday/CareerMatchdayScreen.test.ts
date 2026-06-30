import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
  });

  it("renders a ready matchday with play action", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const markup = renderMatchday(buildDemoMatchdayView(createInitialDemoMatchdayState(), savedPreparation));

    expect(markup).toContain("Ready to play");
    expect(markup).toContain("U.S. Pisa");
    expect(markup).toContain("S.S. Perugia");
    expect(markup).toContain("Start match");
    expect(markup).not.toContain("tls-matchday-dashboard");
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
    expect(markup).toContain("Half-time tactics");
    expect(markup).toContain("Tactical board");
    expect(markup).toContain("tls-tactical-bench-board");
    expect(markup).toContain("Current shape");
    expect(markup).toContain("Timeline");
    expect(markup).toContain("Ratings, condition, and contribution");
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

  it("renders played result, events, stats, and consequences", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTimeState = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const playedState = playDemoMatchdaySecondHalf(halfTimeState, savedPreparation);
    const markup = renderMatchday(
      buildDemoMatchdayView(playedState, savedPreparation),
      buildDemoMatchdayPhaseView(playedState),
    );

    expect(markup).toContain("Full time");
    expect(markup).toContain("tls-matchday-scoreboard");
    expect(markup).toContain("Key events");
    expect(markup).toContain("Player stats");
    expect(markup).toContain("Condition");
    expect(markup).toContain("Form and morale");
    expect(markup).toContain("Continue");
    expect(markup).not.toContain("tls-matchday-dashboard");
  });

  it("keeps the legacy full-time report compatible while the app wiring migrates", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const playedState = playDemoMatchdayFixture(createInitialDemoMatchdayState(), savedPreparation);
    const markup = renderMatchday(buildDemoMatchdayView(playedState, savedPreparation));

    expect(markup).toContain("Full time");
    expect(markup).toContain("Highlights");
    expect(markup).toContain("Consequences");
  });
});

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
