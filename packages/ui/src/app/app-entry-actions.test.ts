import { describe, expect, it } from "vitest";

import { appEntryActionAvailability, appEntryActionResult } from "./app-entry-actions.ts";

describe("app-entry action contracts", () => {
  it("creates an available app-entry action", () => {
    expect(
      appEntryActionAvailability({
        actionId: "start_new_career",
        status: "available",
      }),
    ).toEqual({
      actionId: "start_new_career",
      status: "available",
      labelKey: "app.entry.action.start_new_career",
    });
  });

  it("creates an unavailable app-entry action with a structured reason", () => {
    expect(
      appEntryActionAvailability({
        actionId: "continue_career",
        status: "unavailable",
        unavailableReasonKey: "no_save_available",
      }),
    ).toEqual({
      actionId: "continue_career",
      status: "unavailable",
      unavailableReasonKey: "no_save_available",
      labelKey: "app.entry.action.continue_career",
    });
  });

  it("creates a completed app-entry action result", () => {
    expect(
      appEntryActionResult({
        actionId: "change_language",
        status: "completed",
        changedSave: false,
        messageKey: "app.entry.result.languageChanged",
        detailValues: {
          language: "it",
        },
      }),
    ).toEqual({
      actionId: "change_language",
      status: "completed",
      changedSave: false,
      messageKey: "app.entry.result.languageChanged",
      detailValues: {
        language: "it",
      },
    });
  });
});
