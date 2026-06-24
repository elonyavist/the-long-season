import { useEffect, useMemo } from "react";

import { createWebTranslator } from "./translation";
import { buildAppEntryViewModel } from "../features/app-entry/app-entry-view-model";
import { buildDemoCareerDashboard } from "../features/dashboard/build-demo-career-dashboard";
import { presentCareerDashboard } from "../features/dashboard/career-dashboard-presenter";
import {
  buildDemoMatchPreparationView,
  buildDemoSavedPreparationInput,
} from "../features/match-preparation/match-preparation-demo";
import { AppEntryScreen } from "../features/app-entry/AppEntryScreen";
import { CareerDashboardScreen } from "../features/dashboard/CareerDashboardScreen";
import { CareerMatchPreparationScreen } from "../features/match-preparation/CareerMatchPreparationScreen";
import { useCareerUiStore } from "../stores/career-ui-store";

/**
 * Minimal app shell with in-memory language and currency preferences.
 *
 * The real menu actions and dashboard arrive in later Phase 49 steps; this
 * component only proves that visible web labels are localized and preferences
 * are bounded.
 */
export function App(): React.JSX.Element {
  const preferences = useCareerUiStore((state) => state.preferences);
  const hasDemoCareer = useCareerUiStore((state) => state.hasDemoCareer);
  const screen = useCareerUiStore((state) => state.screen);
  const continueResult = useCareerUiStore((state) => state.continueResult);
  const matchPreparationState = useCareerUiStore((state) => state.matchPreparationState);
  const setPreferences = useCareerUiStore((state) => state.setPreferences);
  const startNewCareer = useCareerUiStore((state) => state.startNewCareer);
  const continueExistingCareer = useCareerUiStore((state) => state.continueExistingCareer);
  const backToMenu = useCareerUiStore((state) => state.backToMenu);
  const openDashboard = useCareerUiStore((state) => state.openDashboard);
  const openMatchPreparation = useCareerUiStore((state) => state.openMatchPreparation);
  const handleInboxAction = useCareerUiStore((state) => state.handleInboxAction);
  const continueCareer = useCareerUiStore((state) => state.continueCareer);
  const selectFormation = useCareerUiStore((state) => state.selectFormation);
  const selectLineupPlayer = useCareerUiStore((state) => state.selectLineupPlayer);
  const selectBenchPlayer = useCareerUiStore((state) => state.selectBenchPlayer);
  const selectTacticProfile = useCareerUiStore((state) => state.selectTacticProfile);
  const applySelectionAction = useCareerUiStore((state) => state.applySelectionAction);
  const moveBoardSlot = useCareerUiStore((state) => state.moveBoardSlot);
  const changeBoardSlotRole = useCareerUiStore((state) => state.changeBoardSlotRole);
  const clearBoardSlot = useCareerUiStore((state) => state.clearBoardSlot);
  const savePreparation = useCareerUiStore((state) => state.savePreparation);
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [screen]);

  if (screen === "career_dashboard") {
    return (
      <CareerDashboardScreen
        presentation={dashboardPresentation}
        {...(continueResult === undefined ? {} : { continueResult })}
        text={text}
        onBackToMenu={backToMenu}
        onContinueCareer={continueCareer}
        onOpenMatchPreparation={openMatchPreparation}
        onInboxActionClick={handleInboxAction}
      />
    );
  }

  if (screen === "match_preparation") {
    return (
      <CareerMatchPreparationScreen
        view={matchPreparationView}
        tacticalBoardDraft={matchPreparationState.tacticalBoardDraft}
        {...(continueResult === undefined ? {} : { continueResult })}
        text={text}
        onBackToMenu={backToMenu}
        onBackToDashboard={openDashboard}
        onContinueCareer={continueCareer}
        onInboxActionClick={handleInboxAction}
        onFormationChange={selectFormation}
        onLineupPlayerChange={selectLineupPlayer}
        onBenchPlayerChange={selectBenchPlayer}
        onTacticProfileChange={selectTacticProfile}
        onSelectionAction={applySelectionAction}
        onBoardSlotMove={moveBoardSlot}
        onBoardSlotRoleChange={changeBoardSlotRole}
        onBoardSlotClear={clearBoardSlot}
        onSavePreparation={savePreparation}
      />
    );
  }

  return (
    <AppEntryScreen
      view={appEntryView}
      preferences={preferences}
      text={text}
      onPreferencesChange={setPreferences}
      onStartNewCareer={startNewCareer}
      onContinueCareer={continueExistingCareer}
    />
  );
}
