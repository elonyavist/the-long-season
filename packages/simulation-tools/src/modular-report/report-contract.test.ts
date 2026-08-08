import { describe, expect, it } from "vitest";

import {
  canonicalSimulationReportJson,
  createSimulationReportArtifact,
  parseSimulationReportArtifact,
} from "./report-contract.ts";

const input = () => ({
  measurementRequest: {
    mode: "custom" as const,
    profileId: null,
    worldCount: 1,
    seasonCount: 1,
    includedSectionIds: ["season"],
    detail: "summary" as const,
    seedPrefix: "contract-test",
    workerCount: 1,
  },
  manifest: {
    worldSeeds: ["contract-test-world-00001"],
    executionNodes: [{ key: "career", depth: "career" as const }],
    calibrationVersions: { tactics: "v1" },
  },
  sections: [
    { id: "season", status: "observed" as const, data: { z: 2, a: 1 } },
    { id: "tactical_agency", status: "not_requested" as const, reason: "not requested" },
  ],
  decision: "PASS" as const,
});

describe("canonical simulation report contract", () => {
  it("sorts object keys without reordering evidence arrays", () => {
    expect(canonicalSimulationReportJson({ z: [2, 1], a: { y: 2, x: 1 } })).toBe(
      '{\n  "a": {\n    "x": 1,\n    "y": 2\n  },\n  "z": [\n    2,\n    1\n  ]\n}',
    );
  });

  it("derives the same hash for semantically identical object key order", () => {
    const first = createSimulationReportArtifact(input());
    const second = createSimulationReportArtifact({
      ...input(),
      sections: [
        { id: "season", status: "observed", data: { a: 1, z: 2 } },
        { id: "tactical_agency", status: "not_requested", reason: "not requested" },
      ],
    });

    expect(second.reportHash).toBe(first.reportHash);
    expect(parseSimulationReportArtifact(JSON.parse(JSON.stringify(first)))).toEqual(first);
  });

  it("rejects an invalid section status instead of treating absence as empty", () => {
    expect(() => createSimulationReportArtifact({
      ...input(),
      sections: [
        { id: "season", status: "not_requested", reason: "wrong" },
      ],
    })).toThrow(/Requested section/);
  });

  it("rejects a changed fact under an old hash", () => {
    const artifact = createSimulationReportArtifact(input());
    expect(() => parseSimulationReportArtifact({
      ...artifact,
      decision: "FAIL",
    })).toThrow(/hash/);
  });
});
