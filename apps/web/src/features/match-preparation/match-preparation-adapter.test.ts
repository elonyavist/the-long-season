import { describe, expect, it } from "vitest";

import { buildWebCareerState, type WebCareerSaveId } from "../../runtime/web-career-runtime";
import {
  applyMatchPreparationSelectionAction,
  buildCareerTacticalBoardPlayers,
  buildDurableMatchPreparation,
  buildMatchPreparationView,
  createMatchPreparationDraft,
  isMatchPreparationDraftDirty,
  moveMatchPreparationBoardSlot,
  selectMatchPreparationFormation,
  selectMatchPreparationBenchPlayer,
  selectMatchPreparationPlayer,
  selectMatchPreparationTactic,
} from "./match-preparation-adapter";

describe("loaded-career match-preparation adapter", () => {
  it("uses the selected club's generated players instead of demo identities", () => {
    const career = careerState("real-squad");
    const draft = createMatchPreparationDraft(career);
    const view = buildMatchPreparationView(career, draft);
    const club = career.gameState.clubs[career.selectedClubId];
    if (club === undefined) throw new Error("Expected selected club");
    const firstPlayer = club?.playerIds[0] === undefined ? undefined : career.gameState.players[club.playerIds[0]];
    if (firstPlayer === undefined) throw new Error("Expected selected-club player");

    expect(view.lineup.slots[0]?.playerOptions).toHaveLength(club.playerIds.length);
    expect(view.lineup.slots[0]?.playerOptions[0]?.name).toBe(`${firstPlayer.firstName} ${firstPlayer.lastName}`);
    expect(view.lineup.slots[0]?.playerOptions.some((player) => player.playerId.startsWith("player:demo"))).toBe(false);
    expect(buildCareerTacticalBoardPlayers(career)).toHaveLength(club.playerIds.length);
  });

  it("keeps XI and bench mutually exclusive while editing", () => {
    const career = careerState("exclusive");
    const playerId = career.gameState.clubs[career.selectedClubId]?.playerIds[0];
    if (playerId === undefined) throw new Error("Expected selected-club player");
    const lineup = selectMatchPreparationPlayer(createMatchPreparationDraft(career), "gk", playerId);

    const bench = selectMatchPreparationBenchPlayer(lineup, "bench:01", playerId);

    expect(bench.selectedPlayerIdsBySlot.gk).toBeUndefined();
    expect(bench.selectedBenchPlayerIdsBySlot["bench:01"]).toBe(playerId);
  });

  it("round-trips exact formation, coordinates, roles, XI, bench, and tactic", () => {
    const career = careerState("round-trip");
    let draft = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
    draft = selectMatchPreparationTactic(draft, "tactic:balanced");
    draft = moveMatchPreparationBoardSlot(draft, "rm", 0.83, 0.43);
    const durable = buildDurableMatchPreparation(career, draft);
    if (durable === undefined) throw new Error("Expected complete preparation");

    const rehydrated = createMatchPreparationDraft({ ...career, matchPreparation: durable });

    expect(rehydrated.isSaved).toBe(true);
    expect(rehydrated.selectedFormationId).toBe(draft.selectedFormationId);
    expect(rehydrated.selectedPlayerIdsBySlot).toEqual(draft.selectedPlayerIdsBySlot);
    expect(rehydrated.selectedBenchPlayerIdsBySlot).toEqual(draft.selectedBenchPlayerIdsBySlot);
    expect(rehydrated.selectedTacticProfileId).toBe(draft.selectedTacticProfileId);
    expect(rehydrated.tacticalBoardDraft).toEqual(draft.tacticalBoardDraft);
  });

  it("keeps a completed fixture plan editable but unconfirmed for the next fixture", () => {
    const career = careerState("next-fixture-draft");
    let draft = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
    draft = selectMatchPreparationTactic(draft, "tactic:balanced");
    const durable = buildDurableMatchPreparation(career, draft);
    if (durable === undefined) throw new Error("Expected complete preparation");

    const { targetFixtureId: _completedFixtureId, ...carriedPreparation } = durable;
    const carried = createMatchPreparationDraft({ ...career, matchPreparation: carriedPreparation });

    expect(carried.selectedPlayerIdsBySlot).toEqual(draft.selectedPlayerIdsBySlot);
    expect(carried.selectedBenchPlayerIdsBySlot).toEqual(draft.selectedBenchPlayerIdsBySlot);
    expect(carried.selectedTacticProfileId).toBe(draft.selectedTacticProfileId);
    expect(carried.isSaved).toBe(false);
  });

  it("keeps the just-played fixture confirmed until its full-time review is acknowledged", () => {
    const career = careerState("full-time-review");
    let draft = applyMatchPreparationSelectionAction(career, createMatchPreparationDraft(career), "auto");
    draft = selectMatchPreparationTactic(draft, "tactic:balanced");
    const durable = buildDurableMatchPreparation(career, draft);
    if (durable === undefined) throw new Error("Expected complete preparation");
    const targetFixtureId = durable.targetFixtureId;
    if (targetFixtureId === undefined) throw new Error("Expected targeted fixture id");
    const fixture = career.gameState.fixtures[targetFixtureId];
    if (fixture === undefined) throw new Error("Expected targeted fixture");

    const reviewed = createMatchPreparationDraft({
      ...career,
      matchPreparation: durable,
      gameState: {
        ...career.gameState,
        fixtures: {
          ...career.gameState.fixtures,
          [fixture.id]: {
            ...fixture,
            result: { played: true, homeGoals: 1, awayGoals: 0 },
          },
        },
      },
    });

    expect(reviewed.isSaved).toBe(true);
  });

  it("does not produce a durable payload from an incomplete draft", () => {
    const career = careerState("incomplete");

    expect(buildDurableMatchPreparation(career, createMatchPreparationDraft(career))).toBeUndefined();
  });

  it("derives dirty state only from durable preparation facts", () => {
    const career = careerState("dirty");
    const baseline = createMatchPreparationDraft(career);
    const playerId = career.gameState.clubs[career.selectedClubId]?.playerIds[0];
    if (playerId === undefined) throw new Error("Expected selected-club player");

    const changedLineup = selectMatchPreparationPlayer(baseline, "gk", playerId);
    const restoredLineup = selectMatchPreparationPlayer(changedLineup, "gk", undefined);
    const changedFormation = selectMatchPreparationFormation(baseline, "4-3-3");
    const restoredFormation = selectMatchPreparationFormation(changedFormation, "4-4-2");

    expect(isMatchPreparationDraftDirty(career, baseline)).toBe(false);
    expect(isMatchPreparationDraftDirty(career, changedLineup)).toBe(true);
    expect(isMatchPreparationDraftDirty(career, restoredLineup)).toBe(false);
    expect(isMatchPreparationDraftDirty(career, changedFormation)).toBe(true);
    expect(isMatchPreparationDraftDirty(career, restoredFormation)).toBe(false);
    expect(isMatchPreparationDraftDirty(career, selectMatchPreparationTactic(baseline, "tactic:balanced"))).toBe(true);
  });
});

function careerState(suffix: string) {
  return buildWebCareerState({
    saveId: `save:adapter-${suffix}` as WebCareerSaveId,
    worldSeed: `adapter-${suffix}-seed`,
  });
}
