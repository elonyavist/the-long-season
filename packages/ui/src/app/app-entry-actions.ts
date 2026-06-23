/** Stable actions available before a career save is loaded. */
export type AppEntryActionId = "start_new_career" | "continue_career" | "open_settings" | "change_language" | "change_currency";

/** Availability state for a UI action without rendering visible prose. */
export type AppEntryActionAvailabilityStatus = "available" | "unavailable";

/** Structured reason explaining why an app-entry action is unavailable. */
export type AppEntryUnavailableReasonKey = "no_save_available" | "unsupported_setting";

/** Generic result status for UI-facing actions. */
export type UiActionResultStatus = "completed" | "failed" | "cancelled";

/** Primitive structured detail value allowed in action results. */
export type UiActionDetailValue = string | number | boolean | null;

/** Generic UI action result that can be rendered by CLI or future web UI. */
export interface UiActionResult<ActionId extends string> {
  /** Stable action identifier. */
  readonly actionId: ActionId;
  /** Outcome status. */
  readonly status: UiActionResultStatus;
  /** Whether the action changed a career save or app state. */
  readonly changedSave: boolean;
  /** Optional stable IDs affected by the action. */
  readonly targetIds?: readonly string[];
  /** Optional translation key for a user-facing message. */
  readonly messageKey?: string;
  /** Structured values used by the future presentation layer. */
  readonly detailValues?: Readonly<Record<string, UiActionDetailValue>>;
}

/** One app-entry action and its machine-readable availability. */
export interface AppEntryActionAvailability {
  /** Stable action identifier used by UI controls and smoke renderers. */
  readonly actionId: AppEntryActionId;
  /** Whether the action can currently be selected. */
  readonly status: AppEntryActionAvailabilityStatus;
  /** Optional machine key for unavailable-state presentation. */
  readonly unavailableReasonKey?: AppEntryUnavailableReasonKey;
  /** Translation key for the future UI label. */
  readonly labelKey: string;
}

/** Result contract for app-entry actions such as settings changes. */
export type AppEntryActionResult = UiActionResult<AppEntryActionId>;

/**
 * Creates one app-entry action availability record.
 *
 * This helper keeps action IDs, status keys, and label keys consistent for CLI
 * smoke output and the future web UI without executing the action.
 */
export function appEntryActionAvailability(input: {
  readonly actionId: AppEntryActionId;
  readonly status: AppEntryActionAvailabilityStatus;
  readonly unavailableReasonKey?: AppEntryUnavailableReasonKey;
}): AppEntryActionAvailability {
  return {
    actionId: input.actionId,
    status: input.status,
    ...(input.unavailableReasonKey === undefined ? {} : { unavailableReasonKey: input.unavailableReasonKey }),
    labelKey: `app.entry.action.${input.actionId}`,
  };
}

/**
 * Creates a structured app-entry action result.
 *
 * The result records what happened, not how to mutate app state or render text.
 */
export function appEntryActionResult(input: AppEntryActionResult): AppEntryActionResult {
  return input;
}
