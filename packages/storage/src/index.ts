/**
 * Public entrypoint for persistence boundaries.
 *
 * Storage may depend on domain/shared, but never on engine. Concrete storage
 * exports are introduced in the JSON storage step.
 */
export {
  type GameStorage,
  type SaveGameInput,
  StorageError,
  type StorageErrorCode,
} from "./game-storage.interface.ts";
export {
  type CareerStorage,
  type SaveCareerInput,
} from "./career-storage.interface.ts";
export {
  migrateCareerSave,
  type StoredCareerSave,
  type StoredCareerSaveV6,
} from "./career-save-envelope.ts";
export { JsonCareerStorage, type JsonCareerStorageOptions } from "./json-career-storage.ts";
export { JsonGameStorage, type JsonGameStorageOptions } from "./json-game-storage.ts";
export { migrateSave, type StoredSave, type StoredSaveV1 } from "./migrate-save.ts";
export {
  CURRENT_CAREER_SAVE_SCHEMA_VERSION,
  CURRENT_SAVE_SCHEMA_VERSION,
  DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS,
  isCareerAutosaveIntervalDays,
  type CareerAutosaveIntervalDays,
  type CareerSaveMetadata,
  type SaveMetadata,
} from "./save-metadata.ts";
export * from "./sqlite/index.ts";
