import {
  appEntryActionAvailability,
  type AppEntryActionAvailability,
  type AppEntryActionId,
  type AppEntryView,
} from "@game/ui";

import {
  SUPPORTED_CURRENCIES,
  WEB_LANGUAGE_OPTIONS,
  type WebPreferences,
} from "../../app/preferences";

/** Input facts needed to build the app-entry read model for the web shell. */
export type AppEntryViewModelInput = Readonly<{
  preferences: WebPreferences;
  hasDemoCareer: boolean;
}>;

/** Builds the first app-entry screen view from shared `@game/ui` contracts. */
export function buildAppEntryViewModel(input: AppEntryViewModelInput): AppEntryView {
  return {
    screenKey: "app.entry",
    selectedLanguageKey: input.preferences.language,
    selectedCurrencyKey: input.preferences.currency,
    supportedLanguageKeys: WEB_LANGUAGE_OPTIONS,
    supportedCurrencyKeys: SUPPORTED_CURRENCIES,
    actions: [
      appEntryActionAvailability({
        actionId: "start_new_career",
        status: "available",
      }),
      appEntryActionAvailability({
        actionId: "continue_career",
        status: input.hasDemoCareer ? "available" : "unavailable",
        ...(input.hasDemoCareer ? {} : { unavailableReasonKey: "no_save_available" }),
      }),
      appEntryActionAvailability({
        actionId: "open_settings",
        status: "available",
      }),
      appEntryActionAvailability({
        actionId: "change_language",
        status: "available",
      }),
      appEntryActionAvailability({
        actionId: "change_currency",
        status: "available",
      }),
    ],
  };
}

/** Returns one app-entry action from the read model, failing clearly if absent. */
export function getAppEntryAction(
  view: AppEntryView,
  actionId: AppEntryActionId,
): AppEntryActionAvailability {
  const action = view.actions.find((candidate) => candidate.actionId === actionId);

  if (action === undefined) {
    throw new Error(`Missing app-entry action: ${actionId}`);
  }

  return action;
}
