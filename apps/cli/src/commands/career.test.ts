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
    assert.equal(io.stdoutLines.includes(`Save directory: ${directoryPath}`), true);
    assert.equal(io.stdoutLines.includes("Selected club: PRO01"), true);
    assert.equal(io.stdoutLines.includes("Generated squad size: 22"), true);
    assert.equal(io.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(io.stdoutLines.includes("Nationality summary:"), true);
    assert.equal(io.stdoutLines.includes("Age summary:"), true);
    assert.equal(io.stdoutLines.includes("Prospect summary:"), true);
    assert.equal(loaded.careerWorld?.worldSeed, "world-a");
    assert.equal(loaded.careerWorld?.generatorVersion, 1);
    assert.equal(loaded.selectedClubId, "club:province-01");
    assert.equal(loaded.gameState.fixtureIds.length, 306);
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
    assert.equal(summaryIo.stdoutLines.includes("Current season: season:demo-001"), true);
    assert.equal(summaryIo.stdoutLines.includes("Selected club: PRO01"), true);
    assert.equal(summaryIo.stdoutLines.includes("Selected club roster size: 22"), true);
    assert.equal(summaryIo.stdoutLines.some((line) => /^Selected club transfer funds: EUR [0-9]+\.[0-9]{2}$/.test(line)), true);
    assert.equal(summaryIo.stdoutLines.includes("Next selected-club fixture:"), true);
    assert.equal(
      summaryIo.stdoutLines.some((line) => /^  fixture:[0-9]{6} 2026-08-01 round 1: PRO[0-9]{2} vs PRO[0-9]{2}$/.test(line)),
      true,
    );
    assert.deepEqual(after, before);
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
    assert.equal(summaryIo.stdoutLines.some((line) => /giornata 1: PRO[0-9]{2} vs PRO[0-9]{2}$/.test(line)), true);
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
    assert.equal(squadIo.stdoutLines.includes("Selected club: PRO01"), true);
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
    assert.equal(squadIo.stdoutLines.includes("Club selezionato: PRO01"), true);
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
    assert.equal(inspectIo.stdoutLines.some((line) => /^    slot:01 [A-Za-z]+ [A-Za-z]+ goalkeeper$/.test(line)), true);
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
    assert.equal(advanceIo.stdoutLines.some((line) => /^Advanced fixture: fixture:[0-9]{6}$/.test(line)), true);
    assert.equal(advanceIo.stdoutLines.some((line) => /^Result: PRO[0-9]{2} [0-9]+-[0-9]+ PRO[0-9]{2}$/.test(line)), true);
    assert.equal(advanceIo.stdoutLines.includes("Career save written: yes"), true);
    assert.equal(countPlayedSelectedClubFixtures(loaded), 1);

    assert.equal(
      await runCareerCommand(["--save=career-advance", "--inspect"], inspectIo, {
        storageDirectoryPath: directoryPath,
      }),
      0,
    );
    assert.equal(inspectIo.stdoutLines.includes("Selected club played fixtures: 1"), true);
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
    assert.equal(afterInspectIo.stdoutLines.some((line) => /^  1\. [A-Za-z]+ [A-Za-z]+: PRO18 -> PRO01;/.test(line)), true);
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
    "choose exactly one career action: --apply-market-demo, --inspect, --summary, --squad, --set-lineup-demo, --set-tactic-demo, --advance-next-fixture, or --new-world-preview",
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
