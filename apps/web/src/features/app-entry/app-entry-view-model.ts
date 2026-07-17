import {
  appEntryActionAvailability,
  type AppEntryActionAvailability,
  type AppEntryActionId,
  type AppEntryView,
} from "@game/ui";
import type { SaveMetadata } from "@game/storage";
import type { WebCareerPersistenceFailure } from "../../runtime/web-career-runtime";
import {
  SUPPORTED_CURRENCIES,
  WEB_LANGUAGE_OPTIONS,
  type WebPreferences,
} from "../../app/preferences";

type AppEntrySaveId = SaveMetadata["saveId"];

/** Bounded async lifecycle states visible on the app-entry screen. */
export type AppEntryLifecycleStatus = "storage_loading" | "ready" | "career_loading" | "storage_error";

/** Save-list row rendered without exposing persistence implementation details. */
export interface AppEntrySaveView {
  readonly saveId: AppEntrySaveId;
  readonly name: string;
  readonly updatedAtISO: string;
}

/** Web-specific app-entry view with durable save lifecycle facts. */
export type WebAppEntryView = AppEntryView & Readonly<{
  lifecycleStatus: AppEntryLifecycleStatus;
  saves: readonly AppEntrySaveView[];
  selectedSaveId: AppEntrySaveId | undefined;
  storageFailure: WebCareerPersistenceFailure | undefined;
}>;

/** Input facts needed to build the app-entry read model for the web shell. */
export type AppEntryViewModelInput = Readonly<{
  preferences: WebPreferences;
  lifecycleStatus: AppEntryLifecycleStatus;
  saves: readonly SaveMetadata[];
  selectedSaveId: AppEntrySaveId | undefined;
  storageFailure: WebCareerPersistenceFailure | undefined;
}>;

/** Builds the first app-entry screen view from shared `@game/ui` contracts. */
export function buildAppEntryViewModel(input: AppEntryViewModelInput): WebAppEntryView {
  const ready = input.lifecycleStatus === "ready";
  const selectedSaveExists = input.selectedSaveId !== undefined
    && input.saves.some((entry) => entry.saveId === input.selectedSaveId);

  return {
    screenKey: "app.entry",
    selectedLanguageKey: input.preferences.language,
    selectedCurrencyKey: input.preferences.currency,
    supportedLanguageKeys: WEB_LANGUAGE_OPTIONS,
    supportedCurrencyKeys: SUPPORTED_CURRENCIES,
    lifecycleStatus: input.lifecycleStatus,
    saves: input.saves.map(({ saveId, name, updatedAtISO }) => ({ saveId, name, updatedAtISO })),
    selectedSaveId: selectedSaveExists ? input.selectedSaveId : undefined,
    storageFailure: input.storageFailure,
    actions: [
      appEntryActionAvailability({
        actionId: "start_new_career",
        status: ready ? "available" : "unavailable",
      }),
      appEntryActionAvailability({
        actionId: "continue_career",
        status: ready && selectedSaveExists ? "available" : "unavailable",
        ...(ready && input.saves.length === 0 ? { unavailableReasonKey: "no_save_available" as const } : {}),
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
