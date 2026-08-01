import type { SaveId } from "@game/domain";

/**
 * Current persisted save snapshot schema version.
 *
 * Versioning starts immediately so later migrations can be explicit instead of
 * inferred from ad-hoc file shapes.
 */
export const CURRENT_SAVE_SCHEMA_VERSION = 1;

/** Current persisted career-envelope version, independent from generic saves. */
export const CURRENT_CAREER_SAVE_SCHEMA_VERSION = 13;

/** Supported in-game autosave intervals; `null` means manual-only saving. */
export type CareerAutosaveIntervalDays = 7 | 15 | null;

/** Default cadence for newly created and deterministically migrated careers. */
export const DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS: CareerAutosaveIntervalDays = 7;

/**
 * Metadata stored beside a full `GameState` snapshot.
 *
 * These fields are storage concerns. `createdAtISO` and `updatedAtISO` use the
 * real clock and are therefore allowed here, but not inside engine game time.
 */
export interface SaveMetadata {
  /** Stable namespaced save identifier, for example `save:demo-001`. */
  readonly saveId: SaveId;
  /** Human-readable save name shown by callers. */
  readonly name: string;
  /** Real-world ISO timestamp for first creation. */
  readonly createdAtISO: string;
  /** Real-world ISO timestamp for last update. */
  readonly updatedAtISO: string;
  /** Persisted save snapshot schema version. */
  readonly saveSchemaVersion: number;
}

/** Per-career metadata kept outside the dirty gameplay graph. */
export interface CareerSaveMetadata extends SaveMetadata {
  /** In-game day interval, or `null` when only explicit saves are allowed. */
  readonly autosaveIntervalDays: CareerAutosaveIntervalDays;
}

/** Narrows unknown persisted values to the supported autosave policy. */
export function isCareerAutosaveIntervalDays(value: unknown): value is CareerAutosaveIntervalDays {
  return value === null || value === 7 || value === 15;
}
