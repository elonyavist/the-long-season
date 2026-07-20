import assert from "node:assert/strict";
import { test } from "vitest";

import { runLiveMatchControlReportCommand } from "./live-match-control-report.ts";

/** Tests the generated-content adapter through a complete progressive season. */

test("live-match-control-report completes and reproduces one generated season", () => {
  const io = captureIo();
  const exitCode = runLiveMatchControlReportCommand([
    "--worlds=1",
    "--seed-prefix=phase77-focused",
    "--compact",
  ], io);
  const report = JSON.parse(io.stdoutLines.join("")) as {
    readonly status: string;
    readonly worldCount: number;
    readonly fixtureCount: number;
    readonly failures: readonly unknown[];
    readonly reproducibility: { readonly checked: boolean; readonly matches: boolean };
    readonly distributions: {
      readonly penalties_awarded_per_match: { readonly count: number };
      readonly penalty_goals_per_match: { readonly count: number };
      readonly possession_percent: { readonly count: number };
    };
  };

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(report.status, "pass");
  assert.equal(report.worldCount, 1);
  assert.equal(report.fixtureCount, 306);
  assert.equal(report.failures.length, 0);
  assert.deepEqual(report.reproducibility, {
    checked: true,
    firstHash: (report.reproducibility as { readonly firstHash?: string }).firstHash,
    secondHash: (report.reproducibility as { readonly secondHash?: string }).secondHash,
    matches: true,
  });
  assert.equal(report.distributions.possession_percent.count, 612);
  assert.equal(report.distributions.penalties_awarded_per_match.count, 306);
  assert.equal(report.distributions.penalty_goals_per_match.count, 306);
}, 20_000);

test("live-match-control-report rejects invalid world counts before simulation", () => {
  const io = captureIo();

  assert.equal(runLiveMatchControlReportCommand(["--worlds=0"], io), 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.deepEqual(JSON.parse(io.stderrLines[0] ?? "{}"), {
    error: "--worlds requires a positive integer: 0",
  });
});

function captureIo(): {
  readonly stdoutLines: string[];
  readonly stderrLines: string[];
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
} {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  return {
    stdoutLines,
    stderrLines,
    stdout: (line) => stdoutLines.push(line),
    stderr: (line) => stderrLines.push(line),
  };
}
