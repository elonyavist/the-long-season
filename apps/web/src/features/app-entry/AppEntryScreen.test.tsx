import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DEFAULT_WEB_PREFERENCES } from "../../app/preferences";
import { createWebTranslator } from "../../app/translation";
import { buildAppEntryViewModel } from "./app-entry-view-model";
import { AppEntryScreen } from "./AppEntryScreen";

describe("AppEntryScreen", () => {
  it("renders the main menu and settings without a theme picker", () => {
    const preferences = DEFAULT_WEB_PREFERENCES;
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

    expect(markup).toContain("The Long Season");
    expect(markup).toContain("New career");
    expect(markup).toContain("Continue career");
    expect(markup).toContain("Language");
    expect(markup).toContain("Currency");
    expect(markup).not.toContain("Color theme");
    expect(markup).not.toContain("name=\"web-theme-palette\"");
  });
});
