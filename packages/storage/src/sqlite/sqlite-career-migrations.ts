import { StorageError } from "../game-storage.interface.ts";
import {
  SQLITE_CAREER_SCHEMA_STATEMENTS,
  SQLITE_CAREER_SCHEMA_VERSION,
} from "./sqlite-career-schema.ts";

/** One ordered, immutable browser-career schema migration. */
export interface SqliteCareerMigration {
  readonly version: number;
  readonly statements: readonly string[];
}

/** The only supported beta baseline, applied atomically to a fresh database. */
export const SQLITE_CAREER_MIGRATIONS: readonly SqliteCareerMigration[] = [
  {
    version: SQLITE_CAREER_SCHEMA_VERSION,
    statements: SQLITE_CAREER_SCHEMA_STATEMENTS,
  },
];

type SqliteCareerSchemaVersionRelation = "obsolete_beta" | "future";

/**
 * Distinguishes resettable beta databases from newer databases that must be
 * preserved for a newer application build.
 */
class SqliteCareerSchemaVersionError extends StorageError {
  public readonly relation: SqliteCareerSchemaVersionRelation;

  public constructor(relation: SqliteCareerSchemaVersionRelation, message: string) {
    super("unsupported_schema_version", message);
    this.name = "SqliteCareerSchemaVersionError";
    this.relation = relation;
  }
}

/** Returns the ordered migrations required by an existing database version. */
export function planSqliteCareerMigrations(currentVersion: number): readonly SqliteCareerMigration[] {
  if (!Number.isSafeInteger(currentVersion) || currentVersion < 0) {
    throw new StorageError("save_unreadable", `Invalid SQLite schema version: ${currentVersion}`);
  }

  const latestVersion = SQLITE_CAREER_MIGRATIONS.at(-1)?.version ?? 0;
  if (currentVersion > latestVersion) {
    throw new SqliteCareerSchemaVersionError(
      "future",
      `SQLite schema version ${currentVersion} is newer than supported version ${latestVersion}`,
    );
  }

  const oldestIncrementalSourceVersion = SQLITE_CAREER_MIGRATIONS[0]?.version ?? latestVersion;
  if (currentVersion > 0 && currentVersion < oldestIncrementalSourceVersion) {
    throw new SqliteCareerSchemaVersionError(
      "obsolete_beta",
      `SQLite beta schema version ${currentVersion} is no longer supported; reset browser career storage to continue.`,
    );
  }

  return SQLITE_CAREER_MIGRATIONS.filter((migration) => migration.version > currentVersion);
}
