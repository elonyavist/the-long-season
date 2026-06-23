import { describe, expect, it } from "vitest";

import { buildDemoCareerDashboard } from "./build-demo-career-dashboard";
import { continueDemoCareer } from "./continue-demo-career";
import {
  buildDemoMatchPreparationView,
  buildDemoSavedPreparationInput,
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
  demoMatchPreparationSlotKeys,
  saveDemoMatchPreparation,
  selectDemoMatchPreparationPlayer,
  selectDemoMatchPreparationTactic,
} from "./match-preparation-demo";

describe("demo match preparation adapter", () => {
  it("starts incomplete without choosing lineup or tactic for the manager", () => {
    const state = createInitialDemoMatchPreparationState();
    const view = buildDemoMatchPreparationView(state);

    expect(view.status).toBe("blocked");
    expect(view.blockerKeys).toEqual(["missing_lineup_slot", "missing_tactic"]);
    expect(view.lineup.selectedSlotCount).toBe(0);
    expect(view.lineup.requiredSlotCount).toBe(11);
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

  it("does not save invalid duplicate player selections", () => {
    const slotKeys = demoMatchPreparationSlotKeys();
    let state = createCompleteUnsavedDemoMatchPreparationState();
    state = selectDemoMatchPreparationPlayer(state, slotKeys[1] ?? "", "player:demo-01");
    state = selectDemoMatchPreparationTactic(state, "tactic:balanced");

    const result = saveDemoMatchPreparation(state);

    expect(result.view.status).toBe("blocked");
    expect(result.view.blockerKeys).toEqual(["duplicate_lineup_player"]);
    expect(result.state.isSaved).toBe(false);
    expect(continueDemoCareer(result.state).stopReason).toBe("match_preparation_required");
  });
});
