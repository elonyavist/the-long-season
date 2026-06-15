import type { SaveId } from "@game/domain";

/**
 * Current persisted save snapshot schema version.
 *
 * Versioning starts immediately so later migrations can be explicit instead of
 * inferred from ad-hoc file shapes.
 */
export const CURRENT_SAVE_SCHEMA_VERSION = 1;

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
