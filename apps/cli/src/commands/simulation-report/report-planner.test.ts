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
