import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DEFAULT_WEB_PREFERENCES } from "../../app/preferences";
import { createWebTranslator } from "../../app/translation";
import { buildAppEntryViewModel } from "./app-entry-view-model";
import { AppEntryScreen } from "./AppEntryScreen";
import type { SaveMetadata } from "@game/storage";

describe("AppEntryScreen", () => {
  it("renders the main menu and settings without a theme picker", () => {
    const preferences = DEFAULT_WEB_PREFERENCES;
    const markup = renderToStaticMarkup(
      <AppEntryScreen
        view={buildAppEntryViewModel({ preferences, lifecycleStatus: "ready", saves: [], selectedSaveId: undefined, storageFailure: undefined })}
        preferences={preferences}
        text={createWebTranslator("en")}
        onPreferencesChange={() => undefined}
        onStartNewCareer={() => undefined}
        onContinueCareer={() => undefined}
        onSelectedSaveChange={() => undefined}
        onRetryStorage={() => undefined}
      />,
    );

    expect(markup).toContain("The Long Season");
    expect(markup).toContain("New career");
    expect(markup).toContain("Continue career");
    expect(markup).toContain("Language");
    expect(markup).toContain("Currency");
    expect(markup).not.toContain("Color theme");
    expect(markup).not.toContain("name=\"web-theme-palette\"");
    expect(markup).toContain("No saved careers yet");
    expect(markup).toContain("tls-app-entry-football-mark");
    expect(markup).toContain('data-state="empty"');
  });

  it("renders a selected durable save without horizontal data tables", () => {
    const preferences = DEFAULT_WEB_PREFERENCES;
    const selectedSaveId = "save:career-one" as SaveMetadata["saveId"];
    const markup = renderToStaticMarkup(
      <AppEntryScreen
        view={buildAppEntryViewModel({
          preferences,
          lifecycleStatus: "ready",
          saves: [{ saveId: selectedSaveId, name: "Perugia 2026", createdAtISO: "2026-07-13T10:00:00.000Z", updatedAtISO: "2026-07-13T10:00:00.000Z", saveSchemaVersion: 1 }],
          selectedSaveId,
          storageFailure: undefined,
        })}
        preferences={preferences}
        text={createWebTranslator("en")}
        onPreferencesChange={() => undefined}
        onStartNewCareer={() => undefined}
        onContinueCareer={() => undefined}
        onSelectedSaveChange={() => undefined}
        onRetryStorage={() => undefined}
      />,
    );

    expect(markup).toContain("Perugia 2026");
    expect(markup).toContain("Saved career");
  });

  it("renders localized recovery guidance without exposing technical prose", () => {
    const preferences = DEFAULT_WEB_PREFERENCES;
    const markup = renderToStaticMarkup(
      <AppEntryScreen
        view={buildAppEntryViewModel({
          preferences,
          lifecycleStatus: "storage_error",
          saves: [],
          selectedSaveId: undefined,
          storageFailure: { code: "storage_quota_exceeded" },
        })}
        preferences={preferences}
        text={createWebTranslator("en")}
        onPreferencesChange={() => undefined}
        onStartNewCareer={() => undefined}
        onContinueCareer={() => undefined}
        onSelectedSaveChange={() => undefined}
        onRetryStorage={() => undefined}
      />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('data-state="recovery"');
    expect(markup).toContain("Free some device storage, then try again");
    expect(markup).toContain("Try again");
    expect(markup).not.toContain("SQLITE");
  });

});
