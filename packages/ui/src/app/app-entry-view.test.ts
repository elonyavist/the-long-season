import { describe, expect, it } from "vitest";

import type { AppEntryView } from "./app-entry-view.ts";
import { type AppLanguageKey } from "./app-entry-view.ts";
import { type CurrencyPreferenceKey } from "./app-entry-view.ts";

describe("AppEntryView", () => {
  it("stores app entry facts as structured keys instead of rendered prose", () => {
    const view: AppEntryView = {
      screenKey: "app.entry",
      selectedLanguageKey: "it",
      selectedCurrencyKey: "EUR",
      supportedLanguageKeys: ["it", "en", "de", "es", "fr"],
      supportedCurrencyKeys: ["EUR", "GBP", "USD"],
      actions: [
        {
          actionId: "start_new_career",
          status: "available",
          labelKey: "app.entry.action.startNewCareer",
        },
        {
          actionId: "continue_career",
          status: "unavailable",
          unavailableReasonKey: "no_save_available",
          labelKey: "app.entry.action.continueCareer",
        },
      ],
    };

    expect(view.screenKey).toBe("app.entry");
    expect(view.selectedLanguageKey satisfies AppLanguageKey).toBe("it");
    expect(view.selectedCurrencyKey satisfies CurrencyPreferenceKey).toBe("EUR");
    expect(view.actions[1]?.unavailableReasonKey).toBe("no_save_available");
  });
});
