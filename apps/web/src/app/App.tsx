import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { CareerAutosaveIntervalDays, SaveMetadata } from "@game/storage";
import { toISO } from "@game/shared";

import { createWebTranslator } from "./translation";
import { CareerAppFrame } from "./CareerAppFrame";
import { useCareerScreenPresentations } from "./use-career-screen-presentations";
import { buildAppEntryViewModel } from "../features/app-entry/app-entry-view-model";
import {
  buildDurableMatchPreparation,
  isMatchPreparationDraftDirty,
} from "../features/match-preparation/match-preparation-adapter";
import { AppEntryScreen } from "../features/app-entry/AppEntryScreen";
import { focusCurrentCareerTask } from "../features/app-shell/AppShell";
import type { CareerSaveLifecycle } from "../features/app-shell/CareerSaveControl";
import { CareerDashboardScreen } from "../features/dashboard/CareerDashboardScreen";
import { CareerInboxScreen } from "../features/inbox/CareerInboxScreen";
import { buildCalendarAdvanceTransition } from "../features/inbox/calendar-advance-transition";
import { CareerMatchdayScreen } from "../features/matchday/CareerMatchdayScreen";
import { CareerMatchPreparationScreen } from "../features/match-preparation/CareerMatchPreparationScreen";
import { useCareerUiStore } from "../stores/career-ui-store";
import type { WebCareerRuntimeHandle } from "../infrastructure/persistence/create-web-career-storage";
import {
  inspectWebCareerAttention,
} from "../runtime/web-career-runtime";
import { includeDraftInCareerSessionStatus } from "../runtime/career-session";
import { useCareerCommandRunner } from "./use-career-command-runner";

type PreparationNavigationIntent = "app_entry" | "career_dashboard" | "career_inbox" | "matchday" | "continue_career";

/**
 * Composes the web career screens around the runtime and ephemeral UI store.
 *
 * Durable career facts remain owned by the runtime; this component coordinates
 * translated presentation, command feedback, and navigation between screens.
 */
export function App(): React.JSX.Element {
  const preferences = useCareerUiStore((state) => state.preferences);
  const storageLifecycleStatus = useCareerUiStore((state) => state.storageLifecycleStatus);
  const availableSaves = useCareerUiStore((state) => state.availableSaves);
  const selectedSaveId = useCareerUiStore((state) => state.selectedSaveId);
  const storageFailure = useCareerUiStore((state) => state.storageFailure);
  const storageFailureScope = useCareerUiStore((state) => state.storageFailureScope);
  const screen = useCareerUiStore((state) => state.screen);
  const continueResult = useCareerUiStore((state) => state.continueResult);
  const matchPreparationState = useCareerUiStore((state) => state.matchPreparationState);
  const matchdayState = useCareerUiStore((state) => state.matchdayState);
  const inboxFilter = useCareerUiStore((state) => state.inboxFilter);
  const selectedInboxMessageId = useCareerUiStore((state) => state.selectedInboxMessageId);
  const careerSessionStatus = useCareerUiStore((state) => state.careerSessionStatus);
  const commandActivity = useCareerUiStore((state) => state.commandActivity);
  const setPreferences = useCareerUiStore((state) => state.setPreferences);
  const beginSaveDiscovery = useCareerUiStore((state) => state.beginSaveDiscovery);
  const receiveAvailableSaves = useCareerUiStore((state) => state.receiveAvailableSaves);
  const selectSave = useCareerUiStore((state) => state.selectSave);
  const beginCareerLoad = useCareerUiStore((state) => state.beginCareerLoad);
  const openPersistedCareer = useCareerUiStore((state) => state.openPersistedCareer);
  const backToMenu = useCareerUiStore((state) => state.backToMenu);
  const openDashboard = useCareerUiStore((state) => state.openDashboard);
  const openInbox = useCareerUiStore((state) => state.openInbox);
  const setInboxFilter = useCareerUiStore((state) => state.setInboxFilter);
  const selectInboxMessage = useCareerUiStore((state) => state.selectInboxMessage);
  const openMatchPreparation = useCareerUiStore((state) => state.openMatchPreparation);
  const handleInboxAction = useCareerUiStore((state) => state.handleInboxAction);
  const receiveCareerSessionUpdate = useCareerUiStore((state) => state.receiveCareerSessionUpdate);
  const receiveManualCareerSave = useCareerUiStore((state) => state.receiveManualCareerSave);
  const receiveInboxSessionUpdate = useCareerUiStore((state) => state.receiveInboxSessionUpdate);
  const beginCalendarAdvanceTransition = useCareerUiStore((state) => state.beginCalendarAdvanceTransition);
  const showCalendarAdvanceDate = useCareerUiStore((state) => state.showCalendarAdvanceDate);
  const receiveMatchdaySessionUpdate = useCareerUiStore((state) => state.receiveMatchdaySessionUpdate);
  const applyHalfTimeSubstitutions = useCareerUiStore((state) => state.applyHalfTimeSubstitutions);
  const selectFormation = useCareerUiStore((state) => state.selectFormation);
  const selectLineupPlayer = useCareerUiStore((state) => state.selectLineupPlayer);
  const selectBenchPlayer = useCareerUiStore((state) => state.selectBenchPlayer);
  const selectTacticProfile = useCareerUiStore((state) => state.selectTacticProfile);
  const applySelectionAction = useCareerUiStore((state) => state.applySelectionAction);
  const moveBoardSlot = useCareerUiStore((state) => state.moveBoardSlot);
  const changeBoardSlotRole = useCareerUiStore((state) => state.changeBoardSlotRole);
  const clearBoardSlot = useCareerUiStore((state) => state.clearBoardSlot);
  const discardMatchPreparationDraft = useCareerUiStore((state) => state.discardMatchPreparationDraft);
  const runCareerCommand = useCareerCommandRunner();
  const runtimeHandleRef = useRef<Promise<WebCareerRuntimeHandle> | undefined>(undefined);
  const previousScreenRef = useRef(screen);
  const [storageRetryNonce, setStorageRetryNonce] = useState(0);
  const [sessionStatusOverride, setSessionStatusOverride] = useState(careerSessionStatus);
  const [showUnsavedExitDialog, setShowUnsavedExitDialog] = useState(false);
  const [pendingPreparationNavigation, setPendingPreparationNavigation] = useState<PreparationNavigationIntent>();
  const [arrivingInboxMessageId, setArrivingInboxMessageId] = useState<string>();
  const reduceMotion = useReducedMotion();
  const text = useMemo(() => createWebTranslator(preferences.language), [preferences.language]);
  const appEntryView = useMemo(
    () => buildAppEntryViewModel({ preferences, lifecycleStatus: storageLifecycleStatus, saves: availableSaves, selectedSaveId, storageFailure }),
    [availableSaves, preferences, selectedSaveId, storageFailure, storageLifecycleStatus],
  );
  const activeCareerState = useCareerUiStore((state) => state.activeCareerState);
  const {
    dashboard: dashboardPresentation,
    inbox: inboxPresentation,
    matchPreparation: matchPreparationView,
    tacticalBoardPlayers,
    matchPreparationPlayerFactsById,
    matchday: matchdayView,
    matchdayPhase: matchdayPhaseView,
    halfTimeSubstitutions,
  } = useCareerScreenPresentations({
    inboxFilter,
    ...(activeCareerState === undefined ? {} : { activeCareerState }),
    ...(continueResult === undefined ? {} : { continueResult }),
    ...(selectedInboxMessageId === undefined ? {} : { selectedInboxMessageId }),
    ...(matchPreparationState === undefined ? {} : { matchPreparationState }),
    ...(matchdayState === undefined ? {} : { matchdayState }),
  });

  useEffect(() => {
    setSessionStatusOverride(undefined);
  }, [careerSessionStatus]);

  const preparationDraftDirty = screen === "match_preparation"
    && activeCareerState !== undefined
    && matchPreparationState !== undefined
    && isMatchPreparationDraftDirty(activeCareerState, matchPreparationState);
  const completeDraftPreparation = useMemo(
    () => activeCareerState === undefined || matchPreparationState === undefined
      ? undefined
      : buildDurableMatchPreparation(activeCareerState, matchPreparationState),
    [activeCareerState, matchPreparationState],
  );
  const baseSessionStatus = sessionStatusOverride ?? careerSessionStatus;
  const effectiveSessionStatus = includeDraftInCareerSessionStatus(
    baseSessionStatus,
    preparationDraftDirty,
  );
  const commandPending = commandActivity?.status === "pending";
  const saveCommandPending = commandActivity?.status === "pending"
    && commandActivity.commandId === "manual_save";

  useEffect(() => {
    let active = true;
    beginSaveDiscovery();
    let handlePromise: Promise<WebCareerRuntimeHandle> | undefined;

    // Strict Mode mounts effects twice in development. Deferring ownership by
    // one microtask lets its diagnostic mount cancel before opening SQLite or
    // acquiring the single command lock.
    queueMicrotask(() => {
      if (!active) return;
      const currentHandlePromise = import("../infrastructure/persistence/create-web-career-storage")
        .then(({ createWebCareerRuntime }) => createWebCareerRuntime());
      handlePromise = currentHandlePromise;
      runtimeHandleRef.current = currentHandlePromise;

      void runCareerCommand({
        commandId: "discover_careers",
        statusLabelKey: "web.app.storage.loading",
        failureScope: "app_entry",
        execute: async () => (await currentHandlePromise).runtime.listCareers(),
        onSuccess: (saves) => {
          if (active) receiveAvailableSaves(saves);
        },
      });
    });

    return () => {
      active = false;
      if (handlePromise === undefined) return;
      if (runtimeHandleRef.current === handlePromise) runtimeHandleRef.current = undefined;
      void handlePromise.then((handle) => handle.close()).catch(() => undefined);
    };
  }, [beginSaveDiscovery, receiveAvailableSaves, runCareerCommand, storageRetryNonce]);

  const retryStorage = useCallback(() => {
    setStorageRetryNonce((nonce) => nonce + 1);
  }, []);

  const startNewCareer = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    void runCareerCommand({
      commandId: "create_career",
      statusLabelKey: "career.command.creatingCareer",
      failureScope: "app_entry",
      execute: async () => {
        beginCareerLoad();
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.createNewCareer();
      },
      onSuccess: ({ state, metadata }) => {
        setArrivingInboxMessageId(undefined);
        openPersistedCareer(state, metadata, inspectWebCareerAttention(state));
      },
    });
  }, [beginCareerLoad, openPersistedCareer, runCareerCommand]);

  const continueExistingCareer = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    const metadata = availableSaves.find((entry) => entry.saveId === selectedSaveId);
    if (metadata === undefined) return;

    void runCareerCommand({
      commandId: "load_career",
      statusLabelKey: "career.command.loadingCareer",
      failureScope: "app_entry",
      execute: async () => {
        beginCareerLoad();
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.loadCareer(metadata.saveId);
      },
      onSuccess: (state) => {
        setArrivingInboxMessageId(undefined);
        openPersistedCareer(state, metadata, inspectWebCareerAttention(state));
      },
    });
  }, [availableSaves, beginCareerLoad, openPersistedCareer, runCareerCommand, selectedSaveId]);

  const continueLoadedCareer = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined || storageLifecycleStatus === "career_loading") return;

    void runCareerCommand({
      commandId: "continue_career",
      statusLabelKey: "career.command.advancingCareer",
      failureScope: "current_career",
      execute: async () => {
        beginCareerLoad();
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        const runtimeResult = await (await handlePromise).runtime.continueCareer(activeCareerState.saveId);
        const transition = buildCalendarAdvanceTransition(
          runtimeResult.continueResult.startDateIso,
          runtimeResult.continueResult.stopDateIso,
          Boolean(reduceMotion),
        );
        beginCalendarAdvanceTransition(transition);
        for (const frame of transition.frames) {
          await waitForCalendarFrame(frame.delayMs);
          showCalendarAdvanceDate(frame.dateIso);
        }
        return runtimeResult;
      },
      onSuccess: ({ state, metadata, continueResult: result, sessionStatus }) => {
        const previousMessageIds = new Set(
          (activeCareerState.currentSeasonInbox ?? []).map((message) => String(message.id)),
        );
        const arrivingAttentionIds = (state.currentSeasonInbox ?? [])
          .filter((message) => message.level !== "informational" && !previousMessageIds.has(String(message.id)))
          .map((message) => String(message.id));
        const selectedArrivalId = result.selectedMessageId !== undefined
          && arrivingAttentionIds.includes(result.selectedMessageId)
          ? result.selectedMessageId
          : arrivingAttentionIds[0];
        setArrivingInboxMessageId(selectedArrivalId);
        receiveCareerSessionUpdate(state, metadata, result, sessionStatus);
      },
    });
  }, [
    activeCareerState,
    beginCalendarAdvanceTransition,
    beginCareerLoad,
    receiveCareerSessionUpdate,
    reduceMotion,
    runCareerCommand,
    showCalendarAdvanceDate,
    storageLifecycleStatus,
  ]);

  const openSelectedInboxMessage = useCallback((messageId: string) => {
    const handlePromise = runtimeHandleRef.current;
    const message = activeCareerState?.currentSeasonInbox?.find((entry) => String(entry.id) === messageId);
    if (activeCareerState === undefined || message === undefined || message.lifecycle.read) return;

    void runCareerCommand({
      commandId: "open_inbox_message",
      statusLabelKey: "career.command.openingInbox",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.openInboxMessage(activeCareerState.saveId, message.id);
      },
      onSuccess: ({ state, metadata, continueResult: result, sessionStatus }) => {
        receiveInboxSessionUpdate(state, metadata, result, sessionStatus, messageId);
      },
    });
  }, [activeCareerState, receiveInboxSessionUpdate, runCareerCommand]);

  const openPreparedMatchday = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return;

    void runCareerCommand({
      commandId: "confirm_preparation",
      statusLabelKey: "career.command.confirmingTeam",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.openPreparedMatchday(activeCareerState.saveId);
      },
      onSuccess: ({ state, metadata, continueResult: result, matchdayState, sessionStatus }) => {
        receiveMatchdaySessionUpdate(state, metadata, result, matchdayState, sessionStatus);
      },
    });
  }, [activeCareerState, receiveMatchdaySessionUpdate, runCareerCommand]);

  const performPreparationNavigation = useCallback((intent: PreparationNavigationIntent) => {
    if (intent === "app_entry") backToMenu();
    if (intent === "career_dashboard") openDashboard();
    if (intent === "career_inbox") openInbox();
    if (intent === "matchday") openPreparedMatchday();
    if (intent === "continue_career") continueLoadedCareer();
  }, [backToMenu, continueLoadedCareer, openDashboard, openInbox, openPreparedMatchday]);

  const requestPreparationNavigation = useCallback((intent: PreparationNavigationIntent) => {
    if (preparationDraftDirty) {
      setPendingPreparationNavigation(intent);
      return;
    }
    performPreparationNavigation(intent);
  }, [performPreparationNavigation, preparationDraftDirty]);

  const handleShellNavigation = useCallback((actionId: string) => {
    if (actionId === "open_inbox") {
      requestPreparationNavigation("career_inbox");
      return;
    }
    if (actionId === "open_dashboard") {
      requestPreparationNavigation("career_dashboard");
      return;
    }
    if (actionId === "open_matchday") {
      requestPreparationNavigation("matchday");
      return;
    }
    handleInboxAction(actionId);
  }, [handleInboxAction, requestPreparationNavigation]);

  const savePreparationAndOpenMatchday = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (
      activeCareerState === undefined ||
      matchPreparationState === undefined
    ) return;

    const preparation = buildDurableMatchPreparation(activeCareerState, matchPreparationState);
    if (preparation === undefined) return;

    void runCareerCommand({
      commandId: "confirm_preparation",
      statusLabelKey: "career.command.confirmingTeam",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.saveMatchPreparation(activeCareerState.saveId, preparation);
      },
      onSuccess: ({ state, metadata, continueResult: result, matchdayState, sessionStatus }) => {
        receiveMatchdaySessionUpdate(state, metadata, result, matchdayState, sessionStatus);
      },
    });
  }, [activeCareerState, matchPreparationState, receiveMatchdaySessionUpdate, runCareerCommand]);

  const startFirstHalf = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return;
    void runCareerCommand({
      commandId: "play_first_half",
      statusLabelKey: "career.command.playingFirstHalf",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.progressMatchdayToHalfTime(activeCareerState.saveId);
      },
      onSuccess: ({ state, metadata, continueResult: result, matchdayState, sessionStatus }) => {
        receiveMatchdaySessionUpdate(state, metadata, result, matchdayState, sessionStatus);
      },
    });
  }, [activeCareerState, receiveMatchdaySessionUpdate, runCareerCommand]);

  const startSecondHalf = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (
      activeCareerState === undefined
      || matchPreparationState === undefined
    ) return;
    void runCareerCommand({
      commandId: "play_second_half",
      statusLabelKey: "career.command.playingSecondHalf",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.completeMatchday(activeCareerState.saveId, matchPreparationState);
      },
      onSuccess: ({ state, metadata, continueResult: result, matchdayState, sessionStatus }) => {
        receiveMatchdaySessionUpdate(state, metadata, result, matchdayState, sessionStatus);
      },
    });
  }, [activeCareerState, matchPreparationState, receiveMatchdaySessionUpdate, runCareerCommand]);

  const finishMatchday = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return;
    void runCareerCommand({
      commandId: "return_to_dashboard",
      statusLabelKey: "career.command.returningToDashboard",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.acknowledgeMatchday(activeCareerState.saveId);
      },
      onSuccess: ({ state, metadata, continueResult: result, matchdayState, sessionStatus }) => {
        receiveMatchdaySessionUpdate(state, metadata, result, matchdayState, sessionStatus);
        openDashboard();
      },
    });
  }, [activeCareerState, openDashboard, receiveMatchdaySessionUpdate, runCareerCommand]);

  const saveCurrentCareer = useCallback((navigationAfterSave?: PreparationNavigationIntent) => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined || screen === "matchday") return;
    if (preparationDraftDirty && completeDraftPreparation === undefined) return;

    void runCareerCommand({
      commandId: "manual_save",
      statusLabelKey: "career.command.savingCareer",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.saveCareerNow(
          activeCareerState.saveId,
          preparationDraftDirty ? completeDraftPreparation : undefined,
        );
      },
      onSuccess: ({ state, metadata, continueResult: result, sessionStatus }) => {
        receiveManualCareerSave(state, metadata, result, sessionStatus);
        setSessionStatusOverride(sessionStatus);
        setShowUnsavedExitDialog(false);
        setPendingPreparationNavigation(undefined);
        if (navigationAfterSave !== undefined) performPreparationNavigation(navigationAfterSave);
      },
    });
  }, [
    activeCareerState,
    completeDraftPreparation,
    performPreparationNavigation,
    preparationDraftDirty,
    receiveManualCareerSave,
    runCareerCommand,
    screen,
  ]);

  const updateAutosavePolicy = useCallback((policy: CareerAutosaveIntervalDays) => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined || screen === "matchday") return;

    void runCareerCommand({
      commandId: "update_autosave_policy",
      statusLabelKey: "career.command.updatingAutosave",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.updateAutosavePolicy(policy);
      },
      onSuccess: (snapshot) => setSessionStatusOverride(snapshot),
    });
  }, [activeCareerState, runCareerCommand, screen]);

  const requestBackToMenu = useCallback(() => {
    if (preparationDraftDirty) {
      setPendingPreparationNavigation("app_entry");
      return;
    }
    if (baseSessionStatus?.dirty === true) {
      setShowUnsavedExitDialog(true);
      return;
    }
    backToMenu();
  }, [backToMenu, baseSessionStatus?.dirty, preparationDraftDirty]);

  const exitWithoutSaving = useCallback(() => {
    setShowUnsavedExitDialog(false);
    backToMenu();
  }, [backToMenu]);

  const discardPreparationAndNavigate = useCallback(() => {
    const intent = pendingPreparationNavigation;
    if (intent === undefined) return;
    discardMatchPreparationDraft();
    setPendingPreparationNavigation(undefined);
    if (intent === "app_entry" && baseSessionStatus?.dirty === true) {
      setShowUnsavedExitDialog(true);
      return;
    }
    performPreparationNavigation(intent);
  }, [
    baseSessionStatus?.dirty,
    discardMatchPreparationDraft,
    pendingPreparationNavigation,
    performPreparationNavigation,
  ]);

  const saveLifecycle = useMemo<CareerSaveLifecycle | undefined>(() => {
    if (effectiveSessionStatus === undefined) return undefined;
    return {
      sessionStatus: effectiveSessionStatus,
      canSave: screen !== "matchday"
        && (!preparationDraftDirty || completeDraftPreparation !== undefined),
      pending: saveCommandPending,
      onSave: () => saveCurrentCareer(),
      onPolicyChange: updateAutosavePolicy,
    };
  }, [
    completeDraftPreparation,
    effectiveSessionStatus,
    preparationDraftDirty,
    saveCommandPending,
    saveCurrentCareer,
    screen,
    updateAutosavePolicy,
  ]);

  useEffect(() => {
    if (screen === "app_entry" || effectiveSessionStatus?.dirty !== true) return undefined;
    const guardUnsavedCareer = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guardUnsavedCareer);
    return () => window.removeEventListener("beforeunload", guardUnsavedCareer);
  }, [effectiveSessionStatus?.dirty, screen]);

  useEffect(() => {
    const previousScreen = previousScreenRef.current;
    previousScreenRef.current = screen;
    if (previousScreen === screen) return undefined;

    const frame = window.requestAnimationFrame(() => {
      focusCurrentCareerTask(true);
      window.scrollTo({ top: 0, left: 0 });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [screen]);

  useEffect(() => {
    if (
      screen !== "career_inbox"
      || selectedInboxMessageId === undefined
      || commandPending
    ) return;
    openSelectedInboxMessage(selectedInboxMessageId);
  }, [commandPending, openSelectedInboxMessage, screen, selectedInboxMessageId]);

  const careerFrameProps = saveLifecycle === undefined
    ? undefined
    : {
        saveLifecycle,
        ...(storageFailureScope === "current_career" && storageFailure !== undefined
          ? { storageFailure }
          : {}),
        onRetryStorage: retryStorage,
        exitDialog: {
          mode: pendingPreparationNavigation === undefined
            ? "career_exit" as const
            : "preparation_navigation" as const,
          canSave: pendingPreparationNavigation === undefined
            ? screen !== "matchday"
            : completeDraftPreparation !== undefined,
          open: showUnsavedExitDialog || pendingPreparationNavigation !== undefined,
          pending: commandPending,
          text,
          onCancel: () => {
            setShowUnsavedExitDialog(false);
            setPendingPreparationNavigation(undefined);
          },
          onExitWithoutSaving: pendingPreparationNavigation === undefined
            ? exitWithoutSaving
            : discardPreparationAndNavigate,
          onSaveAndExit: () => saveCurrentCareer(pendingPreparationNavigation ?? "app_entry"),
        },
      };

  if (screen === "career_dashboard" && dashboardPresentation !== undefined && careerFrameProps !== undefined) {
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerDashboardScreen
          presentation={dashboardPresentation}
          commandActivity={commandActivity}
          text={text}
          onBackToMenu={requestBackToMenu}
          onContinueCareer={continueLoadedCareer}
          onOpenMatchday={openPreparedMatchday}
          onOpenMatchPreparation={openMatchPreparation}
          onInboxActionClick={handleShellNavigation}
        />
      </CareerAppFrame>
    );
  }

  if (
    screen === "career_inbox"
    && activeCareerState !== undefined
    && inboxPresentation !== undefined
    && careerFrameProps !== undefined
  ) {
    const selectedClubName = activeCareerState.gameState.clubs[activeCareerState.selectedClubId]?.name ?? "";
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerInboxScreen
          selectedClubName={selectedClubName}
          currentDateIso={toISO(activeCareerState.gameState.calendar.currentDate)}
          postaView={inboxPresentation.postaView}
          railView={inboxPresentation.railView}
          {...(commandActivity === undefined ? {} : { commandActivity })}
          {...(arrivingInboxMessageId === undefined
            ? {}
            : {
                arrivalMessageId: arrivingInboxMessageId,
                onArrivalPresented: (messageId: string) => {
                  setArrivingInboxMessageId((current) => current === messageId ? undefined : current);
                },
              })}
          text={text}
          onBackToMenu={requestBackToMenu}
          onBackToDashboard={openDashboard}
          onContinueCareer={continueLoadedCareer}
          onFilterChange={setInboxFilter}
          onMessageSelect={selectInboxMessage}
          onPrimaryAction={handleShellNavigation}
        />
      </CareerAppFrame>
    );
  }

  if (
    screen === "matchday"
    && matchdayView !== undefined
    && matchdayPhaseView !== undefined
    && careerFrameProps !== undefined
  ) {
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerMatchdayScreen
          view={matchdayView}
          phaseView={matchdayPhaseView}
          {...(halfTimeSubstitutions === undefined ? {} : { halfTimeSubstitutions })}
          {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
          {...(matchPreparationState === undefined ? {} : { tacticalBoardDraft: matchPreparationState.tacticalBoardDraft })}
          {...(continueResult === undefined ? {} : { continueResult })}
          text={text}
          onBackToMenu={requestBackToMenu}
          onBackToDashboard={finishMatchday}
          onContinueCareer={continueLoadedCareer}
          onInboxActionClick={handleShellNavigation}
          onPrepareMatch={openMatchPreparation}
          onPlayFixture={startFirstHalf}
          onApplyHalfTimeSubstitution={(decision) => applyHalfTimeSubstitutions([decision])}
          onHalfTimeFormationChange={selectFormation}
          onHalfTimeLineupPlayerChange={selectLineupPlayer}
          onHalfTimeBenchPlayerChange={selectBenchPlayer}
          onHalfTimeBoardSlotMove={moveBoardSlot}
          onHalfTimeBoardSlotRoleChange={changeBoardSlotRole}
          onHalfTimeBoardSlotClear={clearBoardSlot}
          onStartSecondHalf={startSecondHalf}
        />
      </CareerAppFrame>
    );
  }

  if (
    screen === "match_preparation"
    && activeCareerState !== undefined
    && matchPreparationView !== undefined
    && matchPreparationState !== undefined
    && careerFrameProps !== undefined
  ) {
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerMatchPreparationScreen
          view={matchPreparationView}
          currentDateIso={toISO(activeCareerState.gameState.calendar.currentDate)}
          draftDirty={preparationDraftDirty}
          tacticalBoardDraft={matchPreparationState.tacticalBoardDraft}
          tacticalBoardPlayers={tacticalBoardPlayers}
          playerFactsById={matchPreparationPlayerFactsById}
          {...(continueResult === undefined ? {} : { continueResult })}
          text={text}
          onBackToMenu={requestBackToMenu}
          onBackToDashboard={() => requestPreparationNavigation("career_dashboard")}
          onContinueCareer={() => requestPreparationNavigation("continue_career")}
          onInboxActionClick={handleShellNavigation}
          onFormationChange={selectFormation}
          onLineupPlayerChange={selectLineupPlayer}
          onBenchPlayerChange={selectBenchPlayer}
          onTacticProfileChange={selectTacticProfile}
          onSelectionAction={applySelectionAction}
          onBoardSlotMove={moveBoardSlot}
          onBoardSlotRoleChange={changeBoardSlotRole}
          onBoardSlotClear={clearBoardSlot}
          onSavePreparation={savePreparationAndOpenMatchday}
        />
      </CareerAppFrame>
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
      onSelectedSaveChange={(save: SaveMetadata["saveId"]) => selectSave(save)}
      onRetryStorage={retryStorage}
    />
  );
}

function waitForCalendarFrame(delayMs: number): Promise<void> {
  if (delayMs <= 0) return Promise.resolve();
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}
