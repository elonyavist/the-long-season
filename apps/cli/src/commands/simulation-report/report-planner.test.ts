import { describe, expect, it } from "vitest";

import { createSimulationReportPlan } from "./report-planner.ts";
import { createSimulationReportFromPlan } from "./report-registry.ts";
import { CAREER_SECTION_IDS } from "./career-sections.ts";

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

  it("locks Checkpoint D2 to two seven-world sets, five historical seasons, and the tactical module", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-d2-specialised-own-squad-agency",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 14,
      seasonCount: 5,
      workerCount: 7,
      seedPrefix: "phase81a-specialised-own-squad",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks B2 to the canonical tactical module and seven-worker population", () => {
    const plan = createSimulationReportPlan({ profileId: "phase81a-b2", workerCount: 7 });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-agency-before-state",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks B2 materiality attribution to the accepted replay population", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-b2-materiality",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-agency-before-state",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks current B2 materiality to the same population and seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-b2-current-materiality",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-agency-before-state",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks downstream replication to two untouched fourteen-world sets", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-b2-downstream-replication",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 28,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-b2-downstream-replication",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks Checkpoint C to A2 plus both untouched downstream populations", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-c",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 42,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-c-player-context",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks B2.1 attribution to the same population and seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-b2-attribution",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-agency-before-state",
      includedSectionIds: ["tactical_agency"],
    });
  });

  it("locks B2.1A identity-family attribution to the B2 population", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-b2-identity-family",
      workerCount: 7,
    });
    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
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

  it("freezes integrated L5.4 to fresh seven-world ten-season facts", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-integrated-l5-4-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-integrated-l5-4-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-integrated-l5-4-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the L5.4 hardening replay as a distinct profile on the same population", () => {
    const original = createSimulationReportPlan({
      profileId: "phase81a-integrated-l5-4-7x10",
      workerCount: 7,
    });
    const hardened = createSimulationReportPlan({
      profileId: "phase81a-integrated-l5-4h-reeval-7x10",
      workerCount: 7,
    });

    expect(hardened.measurementRequest).toMatchObject({
      profileId: "phase81a-integrated-l5-4h-reeval-7x10",
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-integrated-l5-4-v1",
    });
    expect(hardened.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(hardened.measurementRequest.profileId).not.toBe(original.measurementRequest.profileId);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-integrated-l5-4h-reeval-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes integrated L6.2 to seven fresh ten-season worlds and the complete register", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-integrated-l6-2-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-integrated-l6-2-7x10",
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-integrated-l6-2-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-integrated-l6-2-7x10",
      worldCount: 8,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes integrated L6.3 to seven fresh ten-season worlds and the complete reader", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-integrated-l6-3-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-integrated-l6-3-7x10",
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-integrated-l6-3-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-integrated-l6-3-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes integrated L6.3B to seven new ten-season worlds and the same complete reader", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-integrated-l6-3b-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-integrated-l6-3b-7x10",
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-integrated-l6-3b-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-integrated-l6-3b-7x10",
      worldCount: 8,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.3C assist attribution to seven fresh one-season worlds", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-assist-supply-l6-3c-7x1",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-assist-supply-l6-3c-7x1",
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-assist-supply-l6-3c-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-assist-supply-l6-3c-7x1",
      seasonCount: 2,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.3D assist eligibility to seven fresh one-season worlds", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-assist-eligibility-l6-3d-7x1",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-assist-eligibility-l6-3d-7x1",
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-assist-eligibility-l6-3d-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-assist-eligibility-l6-3d-7x1",
      worldCount: 8,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.3E dead-ball attribution to seven fresh one-season worlds", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-dead-ball-attribution-l6-3e-7x1",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-dead-ball-attribution-l6-3e-7x1",
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-dead-ball-attribution-l6-3e-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-dead-ball-attribution-l6-3e-7x1",
      seasonCount: 2,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.3F penalty award retry to seven fresh one-season worlds", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-penalty-award-l6-3f-7x1",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      profileId: "phase81a-penalty-award-l6-3f-7x1",
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-penalty-award-l6-3f-v1",
    });
    expect(plan.measurementRequest.includedSectionIds).toEqual(CAREER_SECTION_IDS);
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-penalty-award-l6-3f-7x1",
      worldCount: 14,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the independent L6.1B canary and powered current-world cohort", () => {
    const canary = createSimulationReportPlan({
      profileId: "phase81a-independent-owners-l6-1b-canary-7x1",
      workerCount: 7,
    });
    const full = createSimulationReportPlan({
      profileId: "phase81a-independent-owners-l6-1b-28x10",
      workerCount: 7,
    });

    expect(canary.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-independent-owners-l6-1b-canary-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(full.measurementRequest).toMatchObject({
      worldCount: 28,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-independent-owners-l6-1b-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-independent-owners-l6-1b-28x10",
      worldCount: 7,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the L6.1D strength-contest canary and powered paired cohort", () => {
    const canary = createSimulationReportPlan({
      profileId: "phase81a-strength-contest-l6-1d-canary-7x1",
      workerCount: 7,
    });
    const full = createSimulationReportPlan({
      profileId: "phase81a-strength-contest-l6-1d-28x10",
      workerCount: 7,
    });

    expect(canary.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-strength-contest-l6-1d-canary-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(full.measurementRequest).toMatchObject({
      worldCount: 28,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-strength-contest-l6-1d-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-strength-contest-l6-1d-28x10",
      seasonCount: 2,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the fresh L6.1D2 strength-contest retry profiles", () => {
    const canary = createSimulationReportPlan({
      profileId: "phase81a-strength-contest-l6-1d2-canary-7x1",
      workerCount: 7,
    });
    const full = createSimulationReportPlan({
      profileId: "phase81a-strength-contest-l6-1d2-28x10",
      workerCount: 7,
    });

    expect(canary.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-strength-contest-l6-1d2-canary-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(full.measurementRequest).toMatchObject({
      worldCount: 28,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-strength-contest-l6-1d2-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-strength-contest-l6-1d2-28x10",
      worldCount: 7,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the three-arm L6.1C canary and common-support cohort", () => {
    const canary = createSimulationReportPlan({
      profileId: "phase81a-renewal-common-support-l6-1c-canary-7x1",
      workerCount: 7,
    });
    const full = createSimulationReportPlan({
      profileId: "phase81a-renewal-common-support-l6-1c-7x10",
      workerCount: 7,
    });

    expect(canary.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 1,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-common-support-l6-1c-canary-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(full.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-common-support-l6-1c-v1",
      includedSectionIds: CAREER_SECTION_IDS,
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-renewal-common-support-l6-1c-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L5.2 to seven worlds, two seasons and three-division table facts", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2-7x2",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 2,
      workerCount: 7,
      seedPrefix: "phase81a-standings-hierarchy-l5-2-v1",
      includedSectionIds: ["season", "standings", "formations"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2-7x2",
      seasonCount: 3,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes the powered L5.2A retry to seven worlds and ten seasons", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2a-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-standings-hierarchy-l5-2a-v1",
      includedSectionIds: ["season", "standings", "formations"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2a-7x10",
      worldCount: 8,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L5.2B validation to fresh seven-world ten-season facts", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2b-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-standings-hierarchy-l5-2b-v1",
      includedSectionIds: ["season", "standings", "formations"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2b-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes hierarchy-only L5.2C validation to a third seed population", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2c-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-standings-hierarchy-l5-2c-v1",
      includedSectionIds: ["season", "standings", "formations"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2c-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes final L5.2D validation with no measurement overrides", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2d-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-standings-hierarchy-l5-2d-v1",
      includedSectionIds: ["season", "standings", "formations"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-standings-hierarchy-l5-2d-7x10",
      worldCount: 6,
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

  it("freezes L5.1 to the paired canary worlds, ten seasons and exactly seven workers", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-l5-1-owner-attribution-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-league-diversity-canary",
      includedSectionIds: ["formations", "development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-l5-1-owner-attribution-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes fresh L5.3A renewal validation to seven new worlds and ten seasons", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-player-renewal-leaders-l5-3a-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-player-renewal-leaders-l5-3a-v1",
      includedSectionIds: ["players", "formations", "development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-player-renewal-leaders-l5-3a-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes final L5.3B renewal validation to another fresh population", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-player-renewal-leaders-l5-3b-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-player-renewal-leaders-l5-3b-v1",
      includedSectionIds: ["players", "formations", "development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-player-renewal-leaders-l5-3b-7x10",
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes L5.3C architecture attribution to seven fresh ten-season worlds", () => {
    const plan = createSimulationReportPlan({
      profileId: "phase81a-renewal-architecture-l5-3c-7x10",
      workerCount: 7,
    });

    expect(plan.measurementRequest).toMatchObject({
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-architecture-l5-3c-v1",
      includedSectionIds: ["players", "formations", "development"],
    });
    expect(() => createSimulationReportPlan({
      profileId: "phase81a-renewal-architecture-l5-3c-7x10",
      workerCount: 6,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes all four L6.1 arms to the same seven L5.4 worlds and seven workers", () => {
    for (const arm of ["control", "market", "blueprint", "combined"] as const) {
      const profileId = `phase81a-renewal-ablation-l6-1-${arm}-7x10` as const;
      const plan = createSimulationReportPlan({ profileId, workerCount: 7 });
      expect(plan.measurementRequest).toMatchObject({
        profileId,
        worldCount: 7,
        seasonCount: 10,
        workerCount: 7,
        seedPrefix: "phase81a-integrated-l5-4-v1",
        includedSectionIds: [
          "season", "standings", "players", "transfers",
          "formations", "economy", "development", "anomalies",
        ],
      });
      expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
        .toThrow(/refuses measurement overrides/);
    }
  });

  it("freezes L6.12B to the cached L6.11 candidate population and seven workers", () => {
    const profileId = "phase81a-succession-downstream-funnel-l6-12b-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-succession-affordability-l6-9d-v1",
      includedSectionIds: [
        "season", "standings", "players", "transfers",
        "formations", "economy", "development", "anomalies",
      ],
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.13 to the same cached population and seven workers", () => {
    const profileId = "phase81a-succession-growth-feasibility-l6-13-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-succession-affordability-l6-9d-v1",
      includedSectionIds: [
        "season", "standings", "players", "transfers",
        "formations", "economy", "development", "anomalies",
      ],
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.15 to the read-only current-product population", () => {
    const profileId = "phase81a-leader-conversion-l6-15-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
      includedSectionIds: [
        "season", "standings", "players", "transfers",
        "formations", "economy", "development", "anomalies",
      ],
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.15B to the same cache and mature denominator", () => {
    const profileId = "phase81a-mature-leader-conversion-l6-15b-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.16 to the mature quality failures in the same cache", () => {
    const profileId = "phase81a-leader-quality-feasibility-l6-16-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.18 to the fresh current-policy cache written before its buckets", () => {
    const profileId = "phase81a-ceiling-distance-l6-18-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-renewal-baseline-l6-4-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.20 to fresh current prospect-class provenance", () => {
    const profileId = "phase81a-academy-prospect-class-l6-20-7x10";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, workerCount: 6 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.23 to the exact paired cached lifecycle population", () => {
    const profileId = "phase81a-generated-player-lifecycle-l6-23-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, worldCount: 8 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.24 to the current cached leader-lane population", () => {
    const profileId = "phase81a-generated-leader-lane-l6-24-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, seasonCount: 9 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.26 to the outcome-unconditioned current cache", () => {
    const profileId = "phase81a-renewal-ladder-l6-26-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, worldCount: 8 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.27 to the age-conditioned current cache", () => {
    const profileId = "phase81a-population-stationarity-l6-27-cached";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, seasonCount: 9 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes L6.29A to fresh generation-boundary facts", () => {
    const profileId = "phase81a-generation-time-stationary-l6-29a-7x10";
    const plan = createSimulationReportPlan({ profileId, workerCount: 7 });

    expect(plan.measurementRequest).toMatchObject({
      profileId,
      worldCount: 7,
      seasonCount: 10,
      workerCount: 7,
      seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
    });
    expect(() => createSimulationReportPlan({ profileId, seasonCount: 9 }))
      .toThrow(/refuses measurement overrides/);
  });

  it("freezes both L6.31 runway arms to the same seven-world population", () => {
    const profileIds = [
      "phase81a-routine-youth-runway-l6-31-control-7x10",
      "phase81a-routine-youth-runway-l6-31-candidate-7x10",
    ] as const;
    const plans = profileIds.map((profileId) => createSimulationReportPlan({
      profileId,
      workerCount: 7,
    }));

    for (const plan of plans) {
      expect(plan.measurementRequest).toMatchObject({
        worldCount: 7,
        seasonCount: 10,
        workerCount: 7,
        seedPrefix: "phase81a-academy-prospect-class-l6-20-v1",
      });
    }
    expect(plans[0]?.measurementRequest.seedPrefix)
      .toBe(plans[1]?.measurementRequest.seedPrefix);
    expect(() => createSimulationReportPlan({
      profileId: profileIds[1],
      seasonCount: 9,
    })).toThrow(/refuses measurement overrides/);
  });

  it("freezes disjoint L6.31 out-of-sample arms to one paired population", () => {
    const profileIds = [
      "phase81a-routine-youth-runway-l6-31-oos-control-7x10",
      "phase81a-routine-youth-runway-l6-31-oos-candidate-7x10",
    ] as const;
    const plans = profileIds.map((profileId) => createSimulationReportPlan({
      profileId,
      workerCount: 7,
    }));
    for (const plan of plans) {
      expect(plan.measurementRequest).toMatchObject({
        worldCount: 7,
        seasonCount: 10,
        workerCount: 7,
        seedPrefix: "phase81a-routine-youth-runway-l6-31-oos-v1",
      });
    }
    expect(plans[0]?.measurementRequest.seedPrefix)
      .toBe(plans[1]?.measurementRequest.seedPrefix);
    expect(plans[0]?.measurementRequest.seedPrefix)
      .not.toBe("phase81a-academy-prospect-class-l6-20-v1");
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
