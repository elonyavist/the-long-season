import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildDemoMatchPreparationView,
  createInitialDemoMatchPreparationState,
} from "./match-preparation-demo";
import { CareerMatchPreparationScreen } from "./CareerMatchPreparationScreen";

describe("CareerMatchPreparationScreen", () => {
  it("returns the editable match-preparation workspace with formation and bench controls", () => {
    const state = createInitialDemoMatchPreparationState();
    const markup = renderToStaticMarkup(
      React.createElement(CareerMatchPreparationScreen, {
        tacticalBoardDraft: state.tacticalBoardDraft,
        view: buildDemoMatchPreparationView(state),
        text: createWebTranslator("en"),
        onBackToMenu: () => undefined,
        onBackToDashboard: () => undefined,
        onContinueCareer: () => undefined,
        onInboxActionClick: () => undefined,
        onFormationChange: () => undefined,
        onLineupPlayerChange: () => undefined,
        onBenchPlayerChange: () => undefined,
        onTacticProfileChange: () => undefined,
        onSelectionAction: () => undefined,
        onBoardSlotMove: () => undefined,
        onBoardSlotRoleChange: () => undefined,
        onBoardSlotClear: () => undefined,
        onSavePreparation: () => undefined,
      }),
    );

    expect(markup).toContain("S.S. Perugia");
    expect(markup).toContain("tls-preparation-panel");
    expect(markup).toContain("tls-preparation-match-strip");
    expect(markup).toContain("tls-preparation-alert-strip");
    expect(markup).not.toContain("tls-preparation-blockers");
    expect(markup).toContain("tls-tactical-board");
    expect(markup).not.toContain("tls-preparation-pitch");
    expect(markup).toContain("tls-preparation-squad-table");
    expect(markup).toContain("Current shape");
    expect(markup).toContain("Formation");
    expect(markup).toContain("Auto");
    expect(markup).toContain("Fill gaps");
    expect(markup).toContain("Clear");
    expect(markup).toContain("Substitutes");
    expect(markup).toContain("tls-player-candidate-row");
    expect(markup).toContain("tls-preparation-bench-candidate");
    expect(markup).toContain("lineup has empty slots");
    expect(markup).toContain("bench has empty slots");
    expect(markup).toContain("tactic missing");
  });
});
