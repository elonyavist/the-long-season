import { describe, expect, it } from "vitest";

import { DEFAULT_WEB_PREFERENCES } from "./preferences";
import { buildAppEntryViewModel, getAppEntryAction } from "./app-entry-view-model";

describe("app-entry view model", () => {
  it("builds an unavailable continue action before a demo career exists", () => {
    const view = buildAppEntryViewModel({
      preferences: DEFAULT_WEB_PREFERENCES,
      hasDemoCareer: false,
    });

    expect(view.screenKey).toBe("app.entry");
    expect(view.selectedLanguageKey).toBe("en");
    expect(view.selectedCurrencyKey).toBe("EUR");
    expect(getAppEntryAction(view, "continue_career")).toEqual({
      actionId: "continue_career",
      status: "unavailable",
      unavailableReasonKey: "no_save_available",
      labelKey: "app.entry.action.continue_career",
    });
  });

  it("enables continue career after the in-memory demo exists", () => {
    const view = buildAppEntryViewModel({
      preferences: DEFAULT_WEB_PREFERENCES,
      hasDemoCareer: true,
    });

    expect(getAppEntryAction(view, "continue_career").status).toBe("available");
  });
});
