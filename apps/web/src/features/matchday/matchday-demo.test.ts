import { describe, expect, it } from "vitest";

import {
  clearDemoMatchPreparationBoardSlot,
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
  saveDemoMatchPreparation,
} from "../match-preparation/match-preparation-demo";
import {
  applyDemoHalfTimeSubstitutions,
  buildDemoHalfTimeSubstitutionPanel,
  buildDemoMatchdayPhaseView,
  buildDemoMatchdayView,
  createInitialDemoMatchdayState,
  playDemoMatchdayFirstHalf,
  playDemoMatchdayFixture,
  playDemoMatchdaySecondHalf,
} from "./matchday-demo";

describe("web demo matchday adapter", () => {
  it("blocks match play when preparation has not been saved", () => {
    const state = createInitialDemoMatchdayState();
    const result = playDemoMatchdayFixture(state, createInitialDemoMatchPreparationState());

    expect(result.lastPlayAttempt.status).toBe("blocked");
    expect(result.lastPlayAttempt.blockerKeys).toEqual([
      "missing_saved_lineup",
      "missing_saved_bench",
      "missing_saved_tactic",
    ]);
    expect(result.playedResult).toBeUndefined();
  });

  it("builds a ready matchday view for complete saved preparation", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const view = buildDemoMatchdayView(createInitialDemoMatchdayState(), savedPreparation);

    expect(savedPreparation.isSaved).toBe(true);
    expect(view.status).toBe("ready_to_play");
    expect(view.actions.find((action) => action.actionId === "play_fixture")?.status).toBe("available");
  });

  it("plays the selected fixture through the engine and stores structured result facts", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const result = playDemoMatchdayFixture(createInitialDemoMatchdayState(), savedPreparation);

    expect(result.lastPlayAttempt.status).toBe("advanced");
    expect(result.playedResult?.fixtureId).toBe("fixture:000003");
    expect(result.playedResult?.fixtureAfter.result?.played).toBe(true);
    expect(result.playedResult?.report.fixtureId).toBe("fixture:000003");
    expect(result.playedResult?.conditionChanges.length).toBeGreaterThan(0);
    expect(result.playedResult?.fixtureAfter.result?.played).toBe(true);

    const view = buildDemoMatchdayView(result, savedPreparation);
    expect(view.status).toBe("played");
    expect(view.score.status).toBe("available");
    expect(view.playerStats.length).toBeGreaterThan(0);
  });

  it("does not double-apply the same played fixture", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const played = playDemoMatchdayFixture(createInitialDemoMatchdayState(), savedPreparation);
    const replayAttempt = playDemoMatchdayFixture(played, savedPreparation);

    expect(replayAttempt.lastPlayAttempt.status).toBe("already_played");
    expect(replayAttempt.lastPlayAttempt.fixtureId).toBe("fixture:000003");
    expect(replayAttempt.playedResult).toBe(played.playedResult);
    expect(replayAttempt.careerState).toBe(played.careerState);
  });

  it("progresses to half-time without secretly creating a full-time result", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTime = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);

    expect(halfTime.lastStagedAttempt.status).toBe("at_half_time");
    expect(halfTime.stagedProgress?.snapshot.phase).toBe("half_time");
    expect(halfTime.stagedProgress?.snapshot.currentMinute).toBe(45);
    expect(halfTime.stagedProgress?.snapshot.fullTimeReport).toBeUndefined();
    expect(halfTime.playedResult).toBeUndefined();

    const phaseView = buildDemoMatchdayPhaseView(halfTime);
    expect(phaseView.status).toBe("decision");
    expect(phaseView.actions.map((action) => action.actionId)).toEqual(["start_second_half"]);

    const panel = buildDemoHalfTimeSubstitutionPanel(halfTime);
    expect(panel.status).toBe("available");
    expect(panel.lineup).toHaveLength(11);
    expect(panel.bench.length).toBeGreaterThan(0);
    expect(panel.appliedCount).toBe(0);
  });

  it("passes declared half-time substitutions through the staged adapter", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTime = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const outgoingPlayerId = halfTime.stagedProgress?.state.simulation.context.away.lineup[1]?.playerId;
    const incomingPlayerId = halfTime.stagedProgress?.selectedBenchPlayerIds[0];

    if (outgoingPlayerId === undefined || incomingPlayerId === undefined) {
      throw new Error("Expected selected-club away lineup and bench for substitution test");
    }

    const substituted = applyDemoHalfTimeSubstitutions(halfTime, [
      {
        outgoingPlayerId,
        incomingPlayerId,
      },
    ]);

    expect(substituted.lastStagedAttempt.status).toBe("substitutions_applied");
    expect(substituted.stagedProgress?.snapshot.appliedSubstitutions).toHaveLength(1);
    expect(substituted.stagedProgress?.state.simulation.context.away.lineup.some((slot) => slot.playerId === incomingPlayerId)).toBe(true);

    const panel = buildDemoHalfTimeSubstitutionPanel(substituted);
    expect(panel.appliedSubstitutions).toEqual([
      expect.objectContaining({
        incomingPlayerName: expect.any(String),
        outgoingPlayerName: expect.any(String),
      }),
    ]);
  });

  it("returns a localized validation reason source when a half-time substitution is invalid", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTime = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const outgoingPlayerId = halfTime.stagedProgress?.state.simulation.context.away.lineup[1]?.playerId;

    if (outgoingPlayerId === undefined) {
      throw new Error("Expected selected-club away lineup for invalid substitution test");
    }

    const invalid = applyDemoHalfTimeSubstitutions(halfTime, [
      {
        outgoingPlayerId,
        incomingPlayerId: outgoingPlayerId,
      },
    ]);

    expect(invalid.lastStagedAttempt.status).toBe("invalid");
    expect(invalid.lastStagedAttempt.invalidReason).toBe("incoming_not_on_bench");
    expect(buildDemoHalfTimeSubstitutionPanel(invalid).validationReason).toBe("incoming_not_on_bench");
  });

  it("continues from half-time to full time and updates dashboard-compatible career facts", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const halfTime = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const fullTime = playDemoMatchdaySecondHalf(halfTime, savedPreparation);

    expect(fullTime.lastStagedAttempt.status).toBe("full_time");
    expect(fullTime.stagedProgress?.snapshot.phase).toBe("full_time");
    expect(fullTime.stagedProgress?.state.halfTimeTacticalPlan?.currentShape).toBe("4-4-2");
    expect(fullTime.stagedProgress?.snapshot.fullTimeReport?.fixtureId).toBe("fixture:000003");
    expect(fullTime.lastPlayAttempt.status).toBe("advanced");
    expect(fullTime.playedResult?.fixtureAfter.result?.played).toBe(true);

    const phaseView = buildDemoMatchdayPhaseView(fullTime);
    expect(phaseView.status).toBe("complete");
    expect(phaseView.conditionChanges.length).toBeGreaterThan(0);
  });

  it("returns structured half-time tactical validation facts when the board is invalid", () => {
    const savedPreparation = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const invalidPreparation = clearDemoMatchPreparationBoardSlot(savedPreparation, "gk");
    const halfTime = playDemoMatchdayFirstHalf(createInitialDemoMatchdayState(), savedPreparation);
    const invalid = playDemoMatchdaySecondHalf(halfTime, invalidPreparation);

    expect(invalid.lastStagedAttempt.status).toBe("invalid");
    expect(invalid.lastStagedAttempt.invalidReason).toBe("invalid_half_time_tactical_plan");
    expect(invalid.lastStagedAttempt.invalidFactKeys).toContain("missing_lineup_slot");
    expect(buildDemoHalfTimeSubstitutionPanel(invalid).validationFactKeys).toContain("missing_lineup_slot");
  });
});
