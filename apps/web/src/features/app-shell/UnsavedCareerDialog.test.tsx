import type { MessageKey, Translator } from "@game/i18n";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { UnsavedCareerDialog } from "./UnsavedCareerDialog";

const LABELS: Partial<Record<MessageKey, string>> = {
  "career.exit.title": "Leave career?",
  "career.exit.summary": "Unsaved career summary",
  "career.exit.matchdaySummary": "Unsaved match summary",
  "career.exit.saveAndExit": "Save and exit",
  "career.exit.exitWithoutSaving": "Exit without saving",
  "career.exit.cancel": "Cancel",
  "career.preparationDraft.exit.title": "Leave team preparation?",
  "career.preparationDraft.exit.summary": "Unsaved team plan",
  "career.preparationDraft.exit.stay": "Stay",
  "career.preparationDraft.exit.discard": "Discard changes",
  "career.preparationDraft.exit.saveAndContinue": "Save and continue",
  "career.saveControl.saving": "Saving...",
};
const text: Translator = (key) => LABELS[key] ?? key;

describe("UnsavedCareerDialog", () => {
  it("offers save-and-exit only at a safe career stop", () => {
    const safeHtml = renderDialog(true);
    const matchHtml = renderDialog(false);

    expect(safeHtml).toContain("Save and exit");
    expect(safeHtml).toContain("Exit without saving");
    expect(safeHtml).toContain("autofocus");
    expect(matchHtml).toContain("Unsaved match summary");
    expect(matchHtml).not.toContain("Save and exit");
    expect(safeHtml).toContain('data-state="decision"');
    expect(safeHtml).toContain("tls-unsaved-dialog-mark");
  });

  it("exposes pending state while the save-and-exit command owns the lock", () => {
    const html = renderToStaticMarkup(
      <UnsavedCareerDialog
        canSave
        open
        pending
        text={text}
        onCancel={vi.fn()}
        onExitWithoutSaving={vi.fn()}
        onSaveAndExit={vi.fn()}
      />,
    );

    expect(html).toContain('data-state="pending"');
    expect(html).toContain("Saving...");
  });

  it("uses preparation-specific stay, discard, and valid-save language", () => {
    const completeHtml = renderPreparationDialog(true);
    const incompleteHtml = renderPreparationDialog(false);

    expect(completeHtml).toContain("Leave team preparation?");
    expect(completeHtml).toContain("Stay");
    expect(completeHtml).toContain("Discard changes");
    expect(completeHtml).toContain("Save and continue");
    expect(incompleteHtml).not.toContain("Save and continue");
  });
});

function renderDialog(canSave: boolean): string {
  return renderToStaticMarkup(
    <UnsavedCareerDialog
      canSave={canSave}
      open
      pending={false}
      text={text}
      onCancel={vi.fn()}
      onExitWithoutSaving={vi.fn()}
      onSaveAndExit={vi.fn()}
    />,
  );
}

function renderPreparationDialog(canSave: boolean): string {
  return renderToStaticMarkup(
    <UnsavedCareerDialog
      canSave={canSave}
      mode="preparation_navigation"
      open
      pending={false}
      text={text}
      onCancel={vi.fn()}
      onExitWithoutSaving={vi.fn()}
      onSaveAndExit={vi.fn()}
    />,
  );
}
