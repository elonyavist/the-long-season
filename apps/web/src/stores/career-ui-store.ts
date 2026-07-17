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
  applyMatchPreparationSelectionAction,
  changeMatchPreparationBoardSlotRole,
  clearMatchPreparationBoardSlot,
  createMatchPreparationDraft,
  moveMatchPreparationBoardSlot,
  reconcileMatchPreparationDraft,
  selectMatchPreparationBenchPlayer,
  selectMatchPreparationFormation,
  selectMatchPreparationPlayer,
  selectMatchPreparationTactic,
  type MatchPreparationDraft,
  type MatchPreparationSelectionAction,
} from "../features/match-preparation/match-preparation-adapter";
import {
  applyWebHalfTimeSubstitutions,
  createWebMatchdayState,
  type WebHalfTimeSubstitutionDecision,
  type WebMatchdayState,
} from "../features/matchday/matchday-adapter";
import type { TacticalBoardRoleCode } from "../features/tactics-board/tactical-board-types";
import {
  createCleanCareerSessionStatus,
  type CareerSessionStatus,
} from "../runtime/career-session";

/** Current top-level screen in the in-memory web career prototype. */
export type CareerUiScreen = "app_entry" | "career_dashboard" | "career_inbox" | "match_preparation" | "matchday";

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
  | "manual_save"
  | "update_autosave_policy"
  | "confirm_preparation"
  | "play_first_half"
  | "play_second_half"
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
  /** Publishes one in-memory staged-match update. */
  readonly receiveMatchdaySessionUpdate: (
    state: StoredCareerState,
    metadata: CareerSaveMetadata,
    continueResult: WebCareerContinueResult,
    matchdayState: WebMatchdayState,
    sessionStatus: CareerSessionStatus,
  ) => void;
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
  /** Changes the ephemeral Posta list filter. */
  readonly setInboxFilter: (filter: CareerPostaFilter) => void;
  /** Selects one real current-season message. */
  readonly selectInboxMessage: (messageId: string) => void;
  /** Opens the match-preparation workspace. */
  readonly openMatchPreparation: () => void;
  /** Restores the preparation draft from the current loaded career baseline. */
  readonly discardMatchPreparationDraft: () => void;
  /** Handles action IDs coming from Inbox/Posta cards. */
  readonly handleInboxAction: (actionId: string) => void;
  /** Applies manager-declared half-time substitutions. */
  readonly applyHalfTimeSubstitutions: (decisions: readonly WebHalfTimeSubstitutionDecision[]) => void;
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
      matchPreparationState: createMatchPreparationDraft(activeCareerState),
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
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState: createMatchPreparationDraft(activeCareerState),
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
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState: createMatchPreparationDraft(activeCareerState),
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
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState: createMatchPreparationDraft(activeCareerState),
      matchdayState: createWebMatchdayState(activeCareerState),
      selectedInboxMessageId: selectInboxFallback(activeCareerState, selectedMessageId),
      screen: "career_inbox",
    });
  },
  receiveMatchdaySessionUpdate: (
    activeCareerState,
    metadata,
    continueResult,
    matchdayState,
    careerSessionStatus,
  ) => {
    const availableSaves = [...get().availableSaves.filter((entry) => entry.saveId !== metadata.saveId), metadata]
      .sort((left, right) => left.saveId.localeCompare(right.saveId));
    set({
      activeCareerState,
      careerSessionStatus,
      availableSaves,
      selectedSaveId: metadata.saveId,
      storageLifecycleStatus: "ready",
      storageFailure: undefined,
      storageFailureScope: undefined,
      continueResult,
      matchPreparationState: createMatchPreparationDraft(activeCareerState),
      matchdayState,
      screen: "matchday",
    });
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
  applyHalfTimeSubstitutions: (decisions) => {
    set((state) => {
      if (state.matchPreparationState === undefined || state.matchdayState === undefined) return state;
      let draft = state.matchPreparationState;
      for (const decision of decisions) draft = applySubstitutionToDraft(draft, decision);
      return {
        matchPreparationState: draft,
        matchdayState: applyWebHalfTimeSubstitutions(state.matchdayState, decisions),
      };
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

/** Reconciles edits with the loaded baseline so an exact undo becomes clean. */
function reconcileDraftForCareer(
  state: Pick<CareerUiStoreState, "activeCareerState">,
  draft: MatchPreparationDraft,
): MatchPreparationDraft {
  return state.activeCareerState === undefined
    ? draft
    : reconcileMatchPreparationDraft(state.activeCareerState, draft);
}

/** Mirrors one explicit substitution in the shared XI/bench preparation draft. */
function applySubstitutionToDraft(
  draft: MatchPreparationDraft,
  decision: WebHalfTimeSubstitutionDecision,
): MatchPreparationDraft {
  const lineupSlot = draft.tacticalBoardDraft.slots.find((slot) => slot.playerId === decision.outgoingPlayerId);
  const benchSlot = Object.entries(draft.selectedBenchPlayerIdsBySlot)
    .find(([, playerId]) => playerId === decision.incomingPlayerId)?.[0];
  if (lineupSlot === undefined || benchSlot === undefined) return draft;
  const withIncomingPlayer = selectMatchPreparationPlayer(draft, lineupSlot.slotId, decision.incomingPlayerId);
  return selectMatchPreparationBenchPlayer(withIncomingPlayer, benchSlot, decision.outgoingPlayerId);
}

/** Opens only a durable in-progress match or an unacknowledged full-time review. */
function shouldResumeMatchday(careerState: StoredCareerState): boolean {
  if (careerState.activeMatchCheckpoint !== undefined) return true;
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
