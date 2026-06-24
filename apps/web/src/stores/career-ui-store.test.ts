import { describe, expect, it, beforeEach } from "vitest";

import { DEFAULT_WEB_PREFERENCES } from "../app/preferences";
import {
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
} from "../features/match-preparation/match-preparation-demo";
import { resetCareerUiStore, useCareerUiStore } from "./career-ui-store";

/** Reads the current Zustand store snapshot for concise deterministic tests. */
function getStoreState(): ReturnType<typeof useCareerUiStore.getState> {
  return useCareerUiStore.getState();
}

describe("career UI store", () => {
  beforeEach(() => {
    resetCareerUiStore();
  });

  it("starts at the app entry with default preferences and no demo career", () => {
    expect(getStoreState().preferences).toEqual(DEFAULT_WEB_PREFERENCES);
    expect(getStoreState().hasDemoCareer).toBe(false);
    expect(getStoreState().screen).toBe("app_entry");
    expect(getStoreState().matchPreparationState).toEqual(createInitialDemoMatchPreparationState());
  });

  it("starts a fresh demo career from the main menu", () => {
    getStoreState().startNewCareer();

    expect(getStoreState().hasDemoCareer).toBe(true);
    expect(getStoreState().screen).toBe("career_dashboard");
    expect(getStoreState().continueResult).toBeUndefined();
    expect(getStoreState().matchPreparationState.isSaved).toBe(false);
  });

  it("does not continue a missing demo career", () => {
    getStoreState().continueExistingCareer();

    expect(getStoreState().screen).toBe("app_entry");
  });

  it("routes Inbox/Posta prepare-match actions to match preparation", () => {
    getStoreState().startNewCareer();
    getStoreState().handleInboxAction("prepare_match");

    expect(getStoreState().screen).toBe("match_preparation");
  });

  it("stops Continue at match preparation when the draft is unsaved", () => {
    getStoreState().startNewCareer();
    getStoreState().continueCareer();

    expect(getStoreState().continueResult?.stopReason).toBe("match_preparation_required");
    expect(getStoreState().continueResult?.daysAdvanced).toBe(0);
  });

  it("saves a complete draft and lets Continue reach matchday", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparation();
    getStoreState().continueCareer();

    expect(getStoreState().matchPreparationState.isSaved).toBe(true);
    expect(getStoreState().continueResult?.stopReason).toBe("matchday_reached");
  });

  it("keeps the tactical-board draft in the current preparation state", () => {
    getStoreState().startNewCareer();
    getStoreState().selectLineupPlayer("gk", "player:demo-01");
    getStoreState().selectFormation("4-2-3-1");

    expect(getStoreState().matchPreparationState.tacticalBoardDraft.baseFormationId).toBe("4-2-3-1");
    expect(getStoreState().matchPreparationState.tacticalBoardDraft.slots).toHaveLength(11);
    expect(getStoreState().matchPreparationState.selectedPlayerIdsBySlot).toEqual({
      gk: "player:demo-01",
    });
  });

  it("updates tactical-board position, role, and assignment through store actions", () => {
    getStoreState().startNewCareer();
    getStoreState().selectLineupPlayer("rm", "player:demo-08");
    getStoreState().moveBoardSlot("rm", 0.95, 0.2);
    getStoreState().changeBoardSlotRole("rm", "AD");

    const changedSlot = getStoreState().matchPreparationState.tacticalBoardDraft.slots.find((slot) => slot.slotId === "rm");

    expect(changedSlot).toMatchObject({
      role: "AD",
      canonicalRole: "right_winger",
      playerId: "player:demo-08",
    });

    getStoreState().clearBoardSlot("rm");

    expect(getStoreState().matchPreparationState.selectedPlayerIdsBySlot.rm).toBeUndefined();
    expect(getStoreState().matchPreparationState.tacticalBoardDraft.slots.find((slot) => slot.slotId === "rm")?.playerId).toBeNull();
  });
});
