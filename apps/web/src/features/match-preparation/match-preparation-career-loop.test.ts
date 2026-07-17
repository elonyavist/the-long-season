import { describe, expect, it } from "vitest";

import { createPreparedTestCareerFixture, createTestCareerFixture } from "../../test-fixtures/career-fixture";
import { inspectWebCareerAttention } from "../../runtime/web-career-runtime";
import { buildCareerDashboard } from "../dashboard/build-career-dashboard";
import {
  buildDurableMatchPreparation,
  buildMatchPreparationView,
} from "./match-preparation-adapter";

describe("web match-preparation career loop", () => {
  it("keeps Continue blocked and routes Inbox/Posta to preparation while preparation is missing", () => {
    const fixture = createTestCareerFixture("career-loop-missing");
    const dashboard = buildCareerDashboard(fixture.career);
    const continueResult = inspectWebCareerAttention(fixture.career);

    expect(dashboard.alertKeys).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(dashboard.actions.find((action) => action.actionId === "prepare_match")?.status).toBe("available");
    expect(dashboard.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("blocked");
    expect(continueResult.stopReason).toBe("attention");
    expect(continueResult.inboxMessages[0]?.actions).toEqual([
      {
        actionId: "prepare_match",
        labelKey: "career.inbox.action.prepare_match",
      },
    ]);
  });

  it("clears dashboard blockers and lets Continue reach matchday after saving full preparation", () => {
    const fixture = createPreparedTestCareerFixture("career-loop-ready");
    const matchPreparation = buildDurableMatchPreparation(fixture.career, fixture.draft);
    if (matchPreparation === undefined) throw new Error("Expected complete preparation");
    const career = { ...fixture.career, matchPreparation };
    const dashboard = buildCareerDashboard(career);
    const continueResult = inspectWebCareerAttention(career);

    expect(buildMatchPreparationView(career, fixture.draft).status).toBe("saved");
    expect(dashboard.alertKeys).toEqual([]);
    expect(dashboard.actions.find((action) => action.actionId === "advance_next_fixture")?.status).toBe("available");
    expect(continueResult.stopReason).toBe("attention");
  });
});
