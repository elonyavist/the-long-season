import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { GameState, SaveId } from "@game/domain";

import type { GameStorage, SaveGameInput } from "./game-storage.interface.ts";
import { StorageError } from "./game-storage.interface.ts";
import { migrateSave, type StoredSave } from "./migrate-save.ts";
import { CURRENT_SAVE_SCHEMA_VERSION, type SaveMetadata } from "./save-metadata.ts";

/**
 * Configuration for JSON-backed save storage.
 */
export interface JsonGameStorageOptions {
  /** Directory where one JSON file per save is stored. */
  readonly directoryPath: string;
  /** Real-clock provider, injectable for deterministic tests. */
  readonly nowISO?: () => string;
}

/**
 * Node JSON implementation of `GameStorage`.
 *
 * This is a Phase 0/1 debug and CLI storage backend. It deliberately stores a
 * full `GameState` snapshot and does not normalize data into another store.
 */
export class JsonGameStorage implements GameStorage {
  private readonly directoryPath: string;
  private readonly nowISO: () => string;

  /**
   * Creates a JSON storage instance rooted at one directory.
   *
   * @example
   * const storage = new JsonGameStorage({ directoryPath: ".saves" });
   */
  public constructor(options: JsonGameStorageOptions) {
    this.directoryPath = options.directoryPath;
    this.nowISO = options.nowISO ?? (() => new Date().toISOString());
  }

  /**
   * Persists a full game state snapshot to a deterministic JSON file path.
   */
  public async saveGame(input: SaveGameInput): Promise<SaveMetadata> {
    await this.ensureDirectory();

    const existing = await this.loadStoredSaveIfExists(input.saveId);
    const timestamp = this.nowISO();
    const metadata: SaveMetadata = {
      saveId: input.saveId,
      name: input.name,
      createdAtISO: existing?.metadata.createdAtISO ?? timestamp,
      updatedAtISO: timestamp,
      saveSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    };
    const storedSave: StoredSave = {
      saveSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      metadata,
      state: input.state,
    };

    try {
      await writeFile(this.filePathFor(input.saveId), `${JSON.stringify(storedSave, null, 2)}\n`, "utf8");
    } catch (error) {
      throw new StorageError("save_unwritable", `Unable to write save ${input.saveId}`, { cause: error });
    }

    return metadata;
  }

  /**
   * Loads and migrates one saved game state snapshot.
   */
  public async loadGame(saveId: SaveId): Promise<GameState> {
    const storedSave = await this.loadStoredSave(saveId);

    return storedSave.state;
  }

  /**
   * Reads all save metadata and sorts it by save ID for deterministic output.
   */
  public async listSaves(): Promise<readonly SaveMetadata[]> {
    await this.ensureDirectory();

    let entries: readonly string[];
    try {
      entries = await readdir(this.directoryPath);
    } catch (error) {
      throw new StorageError("save_unreadable", `Unable to list saves in ${this.directoryPath}`, { cause: error });
    }

    const metadata: SaveMetadata[] = [];
    for (const entry of entries) {
      if (!entry.endsWith(".json")) {
        continue;
      }

      const storedSave = await this.loadStoredSaveFromPath(join(this.directoryPath, entry));
      metadata.push(storedSave.metadata);
    }

    return metadata.toSorted((left, right) => String(left.saveId).localeCompare(String(right.saveId)));
  }

  /**
   * Deletes one save file. Missing saves are reported as typed storage errors.
   */
  public async deleteSave(saveId: SaveId): Promise<void> {
    try {
      await unlink(this.filePathFor(saveId));
    } catch (error) {
      if (isNodeErrorWithCode(error, "ENOENT")) {
        throw new StorageError("save_not_found", `Save not found: ${saveId}`, { cause: error });
      }

      throw new StorageError("save_unwritable", `Unable to delete save ${saveId}`, { cause: error });
    }
  }

  /**
   * Ensures the save directory exists before read/write operations.
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await mkdir(this.directoryPath, { recursive: true });
    } catch (error) {
      throw new StorageError("save_unwritable", `Unable to create save directory ${this.directoryPath}`, {
        cause: error,
      });
    }
  }

  /**
   * Loads a save if it exists, returning undefined for missing files.
   */
  private async loadStoredSaveIfExists(saveId: SaveId): Promise<StoredSave | undefined> {
    try {
      return await this.loadStoredSave(saveId);
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        return undefined;
      }

      throw error;
    }
  }

  /**
   * Loads one persisted save envelope by save ID.
   */
  private async loadStoredSave(saveId: SaveId): Promise<StoredSave> {
    return this.loadStoredSaveFromPath(this.filePathFor(saveId), saveId);
  }

  /**
   * Loads and migrates one persisted save envelope from a specific path.
   */
  private async loadStoredSaveFromPath(filePath: string, saveId?: SaveId): Promise<StoredSave> {
    let rawContents: string;
    try {
      rawContents = await readFile(filePath, "utf8");
    } catch (error) {
      if (isNodeErrorWithCode(error, "ENOENT")) {
        throw new StorageError("save_not_found", `Save not found: ${String(saveId ?? filePath)}`, { cause: error });
      }

      throw new StorageError("save_unreadable", `Unable to read save ${String(saveId ?? filePath)}`, {
        cause: error,
      });
    }

    try {
      return migrateSave(JSON.parse(rawContents));
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      throw new StorageError("save_unreadable", `Unable to parse save ${String(saveId ?? filePath)}`, {
        cause: error,
      });
    }
  }

  /**
   * Builds a filesystem-safe JSON file path for one save ID.
   */
  private filePathFor(saveId: SaveId): string {
    return join(this.directoryPath, `${encodeURIComponent(saveId)}.json`);
  }
}

/**
 * Checks a Node-style error code without depending on Node type declarations.
 */
function isNodeErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
