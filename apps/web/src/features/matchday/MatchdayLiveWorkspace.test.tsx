import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildTestMatchPreparationView,
  createPreparedTestCareerFixture,
} from "../../test-fixtures/career-fixture";
import { buildCareerMatchdayPresentationView } from "./career-matchday-presenter";
import {
  advanceWebLiveMatchdayMinute,
  buildWebMatchdayPhaseView,
  createWebLiveMatchdaySession,
  resumeWebLiveMatchday,
} from "./matchday-adapter";
import { MatchdayLiveWorkspace } from "./MatchdayLiveWorkspace";

describe("MatchdayLiveWorkspace", () => {
  it("exposes only Match, Statistics, and Tactics as accessible live tabs", () => {
    const fixture = createPreparedTestCareerFixture("live-workspace");
    const created = createWebLiveMatchdaySession(fixture.career);
    if (created.status !== "ready") throw new Error("Expected a ready live session");
    const advanced = advanceWebLiveMatchdayMinute(resumeWebLiveMatchday(created.session));
    const phaseView = buildWebMatchdayPhaseView(advanced.matchdayState);
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayLiveWorkspace, {
        phaseView,
        presentation: buildCareerMatchdayPresentationView(phaseView),
        text: createWebTranslator("en"),
        matchPreparationView: buildTestMatchPreparationView(fixture),
        tacticalBoardDraft: fixture.draft.tacticalBoardDraft,
      }),
    );

    expect(markup).toContain('aria-label="Live match views"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(3);
    expect(markup).toContain(">Match</span>");
    expect(markup).toContain(">Statistics</span>");
    expect(markup).toContain(">Tactics</span>");
    expect(markup).toContain("tls-match-statistics");
    expect(markup).not.toContain("No events yet");
    expect(markup).not.toContain("<table");
  });
});
