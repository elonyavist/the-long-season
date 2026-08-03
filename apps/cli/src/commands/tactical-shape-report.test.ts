import { describe, expect, it } from "vitest";

import {
  createTacticalShapeReport,
  measureTacticalShapeQualityBands,
  type CreateTacticalShapeReportInput,
  type TacticalShapeReportBundle,
} from "./tactical-shape-report-data.ts";
import {
  formatTacticalShapeReport,
  runTacticalShapeReportCommand,
  type TacticalShapeReportCommandDependencies,
} from "./tactical-shape-report.ts";

interface Recorder {
  readonly stdout: string[];
  readonly stderr: string[];
  readonly written: { path: string; contents: string }[];
  readonly requests: CreateTacticalShapeReportInput[];
  readonly dependencies: TacticalShapeReportCommandDependencies;
}

/** Builds a tiny bundle so the command test never runs the full baseline. */
function tinyBundle(overrides: Partial<TacticalShapeReportBundle["report"]> = {}): TacticalShapeReportBundle {
  const band = (bandKey: string) => ({ bandKey, goalkeeper: 12, defense: 12, midfield: 12, attack: 12 });

  return {
    measurement: {
      worldSeed: "test-world",
      bands: {
        reference: band("reference"),
        firstDivisionContender: band("first_division_contender"),
        firstDivisionAdjacent: band("first_division_adjacent"),
        firstDivisionModest: band("first_division_modest"),
        secondDivisionMidTable: band("second_division_mid_table"),
        thirdDivisionMidTable: band("third_division_mid_table"),
      },
      provenance: {
        reference: {
          band: band("reference"),
          clubId: "club:test-01",
          divisionRank: 1,
          divisionSize: 18,
        },
      },
    },
    report: {
      contractVersion: "test-contract",
      seedPrefix: "test-prefix",
      pairedSeedCount: 1,
      scenarioPairedSeedCount: 1,
      bands: [band("reference")],
      strengthRows: [
        {
          compositionKey: "4-4-2",
          strength: { goalkeeper: 12, defense: 12, midfield: 12, attack: 12, overall: 12 },
          fingerprint: "identical",
          emptyDepartments: [],
          reachableFromPreset: true,
        },
      ],
      distinctStrengthCount: 1,
      equivalences: [
        {
          firstCompositionKey: "4-4-2",
          secondCompositionKey: "3-1-6",
          strengthIdentical: true,
          resultsIdentical: true,
          matches: 2,
        },
      ],
      versusReference: [
        {
          compositionKey: "4-4-2",
          winShare: 0.5,
          matches: 2,
          possessionShare: 0.5,
          clampedTo: "none",
          opportunities: 20,
          expectedGoals: 2.5,
          goals: 2,
        },
      ],
      tacticDominance: {
        tacticKeys: ["neutral", "high_risk"],
        winShare: [
          [0.5, 0.62],
          [0.38, 0.5],
        ],
        matches: 4,
        rows: [
          {
            tacticKey: "neutral",
            winShare: 0.5,
            meanWinShareAgainstField: 0.62,
            minimumWinShareAgainstField: 0.62,
            matches: 2,
            possessionShare: 0.5,
            opportunities: 20,
            opportunitiesConceded: 18,
            expectedGoals: 2.5,
            chanceTypes: { open_play: 12, counter: 4, cross: 3, dead_ball: 1 },
          },
          {
            tacticKey: "high_risk",
            winShare: 0.38,
            meanWinShareAgainstField: 0.38,
            minimumWinShareAgainstField: 0.38,
            matches: 2,
            possessionShare: 0.5,
            opportunities: 18,
            opportunitiesConceded: 20,
            expectedGoals: 2.1,
            chanceTypes: { open_play: 10, counter: 4, cross: 3, dead_ball: 1 },
          },
        ],
      },
      formations: [
        {
          formationKey: "4-4-2",
          winShare: 0.5,
          matches: 2,
          possessionShare: 0.5,
          opportunities: 20,
          expectedGoals: 2.5,
          goals: 2,
          chanceTypes: { open_play: 12, counter: 4, cross: 3, dead_ball: 1 },
        },
      ],
      formationVersusSlider: {
        referenceCrossShare: 0.3,
        widestFormationCrossShare: 0.32,
        narrowestFormationCrossShare: 0.28,
        sliderFloorCrossShare: 0.25,
        sliderCapCrossShare: 0.35,
        formationShareOfSliderSpan: 0.4,
      },
      versusReferenceNoiseFloor: 0.1,
      dominance: {
        compositionKeys: ["4-4-2"],
        winShare: [[0.5]],
        rows: [{ compositionKey: "4-4-2", meanWinShare: 0.5, minimumWinShare: 0.5, matches: 2 }],
        matches: 2,
      },
      qualityVersusStructure: [],
      invariants: [
        {
          key: "no_dominant_composition",
          status: "pass",
          observations: 2,
          observed: 0.5,
          threshold: "frozen",
          detail: "nothing dominates",
        },
      ],
      structuredHash: "testhash",
      ...overrides,
    },
  };
}

function recorder(bundle: TacticalShapeReportBundle = tinyBundle()): Recorder {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const written: { path: string; contents: string }[] = [];
  const requests: CreateTacticalShapeReportInput[] = [];

  return {
    stdout,
    stderr,
    written,
    requests,
    dependencies: {
      stdout: (line) => stdout.push(line),
      stderr: (line) => stderr.push(line),
      writeReport: async (path, contents) => {
        written.push({ path, contents });
      },
      createReport: (input) => {
        requests.push(input);
        return bundle;
      },
    },
  };
}

describe("tactical-shape-report command", () => {
  it("uses frozen defaults when no argument is given", async () => {
    const io = recorder();

    expect(await runTacticalShapeReportCommand([], io.dependencies)).toBe(0);
    expect(io.requests).toEqual([
      {
        worldSeed: "phase81-tactical-shape-baseline",
        seedPrefix: "phase81-tactical-shape",
        pairedSeedCount: 8,
        scenarioPairedSeedCount: 400,
      },
    ]);
  });

  it("passes every parsed argument through to the audit", async () => {
    const io = recorder();

    const exitCode = await runTacticalShapeReportCommand(
      [
        "--world-seed=custom-world",
        "--seed-prefix=custom-prefix",
        "--paired-seeds=3",
        "--scenario-paired-seeds=5",
      ],
      io.dependencies,
    );

    expect(exitCode).toBe(0);
    expect(io.requests[0]).toEqual({
      worldSeed: "custom-world",
      seedPrefix: "custom-prefix",
      pairedSeedCount: 3,
      scenarioPairedSeedCount: 5,
    });
  });

  it("writes the report to the requested path instead of stdout", async () => {
    const io = recorder();

    await runTacticalShapeReportCommand(["--report-output=docs/audits/example.md"], io.dependencies);

    expect(io.written).toHaveLength(1);
    expect(io.written[0]?.path).toBe("docs/audits/example.md");
    expect(io.written[0]?.contents).toContain("# Phase 81 Tactical Shape Baseline");
    expect(io.stdout.join("\n")).not.toContain("# Phase 81 Tactical Shape Baseline");
  });

  it("prints the report when no output path is given", async () => {
    const io = recorder();

    await runTacticalShapeReportCommand([], io.dependencies);

    expect(io.written).toHaveLength(0);
    expect(io.stdout.join("\n")).toContain("# Phase 81 Tactical Shape Baseline");
  });

  it("fails on an unknown argument without running the audit", async () => {
    const io = recorder();

    expect(await runTacticalShapeReportCommand(["--nope"], io.dependencies)).toBe(1);
    expect(io.requests).toHaveLength(0);
    expect(io.stderr.join("\n")).toContain("--nope");
  });

  it.each([
    ["--world-seed="],
    ["--seed-prefix="],
    ["--report-output="],
    ["--paired-seeds=0"],
    ["--paired-seeds=abc"],
    ["--scenario-paired-seeds=-1"],
  ])("rejects %s", async (arg) => {
    const io = recorder();

    expect(await runTacticalShapeReportCommand([arg], io.dependencies)).toBe(1);
    expect(io.requests).toHaveLength(0);
    expect(io.stderr).toHaveLength(2);
  });

  it("exits non-zero when a frozen invariant fails", async () => {
    const failing = tinyBundle({
      invariants: [
        {
          key: "no_dominant_composition",
          status: "fail",
          observations: 2,
          observed: 0.9,
          threshold: "frozen",
          detail: "one shape beats everything",
        },
      ],
    });

    expect(await runTacticalShapeReportCommand([], recorder(failing).dependencies)).toBe(1);
  });

  it("does not treat not_evaluated as a failure", async () => {
    const pending = tinyBundle({
      invariants: [
        {
          key: "distinguishable_coherent_and_incoherent_shape",
          status: "not_evaluated",
          observations: 0,
          observed: null,
          threshold: "frozen",
          detail: "owned by a later step",
        },
      ],
    });

    expect(await runTacticalShapeReportCommand([], recorder(pending).dependencies)).toBe(0);
  });
});

describe("tactical shape report rendering", () => {
  const rendered = formatTacticalShapeReport(tinyBundle());

  it("records the single-country condition on the quality bands", () => {
    expect(rendered).toContain("single-country population");
  });

  it("labels a not_evaluated invariant distinctly from a pass", () => {
    const withPending = formatTacticalShapeReport(
      tinyBundle({
        invariants: [
          {
            key: "distinguishable_coherent_and_incoherent_shape",
            status: "not_evaluated",
            observations: 0,
            observed: null,
            threshold: "frozen",
            detail: "owned by a later step",
          },
        ],
      }),
    );

    expect(withPending).toContain("not_evaluated");
    expect(withPending).not.toContain("| PASS |");
  });

  it("prints the full dominance matrix rather than a summary", () => {
    expect(rendered).toContain("```tsv");
    expect(rendered).toContain("shape\t4-4-2");
  });
});

describe("tactical shape quality band measurement", () => {
  it("measures ordered bands from the generated three-division world", () => {
    const measurement = measureTacticalShapeQualityBands("tactical-shape-measurement-test");
    const { bands, provenance } = measurement;

    expect(bands.firstDivisionContender.attack).toBeGreaterThan(bands.thirdDivisionMidTable.attack);
    expect(bands.firstDivisionModest.midfield).toBeGreaterThan(bands.secondDivisionMidTable.midfield);
    expect(bands.secondDivisionMidTable.defense).toBeGreaterThan(bands.thirdDivisionMidTable.defense);
    expect(provenance.first_division_contender?.divisionRank).toBe(1);
    expect(provenance.third_division_mid_table?.divisionSize).toBeGreaterThan(2);

    const reference = bands.reference;
    expect(reference.defense).toBe(reference.attack);
    expect(reference.midfield).toBe(reference.goalkeeper);
  });

  it("measures the same bands twice for the same world seed", () => {
    const run = () => measureTacticalShapeQualityBands("tactical-shape-measurement-test").bands;

    expect(run()).toEqual(run());
  });

  it(
    "hands the measured bands to the audit and reports over the whole population",
    () => {
      const bundle = createTacticalShapeReport({
        worldSeed: "tactical-shape-bundle-test",
        seedPrefix: "tactical-shape-bundle-test",
        pairedSeedCount: 1,
        scenarioPairedSeedCount: 1,
      });

      expect(bundle.report.bands).toEqual([
        bundle.measurement.bands.reference,
        bundle.measurement.bands.firstDivisionContender,
        bundle.measurement.bands.firstDivisionAdjacent,
        bundle.measurement.bands.firstDivisionModest,
        bundle.measurement.bands.secondDivisionMidTable,
        bundle.measurement.bands.thirdDivisionMidTable,
      ]);
      expect(bundle.report.strengthRows).toHaveLength(66);
      expect(bundle.report.dominance.compositionKeys).toHaveLength(66);
      expect(bundle.report.dominance.matches).toBeGreaterThan(0);
    },
    60_000,
  );
});
