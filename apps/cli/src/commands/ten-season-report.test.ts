import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  DEFAULT_TEN_SEASON_REPORT_SEED,
  runTenSeasonReportCommand,
} from "./ten-season-report.ts";

test("ten-season-report uses deterministic default arguments", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand([], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Seed: ${DEFAULT_TEN_SEASON_REPORT_SEED}`), true);
  assert.equal(io.stdoutLines.includes("Seasons: 10"), true);
  assert.equal(countSeasonSummaryRows(io.stdoutLines), 10);
  assert.equal(io.stdoutLines.includes("Player evolution:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Current ability avg:"), true);
  assert.equal(io.stdoutLines.includes("Production leaders:"), true);
  assert.equal(io.stdoutLines.includes("Club stability:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Unique champions:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Transfer turnover: enabled"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Squad turnover: enabled"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Player exits:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Exit reasons:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Squad size min/avg/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs below minimum squad size:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs without natural goalkeeper:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Youth academy stability:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Active players senior/youth/total:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth roster min/avg/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth intake:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth exits:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth promotions:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs above youth target:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Youth checks:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Anomaly scoring:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  top_assist_max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  clubs_below_minimum_squad_size:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  youth_roster_max_size:"), true);
});

test("same seed and season count produce the same report output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=world-a", "--seasons=2"];

  assert.equal(await runTenSeasonReportCommand(args, first), 0);
  assert.equal(await runTenSeasonReportCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("ten-season-report respects explicit season count", async () => {
  const io = captureIo();

  assert.equal(await runTenSeasonReportCommand(["--seed=world-b", "--seasons=3"], io), 0);
  assert.equal(io.stdoutLines.includes("Seasons: 3"), true);
  assert.equal(countSeasonSummaryRows(io.stdoutLines), 3);
  assert.equal(io.stdoutLines.some((line) => line.includes("world-b-season-003")), true);
});

test("ten-season-report writes deterministic multi-world gate reports", async () => {
  const directoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-"));

  try {
    const first = captureIo();
    const second = captureIo();
    const reportPath = join(directoryPath, "gate.md");
    const args = ["--seed-prefix=phase31-test", "--worlds=2", "--seasons=2", `--report-output=${reportPath}`];

    const firstExitCode = await runTenSeasonReportCommand(args, first);
    const firstReport = await readFile(reportPath, "utf8");
    const secondExitCode = await runTenSeasonReportCommand(args, second);
    const secondReport = await readFile(reportPath, "utf8");

    assert.equal(firstExitCode, secondExitCode);
    assert.deepEqual(first.stdoutLines, second.stdoutLines);
    assert.equal(firstReport, secondReport);
    assert.equal(first.stdoutLines.includes("The Long Season long-run gate report"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Worlds: 2"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Youth roster max observed:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Clubs above youth target:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Warning check counts:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Failing check counts:"), true);
    assert.equal(firstReport.includes("Worlds: 2"), true);
    assert.equal(firstReport.includes("Youth roster max observed:"), true);
    assert.equal(firstReport.includes("Warning check counts:"), true);
    assert.equal(firstReport.includes("Warn checks"), true);
    assert.equal(firstReport.includes("phase31-test-world-00001"), true);
  } finally {
    await rm(directoryPath, { recursive: true, force: true });
  }
});

test("ten-season-report exits nonzero on invalid season count", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--seasons=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--seasons requires a positive integer: 0");
});

test("ten-season-report exits nonzero on invalid world count", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--worlds=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--worlds requires a positive integer: 0");
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
 * Counts numbered season summary rows in the command output.
 */
function countSeasonSummaryRows(lines: readonly string[]): number {
  return lines.filter((line) => /^  [0-9]+\. .*-season-[0-9]{3}/.test(line)).length;
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
