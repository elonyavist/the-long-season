import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  createCareerState,
  type CareerState,
  type SaveId,
} from "@game/domain";

import { StorageError } from "./game-storage.interface.ts";
import { CURRENT_SAVE_SCHEMA_VERSION, type SaveMetadata } from "./save-metadata.ts";

/**
 * Input required to persist one durable career snapshot.
 */
export interface SaveCareerInput {
  /** Stable namespaced save ID. */
  readonly saveId: SaveId;
  /** Human-readable save name. */
  readonly name: string;
  /** Durable career state snapshot to persist. */
  readonly state: CareerState;
}

/**
 * Persistence boundary for career saves.
 *
 * This sits beside `GameStorage`: game saves persist raw `GameState`, while
 * career saves persist the manager-facing wrapper that includes selected club,
 * market funds, and transfer history.
 */
export interface CareerStorage {
  /** Persists or replaces one career snapshot. */
  saveCareer(input: SaveCareerInput): Promise<SaveMetadata>;

  /** Loads one durable career snapshot by save ID. */
  loadCareer(saveId: SaveId): Promise<CareerState>;

  /** Deletes one durable career snapshot by save ID. */
  deleteCareer(saveId: SaveId): Promise<void>;
}

/**
 * Persisted career save envelope for schema version 1.
 */
export interface StoredCareerSaveV1 {
  /** Envelope schema version used by storage migrations. */
  readonly saveSchemaVersion: typeof CURRENT_SAVE_SCHEMA_VERSION;
  /** Metadata used for save selection and listing. */
  readonly metadata: SaveMetadata;
  /** Durable career state snapshot. */
  readonly state: CareerState;
}

/** Current persisted career save shape. */
export type StoredCareerSave = StoredCareerSaveV1;

/**
 * Configuration for JSON-backed career storage.
 */
export interface JsonCareerStorageOptions {
  /** Directory where one JSON file per career save is stored. */
  readonly directoryPath: string;
  /** Real-clock provider, injectable for deterministic tests. */
  readonly nowISO?: () => string;
}

/**
 * Node JSON implementation of `CareerStorage`.
 *
 * The adapter stores full `CareerState` snapshots. It does not apply transfers,
 * advance the season, or interpret market decisions.
 */
export class JsonCareerStorage implements CareerStorage {
  private readonly directoryPath: string;
  private readonly nowISO: () => string;

  /**
   * Creates a JSON career storage instance rooted at one directory.
   *
   * @example
   * const storage = new JsonCareerStorage({ directoryPath: ".career-saves" });
   */
  public constructor(options: JsonCareerStorageOptions) {
    this.directoryPath = options.directoryPath;
    this.nowISO = options.nowISO ?? (() => new Date().toISOString());
  }

  /**
   * Persists a validated career snapshot to a deterministic JSON file path.
   */
  public async saveCareer(input: SaveCareerInput): Promise<SaveMetadata> {
    await this.ensureDirectory();

    const state = createCareerState(input.state);
    const existing = await this.loadStoredCareerIfExists(input.saveId);
    const timestamp = this.nowISO();
    const metadata: SaveMetadata = {
      saveId: input.saveId,
      name: input.name,
      createdAtISO: existing?.metadata.createdAtISO ?? timestamp,
      updatedAtISO: timestamp,
      saveSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    };
    const storedCareer: StoredCareerSave = {
      saveSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      metadata,
      state,
    };

    try {
      await writeFile(this.filePathFor(input.saveId), `${JSON.stringify(storedCareer, null, 2)}\n`, "utf8");
    } catch (error) {
      throw new StorageError("save_unwritable", `Unable to write career save ${input.saveId}`, { cause: error });
    }

    return metadata;
  }

  /**
   * Loads and validates one persisted career snapshot.
   */
  public async loadCareer(saveId: SaveId): Promise<CareerState> {
    const storedCareer = await this.loadStoredCareer(saveId);

    return storedCareer.state;
  }

  /**
   * Deletes one career save file. Missing saves are reported as typed errors.
   */
  public async deleteCareer(saveId: SaveId): Promise<void> {
    try {
      await unlink(this.filePathFor(saveId));
    } catch (error) {
      if (isNodeErrorWithCode(error, "ENOENT")) {
        throw new StorageError("save_not_found", `Career save not found: ${saveId}`, { cause: error });
      }

      throw new StorageError("save_unwritable", `Unable to delete career save ${saveId}`, { cause: error });
    }
  }

  /**
   * Ensures the career-save directory exists before read/write operations.
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await mkdir(this.directoryPath, { recursive: true });
    } catch (error) {
      throw new StorageError("save_unwritable", `Unable to create career save directory ${this.directoryPath}`, {
        cause: error,
      });
    }
  }

  /**
   * Loads a career save if it exists, returning undefined for missing files.
   */
  private async loadStoredCareerIfExists(saveId: SaveId): Promise<StoredCareerSave | undefined> {
    try {
      return await this.loadStoredCareer(saveId);
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        return undefined;
      }

      throw error;
    }
  }

  /**
   * Loads and validates one persisted career envelope by save ID.
   */
  private async loadStoredCareer(saveId: SaveId): Promise<StoredCareerSave> {
    let rawContents: string;
    try {
      rawContents = await readFile(this.filePathFor(saveId), "utf8");
    } catch (error) {
      if (isNodeErrorWithCode(error, "ENOENT")) {
        throw new StorageError("save_not_found", `Career save not found: ${saveId}`, { cause: error });
      }

      throw new StorageError("save_unreadable", `Unable to read career save ${saveId}`, { cause: error });
    }

    try {
      return migrateCareerSave(JSON.parse(rawContents));
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      throw new StorageError("save_unreadable", `Unable to parse career save ${saveId}`, { cause: error });
    }
  }

  /**
   * Builds a filesystem-safe JSON file path for one career save ID.
   */
  private filePathFor(saveId: SaveId): string {
    return join(this.directoryPath, `${encodeURIComponent(saveId)}.career.json`);
  }
}

/**
 * Migrates an unknown persisted career object to the current schema.
 *
 * Version 1 is the first career-save schema, so migration is identity after
 * envelope and career-state validation.
 */
export function migrateCareerSave(rawSave: unknown): StoredCareerSave {
  if (!isRecord(rawSave)) {
    throw new StorageError("save_unreadable", "Career save file must contain a JSON object");
  }

  const version = rawSave.saveSchemaVersion;
  if (version !== CURRENT_SAVE_SCHEMA_VERSION) {
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

  return {
    saveSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    metadata: rawSave.metadata as unknown as SaveMetadata,
    state: createCareerState(rawSave.state as unknown as CareerState),
  };
}

/**
 * Checks whether an unknown value can be inspected as an object record.
 */
function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Checks a Node-style error code without depending on Node type declarations.
 */
function isNodeErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
