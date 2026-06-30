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
});
