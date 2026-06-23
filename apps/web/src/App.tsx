import { useMemo, useState } from "react";

import {
  DEFAULT_WEB_PREFERENCES,
  type WebPreferences,
} from "./app/preferences";
import { createWebTranslator } from "./app/translation";
import { buildAppEntryViewModel } from "./app/app-entry-view-model";
import { buildDemoCareerDashboard } from "./career/build-demo-career-dashboard";
import { presentCareerDashboard } from "./career/career-dashboard-presenter";
import { continueDemoCareer, type DemoCareerContinueResult } from "./career/continue-demo-career";
import { AppEntryScreen } from "./screens/AppEntryScreen";
import { CareerDashboardScreen } from "./screens/CareerDashboardScreen";

type AppScreen = "app_entry" | "career_dashboard";

/**
 * Minimal app shell with in-memory language and currency preferences.
 *
 * The real menu actions and dashboard arrive in later Phase 49 steps; this
 * component only proves that visible web labels are localized and preferences
 * are bounded.
 */
export function App(): React.JSX.Element {
  const [preferences, setPreferences] = useState<WebPreferences>(DEFAULT_WEB_PREFERENCES);
  const [hasDemoCareer, setHasDemoCareer] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("app_entry");
  const [continueResult, setContinueResult] = useState<DemoCareerContinueResult | undefined>();
  const text = useMemo(() => createWebTranslator(preferences.language), [preferences.language]);
  const appEntryView = useMemo(
    () => buildAppEntryViewModel({ preferences, hasDemoCareer }),
    [hasDemoCareer, preferences],
  );
  const dashboardPresentation = useMemo(
    () => presentCareerDashboard(buildDemoCareerDashboard()),
    [],
  );

  if (screen === "career_dashboard") {
    return (
      <CareerDashboardScreen
        presentation={dashboardPresentation}
        {...(continueResult === undefined ? {} : { continueResult })}
        text={text}
        onBackToMenu={() => {
          setScreen("app_entry");
        }}
        onContinueCareer={() => {
          setContinueResult(continueDemoCareer());
        }}
      />
    );
  }

  return (
    <AppEntryScreen
      view={appEntryView}
      preferences={preferences}
      text={text}
      onPreferencesChange={setPreferences}
      onStartNewCareer={() => {
        setHasDemoCareer(true);
        setContinueResult(undefined);
        setScreen("career_dashboard");
      }}
      onContinueCareer={() => {
        if (hasDemoCareer) {
          setScreen("career_dashboard");
        }
      }}
    />
  );
}
