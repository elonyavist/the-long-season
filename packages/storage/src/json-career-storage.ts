import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { CareerState, SaveId } from "@game/domain";

import {
  migrateCareerSave,
  type StoredCareerSave,
} from "./career-save-envelope.ts";
import type { CareerStorage, SaveCareerInput } from "./career-storage.interface.ts";
import { createPersistableCareerState } from "./career-storage.contract.ts";
import { StorageError } from "./game-storage.interface.ts";
import {
  CURRENT_CAREER_SAVE_SCHEMA_VERSION,
  DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS,
  type CareerAutosaveIntervalDays,
  type CareerSaveMetadata,
} from "./save-metadata.ts";

/** Configuration for JSON-backed career storage. */
export interface JsonCareerStorageOptions {
  /** Directory where one JSON file per career save is stored. */
  readonly directoryPath: string;
  /** Real-clock provider, injectable for deterministic tests. */
  readonly nowISO?: () => string;
}

/** Node filesystem adapter for the canonical manager-career storage seam. */
export class JsonCareerStorage implements CareerStorage {
  private readonly directoryPath: string;
  private readonly nowISO: () => string;

  /** Creates a JSON career storage instance rooted at one directory. */
  public constructor(options: JsonCareerStorageOptions) {
    this.directoryPath = options.directoryPath;
    this.nowISO = options.nowISO ?? (() => new Date().toISOString());
  }

  /** Persists a validated career snapshot to a deterministic JSON file path. */
  public async saveCareer(input: SaveCareerInput): Promise<CareerSaveMetadata> {
    await this.ensureDirectory();

    const state = createPersistableCareerState(input.state, "save_unwritable");
    const existing = await this.loadStoredCareerIfExists(input.saveId);
    const timestamp = this.nowISO();
    const metadata: CareerSaveMetadata = {
      saveId: input.saveId,
      name: input.name,
      createdAtISO: existing?.metadata.createdAtISO ?? timestamp,
      updatedAtISO: timestamp,
      saveSchemaVersion: state.gameState.meta.saveSchemaVersion,
      autosaveIntervalDays: existing?.metadata.autosaveIntervalDays
        ?? DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS,
    };
    const storedCareer: StoredCareerSave = {
      saveSchemaVersion: CURRENT_CAREER_SAVE_SCHEMA_VERSION,
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

  /** Loads and validates one persisted career snapshot. */
  public async loadCareer(saveId: SaveId): Promise<CareerState> {
    return (await this.loadStoredCareer(saveId)).state;
  }

  /** Lists career metadata in deterministic save-ID order. */
  public async listCareers(): Promise<readonly CareerSaveMetadata[]> {
    await this.ensureDirectory();

    let entries: readonly string[];
    try {
      entries = await readdir(this.directoryPath);
    } catch (error) {
      throw new StorageError("save_unreadable", `Unable to list career saves in ${this.directoryPath}`, { cause: error });
    }

    const metadata: CareerSaveMetadata[] = [];
    for (const entry of entries) {
      if (!entry.endsWith(".career.json")) {
        continue;
      }

      metadata.push((await this.loadStoredCareerFromPath(join(this.directoryPath, entry))).metadata);
    }

    return metadata.toSorted((left, right) => String(left.saveId).localeCompare(String(right.saveId)));
  }

  /** Rewrites only policy metadata while preserving state and save timestamps. */
  public async updateAutosavePolicy(
    saveId: SaveId,
    autosaveIntervalDays: CareerAutosaveIntervalDays,
  ): Promise<CareerSaveMetadata> {
    const storedCareer = await this.loadStoredCareer(saveId);
    const metadata: CareerSaveMetadata = {
      ...storedCareer.metadata,
      autosaveIntervalDays,
    };

    try {
      await writeFile(
        this.filePathFor(saveId),
        `${JSON.stringify({ ...storedCareer, metadata }, null, 2)}\n`,
        "utf8",
      );
    } catch (error) {
      throw new StorageError("save_unwritable", `Unable to update career policy ${saveId}`, { cause: error });
    }

    return metadata;
  }

  /** Deletes one career save file. */
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

  private async ensureDirectory(): Promise<void> {
    try {
      await mkdir(this.directoryPath, { recursive: true });
    } catch (error) {
      throw new StorageError("save_unwritable", `Unable to create career save directory ${this.directoryPath}`, {
        cause: error,
      });
    }
  }

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

  private async loadStoredCareer(saveId: SaveId): Promise<StoredCareerSave> {
    return this.loadStoredCareerFromPath(this.filePathFor(saveId), saveId);
  }

  private async loadStoredCareerFromPath(filePath: string, saveId?: SaveId): Promise<StoredCareerSave> {
    let rawContents: string;
    try {
      rawContents = await readFile(filePath, "utf8");
    } catch (error) {
      if (isNodeErrorWithCode(error, "ENOENT")) {
        throw new StorageError("save_not_found", `Career save not found: ${String(saveId ?? filePath)}`, { cause: error });
      }

      throw new StorageError("save_unreadable", `Unable to read career save ${String(saveId ?? filePath)}`, {
        cause: error,
      });
    }

    try {
      return migrateCareerSave(JSON.parse(rawContents));
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      throw new StorageError("save_unreadable", `Unable to parse career save ${String(saveId ?? filePath)}`, {
        cause: error,
      });
    }
  }

  private filePathFor(saveId: SaveId): string {
    return join(this.directoryPath, `${encodeURIComponent(saveId)}.career.json`);
  }
}

function isNodeErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
