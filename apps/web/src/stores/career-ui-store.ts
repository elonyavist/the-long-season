import { create } from "zustand";
import type { MessageKey } from "@game/i18n";
import type { CareerSaveMetadata, CareerStorage } from "@game/storage";
import type { CareerMatchPreparationFormationId } from "@game/ui";
import type { CareerPostaFilter } from "@game/ui";

import {
  DEFAULT_WEB_PREFERENCES,
  type WebPreferences,
} from "../app/preferences";
import type {
  WebCareerContinueResult,
  WebCareerPersistenceFailure,
  WebCareerPersistenceFailureCode,
} from "../runtime/web-career-runtime";
import {
  adaptMatchPreparationBoardSlot,
  acceptLiveTeamPlan,
  applyMatchPreparationSelectionAction,
  changeMatchPreparationBoardSlotRole,
  clearMatchPreparationBoardSlot,
  createMatchPreparationDraft,
  exchangeMatchPreparationBoardPlayers,
  moveMatchPreparationBoardSlot,
  reconcileMatchPreparationDraft,
  selectMatchPreparationBenchPlayer,
  selectMatchPreparationFormation,
  selectMatchPreparationPlayer,
  selectMatchPreparationTactic,
  substituteMatchPreparationPlayer,
  type MatchPreparationDraft,
  type MatchPreparationSelectionAction,
} from "../features/match-preparation/match-preparation-adapter";
import { createWebMatchdayState, type WebMatchdayState } from "../features/matchday/matchday-adapter";
import type { TacticalBoardRoleCode } from "../features/tactics-board/tactical-board-types";
import {
  createCleanCareerSessionStatus,
  type CareerSessionStatus,
} from "../runtime/career-session";

/** Current top-level screen in the in-memory web career prototype. */
export type CareerUiScreen =
  | "app_entry"
  | "career_dashboard"
  | "career_inbox"
  | "career_squad"
  | "career_tactics"
  | "match_preparation"
  | "matchday";

/** Bounded persistence lifecycle represented by the app-entry screen. */
export type CareerStorageLifecycleStatus = "storage_loading" | "ready" | "career_loading" | "storage_error";

/** Determines whether a failed operation returns to app entry or preserves the current career screen. */
export type CareerStorageFailureScope = "app_entry" | "current_career";

/** Real asynchronous career mutations currently issued by the web app. */
export type CareerCommandId =
  | "discover_careers"
  | "create_career"
  | "load_career"
  | "continue_career"
  | "open_inbox_message"
  | "contract_negotiation"
  | "manual_save"
  | "update_autosave_policy"
  | "confirm_preparation"
  | "play_first_half"
  | "play_second_half"
  | "advance_match_minute"
  | "pause_match"
  | "resume_match"
  | "resolve_match_incident"
  | "return_to_dashboard";

/** Observable lifecycle for the single allowed asynchronous career command. */
export type CareerCommandActivity = Readonly<{
  commandId: CareerCommandId;
  status: "pending" | "failed";
  statusLabelKey: MessageKey;
  errorCode?: WebCareerPersistenceFailureCode;
}>;

/** Presentation-only calendar date shown while the canonical Continue command is pending. */
export type CalendarAdvanceUiState = Readonly<{
  startDateIso: string;
  stopDateIso: string;
  visibleDateIso: string;
  elapsedDays: number;
  status: "advancing" | "complete";
}>;

type StoredCareerState = Awaited<ReturnType<CareerStorage["loadCareer"]>>;
type StoredSaveId = CareerSaveMetadata["saveId"];

/** Browser-owned career UI state that must not duplicate engine rules. */
export interface CareerUiStoreState {
  /** Current language and currency preferences for visible browser labels. */
  readonly preferences: WebPreferences;
  /** Current asynchronous persistence lifecycle state. */
  readonly storageLifecycleStatus: CareerStorageLifecycleStatus;
  /** Real durable saves available to continue. */
  readonly availableSaves: readonly CareerSaveMetadata[];
  /** Save selected by the manager on the app-entry screen. */
  readonly selectedSaveId: StoredSaveId | undefined;
  /** Validated career loaded from or written to canonical storage. */
  readonly activeCareerState: StoredCareerState | undefined;
  /** Save-status projection derived from the runtime session contract. */
  readonly careerSessionStatus: CareerSessionStatus | undefined;
  /** Single observable mutation command, replacing view-local pending refs. */
  readonly commandActivity: CareerCommandActivity | undefined;
  /** Visible date transition; it never owns engine progress or a second command lock. */
  readonly calendarAdvanceTransition: CalendarAdvanceUiState | undefined;
  /** Stable storage failure rendered through localized recovery guidance. */
  readonly storageFailure: WebCareerPersistenceFailure | undefined;
  /** Safe UI area where the current recovery surface must remain visible. */
  readonly storageFailureScope: CareerStorageFailureScope | undefined;
  /** Current top-level screen selected by manager actions. */
  readonly screen: CareerUiScreen;
  /** Last Continue result shown in dashboard and preparation screens. */
  readonly continueResult: WebCareerContinueResult | undefined;
  /** Current unsaved or saved match-preparation draft. */
  readonly matchPreparationState: MatchPreparationDraft | undefined;
  /** Last team plan accepted by the private live match session. */
  readonly matchdayTeamBaseline: MatchPreparationDraft | undefined;
  /** Matchday presentation rebuilt from the latest working session state. */
  readonly matchdayState: WebMatchdayState | undefined;
  /** Ephemeral current-season Posta filter; never persisted in CareerState. */
  readonly inboxFilter: CareerPostaFilter;
  /** Ephemeral selected Posta identity; lifecycle remains in CareerState. */
  readonly selectedInboxMessageId: string | undefined;
  /** Replaces bounded web preferences from the settings controls. */
  readonly setPreferences: (preferences: WebPreferences) => void;
  /** Marks startup save discovery as active. */
  readonly beginSaveDiscovery: () => void;
  /** Replaces the app-entry save list after successful durable discovery. */
  readonly receiveAvailableSaves: (saves: readonly CareerSaveMetadata[]) => void;
  /** Selects one real save without loading it yet. */
  readonly selectSave: (selectedSaveId: StoredSaveId) => void;
  /** Marks a new-career or selected-save load operation as active. */
  readonly beginCareerLoad: () => void;
  /** Acquires the one mutation slot synchronously, or rejects a duplicate/conflict. */
  readonly beginCareerCommand: (commandId: CareerCommandId, statusLabelKey: MessageKey) => boolean;
  /** Clears matching activity after the new career snapshot has been published. */
  readonly completeCareerCommand: (commandId: CareerCommandId) => void;
  /** Releases pending state while retaining one bounded recoverable failure. */
  readonly failCareerCommand: (
    commandId: CareerCommandId,
    errorCode: WebCareerPersistenceFailureCode,
  ) => void;
  /** Starts presentation of an already-computed engine advancement. */
  readonly beginCalendarAdvanceTransition: (transition: Readonly<{
    startDateIso: string;
    stopDateIso: string;
    initialDateIso: string;
    elapsedDays: number;
  }>) => void;
  /** Advances only the visible date while the canonical command stays pending. */
  readonly showCalendarAdvanceDate: (dateIso: string) => void;
  /** Opens a validated durable career and refreshes its metadata row. */
  readonly openPersistedCareer: (
    state: StoredCareerState,
    metadata: CareerSaveMetadata,
    continueResult: WebCareerContinueResult,
  ) => void;
  /** Publishes a runtime command result from the working career session. */
  readonly receiveCareerSessionUpdate: (
    state: StoredCareerState,
    metadata: CareerSaveMetadata,
    continueResult: WebCareerContinueResult,
    sessionStatus: CareerSessionStatus,
  ) => void;
  /** Publishes an explicit manual commit without changing the current route. */
  readonly receiveManualCareerSave: (
    state: StoredCareerState,
    metadata: CareerSaveMetadata,
    continueResult: WebCareerContinueResult,
    sessionStatus: CareerSessionStatus,
  ) => void;
  /** Publishes a Posta lifecycle update without changing the manager's route or selection. */
  readonly receiveInboxSessionUpdate: (
    state: StoredCareerState,
    metadata: CareerSaveMetadata,
    continueResult: WebCareerContinueResult,
    sessionStatus: CareerSessionStatus,
    selectedMessageId: string,
  ) => void;
  /** Publishes a memory-only career command while preserving route and preparation edits. */
  readonly receiveWorkingCareerUpdate: (
    state: StoredCareerState,
    continueResult: WebCareerContinueResult,
    sessionStatus: CareerSessionStatus,
  ) => void;
  /** Publishes one in-memory staged-match update. */
  readonly receiveMatchdaySessionUpdate: (
    state: StoredCareerState,
    metadata: CareerSaveMetadata,
    continueResult: WebCareerContinueResult,
    matchdayState: WebMatchdayState,
    sessionStatus: CareerSessionStatus,
  ) => void;
  /** Publishes only volatile Matchday facts while the private engine session is live. */
  readonly receiveLiveMatchdayProgress: (matchdayState: WebMatchdayState) => void;
  /** Exposes a failed storage operation on the appropriate safe screen. */
  readonly failCareerStorage: (
    failure: WebCareerPersistenceFailure,
    scope: CareerStorageFailureScope,
  ) => void;
  /** Returns from career screens to the app entry screen. */
  readonly backToMenu: () => void;
  /** Opens the dashboard without mutating career facts. */
  readonly openDashboard: () => void;
  /** Opens the central Posta destination and selects a deterministic message. */
  readonly openInbox: () => void;
  /** Opens the selected club's senior-squad workspace. */
  readonly openSquad: () => void;
  /** Opens the persistent current-plan tactics workspace. */
  readonly openTactics: () => void;
  /** Changes the ephemeral Posta list filter. */
  readonly setInboxFilter: (filter: CareerPostaFilter) => void;
  /** Selects one real current-season message. */
  readonly selectInboxMessage: (messageId: string) => void;
  /** Opens the match-preparation workspace. */
  readonly openMatchPreparation: () => void;
  /** Restores the preparation draft from the current loaded career baseline. */
  readonly discardMatchPreparationDraft: () => void;
  /** Records the current draft after the live engine accepts it atomically. */
  readonly acceptPendingMatchdayTeamChanges: () => void;
  /** Restores only the last plan accepted during the current live match. */
  readonly discardPendingMatchdayTeamChanges: () => void;
  /** Handles action IDs coming from Inbox/Posta cards. */
  readonly handleInboxAction: (actionId: string) => void;
  /** Swaps one starter and one substitute in the pending Matchday team plan. */
  readonly substituteMatchdayPlayer: (outgoingPlayerId: string, incomingPlayerId: string) => void;
  /** Exchanges two XI assignments without counting as a substitution. */
  readonly exchangeMatchdayLineupSlots: (firstSlotKey: string, secondSlotKey: string) => void;
  /** Confirms one role and destination adaptation on the pending Matchday board. */
  readonly adaptMatchdayBoardSlot: (
    slotKey: string,
    role: TacticalBoardRoleCode,
    nx: number,
    ny: number,
  ) => void;
  /** Selects the formation for the current preparation draft. */
  readonly selectFormation: (formationId: CareerMatchPreparationFormationId) => void;
  /** Selects or clears one lineup player in the current preparation draft. */
  readonly selectLineupPlayer: (slotKey: string, playerId: string | undefined) => void;
  /** Selects or clears one substitute in the current preparation draft. */
  readonly selectBenchPlayer: (slotKey: string, playerId: string | undefined) => void;
  /** Selects or clears the tactic profile for the current preparation draft. */
  readonly selectTacticProfile: (tacticProfileId: string | undefined) => void;
  /** Applies an explicit manager-triggered lineup and bench helper action. */
  readonly applySelectionAction: (action: MatchPreparationSelectionAction) => void;
  /** Moves one tactical-board slot inside its role zone. */
  readonly moveBoardSlot: (slotKey: string, nx: number, ny: number) => void;
  /** Changes one tactical-board slot role from the context menu. */
  readonly changeBoardSlotRole: (slotKey: string, role: TacticalBoardRoleCode) => void;
  /** Clears one tactical-board slot assignment while preserving the slot. */
  readonly clearBoardSlot: (slotKey: string) => void;
}

/** Builds the data portion of the store for app startup and deterministic reset. */
function createInitialCareerUiState(): Pick<
  CareerUiStoreState,
  | "activeCareerState"
  | "availableSaves"
  | "careerSessionStatus"
  | "calendarAdvanceTransition"
  | "commandActivity"
  | "continueResult"
  | "matchPreparationState"
  | "matchdayTeamBaseline"
  | "matchdayState"
  | "inboxFilter"
  | "selectedInboxMessageId"
  | "preferences"
  | "screen"
  | "selectedSaveId"
  | "storageFailure"
  | "storageFailureScope"
  | "storageLifecycleStatus"
> {
  return {
    preferences: DEFAULT_WEB_PREFERENCES,
    storageLifecycleStatus: "storage_loading",
    availableSaves: [],
    selectedSaveId: undefined,
    activeCareerState: undefined,
    careerSessionStatus: undefined,
    calendarAdvanceTransition: undefined,
    commandActivity: undefined,
    storageFailure: undefined,
    storageFailureScope: undefined,
    screen: "app_entry",
    continueResult: undefined,
    matchPreparationState: undefined,
    matchdayTeamBaseline: undefined,
    matchdayState: undefined,
    inboxFilter: "all",
    selectedInboxMessageId: undefined,
  };
}

/**
 * Owns browser UI state for the current career prototype.
 *
 * This store is deliberately an adapter: it invokes existing web helper
 * functions but does not calculate match outcomes, dashboard readiness, or
 * player suitability rules.
 */
export const useCareerUiStore = create<CareerUiStoreState>((set, get) => ({
  ...createInitialCareerUiState(),
  setPreferences: (preferences) => {
    set({ preferences });
  },
  beginSaveDiscovery: () => {
    set({ storageLifecycleStatus: "storage_loading", storageFailure: undefined, storageFailureScope: undefined });
  },
  receiveAvailableSaves: (availableSaves) => {
    const currentSelection = get().selectedSaveId;
    const selectedSaveId = currentSelection !== undefined && availableSaves.some((entry) => entry.saveId === currentSelection)
      ? currentSelection
      : availableSaves[0]?.saveId;
    set({ availableSaves, selectedSaveId, storageLifecycleStatus: "ready", storageFailure: undefined, storageFailureScope: undefined });
  },
  selectSave: (selectedSaveId) => {
    if (get().availableSaves.some((entry) => entry.saveId === selectedSaveId)) set({ selectedSaveId });
  },
  beginCareerLoad: () => {
    set({ storageLifecycleStatus: "career_loading", storageFailure: undefined, storageFailureScope: undefined });
  },
  beginCareerCommand: (commandId, statusLabelKey) => {
    if (get().commandActivity?.status === "pending") return false;
    set({
      commandActivity: { commandId, status: "pending", statusLabelKey },
      calendarAdvanceTransition: undefined,
    });
    return true;
  },
  completeCareerCommand: (commandId) => {
    if (get().commandActivity?.commandId === commandId) set({ commandActivity: undefined });
  },
  failCareerCommand: (commandId, errorCode) => {
    const activity = get().commandActivity;
    if (activity?.commandId !== commandId) return;
    set({
      commandActivity: { ...activity, status: "failed", errorCode },
      calendarAdvanceTransition: undefined,
    });
  },
  beginCalendarAdvanceTransition: ({ startDateIso, stopDateIso, initialDateIso, elapsedDays }) => {
    if (get().commandActivity?.commandId !== "continue_career") return;
    set({
      calendarAdvanceTransition: {
        startDateIso,
        stopDateIso,
        visibleDateIso: initialDateIso,
        elapsedDays,
        status: "advancing",
      },
    });
  },
  showCalendarAdvanceDate: (visibleDateIso) => {
    const transition = get().calendarAdvanceTransition;
    if (transition?.status !== "advancing") return;
    set({ calendarAdvanceTransition: { ...transition, visibleDateIso } });
  },
  openPersistedCareer: (activeCareerState, metadata, continueResult) => {
    const availableSaves = [...get().availableSaves.filter((entry) => entry.saveId !== metadata.saveId), metadata]
      .sort((left, right) => left.saveId.localeCompare(right.saveId));
    const matchPreparationState = createMatchPreparationDraft(activeCareerState);
    set({
      activeCareerState,
      careerSessionStatus: createCleanCareerSessionStatus(activeCareerState, metadata),
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      calendarAdvanceTransition: undefined,
      screen: "career_dashboard",
      matchPreparationState,
      matchdayTeamBaseline: matchPreparationState,
      matchdayState: createWebMatchdayState(activeCareerState),
      selectedInboxMessageId: selectInboxFallback(activeCareerState, get().selectedInboxMessageId),
      continueResult,
    });
    if (shouldResumeMatchday(activeCareerState)) set({ screen: "matchday" });
  },
  receiveCareerSessionUpdate: (activeCareerState, metadata, continueResult, careerSessionStatus) => {
    const availableSaves = [...get().availableSaves.filter((entry) => entry.saveId !== metadata.saveId), metadata]
      .sort((left, right) => left.saveId.localeCompare(right.saveId));
    const calendarAdvanceTransition = get().calendarAdvanceTransition;
    const matchPreparationState = createMatchPreparationDraft(activeCareerState);
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState,
      matchdayTeamBaseline: matchPreparationState,
      matchdayState: createWebMatchdayState(activeCareerState),
      calendarAdvanceTransition: calendarAdvanceTransition === undefined
        ? undefined
        : {
            ...calendarAdvanceTransition,
            visibleDateIso: continueResult.stopDateIso,
            stopDateIso: continueResult.stopDateIso,
            status: "complete" as const,
          },
      selectedInboxMessageId: selectInboxFallback(
        activeCareerState,
        continueResult.stopReason === "no_attention"
          ? get().selectedInboxMessageId
          : continueResult.selectedMessageId ?? continueResult.inboxMessages[0]?.messageId,
      ),
      screen: continueResult.stopReason === "no_attention" ? "career_dashboard" : "career_inbox",
    });
  },
  receiveManualCareerSave: (activeCareerState, metadata, continueResult, careerSessionStatus) => {
    const availableSaves = [...get().availableSaves.filter((entry) => entry.saveId !== metadata.saveId), metadata]
      .sort((left, right) => left.saveId.localeCompare(right.saveId));
    const matchPreparationState = createMatchPreparationDraft(activeCareerState);
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState,
      matchdayTeamBaseline: matchPreparationState,
      matchdayState: createWebMatchdayState(activeCareerState),
      selectedInboxMessageId: selectInboxFallback(activeCareerState, get().selectedInboxMessageId),
    });
  },
  receiveInboxSessionUpdate: (
    activeCareerState,
    metadata,
    continueResult,
    careerSessionStatus,
    selectedMessageId,
  ) => {
    const availableSaves = [...get().availableSaves.filter((entry) => entry.saveId !== metadata.saveId), metadata]
      .sort((left, right) => left.saveId.localeCompare(right.saveId));
    const matchPreparationState = createMatchPreparationDraft(activeCareerState);
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState,
      matchdayTeamBaseline: matchPreparationState,
      matchdayState: createWebMatchdayState(activeCareerState),
      selectedInboxMessageId: selectInboxFallback(activeCareerState, selectedMessageId),
      screen: "career_inbox",
    });
  },
  receiveWorkingCareerUpdate: (activeCareerState, continueResult, careerSessionStatus) => {
    const current = get();
    const matchPreparationState = current.matchPreparationState === undefined
      ? createMatchPreparationDraft(activeCareerState)
      : reconcileMatchPreparationDraft(activeCareerState, current.matchPreparationState);
    set({
      activeCareerState,
      careerSessionStatus,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState,
      selectedInboxMessageId: selectInboxFallback(activeCareerState, current.selectedInboxMessageId),
    });
  },
  receiveMatchdaySessionUpdate: (
    activeCareerState,
    metadata,
    continueResult,
    matchdayState,
    careerSessionStatus,
  ) => {
    const current = get();
    const livePhase = matchdayState.liveProgress?.snapshot.phase;
    const preservePreparationDraft = livePhase === "first_half"
      || livePhase === "half_time"
      || livePhase === "second_half";
    const availableSaves = [...current.availableSaves.filter((entry) => entry.saveId !== metadata.saveId), metadata]
      .sort((left, right) => left.saveId.localeCompare(right.saveId));
    const matchPreparationState = preservePreparationDraft
      ? current.matchPreparationState ?? createMatchPreparationDraft(activeCareerState)
      : createMatchPreparationDraft(activeCareerState);
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState,
      matchdayTeamBaseline: matchPreparationState,
      matchdayState,
      screen: "matchday",
    });
  },
  receiveLiveMatchdayProgress: (matchdayState) => {
    set({ matchdayState });
  },
  failCareerStorage: (storageFailure, storageFailureScope) => {
    if (storageFailureScope === "current_career" && get().activeCareerState !== undefined) {
      set({ storageLifecycleStatus: "ready", storageFailure, storageFailureScope });
      return;
    }

    set({
      storageLifecycleStatus: "storage_error",
      storageFailure,
      storageFailureScope: "app_entry",
      activeCareerState: undefined,
      careerSessionStatus: undefined,
      screen: "app_entry",
    });
  },
  backToMenu: () => {
    set({ screen: "app_entry", calendarAdvanceTransition: undefined });
  },
  openDashboard: () => {
    set({ screen: "career_dashboard" });
  },
  openInbox: () => {
    set((state) => ({
      screen: "career_inbox",
      selectedInboxMessageId: state.activeCareerState === undefined
        ? undefined
        : selectInboxFallback(state.activeCareerState, state.selectedInboxMessageId),
    }));
  },
  openSquad: () => {
    set({ screen: "career_squad" });
  },
  openTactics: () => {
    set({ screen: "career_tactics" });
  },
  setInboxFilter: (inboxFilter) => {
    set({ inboxFilter });
  },
  selectInboxMessage: (selectedInboxMessageId) => {
    const career = get().activeCareerState;
    if (career?.currentSeasonInbox?.some((message) => String(message.id) === selectedInboxMessageId) === true) {
      set({ selectedInboxMessageId });
    }
  },
  openMatchPreparation: () => {
    set({ screen: "match_preparation" });
  },
  discardMatchPreparationDraft: () => {
    const career = get().activeCareerState;
    if (career !== undefined) set({ matchPreparationState: createMatchPreparationDraft(career) });
  },
  acceptPendingMatchdayTeamChanges: () => {
    const current = get();
    const acceptedTeam = current.matchdayState?.liveProgress?.selectedTeam;
    if (current.matchPreparationState === undefined || acceptedTeam === undefined) return;
    const acceptedDraft = acceptLiveTeamPlan(current.matchPreparationState, acceptedTeam);
    set({
      matchPreparationState: acceptedDraft,
      matchdayTeamBaseline: acceptedDraft,
    });
  },
  discardPendingMatchdayTeamChanges: () => {
    const matchdayTeamBaseline = get().matchdayTeamBaseline;
    if (matchdayTeamBaseline !== undefined) set({ matchPreparationState: matchdayTeamBaseline });
  },
  handleInboxAction: (actionId) => {
    if (actionId === "open_inbox") {
      get().openInbox();
      return;
    }

    if (actionId === "open_dashboard") {
      set({ screen: "career_dashboard" });
      return;
    }

    if (actionId === "prepare_match") {
      set({ screen: "match_preparation" });
    }

  },
  substituteMatchdayPlayer: (outgoingPlayerId, incomingPlayerId) => {
    set((state) => {
      if (state.matchPreparationState === undefined || state.matchdayState === undefined) return state;
      return {
        matchPreparationState: substituteMatchPreparationPlayer(
          state.matchPreparationState,
          outgoingPlayerId,
          incomingPlayerId,
        ),
      };
    });
  },
  exchangeMatchdayLineupSlots: (firstSlotKey, secondSlotKey) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : {
          matchPreparationState: exchangeMatchPreparationBoardPlayers(
            state.matchPreparationState,
            firstSlotKey,
            secondSlotKey,
          ),
        });
  },
  adaptMatchdayBoardSlot: (slotKey, role, nx, ny) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : {
          matchPreparationState: adaptMatchPreparationBoardSlot(
            state.matchPreparationState,
            slotKey,
            role,
            nx,
            ny,
          ),
        });
  },
  selectFormation: (formationId) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          selectMatchPreparationFormation(state.matchPreparationState, formationId),
        ) });
  },
  selectLineupPlayer: (slotKey, playerId) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          selectMatchPreparationPlayer(state.matchPreparationState, slotKey, playerId),
        ) });
  },
  selectBenchPlayer: (slotKey, playerId) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          selectMatchPreparationBenchPlayer(state.matchPreparationState, slotKey, playerId),
        ) });
  },
  selectTacticProfile: (tacticProfileId) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          selectMatchPreparationTactic(state.matchPreparationState, tacticProfileId),
        ) });
  },
  applySelectionAction: (action) => {
    set((state) => state.matchPreparationState === undefined || state.activeCareerState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          applyMatchPreparationSelectionAction(state.activeCareerState, state.matchPreparationState, action),
        ) });
  },
  moveBoardSlot: (slotKey, nx, ny) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          moveMatchPreparationBoardSlot(state.matchPreparationState, slotKey, nx, ny),
        ) });
  },
  changeBoardSlotRole: (slotKey, role) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          changeMatchPreparationBoardSlotRole(state.matchPreparationState, slotKey, role),
        ) });
  },
  clearBoardSlot: (slotKey) => {
    set((state) => state.matchPreparationState === undefined
      ? state
      : { matchPreparationState: reconcileDraftForCareer(
          state,
          clearMatchPreparationBoardSlot(state.matchPreparationState, slotKey),
        ) });
  },
}));

/** Restores the store to its startup data while keeping action functions stable. */
export function resetCareerUiStore(): void {
  useCareerUiStore.setState(createInitialCareerUiState());
}

/**
 * Reports whether the manager has changed the live team plan since the engine
 * last accepted it. Reference comparison is sufficient because every draft
 * command produces a new immutable draft and acceptance stores that instance.
 */
export function selectHasPendingMatchdayTeamChanges(
  state: Pick<CareerUiStoreState, "matchPreparationState" | "matchdayTeamBaseline">,
): boolean {
  return state.matchPreparationState !== undefined
    && state.matchdayTeamBaseline !== undefined
    && state.matchPreparationState !== state.matchdayTeamBaseline;
}

/** Reconciles edits with the loaded baseline so an exact undo becomes clean. */
function reconcileDraftForCareer(
  state: Pick<CareerUiStoreState, "activeCareerState">,
  draft: MatchPreparationDraft,
): MatchPreparationDraft {
  return state.activeCareerState === undefined
    ? draft
    : reconcileMatchPreparationDraft(state.activeCareerState, draft);
}

/** Reopens only a completed fixture whose full-time review still awaits acknowledgement. */
function shouldResumeMatchday(careerState: StoredCareerState): boolean {
  const targetFixtureId = careerState.matchPreparation?.targetFixtureId;
  return targetFixtureId !== undefined
    && careerState.gameState.fixtures[targetFixtureId]?.result?.report !== undefined;
}

/** Keeps a valid Posta selection or chooses the highest-level deterministic fallback. */
function selectInboxFallback(
  careerState: StoredCareerState,
  preferredMessageId: string | undefined,
): string | undefined {
  const messages = careerState.currentSeasonInbox ?? [];
  if (preferredMessageId !== undefined && messages.some((message) => String(message.id) === preferredMessageId)) {
    return preferredMessageId;
  }

  const levelRank = { blocking: 0, important: 1, informational: 2 } as const;
  return [...messages]
    .sort((left, right) => {
      const levelDelta = levelRank[left.level] - levelRank[right.level];
      if (levelDelta !== 0) return levelDelta;
      if (left.date !== right.date) return right.date - left.date;
      return String(left.id).localeCompare(String(right.id));
    })[0]?.id;
}
