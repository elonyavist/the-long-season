import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import { JsonCareerStorage } from "@game/storage";

import { runCareerCommand } from "./career.ts";

/**
 * Career command tests exercise durable market application through injected IO
 * and an isolated career-save directory.
 */

test("career command applies and writes an accepted permanent-transfer demo", async () => {
  const directoryPath = await createTempSaveDirectory();
  const io = captureIo();

  try {
    const exitCode = await runCareerCommand(
      ["--seed=demo-001", "--save=career-demo", "--apply-market-demo=pro01-affordable-permanent"],
      io,
      { storageDirectoryPath: directoryPath },
    );
    const storage = new JsonCareerStorage({ directoryPath });
    const loaded = await storage.loadCareer("save:career-demo" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines[0], "The Long Season career market apply");
    assert.equal(io.stdoutLines.includes("Save: save:career-demo"), true);
    assert.equal(io.stdoutLines.includes("Market demo: pro01-affordable-permanent"), true);
    assert.equal(io.stdoutLines.includes("Status: accepted"), true);
    assert.equal(io.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(io.stdoutLines.includes("Transfer history entries: 1"), true);
    assert.equal(io.stdoutLines.includes("  Buying club: 22 -> 23"), true);
    assert.equal(io.stdoutLines.includes("  Selling club: 22 -> 21"), true);
    assert.equal(loaded.transferHistory.length, 1);
    assert.equal(loaded.gameState.clubs[loaded.selectedClubId]?.playerIds.length, 23);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command does not write rejected permanent-transfer demos", async () => {
  const directoryPath = await createTempSaveDirectory();
  const io = captureIo();

  try {
    const exitCode = await runCareerCommand(
      ["--seed=demo-001", "--save=career-demo-rejected", "--apply-market-demo=pro01-star-rejected"],
      io,
      { storageDirectoryPath: directoryPath },
    );
    const storage = new JsonCareerStorage({ directoryPath });

    assert.equal(exitCode, 0);
    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines.includes("Status: rejected"), true);
    assert.equal(io.stdoutLines.includes("Career save written: no"), true);
    assert.equal(io.stdoutLines.includes("Transfer history entries: 0"), true);
    assert.equal(io.stdoutLines.includes("  player does not want this move"), true);
    await assert.rejects(
      () => storage.loadCareer("save:career-demo-rejected" as Parameters<typeof storage.loadCareer>[0]),
      (error: unknown) => error instanceof Error && error.name === "StorageError",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes accepted apply output in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const io = captureIo();

  try {
    const exitCode = await runCareerCommand(
      ["--seed=demo-001", "--save=career-demo", "--apply-market-demo=pro01-affordable-permanent", "--lang=it"],
      io,
      { storageDirectoryPath: directoryPath },
    );

    assert.equal(exitCode, 0);
    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines[0], "The Long Season applica mercato carriera");
    assert.equal(io.stdoutLines.includes("Salvataggio: save:career-demo"), true);
    assert.equal(io.stdoutLines.includes("Stato: accettato"), true);
    assert.equal(io.stdoutLines.includes("Salvataggio carriera scritto: si"), true);
    assert.equal(io.stdoutLines.includes("Voci storico trasferimenti: 1"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command inspects persisted career state", async () => {
  const directoryPath = await createTempSaveDirectory();
  const applyIo = captureIo();
  const inspectIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(
        ["--seed=demo-001", "--save=career-demo", "--apply-market-demo=pro01-affordable-permanent"],
        applyIo,
        { storageDirectoryPath: directoryPath },
      ),
      0,
    );

    const exitCode = await runCareerCommand(["--save=career-demo", "--inspect"], inspectIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(inspectIo.stderrLines.length, 0);
    assert.equal(inspectIo.stdoutLines[0], "The Long Season career state");
    assert.equal(inspectIo.stdoutLines.includes("Save: save:career-demo"), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club: PRO01"), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club roster size: 23"), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club transfer funds: EUR 4470010.00"), true);
    assert.equal(inspectIo.stdoutLines.includes("Transfer history:"), true);
    assert.equal(
      inspectIo.stdoutLines.some((line) =>
        /^  1\. [A-Za-z]+ [A-Za-z]+: PRO18 -> PRO01; fee: EUR 1529990\.00; date: 2026-08-01$/.test(line)
      ),
      true,
    );
    assert.equal(inspectIo.stdoutLines.some((line) => /Player[0-9]{2} No[0-9]{2}/.test(line)), false);
    assert.equal(inspectIo.stdoutLines.includes("Affected clubs:"), true);
    assert.equal(inspectIo.stdoutLines.includes("  PRO01: roster size=23 budget=EUR 4470010.00"), true);
    assert.equal(inspectIo.stdoutLines.includes("  PRO18: roster size=21 budget=EUR 2029990.00"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command reports a missing career save during inspection", async () => {
  const directoryPath = await createTempSaveDirectory();
  const io = captureIo();

  try {
    const exitCode = await runCareerCommand(["--save=missing-career", "--inspect"], io, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 1);
    assert.equal(io.stdoutLines.length, 0);
    assert.equal(io.stderrLines[0], "career save not found: save:missing-career");
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command rejects missing required arguments", async () => {
  const missingSave = captureIo();
  const missingMode = captureIo();
  const conflictingMode = captureIo();

  assert.equal(await runCareerCommand(["--apply-market-demo=pro01-affordable-permanent"], missingSave), 1);
  assert.equal(missingSave.stdoutLines.length, 0);
  assert.equal(missingSave.stderrLines[0], "--save requires a non-empty value");

  assert.equal(await runCareerCommand(["--save=career-demo"], missingMode), 1);
  assert.equal(missingMode.stdoutLines.length, 0);
  assert.equal(missingMode.stderrLines[0], "choose exactly one career action: --apply-market-demo or --inspect");

  assert.equal(
    await runCareerCommand(["--save=career-demo", "--inspect", "--apply-market-demo=pro01-affordable-permanent"], conflictingMode),
    1,
  );
  assert.equal(conflictingMode.stdoutLines.length, 0);
  assert.equal(conflictingMode.stderrLines[0], "--inspect cannot be combined with --apply-market-demo");
});

interface CapturedIo {
  readonly stdoutLines: string[];
  readonly stderrLines: string[];
}

function captureIo(): CapturedIo & {
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

/** Creates an isolated temporary career-save directory for a test case. */
async function createTempSaveDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "the-long-season-cli-career-"));
}

/** Removes a temporary career-save directory after a test case. */
async function removeTempSaveDirectory(directoryPath: string): Promise<void> {
  await rm(directoryPath, { recursive: true, force: true });
}
