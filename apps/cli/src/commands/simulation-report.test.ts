import assert from "node:assert/strict";
import { test } from "vitest";

import { createSimulationReportArtifact } from "@game/simulation-tools";

import {
  parseSimulationReportArgs,
  runSimulationReportCommand,
  type SimulationReportCommandDependencies,
} from "./simulation-report.ts";
import { SIMULATION_REPORT_RECIPES } from "./simulation-report/report-registry.ts";

test("discovery modes are registry-derived and execute no simulation", async () => {
  for (const args of [
    ["--help"],
    ["--list-modules"],
    ["--list-profiles"],
    ["--describe-module=season"],
    ["--describe-profile=phase81a-a2"],
  ]) {
    const run = await commandRun(args);
    assert.equal(run.exitCode, 0, args.join(" "));
    assert.equal(run.createCalls, 0, args.join(" "));
    assert.notEqual(run.stdout.join("\n").length, 0);
  }
});

test("every commented help recipe parses", () => {
  for (const recipe of SIMULATION_REPORT_RECIPES) {
    assert.equal(parseSimulationReportArgs(recipe.args).ok, true, recipe.args.join(" "));
  }
});

test("explain-plan normalizes without creating a world", async () => {
  const run = await commandRun([
    "--worlds=1",
    "--seasons=1",
    "--include=season",
    "--explain-plan",
  ]);
  assert.equal(run.exitCode, 0);
  assert.equal(run.createCalls, 0);
  assert.match(run.stdout.join("\n"), /career_world/);
});

test("locked profile overrides and invalid module IDs fail closed", async () => {
  const override = await commandRun(["--profile=phase81a-a2", "--worlds=6"]);
  assert.equal(override.exitCode, 1);
  assert.equal(override.createCalls, 0);

  const invalid = await commandRun(["--include=seazon"]);
  assert.equal(invalid.exitCode, 1);
  assert.equal(invalid.createCalls, 0);
});

test("presentation format never reaches the measurement request", async () => {
  const consoleRun = await commandRun(["--include=season", "--format=console"]);
  const jsonRun = await commandRun(["--include=season", "--format=json", "--lang=it"]);
  assert.deepEqual(jsonRun.measurements, consoleRun.measurements);
  assert.equal(jsonRun.hashes[0], consoleRun.hashes[0]);
});

test("a canonical FAIL controls the process exit code", async () => {
  const run = await commandRun(["--include=season"], "FAIL");
  assert.equal(run.exitCode, 1);
  assert.equal(run.createCalls, 1);
});

test("report output writes the selected adapter instead of resimulating", async () => {
  const run = await commandRun([
    "--include=season",
    "--format=markdown",
    "--report-output=simulation-out/test.md",
  ]);
  assert.equal(run.createCalls, 1);
  assert.equal(run.written[0]?.path, "simulation-out/test.md");
  assert.match(run.written[0]?.contents ?? "", /## season/);
});

test("render-only rebuilds HTML from canonical JSON without simulation", async () => {
  const run = await commandRun([
    "--from-report=simulation-out/source.json",
    "--format=html",
    "--report-output=simulation-out/report.html",
  ]);

  assert.equal(run.exitCode, 0);
  assert.equal(run.createCalls, 0);
  assert.match(run.written[0]?.contents ?? "", /Simulation Ledger/);
  assert.match(run.written[0]?.contents ?? "", /simulation-report-json/);
});

test("render-only refuses measurement overrides and HTML refuses localization", async () => {
  const override = await commandRun([
    "--from-report=simulation-out/source.json",
    "--worlds=2",
  ]);
  assert.equal(override.exitCode, 1);
  assert.equal(override.createCalls, 0);

  const localized = await commandRun([
    "--from-report=simulation-out/source.json",
    "--format=html",
    "--lang=it",
  ]);
  assert.equal(localized.exitCode, 1);
  assert.equal(localized.createCalls, 0);
});

async function commandRun(
  args: readonly string[],
  decision: "PASS" | "FAIL" = "PASS",
): Promise<{
  readonly exitCode: number;
  readonly stdout: readonly string[];
  readonly createCalls: number;
  readonly written: readonly { path: string; contents: string }[];
  readonly measurements: readonly unknown[];
  readonly hashes: readonly string[];
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const written: { path: string; contents: string }[] = [];
  const measurements: unknown[] = [];
  const hashes: string[] = [];
  let createCalls = 0;
  const dependencies: SimulationReportCommandDependencies = {
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
    writeReport: async (path, contents) => {
      written.push({ path, contents });
    },
    readReport: async () => JSON.stringify(createFixtureArtifact()),
    createReport: async (plan) => {
      createCalls += 1;
      measurements.push(plan.measurementRequest);
      const artifact = createSimulationReportArtifact({
        measurementRequest: plan.measurementRequest,
        manifest: {
          worldSeeds: ["test-world"],
          executionNodes: plan.executionNodes,
          calibrationVersions: { test: "v1" },
        },
        sections: [
          { id: "season", status: "observed", data: { completed: true } },
          { id: "tactical_agency", status: "not_requested", reason: "not requested" },
          { id: "tactical_shape", status: "not_requested", reason: "not requested" },
        ],
        decision,
      });
      hashes.push(artifact.reportHash);
      return artifact;
    },
  };
  const exitCode = await runSimulationReportCommand(args, dependencies);
  return { exitCode, stdout, createCalls, written, measurements, hashes };
}

function createFixtureArtifact() {
  return createSimulationReportArtifact({
    measurementRequest: {
      mode: "custom",
      profileId: null,
      worldCount: 1,
      seasonCount: 1,
      includedSectionIds: ["season"],
      detail: "standard",
      seedPrefix: "render-only-test",
      workerCount: 1,
    },
    manifest: {
      worldSeeds: ["render-only-test-world-00001"],
      executionNodes: [{ key: "career_world", depth: "career" }],
      calibrationVersions: { test: "v1" },
    },
    sections: [{ id: "season", status: "observed", data: { worlds: [] } }],
    decision: "PASS",
  });
}
