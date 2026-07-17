import type { SaveId } from "@game/domain";
import { describe, expect, it, vi } from "vitest";

import { StorageError } from "../game-storage.interface.ts";
import { planSqliteCareerMigrations, SQLITE_CAREER_MIGRATIONS } from "./sqlite-career-migrations.ts";
import {
  SqliteCareerStorage,
  SqliteCareerStorageError,
  type SqliteCareerWorkerPort,
} from "./sqlite-career-storage.ts";

describe("SQLite career storage failure boundaries", () => {
  it("keeps migrations ordered and plans every upgrade from schema one", () => {
    expect(SQLITE_CAREER_MIGRATIONS.map((migration) => migration.version)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(planSqliteCareerMigrations(1).map((migration) => migration.version)).toEqual([2, 3, 4, 5, 6]);
    expect(planSqliteCareerMigrations(4).map((migration) => migration.version)).toEqual([5, 6]);
    expect(planSqliteCareerMigrations(6)).toEqual([]);
  });

  it("rejects future and invalid schema versions without destructive recovery", () => {
    expect(() => planSqliteCareerMigrations(7)).toThrowError(expect.objectContaining({
      code: "unsupported_schema_version",
    }));
    expect(() => planSqliteCareerMigrations(-1)).toThrowError(expect.objectContaining({
      code: "save_unreadable",
    }));
  });

  it.each([
    ["save_unreadable", "save_unreadable"],
    ["save_unwritable", "save_unwritable"],
    ["storage_busy", "storage_busy"],
    ["storage_quota_exceeded", "storage_quota_exceeded"],
    ["unsupported_bootstrap_state", "unsupported_schema_version"],
  ] as const)("normalizes worker %s failures as %s", async (workerCode, expectedCode) => {
    const worker = workerPort({ loadCareer: vi.fn().mockRejectedValue({ code: workerCode, message: workerCode }) });
    const storage = new SqliteCareerStorage(worker);
    await storage.initialize();

    await expect(storage.loadCareer("save:test" as SaveId)).rejects.toMatchObject({ code: expectedCode });
  });

  it("keeps unavailable OPFS distinct from save corruption", async () => {
    const storage = new SqliteCareerStorage(workerPort({
      initialize: vi.fn().mockRejectedValue({ code: "opfs_unavailable", message: "OPFS unavailable" }),
    }));

    await expect(storage.initialize()).rejects.toBeInstanceOf(SqliteCareerStorageError);
    await expect(storage.initialize()).rejects.not.toBeInstanceOf(StorageError);
  });
});

/** Creates one narrow fake worker while preserving typed method signatures. */
function workerPort(overrides: Partial<SqliteCareerWorkerPort> = {}): SqliteCareerWorkerPort {
  return {
    initialize: vi.fn().mockResolvedValue({ databasePath: "test.sqlite3", sqliteVersion: "test", schemaVersion: 6 }),
    saveCareer: vi.fn(),
    loadCareer: vi.fn(),
    listCareers: vi.fn().mockResolvedValue([]),
    updateAutosavePolicy: vi.fn(),
    deleteCareer: vi.fn(),
    close: vi.fn(),
    ...overrides,
  };
}
