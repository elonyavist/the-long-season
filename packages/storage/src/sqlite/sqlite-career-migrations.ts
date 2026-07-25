import {
  SQLITE_CAREER_SCHEMA_V1_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V2_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V3_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V4_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V5_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V6_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V7_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V8_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V10_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V11_STATEMENTS,
  SQLITE_CAREER_SCHEMA_V12_STATEMENTS,
} from "./sqlite-career-schema.ts";
import { StorageError } from "../game-storage.interface.ts";

/** One ordered, immutable browser-career schema migration. */
export interface SqliteCareerMigration {
  readonly version: number;
  readonly statements: readonly string[];
}

/** Ordered migrations applied atomically by the browser worker. */
export const SQLITE_CAREER_MIGRATIONS: readonly SqliteCareerMigration[] = [
  {
    version: 13,
    statements: [
      ...SQLITE_CAREER_SCHEMA_V1_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V2_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V3_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V4_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V5_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V6_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V7_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V8_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V10_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V11_STATEMENTS,
      ...SQLITE_CAREER_SCHEMA_V12_STATEMENTS,
    ],
  },
];

/** Returns the ordered migrations required by an existing database version. */
export function planSqliteCareerMigrations(currentVersion: number): readonly SqliteCareerMigration[] {
  if (!Number.isSafeInteger(currentVersion) || currentVersion < 0) {
    throw new StorageError("save_unreadable", `Invalid SQLite schema version: ${currentVersion}`);
  }

  const latestVersion = SQLITE_CAREER_MIGRATIONS.at(-1)?.version ?? 0;
  if (currentVersion > latestVersion) {
    throw new StorageError(
      "unsupported_schema_version",
      `SQLite schema version ${currentVersion} is newer than supported version ${latestVersion}`,
    );
  }

  if (currentVersion > 0 && currentVersion < latestVersion) {
    throw new StorageError(
      "unsupported_schema_version",
      `SQLite beta schema version ${currentVersion} is no longer supported; reset browser career storage to continue.`,
    );
  }

  return SQLITE_CAREER_MIGRATIONS.filter((migration) => migration.version > currentVersion);
}
