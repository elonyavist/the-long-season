import assert from "node:assert/strict";
import { test } from "vitest";

import type { TacticalAgencyAuditReport } from "@game/simulation-tools";

import {
  formatCheckpointA21Report,
  runTacticalAgencyReportCommand,
  type CreateTacticalAgencyReportInput,
  type TacticalAgencyReportCommandDependencies,
} from "./tactical-agency-report.ts";
import type { CheckpointA2Report } from "./tactical-agency-report/checkpoint-a2.ts";

/**
 * These tests own argument parsing, the checkpoint worker rule, rendering and
 * exit codes. Producing a before-state costs minutes of real world generation,
 * so it is behind the `createReport` seam and exercised by running the command
 * for real rather than in a unit test.
 */

test("a checkpoint run refuses any worker count that is not seven", async () => {
  // Worker count never moves a number, but it moves the wall clock, and the wall
  // clock is what Checkpoints B to F are budgeted from. A checkpoint that
  // quietly ran on one worker would report an honest result with a useless cost,
  // so the count is pinned rather than capped.
  for (const workers of ["1", "4", "8", "14"]) {
    const run = await commandRun(["--checkpoint", `--workers=${workers}`]);

    assert.equal(run.exitCode, 1);
    assert.equal(run.stderr[0]?.includes("exactly 7 workers"), true, workers);
    assert.equal(run.createReportCalls.length, 0, "a refused run must measure nothing");
  }
});

test("a checkpoint run at seven workers is accepted and records the count", async () => {
  const run = await commandRun(["--checkpoint", "--workers=7"]);

  assert.equal(run.exitCode, 0);
  assert.equal(run.createCheckpointReportCalls[0]?.workerCount, 7);
  assert.equal(run.createCheckpointReportCalls[0]?.checkpointMode, true);
  assert.equal(run.written.length, 2, "A2 and A2.1 come from one checkpoint result");
});

test("an ordinary run may use any worker count, because it budgets nothing", async () => {
  const run = await commandRun(["--workers=2"]);

  assert.equal(run.exitCode, 0);
  assert.equal(run.createReportCalls[0]?.workerCount, 2);
  assert.equal(run.createReportCalls[0]?.checkpointMode, false);
});

test("counts must be positive whole numbers", async () => {
  for (const arg of ["--worlds=0", "--rounds=-1", "--paired-seeds=2.5", "--workers=abc"]) {
    const run = await commandRun([arg]);

    assert.equal(run.exitCode, 1, arg);
    assert.equal(run.createReportCalls.length, 0, arg);
  }
});

test("an unknown flag is refused rather than ignored", async () => {
  const run = await commandRun(["--wrolds=3"]);

  assert.equal(run.exitCode, 1);
  assert.equal(run.stderr[0]?.includes("--wrolds"), true);
});

test("seeds and counts reach the producer exactly as written", async () => {
  const run = await commandRun([
    "--world-seed=agency-test",
    "--seed-prefix=agency-replay-test",
    "--worlds=3",
    "--rounds=2",
    "--paired-seeds=5",
  ]);

  assert.deepEqual(run.createReportCalls[0], {
    worldSeed: "agency-test",
    seedPrefix: "agency-replay-test",
    worldCount: 3,
    roundCount: 2,
    pairedSeedCount: 5,
    workerCount: 7,
    checkpointMode: false,
  });
});

test("the report names its population, its calibration and its cost", async () => {
  // A number whose population is not written beside it is not evidence, and this
  // is the first phase where a tactic magnitude can move without an engine
  // change - so the stamped calibration belongs in the document too.
  const run = await commandRun([]);
  const rendered = run.stdout.join("\n");

  assert.equal(rendered.includes("`worlds`: 2"), true);
  assert.equal(rendered.includes("`matchTacticsCalibrationVersion`: match-tactics-calibration-v1"), true);
  assert.equal(rendered.includes("`workers`: 7"), true);
  assert.equal(rendered.includes("`selections`: 1"), true);
  assert.equal(rendered.includes("`tieDecidedShare`: 1.0000"), true);
});

test("a block that bought nothing is rendered as such, never as a free exchange", async () => {
  // `ownLossPerConcededReduction` is not a number when the block conceded no
  // less. Rendering `0` there would read as "it cost nothing"; the report says
  // what happened instead.
  const rendered = (await commandRun([])).stdout.join("\n");

  assert.equal(rendered.includes("`ownLossPerConcededReduction`: no_reduction"), true);
});

test("a report output path is written rather than printed", async () => {
  const run = await commandRun(["--report-output=docs/audits/agency.md"]);

  assert.equal(run.exitCode, 0);
  assert.equal(run.written[0]?.path, "docs/audits/agency.md");
  assert.equal(run.written[0]?.contents.startsWith("# Phase 81A Step 02"), true);
  assert.equal(run.stdout[0]?.includes("docs/audits/agency.md"), true);
});

test("the A2.1 artifact renders its measured arms instead of pinned run values", () => {
  const rendered = formatCheckpointA21Report([{
    setName: "derived-values",
    arms: [
      {
        armName: "legacy chart",
        worldSeeds: ["world-1"],
        concededExpectedGoalsReduction: 0.12345,
        ownLossPerConcededReduction: 2.98765,
        guardrailHeld: false,
      },
      {
        armName: "current chart",
        worldSeeds: ["world-1"],
        concededExpectedGoalsReduction: 0.23456,
        ownLossPerConcededReduction: 2.87654,
        guardrailHeld: false,
      },
    ],
    attribution: "legacy_chart_also_fails",
  }]);

  for (const measured of [0.12345, 2.98765, 0.23456, 2.87654].map((value) => value.toFixed(4))) {
    assert.equal(rendered.includes(measured), true, measured);
  }
});

/** One command run with every side effect captured. */
async function commandRun(args: readonly string[]): Promise<{
  readonly exitCode: number;
  readonly stdout: readonly string[];
  readonly stderr: readonly string[];
  readonly written: readonly { readonly path: string; readonly contents: string }[];
  readonly createReportCalls: readonly CreateTacticalAgencyReportInput[];
  readonly createCheckpointReportCalls: readonly CreateTacticalAgencyReportInput[];
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const written: { path: string; contents: string }[] = [];
  const createReportCalls: CreateTacticalAgencyReportInput[] = [];
  const createCheckpointReportCalls: CreateTacticalAgencyReportInput[] = [];

  const dependencies: TacticalAgencyReportCommandDependencies = {
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
    writeReport: async (path, contents) => {
      written.push({ path, contents });
    },
    createReport: async (input) => {
      createReportCalls.push(input);
      return sampleReport(input);
    },
    createCheckpointReport: async (input) => {
      createCheckpointReportCalls.push(input);
      return sampleCheckpointReport(input);
    },
  };

  const exitCode = await runTacticalAgencyReportCommand(args, dependencies);

  return {
    exitCode,
    stdout,
    stderr,
    written,
    createReportCalls,
    createCheckpointReportCalls,
  };
}

/** A completed checkpoint small enough to test command wiring without a world run. */
function sampleCheckpointReport(input: CreateTacticalAgencyReportInput): CheckpointA2Report {
  const set = {
    setName: "sample",
    worldSeeds: [input.worldSeed],
    selectionCount: 1,
    topFormationShare: 0.2,
    distinctFormationCount: 6,
    positiveRoleCount: 10,
    reorderInvariantShare: 1,
    meanOutOfPositionSlots: 0,
    identities: {
      rows: [],
      distinctModalFormationCount: 3,
      unevaluatedIdentityKeys: [],
      unattributedSelectionCount: 0,
    },
    gates: [{ gate: "sample", observed: "1", target: "= 1", passed: true }],
    guardrails: [{ gate: "sample", observed: "1", target: "= 1", passed: true }],
    passed: true,
    guardrailsHeld: true,
  } as const;
  const arm = {
    armName: "sample",
    worldSeeds: [input.worldSeed],
    concededExpectedGoalsReduction: 0.1,
    ownLossPerConcededReduction: 1,
    guardrailHeld: true,
  } as const;

  return {
    sets: [set],
    counterfactual: {
      worldSeed: input.worldSeed,
      rows: [],
      clubCount: 1,
      clubsWhoseShapeMoved: 1,
      distinctShapeCountByClub: [2],
    },
    counterfactualMovesShape: true,
    lowBlockAttributionReports: [{
      setName: "sample",
      arms: [arm, arm],
      attribution: "not_reproduced",
    }],
    lowBlockAttribution: "not_reproduced",
    decision: "GO",
    workerCount: input.workerCount,
  };
}

/** A before-state small enough to assert on, shaped exactly like a real one. */
function sampleReport(input: CreateTacticalAgencyReportInput): TacticalAgencyAuditReport {
  return {
    contractVersion: "phase81a-step02-v1",
    manifest: {
      worldSeeds: ["agency-001", "agency-002"],
      lowBlockSeedPrefix: input.seedPrefix,
      matchTacticsCalibrationVersion: "match-tactics-calibration-v1",
      workerCount: input.workerCount,
      checkpointMode: input.checkpointMode,
    },
    selections: {
      selectionCount: 1,
      formationShares: [{ formationKey: "4-4-2", count: 1, share: 1 }],
      distinctFormationCount: 1,
      topFormationShare: 1,
      tieDecidedShare: 1,
      noChoiceShare: 0,
      meanBestMinusSecond: 0,
      meanOutOfPositionSlots: 0,
    },
    roles: {
      playerCount: 22,
      roleShares: [{ role: "striker", count: 22, share: 1 }],
      absentRoles: ["attacking_midfielder"],
      undeclaredRoleCount: 0,
    },
    lowBlock: {
      matchesPerArm: 2,
      neutral: { created: 1.4, conceded: 1.2, opportunities: 12.86 },
      lowBlock: { created: 1.1, conceded: 1.2, opportunities: 13.96 },
      concededExpectedGoalsReduction: 0,
      ownLossPerConcededReduction: "no_reduction",
    },
    selectionsPerSecond: 2,
    selectionElapsedMilliseconds: 500,
  };
}
