import { describe, expect, it } from "vitest";

import { buildDemoCareerDashboard } from "./build-demo-career-dashboard";
import { presentCareerDashboard } from "./career-dashboard-presenter";

describe("presentCareerDashboard", () => {
  it("keeps dashboard readiness owned by @game/ui", () => {
    const presentation = presentCareerDashboard(buildDemoCareerDashboard());

    expect(presentation.canAdvanceNextFixture).toBe(false);
    expect(presentation.primaryBlockers).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(presentation.actions.find((action) => action.actionId === "advance_next_fixture")).toMatchObject({
      status: "blocked",
      blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
    });
  });

  it("returns sections in a stable screen order", () => {
    const presentation = presentCareerDashboard(buildDemoCareerDashboard());

    expect(presentation.sectionIds).toEqual([
      "context",
      "selected_club",
      "next_fixture",
      "preparation",
      "condition",
      "table",
      "recent_match",
      "actions",
      "blockers",
    ]);
  });
});
