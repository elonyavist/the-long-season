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
import {
  buildDemoMatchPreparationView,
  buildDemoSavedPreparationInput,
  createInitialDemoMatchPreparationState,
  saveDemoMatchPreparation,
  selectDemoMatchPreparationPlayer,
  selectDemoMatchPreparationTactic,
} from "./career/match-preparation-demo";
import { AppEntryScreen } from "./screens/AppEntryScreen";
import { CareerDashboardScreen } from "./screens/CareerDashboardScreen";
import { CareerMatchPreparationScreen } from "./screens/CareerMatchPreparationScreen";

type AppScreen = "app_entry" | "career_dashboard" | "match_preparation";

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
  const [matchPreparationState, setMatchPreparationState] = useState(createInitialDemoMatchPreparationState);
  const text = useMemo(() => createWebTranslator(preferences.language), [preferences.language]);
  const appEntryView = useMemo(
    () => buildAppEntryViewModel({ preferences, hasDemoCareer }),
    [hasDemoCareer, preferences],
  );
  const dashboardPresentation = useMemo(
    () => presentCareerDashboard(buildDemoCareerDashboard(buildDemoSavedPreparationInput(matchPreparationState))),
    [matchPreparationState],
  );
  const matchPreparationView = useMemo(
    () => buildDemoMatchPreparationView(matchPreparationState),
    [matchPreparationState],
  );
  const openInboxAction = (actionId: string): void => {
    if (actionId === "prepare_match") {
      setScreen("match_preparation");
    }
  };

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
          setContinueResult(continueDemoCareer(matchPreparationState));
        }}
        onOpenMatchPreparation={() => {
          setScreen("match_preparation");
        }}
        onInboxActionClick={openInboxAction}
      />
    );
  }

  if (screen === "match_preparation") {
    return (
      <CareerMatchPreparationScreen
        view={matchPreparationView}
        {...(continueResult === undefined ? {} : { continueResult })}
        text={text}
        onBackToMenu={() => {
          setScreen("app_entry");
        }}
        onBackToDashboard={() => {
          setScreen("career_dashboard");
        }}
        onContinueCareer={() => {
          setContinueResult(continueDemoCareer(matchPreparationState));
        }}
        onInboxActionClick={openInboxAction}
        onLineupPlayerChange={(slotKey, playerId) => {
          setMatchPreparationState((current) => selectDemoMatchPreparationPlayer(current, slotKey, playerId));
        }}
        onTacticProfileChange={(tacticProfileId) => {
          setMatchPreparationState((current) => selectDemoMatchPreparationTactic(current, tacticProfileId));
        }}
        onSavePreparation={() => {
          const result = saveDemoMatchPreparation(matchPreparationState);
          setMatchPreparationState(result.state);

          if (result.state.isSaved) {
            setContinueResult(undefined);
          }
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
        setMatchPreparationState(createInitialDemoMatchPreparationState());
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
