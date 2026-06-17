import assert from "node:assert/strict";
import { test } from "vitest";

import {
  DEFAULT_BALANCE_REPORT_SEASON_COUNT,
  DEFAULT_BALANCE_REPORT_SEED_PREFIX,
  runBalanceReportCommand,
} from "./balance-report.ts";

/**
 * CLI balance-report tests exercise deterministic output and strict failures
 * through injected IO rather than spawning a child process.
 */

test("balance-report uses deterministic default arguments", async () => {
  const io = captureIo();
  const exitCode = await runBalanceReportCommand([], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Seed prefix: ${DEFAULT_BALANCE_REPORT_SEED_PREFIX}`), true);
  assert.equal(io.stdoutLines.includes(`Seasons: ${DEFAULT_BALANCE_REPORT_SEASON_COUNT}`), true);
  assert.equal(io.stdoutLines.includes("Status: PASS"), true);
});

test("same seed prefix and season count produce same report output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed-prefix=repeatable-balance", "--seasons=2"];

  assert.equal(await runBalanceReportCommand(args, first), 0);
  assert.equal(await runBalanceReportCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("balance-report emits all required metrics", async () => {
  const io = captureIo();

  assert.equal(await runBalanceReportCommand(["--seed-prefix=metric-list", "--seasons=1"], io), 0);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Goals per match"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Home win rate"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Draw rate"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Away win rate"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "First-place points"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Last-place points"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Upset proxy rate"), true);
});

test("strict mode exits nonzero when report is outside targets", async () => {
  const io = captureIo();
  const exitCode = await runBalanceReportCommand(
    ["--seed-prefix=strict-smoke", "--seasons=1", "--target-profile=strict-fail-smoke", "--strict"],
    io,
  );

  assert.equal(exitCode, 1);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes("Status: FAIL"), true);
  assert.equal(hasLineEndingWith(io.stdoutLines, "FAIL"), true);
});

test("calibration-v1 profile is accepted and exposes the current balance gap", async () => {
  const io = captureIo();
  const exitCode = await runBalanceReportCommand(
    ["--seed-prefix=balance-demo", "--seasons=3", "--target-profile=calibration-v1", "--strict"],
    io,
  );

  assert.equal(exitCode, 1);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes("Target profile: calibration-v1"), true);
  assert.equal(io.stdoutLines.includes("Status: FAIL"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Goals per match"), true);
  assert.equal(hasLineEndingWith(io.stdoutLines, "FAIL"), true);
});

test("calibration-v1 passes the tuned twenty-season calibration sample", async () => {
  const io = captureIo();
  const exitCode = await runBalanceReportCommand(
    ["--seed-prefix=test-balance", "--seasons=20", "--target-profile=calibration-v1", "--strict"],
    io,
  );

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes("Target profile: calibration-v1"), true);
  assert.equal(io.stdoutLines.includes("Status: PASS"), true);
});

test("balance-report exits nonzero on invalid args", async () => {
  const io = captureIo();
  const exitCode = await runBalanceReportCommand(["--seasons=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--seasons requires a positive integer: 0");
});

/**
 * Creates an IO adapter that records written lines for assertions.
 */
function captureIo() {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];

  return {
    stdoutLines,
    stderrLines,
    stdout: (line: string) => {
      stdoutLines.push(line);
    },
    stderr: (line: string) => {
      stderrLines.push(line);
    },
  };
}

/**
 * Checks whether any output line starts with a prefix.
 */
function hasLineStartingWith(lines: readonly string[], prefix: string): boolean {
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether any output line ends with a suffix.
 */
function hasLineEndingWith(lines: readonly string[], suffix: string): boolean {
  for (const line of lines) {
    if (line.endsWith(suffix)) {
      return true;
    }
  }

  return false;
}
