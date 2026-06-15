import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import { gameDate, saveId, seasonId, type GameState } from "@game/domain";

import { StorageError } from "./game-storage.interface.ts";
import { JsonGameStorage } from "./json-game-storage.ts";

/**
 * JSON storage tests for the Phase 0/1 persistence boundary.
 */

test("save then load returns the same GameState snapshot", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonGameStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-15T10:00:00.000Z", "2026-06-15T11:00:00.000Z"),
  });
  const state = minimalGameState();

  try {
    const metadata = await storage.saveGame({
      saveId: saveId("save:round-trip"),
      name: "Round Trip",
      state,
    });
    const loaded = await storage.loadGame(saveId("save:round-trip"));

    assert.deepEqual(loaded, state);
    assert.equal(metadata.saveId, "save:round-trip");
    assert.equal(metadata.name, "Round Trip");
    assert.equal(metadata.createdAtISO, "2026-06-15T10:00:00.000Z");
    assert.equal(metadata.updatedAtISO, "2026-06-15T10:00:00.000Z");
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("listSaves returns metadata sorted deterministically by save ID", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonGameStorage({
    directoryPath,
    nowISO: fixedClock("2026-06-15T10:00:00.000Z", "2026-06-15T10:01:00.000Z"),
  });

  try {
    await storage.saveGame({
      saveId: saveId("save:zulu"),
      name: "Zulu",
      state: minimalGameState("zulu"),
    });
    await storage.saveGame({
      saveId: saveId("save:alpha"),
      name: "Alpha",
      state: minimalGameState("alpha"),
    });

    const metadata = await storage.listSaves();

    assert.deepEqual(
      metadata.map((save) => save.saveId),
      [saveId("save:alpha"), saveId("save:zulu")],
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("loading a missing save throws a typed storage error", async () => {
  const directoryPath = await createTempSaveDirectory();
  const storage = new JsonGameStorage({ directoryPath });

  try {
    await assert.rejects(
      () => storage.loadGame(saveId("save:missing")),
      (error: unknown) => error instanceof StorageError && error.code === "save_not_found",
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("storage imports no engine code", async () => {
  const sourceFiles = await listTypeScriptFiles(join("packages", "storage", "src"));

  for (const filePath of sourceFiles) {
    const contents = await readFile(filePath, "utf8");

    const enginePackageImport = /from\s+["']@game\/engine["']|import\(["']@game\/engine["']\)/;
    const enginePathReference = /from\s+["'][^"']*packages\/engine[^"']*["']/;

    assert.equal(enginePackageImport.test(contents), false, `${filePath} imports the engine package`);
    assert.equal(enginePathReference.test(contents), false, `${filePath} imports the engine package path`);
  }
});

/**
 * Builds the smallest valid game state needed to test persistence round-trips.
 */
function minimalGameState(seedSuffix = "demo"): GameState {
  return {
    meta: {
      seed: `seed-${seedSuffix}`,
      rngAlgorithmVersion: "sfc32-cyrb128-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:2026"),
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: {},
    clubIds: [],
  };
}

/**
 * Creates a deterministic clock function for metadata assertions.
 */
function fixedClock(...timestamps: readonly string[]): () => string {
  assert.notEqual(timestamps.length, 0);

  let index = 0;

  return () => {
    const timestamp = timestamps[Math.min(index, timestamps.length - 1)]!;
    index += 1;

    return timestamp;
  };
}

/**
 * Creates an isolated temporary save directory for a test case.
 */
async function createTempSaveDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "the-long-season-saves-"));
}

/**
 * Removes a temporary save directory after a test case.
 */
async function removeTempSaveDirectory(directoryPath: string): Promise<void> {
  await rm(directoryPath, { recursive: true, force: true });
}

/**
 * Recursively lists TypeScript source files under one directory.
 */
async function listTypeScriptFiles(directoryPath: string): Promise<readonly string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const childPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTypeScriptFiles(childPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(childPath);
    }
  }

  return files.toSorted();
}
