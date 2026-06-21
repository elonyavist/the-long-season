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
    assert.equal(inspectIo.stdoutLines.some((line) => /^Selected club transfer funds: EUR [0-9]+\.[0-9]{2}$/.test(line)), true);
    assert.equal(inspectIo.stdoutLines.includes("Transfer history:"), true);
    assert.equal(
      inspectIo.stdoutLines.some((line) =>
        /^  1\. [A-Za-z]+ [A-Za-z]+: PRO18 -> PRO01; fee: EUR [0-9]+\.[0-9]{2}; date: 2026-08-01$/.test(line)
      ),
      true,
    );
    assert.equal(inspectIo.stdoutLines.some((line) => /Player[0-9]{2} No[0-9]{2}/.test(line)), false);
    assert.equal(inspectIo.stdoutLines.includes("Affected clubs:"), true);
    assert.equal(inspectIo.stdoutLines.some((line) => /^  PRO01: roster size=23 budget=EUR [0-9]+\.[0-9]{2}$/.test(line)), true);
    assert.equal(inspectIo.stdoutLines.some((line) => /^  PRO18: roster size=21 budget=EUR [0-9]+\.[0-9]{2}$/.test(line)), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command creates and writes a new seeded career world", async () => {
  const directoryPath = await createTempSaveDirectory();
  const io = captureIo();

  try {
    const exitCode = await runCareerCommand(
      ["--seed=world-a", "--save=career-world-a", "--new-world-preview"],
      io,
      { storageDirectoryPath: directoryPath },
    );
    const storage = new JsonCareerStorage({ directoryPath });
    const loaded = await storage.loadCareer("save:career-world-a" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines[0], "The Long Season new career world");
    assert.equal(io.stdoutLines.includes("Seed: world-a"), true);
    assert.equal(io.stdoutLines.includes("World seed: world-a"), true);
    assert.equal(io.stdoutLines.includes("Generator version: 1"), true);
    assert.equal(io.stdoutLines.includes("Save: save:career-world-a"), true);
    assert.equal(io.stdoutLines.includes("Selected club: PRO01"), true);
    assert.equal(io.stdoutLines.includes("Generated squad size: 22"), true);
    assert.equal(io.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(io.stdoutLines.includes("Nationality summary:"), true);
    assert.equal(io.stdoutLines.includes("Age summary:"), true);
    assert.equal(io.stdoutLines.includes("Prospect summary:"), true);
    assert.equal(loaded.careerWorld?.worldSeed, "world-a");
    assert.equal(loaded.careerWorld?.generatorVersion, 1);
    assert.equal(loaded.selectedClubId, "club:province-01");
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command varies generated worlds by seed and keeps inspect stable", async () => {
  const directoryPath = await createTempSaveDirectory();
  const worldAIo = captureIo();
  const worldBIo = captureIo();
  const inspectIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-world-a", "--new-world-preview"], worldAIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--seed=world-b", "--save=career-world-b", "--new-world-preview"], worldBIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const worldA = await storage.loadCareer("save:career-world-a" as Parameters<typeof storage.loadCareer>[0]);
    const worldB = await storage.loadCareer("save:career-world-b" as Parameters<typeof storage.loadCareer>[0]);
    const selectedClubA = worldA.gameState.clubs[worldA.selectedClubId];
    const selectedClubB = worldB.gameState.clubs[worldB.selectedClubId];
    const namesA = selectedClubA?.playerIds.map((playerId) => {
      const player = worldA.gameState.players[playerId];
      return `${player?.firstName ?? ""} ${player?.lastName ?? ""}`;
    }).join("|");
    const namesB = selectedClubB?.playerIds.map((playerId) => {
      const player = worldB.gameState.players[playerId];
      return `${player?.firstName ?? ""} ${player?.lastName ?? ""}`;
    }).join("|");

    assert.notEqual(namesA, namesB);

    const exitCode = await runCareerCommand(["--save=career-world-a", "--inspect"], inspectIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(inspectIo.stderrLines.length, 0);
    assert.equal(inspectIo.stdoutLines.includes("World seed: world-a"), true);
    assert.equal(inspectIo.stdoutLines.includes("Generator version: 1"), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club: PRO01"), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club roster size: 22"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes new career world output in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const io = captureIo();

  try {
    const exitCode = await runCareerCommand(
      ["--seed=mondo-it", "--save=carriera-mondo", "--new-world-preview", "--lang=it"],
      io,
      { storageDirectoryPath: directoryPath },
    );

    assert.equal(exitCode, 0);
    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines[0], "The Long Season nuovo mondo carriera");
    assert.equal(io.stdoutLines.includes("Seed mondo: mondo-it"), true);
    assert.equal(io.stdoutLines.includes("Versione generatore: 1"), true);
    assert.equal(io.stdoutLines.includes("Dimensione rosa generata: 22"), true);
    assert.equal(io.stdoutLines.includes("Salvataggio carriera scritto: si"), true);
    assert.equal(io.stdoutLines.includes("Riepilogo eta:"), true);
    assert.equal(io.stdoutLines.includes("Riepilogo prospetti:"), true);
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
  assert.equal(
    missingMode.stderrLines[0],
    "choose exactly one career action: --apply-market-demo, --inspect, or --new-world-preview",
  );

  assert.equal(
    await runCareerCommand(["--save=career-demo", "--inspect", "--apply-market-demo=pro01-affordable-permanent"], conflictingMode),
    1,
  );
  assert.equal(conflictingMode.stdoutLines.length, 0);
  assert.equal(conflictingMode.stderrLines[0], "career actions cannot be combined");
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
