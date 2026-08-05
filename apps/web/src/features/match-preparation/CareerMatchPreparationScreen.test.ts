import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  createPreparedTestCareerFixture,
  createTestCareerFixture,
} from "../../test-fixtures/career-fixture";
import {
  buildCareerTacticalBoardPlayers,
  buildMatchPreparationView,
  matchPreparationBenchSlotKeys,
  matchPreparationShapeReading,
  selectMatchPreparationBenchPlayer,
} from "./match-preparation-adapter";
import { CareerMatchPreparationScreen } from "./CareerMatchPreparationScreen";

describe("CareerMatchPreparationScreen", () => {
  it("returns the editable match-preparation workspace with formation and bench controls", () => {
    const { career, draft } = createTestCareerFixture("preparation-screen");
    const markup = renderToStaticMarkup(
      React.createElement(CareerMatchPreparationScreen, {
        draftDirty: true,
        currentDateIso: "2026-08-01",
        tacticalBoardDraft: draft.tacticalBoardDraft,
        tacticalBoardPlayers: buildCareerTacticalBoardPlayers(career),
        playerFactsById: new Map(),
        view: buildMatchPreparationView(career, draft),
        text: createWebTranslator("en"),
        onBackToMenu: () => undefined,
        onNavigate: () => undefined,
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

    expect(markup).toContain(career.gameState.clubs[career.selectedClubId]?.name);
    expect(markup).toContain("tls-preparation-panel");
    expect(markup).toContain("tls-preparation-decision-bar");
    expect(markup).toContain("tls-preparation-alert-strip");
    expect(markup).toContain("Unsaved changes");
    expect(markup).toContain('data-state="blocking"');
    expect(markup).not.toContain("tls-preparation-blockers");
    expect(markup).toContain("tls-tactical-board");
    expect(markup).toContain('data-formation-motion-key="4-4-2"');
    expect(markup.match(/data-motion-slot-key=/g)).toHaveLength(19);
    expect(markup).not.toContain("tls-preparation-pitch");
    expect(markup).toContain("tls-preparation-squad-table");
    expect(markup).toContain("Current shape");
    expect(markup).toContain("Formation");
    expect(markup).toContain("Auto");
    expect(markup).toContain("Fill gaps");
    expect(markup).toContain("Clear");
    expect(markup).toContain("Substitutes");
    expect(markup).toContain("tls-tactical-bench-board");
    expect(markup).toContain("tls-tactical-bench-empty-plus");
    expect(markup).toContain("lineup has empty slots");
    expect(markup.match(/lineup has empty slots/g)).toHaveLength(1);
    expect(markup).toContain("bench has empty slots");
    expect(markup).toContain("tactic missing");
    expect(markup).toContain("Confirm and go to match");
    expect(markup).toContain('data-state="disabled"');
  });

  it("shows a visible blocker when the full bench has no goalkeeper", () => {
    const benchSlotKeys = matchPreparationBenchSlotKeys();
    const fixture = createPreparedTestCareerFixture("bench-without-goalkeeper");
    const selectedClub = fixture.career.gameState.clubs[fixture.career.selectedClubId];
    const outfieldBenchPlayerIds = selectedClub?.playerIds.filter((playerId) => (
      fixture.career.gameState.players[playerId]?.primaryRole !== "goalkeeper"
    )).slice(0, 8) ?? [];
    let state = fixture.draft;

    for (const [index, benchSlotKey] of benchSlotKeys.entries()) {
      state = selectMatchPreparationBenchPlayer(state, benchSlotKey, outfieldBenchPlayerIds[index]);
    }

    const view = buildMatchPreparationView(fixture.career, state);
    const markup = renderToStaticMarkup(
      React.createElement(CareerMatchPreparationScreen, {
        draftDirty: false,
        currentDateIso: "2026-08-01",
        tacticalBoardDraft: state.tacticalBoardDraft,
        tacticalBoardPlayers: buildCareerTacticalBoardPlayers(fixture.career),
        playerFactsById: new Map(),
        view,
        text: createWebTranslator("en"),
        onBackToMenu: () => undefined,
        onNavigate: () => undefined,
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

    expect(view.saveAction.status).toBe("blocked");
    expect(markup).toContain("bench needs a goalkeeper");
  });

  it("asks for a complete eleven before saying anything about the shape", () => {
    const { career, draft } = createTestCareerFixture("consequences-incomplete");
    const markup = renderPreparationScreen(career, draft, buildMatchPreparationView(career, draft));

    expect(markup).toContain("tls-tactical-consequences");
    expect(markup).toContain("Complete the eleven to see what this shape does.");
    expect(markup).not.toContain("tls-tactical-consequences-list");
  });

  it("names the consequences of a shape in words, never as numbers", () => {
    const fixture = createPreparedTestCareerFixture("consequences-shape");
    const reading = matchPreparationShapeReading(fixture.career, fixture.draft);
    const view = buildMatchPreparationView(fixture.career, fixture.draft, reading);
    const markup = renderPreparationScreen(fixture.career, fixture.draft, view);
    const panel = markup.slice(markup.indexOf("tls-tactical-consequences"));

    expect(reading).toBeDefined();
    expect(markup).toContain("Shape consequences");
    expect(markup).toContain("The choice stays yours.");

    // Whatever this squad's shape produces, the panel states it as football and
    // exposes no capacity number, percentage, or best-formation command.
    for (const observation of view.tacticalConsequences?.observations ?? []) {
      expect(panel).toContain(createWebTranslator("en")(observation.labelKey));
      expect(panel).toContain(`data-kind="${observation.kind}"`);
    }
    expect(panel.slice(0, panel.indexOf("</section>"))).not.toMatch(/%/u);
  });
});

/** Renders the screen with the same required callbacks every case needs. */
function renderPreparationScreen(
  career: Parameters<typeof buildCareerTacticalBoardPlayers>[0],
  draft: Parameters<typeof buildMatchPreparationView>[1],
  view: ReturnType<typeof buildMatchPreparationView>,
): string {
  return renderToStaticMarkup(
    React.createElement(CareerMatchPreparationScreen, {
      draftDirty: false,
      currentDateIso: "2026-08-01",
      tacticalBoardDraft: draft.tacticalBoardDraft,
      tacticalBoardPlayers: buildCareerTacticalBoardPlayers(career),
      playerFactsById: new Map(),
      view,
      text: createWebTranslator("en"),
      onBackToMenu: () => undefined,
      onNavigate: () => undefined,
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
}
