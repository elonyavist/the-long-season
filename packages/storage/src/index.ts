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
export { JsonGameStorage, type JsonGameStorageOptions } from "./json-game-storage.ts";
export { migrateSave, type StoredSave, type StoredSaveV1 } from "./migrate-save.ts";
export { CURRENT_SAVE_SCHEMA_VERSION, type SaveMetadata } from "./save-metadata.ts";
