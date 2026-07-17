import type { CareerState, SaveId } from "@game/domain";

import type {
  CareerAutosaveIntervalDays,
  CareerSaveMetadata,
} from "./save-metadata.ts";

/** Input required to persist one durable manager-career snapshot. */
export interface SaveCareerInput {
  /** Stable namespaced save ID. */
  readonly saveId: SaveId;
  /** Human-readable save name. */
  readonly name: string;
  /** Durable career state snapshot to persist. */
  readonly state: CareerState;
}

/**
 * Canonical persistence seam for manager careers.
 *
 * Implementations own serialization, timestamps, transactions and migrations.
 * Callers own football commands and pass only validated `CareerState` values.
 */
export interface CareerStorage {
  /** Persists or atomically replaces one career snapshot. */
  saveCareer(input: SaveCareerInput): Promise<CareerSaveMetadata>;

  /** Loads one validated career snapshot by save ID. */
  loadCareer(saveId: SaveId): Promise<CareerState>;

  /** Lists save metadata in deterministic save-ID order. */
  listCareers(): Promise<readonly CareerSaveMetadata[]>;

  /** Updates only save cadence metadata without committing career gameplay. */
  updateAutosavePolicy(
    saveId: SaveId,
    autosaveIntervalDays: CareerAutosaveIntervalDays,
  ): Promise<CareerSaveMetadata>;

  /** Deletes one durable career by save ID. */
  deleteCareer(saveId: SaveId): Promise<void>;
}
