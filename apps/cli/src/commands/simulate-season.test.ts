import assert from "node:assert/strict";
import { test } from "vitest";

import { DEFAULT_SIMULATE_SEASON_SEED, runSimulateSeasonCommand } from "./simulate-season.ts";

/**
 * CLI simulate-season tests exercise argument parsing and deterministic output
 * through injected IO rather than spawning a child process.
 */

test("simulate-season accepts --seed with equals syntax", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=custom-seed"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes("Seed: custom-seed"), true);
  assert.equal(io.stdoutLines.includes("Final table:"), true);
});

test("simulate-season accepts --seed with separate value", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed", "separate-seed"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes("Seed: separate-seed"), true);
});

test("simulate-season uses the fixed default seed", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand([], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes(`Seed: ${DEFAULT_SIMULATE_SEASON_SEED}`), true);
});

test("same seed produces same CLI output", async () => {
  const first = captureIo();
  const second = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-cli"], first), 0);
  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-cli"], second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season prints a real top scorer", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001"], io);
  const topScorerLine = io.stdoutLines.find((line) => line.startsWith("Top scorer: "));

  assert.equal(exitCode, 0);
  assert.notEqual(topScorerLine, undefined);
  assert.notEqual(topScorerLine, "Top scorer: unavailable in aggregate engine v1");
  assert.match(topScorerLine ?? "", /^Top scorer: Player[0-9]{2} No[0-9]{2} \(PRO[0-9]{2}\) - [0-9]+ goals$/);
});

test("simulate-season can print one round's fixture results", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--seed=demo-001", "--round=1"], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stdoutLines.includes("Round 1 fixtures:"), true);
  assert.equal(io.stdoutLines.some((line) => /^fixture:[0-9]{6} PRO[0-9]{2} [0-9]+-[0-9]+ PRO[0-9]{2}$/.test(line)), true);
  assert.equal(io.stdoutLines.some((line) => line.startsWith("  Scorers: ")), true);
});

test("same seed and round produce same fixture detail output", async () => {
  const first = captureIo();
  const second = captureIo();

  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-round", "--round=2"], first), 0);
  assert.equal(await runSimulateSeasonCommand(["--seed=repeatable-round", "--round=2"], second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
});

test("simulate-season rejects invalid round arguments", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--round=abc"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--round requires a positive integer value");
});

test("simulate-season exits nonzero for a missing round", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--round=999"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "Round not found: 999");
});

test("simulate-season exits nonzero on invalid args", async () => {
  const io = captureIo();
  const exitCode = await runSimulateSeasonCommand(["--unknown"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "Unknown argument: --unknown");
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
