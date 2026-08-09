import { describe, expect, it } from "vitest";

import { createSimulationReportPlan } from "./report-planner.ts";
import { createSimulationReportFromPlan } from "./report-registry.ts";

describe("simulation-report planner", () => {
  it("canonicalizes include order and caps custom workers at seven", () => {
    const plan = createSimulationReportPlan({
      worldCount: 10,
      includedSectionIds: ["season", "season"],
      workerCount: 20,
    });
    expect(plan.sectionIds).toEqual(["season"]);
    expect(plan.measurementRequest.workerCount).toBe(7);
  });

  it("keeps presentation outside measurement identity", () => {
    const consolePlan = createSimulationReportPlan({ format: "console", language: "it" });
    const jsonPlan = createSimulationReportPlan({ format: "json", language: "de" });
    expect(jsonPlan.measurementRequest).toEqual(consolePlan.measurementRequest);
  });

  it("reaches the declared shallow and deep custom population dimensions", () => {
    const shallow = createSimulationReportPlan({
      worldCount: 1,
      seasonCount: 1,
      detail: "summary",
      includedSectionIds: ["season"],
    });
    const deep = createSimulationReportPlan({
      worldCount: 7,
      seasonCount: 10,
      detail: "diagnostic",
      workerCount: 7,
      includedSectionIds: ["season", "transfers", "formations"],
    });
    expect(shallow.measurementRequest).toMatchObject({
      worldCount: 1,
      seasonCount: 1,
      detail: "summary",
    });
    expect(deep.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      detail: "diagnostic",
      workerCount: 7,
    });
  });

  it("refuses profile measurement overrides", () => {
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-a2",
      worldCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("keeps profile populations and worker policy frozen", () => {
    const plan = createSimulationReportPlan({ profileId: "phase81a-a2", workerCount: 7 });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      workerCount: 7,
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("freezes both league-diversity populations and keeps their seeds disjoint", () => {
    const canary = createSimulationReportPlan({
      profileId: "phase81a-league-diversity-canary-7x10",
      workerCount: 7,
    });
    const main = createSimulationReportPlan({
      profileId: "phase81a-league-diversity-100x10",
      workerCount: 7,
    });

    expect(canary.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
    });
    expect(main.measurementRequest).toMatchObject({
      worldCount: 100,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity",
    });
    expect(new Set(canary.measurementRequest.includedSectionIds)).toEqual(new Set([
      "season",
      "standings",
      "players",
      "transfers",
      "formations",
      "economy",
      "development",
      "anomalies",
    ]));
    expect(canary.measurementRequest.seedPrefix).not.toBe(main.measurementRequest.seedPrefix);
  });

  it("refuses every league-diversity measurement override", () => {
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-league-diversity-100x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-league-diversity-100x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the L3 availability-aging population and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-availability-aging-l3-7x2",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 2,
      workerCount: 7,
      seedPrefix: "phase81a-availability-aging-l3-v1",
      includedSectionIds: ["formations"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-availability-aging-l3-7x2",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L4 to the canary worlds, ten seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-generational-succession-l4-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-generational-succession-l4-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L4.1 to the paired canary worlds, ten seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-youth-minute-pathway-l4-1-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-youth-minute-pathway-l4-1-7x10",
      worldCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L4.2 to the paired canary worlds, ten seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-career-exit-renewal-l4-2-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-career-exit-renewal-l4-2-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L4.3 to the paired canary worlds, ten seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-generated-ceiling-l4-3-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-generated-ceiling-l4-3-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L4.4 to the paired canary worlds, ten seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-development-renewal-l4-4-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-development-renewal-l4-4-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L4.5 to the paired canary worlds, two seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-annual-role-continuity-l4-5-7x2",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 2,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["formations", "development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-annual-role-continuity-l4-5-7x2",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("plans no audit work when a custom request lacks the locked shape population", () => {
    const plan = createSimulationReportPlan({
      includedSectionIds: ["tactical_shape"],
    });
    expect(plan.executionNodes).toEqual([]);
  });

  it("records a requested unavailable population as not_observed", async () => {
    const plan = createSimulationReportPlan({ includedSectionIds: ["tactical_shape"] });
    const report = await createSimulationReportFromPlan({
      measurementRequest: plan.measurementRequest,
      executionNodes: plan.executionNodes,
    });
    expect(report.decision).toBe("NOT_EVALUATED");
    expect(report.sections.find(({ id }) => id === "tactical_shape")?.status).toBe("not_observed");
  });
});
