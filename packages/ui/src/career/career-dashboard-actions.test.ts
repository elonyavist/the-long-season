import { describe, expect, it } from "vitest";

import { careerDashboardActionAvailability, careerDashboardActionResult } from "./career-dashboard-actions.ts";

describe("career dashboard action contracts", () => {
  it("creates an available dashboard action", () => {
    expect(
      careerDashboardActionAvailability({
        actionId: "inspect_squad",
        status: "available",
      }),
    ).toEqual({
      actionId: "inspect_squad",
      status: "available",
      blockerKeys: [],
      labelKey: "career.dashboard.action.inspect_squad",
    });
  });

  it("creates an unavailable dashboard action", () => {
    expect(
      careerDashboardActionAvailability({
        actionId: "inspect_table",
        status: "unavailable",
      }),
    ).toEqual({
      actionId: "inspect_table",
      status: "unavailable",
      blockerKeys: [],
      labelKey: "career.dashboard.action.inspect_table",
    });
  });

  it("creates a blocked dashboard action with structured blockers", () => {
    expect(
      careerDashboardActionAvailability({
        actionId: "advance_next_fixture",
        status: "blocked",
        blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
      }),
    ).toEqual({
      actionId: "advance_next_fixture",
      status: "blocked",
      blockerKeys: ["missing_saved_lineup", "missing_saved_tactic"],
      labelKey: "career.dashboard.action.advance_next_fixture",
    });
  });

  it("creates a completed dashboard action result", () => {
    expect(
      careerDashboardActionResult({
        actionId: "prepare_match",
        status: "completed",
        changedSave: true,
        targetIds: ["fixture:000003"],
        messageKey: "career.dashboard.result.matchPrepared",
        detailValues: {
          fixtureId: "fixture:000003",
        },
      }),
    ).toEqual({
      actionId: "prepare_match",
      status: "completed",
      changedSave: true,
      targetIds: ["fixture:000003"],
      messageKey: "career.dashboard.result.matchPrepared",
      detailValues: {
        fixtureId: "fixture:000003",
      },
    });
  });
});
