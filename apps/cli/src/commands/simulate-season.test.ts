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
