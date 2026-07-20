import type { CareerMatchPreparationFormationId } from "@game/ui";

import {
  applyMatchPreparationSelectionAction,
  buildDurableMatchPreparation,
  buildMatchPreparationView,
  createMatchPreparationDraft,
  selectMatchPreparationFormation,
  selectMatchPreparationTactic,
  type MatchPreparationDraft,
} from "../features/match-preparation/match-preparation-adapter";
import {
  buildWebMatchdayTeamControlPanel,
  buildWebMatchdayPhaseView,
  buildWebMatchdayView,
  advanceWebLiveMatchdayMinute,
  applyWebLiveMatchTeamChanges,
  createWebLiveMatchdaySession,
  createWebMatchdayState,
  resolveWebLiveMatchdayIncident,
  resumeWebLiveMatchday,
  type WebLiveMatchdaySession,
  type WebMatchdayState,
} from "../features/matchday/matchday-adapter";
import {
  buildWebCareerState,
  type WebCareerSaveId,
  type WebCareerState,
} from "../runtime/web-career-runtime";

/** Generated career fixture used only by web adapter and presentation tests. */
export interface TestCareerFixture {
  readonly career: WebCareerState;
  readonly draft: MatchPreparationDraft;
}

/** Generated career plus one complete, domain-valid saved preparation. */
export interface PreparedTestCareerFixture extends TestCareerFixture {
  readonly career: WebCareerState;
  readonly draft: MatchPreparationDraft;
}

/** Creates a deterministic generated career without production demo constants. */
export function createTestCareerFixture(suffix = "default"): TestCareerFixture {
  const career = buildWebCareerState({
    saveId: `save:test-${suffix}` as WebCareerSaveId,
    worldSeed: `test-${suffix}`,
  });
  return { career, draft: createMatchPreparationDraft(career) };
}

/** Creates a complete preparation through the same explicit helpers used by the UI. */
export function createPreparedTestCareerFixture(suffix = "prepared"): PreparedTestCareerFixture {
  const initial = createTestCareerFixture(suffix);
  const selected = applyMatchPreparationSelectionAction(initial.career, initial.draft, "auto");
  const draft = selectMatchPreparationTactic(selected, "tactic:balanced");
  const matchPreparation = buildDurableMatchPreparation(initial.career, draft);
  if (matchPreparation === undefined) throw new Error("Expected a complete test preparation");
  const career = { ...initial.career, matchPreparation };
  return { career, draft: createMatchPreparationDraft(career) };
}

/** Creates an unsaved draft for one alternate supported formation. */
export function createFormationTestFixture(
  formationId: CareerMatchPreparationFormationId,
  suffix = formationId,
): TestCareerFixture {
  const fixture = createTestCareerFixture(suffix);
  return {
    career: fixture.career,
    draft: selectMatchPreparationFormation(fixture.draft, formationId),
  };
}

/** Builds the real preparation read model for a test fixture. */
export function buildTestMatchPreparationView(fixture: TestCareerFixture) {
  return buildMatchPreparationView(fixture.career, fixture.draft);
}

/** Creates the durable pre-match state from a complete generated preparation. */
export function createPreMatchTestFixture(suffix = "pre-match") {
  const prepared = createPreparedTestCareerFixture(suffix);
  const created = requireLiveSession(prepared.career);
  return matchdayPresentation(prepared, created.matchdayState);
}

/** Creates the memory-only half-time decision state through exact minute progression. */
export function createHalfTimeTestFixture(suffix = "half-time") {
  const prepared = createPreparedTestCareerFixture(suffix);
  const created = requireLiveSession(prepared.career);
  const advanced = advanceSessionToPhase(created.session, "half_time");
  return matchdayPresentation(prepared, advanced.matchdayState);
}

/** Creates the committed full-time state from the exact progressive report. */
export function createFullTimeTestFixture(suffix = "full-time") {
  const prepared = createPreparedTestCareerFixture(suffix);
  const created = requireLiveSession(prepared.career);
  const halfTime = advanceSessionToPhase(created.session, "half_time");
  const decision = applyWebLiveMatchTeamChanges(halfTime.session, prepared.draft);
  if (decision.status !== "applied") throw new Error("Expected valid half-time tactical decision");
  const completed = advanceSessionToPhase(decision.session, "full_time");
  return matchdayPresentation(prepared, completed.matchdayState);
}

function requireLiveSession(career: WebCareerState) {
  const created = createWebLiveMatchdaySession(career);
  if (created.status !== "ready") throw new Error("Expected a valid progressive match session");
  return created;
}

function advanceSessionToPhase(
  initialSession: WebLiveMatchdaySession,
  targetPhase: "half_time" | "full_time",
): Readonly<{ session: WebLiveMatchdaySession; matchdayState: WebMatchdayState }> {
  let session = resumeWebLiveMatchday(initialSession);
  let matchdayState = createWebMatchdayState(
    initialSession.careerState,
    undefined,
    initialSession,
  );

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
    if (session.engineState.runState !== "running") {
      session = resumeWebLiveMatchday(session);
    }
  }

  throw new Error(`Expected match to reach ${targetPhase}`);
}

/** Bundles production read models around one generated matchday state. */
function matchdayPresentation(prepared: PreparedTestCareerFixture, matchday: WebMatchdayState) {
  return {
    ...prepared,
    matchday,
    view: buildWebMatchdayView(matchday, createMatchPreparationDraft(matchday.careerState)),
    phaseView: buildWebMatchdayPhaseView(matchday),
    teamControlPanel: buildWebMatchdayTeamControlPanel(matchday),
  };
}
