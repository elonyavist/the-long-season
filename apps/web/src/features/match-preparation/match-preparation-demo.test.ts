import { describe, expect, it } from "vitest";

import { buildDemoCareerDashboard } from "../dashboard/build-demo-career-dashboard";
import { continueDemoCareer } from "../dashboard/continue-demo-career";
import {
  applyDemoMatchPreparationSelectionAction,
  buildDemoMatchPreparationView,
  buildDemoSavedPreparationInput,
  buildDemoTacticalBoardSquadPlayers,
  changeDemoMatchPreparationBoardSlotRole,
  clearDemoMatchPreparationBoardSlot,
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
  demoMatchPreparationBenchSlotKeys,
  demoMatchPreparationFormationIds,
  demoMatchPreparationSlotKeys,
  saveDemoMatchPreparation,
  moveDemoMatchPreparationBoardSlot,
  selectDemoMatchPreparationBenchPlayer,
  selectDemoMatchPreparationFormation,
  selectDemoMatchPreparationPlayer,
  selectDemoMatchPreparationTactic,
} from "./match-preparation-demo";

describe("demo match preparation adapter", () => {
  it("starts incomplete without choosing lineup or tactic for the manager", () => {
    const state = createInitialDemoMatchPreparationState();
    const view = buildDemoMatchPreparationView(state);

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["missing_lineup_slot", "missing_bench_slot", "missing_tactic"]);
    expect(view.lineup.selectedSlotCount).toBe(0);
    expect(view.lineup.requiredSlotCount).toBe(11);
    expect(view.formation.selectedFormationId).toBe("4-4-2");
    expect(view.bench.requiredSlotCount).toBe(8);
    expect(view.bench.selectedSlotCount).toBe(0);
    expect(view.tactic.selectedTacticProfileId).toBeUndefined();
    expect(buildDemoSavedPreparationInput(state)).toMatchObject({
      hasSavedLineup: false,
      hasSavedTactic: false,
      targetFixtureId: "fixture:000003",
    });
  });

  it("keeps complete preparation unsaved until the manager saves explicitly", () => {
    const state = createCompleteUnsavedDemoMatchPreparationState();
    const view = buildDemoMatchPreparationView(state);
    const dashboard = buildDemoCareerDashboard(buildDemoSavedPreparationInput(state));

    expect(view.status).toBe("ready_to_save");
    expect(view.saveAction.status).toBe("available");
    expect(dashboard.preparation.lineupStatus).toBe("missing");
    expect(dashboard.preparation.tacticStatus).toBe("missing");
    expect(continueDemoCareer(state).stopReason).toBe("match_preparation_required");
  });

  it("saving valid lineup and tactic produces saved preparation facts", () => {
    const result = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState());
    const dashboard = buildDemoCareerDashboard(buildDemoSavedPreparationInput(result.state));

    expect(result.view.status).toBe("saved");
    expect(buildDemoSavedPreparationInput(result.state)).toEqual({
      hasSavedLineup: true,
      hasSavedTactic: true,
      targetFixtureId: "fixture:000003",
    });
    expect(dashboard.alertKeys).toEqual([]);
    expect(continueDemoCareer(result.state).stopReason).toBe("matchday_reached");
  });

  it("prevents duplicate XI player selections through board-backed assignment", () => {
    const slotKeys = demoMatchPreparationSlotKeys();
    let state = createCompleteUnsavedDemoMatchPreparationState();
    state = selectDemoMatchPreparationPlayer(state, slotKeys[1] ?? "", "player:demo-01");
    state = selectDemoMatchPreparationTactic(state, "tactic:balanced");

    const result = saveDemoMatchPreparation(state);

    expect(result.view.status).toBe("blocked");
    expect(result.view.blockerKeys).toEqual(["missing_lineup_slot"]);
    expect(result.state.selectedPlayerIdsBySlot[slotKeys[0] ?? ""]).toBeUndefined();
    expect(continueDemoCareer(result.state).stopReason).toBe("match_preparation_required");
  });

  it("exposes the documented formation ids for future controls", () => {
    expect(demoMatchPreparationFormationIds()).toEqual([
      "4-4-2",
      "4-3-3",
      "4-2-3-1",
      "4-3-1-2",
      "3-5-2",
      "3-4-3",
      "3-6-1",
      "5-3-2",
      "4-1-4-1",
    ]);
  });

  it("changes formation shape without auto-selecting players", () => {
    const state = selectDemoMatchPreparationFormation(createInitialDemoMatchPreparationState(), "4-2-3-1");
    const view = buildDemoMatchPreparationView(state);

    expect(demoMatchPreparationSlotKeys(state)).toEqual([
      "gk",
      "rb",
      "cb-right",
      "cb-left",
      "lb",
      "dm-right",
      "dm-left",
      "rw",
      "am",
      "lw",
      "st",
    ]);
    expect(view.formation.selectedFormationId).toBe("4-2-3-1");
    expect(view.lineup.requiredSlotCount).toBe(11);
    expect(view.lineup.selectedSlotCount).toBe(0);
    expect(view.blockerKeys).toEqual(["missing_lineup_slot", "missing_bench_slot", "missing_tactic"]);
    expect(state.tacticalBoardDraft.baseFormationId).toBe("4-2-3-1");
    expect(state.tacticalBoardDraft.slots).toHaveLength(11);
  });

  it("preserves only compatible selected slots when the formation changes", () => {
    const initialSlotKeys = demoMatchPreparationSlotKeys();
    let state = createInitialDemoMatchPreparationState();
    state = selectDemoMatchPreparationPlayer(state, "gk", "player:demo-01");
    state = selectDemoMatchPreparationPlayer(state, "cm-right", "player:demo-06");
    state = selectDemoMatchPreparationPlayer(state, "rm", "player:demo-08");
    state = selectDemoMatchPreparationPlayer(state, "st-left", "player:demo-11");

    state = selectDemoMatchPreparationFormation(state, "4-2-3-1");

    expect(initialSlotKeys).toContain("rm");
    expect(state.selectedPlayerIdsBySlot).toEqual({
      gk: "player:demo-01",
    });
    expect(Object.fromEntries(state.tacticalBoardDraft.slots.flatMap((slot) => (slot.playerId === null ? [] : [[slot.slotId, slot.playerId]])))).toEqual({
      gk: "player:demo-01",
    });
    expect(buildDemoMatchPreparationView(state).lineup.selectedSlotCount).toBe(1);
  });

  it("marks saved preparation as unsaved after formation or bench changes", () => {
    const saved = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState()).state;
    const afterFormationChange = selectDemoMatchPreparationFormation(saved, "4-3-3");
    const afterLineupChange = selectDemoMatchPreparationPlayer(saved, "gk", "player:demo-12");
    const afterBenchChange = selectDemoMatchPreparationBenchPlayer(saved, "bench:01", "player:demo-12");
    const afterTacticChange = selectDemoMatchPreparationTactic(saved, "tactic:defensive");

    expect(saved.isSaved).toBe(true);
    expect(afterFormationChange.isSaved).toBe(false);
    expect(afterLineupChange.isSaved).toBe(false);
    expect(afterBenchChange.isSaved).toBe(false);
    expect(afterTacticChange.isSaved).toBe(false);
  });

  it("moves an XI player to the bench instead of duplicating him", () => {
    const benchSlotKeys = demoMatchPreparationBenchSlotKeys();
    let state = createCompleteUnsavedDemoMatchPreparationState();
    state = selectDemoMatchPreparationBenchPlayer(state, benchSlotKeys[0] ?? "", "player:demo-01");

    const view = buildDemoMatchPreparationView(state);

    expect(state.selectedPlayerIdsBySlot.gk).toBeUndefined();
    expect(state.selectedBenchPlayerIdsBySlot[benchSlotKeys[0] ?? ""]).toBe("player:demo-01");
    expect(view.blockerKeys).not.toContain("player_in_lineup_and_bench");
    expect(view.lineup.selectedSlotCount).toBe(10);
  });

  it("moves a bench player to the XI instead of duplicating him", () => {
    const benchSlotKeys = demoMatchPreparationBenchSlotKeys();
    let state = createCompleteUnsavedDemoMatchPreparationState();
    state = selectDemoMatchPreparationPlayer(state, "gk", "player:demo-12");

    const view = buildDemoMatchPreparationView(state);

    expect(state.selectedPlayerIdsBySlot.gk).toBe("player:demo-12");
    expect(state.selectedBenchPlayerIdsBySlot[benchSlotKeys[0] ?? ""]).toBeUndefined();
    expect(view.blockerKeys).not.toContain("player_in_lineup_and_bench");
    expect(view.bench.selectedSlotCount).toBe(7);
  });

  it("moves a player between bench slots instead of duplicating him", () => {
    const benchSlotKeys = demoMatchPreparationBenchSlotKeys();
    const firstSlotKey = benchSlotKeys[0] ?? "";
    const secondSlotKey = benchSlotKeys[1] ?? "";
    let state = createCompleteUnsavedDemoMatchPreparationState();
    state = selectDemoMatchPreparationBenchPlayer(state, secondSlotKey, "player:demo-12");

    expect(state.selectedBenchPlayerIdsBySlot[firstSlotKey]).toBeUndefined();
    expect(state.selectedBenchPlayerIdsBySlot[secondSlotKey]).toBe("player:demo-12");
    expect(buildDemoMatchPreparationView(state).bench.selectedSlotCount).toBe(7);
  });

  it("requires formation, XI, bench, and tactic before save is available", () => {
    const initialView = buildDemoMatchPreparationView(createInitialDemoMatchPreparationState());
    const completeView = buildDemoMatchPreparationView(createCompleteUnsavedDemoMatchPreparationState());

    expect(initialView.saveAction.status).toBe("blocked");
    expect(initialView.blockerKeys).toEqual(["missing_lineup_slot", "missing_bench_slot", "missing_tactic"]);
    expect(completeView.saveAction.status).toBe("available");
    expect(completeView.blockerKeys).toEqual([]);
  });

  it("blocks a full substitute bench without a goalkeeper", () => {
    const benchSlotKeys = demoMatchPreparationBenchSlotKeys();
    const outfieldBenchPlayerIds = [
      "player:demo-13",
      "player:demo-14",
      "player:demo-15",
      "player:demo-16",
      "player:demo-17",
      "player:demo-18",
      "player:demo-19",
      "player:demo-20",
    ];
    let state = createCompleteUnsavedDemoMatchPreparationState();

    for (const [index, benchSlotKey] of benchSlotKeys.entries()) {
      state = selectDemoMatchPreparationBenchPlayer(state, benchSlotKey, outfieldBenchPlayerIds[index]);
    }

    const view = buildDemoMatchPreparationView(state);

    expect(view.bench.selectedSlotCount).toBe(8);
    expect(view.blockerKeys).toEqual(["missing_bench_goalkeeper"]);
    expect(view.saveAction.status).toBe("blocked");
  });

  it("auto helper fills the starting XI and bench only after explicit manager action", () => {
    const initialState = createInitialDemoMatchPreparationState();
    const autoState = applyDemoMatchPreparationSelectionAction(initialState, "auto");
    const view = buildDemoMatchPreparationView(autoState);

    expect(buildDemoMatchPreparationView(initialState).lineup.selectedSlotCount).toBe(0);
    expect(view.lineup.selectedSlotCount).toBe(11);
    expect(view.bench.selectedSlotCount).toBe(8);
    expect(autoState.tacticalBoardDraft.slots.filter((slot) => slot.playerId !== null)).toHaveLength(11);
    expect(view.blockerKeys).toEqual(["missing_tactic"]);
    expect(autoState.isSaved).toBe(false);
  });

  it("fill gaps helper preserves existing manager selections", () => {
    let state = createInitialDemoMatchPreparationState();
    state = selectDemoMatchPreparationPlayer(state, "gk", "player:demo-12");
    state = selectDemoMatchPreparationBenchPlayer(state, "bench:01", "player:demo-01");

    const filledState = applyDemoMatchPreparationSelectionAction(state, "fill_gaps");
    const view = buildDemoMatchPreparationView(filledState);

    expect(filledState.selectedPlayerIdsBySlot.gk).toBe("player:demo-12");
    expect(filledState.selectedBenchPlayerIdsBySlot["bench:01"]).toBe("player:demo-01");
    expect(view.lineup.selectedSlotCount).toBe(11);
    expect(view.bench.selectedSlotCount).toBe(8);
  });

  it("clear helper removes XI and bench selections while preserving tactic and formation", () => {
    let state = createCompleteUnsavedDemoMatchPreparationState();
    state = selectDemoMatchPreparationFormation(state, "4-2-3-1");
    state = selectDemoMatchPreparationTactic(state, "tactic:attacking");

    const clearedState = applyDemoMatchPreparationSelectionAction(state, "clear");

    expect(clearedState.selectedFormationId).toBe("4-2-3-1");
    expect(clearedState.selectedTacticProfileId).toBe("tactic:attacking");
    expect(clearedState.selectedPlayerIdsBySlot).toEqual({});
    expect(clearedState.selectedBenchPlayerIdsBySlot).toEqual({});
    expect(clearedState.isSaved).toBe(false);
  });

  it("bench helper covers goalkeeper, defense, midfield, and attack before strongest extras", () => {
    const state = applyDemoMatchPreparationSelectionAction(createInitialDemoMatchPreparationState(), "auto");
    const view = buildDemoMatchPreparationView(state);
    const selectedBenchRoles = view.bench.slots.map((slot) => {
      const selectedPlayer = slot.playerOptions.find((player) => player.playerId === slot.selectedPlayerId);

      return selectedPlayer?.roleKey;
    });

    expect(selectedBenchRoles).toContain("goalkeeper");
    expect(selectedBenchRoles).toContain("defender");
    expect(selectedBenchRoles).toContain("midfielder");
    expect(selectedBenchRoles).toContain("attacker");
  });

  it("maps the current demo squad into shared tactical-board players", () => {
    const boardPlayers = buildDemoTacticalBoardSquadPlayers();
    const striker = boardPlayers.find((player) => player.playerId === "player:demo-10");

    expect(boardPlayers).toHaveLength(22);
    expect(striker).toMatchObject({
      surname: "Rinaldi",
      primaryRole: "striker",
      fitness: 100,
      currentAbility: 79,
    });
    expect(striker?.suitabilityByRole.ATT).toBe("natural");
    expect(striker?.suitabilityByRole.TD).toBe("unconvincing");
  });

  it("persists tactical-board slot movement, role changes, and clear actions in the draft", () => {
    let state = createInitialDemoMatchPreparationState();
    state = selectDemoMatchPreparationPlayer(state, "rm", "player:demo-08");
    state = moveDemoMatchPreparationBoardSlot(state, "rm", 0.95, 0.2);
    state = changeDemoMatchPreparationBoardSlotRole(state, "rm", "AD");

    const changedSlot = state.tacticalBoardDraft.slots.find((slot) => slot.slotId === "rm");

    expect(changedSlot).toMatchObject({
      role: "AD",
      canonicalRole: "right_winger",
      playerId: "player:demo-08",
    });
    expect(changedSlot?.nx).toBeLessThanOrEqual(0.98);
    expect(changedSlot?.ny).toBeGreaterThanOrEqual(0.08);
    expect(state.selectedPlayerIdsBySlot.rm).toBe("player:demo-08");

    state = clearDemoMatchPreparationBoardSlot(state, "rm");

    expect(state.tacticalBoardDraft.slots.find((slot) => slot.slotId === "rm")?.playerId).toBeNull();
    expect(state.selectedPlayerIdsBySlot.rm).toBeUndefined();
  });
});
