import type { SaveId } from "@game/domain";
import { describe, expect, it, vi } from "vitest";

import { StorageError } from "../game-storage.interface.ts";
import { planSqliteCareerMigrations, SQLITE_CAREER_MIGRATIONS } from "./sqlite-career-migrations.ts";
import {
  SqliteCareerStorage,
  SqliteCareerStorageError,
  type SqliteCareerWorkerPort,
} from "./sqlite-career-storage.ts";
import { SQLITE_CAREER_SCHEMA_VERSION } from "./sqlite-career-schema.ts";

describe("SQLite career storage failure boundaries", () => {
  it("uses the clean Phase 80A baseline for fresh databases", () => {
    expect(SQLITE_CAREER_SCHEMA_VERSION).toBe(23);
    expect(SQLITE_CAREER_MIGRATIONS.map((migration) => migration.version)).toEqual([23]);
    expect(planSqliteCareerMigrations(0).map((migration) => migration.version)).toEqual([23]);
    expect(planSqliteCareerMigrations(23)).toEqual([]);
    expect(SQLITE_CAREER_MIGRATIONS[0]?.statements.some((statement) => (
      /^ALTER TABLE/u.test(statement)
    ))).toBe(false);
  });

  it("creates archived player statistics without an active-player foreign key", () => {
    const schema = SQLITE_CAREER_MIGRATIONS[0]?.statements.join("\n") ?? "";

    expect(schema).toContain("participation_coverage TEXT NOT NULL DEFAULT 'unavailable'");
    expect(schema).toContain("event_coverage TEXT NOT NULL DEFAULT 'unavailable'");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS season_player_statistics");
    expect(schema).toContain("REFERENCES season_history(save_id, sequence_number) ON DELETE CASCADE");
    const playerStatistics = SQLITE_CAREER_MIGRATIONS[0]?.statements.find((statement) =>
      statement.includes("CREATE TABLE IF NOT EXISTS season_player_statistics")
    ) ?? "";
    expect(playerStatistics).not.toContain("REFERENCES players(save_id, player_id)");
  });

  it("adds relational domestic topology and all GameMeta calibration versions", () => {
    const schema = SQLITE_CAREER_MIGRATIONS[0]?.statements.join("\n") ?? "";

    expect(schema).toContain("CREATE TABLE IF NOT EXISTS domestic_competitions");
    expect(schema).toContain("UNIQUE (save_id, club_id)");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS domestic_competition_history_rows");
    expect(schema).toContain("topology_decision_id");
    expect(schema).toContain("wage_finance_calibration_version");
    expect(schema).toContain("player_development_environment_version");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS player_participation_club_minutes");
  });

  it("stores one current competitive-tier snapshot and no history", () => {
    const schema = SQLITE_CAREER_MIGRATIONS[0]?.statements.join("\n") ?? "";

    expect(schema).toContain("CREATE TABLE IF NOT EXISTS club_competitive_tier_state");
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS club_competitive_tier_assignments");
    expect(schema).toContain("UNIQUE (save_id, club_id)");
    expect(schema).not.toContain("competitive_tier_history");
  });

  it("persists every canonical contract-history event in the clean beta baseline", () => {
    const schema = SQLITE_CAREER_MIGRATIONS[0]?.statements.join("\n") ?? "";

    expect(schema).toContain("'signed', 'renewed', 'transfer_terminated', 'expired', 'released'");
    expect(schema.match(/response_due_on INTEGER/g)).toHaveLength(3);
    expect(schema).toContain("submitted_on INTEGER,\n    response_due_on INTEGER,\n    counter_issued_on INTEGER");
    expect(schema).toContain("offered_fee INTEGER NOT NULL CHECK (offered_fee > 0)");
    expect(schema).toContain("public_value INTEGER NOT NULL CHECK (public_value > 0)");
    expect(schema).toContain("completed_fee INTEGER CHECK");
    expect(schema).toContain("created_on INTEGER NOT NULL,\n    response_due_on INTEGER,\n    future_starts_on INTEGER");
  });

  it("rejects older beta, future, and invalid schema versions without destructive recovery", () => {
    // `22` joins the obsolete list rather than being migrated: it stored shots
    // with no route column, so the fact is gone rather than absent.
    for (let version = 1; version <= 22; version += 1) {
      expect(() => planSqliteCareerMigrations(version)).toThrowError(expect.objectContaining({
        code: "unsupported_schema_version",
        relation: "obsolete_beta",
      }));
    }
    expect(() => planSqliteCareerMigrations(24)).toThrowError(expect.objectContaining({
      code: "unsupported_schema_version",
      relation: "future",
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
    initialize: vi.fn().mockResolvedValue({
      databasePath: "test.sqlite3",
      sqliteVersion: "test",
      schemaVersion: 23,
      betaResetPerformed: false,
    }),
    saveCareer: vi.fn(),
    loadCareer: vi.fn(),
    listCareers: vi.fn().mockResolvedValue([]),
    updateAutosavePolicy: vi.fn(),
    deleteCareer: vi.fn(),
    close: vi.fn(),
    ...overrides,
  };
}
