import { create } from "zustand";
import type { CareerMatchPreparationFormationId } from "@game/ui";

import {
  DEFAULT_WEB_PREFERENCES,
  type WebPreferences,
} from "../app/preferences";
import { continueDemoCareer, type DemoCareerContinueResult } from "../features/dashboard/continue-demo-career";
import {
  applyDemoMatchPreparationSelectionAction,
  changeDemoMatchPreparationBoardSlotRole,
  clearDemoMatchPreparationBoardSlot,
  createInitialDemoMatchPreparationState,
  type DemoMatchPreparationSelectionAction,
  type DemoMatchPreparationState,
  moveDemoMatchPreparationBoardSlot,
  saveDemoMatchPreparation,
  selectDemoMatchPreparationBenchPlayer,
  selectDemoMatchPreparationFormation,
  selectDemoMatchPreparationPlayer,
  selectDemoMatchPreparationTactic,
} from "../features/match-preparation/match-preparation-demo";
import {
  applyDemoHalfTimeSubstitutions,
  createInitialDemoMatchdayState,
  playDemoMatchdayFirstHalf,
  playDemoMatchdayFixture,
  playDemoMatchdaySecondHalf,
  type DemoHalfTimeSubstitutionDecision,
  type DemoMatchdayState,
} from "../features/matchday/matchday-demo";
import type { TacticalBoardRoleCode } from "../features/tactics-board/tactical-board-types";

/** Current top-level screen in the in-memory web career prototype. */
export type CareerUiScreen = "app_entry" | "career_dashboard" | "match_preparation" | "matchday";

/** Browser-owned career UI state that must not duplicate engine rules. */
export interface CareerUiStoreState {
  /** Current language and currency preferences for visible browser labels. */
  readonly preferences: WebPreferences;
  /** Whether the deterministic demo career can be continued from the main menu. */
  readonly hasDemoCareer: boolean;
  /** Current top-level screen selected by manager actions. */
  readonly screen: CareerUiScreen;
  /** Last Continue result shown in dashboard and preparation screens. */
  readonly continueResult: DemoCareerContinueResult | undefined;
  /** Current unsaved or saved match-preparation draft. */
  readonly matchPreparationState: DemoMatchPreparationState;
  /** Engine-backed in-memory matchday adapter state for the current demo career. */
  readonly matchdayState: DemoMatchdayState;
  /** Replaces bounded web preferences from the settings controls. */
  readonly setPreferences: (preferences: WebPreferences) => void;
  /** Starts a fresh deterministic demo career and opens the dashboard. */
  readonly startNewCareer: () => void;
  /** Opens the existing deterministic demo career when one is available. */
  readonly continueExistingCareer: () => void;
  /** Returns from career screens to the app entry screen. */
  readonly backToMenu: () => void;
  /** Opens the dashboard without mutating career facts. */
  readonly openDashboard: () => void;
  /** Finishes matchday presentation and returns to a dashboard without stale attention text. */
  readonly finishMatchdayAndOpenDashboard: () => void;
  /** Opens the matchday centre without mutating career facts. */
  readonly openMatchday: () => void;
  /** Opens the match-preparation workspace. */
  readonly openMatchPreparation: () => void;
  /** Handles action IDs coming from Inbox/Posta cards. */
  readonly handleInboxAction: (actionId: string) => void;
  /** Runs the current Continue prototype against the current preparation draft. */
  readonly continueCareer: () => void;
  /** Plays the prepared selected-club fixture through the engine-backed web adapter. */
  readonly playMatchdayFixture: () => void;
  /** Progresses matchday to a real half-time stop. */
  readonly playMatchdayFirstHalf: () => void;
  /** Applies manager-declared half-time substitutions. */
  readonly applyHalfTimeSubstitutions: (decisions: readonly DemoHalfTimeSubstitutionDecision[]) => void;
  /** Progresses matchday from half-time to full time. */
  readonly playMatchdaySecondHalf: () => void;
  /** Selects the formation for the current preparation draft. */
  readonly selectFormation: (formationId: CareerMatchPreparationFormationId) => void;
  /** Selects or clears one lineup player in the current preparation draft. */
  readonly selectLineupPlayer: (slotKey: string, playerId: string | undefined) => void;
  /** Selects or clears one substitute in the current preparation draft. */
  readonly selectBenchPlayer: (slotKey: string, playerId: string | undefined) => void;
  /** Selects or clears the tactic profile for the current preparation draft. */
  readonly selectTacticProfile: (tacticProfileId: string | undefined) => void;
  /** Applies an explicit manager-triggered lineup and bench helper action. */
  readonly applySelectionAction: (action: DemoMatchPreparationSelectionAction) => void;
  /** Moves one tactical-board slot inside its role zone. */
  readonly moveBoardSlot: (slotKey: string, nx: number, ny: number) => void;
  /** Changes one tactical-board slot role from the context menu. */
  readonly changeBoardSlotRole: (slotKey: string, role: TacticalBoardRoleCode) => void;
  /** Clears one tactical-board slot assignment while preserving the slot. */
  readonly clearBoardSlot: (slotKey: string) => void;
  /** Saves the current preparation draft only when the read model allows it. */
  readonly savePreparation: () => void;
  /** Saves a complete preparation draft and opens the explicit pre-match state. */
  readonly savePreparationAndOpenMatchday: () => void;
}

/** Builds the data portion of the store for app startup and deterministic reset. */
function createInitialCareerUiState(): Pick<
  CareerUiStoreState,
  "continueResult" | "hasDemoCareer" | "matchPreparationState" | "matchdayState" | "preferences" | "screen"
> {
  return {
    preferences: DEFAULT_WEB_PREFERENCES,
    hasDemoCareer: false,
    screen: "app_entry",
    continueResult: undefined,
    matchPreparationState: createInitialDemoMatchPreparationState(),
    matchdayState: createInitialDemoMatchdayState(),
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
  startNewCareer: () => {
    set({
      hasDemoCareer: true,
      screen: "career_dashboard",
      matchPreparationState: createInitialDemoMatchPreparationState(),
      matchdayState: createInitialDemoMatchdayState(),
      continueResult: undefined,
    });
  },
  continueExistingCareer: () => {
    if (get().hasDemoCareer) {
      set({ screen: "career_dashboard" });
    }
  },
  backToMenu: () => {
    set({ screen: "app_entry" });
  },
  openDashboard: () => {
    set({ screen: "career_dashboard" });
  },
  finishMatchdayAndOpenDashboard: () => {
    set({ screen: "career_dashboard", continueResult: undefined });
  },
  openMatchday: () => {
    set({ screen: "matchday" });
  },
  openMatchPreparation: () => {
    set({ screen: "match_preparation" });
  },
  handleInboxAction: (actionId) => {
    if (actionId === "prepare_match") {
      set({ screen: "match_preparation" });
    }

    if (actionId === "open_matchday") {
      set({ screen: "matchday" });
    }
  },
  continueCareer: () => {
    const state = get();
    const continueResult = continueDemoCareer(state.matchPreparationState, state.matchdayState);

    set({
      continueResult,
      ...(continueResult.stopReason === "matchday_reached" ? { screen: "matchday" as const } : {}),
    });
  },
  playMatchdayFixture: () => {
    set((state) => {
      const matchdayState = playDemoMatchdayFixture(state.matchdayState, state.matchPreparationState);

      return {
        matchdayState,
        continueResult:
          matchdayState.lastPlayAttempt.status === "advanced"
            ? continueDemoCareer(state.matchPreparationState, matchdayState)
            : state.continueResult,
      };
    });
  },
  playMatchdayFirstHalf: () => {
    set((state) => ({
      matchdayState: playDemoMatchdayFirstHalf(state.matchdayState, state.matchPreparationState),
    }));
  },
  applyHalfTimeSubstitutions: (decisions) => {
    set((state) => ({
      matchdayState: applyDemoHalfTimeSubstitutions(state.matchdayState, decisions),
    }));
  },
  playMatchdaySecondHalf: () => {
    set((state) => {
      const matchdayState = playDemoMatchdaySecondHalf(state.matchdayState, state.matchPreparationState);

      return {
        matchdayState,
        continueResult:
          matchdayState.lastStagedAttempt.status === "full_time"
            ? continueDemoCareer(state.matchPreparationState, matchdayState)
            : state.continueResult,
      };
    });
  },
  selectFormation: (formationId) => {
    set((state) => ({
      matchPreparationState: selectDemoMatchPreparationFormation(state.matchPreparationState, formationId),
    }));
  },
  selectLineupPlayer: (slotKey, playerId) => {
    set((state) => ({
      matchPreparationState: selectDemoMatchPreparationPlayer(state.matchPreparationState, slotKey, playerId),
    }));
  },
  selectBenchPlayer: (slotKey, playerId) => {
    set((state) => ({
      matchPreparationState: selectDemoMatchPreparationBenchPlayer(state.matchPreparationState, slotKey, playerId),
    }));
  },
  selectTacticProfile: (tacticProfileId) => {
    set((state) => ({
      matchPreparationState: selectDemoMatchPreparationTactic(state.matchPreparationState, tacticProfileId),
    }));
  },
  applySelectionAction: (action) => {
    set((state) => ({
      matchPreparationState: applyDemoMatchPreparationSelectionAction(state.matchPreparationState, action),
    }));
  },
  moveBoardSlot: (slotKey, nx, ny) => {
    set((state) => ({
      matchPreparationState: moveDemoMatchPreparationBoardSlot(state.matchPreparationState, slotKey, nx, ny),
    }));
  },
  changeBoardSlotRole: (slotKey, role) => {
    set((state) => ({
      matchPreparationState: changeDemoMatchPreparationBoardSlotRole(state.matchPreparationState, slotKey, role),
    }));
  },
  clearBoardSlot: (slotKey) => {
    set((state) => ({
      matchPreparationState: clearDemoMatchPreparationBoardSlot(state.matchPreparationState, slotKey),
    }));
  },
  savePreparation: () => {
    const result = saveDemoMatchPreparation(get().matchPreparationState);

    set({
      matchPreparationState: result.state,
      ...(result.state.isSaved ? { continueResult: undefined } : {}),
    });
  },
  savePreparationAndOpenMatchday: () => {
    const result = saveDemoMatchPreparation(get().matchPreparationState);

    set({
      matchPreparationState: result.state,
      ...(result.state.isSaved ? { continueResult: undefined, screen: "matchday" as const } : {}),
    });
  },
}));

/** Restores the store to its startup data while keeping action functions stable. */
export function resetCareerUiStore(): void {
  useCareerUiStore.setState(createInitialCareerUiState());
}
