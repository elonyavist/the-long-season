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
  buildWebHalfTimeSubstitutionPanel,
  buildWebMatchdayPhaseView,
  buildWebMatchdayView,
  completeWebMatchday,
  enterWebMatchday,
  progressWebMatchdayToHalfTime,
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
  const matchday = enterWebMatchday(prepared.career);
  return matchdayPresentation(prepared, matchday);
}

/** Creates the durable half-time decision state through real staged progression. */
export function createHalfTimeTestFixture(suffix = "half-time") {
  const prepared = createPreparedTestCareerFixture(suffix);
  const matchday = progressWebMatchdayToHalfTime(enterWebMatchday(prepared.career));
  return matchdayPresentation(prepared, matchday);
}

/** Creates the committed full-time state from the exact staged report. */
export function createFullTimeTestFixture(suffix = "full-time") {
  const prepared = createPreparedTestCareerFixture(suffix);
  const halfTime = progressWebMatchdayToHalfTime(enterWebMatchday(prepared.career));
  const matchday = completeWebMatchday(halfTime);
  return matchdayPresentation(prepared, matchday);
}

/** Bundles production read models around one generated matchday state. */
function matchdayPresentation(prepared: PreparedTestCareerFixture, matchday: WebMatchdayState) {
  return {
    ...prepared,
    matchday,
    view: buildWebMatchdayView(matchday, createMatchPreparationDraft(matchday.careerState)),
    phaseView: buildWebMatchdayPhaseView(matchday),
    halfTimeSubstitutions: buildWebHalfTimeSubstitutionPanel(matchday),
  };
}
