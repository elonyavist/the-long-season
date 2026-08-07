import assert from "node:assert/strict";
import { test } from "vitest";

import {
  DEFAULT_HARD_CAP_REACHABILITY_REPORT_PATH,
  formatHardCapReachabilityReportMarkdown,
  runHardCapReachabilityReportCommand,
  type HardCapReachabilityReportCommandDependencies,
} from "./hard-cap-reachability-report.ts";
import type {
  HardCapReachabilityProbeReport,
  HardCapReachabilityRow,
  HardCapReachabilityWorld,
} from "./hard-cap-reachability-report/probe-data.ts";

/**
 * These tests replace the hour-long corpus run with a supplied report.
 *
 * Everything they cover - argument parsing, the artifact path, the summary
 * lines and the exit code - is otherwise only observable after that hour, which
 * is a long way to travel to find a typo.
 */

const ROW: HardCapReachabilityRow = {
  seedPrefix: "phase81a-hardcap-a",
  worldSeed: "phase81a-hardcap-a-world-00001",
  snapshot: "closing",
  seasonStartYear: 2035,
  eligibleObservationCount: 4,
  eligibleExactHardCapCount: 1,
  maxEligiblePublicValueMinorUnits: 250_000_000,
  within100BasisPointsCount: 1,
  within500BasisPointsCount: 2,
  eligibleAboveHardCapCount: 0,
  ineligibleExactHardCapCount: 0,
  ineligibleRenderedAsHardCapCount: 0,
  calibrationVersionBundle: "valuationCurvesVersion=v7",
};

function world(mismatches: readonly string[]): HardCapReachabilityWorld {
  return {
    seedPrefix: ROW.seedPrefix,
    worldSeed: ROW.worldSeed,
    rows: [ROW],
    reconciliation: {
      worldSeed: ROW.worldSeed,
      fromRows: {
        eligibleObservationCount: 4,
        eligibleExactHardCapCount: 1,
        ineligibleExactHardCapCount: 0,
        ineligibleRenderedAsHardCapCount: 0,
      },
      fromAudit: {
        eligibleObservationCount: 4,
        eligibleExactHardCapCount: 1,
        ineligibleExactHardCapCount: 0,
        ineligibleRenderedAsHardCapCount: 0,
      },
      mismatches,
    },
  };
}

function probeReport(
  outcome: HardCapReachabilityProbeReport["outcome"],
): HardCapReachabilityProbeReport {
  return {
    worlds: [world(outcome === "RECONCILIATION_FAILED" ? ["eligibleObservationCount: rows=4 audit=9"] : [])],
    outcome,
    totals: {
      eligibleObservationCount: 4,
      eligibleExactHardCapCount: outcome === "NOT_FOUND" ? 0 : 1,
      ineligibleExactHardCapCount: 0,
      ineligibleRenderedAsHardCapCount: 0,
    },
    worldSeasonCount: 10,
    rowCount: 1,
  };
}

interface CommandRun {
  readonly exitCode: number;
  readonly stdoutLines: readonly string[];
  readonly stderrLines: readonly string[];
  readonly writes: readonly { readonly path: string; readonly contents: string }[];
  readonly probeRunCount: number;
}

async function runCommand(
  args: readonly string[],
  report: HardCapReachabilityProbeReport = probeReport("NOT_FOUND"),
): Promise<CommandRun> {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  const writes: { path: string; contents: string }[] = [];
  let probeRunCount = 0;
  const dependencies: HardCapReachabilityReportCommandDependencies = {
    runProbe: async (onWorldCompleted) => {
      probeRunCount += 1;
      onWorldCompleted("phase81a-hardcap-a-world-00001");
      return report;
    },
    writeArtifact: async (path, contents) => {
      writes.push({ path, contents });
    },
  };

  const exitCode = await runHardCapReachabilityReportCommand(
    args,
    { stdout: (line) => stdoutLines.push(line), stderr: (line) => stderrLines.push(line) },
    dependencies,
  );

  return { exitCode, stdoutLines, stderrLines, writes, probeRunCount };
}

test("a run with no arguments writes to the preregistered artifact path", async () => {
  const run = await runCommand([]);

  assert.equal(run.exitCode, 0);
  assert.equal(run.writes.length, 1);
  assert.equal(run.writes[0]?.path, DEFAULT_HARD_CAP_REACHABILITY_REPORT_PATH);
  assert.equal(run.probeRunCount, 1);
});

test("--report-output redirects the artifact without touching the corpus", async () => {
  const run = await runCommand(["--report-output=tmp/probe.md"]);

  assert.equal(run.exitCode, 0);
  assert.equal(run.writes[0]?.path, "tmp/probe.md");
});

test("an unknown argument fails before simulating anything", async () => {
  // The corpus is preregistered, so a rejected flag must not silently run the
  // declared one for an hour and then report a result nobody asked for.
  const run = await runCommand(["--seeds=phase31-test"]);

  assert.equal(run.exitCode, 1);
  assert.equal(run.probeRunCount, 0);
  assert.equal(run.writes.length, 0);
  assert.equal(run.stderrLines[0], "Unknown argument: --seeds=phase31-test");
});

test("an empty --report-output is refused rather than defaulted", async () => {
  const run = await runCommand(["--report-output="]);

  assert.equal(run.exitCode, 1);
  assert.equal(run.probeRunCount, 0);
});

test("progress is reported per world, so an hour-long run is not silent", async () => {
  const run = await runCommand([]);

  assert.ok(run.stdoutLines.some((line) => line.startsWith("Hard-cap reachability probe: 3 prefixes")));
  assert.ok(run.stdoutLines.includes("  World 1 complete: phase81a-hardcap-a-world-00001"));
});

test("FOUND and NOT_FOUND both exit zero because the probe is a measurement", async () => {
  const found = await runCommand([], probeReport("FOUND"));
  const notFound = await runCommand([], probeReport("NOT_FOUND"));

  assert.equal(found.exitCode, 0);
  assert.equal(notFound.exitCode, 0);
  assert.ok(found.stdoutLines.includes("Outcome: FOUND"));
  assert.ok(found.stdoutLines.includes("Eligible exact cap hits: 1"));
  assert.ok(notFound.stdoutLines.includes("Outcome: NOT_FOUND"));
});

test("--lang localizes the summary while keeping the declared outcome token", async () => {
  // The outcome name is the preregistration's, not prose: a reader comparing a
  // run against that document must see `FOUND` whatever the labels around it say.
  const run = await runCommand(["--lang=it"], probeReport("FOUND"));

  assert.equal(run.exitCode, 0);
  assert.ok(run.stdoutLines.includes("Esito: FOUND"));
  assert.ok(run.stdoutLines.includes("Colpi esatti sul tetto tra gli eleggibili: 1"));
  assert.ok(run.stdoutLines.some((line) => line.startsWith("Sonda di raggiungibilita del tetto:")));
  assert.ok(run.stdoutLines.includes("  Mondo 1 completato: phase81a-hardcap-a-world-00001"));
});

test("an unsupported --lang is refused before simulating anything", async () => {
  const run = await runCommand(["--lang=xx"]);

  assert.equal(run.exitCode, 1);
  assert.equal(run.probeRunCount, 0);
});

test("a reconciliation failure exits one and withholds the counts from the console", async () => {
  const run = await runCommand([], probeReport("RECONCILIATION_FAILED"));

  assert.equal(run.exitCode, 1);
  assert.ok(run.stdoutLines.includes("Outcome: RECONCILIATION_FAILED"));
  assert.ok(
    run.stdoutLines.some((line) => line.includes("eligibleObservationCount: rows=4 audit=9")),
  );
  assert.equal(
    run.stdoutLines.some((line) => line.startsWith("Eligible exact cap hits:")),
    false,
  );
});

test("the artifact withholds the same counts the console does and labels its rows", async () => {
  // The contradiction this test exists for: a console that says "unreliable"
  // beside a file that quotes a hit count leaves the file as the citable one.
  const markdown = formatHardCapReachabilityReportMarkdown(
    probeReport("RECONCILIATION_FAILED"),
    DEFAULT_HARD_CAP_REACHABILITY_REPORT_PATH,
  );

  assert.equal(markdown.includes("- Eligible exact cap hits:"), false);
  assert.ok(markdown.includes("- Cap counts: **withheld**"));
  assert.ok(markdown.includes("## Diagnostic Rows, Not Evidence"));
  assert.ok(markdown.includes("must not be cited as reachability evidence"));
  // The rows themselves survive: they are how the disagreement gets diagnosed.
  assert.ok(markdown.includes("phase81a-hardcap-a-world-00001"));
});

test("a reconciled artifact prints its totals and keeps the rows they came from", async () => {
  const markdown = formatHardCapReachabilityReportMarkdown(
    probeReport("FOUND"),
    DEFAULT_HARD_CAP_REACHABILITY_REPORT_PATH,
  );

  assert.ok(markdown.includes("- Eligible exact cap hits: 1"));
  assert.ok(markdown.includes("## Raw Rows"));
  assert.ok(markdown.includes("| phase81a-hardcap-a | `phase81a-hardcap-a-world-00001` | closing |"));
});
