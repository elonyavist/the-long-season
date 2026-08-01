import type { CareerState } from "@game/domain";

import { StorageError } from "./game-storage.interface.ts";
import {
  CURRENT_CAREER_SAVE_SCHEMA_VERSION,
  isCareerAutosaveIntervalDays,
  type CareerSaveMetadata,
  type SaveMetadata,
} from "./save-metadata.ts";
import { createPersistableCareerState } from "./career-storage.contract.ts";

/** Persisted career save envelope for the complete Phase 80A beta baseline. */
export interface StoredCareerSaveV13 {
  readonly saveSchemaVersion: typeof CURRENT_CAREER_SAVE_SCHEMA_VERSION;
  readonly metadata: CareerSaveMetadata;
  readonly state: CareerState;
}

/** Current persisted career save shape after migration. */
export type StoredCareerSave = StoredCareerSaveV13;

/**
 * Validates an unknown persisted career envelope against the current beta baseline.
 *
 * Earlier beta career files are intentionally rejected instead of migrated.
 * The project is still in beta, and old snapshots do not carry the complete
 * Phase 80A projection, valuation, and development-policy epoch.
 */
export function migrateCareerSave(rawSave: unknown): StoredCareerSave {
  if (!isRecord(rawSave)) {
    throw new StorageError("save_unreadable", "Career save file must contain a JSON object");
  }

  const version = rawSave.saveSchemaVersion;
  if (version !== CURRENT_CAREER_SAVE_SCHEMA_VERSION) {
    throw new StorageError(
      "unsupported_schema_version",
      `Unsupported beta career save schema version: ${String(version)}; reset the career save to continue.`,
    );
  }

  if (!isRecord(rawSave.metadata)) {
    throw new StorageError("save_unreadable", "Career save metadata must be an object");
  }

  if (!isRecord(rawSave.state)) {
    throw new StorageError("save_unreadable", "Career save state must be an object");
  }

  const metadata = rawSave.metadata as Readonly<Record<string, unknown>>;
  const autosaveIntervalDays = metadata.autosaveIntervalDays;
  if (!isCareerAutosaveIntervalDays(autosaveIntervalDays)) {
    throw new StorageError("save_unreadable", "Career autosave policy is invalid");
  }

  return {
    saveSchemaVersion: CURRENT_CAREER_SAVE_SCHEMA_VERSION,
    metadata: {
      ...(metadata as unknown as SaveMetadata),
      autosaveIntervalDays,
    },
    state: createPersistableCareerState(
      rawSave.state as unknown as CareerState,
      "unsupported_schema_version",
    ),
  };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
