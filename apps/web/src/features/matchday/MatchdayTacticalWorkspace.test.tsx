import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { createHalfTimeTestFixture } from "../../test-fixtures/career-fixture";
import { buildMatchPreparationView } from "../match-preparation/match-preparation-adapter";
import { liveMatchdayShapeReading } from "./matchday-adapter";
import { MatchdayTacticalWorkspace } from "./MatchdayTacticalWorkspace";

describe("MatchdayTacticalWorkspace", () => {
  it("states the live shape consequences in the same words the preparation screen uses", () => {
    const fixture = createHalfTimeTestFixture("workspace-consequences");
    const reading = liveMatchdayShapeReading(fixture.matchday);
    const view = buildMatchPreparationView(fixture.career, fixture.draft, reading);
    const text = createWebTranslator("en");
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayTacticalWorkspace, {
        view,
        tacticalBoardDraft: fixture.draft.tacticalBoardDraft,
        text,
        panel: fixture.teamControlPanel,
      }),
    );

    expect(reading).toBeDefined();
    expect(view.tacticalConsequences).toBeDefined();
    expect(markup).toContain("tls-tactical-consequences");
    expect(markup).toContain("Shape consequences");
    expect(markup).toContain('id="matchday-tactical-consequences-title"');
    expect(markup).toContain("The choice stays yours.");

    const observations = view.tacticalConsequences?.observations ?? [];
    for (const observation of observations) {
      expect(markup).toContain(text(observation.labelKey));
      expect(markup).toContain(text(observation.kindLabelKey));
      expect(markup).toContain(`data-kind="${observation.kind}"`);
    }

    if (observations.length === 0) {
      expect(markup).toContain(text("career.tacticalConsequence.summary.balanced"));
    }
  });

  it("never shows more observations than the frozen count", () => {
    const fixture = createHalfTimeTestFixture("workspace-consequence-count");
    const view = buildMatchPreparationView(
      fixture.career,
      fixture.draft,
      liveMatchdayShapeReading(fixture.matchday),
    );
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayTacticalWorkspace, {
        view,
        tacticalBoardDraft: fixture.draft.tacticalBoardDraft,
        text: createWebTranslator("en"),
        panel: fixture.teamControlPanel,
      }),
    );

    expect((markup.match(/data-kind="/g) ?? []).length).toBeLessThanOrEqual(3);
  });

  it("says there is nothing to read when no engine team has been accepted", () => {
    const fixture = createHalfTimeTestFixture("workspace-consequence-absent");
    const view = buildMatchPreparationView(fixture.career, fixture.draft);
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayTacticalWorkspace, {
        view,
        tacticalBoardDraft: fixture.draft.tacticalBoardDraft,
        text: createWebTranslator("en"),
        panel: fixture.teamControlPanel,
      }),
    );

    expect(view.tacticalConsequences).toBeUndefined();
    expect(markup).toContain("Complete the eleven to see what this shape does.");
    expect(markup).not.toContain("tls-tactical-consequences-list");
  });
});
