import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { CareerAutosaveIntervalDays, SaveMetadata } from "@game/storage";
import { toISO } from "@game/shared";
import type { CareerContractTermsInput } from "@game/ui";
import {
  selectAskingPriceCurves,
  selectPlayerValuationConfig,
} from "@game/content";

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
import { CareerMarketScreen } from "../features/market/CareerMarketScreen";
import {
  previewMarketOffer,
  type MarketOfferDraft,
} from "../features/market/career-market-adapter";
import { CareerMatchPreparationScreen } from "../features/match-preparation/CareerMatchPreparationScreen";
import { CareerSquadScreen } from "../features/squad/CareerSquadScreen";
import {
  previewCareerContractOffer,
  type CareerContractFinancePreview,
} from "../features/squad/career-squad-adapter";
import { CareerTacticsScreen } from "../features/tactics/CareerTacticsScreen";
import {
  selectHasPendingMatchdayTeamChanges,
  useCareerUiStore,
} from "../stores/career-ui-store";
import type { WebCareerRuntimeHandle } from "../infrastructure/persistence/create-web-career-storage";
import {
  classifyWebCareerPersistenceFailure,
  inspectWebCareerAttention,
  type WebSelectedClubContractCommand,
  type WebSelectedClubContractCommandResult,
  type WebSelectedClubMarketCommand,
  type WebSelectedClubMarketCommandResult,
} from "../runtime/web-career-runtime";
import { includeDraftInCareerSessionStatus } from "../runtime/career-session";
import { useCareerCommandRunner } from "./use-career-command-runner";

type PreparationNavigationIntent =
  | "app_entry"
  | "career_dashboard"
  | "career_inbox"
  | "career_squad"
  | "career_tactics"
  | "career_market"
  | "matchday";

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
  const hasPendingMatchdayTeamChanges = useCareerUiStore(selectHasPendingMatchdayTeamChanges);
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
  const openSquad = useCareerUiStore((state) => state.openSquad);
  const openTactics = useCareerUiStore((state) => state.openTactics);
  const openMarket = useCareerUiStore((state) => state.openMarket);
  const openMarketPlayer = useCareerUiStore((state) => state.openMarketPlayer);
  const marketFocus = useCareerUiStore((state) => state.marketFocus);
  const setInboxFilter = useCareerUiStore((state) => state.setInboxFilter);
  const selectInboxMessage = useCareerUiStore((state) => state.selectInboxMessage);
  const openMatchPreparation = useCareerUiStore((state) => state.openMatchPreparation);
  const handleInboxAction = useCareerUiStore((state) => state.handleInboxAction);
  const receiveCareerSessionUpdate = useCareerUiStore((state) => state.receiveCareerSessionUpdate);
  const receiveManualCareerSave = useCareerUiStore((state) => state.receiveManualCareerSave);
  const receiveInboxSessionUpdate = useCareerUiStore((state) => state.receiveInboxSessionUpdate);
  const receiveWorkingCareerUpdate = useCareerUiStore((state) => state.receiveWorkingCareerUpdate);
  const beginCalendarAdvanceTransition = useCareerUiStore((state) => state.beginCalendarAdvanceTransition);
  const showCalendarAdvanceDate = useCareerUiStore((state) => state.showCalendarAdvanceDate);
  const receiveMatchdaySessionUpdate = useCareerUiStore((state) => state.receiveMatchdaySessionUpdate);
  const receiveLiveMatchdayProgress = useCareerUiStore((state) => state.receiveLiveMatchdayProgress);
  const beginCareerCommand = useCareerUiStore((state) => state.beginCareerCommand);
  const failCareerCommand = useCareerUiStore((state) => state.failCareerCommand);
  const failCareerStorage = useCareerUiStore((state) => state.failCareerStorage);
  const substituteMatchdayPlayer = useCareerUiStore((state) => state.substituteMatchdayPlayer);
  const exchangeMatchdayLineupSlots = useCareerUiStore((state) => state.exchangeMatchdayLineupSlots);
  const adaptMatchdayBoardSlot = useCareerUiStore((state) => state.adaptMatchdayBoardSlot);
  const acceptPendingMatchdayTeamChanges = useCareerUiStore((state) => state.acceptPendingMatchdayTeamChanges);
  const discardPendingMatchdayTeamChanges = useCareerUiStore((state) => state.discardPendingMatchdayTeamChanges);
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
  const [betaResetPerformed, setBetaResetPerformed] = useState(false);
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
    market: marketPresentation,
    squad: squadPresentation,
    matchPreparation: matchPreparationView,
    tacticalBoardPlayers,
    matchPreparationPlayerFactsById,
    matchday: matchdayView,
    matchdayPhase: matchdayPhaseView,
    teamControlPanel,
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

  const preparationDraftDirty = screen !== "app_entry"
    && screen !== "matchday"
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
  const marketCommandPending = commandActivity?.status === "pending"
    && commandActivity.commandId === "market_negotiation";

  useEffect(() => {
    let active = true;
    setBetaResetPerformed(false);
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
        execute: async () => {
          const handle = await currentHandlePromise;
          return {
            saves: await handle.runtime.listCareers(),
            betaResetPerformed: handle.storageInfo.betaResetPerformed,
          };
        },
        onSuccess: (result) => {
          if (active) {
            receiveAvailableSaves(result.saves);
            setBetaResetPerformed(result.betaResetPerformed);
          }
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
    if (intent === "career_squad") openSquad();
    if (intent === "career_tactics") openTactics();
    if (intent === "career_market") openMarket();
    if (intent === "matchday") openPreparedMatchday();
  }, [backToMenu, openDashboard, openInbox, openMarket, openPreparedMatchday, openSquad, openTactics]);

  const requestPreparationNavigation = useCallback((intent: PreparationNavigationIntent) => {
    const canPreserveDraftAcrossRoute = intent === "career_dashboard"
      || intent === "career_inbox"
      || intent === "career_squad"
      || intent === "career_tactics"
      || intent === "career_market";
    if (preparationDraftDirty && !canPreserveDraftAcrossRoute) {
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
    if (actionId === "open_squad") {
      requestPreparationNavigation("career_squad");
      return;
    }
    if (actionId === "open_tactics") {
      requestPreparationNavigation("career_tactics");
      return;
    }
    if (actionId === "open_market") {
      requestPreparationNavigation("career_market");
      return;
    }
    if (actionId === "open_matchday") {
      requestPreparationNavigation("matchday");
      return;
    }
    if (actionId === "open_market_negotiation") {
      const targetMessageId = inboxPresentation?.postaView.selectedMessageId;
      const message = activeCareerState?.currentSeasonInbox?.find(
        (candidate) => String(candidate.id) === targetMessageId,
      );
      const playerId = message?.related.playerId;
      if (playerId !== undefined) {
        openMarketPlayer(String(playerId));
        return;
      }
      requestPreparationNavigation("career_market");
      return;
    }
    handleInboxAction(actionId);
  }, [
    activeCareerState,
    handleInboxAction,
    inboxPresentation,
    openMarketPlayer,
    requestPreparationNavigation,
  ]);

  const previewSelectedClubContractOffer = useCallback((
    playerId: string,
    terms: CareerContractTermsInput,
  ): CareerContractFinancePreview => activeCareerState === undefined
    ? { status: "rejected", reason: "contract_context_missing" }
    : previewCareerContractOffer(activeCareerState, playerId, terms), [activeCareerState]);

  const applySelectedClubContractCommand = useCallback(async (
    command: WebSelectedClubContractCommand,
  ): Promise<WebSelectedClubContractCommandResult | undefined> => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return undefined;

    let commandResult: WebSelectedClubContractCommandResult | undefined;
    const completed = await runCareerCommand({
      commandId: "contract_negotiation",
      statusLabelKey: "career.command.updatingContract",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.applySelectedClubContractCommand(
          activeCareerState.saveId,
          command,
        );
      },
      onSuccess: (result) => {
        commandResult = result;
        if (result.status === "applied") {
          receiveWorkingCareerUpdate(
            result.state,
            result.continueResult,
            result.sessionStatus,
          );
        }
      },
    });
    return completed ? commandResult : undefined;
  }, [activeCareerState, receiveWorkingCareerUpdate, runCareerCommand]);

  const previewSelectedClubMarketOffer = useCallback((
    draft: MarketOfferDraft,
  ): ReturnType<typeof previewMarketOffer> => activeCareerState === undefined
    ? { status: "blocked", previewId: "none", reason: "missing_finance" }
    : previewMarketOffer(
        activeCareerState,
        draft,
        selectPlayerValuationConfig(activeCareerState.gameState.meta.calibrationVersions),
        selectAskingPriceCurves(activeCareerState.gameState.meta.calibrationVersions),
      ), [activeCareerState]);

  const applySelectedClubMarketCommand = useCallback(async (
    command: WebSelectedClubMarketCommand,
  ): Promise<WebSelectedClubMarketCommandResult | undefined> => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return undefined;

    let commandResult: WebSelectedClubMarketCommandResult | undefined;
    const completed = await runCareerCommand({
      commandId: "market_negotiation",
      statusLabelKey: "career.command.updatingMarket",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.applySelectedClubMarketCommand(
          activeCareerState.saveId,
          command,
        );
      },
      onSuccess: (result) => {
        commandResult = result;
        if (result.status === "applied") {
          receiveWorkingCareerUpdate(
            result.state,
            result.continueResult,
            result.sessionStatus,
          );
        }
      },
    });
    return completed ? commandResult : undefined;
  }, [activeCareerState, receiveWorkingCareerUpdate, runCareerCommand]);

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
        return (await handlePromise).runtime.resumeMatchday(activeCareerState.saveId);
      },
      onSuccess: ({ matchdayState }) => {
        receiveLiveMatchdayProgress(matchdayState);
        if (matchdayState.lastSessionAttempt.status !== "invalid") acceptPendingMatchdayTeamChanges();
      },
    });
  }, [
    acceptPendingMatchdayTeamChanges,
    activeCareerState,
    receiveLiveMatchdayProgress,
    runCareerCommand,
  ]);

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
        return (await handlePromise).runtime.resumeMatchday(activeCareerState.saveId, matchPreparationState);
      },
      onSuccess: ({ matchdayState }) => {
        receiveLiveMatchdayProgress(matchdayState);
        if (matchdayState.lastSessionAttempt.status !== "invalid") acceptPendingMatchdayTeamChanges();
      },
    });
  }, [
    acceptPendingMatchdayTeamChanges,
    activeCareerState,
    matchPreparationState,
    receiveLiveMatchdayProgress,
    runCareerCommand,
  ]);

  const pauseMatchday = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return;
    void runCareerCommand({
      commandId: "pause_match",
      statusLabelKey: "career.matchday.playback.pause",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.pauseMatchday(activeCareerState.saveId);
      },
      onSuccess: ({ matchdayState }) => {
        receiveLiveMatchdayProgress(matchdayState);
      },
    });
  }, [activeCareerState, receiveLiveMatchdayProgress, runCareerCommand]);

  const resumeMatchday = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined || matchPreparationState === undefined) return;
    void runCareerCommand({
      commandId: "resume_match",
      statusLabelKey: "career.matchday.playback.resume",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.resumeMatchday(activeCareerState.saveId, matchPreparationState);
      },
      onSuccess: ({ matchdayState }) => {
        receiveLiveMatchdayProgress(matchdayState);
        if (matchdayState.lastSessionAttempt.status !== "invalid") acceptPendingMatchdayTeamChanges();
      },
    });
  }, [
    acceptPendingMatchdayTeamChanges,
    activeCareerState,
    matchPreparationState,
    receiveLiveMatchdayProgress,
    runCareerCommand,
  ]);

  const resolveMatchdayIncident = useCallback(() => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return;
    void runCareerCommand({
      commandId: "resolve_match_incident",
      statusLabelKey: "career.command.confirmingTeam",
      failureScope: "current_career",
      execute: async () => {
        if (handlePromise === undefined) throw { code: "storage_unavailable" };
        return (await handlePromise).runtime.resolveMatchdayIncident(activeCareerState.saveId);
      },
      onSuccess: ({ matchdayState }) => {
        receiveLiveMatchdayProgress(matchdayState);
      },
    });
  }, [activeCareerState, receiveLiveMatchdayProgress, runCareerCommand]);

  const advanceMatchdayMinute = useCallback(async (): Promise<void> => {
    const handlePromise = runtimeHandleRef.current;
    if (activeCareerState === undefined) return;
    try {
      if (handlePromise === undefined) throw { code: "storage_unavailable" };
      const update = (await handlePromise).runtime.advanceMatchdayMinute(activeCareerState.saveId);
      if (update.status === "live") {
        receiveLiveMatchdayProgress(update.matchdayState);
        return;
      }
      receiveLiveMatchdayProgress(update.matchdayState);
    } catch (error: unknown) {
      const failure = classifyWebCareerPersistenceFailure(error);
      beginCareerCommand(
        "advance_match_minute",
        matchdayPhaseView?.phase === "second_half"
          ? "career.command.playingSecondHalf"
          : "career.command.playingFirstHalf",
      );
      failCareerCommand("advance_match_minute", failure.code);
      failCareerStorage(failure, "current_career");
    }
  }, [
    activeCareerState,
    beginCareerCommand,
    failCareerCommand,
    failCareerStorage,
    matchdayPhaseView?.phase,
    receiveLiveMatchdayProgress,
  ]);

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
    screen === "career_squad"
    && squadPresentation !== undefined
    && inboxPresentation !== undefined
    && careerFrameProps !== undefined
  ) {
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerSquadScreen
          presentation={squadPresentation}
          inboxView={inboxPresentation.railView}
          language={preferences.language}
          contractCommandPending={commandActivity?.status === "pending"
            && commandActivity.commandId === "contract_negotiation"}
          text={text}
          onBackToMenu={requestBackToMenu}
          onInboxActionClick={handleShellNavigation}
          onLineupPlayerChange={selectLineupPlayer}
          onBenchPlayerChange={selectBenchPlayer}
          previewContractOffer={previewSelectedClubContractOffer}
          onContractCommand={applySelectedClubContractCommand}
        />
      </CareerAppFrame>
    );
  }

  if (
    screen === "career_market"
    && activeCareerState !== undefined
    && marketPresentation !== undefined
    && inboxPresentation !== undefined
    && careerFrameProps !== undefined
  ) {
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerMarketScreen
          presentation={marketPresentation}
          inboxView={inboxPresentation.railView}
          selectedClubName={activeCareerState.gameState.clubs[activeCareerState.selectedClubId]?.name ?? ""}
          currentDateIso={toISO(activeCareerState.gameState.calendar.currentDate)}
          language={preferences.language}
          marketCommandPending={marketCommandPending}
          text={text}
          onBackToMenu={requestBackToMenu}
          onInboxActionClick={handleShellNavigation}
          previewOffer={previewSelectedClubMarketOffer}
          onMarketCommand={applySelectedClubMarketCommand}
          {...(marketFocus === undefined ? {} : { focusRequest: marketFocus })}
        />
      </CareerAppFrame>
    );
  }

  if (
    screen === "career_tactics"
    && activeCareerState !== undefined
    && matchPreparationView !== undefined
    && matchPreparationState !== undefined
    && careerFrameProps !== undefined
  ) {
    return (
      <CareerAppFrame {...careerFrameProps}>
        <CareerTacticsScreen
          view={matchPreparationView}
          currentDateIso={toISO(activeCareerState.gameState.calendar.currentDate)}
          draftDirty={preparationDraftDirty}
          tacticalBoardDraft={matchPreparationState.tacticalBoardDraft}
          tacticalBoardPlayers={tacticalBoardPlayers}
          playerFactsById={matchPreparationPlayerFactsById}
          {...(continueResult === undefined ? {} : { continueResult })}
          text={text}
          onBackToMenu={requestBackToMenu}
          onInboxActionClick={handleShellNavigation}
          onFormationChange={selectFormation}
          onLineupPlayerChange={selectLineupPlayer}
          onBenchPlayerChange={selectBenchPlayer}
          onTacticProfileChange={selectTacticProfile}
          onSelectionAction={applySelectionAction}
          onBoardSlotMove={moveBoardSlot}
          onBoardSlotRoleChange={changeBoardSlotRole}
          onBoardSlotClear={clearBoardSlot}
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
          {...(teamControlPanel === undefined ? {} : { teamControlPanel })}
          {...(matchPreparationView === undefined ? {} : { matchPreparationView })}
          {...(matchPreparationState === undefined ? {} : { tacticalBoardDraft: matchPreparationState.tacticalBoardDraft })}
          {...(continueResult === undefined ? {} : { continueResult })}
          hasPendingTeamChanges={hasPendingMatchdayTeamChanges}
          text={text}
          onBackToMenu={requestBackToMenu}
          onBackToDashboard={finishMatchday}
          onInboxActionClick={handleShellNavigation}
          onPrepareMatch={openMatchPreparation}
          onStartFirstHalf={startFirstHalf}
          onAdvanceMatchMinute={advanceMatchdayMinute}
          onPauseMatch={pauseMatchday}
          onResumeMatch={resumeMatchday}
          onResolveIncident={resolveMatchdayIncident}
          onApplyHalfTimeSubstitution={(decision) => {
            substituteMatchdayPlayer(decision.outgoingPlayerId, decision.incomingPlayerId);
          }}
          onHalfTimeFormationChange={selectFormation}
          onHalfTimeBoardSlotMove={moveBoardSlot}
          onHalfTimeBoardSlotRoleChange={changeBoardSlotRole}
          onMatchdayBoardSlotAdapt={adaptMatchdayBoardSlot}
          onMatchdayBoardSlotExchange={exchangeMatchdayLineupSlots}
          onMatchdayTacticProfileChange={selectTacticProfile}
          onDiscardPendingTeamChanges={discardPendingMatchdayTeamChanges}
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
      betaResetPerformed={betaResetPerformed}
    />
  );
}

function waitForCalendarFrame(delayMs: number): Promise<void> {
  if (delayMs <= 0) return Promise.resolve();
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}
