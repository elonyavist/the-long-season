import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildDemoMatchPreparationView,
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
} from "./match-preparation-demo";
import { CareerMatchPreparationScreen } from "./CareerMatchPreparationScreen";

/** Shared no-op callbacks for static rendering tests. */
const noop = (): void => undefined;

/** Renders the preparation screen with a deterministic demo state. */
function renderScreen(state: ReturnType<typeof createInitialDemoMatchPreparationState>): string {
  return renderToStaticMarkup(
    <CareerMatchPreparationScreen
      tacticalBoardDraft={state.tacticalBoardDraft}
      view={buildDemoMatchPreparationView(state)}
      text={createWebTranslator("en")}
      onBackToMenu={noop}
      onBackToDashboard={noop}
      onContinueCareer={noop}
      onInboxActionClick={noop}
      onFormationChange={noop}
      onLineupPlayerChange={noop}
      onBenchPlayerChange={noop}
      onTacticProfileChange={noop}
      onSelectionAction={noop}
      onBoardSlotMove={noop}
      onBoardSlotRoleChange={noop}
      onBoardSlotClear={noop}
      onSavePreparation={noop}
    />,
  );
}

describe("CareerMatchPreparationScreen save-and-go flow", () => {
  it("renders the save-and-go action in the top action area", () => {
    const markup = renderScreen(createCompleteUnsavedDemoMatchPreparationState());

    expect(markup).toContain("Save and go to match");
    expect(markup).toContain("tls-preparation-header-actions");
    expect(markup).not.toContain("tls-preparation-save");
  });

  it("keeps the save-and-go action disabled while preparation is incomplete", () => {
    const markup = renderScreen(createInitialDemoMatchPreparationState());

    expect(markup).toContain("Save and go to match");
    expect(markup).toContain("disabled=\"\"");
  });

  it("uses a board-first tactics layout with bench before the squad panel", () => {
    const markup = renderScreen(createInitialDemoMatchPreparationState());
    const tacticalBoardIndex = markup.indexOf("id=\"tls-tactical-board-title\">Tactical board");
    const substitutesIndex = markup.indexOf("id=\"tls-tactical-bench-board-title\">Substitutes");
    const squadListIndex = markup.indexOf("id=\"match-preparation-squad-title\">Squad list");
    const tacticIndex = markup.indexOf("id=\"match-preparation-tactic-title\">Tactic");

    expect(markup).toContain("aria-current=\"page\"");
    expect(markup).toContain(">Tactics<");
    expect(tacticalBoardIndex).toBeGreaterThan(-1);
    expect(substitutesIndex).toBeGreaterThan(tacticalBoardIndex);
    expect(squadListIndex).toBeGreaterThan(substitutesIndex);
    expect(tacticIndex).toBeGreaterThan(squadListIndex);
    expect(markup).toContain('class="tls-preparation-squad-number">1</span>');
    expect(markup).toContain('class="tls-preparation-squad-number">22</span>');
    expect(markup).toContain(">POR</abbr>");
    expect(markup).toContain(">ATT</abbr>");
  });

  it("keeps the right panel organized into squad, tactic, and detail tabs", () => {
    const markup = renderScreen(createInitialDemoMatchPreparationState());
    const blockerIndex = markup.indexOf("lineup has empty slots");
    const contextIndex = markup.indexOf("Next selected-club fixture");

    expect(markup).toContain("role=\"tablist\"");
    expect(markup).toContain("aria-label=\"Preparation tabs\"");
    expect(markup).toContain("id=\"match-preparation-tab-squad\"");
    expect(markup).toContain("id=\"match-preparation-tab-tactic\"");
    expect(markup).toContain("id=\"match-preparation-tab-detail\"");
    expect(markup).toContain("id=\"match-preparation-panel-squad\"");
    expect(markup).toContain("id=\"match-preparation-panel-tactic\"");
    expect(markup).toContain("id=\"match-preparation-panel-detail\"");
    expect(markup).toContain("Squad");
    expect(markup).toContain("Tactic");
    expect(markup).toContain("Detail");
    expect(blockerIndex).toBeGreaterThan(-1);
    expect(contextIndex).toBeGreaterThan(blockerIndex);
  });
});
