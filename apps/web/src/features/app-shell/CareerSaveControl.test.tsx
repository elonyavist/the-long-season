import type { MessageKey, Translator } from "@game/i18n";
import { fromISO } from "@game/shared";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { CareerSessionStatus } from "../../runtime/career-session";
import { CareerSaveControl, type CareerSaveLifecycle } from "./CareerSaveControl";

const LABELS: Partial<Record<MessageKey, string>> = {
  "career.saveControl.title": "Save",
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

describe("CareerSaveControl", () => {
  it("shows dirty state, one save command, and the three cadence choices", () => {
    const html = renderToStaticMarkup(<CareerSaveControl lifecycle={lifecycle()} text={text} />);

    expect(html).toContain("Unsaved changes");
    expect(html.match(/Save game/g)).toHaveLength(1);
    expect(html).toContain("Every 7 days");
    expect(html).toContain("Every 15 days");
    expect(html).toContain("Manual only");
    expect(html).toContain('type="radio"');
    expect(html).toContain('data-state="dirty"');
    expect(html).toContain('data-state="idle"');
  });

  it("explains the matchday restriction without exposing policy controls", () => {
    const html = renderToStaticMarkup(
      <CareerSaveControl lifecycle={lifecycle({ canSave: false })} text={text} />,
    );

    expect(html).toContain('disabled=""');
    expect(html).toContain("Saving is unavailable while the match is in progress.");
    expect(html).not.toContain('type="radio"');
    expect(html).toContain('data-state="unavailable"');
    expect(html).toContain('data-state="disabled"');
  });
});

function lifecycle(overrides: Partial<CareerSaveLifecycle> = {}): CareerSaveLifecycle {
  const sessionStatus: CareerSessionStatus = {
    dirty: true,
    autosaveIntervalDays: 7,
    lastPersistedGameDate: fromISO("2026-08-01") as CareerSessionStatus["lastPersistedGameDate"],
    autosavePostponed: false,
  };
  return {
    sessionStatus,
    canSave: true,
    pending: false,
    onSave: vi.fn(),
    onPolicyChange: vi.fn(),
    ...overrides,
  };
}
