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
    expect(getStoreState().matchdayState.lastPlayAttempt.status).toBe("idle");
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

  it("routes Inbox/Posta open-matchday actions to matchday state", () => {
    getStoreState().startNewCareer();
    getStoreState().handleInboxAction("open_matchday");

    expect(getStoreState().screen).toBe("matchday");
  });

  it("opens matchday directly from dashboard actions", () => {
    getStoreState().startNewCareer();
    getStoreState().openMatchday();

    expect(getStoreState().screen).toBe("matchday");
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
    expect(getStoreState().screen).toBe("matchday");
  });

  it("saves a complete draft and opens pre-match directly", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparationAndOpenMatchday();

    expect(getStoreState().matchPreparationState.isSaved).toBe(true);
    expect(getStoreState().continueResult).toBeUndefined();
    expect(getStoreState().screen).toBe("matchday");
    expect(getStoreState().matchdayState.lastStagedAttempt.status).toBe("idle");
  });

  it("does not open pre-match from incomplete preparation", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createInitialDemoMatchPreparationState(),
    });

    getStoreState().savePreparationAndOpenMatchday();

    expect(getStoreState().matchPreparationState.isSaved).toBe(false);
    expect(getStoreState().screen).toBe("match_preparation");
  });

  it("blocks matchday play when the current preparation is incomplete", () => {
    getStoreState().startNewCareer();
    getStoreState().playMatchdayFixture();

    expect(getStoreState().matchdayState.lastPlayAttempt.status).toBe("blocked");
    expect(getStoreState().matchdayState.lastPlayAttempt.blockerKeys).toContain("missing_saved_lineup");
    expect(getStoreState().matchdayState.playedResult).toBeUndefined();
  });

  it("plays a complete saved matchday once and stores updated career facts", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparation();
    getStoreState().playMatchdayFixture();

    const playedState = getStoreState().matchdayState;
    expect(playedState.lastPlayAttempt.status).toBe("advanced");
    expect(playedState.playedResult?.fixtureId).toBe("fixture:000003");
    expect(playedState.playedResult?.fixtureAfter.result?.played).toBe(true);
    expect(playedState.careerState.matchPreparation?.targetFixtureId).not.toBe("fixture:000003");
    expect(getStoreState().continueResult?.stopReason).toBe("no_attention");

    getStoreState().playMatchdayFixture();

    expect(getStoreState().matchdayState.lastPlayAttempt.status).toBe("already_played");
    expect(getStoreState().matchdayState.careerState).toBe(playedState.careerState);
  });

  it("routes the prepared continue loop to matchday and clears stale attention after play", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparation();
    getStoreState().continueCareer();

    const firstInboxMessage = getStoreState().continueResult?.inboxMessages[0];
    const firstInboxAction = firstInboxMessage?.actions?.[0];

    expect(getStoreState().continueResult?.stopReason).toBe("matchday_reached");
    expect(firstInboxAction?.actionId).toBe("open_matchday");
    expect(getStoreState().screen).toBe("matchday");

    getStoreState().openDashboard();
    getStoreState().handleInboxAction("open_matchday");
    expect(getStoreState().screen).toBe("matchday");

    getStoreState().playMatchdayFixture();
    expect(getStoreState().continueResult?.stopReason).toBe("no_attention");
    expect(getStoreState().continueResult?.inboxMessages).toEqual([]);

    getStoreState().openDashboard();
    expect(getStoreState().screen).toBe("career_dashboard");
  });

  it("drives staged matchday from first half to half-time tactical decisions to full time", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparation();
    getStoreState().playMatchdayFirstHalf();

    expect(getStoreState().matchdayState.lastStagedAttempt.status).toBe("at_half_time");
    expect(getStoreState().matchdayState.stagedProgress?.snapshot.phase).toBe("half_time");
    expect(getStoreState().matchdayState.playedResult).toBeUndefined();

    const outgoingPlayerId = getStoreState().matchdayState.stagedProgress?.state.simulation.context.away.lineup[1]?.playerId;
    const incomingPlayerId = getStoreState().matchdayState.stagedProgress?.selectedBenchPlayerIds[0];

    if (outgoingPlayerId === undefined || incomingPlayerId === undefined) {
      throw new Error("Expected selected-club away lineup and bench for staged store test");
    }

    const outgoingSlot = getStoreState().matchPreparationState.tacticalBoardDraft.slots.find((slot) => slot.playerId === outgoingPlayerId);
    const incomingBenchSlot = Object.entries(getStoreState().matchPreparationState.selectedBenchPlayerIdsBySlot)
      .find(([, playerId]) => playerId === incomingPlayerId)?.[0];

    if (outgoingSlot === undefined || incomingBenchSlot === undefined) {
      throw new Error("Expected current preparation slot and bench slot for staged tactical store test");
    }

    getStoreState().selectLineupPlayer(outgoingSlot.slotId, incomingPlayerId);
    getStoreState().selectBenchPlayer(incomingBenchSlot, outgoingPlayerId);

    getStoreState().playMatchdaySecondHalf();

    expect(getStoreState().matchdayState.lastStagedAttempt.status).toBe("full_time");
    expect(getStoreState().matchdayState.stagedProgress?.snapshot.phase).toBe("full_time");
    expect(getStoreState().matchdayState.stagedProgress?.state.halfTimeTacticalPlan?.substitutions).toHaveLength(1);
    expect(getStoreState().matchdayState.playedResult?.fixtureAfter.result?.played).toBe(true);
    expect(getStoreState().continueResult?.stopReason).toBe("no_attention");
  });

  it("returns from full time to a clean dashboard", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparationAndOpenMatchday();
    getStoreState().playMatchdayFirstHalf();
    getStoreState().playMatchdaySecondHalf();

    expect(getStoreState().continueResult?.stopReason).toBe("no_attention");

    getStoreState().finishMatchdayAndOpenDashboard();

    expect(getStoreState().screen).toBe("career_dashboard");
    expect(getStoreState().continueResult).toBeUndefined();
  });

  it("does not create hidden substitutions when the manager declares none", () => {
    useCareerUiStore.setState({
      hasDemoCareer: true,
      screen: "match_preparation",
      matchPreparationState: createCompleteUnsavedDemoMatchPreparationState(),
    });

    getStoreState().savePreparation();
    getStoreState().playMatchdayFirstHalf();
    getStoreState().applyHalfTimeSubstitutions([]);

    expect(getStoreState().matchdayState.lastStagedAttempt.status).toBe("substitutions_applied");
    expect(getStoreState().matchdayState.stagedProgress?.snapshot.appliedSubstitutions).toEqual([]);
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
