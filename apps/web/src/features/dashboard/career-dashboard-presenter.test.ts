import { describe, expect, it } from "vitest";

import { findNextCareerFixture } from "@game/engine";

import { createTestCareerFixture } from "../../test-fixtures/career-fixture";
import {
  buildWebCareerState,
  inspectWebCareerAttention,
  type WebCareerSaveId,
} from "../../runtime/web-career-runtime";
import { buildCareerDashboard } from "./build-career-dashboard";
import { presentCareerDashboard } from "./career-dashboard-presenter";

describe("presentCareerDashboard", () => {
  it("keeps dashboard readiness owned by @game/ui", () => {
    const presentation = presentCareerDashboard(buildCareerDashboard(createTestCareerFixture("dashboard-readiness").career));

    expect(presentation.canAdvanceNextFixture).toBe(false);
    expect(presentation.primaryBlockers).toEqual(["missing_saved_lineup", "missing_saved_tactic"]);
    expect(presentation.taskState).toBe("unprepared");
  });

  it("promotes current attention without exposing test-only section or action lists", () => {
    const fixture = createTestCareerFixture("dashboard-attention");
    const attention = inspectWebCareerAttention(fixture.career);
    const presentation = presentCareerDashboard(
      buildCareerDashboard(fixture.career),
      attention,
    );

    expect(presentation.taskState).toBe("attention");
    expect(presentation.attention).toBe(attention);
    expect(presentation).not.toHaveProperty("sectionIds");
    expect(presentation).not.toHaveProperty("actions");
  });

  it("keeps the just-reviewed result primary before asking for the next lineup", () => {
    const career = buildWebCareerState({
      saveId: "save:dashboard-post-match" as WebCareerSaveId,
      worldSeed: "dashboard-post-match-seed",
    });
    const nextFixture = findNextCareerFixture(career);
    if (nextFixture.status !== "found") throw new Error("Expected selected-club fixture");
    const playedCareer = {
      ...career,
      gameState: {
        ...career.gameState,
        fixtures: {
          ...career.gameState.fixtures,
          [nextFixture.fixture.id]: {
            ...nextFixture.fixture,
            result: { played: true as const, homeGoals: 2, awayGoals: 1 },
          },
        },
      },
    };

    const presentation = presentCareerDashboard(buildCareerDashboard(playedCareer));

    expect(presentation.taskState).toBe("post_match");
    expect(presentation.primaryBlockers).toEqual([]);
  });
});
