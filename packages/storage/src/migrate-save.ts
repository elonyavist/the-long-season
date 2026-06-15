import type { GameState } from "@game/domain";

import { StorageError } from "./game-storage.interface.ts";
import { CURRENT_SAVE_SCHEMA_VERSION, type SaveMetadata } from "./save-metadata.ts";

/**
 * Persisted save file shape for schema version 1.
 */
export interface StoredSaveV1 {
  /** Schema version duplicated at envelope level for quick migration routing. */
  readonly saveSchemaVersion: typeof CURRENT_SAVE_SCHEMA_VERSION;
  /** Metadata used for save selection and listing. */
  readonly metadata: SaveMetadata;
  /** Full authoritative game state snapshot. */
  readonly state: GameState;
}

/**
 * Current persisted save file shape after migration.
 */
export type StoredSave = StoredSaveV1;

/**
 * Migrates an unknown persisted save object to the current schema.
 *
 * Version 1 is currently the first and only schema, so migration is an identity
 * operation after basic shape validation.
 *
 * @example
 * const current = migrateSave(JSON.parse(fileContents));
 */
export function migrateSave(rawSave: unknown): StoredSave {
  if (!isRecord(rawSave)) {
    throw new StorageError("save_unreadable", "Save file must contain a JSON object");
  }

  const version = rawSave.saveSchemaVersion;
  if (version !== CURRENT_SAVE_SCHEMA_VERSION) {
    throw new StorageError(
      "unsupported_schema_version",
      `Unsupported save schema version: ${String(version)}`,
    );
  }

  if (!isRecord(rawSave.metadata)) {
    throw new StorageError("save_unreadable", "Save file metadata must be an object");
  }

  if (!isRecord(rawSave.state)) {
    throw new StorageError("save_unreadable", "Save file state must be an object");
  }

  return rawSave as unknown as StoredSaveV1;
}

/**
 * Checks whether an unknown value can be inspected as an object record.
 */
function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
