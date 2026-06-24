import { describe, expect, it } from "vitest";

import { buildDemoCareerDashboard } from "../dashboard/build-demo-career-dashboard";
import { continueDemoCareer } from "../dashboard/continue-demo-career";
import {
  buildDemoSavedPreparationInput,
  createCompleteUnsavedDemoMatchPreparationState,
  createInitialDemoMatchPreparationState,
  saveDemoMatchPreparation,
} from "./match-preparation-demo";

describe("web match-preparation career loop", () => {
  it("keeps Continue blocked and routes Inbox/Posta to preparation while preparation is missing", () => {
    const state = createInitialDemoMatchPreparationState();
    const dashboard = buildDemoCareerDashboard(buildDemoSavedPreparationInput(state));
    const continueResult = continueDemoCareer(state);

    expect(dashboard.alertKeys).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(dashboard.actions.find((action) => action.actionId === "prepare_match")?.status).toBe("available");
    expect(dashboard.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("blocked");
    expect(continueResult.stopReason).toBe("match_preparation_required");
    expect(continueResult.inboxMessages[0]?.actions).toEqual([
      {
        actionId: "prepare_match",
        labelKey: "career.inbox.action.prepare_match",
      },
    ]);
  });

  it("clears dashboard blockers and lets Continue reach matchday after saving full preparation", () => {
    const saveResult = saveDemoMatchPreparation(createCompleteUnsavedDemoMatchPreparationState());
    const dashboard = buildDemoCareerDashboard(buildDemoSavedPreparationInput(saveResult.state));
    const continueResult = continueDemoCareer(saveResult.state);

    expect(saveResult.view.status).toBe("saved");
    expect(dashboard.alertKeys).toEqual([]);
    expect(dashboard.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("available");
    expect(continueResult.stopReason).toBe("matchday_reached");
  });
});
