/** Browser-safe SQLite career persistence surface. */
export {
  SqliteCareerStorage,
  SqliteCareerStorageError,
  type SqliteCareerStorageErrorCode,
  type SqliteCareerWorkerInfo,
  type SqliteCareerWorkerPort,
} from "./sqlite-career-storage.ts";
export { StorageError, type StorageErrorCode } from "../game-storage.interface.ts";
export {
  SQLITE_CAREER_DATABASE_PATH,
  SQLITE_CAREER_SCHEMA_STATEMENTS,
  SQLITE_CAREER_SCHEMA_VERSION,
} from "./sqlite-career-schema.ts";
export {
  SQLITE_CAREER_MIGRATIONS,
  planSqliteCareerMigrations,
  type SqliteCareerMigration,
} from "./sqlite-career-migrations.ts";
export {
  loadCareerWorld,
  mapCareerWorldRows,
  reconstructCareerWorldRows,
  saveCareerWorld,
  updateCareerAutosavePolicy,
  SqliteWorldStateError,
  type SqliteBindValue,
  type SqliteWorldDatabase,
} from "./world-state-mapper.ts";
export { insertCareerStateRows, loadCareerStateRows } from "./career-state-mapper.ts";
