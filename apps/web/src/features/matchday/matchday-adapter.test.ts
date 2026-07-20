import { describe, expect, it } from "vitest";

import {
  applyMatchPreparationSelectionAction,
  buildDurableMatchPreparation,
  createMatchPreparationDraft,
  selectMatchPreparationTactic,
} from "../match-preparation/match-preparation-adapter";
import { buildWebCareerState, type WebCareerSaveId, type WebCareerState } from "../../runtime/web-career-runtime";
import {
  advanceWebLiveMatchdayMinute,
  applyWebLiveMatchTeamChanges,
  buildWebMatchdayTeamControlPanel,
  buildWebMatchdayPhaseView,
  commitWebLiveMatchday,
  createWebLiveMatchdaySession,
  pauseWebLiveMatchday,
  resolveWebLiveMatchdayIncident,
  resumeWebLiveMatchday,
  type WebLiveMatchdaySession,
  type WebMatchdayState,
} from "./matchday-adapter";

describe("progressive web matchday adapter", () => {
  it("creates a memory-only pre-match session and advances exactly one minute", () => {
    const career = preparedCareer("adapter-minute");
    const created = requireLiveSession(career);

    expect(created.matchdayState.liveProgress?.snapshot).toMatchObject({
      phase: "pre_match",
      currentMinute: 0,
      runState: "paused",
    });

    const running = resumeWebLiveMatchday(created.session);
    const advanced = advanceWebLiveMatchdayMinute(running);

    expect(advanced.matchdayState.liveProgress?.snapshot).toMatchObject({
      phase: "first_half",
      currentMinute: 1,
    });
    expect(advanced.matchdayState.liveProgress?.statistics).toEqual(
      buildWebMatchdayPhaseView(advanced.matchdayState).statistics,
    );
    expect(
      (advanced.matchdayState.liveProgress?.statistics?.home.possessionShare ?? 0)
      + (advanced.matchdayState.liveProgress?.statistics?.away.possessionShare ?? 0),
    ).toBeCloseTo(1, 6);
  });

  it("pauses and resumes without consuming another minute", () => {
    const created = requireLiveSession(preparedCareer("adapter-pause"));
    const minuteOne = advanceWebLiveMatchdayMinute(resumeWebLiveMatchday(created.session));
    const paused = pauseWebLiveMatchday(minuteOne.session);
    const resumed = resumeWebLiveMatchday(paused);

    expect(paused.engineState.simulation.minute).toBe(1);
    expect(paused.engineState).toMatchObject({ runState: "paused", pauseReason: "manual" });
    expect(resumed.engineState.simulation.minute).toBe(1);
    expect(resumed.engineState.runState).toBe("running");
  });

  it("keeps full-time facts private until the explicit career commit", () => {
    const career = preparedCareer("adapter-journey");
    const created = requireLiveSession(career);
    const halfTime = advanceToPhase(created.session, "half_time");
    const phaseView = buildWebMatchdayPhaseView(halfTime.matchdayState);
    const panel = buildWebMatchdayTeamControlPanel(halfTime.matchdayState);

    expect(phaseView.phase).toBe("half_time");
    expect(phaseView.playerRows.filter((row) => row.club.clubId === phaseView.selectedClub.clubId)).toHaveLength(11);
    expect(panel).toMatchObject({ status: "editable" });
    expect(panel.lineup).toHaveLength(11);
    expect(panel.bench).toHaveLength(8);
    expect(halfTime.matchdayState.playedResult).toBeUndefined();

    const decision = applyWebLiveMatchTeamChanges(
      halfTime.session,
      createMatchPreparationDraft(halfTime.matchdayState.careerState),
    );
    expect(decision.status).toBe("applied");
    const completed = advanceToPhase(decision.session, "full_time");

    expect(completed.matchdayState.playedResult).toBeUndefined();
    expect(completed.matchdayState.liveProgress?.snapshot.phase).toBe("full_time");
    expect(completed.matchdayState.liveProgress?.fullTimeReview).toBeDefined();
    expect(completed.matchdayState.lastSessionAttempt.status).toBe("full_time");
    expect(completed.session.careerState.gameState.fixtures[completed.session.fixtureBefore.id]?.result).toBeUndefined();
    expect(completed.session.completionPreview?.fixtureAfter.result?.played).toBe(true);

    const completedView = buildWebMatchdayPhaseView(completed.matchdayState);
    expect(completedView.phase).toBe("full_time");
    expect(completedView.timelineEvents.some((event) => event.kind === "foul")).toBe(false);
    expect(completedView.timelineEvents.every((event) => [
      "career.matchday.event.goal",
      "career.matchday.event.save",
      "career.matchday.event.miss",
      "career.matchday.event.block",
      "career.matchday.event.penalty",
      "career.matchday.event.penalty_goal",
      "career.matchday.event.penalty_miss",
      "career.matchday.event.penalty_save",
      "career.matchday.event.yellow_card",
      "career.matchday.event.red_card",
      "career.matchday.event.second_yellow",
      "career.matchday.event.injury",
      "career.matchday.event.substitution",
    ].includes(event.labelKey))).toBe(true);

    const committed = commitWebLiveMatchday(completed.session);
    expect(committed.status).toBe("advanced");
    if (committed.status !== "advanced") throw new Error(committed.reason);
    expect(committed).toBe(completed.session.completionPreview);
    expect(committed.fixtureAfter.result?.report).toEqual(committed.report);
    expect(completedView.conditionChanges).toEqual(completed.matchdayState.liveProgress?.fullTimeReview?.conditionChanges);
    expect(completedView.availabilityConsequences).toEqual(committed.playerAvailabilityConsequences);
  });

  it("commits representative deterministic live matches without replaying the final minute", () => {
    // Broad seed coverage belongs to the dedicated 50-world simulation gate.
    for (let world = 0; world < 6; world += 1) {
      const created = requireLiveSession(preparedCareer(`adapter-commit-${world}`));
      const completed = advanceToPhase(created.session, "full_time");
      const committed = commitWebLiveMatchday(completed.session);

      expect(committed.status, `world ${world} rejected at full time`).toBe("advanced");
      if (committed.status === "advanced") {
        expect(committed.fixtureAfter.result?.report).toEqual(committed.report);
      }
    }
  }, 20_000);
});

function requireLiveSession(career: WebCareerState) {
  const created = createWebLiveMatchdaySession(career);
  if (created.status !== "ready") throw new Error("Expected a valid progressive match session");
  return created;
}

function advanceToPhase(
  initialSession: WebLiveMatchdaySession,
  targetPhase: "half_time" | "full_time",
): Readonly<{ session: WebLiveMatchdaySession; matchdayState: WebMatchdayState }> {
  let session = resumeWebLiveMatchday(initialSession);
  let matchdayState: WebMatchdayState | undefined;

  for (let minute = 0; minute < 140; minute += 1) {
    const advanced = advanceWebLiveMatchdayMinute(session);
    session = advanced.session;
    matchdayState = advanced.matchdayState;
    if (session.engineState.phase === targetPhase) return { session, matchdayState };

    const decision = session.engineState.pendingDecision;
    if (decision !== undefined && decision.type !== "half_time") {
      session = resolveWebLiveMatchdayIncident(
        session,
        "acknowledge",
      );
    }
    if (session.engineState.runState !== "running") session = resumeWebLiveMatchday(session);
  }

  throw new Error(`Expected match to reach ${targetPhase}`);
}

/** Builds one generated career with a complete, adapter-produced preparation. */
function preparedCareer(suffix: string): WebCareerState {
  const career = buildWebCareerState({
    saveId: `save:web-${suffix}` as WebCareerSaveId,
    worldSeed: `web-${suffix}`,
  });
  const auto = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
  const draft = selectMatchPreparationTactic(auto, "tactic:balanced");
  const matchPreparation = buildDurableMatchPreparation(career, draft);
  if (matchPreparation === undefined) throw new Error("Expected complete generated match preparation");
  return { ...career, matchPreparation };
}
