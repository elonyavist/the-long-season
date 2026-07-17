import { describe, expect, it } from "vitest";

import {
  applyMatchPreparationSelectionAction,
  buildDurableMatchPreparation,
  createMatchPreparationDraft,
  selectMatchPreparationTactic,
} from "../match-preparation/match-preparation-adapter";
import { buildWebCareerState, type WebCareerSaveId, type WebCareerState } from "../../runtime/web-career-runtime";
import {
  applyWebHalfTimeTacticalDecision,
  buildWebHalfTimeSubstitutionPanel,
  buildWebMatchdayPhaseView,
  completeWebMatchday,
  createWebMatchdayState,
  enterWebMatchday,
  progressWebMatchdayToHalfTime,
} from "./matchday-adapter";

describe("persisted web matchday adapter", () => {
  it("uses the generated save identities and survives checkpoint reconstruction", () => {
    const career = preparedCareer("adapter-resume");
    const entered = enterWebMatchday(career);
    const fixtureId = entered.careerState.activeMatchCheckpoint?.fixtureId;
    const fixture = fixtureId === undefined ? undefined : career.gameState.fixtures[fixtureId];
    expect(fixture).toBeDefined();

    const preMatch = buildWebMatchdayPhaseView(createWebMatchdayState(entered.careerState));
    expect(preMatch.phase).toBe("pre_match");
    expect(preMatch.fixture.homeClub.name).toBe(career.gameState.clubs[fixture!.homeClubId]?.name);
    expect(preMatch.fixture.awayClub.name).toBe(career.gameState.clubs[fixture!.awayClubId]?.name);

    const halfTime = progressWebMatchdayToHalfTime(createWebMatchdayState(entered.careerState));
    const resumed = createWebMatchdayState(structuredClone(halfTime.careerState));
    expect(buildWebMatchdayPhaseView(resumed)).toEqual(buildWebMatchdayPhaseView(halfTime));
    expect(resumed.careerState.activeMatchCheckpoint?.phase).toBe("half_time");
  });

  it("commits the exact staged report once and clears the active checkpoint", () => {
    const career = preparedCareer("adapter-commit");
    const halfTime = progressWebMatchdayToHalfTime(enterWebMatchday(career));
    const draft = createMatchPreparationDraft(halfTime.careerState);
    const decided = applyWebHalfTimeTacticalDecision(halfTime, draft);
    const completed = completeWebMatchday(createWebMatchdayState(decided.careerState));

    expect(completed.playedResult?.status).toBe("advanced");
    expect(completed.careerState.activeMatchCheckpoint).toBeUndefined();
    expect(completed.playedResult?.fixtureAfter.result?.report).toEqual(completed.playedResult?.report);
    const rehydratedFullTime = buildWebMatchdayPhaseView(createWebMatchdayState(structuredClone(completed.careerState)));
    expect(rehydratedFullTime.phase).toBe("full_time");
    expect(rehydratedFullTime.scoreboard.homeGoals).toBe(completed.playedResult?.report.score.home);
    expect(rehydratedFullTime.scoreboard.awayGoals).toBe(completed.playedResult?.report.score.away);
    expect(rehydratedFullTime.playerRows).toHaveLength(22);
    expect(completeWebMatchday(completed)).toBe(completed);
  });

  it("exposes structured half-time player facts without creating presentation-only data", () => {
    const halfTime = progressWebMatchdayToHalfTime(enterWebMatchday(preparedCareer("adapter-half-time-facts")));
    const phaseView = buildWebMatchdayPhaseView(halfTime);
    const panel = buildWebHalfTimeSubstitutionPanel(halfTime);

    expect(phaseView.phase).toBe("half_time");
    expect(phaseView.playerRows.filter((row) => row.club.clubId === phaseView.selectedClub.clubId)).toHaveLength(11);
    expect(phaseView.playerRows.every((row) => row.rating !== undefined && row.condition !== undefined)).toBe(true);
    expect(panel.status).toBe("available");
    expect(panel.lineup).toHaveLength(11);
    expect(panel.bench).toHaveLength(8);
    expect(panel.lineup.every((player) => player.rating !== undefined && player.condition !== undefined)).toBe(true);
  });
});

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
