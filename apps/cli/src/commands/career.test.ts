import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  createFakeDomesticWorld,
  playerValuationConfig,
} from "@game/content";
import { JsonCareerStorage, StorageError } from "@game/storage";

import { runCareerCommand } from "./career.ts";
import {
  assertSupportedCareerCalibrationVersions,
  careerStateFromNewWorld,
} from "./career/scenarios.ts";
import type { CliCareerState, CliSaveId } from "./career/types.ts";

/**
 * Career command tests exercise durable market application through injected IO
 * and an isolated career-save directory.
 */
const CLUB_NAME_PATTERN = "[A-Za-z.]+(?: [A-Za-z0-9.]+)*";

test("CLI builds the canonical three-division topology and shared identity hash", () => {
  const seed = "shared-three-division-seed";
  const state = careerStateFromNewWorld(
    "save:cli-shared-hash" as CliSaveId,
    createFakeDomesticWorld({ worldSeed: seed }),
    seed,
  );

  assert.equal(state.selectedClubId, "club:ita-3-01");
  assert.equal(state.gameState.clubIds.length, 54);
  assert.equal(state.gameState.fixtureIds.length, 918);
  assert.deepEqual(state.gameState.domesticCompetitionWorld?.competitionIds, [
    "competition:ita-1",
    "competition:ita-2",
    "competition:ita-3",
  ]);
  assert.equal(
    state.clubCompetitiveTierState.seasonId,
    state.gameState.calendar.currentSeasonId,
  );
  assert.deepEqual(
    ["title_contender", "playoff_contender", "mid_table", "survival"].map((tier) =>
      state.gameState.clubIds.filter((clubId) =>
        state.clubCompetitiveTierState.tierByClubId[clubId] === tier
      ).length
    ),
    [12, 12, 18, 12],
  );
  assert.equal(canonicalCareerIdentityHash(state), "b12d5dd0");
});

test("CLI rejects a career with a mismatched immutable calibration version", () => {
  const seed = "cli-version-mismatch";
  const generated = careerStateFromNewWorld(
    "save:cli-version-mismatch" as CliSaveId,
    createFakeDomesticWorld({ worldSeed: seed }),
    seed,
  );
  const state = {
    ...generated,
    gameState: {
      ...generated.gameState,
      meta: {
        ...generated.gameState.meta,
        calibrationVersions: {
          ...generated.gameState.meta.calibrationVersions,
          ratingScale: "unsupported-rating-scale",
        },
      },
    },
  } as CliCareerState;

  assert.throws(
    () => assertSupportedCareerCalibrationVersions(state),
    /Unsupported career topology\/calibration versions/,
  );
});

test("CLI resets only the incompatible beta save through canonical storage", async () => {
  const directoryPath = await createTempSaveDirectory();
  const incompatibleId = "save:cli-version-reset" as CliSaveId;
  const compatibleId = "save:cli-version-compatible" as CliSaveId;
  const storage = new JsonCareerStorage({ directoryPath });
  const incompatible = careerStateFromNewWorld(
    incompatibleId,
    createFakeDomesticWorld({ worldSeed: "cli-version-reset" }),
    "cli-version-reset",
  );
  const compatible = careerStateFromNewWorld(
    compatibleId,
    createFakeDomesticWorld({ worldSeed: "cli-version-compatible" }),
    "cli-version-compatible",
  );

  try {
    await storage.saveCareer({
      saveId: incompatibleId,
      name: "Incompatible",
      state: {
        ...incompatible,
        gameState: {
          ...incompatible.gameState,
          meta: {
            ...incompatible.gameState.meta,
            calibrationVersions: {
              ...incompatible.gameState.meta.calibrationVersions!,
              playerRatingScaleVersion: "player-rating-scale-v1",
            },
          },
        },
      },
    });
    await storage.saveCareer({
      saveId: compatibleId,
      name: "Compatible",
      state: compatible,
    });

    await assert.rejects(
      () => runCareerCommand(
        ["--save=cli-version-reset", "--inspect"],
        captureIo(),
        { storageDirectoryPath: directoryPath },
      ),
      (error: unknown) =>
        error instanceof StorageError
        && error.code === "unsupported_schema_version",
    );
    await assert.rejects(
      () => storage.loadCareer(incompatibleId),
      (error: unknown) =>
        error instanceof StorageError && error.code === "save_not_found",
    );
    assert.equal((await storage.loadCareer(compatibleId)).saveId, compatibleId);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("CLI resets a beta save rejected by the storage schema before calibration validation", async () => {
  const directoryPath = await createTempSaveDirectory();
  const incompatibleId = "save:cli-storage-schema-reset" as CliSaveId;
  const compatibleId = "save:cli-storage-schema-compatible" as CliSaveId;
  const storage = new JsonCareerStorage({ directoryPath });
  const incompatible = careerStateFromNewWorld(
    incompatibleId,
    createFakeDomesticWorld({ worldSeed: "cli-storage-schema-reset" }),
    "cli-storage-schema-reset",
  );
  const compatible = careerStateFromNewWorld(
    compatibleId,
    createFakeDomesticWorld({ worldSeed: "cli-storage-schema-compatible" }),
    "cli-storage-schema-compatible",
  );
  const incompatiblePath = join(
    directoryPath,
    `${encodeURIComponent(incompatibleId)}.career.json`,
  );

  try {
    await storage.saveCareer({
      saveId: incompatibleId,
      name: "Incompatible storage schema",
      state: incompatible,
    });
    await storage.saveCareer({
      saveId: compatibleId,
      name: "Compatible storage schema",
      state: compatible,
    });
    const stored = JSON.parse(await readFile(incompatiblePath, "utf8")) as Record<string, unknown>;
    await writeFile(
      incompatiblePath,
      `${JSON.stringify({ ...stored, saveSchemaVersion: 1 }, null, 2)}\n`,
      "utf8",
    );

    await assert.rejects(
      () => runCareerCommand(
        ["--save=cli-storage-schema-reset", "--inspect"],
        captureIo(),
        { storageDirectoryPath: directoryPath },
      ),
      (error: unknown) =>
        error instanceof StorageError
        && error.code === "unsupported_schema_version",
    );
    await assert.rejects(
      () => storage.loadCareer(incompatibleId),
      (error: unknown) =>
        error instanceof StorageError && error.code === "save_not_found",
    );
    assert.equal((await storage.loadCareer(compatibleId)).saveId, compatibleId);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});


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
    assert.equal(io.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
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
    assert.equal(io.stdoutLines.includes(`Cartella salvataggi: ${directoryPath}`), true);
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
    assert.equal(inspectIo.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
    assert.equal(inspectIo.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club roster size: 23"), true);
    assert.equal(inspectIo.stdoutLines.some((line) => /^Selected club transfer funds: EUR [0-9]+\.[0-9]{2}$/.test(line)), true);
    assert.equal(inspectIo.stdoutLines.includes("Transfer history:"), true);
    assert.equal(
      inspectIo.stdoutLines.some((line) =>
        /^  1\. .+: .+ -> .+; public value: EUR [0-9]+\.[0-9]{2}; initial asking price: EUR [0-9]+\.[0-9]{2}; offered fee: EUR [0-9]+\.[0-9]{2}; agreed fee: EUR [0-9]+\.[0-9]{2}; completed fee: EUR [0-9]+\.[0-9]{2}; date: 2026-08-[0-9]{2}$/.test(line)
      ),
      true,
    );
    assert.equal(inspectIo.stdoutLines.some((line) => /Player[0-9]{2} No[0-9]{2}/.test(line)), false);
    assert.equal(inspectIo.stdoutLines.includes("Affected clubs:"), true);
    assert.equal(inspectIo.stdoutLines.some((line) => new RegExp(`^  ${CLUB_NAME_PATTERN}: roster size=23 budget=EUR [0-9]+\\.[0-9]{2}$`).test(line)), true);
    assert.equal(inspectIo.stdoutLines.some((line) => new RegExp(`^  ${CLUB_NAME_PATTERN}: roster size=21 budget=EUR [0-9]+\\.[0-9]{2}$`).test(line)), true);
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
    assert.equal(io.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
    assert.equal(io.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(io.stdoutLines.includes("Generated squad size: 22"), true);
    assert.equal(io.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(io.stdoutLines.includes("Nationality summary:"), true);
    assert.equal(io.stdoutLines.includes("Age summary:"), true);
    assert.equal(io.stdoutLines.includes("Prospect summary:"), true);
    assert.equal(loaded.careerWorld?.worldSeed, "world-a");
    assert.equal(loaded.careerWorld?.generatorVersion, 1);
    assert.equal(loaded.selectedClubId, "club:ita-3-01");
    assert.equal(loaded.gameState.clubs[loaded.selectedClubId]?.playerIds.length, 22);
    assert.equal(loaded.youthAcademyState?.clubRosterIds.length, 54);
    assert.equal(loaded.youthAcademyState?.clubRosters[loaded.selectedClubId]?.playerIds.length, 11);
    assert.equal(loaded.youthAcademyState?.clubRosters[loaded.selectedClubId]?.playerIds.some((playerId) => (
      loaded.gameState.clubs[loaded.selectedClubId]?.playerIds.includes(playerId) ?? false
    )), false);
    assert.equal(loaded.gameState.fixtureIds.length, 918);
    assert.deepEqual(
      loaded.gameState.domesticCompetitionWorld?.competitionIds,
      ["competition:ita-1", "competition:ita-2", "competition:ita-3"],
    );
    assert.equal(Object.keys(loaded.gameState.meta.calibrationVersions ?? {}).length, 8);
    const firstFixtureId = loaded.gameState.fixtureIds[0];
    if (firstFixtureId === undefined) {
      throw new Error("Expected a persisted first fixture ID");
    }
    assert.equal(loaded.gameState.fixtures[firstFixtureId]?.result, undefined);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command summarizes an existing career save without mutating it", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const summaryIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-summary", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-summary" as Parameters<typeof storage.loadCareer>[0]);
    const exitCode = await runCareerCommand(["--save=career-summary", "--summary"], summaryIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-summary" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(summaryIo.stderrLines.length, 0);
    assert.equal(summaryIo.stdoutLines[0], "The Long Season career summary");
    assert.equal(summaryIo.stdoutLines.includes("Save: save:career-summary"), true);
    assert.equal(summaryIo.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
    assert.equal(summaryIo.stdoutLines.includes("World seed: world-a"), true);
    assert.equal(summaryIo.stdoutLines.includes("Current date: 2026-08-01"), true);
    assert.equal(summaryIo.stdoutLines.includes("Current season: season:2026"), true);
    assert.equal(summaryIo.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(summaryIo.stdoutLines.includes("Selected club roster size: 22"), true);
    assert.equal(summaryIo.stdoutLines.some((line) => /^Selected club transfer funds: EUR [0-9]+\.[0-9]{2}$/.test(line)), true);
    assert.equal(summaryIo.stdoutLines.includes("Next selected-club fixture:"), true);
    assert.equal(
      summaryIo.stdoutLines.some((line) => new RegExp(`^  fixture:ita-3:2026:[0-9]{6} 2026-08-01 round 1: ${CLUB_NAME_PATTERN} vs ${CLUB_NAME_PATTERN}$`).test(line)),
      true,
    );
    assert.deepEqual(after, before);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command prints a dashboard smoke view without mutating the save", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const dashboardIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-dashboard", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-dashboard" as Parameters<typeof storage.loadCareer>[0]);
    const exitCode = await runCareerCommand(["--save=career-dashboard", "--dashboard"], dashboardIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-dashboard" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(dashboardIo.stderrLines.length, 0);
    assert.equal(dashboardIo.stdoutLines[0], "The Long Season career dashboard");
    assert.equal(dashboardIo.stdoutLines.includes("Save: save:career-dashboard"), true);
    assert.equal(dashboardIo.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
    assert.equal(dashboardIo.stdoutLines.includes("World seed: world-a"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Current date: 2026-08-01"), true);
    assert.equal(dashboardIo.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(dashboardIo.stdoutLines.includes("Development environment: Adequate"), true);
    assert.equal(
      dashboardIo.stdoutLines.some((line) => /(?:0\.92|0\.95|0\.98|1\.00|1\.03|1\.06|1\.10)/.test(line)),
      false,
    );
    assert.equal(dashboardIo.stdoutLines.includes("Next selected-club fixture:"), true);
    assert.equal(
      dashboardIo.stdoutLines.some((line) => new RegExp(`^  fixture:ita-3:2026:[0-9]{6} 2026-08-01 round 1: ${CLUB_NAME_PATTERN} vs ${CLUB_NAME_PATTERN} \\((home|away)\\)$`).test(line)),
      true,
    );
    assert.equal(dashboardIo.stdoutLines.includes("Match preparation:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  Saved lineup: missing"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  Saved tactic: missing"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Condition summary:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  Players: 22"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Table context:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  unknown"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Actions:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  Advance next fixture: blocked (blocked by missing saved lineup, missing saved tactic)"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Blockers:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  missing saved lineup"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  missing saved tactic"), true);
    assert.deepEqual(after, before);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes dashboard smoke output in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const dashboardIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=mondo-dashboard", "--save=carriera-dashboard", "--new-world-preview", "--lang=it"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=carriera-dashboard", "--dashboard", "--lang=it"], dashboardIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(dashboardIo.stderrLines.length, 0);
    assert.equal(dashboardIo.stdoutLines[0], "The Long Season dashboard carriera");
    assert.equal(dashboardIo.stdoutLines.includes("Ambiente di sviluppo: Adeguato"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Preparazione partita:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("  Formazione salvata: mancante"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Azioni:"), true);
    assert.equal(dashboardIo.stdoutLines.includes("Blocchi:"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command inspects selected youth academy without mutating the save", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const youthIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-youth", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-youth" as Parameters<typeof storage.loadCareer>[0]);
    const exitCode = await runCareerCommand(["--save=career-youth", "--youth-academy"], youthIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-youth" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(youthIo.stderrLines.length, 0);
    assert.equal(youthIo.stdoutLines[0], "The Long Season youth academy");
    assert.equal(youthIo.stdoutLines.includes("Save: save:career-youth"), true);
    assert.equal(youthIo.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(youthIo.stdoutLines.includes("Selected club youth count: 11"), true);
    assert.equal(hasLineStartingWith(youthIo.stdoutLines, "Active players: senior=1188 youth=594 total=1782"), true);
    assert.equal(youthIo.stdoutLines.includes("Inspection only: the career save is not changed."), true);
    assert.equal(youthIo.stdoutLines.includes("Youth players:"), true);
    assert.equal(youthIo.stdoutLines.includes("  Player                   Age Nationality    Pos  Ability     Development    Status"), true);
    assert.equal(youthIo.stdoutLines.some((line) => /\bacademy$/.test(line)), true);
    assert.equal(youthIo.stdoutLines.some((line) => /\bunknown\b/.test(line)), true);
    assert.equal(youthIo.stdoutLines.some((line) => /potential/i.test(line)), false);
    assert.deepEqual(after, before);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes youth academy inspection in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const youthIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=mondo-youth", "--save=carriera-vivaio", "--new-world-preview", "--lang=it"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=carriera-vivaio", "--youth-academy", "--lang=it"], youthIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(youthIo.stderrLines.length, 0);
    assert.equal(youthIo.stdoutLines[0], "The Long Season vivaio");
    assert.equal(youthIo.stdoutLines.includes("Giovani vivaio club selezionato: 11"), true);
    assert.equal(youthIo.stdoutLines.includes("Solo ispezione: il salvataggio carriera non viene modificato."), true);
    assert.equal(youthIo.stdoutLines.includes("Giovani:"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command refuses season rollover while the current season is incomplete", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const rolloverIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-rollover-incomplete", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-rollover-incomplete" as Parameters<typeof storage.loadCareer>[0]);
    const exitCode = await runCareerCommand(["--save=career-rollover-incomplete", "--rollover-season"], rolloverIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-rollover-incomplete" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 1);
    assert.equal(rolloverIo.stderrLines.length, 0);
    assert.equal(rolloverIo.stdoutLines[0], "The Long Season career season rollover");
    assert.equal(rolloverIo.stdoutLines.includes("Rollover status: invalid state"), true);
    assert.equal(rolloverIo.stdoutLines.includes("Reason: current season is not complete"), true);
    assert.equal(rolloverIo.stdoutLines.includes("Career save written: no"), true);
    assert.deepEqual(after, before);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command rolls all three competitions through one atomic boundary", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const rolloverIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-rollover", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const created = await storage.loadCareer("save:career-rollover" as Parameters<typeof storage.loadCareer>[0]);
    const initialWorld = created.gameState.domesticCompetitionWorld;
    if (initialWorld === undefined) throw new Error("Expected domestic competition world");
    const selectedClub = created.gameState.clubs[created.selectedClubId];
    const relegatedAiClubId = initialWorld.competitions["competition:ita-1" as keyof typeof initialWorld.competitions]?.clubIds.at(-1);
    if (selectedClub === undefined || relegatedAiClubId === undefined) {
      throw new Error("Expected selected and relegated club fixtures");
    }
    const selectedPlayerIds = [...selectedClub.playerIds];
    const selectedReputation = selectedClub.reputation;
    const relegatedAiPlayerIds = [...created.gameState.clubs[relegatedAiClubId]!.playerIds];
    const relegatedAiReputation = created.gameState.clubs[relegatedAiClubId]!.reputation;
    await storage.saveCareer({
      saveId: "save:career-rollover" as Parameters<typeof storage.saveCareer>[0]["saveId"],
      name: "save:career-rollover",
      state: completeCareerSeason(created),
    });

    const exitCode = await runCareerCommand(["--save=career-rollover", "--rollover-season"], rolloverIo, {
      storageDirectoryPath: directoryPath,
    });
    const rolledOver = await storage.loadCareer("save:career-rollover" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(rolloverIo.stderrLines.length, 0);
    assert.equal(rolloverIo.stdoutLines[0], "The Long Season career season rollover");
    assert.equal(rolloverIo.stdoutLines.includes("Rollover status: rolled over"), true);
    assert.equal(rolloverIo.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(rolledOver.gameState.calendar.currentSeasonId, "season:2027");
    assert.equal(rolledOver.gameState.fixtureIds.length, 1_836);
    assert.equal(
      rolledOver.gameState.domesticCompetitionWorld?.seasonHistory.length,
      3,
    );
    assert.equal(rolledOver.seasonHistory?.length, 1);
    assert.deepEqual(
      rolledOver.gameState.domesticCompetitionWorld?.competitionIds.map(
        (competitionId) =>
          rolledOver.gameState.domesticCompetitionWorld?.competitions[
            competitionId
          ]?.clubIds.length,
      ),
      [18, 18, 18],
    );
    const nextWorld = rolledOver.gameState.domesticCompetitionWorld;
    if (nextWorld === undefined) throw new Error("Expected rolled-over competition world");
    assert.equal(nextWorld.competitions["competition:ita-2" as keyof typeof nextWorld.competitions]?.clubIds.includes(
      rolledOver.selectedClubId,
    ), true);
    assert.equal(nextWorld.competitions["competition:ita-2" as keyof typeof nextWorld.competitions]?.clubIds.includes(
      relegatedAiClubId,
    ), true);
    assert.equal(rolledOver.gameState.clubs[rolledOver.selectedClubId]?.category, "second_division");
    assert.equal(rolledOver.gameState.clubs[relegatedAiClubId]?.category, "second_division");
    assert.deepEqual(rolledOver.gameState.clubs[rolledOver.selectedClubId]?.playerIds, selectedPlayerIds);
    assert.deepEqual(rolledOver.gameState.clubs[relegatedAiClubId]?.playerIds, relegatedAiPlayerIds);
    assert.equal(
      rolledOver.gameState.clubs[rolledOver.selectedClubId]?.reputation,
      selectedReputation + 2,
    );
    assert.equal(
      rolledOver.gameState.clubs[relegatedAiClubId]?.reputation,
      relegatedAiReputation - 2,
    );
    assert.equal(currentSeasonFixturesForClub(rolledOver, rolledOver.selectedClubId).length, 34);
    assert.equal(currentSeasonFixturesForClub(rolledOver, relegatedAiClubId).length, 34);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes summary output in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const summaryIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=mondo-it", "--save=carriera-riepilogo", "--new-world-preview", "--lang=it"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=carriera-riepilogo", "--summary", "--lang=it"], summaryIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(summaryIo.stderrLines.length, 0);
    assert.equal(summaryIo.stdoutLines[0], "The Long Season riepilogo carriera");
    assert.equal(summaryIo.stdoutLines.includes("Seed mondo: mondo-it"), true);
    assert.equal(summaryIo.stdoutLines.includes("Data corrente: 2026-08-01"), true);
    assert.equal(summaryIo.stdoutLines.includes("Prossima partita del club selezionato:"), true);
    assert.equal(summaryIo.stdoutLines.some((line) => new RegExp(`giornata 1: ${CLUB_NAME_PATTERN} vs ${CLUB_NAME_PATTERN}$`).test(line)), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command prints deterministic development report without mutating the save", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const firstReportIo = captureIo();
  const secondReportIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-development", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-development" as Parameters<typeof storage.loadCareer>[0]);
    const firstExitCode = await runCareerCommand(["--save=career-development", "--development-report"], firstReportIo, {
      storageDirectoryPath: directoryPath,
    });
    const secondExitCode = await runCareerCommand(["--save=career-development", "--development-report"], secondReportIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-development" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(firstExitCode, 0);
    assert.equal(secondExitCode, 0);
    assert.equal(firstReportIo.stderrLines.length, 0);
    assert.deepEqual(secondReportIo.stdoutLines, firstReportIo.stdoutLines);
    assert.deepEqual(after, before);
    assert.equal(firstReportIo.stdoutLines[0], "The Long Season career development report");
    assert.equal(firstReportIo.stdoutLines.includes("Seasons simulated: 7"), true);
    assert.equal(firstReportIo.stdoutLines.includes("Inspection only: the career save is not changed."), true);
    assert.equal(firstReportIo.stdoutLines.includes("Career save written: no"), true);
    assert.equal(firstReportIo.stdoutLines.includes("Development aggregate:"), true);
    assert.equal(firstReportIo.stdoutLines.includes("Selected-club examples:"), true);
    assert.equal(firstReportIo.stdoutLines.includes("Trajectory samples:"), true);
    assert.equal(firstReportIo.stdoutLines.some((line) => /^  age~26: .+, age [0-9]+->[0-9]+, growth [0-9.]+, decline [0-9.]+, room [0-9.]+$/.test(line)), true);
    assert.equal(firstReportIo.stdoutLines.some((line) => line.toLowerCase().includes("potential")), false);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command prints selected club squad without mutating the save", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const squadIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-squad", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-squad" as Parameters<typeof storage.loadCareer>[0]);
    const exitCode = await runCareerCommand(["--save=career-squad", "--squad"], squadIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-squad" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(squadIo.stderrLines.length, 0);
    assert.equal(squadIo.stdoutLines[0], "The Long Season career squad");
    assert.equal(squadIo.stdoutLines.includes("Save: save:career-squad"), true);
    assert.equal(squadIo.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
    assert.equal(squadIo.stdoutLines.includes("World seed: world-a"), true);
    assert.equal(squadIo.stdoutLines.includes("Current date: 2026-08-01"), true);
    assert.equal(squadIo.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(squadIo.stdoutLines.includes("Selected club roster size: 22"), true);
    assert.equal(squadIo.stdoutLines.includes("Inspection only: the career save is not changed."), true);
    assert.equal(squadIo.stdoutLines.includes("Players:"), true);
    assert.equal(squadIo.stdoutLines.includes("  Player                       Age Pos  Role Fit Form Mor"), true);
    assert.equal(
      squadIo.stdoutLines.some((line) => /^  [A-Za-z]+ [A-Za-z]+\s+[0-9]{2} [A-Z]{2,3}\s+[0-9]+\.[0-9]\s+100\s+50\s+50$/.test(line)),
      true,
    );
    assert.equal(squadIo.stdoutLines.some((line) => /potential/i.test(line)), false);
    assert.deepEqual(after, before);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes selected club squad in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const squadIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=mondo-it", "--save=carriera-rosa", "--new-world-preview", "--lang=it"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=carriera-rosa", "--squad", "--lang=it"], squadIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(squadIo.stderrLines.length, 0);
    assert.equal(squadIo.stdoutLines[0], "The Long Season rosa carriera");
    assert.equal(squadIo.stdoutLines.includes("Seed mondo: mondo-it"), true);
    assert.equal(squadIo.stdoutLines.some((line) => new RegExp(`^Club selezionato: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(squadIo.stdoutLines.includes("Solo ispezione: il salvataggio carriera non viene modificato."), true);
    assert.equal(squadIo.stdoutLines.includes("Giocatori:"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command saves selected lineup and exposes it after reload", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const lineupIo = captureIo();
  const inspectIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-lineup", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=career-lineup", "--set-lineup-demo=pro01-rotated"], lineupIo, {
      storageDirectoryPath: directoryPath,
    });
    const storage = new JsonCareerStorage({ directoryPath });
    const loaded = await storage.loadCareer("save:career-lineup" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(lineupIo.stderrLines.length, 0);
    assert.equal(lineupIo.stdoutLines[0], "The Long Season career lineup saved");
    assert.equal(lineupIo.stdoutLines.includes("Lineup profile: pro01-rotated"), true);
    assert.equal(lineupIo.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(lineupIo.stdoutLines.includes("Applies to next selected-club fixture: yes"), true);
    assert.equal(lineupIo.stdoutLines.includes("Selected starters:"), true);
    assert.equal(lineupIo.stdoutLines.includes("Changes from first team:"), true);
    assert.equal(loaded.matchPreparation?.selectedLineup?.slots.length, 11);
    assert.equal(loaded.matchPreparation?.tactic, undefined);

    assert.equal(
      await runCareerCommand(["--save=career-lineup", "--inspect"], inspectIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(inspectIo.stdoutLines.includes("Match preparation:"), true);
    assert.equal(inspectIo.stdoutLines.includes("  Saved lineup:"), true);
    assert.equal(inspectIo.stdoutLines.some((line) => /^    slot:01 .+ Goalkeeper$/.test(line)), true);
    assert.equal(inspectIo.stdoutLines.includes("  Saved tactic: none"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command saves selected tactic and exposes it in summary", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const lineupIo = captureIo();
  const tacticIo = captureIo();
  const summaryIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-tactic", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-tactic", "--set-lineup-demo=pro01-first-team"], lineupIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=career-tactic", "--set-tactic-demo=pro01-balanced"], tacticIo, {
      storageDirectoryPath: directoryPath,
    });
    const storage = new JsonCareerStorage({ directoryPath });
    const loaded = await storage.loadCareer("save:career-tactic" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(tacticIo.stderrLines.length, 0);
    assert.equal(tacticIo.stdoutLines[0], "The Long Season career tactic saved");
    assert.equal(tacticIo.stdoutLines.includes("Tactic profile: pro01-balanced"), true);
    assert.equal(tacticIo.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(
      tacticIo.stdoutLines.includes("Saved tactic: mentality=balanced pressing=0.50 directness=0.50 width=0.50 risk=0.50"),
      true,
    );
    assert.equal(loaded.matchPreparation?.selectedLineup?.slots.length, 11);
    assert.equal(loaded.matchPreparation?.tactic?.mentality, "balanced");

    assert.equal(
      await runCareerCommand(["--save=career-tactic", "--summary"], summaryIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(summaryIo.stdoutLines.includes("Match preparation:"), true);
    assert.equal(
      summaryIo.stdoutLines.includes("  Saved tactic: mentality=balanced pressing=0.50 directness=0.50 width=0.50 risk=0.50"),
      true,
    );
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command advances and persists the next selected-club fixture", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const summaryIo = captureIo();
  const lineupIo = captureIo();
  const tacticIo = captureIo();
  const advanceIo = captureIo();
  const secondAdvanceIo = captureIo();
  const inspectIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-advance", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-advance", "--summary"], summaryIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(summaryIo.stdoutLines.includes("Next selected-club fixture:"), true);
    assert.equal(
      await runCareerCommand(["--save=career-advance", "--set-lineup-demo=pro01-first-team"], lineupIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-advance", "--set-tactic-demo=pro01-balanced"], tacticIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=career-advance", "--advance-next-fixture"], advanceIo, {
      storageDirectoryPath: directoryPath,
    });
    const storage = new JsonCareerStorage({ directoryPath });
    const loaded = await storage.loadCareer("save:career-advance" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 0);
    assert.equal(advanceIo.stderrLines.length, 0);
    assert.equal(advanceIo.stdoutLines[0], "The Long Season career advance");
    assert.equal(advanceIo.stdoutLines.includes("Advance status: advanced"), true);
    assert.equal(advanceIo.stdoutLines.some((line) => /^Advanced fixture: fixture:ita-3:2026:[0-9]{6}$/.test(line)), true);
    assert.equal(advanceIo.stdoutLines.some((line) => new RegExp(`^Result: ${CLUB_NAME_PATTERN} [0-9]+-[0-9]+ ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(advanceIo.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(advanceIo.stdoutLines.includes("Pre-match recovery:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Recovery days: 0"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Players improved: 0"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Fitness range: 100..100 -> 100..100"), true);
    assert.equal(advanceIo.stdoutLines.includes("Post-match condition:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Selected starters:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Rested first-team players:"), true);
    assert.equal(advanceIo.stdoutLines.some((line) => /100 -> 92 \(-8\)$/.test(line)), true);
    assert.equal(advanceIo.stdoutLines.includes("Post-match player state:"), true);
    assert.equal(advanceIo.stdoutLines.some((line) => /^  Changed players: [0-9]+; form [+-][0-9]+; morale [+-][0-9]+$/.test(line)), true);
    assert.equal(
      advanceIo.stdoutLines.some((line) =>
        /^  .+: form [0-9]+ -> [0-9]+ \([+-][0-9]+\), morale [0-9]+ -> [0-9]+ \([+-][0-9]+\); reasons: .+$/.test(line)
      ),
      true,
    );
    assert.equal(countPlayedSelectedClubFixtures(loaded), 1);
    const selectedClub = loaded.gameState.clubs[loaded.selectedClubId];
    const firstStarterId = selectedClub?.playerIds[0];
    if (firstStarterId === undefined) {
      throw new Error("Expected selected club first starter");
    }
    assert.equal(loaded.gameState.playerStates[firstStarterId]?.fitness, 92);
    // Form and morale follow the match rating, and an ordinary performance is
    // entitled to move neither. What has to survive the save/load round trip is
    // that the match moved *somebody*, which is the persistence claim; pinning
    // it to the first player on the roster was pinning whose rating happened to
    // round away from neutral.
    const movedPlayers = (selectedClub?.playerIds ?? []).filter(
      (id) =>
        loaded.gameState.playerStates[id] !== undefined
        && (loaded.gameState.playerStates[id]?.form !== 50 || loaded.gameState.playerStates[id]?.morale !== 50),
    );
    assert.equal(movedPlayers.length > 0, true, "no selected-club player's form or morale survived the round trip");
    const savedLineupAfterFirstAdvance = loaded.matchPreparation?.selectedLineup;

    assert.equal(
      await runCareerCommand(["--save=career-advance", "--advance-next-fixture"], secondAdvanceIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(secondAdvanceIo.stdoutLines.includes("  Recovery days: 7"), true);
    assert.equal(secondAdvanceIo.stdoutLines.includes("  Players improved: 11"), true);
    assert.equal(secondAdvanceIo.stdoutLines.includes("  Fitness range: 92..100 -> 100..100"), true);
    const loadedAfterSecondAdvance = await storage.loadCareer("save:career-advance" as Parameters<typeof storage.loadCareer>[0]);
    assert.equal(countPlayedSelectedClubFixtures(loadedAfterSecondAdvance), 2);
    assert.equal(loadedAfterSecondAdvance.gameState.playerStates[firstStarterId]?.fitness, 92);
    assert.deepEqual(loadedAfterSecondAdvance.matchPreparation?.selectedLineup, savedLineupAfterFirstAdvance);

    assert.equal(
      await runCareerCommand(["--save=career-advance", "--inspect"], inspectIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(inspectIo.stdoutLines.includes("Selected club played fixtures: 2"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command applies partial recovery for short gaps before spending match condition", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const lineupIo = captureIo();
  const tacticIo = captureIo();
  const firstAdvanceIo = captureIo();
  const shortGapAdvanceIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-short-gap", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-short-gap", "--set-lineup-demo=pro01-first-team"], lineupIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-short-gap", "--set-tactic-demo=pro01-balanced"], tacticIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-short-gap", "--advance-next-fixture"], firstAdvanceIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const afterFirstAdvance = await storage.loadCareer("save:career-short-gap" as Parameters<typeof storage.loadCareer>[0]);
    const selectedClub = afterFirstAdvance.gameState.clubs[afterFirstAdvance.selectedClubId];
    const firstStarterId = selectedClub?.playerIds[0];
    if (firstStarterId === undefined) {
      throw new Error("Expected selected club first starter");
    }
    assert.equal(afterFirstAdvance.gameState.playerStates[firstStarterId]?.fitness, 92);

    const shortGapCareerState = moveNextSelectedClubFixtureToDate(
      afterFirstAdvance,
      (afterFirstAdvance.gameState.calendar.currentDate + 1) as typeof afterFirstAdvance.gameState.calendar.currentDate,
    );
    await storage.saveCareer({
      saveId: afterFirstAdvance.saveId,
      name: "career-short-gap",
      state: shortGapCareerState,
    });

    assert.equal(
      await runCareerCommand(["--save=career-short-gap", "--advance-next-fixture"], shortGapAdvanceIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(shortGapAdvanceIo.stdoutLines.includes("  Recovery days: 1"), true);
    assert.equal(shortGapAdvanceIo.stdoutLines.includes("  Players improved: 11"), true);
    assert.equal(shortGapAdvanceIo.stdoutLines.includes("  Fitness range: 92..100 -> 97..100"), true);
    const afterShortGapAdvance = await storage.loadCareer("save:career-short-gap" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(countPlayedSelectedClubFixtures(afterShortGapAdvance), 2);
    assert.equal(afterShortGapAdvance.gameState.playerStates[firstStarterId]?.fitness, 89);
    assert.deepEqual(afterShortGapAdvance.matchPreparation?.selectedLineup, shortGapCareerState.matchPreparation?.selectedLineup);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command localizes post-match condition output in Italian", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const lineupIo = captureIo();
  const tacticIo = captureIo();
  const advanceIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-advance-it", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-advance-it", "--set-lineup-demo=pro01-first-team"], lineupIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-advance-it", "--set-tactic-demo=pro01-balanced"], tacticIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=career-advance-it", "--advance-next-fixture", "--lang=it"], advanceIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(advanceIo.stderrLines.length, 0);
    assert.equal(advanceIo.stdoutLines.includes("Recupero pre-partita:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Giorni di recupero: 0"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Giocatori migliorati: 0"), true);
    assert.equal(advanceIo.stdoutLines.includes("Condizione post-partita:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Titolari selezionati:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Giocatori della prima squadra a riposo:"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command can explain an advanced selected-club fixture when requested", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const lineupIo = captureIo();
  const tacticIo = captureIo();
  const advanceIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-advance-explained", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-advance-explained", "--set-lineup-demo=pro01-first-team"], lineupIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-advance-explained", "--set-tactic-demo=pro01-balanced"], tacticIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const exitCode = await runCareerCommand(["--save=career-advance-explained", "--advance-next-fixture", "--fixture-explanation"], advanceIo, {
      storageDirectoryPath: directoryPath,
    });

    assert.equal(exitCode, 0);
    assert.equal(advanceIo.stderrLines.length, 0);
    assert.equal(advanceIo.stdoutLines.includes("Advance status: advanced"), true);
    assert.equal(advanceIo.stdoutLines.includes("Match explanation:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Team strength:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Tactic distribution:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Lineup roles:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Condition impact:"), true);
    assert.equal(advanceIo.stdoutLines.includes("  Chance summary:"), true);
    assert.equal(advanceIo.stdoutLines.some((line) => line.includes("Variance markers: ")), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command blocks fixture advancement without saved preparation", async () => {
  const directoryPath = await createTempSaveDirectory();
  const createIo = captureIo();
  const advanceIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-a", "--save=career-missing-prep", "--new-world-preview"], createIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const before = await storage.loadCareer("save:career-missing-prep" as Parameters<typeof storage.loadCareer>[0]);
    const exitCode = await runCareerCommand(["--save=career-missing-prep", "--advance-next-fixture"], advanceIo, {
      storageDirectoryPath: directoryPath,
    });
    const after = await storage.loadCareer("save:career-missing-prep" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(exitCode, 1);
    assert.equal(advanceIo.stderrLines.length, 0);
    assert.equal(advanceIo.stdoutLines.includes("Advance status: invalid state"), true);
    assert.equal(advanceIo.stdoutLines.includes("Reason: saved match preparation is missing"), true);
    assert.equal(advanceIo.stdoutLines.includes("Career save written: no"), true);
    assert.deepEqual(after, before);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command preserves an accepted transfer after fixture advancement", async () => {
  const directoryPath = await createTempSaveDirectory();
  const applyIo = captureIo();
  const beforeInspectIo = captureIo();
  const lineupIo = captureIo();
  const tacticIo = captureIo();
  const advanceIo = captureIo();
  const afterInspectIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(
        ["--seed=demo-001", "--save=career-continuity", "--apply-market-demo=pro01-affordable-permanent"],
        applyIo,
        { storageDirectoryPath: directoryPath },
      ),
      0,
    );
    assert.equal(applyIo.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(applyIo.stdoutLines.includes("Transfer history entries: 1"), true);

    assert.equal(
      await runCareerCommand(["--save=career-continuity", "--inspect"], beforeInspectIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(beforeInspectIo.stdoutLines.includes("Selected club roster size: 23"), true);
    const budgetBeforeAdvance = selectedClubTransferFundsLine(beforeInspectIo.stdoutLines);
    assert.equal(
      await runCareerCommand(["--save=career-continuity", "--set-lineup-demo=pro01-first-team"], lineupIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--save=career-continuity", "--set-tactic-demo=pro01-balanced"], tacticIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    assert.equal(
      await runCareerCommand(["--save=career-continuity", "--advance-next-fixture"], advanceIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(advanceIo.stdoutLines.includes("Career save written: yes"), true);

    const storage = new JsonCareerStorage({ directoryPath });
    const loaded = await storage.loadCareer("save:career-continuity" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(loaded.transferHistory.length, 1);
    assert.equal(loaded.gameState.clubs[loaded.selectedClubId]?.playerIds.length, 23);
    assert.equal(countPlayedSelectedClubFixtures(loaded), 1);

    assert.equal(
      await runCareerCommand(["--save=career-continuity", "--inspect"], afterInspectIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(afterInspectIo.stdoutLines.includes("Selected club roster size: 23"), true);
    assert.equal(afterInspectIo.stdoutLines.includes("Selected club played fixtures: 1"), true);
    assert.equal(afterInspectIo.stdoutLines.includes(budgetBeforeAdvance), true);
    assert.equal(afterInspectIo.stdoutLines.some((line) => new RegExp(`^  1\\. [A-Za-z]+ [A-Za-z]+: ${CLUB_NAME_PATTERN} -> ${CLUB_NAME_PATTERN};`).test(line)), true);
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
    assert.equal(inspectIo.stdoutLines.some((line) => new RegExp(`^Selected club: ${CLUB_NAME_PATTERN}$`).test(line)), true);
    assert.equal(inspectIo.stdoutLines.includes("Selected club roster size: 22"), true);
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("career command creates stable generated worlds for the same seed", async () => {
  const directoryPath = await createTempSaveDirectory();
  const firstIo = captureIo();
  const secondIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(["--seed=world-stable", "--save=career-world-stable-a", "--new-world-preview"], firstIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(
      await runCareerCommand(["--seed=world-stable", "--save=career-world-stable-b", "--new-world-preview"], secondIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );

    const storage = new JsonCareerStorage({ directoryPath });
    const first = await storage.loadCareer("save:career-world-stable-a" as Parameters<typeof storage.loadCareer>[0]);
    const second = await storage.loadCareer("save:career-world-stable-b" as Parameters<typeof storage.loadCareer>[0]);

    assert.equal(first.careerWorld?.worldSeed, "world-stable");
    assert.equal(second.careerWorld?.worldSeed, "world-stable");
    assert.deepEqual(
      selectedClubPlayerGolden(first),
      selectedClubPlayerGolden(second),
    );
    assert.deepEqual(firstIo.stdoutLines.filter((line) => !line.startsWith("Save: ")), secondIo.stdoutLines.filter((line) => !line.startsWith("Save: ")));
  } finally {
    await removeTempSaveDirectory(directoryPath);
  }
});

test("accepted career transfer persists across storage adapter reloads", async () => {
  const directoryPath = await createTempSaveDirectory();
  const applyIo = captureIo();
  const inspectIo = captureIo();

  try {
    assert.equal(
      await runCareerCommand(
        ["--seed=demo-001", "--save=career-persisted-transfer", "--apply-market-demo=pro01-affordable-permanent"],
        applyIo,
        { storageDirectoryPath: directoryPath },
      ),
      0,
    );

    const firstStorage = new JsonCareerStorage({ directoryPath });
    const firstLoad = await firstStorage.loadCareer("save:career-persisted-transfer" as Parameters<typeof firstStorage.loadCareer>[0]);
    const secondStorage = new JsonCareerStorage({ directoryPath });
    const secondLoad = await secondStorage.loadCareer("save:career-persisted-transfer" as Parameters<typeof secondStorage.loadCareer>[0]);

    assert.equal(firstLoad.transferHistory.length, 1);
    assert.deepEqual(firstLoad.transferHistory, secondLoad.transferHistory);
    assert.equal(firstLoad.gameState.clubs[firstLoad.selectedClubId]?.playerIds.length, 23);
    assert.equal(secondLoad.gameState.clubs[secondLoad.selectedClubId]?.playerIds.length, 23);

    assert.equal(
      await runCareerCommand(["--save=career-persisted-transfer", "--inspect"], inspectIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(inspectIo.stdoutLines.includes("Selected club roster size: 23"), true);
    assert.equal(inspectIo.stdoutLines.includes("Transfer history:"), true);
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
    "choose exactly one career action: --apply-market-demo, --inspect, --summary, --dashboard, --squad, --youth-academy, --set-lineup-demo, --set-tactic-demo, --advance-next-fixture, --rollover-season, --development-report, or --new-world-preview",
  );

  assert.equal(
    await runCareerCommand(["--save=career-demo", "--inspect", "--apply-market-demo=pro01-affordable-permanent"], conflictingMode),
    1,
  );
  assert.equal(conflictingMode.stdoutLines.length, 0);
  assert.equal(conflictingMode.stderrLines[0], "career actions cannot be combined");
});

/**
 * Hashes the same ordered world projection used by the web runtime suite.
 *
 * Matching the shared expected hash proves the two application composition
 * roots agree without creating a runtime dependency between CLI and web.
 */
function canonicalCareerIdentityHash(state: CliCareerState): string {
  const world = state.gameState.domesticCompetitionWorld;
  const serialized = JSON.stringify({
    selectedClubId: state.selectedClubId,
    calibrationVersions: state.gameState.meta.calibrationVersions,
    competitionIds: world?.competitionIds,
    memberships: world?.competitionIds.map((competitionId) => [
      competitionId,
      world.competitions[competitionId]?.clubIds,
    ]),
    clubIds: state.gameState.clubIds,
    clubs: state.gameState.clubIds.map((clubId) => state.gameState.clubs[clubId]),
    playerIds: state.gameState.playerIds,
    players: state.gameState.playerIds.map((playerId) => state.gameState.players[playerId]),
    fixtureIds: state.gameState.fixtureIds,
    fixtures: state.gameState.fixtureIds.map((fixtureId) => state.gameState.fixtures[fixtureId]),
  });
  let hash = 2_166_136_261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

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

function hasLineStartingWith(lines: readonly string[], prefix: string): boolean {
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

function selectedClubPlayerGolden(
  careerState: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>,
): readonly string[] {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];

  return selectedClub?.playerIds.map((playerId) => {
    const player = careerState.gameState.players[playerId];

    return [
      playerId,
      player?.firstName ?? "",
      player?.lastName ?? "",
      player?.birthDate ?? "",
      player?.abilities.technical.finishing ?? "",
      player?.potential.technical.finishing ?? "",
    ].join("|");
  }) ?? [];
}

function countPlayedSelectedClubFixtures(
  careerState: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>,
): number {
  let count = 0;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture === undefined || fixture.result?.played !== true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      count += 1;
    }
  }

  return count;
}

function moveNextSelectedClubFixtureToDate(
  careerState: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>,
  date: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>["gameState"]["calendar"]["currentDate"],
): Awaited<ReturnType<JsonCareerStorage["loadCareer"]>> {
  const nextFixtureId = nextUnplayedSelectedClubFixtureId(careerState);

  if (nextFixtureId === undefined) {
    throw new Error("Expected next selected-club fixture");
  }

  const nextFixture = careerState.gameState.fixtures[nextFixtureId];

  if (nextFixture === undefined) {
    throw new Error("Expected next selected-club fixture data");
  }

  return {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      fixtures: {
        ...careerState.gameState.fixtures,
        [nextFixtureId]: {
          ...nextFixture,
          date,
        },
      },
    },
  };
}

function nextUnplayedSelectedClubFixtureId(
  careerState: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>,
): Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>["gameState"]["fixtureIds"][number] | undefined {
  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined || fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return fixtureId;
    }
  }

  return undefined;
}

function completeCareerSeason(
  careerState: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>,
): Awaited<ReturnType<JsonCareerStorage["loadCareer"]>> {
  const fixtures = { ...careerState.gameState.fixtures };

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture === undefined) {
      continue;
    }

    fixtures[fixtureId] = {
      ...fixture,
      result: deterministicCompletedFixtureResult(fixture.homeClubId, fixture.awayClubId),
    };
  }

  return {
    ...careerState,
    gameState: {
      ...careerState.gameState,
      fixtures,
    },
  };
}

function deterministicCompletedFixtureResult(homeClubId: string, awayClubId: string): { readonly played: true; readonly homeGoals: number; readonly awayGoals: number } {
  const homeScore = Number(homeClubId.slice(-2));
  const awayScore = Number(awayClubId.slice(-2));

  if (homeScore === awayScore) {
    return { played: true, homeGoals: 1, awayGoals: 1 };
  }

  return homeScore < awayScore ? { played: true, homeGoals: 2, awayGoals: 1 } : { played: true, homeGoals: 1, awayGoals: 2 };
}

/** Returns the current-season fixtures involving one club after JSON reload. */
function currentSeasonFixturesForClub(
  careerState: Awaited<ReturnType<JsonCareerStorage["loadCareer"]>>,
  clubId: CliCareerState["selectedClubId"],
) {
  return careerState.gameState.fixtureIds.flatMap((fixtureId) => {
    const fixture = careerState.gameState.fixtures[fixtureId];
    return fixture !== undefined
        && fixture.seasonId === careerState.gameState.calendar.currentSeasonId
        && (fixture.homeClubId === clubId || fixture.awayClubId === clubId)
      ? [fixture]
      : [];
  });
}

function selectedClubTransferFundsLine(lines: readonly string[]): string {
  const line = lines.find((candidate) => candidate.startsWith("Selected club transfer funds: "));

  if (line === undefined) {
    throw new Error("Missing selected club transfer funds line");
  }

  return line;
}

/** Creates an isolated temporary career-save directory for a test case. */
async function createTempSaveDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "the-long-season-cli-career-"));
}

/** Removes a temporary career-save directory after a test case. */
async function removeTempSaveDirectory(directoryPath: string): Promise<void> {
  await rm(directoryPath, { recursive: true, force: true });
}
