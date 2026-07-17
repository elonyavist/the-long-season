import type { MessageKey, Translator } from "@game/i18n";
import { fromISO } from "@game/shared";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { CareerSessionStatus } from "../../runtime/career-session";
import type { CareerSaveLifecycle } from "./CareerSaveControl";
import { CareerSaveDialog } from "./CareerSaveDialog";

const LABELS: Partial<Record<MessageKey, string>> = {
  "career.saveControl.title": "Save",
  "career.saveControl.close": "Close save menu",
  "career.saveControl.saveGame": "Save game",
  "career.saveControl.saving": "Saving...",
  "career.saveControl.unsaved": "Unsaved changes",
  "career.saveControl.savedThrough": "Saved through",
  "career.saveControl.autosave": "Autosave",
  "career.saveControl.autosave7": "Every 7 days",
  "career.saveControl.autosave15": "Every 15 days",
  "career.saveControl.manualOnly": "Manual only",
  "career.saveControl.disabledDuringMatch": "Saving is unavailable while the match is in progress.",
};
const text: Translator = (key) => LABELS[key] ?? key;

describe("CareerSaveDialog", () => {
  it("contains the real manual-save and autosave controls behind one accessible dialog", () => {
    const html = renderToStaticMarkup(
      <CareerSaveDialog
        lifecycle={lifecycle()}
        open={false}
        text={text}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('<dialog aria-labelledby="tls-save-control-title"');
    expect(html).toContain('aria-label="Close save menu"');
    expect(html).toContain("Save game");
    expect(html).toContain("Every 7 days");
    expect(html).toContain("Every 15 days");
    expect(html).toContain("Manual only");
  });
});

function lifecycle(): CareerSaveLifecycle {
  return {
    sessionStatus: {
      dirty: true,
      autosaveIntervalDays: 7,
      lastPersistedGameDate: fromISO("2026-08-01") as CareerSessionStatus["lastPersistedGameDate"],
      autosavePostponed: false,
    },
    canSave: true,
    pending: false,
    onSave: vi.fn(),
    onPolicyChange: vi.fn(),
  };
}
