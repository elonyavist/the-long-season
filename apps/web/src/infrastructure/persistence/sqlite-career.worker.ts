/// <reference lib="webworker" />

import sqlite3InitModule, { type Database } from "@sqlite.org/sqlite-wasm";
import { expose } from "comlink";

import {
  SQLITE_CAREER_DATABASE_PATH,
  SQLITE_CAREER_SCHEMA_STATEMENTS,
  SQLITE_CAREER_SCHEMA_VERSION,
  loadCareerWorld,
  saveCareerWorld,
  updateCareerAutosavePolicy,
  SqliteWorldStateError,
  planSqliteCareerMigrations,
  type SqliteWorldDatabase,
  type SqliteCareerWorkerPort,
} from "@game/storage/sqlite";

type WorkerSaveMetadata = Awaited<ReturnType<SqliteCareerWorkerPort["saveCareer"]>>;

let database: Database | undefined;
let sqliteVersion: string | undefined;
let betaResetPerformed = false;

/** Worker-owned SQLite/OPFS implementation. No database handle crosses Comlink. */
const workerApi: SqliteCareerWorkerPort = {
  async initialize() {
    if (database !== undefined && sqliteVersion !== undefined) {
      return workerInfo(sqliteVersion, betaResetPerformed);
    }

    try {
      const sqlite3 = await sqlite3InitModule();
      const OpfsDb = sqlite3.oo1.OpfsDb as typeof sqlite3.oo1.OpfsDb | undefined;

      if (OpfsDb === undefined || sqlite3.capi.sqlite3_vfs_find("opfs") === 0) {
        throw workerFailure("opfs_unavailable", "SQLite OPFS VFS is unavailable");
      }

      database = new OpfsDb(SQLITE_CAREER_DATABASE_PATH, "c");
      sqliteVersion = sqlite3.version.libVersion;
      database.exec("PRAGMA foreign_keys = ON");
      try {
        applyMigrations(database);
      } catch (error) {
        if (!isObsoleteBetaSchemaVersion(error)) {
          if (isUnsupportedSchemaVersion(error)) {
            throw workerFailure("unsupported_schema_version", errorMessage(error));
          }
          throw error;
        }

        database.close();
        database = undefined;
        await deleteBetaDatabase();
        database = new OpfsDb(SQLITE_CAREER_DATABASE_PATH, "c");
        database.exec("PRAGMA foreign_keys = ON");
        applyMigrations(database);
        betaResetPerformed = true;
      }
      return workerInfo(sqliteVersion, betaResetPerformed);
    } catch (error) {
      database?.close();
      database = undefined;
      sqliteVersion = undefined;
      betaResetPerformed = false;

      if (hasWorkerCode(error)) throw error;
      throw workerFailure("sqlite_unavailable", errorMessage(error));
    }
  },

  async saveCareer(input) {
    const db = requiredDatabase();
    try {
      return saveCareerWorld(worldDatabase(db), input, new Date().toISOString());
    } catch (error) {
      throw normalizeWorkerOperationError(error);
    }
  },

  async loadCareer(saveId) {
    try {
      return loadCareerWorld(worldDatabase(requiredDatabase()), saveId);
    } catch (error) {
      throw normalizeWorkerOperationError(error);
    }
  },

  async listCareers() {
    return queryAll(
      requiredDatabase(),
      `SELECT save_id, name, created_at_iso, updated_at_iso, save_schema_version,
        autosave_interval_days
       FROM career_saves ORDER BY save_id`,
    ).map((row) => ({
      saveId: requiredText(row, "save_id"),
      name: requiredText(row, "name"),
      createdAtISO: requiredText(row, "created_at_iso"),
      updatedAtISO: requiredText(row, "updated_at_iso"),
      saveSchemaVersion: requiredNumber(row, "save_schema_version"),
      autosaveIntervalDays: requiredAutosavePolicy(row, "autosave_interval_days"),
    })) as unknown as readonly WorkerSaveMetadata[];
  },

  async updateAutosavePolicy(saveId, autosaveIntervalDays) {
    try {
      return updateCareerAutosavePolicy(worldDatabase(requiredDatabase()), saveId, autosaveIntervalDays);
    } catch (error) {
      throw normalizeWorkerOperationError(error);
    }
  },

  async deleteCareer(saveId) {
    run(requiredDatabase(), "DELETE FROM career_saves WHERE save_id = ?", [saveId]);
  },

  async close() {
    database?.close();
    database = undefined;
    sqliteVersion = undefined;
    betaResetPerformed = false;
  },
};

expose(workerApi);

function workerInfo(version: string, didResetBetaDatabase: boolean) {
  return {
    databasePath: SQLITE_CAREER_DATABASE_PATH,
    sqliteVersion: version,
    schemaVersion: SQLITE_CAREER_SCHEMA_VERSION,
    betaResetPerformed: didResetBetaDatabase,
  };
}

/** Removes only the known OPFS beta database after its connection is closed. */
async function deleteBetaDatabase(): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const fileName = SQLITE_CAREER_DATABASE_PATH.replace(/^\/+/, "");

  try {
    await root.removeEntry(fileName);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return;
    throw error;
  }
}

function isUnsupportedSchemaVersion(error: unknown): boolean {
  return hasWorkerCode(error) && error.code === "unsupported_schema_version";
}

function isObsoleteBetaSchemaVersion(error: unknown): boolean {
  return isUnsupportedSchemaVersion(error)
    && typeof error === "object"
    && error !== null
    && "relation" in error
    && error.relation === "obsolete_beta";
}

function applyMigrations(db: Database): void {
  db.exec(SQLITE_CAREER_SCHEMA_STATEMENTS[0]);
  const currentVersion = Number(queryScalar(db, "SELECT COALESCE(MAX(version), 0) FROM schema_migrations") ?? 0);

  for (const migration of planSqliteCareerMigrations(currentVersion)) {
    inTransaction(db, () => {
      migration.statements.forEach((statement) => db.exec(statement));
      run(db, "INSERT INTO schema_migrations (version, applied_at_iso) VALUES (?, ?)", [migration.version, new Date().toISOString()]);
    });
  }
}

function requiredDatabase(): Database {
  if (database === undefined) throw workerFailure("sqlite_unavailable", "SQLite worker is not initialized");
  return database;
}

function worldDatabase(db: Database): SqliteWorldDatabase {
  return {
    run(sql, bind = []) {
      run(db, sql, bind);
    },
    queryAll(sql, bind = []) {
      return queryAll(db, sql, bind);
    },
    transaction(operation) {
      let value: ReturnType<typeof operation>;
      inTransaction(db, () => {
        value = operation();
      });
      return value!;
    },
  };
}

function normalizeWorkerOperationError(error: unknown): unknown {
  if (error instanceof SqliteWorldStateError) return workerFailure(error.code, error.message);
  if (hasWorkerCode(error)) return error;
  return workerFailure("sqlite_unavailable", errorMessage(error));
}

function inTransaction(db: Database, operation: () => void): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    operation();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function run(db: Database, sql: string, bind: readonly (string | number | null)[] = []): void {
  const statement = db.prepare(sql);
  try {
    if (bind.length > 0) statement.bind(bind);
    statement.step();
  } finally {
    statement.finalize();
  }
}

function queryAll(db: Database, sql: string, bind: readonly (string | number | null)[] = []): Record<string, unknown>[] {
  return db.exec({ sql, bind, rowMode: "object", returnValue: "resultRows" }) as Record<string, unknown>[];
}

function queryScalar(db: Database, sql: string): unknown {
  return db.exec({ sql, rowMode: 0, returnValue: "resultRows" })[0];
}

function requiredText(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw workerFailure("sqlite_unavailable", `SQLite column ${key} is not text`);
  return value;
}

function requiredNumber(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value === "number") return value;
  if (typeof value === "bigint" && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) return Number(value);
  throw workerFailure("sqlite_unavailable", `SQLite column ${key} is not a safe numeric value (${typeof value}:${String(value)})`);
}

function requiredAutosavePolicy(row: Record<string, unknown>, key: string): 7 | 15 | null {
  const value = row[key];
  const numericValue = typeof value === "bigint" ? Number(value) : value;
  if (numericValue === null || numericValue === 7 || numericValue === 15) return numericValue;
  throw workerFailure("sqlite_unavailable", `SQLite column ${key} is not an autosave policy`);
}

function workerFailure(code: string, message: string): { readonly code: string; readonly message: string } {
  return { code, message };
}

function hasWorkerCode(error: unknown): error is { readonly code: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
