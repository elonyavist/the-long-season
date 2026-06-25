import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DEFAULT_WEB_PREFERENCES } from "../../app/preferences";
import { createWebTranslator } from "../../app/translation";
import { buildAppEntryViewModel } from "./app-entry-view-model";
import { AppEntryScreen } from "./AppEntryScreen";

describe("AppEntryScreen", () => {
  it("renders the compact theme palette picker with localized radio choices", () => {
    const preferences = {
      ...DEFAULT_WEB_PREFERENCES,
      themePaletteId: "floodlight-navy" as const,
    };
    const markup = renderToStaticMarkup(
      <AppEntryScreen
        view={buildAppEntryViewModel({ preferences, hasDemoCareer: false })}
        preferences={preferences}
        text={createWebTranslator("en")}
        onPreferencesChange={() => undefined}
        onStartNewCareer={() => undefined}
        onContinueCareer={() => undefined}
      />,
    );

    expect(markup).toContain("Color theme");
    expect(markup).toContain("Floodlight navy");
    expect(markup).toContain("Club office");
    expect(markup).toContain("Press room");
    expect(markup).not.toContain("Classic manager");
    expect(markup).not.toContain("Programme paper");
    expect(markup).not.toContain("Archive sepia");
    expect(markup).toContain("name=\"web-theme-palette\"");
    expect(markup).toContain("checked=\"\"");
  });
});
