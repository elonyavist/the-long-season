import { createCareerState, type CareerState } from "@game/domain";

import { StorageError } from "./game-storage.interface.ts";
import {
  CURRENT_CAREER_SAVE_SCHEMA_VERSION,
  DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS,
  isCareerAutosaveIntervalDays,
  type CareerSaveMetadata,
  type SaveMetadata,
} from "./save-metadata.ts";

/** Persisted career save envelope for schema version 1. */
export interface StoredCareerSaveV1 {
  /** Envelope schema version used by storage migrations. */
  readonly saveSchemaVersion: 1;
  /** Metadata used for save selection and listing. */
  readonly metadata: SaveMetadata;
  /** Durable career state snapshot. */
  readonly state: CareerState;
}

/** Persisted career save envelope with explicit save-cadence metadata. */
export interface StoredCareerSaveV2 {
  readonly saveSchemaVersion: typeof CURRENT_CAREER_SAVE_SCHEMA_VERSION;
  readonly metadata: CareerSaveMetadata;
  readonly state: CareerState;
}

/** Current persisted career save shape after migration. */
export type StoredCareerSave = StoredCareerSaveV2;

/**
 * Migrates an unknown persisted career envelope to the current schema.
 *
 * Version 1 gains the default seven-day policy. Football-state invariants stay
 * delegated to `createCareerState` in both versions.
 */
export function migrateCareerSave(rawSave: unknown): StoredCareerSave {
  if (!isRecord(rawSave)) {
    throw new StorageError("save_unreadable", "Career save file must contain a JSON object");
  }

  const version = rawSave.saveSchemaVersion;
  if (version !== 1 && version !== CURRENT_CAREER_SAVE_SCHEMA_VERSION) {
    throw new StorageError(
      "unsupported_schema_version",
      `Unsupported career save schema version: ${String(version)}`,
    );
  }

  if (!isRecord(rawSave.metadata)) {
    throw new StorageError("save_unreadable", "Career save metadata must be an object");
  }

  if (!isRecord(rawSave.state)) {
    throw new StorageError("save_unreadable", "Career save state must be an object");
  }

  const metadata = rawSave.metadata as Readonly<Record<string, unknown>>;
  const autosaveIntervalDays = version === 1
    ? DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS
    : metadata.autosaveIntervalDays;
  if (!isCareerAutosaveIntervalDays(autosaveIntervalDays)) {
    throw new StorageError("save_unreadable", "Career autosave policy is invalid");
  }

  return {
    saveSchemaVersion: CURRENT_CAREER_SAVE_SCHEMA_VERSION,
    metadata: {
      ...(metadata as unknown as SaveMetadata),
      autosaveIntervalDays,
    },
    state: createCareerState(rawSave.state as unknown as CareerState),
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
