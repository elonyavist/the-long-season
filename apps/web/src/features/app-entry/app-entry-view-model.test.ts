import { describe, expect, it } from "vitest";

import { DEFAULT_WEB_PREFERENCES } from "../../app/preferences";
import { buildAppEntryViewModel, getAppEntryAction } from "./app-entry-view-model";
import type { SaveMetadata } from "@game/storage";

describe("app-entry view model", () => {
  it("keeps career actions unavailable while durable storage is loading", () => {
    const view = buildAppEntryViewModel({
      preferences: DEFAULT_WEB_PREFERENCES,
      lifecycleStatus: "storage_loading",
      saves: [],
      selectedSaveId: undefined,
      storageFailure: undefined,
    });

    expect(view.screenKey).toBe("app.entry");
    expect(view.selectedLanguageKey).toBe("en");
    expect(view.selectedCurrencyKey).toBe("EUR");
    expect(getAppEntryAction(view, "start_new_career").status).toBe("unavailable");
    expect(getAppEntryAction(view, "continue_career").status).toBe("unavailable");
  });

  it("enables continue only for a selected real save", () => {
    const selectedSaveId = "save:career-one" as SaveMetadata["saveId"];
    const view = buildAppEntryViewModel({
      preferences: DEFAULT_WEB_PREFERENCES,
      lifecycleStatus: "ready",
      saves: [{ saveId: selectedSaveId, name: "Career One", createdAtISO: "2026-07-13T10:00:00.000Z", updatedAtISO: "2026-07-13T10:00:00.000Z", saveSchemaVersion: 1 }],
      selectedSaveId,
      storageFailure: undefined,
    });

    expect(getAppEntryAction(view, "continue_career").status).toBe("available");
    expect(view.saves).toEqual([{ saveId: selectedSaveId, name: "Career One", updatedAtISO: "2026-07-13T10:00:00.000Z" }]);
  });

  it("shows an unavailable reason only when storage is ready and empty", () => {
    const view = buildAppEntryViewModel({
      preferences: DEFAULT_WEB_PREFERENCES,
      lifecycleStatus: "ready",
      saves: [],
      selectedSaveId: undefined,
      storageFailure: undefined,
    });

    expect(getAppEntryAction(view, "continue_career").unavailableReasonKey).toBe("no_save_available");
  });
});
