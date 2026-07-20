import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { createHalfTimeTestFixture } from "../../test-fixtures/career-fixture";
import { buildMatchPreparationView } from "../match-preparation/match-preparation-adapter";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";
import {
  buildMatchdayHalfTimeValidationIssues,
  MatchdayHalfTimePhase,
} from "./MatchdayHalfTimePhase";

describe("MatchdayHalfTimePhase", () => {
  it("opens a concise Summary and exposes four enabled half-time views", () => {
    const fixture = createHalfTimeTestFixture("half-time-phase-order");
    const presentation = buildCareerMatchdayPresentationView(fixture.phaseView);
    const review = presentation.halfTimeReview;

    if (review === undefined) throw new Error("Expected a half-time review");

    const preparationView = buildMatchPreparationView(fixture.career, fixture.draft);
    const validationIssues = buildMatchdayHalfTimeValidationIssues(
      preparationView,
      fixture.draft.tacticalBoardDraft,
      fixture.teamControlPanel,
    );
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayHalfTimePhase, {
        review,
        text: createWebTranslator("en"),
        validationIssues,
        matchPreparationView: preparationView,
        tacticalBoardDraft: fixture.draft.tacticalBoardDraft,
        substitutionPanel: fixture.teamControlPanel,
      }),
    );

    const summaryIndex = markup.indexOf("Half-time decisions");
    expect(summaryIndex).toBeGreaterThan(-1);
    expect(markup).toContain('class="tls-visually-hidden"');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Half-time views"');
    expect(markup).toContain('data-motion-active="false"');
    expect(markup).toContain('data-motion-checkpoint-panel="half_time"');
    expect(markup).toContain('data-motion-tab-panel="summary"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(4);
    expect(markup).not.toContain('disabled=""');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain("Summary");
    expect(markup).toContain("Tactics");
    expect(markup).toContain("Your team");
    expect(markup).toContain("Opponent");
    expect(markup).not.toContain("Tactical board");
    expect(markup).not.toContain("tls-tactical-bench-board");
    expect(markup).not.toContain("0/5 changes");
    expect(markup).toContain('data-tone="watch"');
    expect(markup).toContain('data-tone="positive"');
    expect(markup).not.toContain("Decision signals");
    expect(markup).not.toContain("Half-time score");
    expect(markup).not.toContain("First-half review");
    expect(markup).not.toContain("Match tabellino");
    expect(markup).not.toContain("Selected club");
  });

  it("deduplicates validation facts under one owner", () => {
    const fixture = createHalfTimeTestFixture("half-time-phase-validation");
    const preparationView = buildMatchPreparationView(fixture.career, fixture.draft);
    const issues = buildMatchdayHalfTimeValidationIssues(
      { ...preparationView, blockerKeys: ["missing_lineup_slot"] },
      fixture.draft.tacticalBoardDraft,
      {
        ...fixture.teamControlPanel,
        validationFactKeys: ["missing_lineup_slot", "incoming_already_on_pitch"],
      },
    );

    expect(issues.map((issue) => issue.issueId)).toEqual([
      "missing_lineup_slot",
      "incoming_already_on_pitch",
    ]);
  });

  it("keeps event-light decisions explicit without inventing match facts", () => {
    const fixture = createHalfTimeTestFixture("half-time-phase-empty");
    const presentation = buildCareerMatchdayPresentationView({
      ...fixture.phaseView,
      timelineEvents: [],
      playerRows: fixture.phaseView.playerRows.map((row) => ({
        ...row,
        rating: 6.8,
        condition: 100,
        goals: 0,
        assists: 0,
        shotsOnTarget: 0,
        saves: 0,
        blocks: 0,
      })),
    });
    const review = presentation.halfTimeReview;

    if (review === undefined) throw new Error("Expected a half-time review");

    const markup = renderToStaticMarkup(
      React.createElement(MatchdayHalfTimePhase, {
        review,
        text: createWebTranslator("en"),
        validationIssues: [],
      }),
    );

    expect(markup).toContain("No urgent concerns.");
    expect(markup).toContain("No standout contribution yet.");
    expect(markup).toContain('aria-selected="true"');
  });
});
