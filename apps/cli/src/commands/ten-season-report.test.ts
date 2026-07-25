import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { availableParallelism, tmpdir } from "node:os";
import { join } from "node:path";
import { createTranslator } from "@game/i18n";
import { test } from "vitest";

import {
  DEFAULT_TEN_SEASON_REPORT_SEED,
  runTenSeasonReportCommand,
} from "./ten-season-report.ts";
import { createResumableLongRunGateReport } from "./ten-season-report/gate-checkpoint.ts";
import {
  createLongRunGateReport,
  resolveLongRunGateWorkerCount,
} from "./ten-season-report/report-data.ts";

test("ten-season-report uses deterministic default arguments", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand([], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Seed: ${DEFAULT_TEN_SEASON_REPORT_SEED}`), true);
  assert.equal(io.stdoutLines.includes("Seasons: 10"), true);
  assert.equal(countSeasonSummaryRows(io.stdoutLines), 10);
  assert.equal(
    io.stdoutLines.some((line) => line.includes("last_pts=") && line.includes("table_spread=") && line.includes("draw_rate=")),
    true,
  );
  assert.equal(io.stdoutLines.includes("Player evolution:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Current ability avg:"), true);
  assert.equal(io.stdoutLines.includes("Production leaders:"), true);
  assert.equal(io.stdoutLines.some((line) => line.includes("Top creator=") && line.includes("creator_club=")), true);
  assert.equal(io.stdoutLines.includes("Strength hierarchy:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Initial ability spread:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Final ability spread:"), true);
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
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Active players min/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth roster min/avg/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth intake:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth exits:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth promotions:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs above youth target:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Youth checks:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Contract and finance stability:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Annual wage utilization max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Contract lifecycle:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Anomaly scoring:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  top_assist_max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  clubs_below_minimum_squad_size:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  youth_roster_max_size:"), true);
}, 90_000);

// Runs two full 2-season simulations back to back; the default 5s test timeout
// is too tight for this heavy determinism check under concurrent suite load.
// These gate tests now also advance the AI transfer market (the report harness
// threads real transfer windows), which roughly doubles their cost, so the
// budgets below stay generous enough to survive a loaded `pnpm check` run.
test("same seed and season count produce the same report output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=world-a", "--seasons=2"];

  assert.equal(await runTenSeasonReportCommand(args, first), 0);
  assert.equal(await runTenSeasonReportCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
}, 90_000);

test("ten-season-report respects explicit season count", async () => {
  const io = captureIo();

  assert.equal(await runTenSeasonReportCommand(["--seed=world-b", "--seasons=3"], io), 0);
  assert.equal(io.stdoutLines.includes("Seasons: 3"), true);
  assert.equal(countSeasonSummaryRows(io.stdoutLines), 3);
  assert.equal(io.stdoutLines.some((line) => line.includes("world-b-season-003")), true);
});

test("ten-season-report keeps role-weighted player quality diagnostics deterministic", async () => {
  const io = captureIo();

  assert.equal(await runTenSeasonReportCommand(["--seed=world-a", "--seasons=1"], io), 0);
  assert.equal(io.stdoutLines.includes("  Current ability avg: 8.20 -> 8.20"), true);
  assert.equal(
    io.stdoutLines.includes("  Initial ability spread: spread=2.57 top=A.C. Lecco:10.07 bottom=U.S. Turin:7.50"),
    true,
  );
  assert.equal(
    io.stdoutLines.includes("  Final ability spread: spread=2.57 top=A.C. Lecco:10.07 bottom=U.S. Turin:7.50"),
    true,
  );
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
    assert.equal(hasLineStartingWith(first.stdoutLines, "Table spread avg/min:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Draw rate avg/max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Champion streak max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Production warning max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Youth roster max observed:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Active players min/max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Clubs above youth target:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Contract/finance structural violations:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Annual wage utilization max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Contract lifecycle:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Execution:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Warning check counts:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Signal check counts:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Failing check counts:"), true);
    assert.equal(first.stdoutLines.some((line) => line.includes("creator_snapshot=season:")), true);
    assert.equal(
      first.stdoutLines.some(
        (line) => line.includes("table_spread=avg:") && line.includes("ability_spread:") && line.includes("draw_rate=avg:"),
      ),
      true,
    );
    assert.equal(firstReport.includes("Worlds: 2"), true);
    assert.equal(firstReport.includes("Table spread average:"), true);
    assert.equal(firstReport.includes("Draw rate average:"), true);
    assert.equal(firstReport.includes("Champion streak max observed:"), true);
    assert.equal(firstReport.includes("Production warning max:"), true);
    assert.equal(firstReport.includes("Production Warning Snapshots"), true);
    assert.equal(firstReport.includes("Dynasty Warning Snapshots"), true);
    assert.equal(firstReport.includes("Table Spread Warning Snapshots"), true);
    assert.equal(firstReport.includes("Youth roster max observed:"), true);
    assert.equal(firstReport.includes("Active player count min/max:"), true);
    assert.equal(firstReport.includes("Contract/finance structural violations:"), true);
    assert.equal(firstReport.includes("Maximum annual wage utilization:"), true);
    assert.equal(firstReport.includes("Contract lifecycle:"), true);
    assert.equal(firstReport.includes("Execution:"), true);
    assert.equal(firstReport.includes("Warning check counts:"), true);
    assert.equal(firstReport.includes("Signal check counts:"), true);
    assert.equal(firstReport.includes("Warn checks"), true);
    assert.equal(firstReport.includes("Creator snapshot"), true);
    assert.equal(firstReport.includes("Table spread snapshot"), true);
    assert.equal(firstReport.includes(`--report-output=${reportPath}`), true);
    assert.equal(firstReport.includes("phase31-test-world-00001"), true);
  } finally {
    await rm(directoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("multi-world gate partitions produce the same world summaries as the sequential runner", async () => {
  const text = createTranslator("en");
  const sequential = await createLongRunGateReport({
    seedPrefix: "phase75-partition-test",
    worldCount: 3,
    seasonCount: 1,
    text,
    language: "en",
    workerCount: 1,
  });
  const partitioned = await createLongRunGateReport({
    seedPrefix: "phase75-partition-test",
    worldCount: 3,
    seasonCount: 1,
    text,
    language: "en",
    workerCount: 2,
  });

  assert.equal(partitioned.execution.mode, "parallel");
  assert.equal(partitioned.execution.workerCount, 2);
  assert.deepEqual(partitioned.worstWorlds, sequential.worstWorlds);
  assert.deepEqual(partitioned.productionWarningWorlds, sequential.productionWarningWorlds);
  assert.deepEqual(partitioned.dynastyWarningWorlds, sequential.dynastyWarningWorlds);
  assert.deepEqual(partitioned.tableSpreadWarningWorlds, sequential.tableSpreadWarningWorlds);
  assert.deepEqual(partitioned.warningCheckCounts, sequential.warningCheckCounts);
  assert.deepEqual(partitioned.failingCheckCounts, sequential.failingCheckCounts);
});

test("resumable gate reuses complete deterministic shards without changing aggregate results", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-checkpoints-"));
  const input = {
    seedPrefix: "phase78-resume-test",
    worldCount: 2,
    seasonCount: 1,
    language: "en" as const,
    checkpointDirectoryPath,
    shardCount: 2,
    workerCount: 1,
  };

  try {
    const first = await createResumableLongRunGateReport(input);
    const resumed = await createResumableLongRunGateReport(input);
    const { execution: firstExecution, ...firstAggregate } = first;
    const { execution: resumedExecution, ...resumedAggregate } = resumed;

    assert.equal(firstExecution.mode, "sharded");
    assert.equal(firstExecution.resumedShardCount, 0);
    assert.equal(resumedExecution.mode, "sharded");
    assert.equal(resumedExecution.resumedShardCount, 2);
    assert.deepEqual(resumedExecution.partitionHashes, firstExecution.partitionHashes);
    assert.deepEqual(resumedAggregate, firstAggregate);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("resumable multi-world shards preserve the canonical sequential hash", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-multi-world-"));
  const text = createTranslator("en");

  try {
    const sequential = await createLongRunGateReport({
      seedPrefix: "phase78-multi-world-hash-test",
      worldCount: 3,
      seasonCount: 1,
      text,
      language: "en",
      workerCount: 1,
    });
    const sharded = await createResumableLongRunGateReport({
      seedPrefix: "phase78-multi-world-hash-test",
      worldCount: 3,
      seasonCount: 1,
      language: "en",
      checkpointDirectoryPath,
      shardCount: 1,
      workerCount: 2,
    });
    const { execution: sequentialExecution, ...sequentialAggregate } = sequential;
    const { execution: shardedExecution, ...shardedAggregate } = sharded;

    assert.deepEqual(shardedExecution.partitionHashes, sequentialExecution.partitionHashes);
    assert.deepEqual(shardedAggregate, sequentialAggregate);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("resumable gates parallelize explicit shards without the small-sample threshold", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-parallel-"));
  const shardCount = 2;

  try {
    const report = await createResumableLongRunGateReport({
      seedPrefix: "phase78-parallel-shard-test",
      worldCount: shardCount,
      seasonCount: 1,
      language: "en",
      checkpointDirectoryPath,
      shardCount,
    });
    const expectedWorkerCount = resolveLongRunGateWorkerCount({
      worldCount: shardCount,
      workerCount: Math.max(1, availableParallelism() - 1),
    });

    assert.equal(report.execution.workerCount, expectedWorkerCount);
    assert.equal(report.execution.shardCount, shardCount);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("resumable gate rejects a corrupted shard instead of trusting partial evidence", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-corrupt-"));
  const input = {
    seedPrefix: "phase78-corrupt-test",
    worldCount: 1,
    seasonCount: 1,
    language: "en" as const,
    checkpointDirectoryPath,
    shardCount: 1,
    workerCount: 1,
  };

  try {
    await createResumableLongRunGateReport(input);
    const [checkpointFilename] = await readdir(checkpointDirectoryPath);
    assert.notEqual(checkpointFilename, undefined);

    const checkpointPath = join(checkpointDirectoryPath, checkpointFilename!);
    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8")) as Record<string, unknown>;
    checkpoint.summaryHash = "corrupt";
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateReport(input),
      /checkpoint hash mismatch/,
    );
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("ten-season-report wires an explicit worker limit into resumable gates", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-workers-"));
  const io = captureIo();

  try {
    await runTenSeasonReportCommand([
      "--seed-prefix=phase78-worker-cli-test",
      "--worlds=1",
      "--seasons=1",
      `--checkpoint-dir=${checkpointDirectoryPath}`,
      "--shards=1",
      "--workers=1",
    ], io);

    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines.some((line) => line.includes("Execution: sharded; workers=1")), true);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

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

test("ten-season-report rejects an invalid worker count", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--workers=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--workers requires a positive integer: 0");
});

test("ten-season-report requires checkpoints for an explicit worker limit", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--worlds=1", "--workers=1"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--workers requires --checkpoint-dir");
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
