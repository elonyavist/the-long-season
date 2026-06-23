import type { AppEntryActionAvailability } from "./app-entry-actions.ts";

/** Supported language keys shown in the app settings screen. */
export type AppLanguageKey = "it" | "en" | "de" | "es" | "fr";

/** Currency preference key used for display selection before economics exists. */
export type CurrencyPreferenceKey = string;

/** Structured app entry screen shown before a career is loaded. */
export interface AppEntryView {
  /** Stable screen key for routing and tests. */
  readonly screenKey: "app.entry";
  /** Current app language preference. */
  readonly selectedLanguageKey: AppLanguageKey;
  /** Current currency display preference. */
  readonly selectedCurrencyKey: CurrencyPreferenceKey;
  /** Language keys the app can offer in settings. */
  readonly supportedLanguageKeys: readonly AppLanguageKey[];
  /** Currency keys the app can offer in settings. */
  readonly supportedCurrencyKeys: readonly CurrencyPreferenceKey[];
  /** Entry actions and their current availability. */
  readonly actions: readonly AppEntryActionAvailability[];
}
