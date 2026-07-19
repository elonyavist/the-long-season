import { createCareerState, type CareerState, type SaveId } from "@game/domain";

import type { CareerStorage, SaveCareerInput } from "../career-storage.interface.ts";
import { StorageError } from "../game-storage.interface.ts";
import type {
  CareerAutosaveIntervalDays,
  CareerSaveMetadata,
} from "../save-metadata.ts";

/** Machine-readable failures specific to the browser SQLite runtime. */
export type SqliteCareerStorageErrorCode =
  | "sqlite_unavailable"
  | "opfs_unavailable"
  | "worker_unavailable"
  | "unsupported_bootstrap_state";

/** Typed error surfaced when durable browser persistence cannot operate. */
export class SqliteCareerStorageError extends Error {
  public readonly code: SqliteCareerStorageErrorCode;
  public readonly cause?: unknown;

  public constructor(code: SqliteCareerStorageErrorCode, message: string, options?: { readonly cause?: unknown }) {
    super(message);
    this.name = "SqliteCareerStorageError";
    this.code = code;
    this.cause = options?.cause;
  }
}

/** Structured values returned by the worker during initialization. */
export interface SqliteCareerWorkerInfo {
  readonly databasePath: string;
  readonly sqliteVersion: string;
  readonly schemaVersion: number;
}

/** Browser-worker protocol consumed by the framework-free storage adapter. */
export interface SqliteCareerWorkerPort {
  initialize(): Promise<SqliteCareerWorkerInfo>;
  saveCareer(input: SaveCareerInput): Promise<CareerSaveMetadata>;
  loadCareer(saveId: SaveId): Promise<CareerState>;
  listCareers(): Promise<readonly CareerSaveMetadata[]>;
  updateAutosavePolicy(
    saveId: SaveId,
    autosaveIntervalDays: CareerAutosaveIntervalDays,
  ): Promise<CareerSaveMetadata>;
  deleteCareer(saveId: SaveId): Promise<void>;
  close(): Promise<void>;
}

/**
 * Canonical `CareerStorage` implementation coordinated through one web worker.
 *
 * SQLite APIs never cross this boundary. The adapter validates domain state
 * before writing and normalizes worker failures into stable storage errors.
 */
export class SqliteCareerStorage implements CareerStorage {
  private readonly worker: SqliteCareerWorkerPort;
  private initialized = false;

  public constructor(worker: SqliteCareerWorkerPort) {
    this.worker = worker;
  }

  /** Initializes SQLite and returns diagnostic facts for browser QA. */
  public async initialize(): Promise<SqliteCareerWorkerInfo> {
    try {
      const info = await this.worker.initialize();
      this.initialized = true;
      return info;
    } catch (error) {
      throw normalizeSqliteError(error, "SQLite browser storage could not be initialized");
    }
  }

  public async saveCareer(input: SaveCareerInput): Promise<CareerSaveMetadata> {
    await this.ensureInitialized();
    const state = createCareerState(input.state);

    try {
      return await this.worker.saveCareer({ ...input, state });
    } catch (error) {
      throw normalizeSqliteError(error, `Career could not be saved: ${input.saveId}`);
    }
  }

  public async loadCareer(saveId: SaveId): Promise<CareerState> {
    await this.ensureInitialized();

    try {
      return createCareerState(await this.worker.loadCareer(saveId));
    } catch (error) {
      if (isWorkerError(error, "save_not_found")) {
        throw new StorageError("save_not_found", `Career save not found: ${saveId}`, { cause: error });
      }

      throw normalizeSqliteError(error, `Career could not be loaded: ${saveId}`);
    }
  }

  public async listCareers(): Promise<readonly CareerSaveMetadata[]> {
    await this.ensureInitialized();

    try {
      return await this.worker.listCareers();
    } catch (error) {
      throw normalizeSqliteError(error, "Career saves could not be listed");
    }
  }

  public async updateAutosavePolicy(
    saveId: SaveId,
    autosaveIntervalDays: CareerAutosaveIntervalDays,
  ): Promise<CareerSaveMetadata> {
    await this.ensureInitialized();

    try {
      return await this.worker.updateAutosavePolicy(saveId, autosaveIntervalDays);
    } catch (error) {
      if (isWorkerError(error, "save_not_found")) {
        throw new StorageError("save_not_found", `Career save not found: ${saveId}`, { cause: error });
      }
      throw normalizeSqliteError(error, `Career autosave policy could not be updated: ${saveId}`);
    }
  }

  public async deleteCareer(saveId: SaveId): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.worker.deleteCareer(saveId);
    } catch (error) {
      if (isWorkerError(error, "save_not_found")) {
        throw new StorageError("save_not_found", `Career save not found: ${saveId}`, { cause: error });
      }
      throw normalizeSqliteError(error, `Career could not be deleted: ${saveId}`);
    }
  }

  /** Closes the worker-owned database connection. */
  public async close(): Promise<void> {
    if (!this.initialized) return;
    await this.worker.close();
    this.initialized = false;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) await this.initialize();
  }
}

function normalizeSqliteError(error: unknown, message: string): Error {
  if (error instanceof StorageError || error instanceof SqliteCareerStorageError) return error;

  const code = workerErrorCode(error);
  const detailedMessage = `${message}: ${workerErrorMessage(error)}`;
  if (code === "save_not_found" || code === "save_unreadable" || code === "save_unwritable") {
    return new StorageError(code, detailedMessage, { cause: error });
  }
  if (code === "storage_busy" || code === "storage_quota_exceeded") {
    return new StorageError(code, detailedMessage, { cause: error });
  }
  if (code === "unsupported_schema_version" || code === "unsupported_bootstrap_state") {
    return new StorageError("unsupported_schema_version", detailedMessage, { cause: error });
  }
  if (code === "sqlite_unavailable" || code === "opfs_unavailable") {
    return new SqliteCareerStorageError(code, detailedMessage, { cause: error });
  }

  return new SqliteCareerStorageError("worker_unavailable", detailedMessage, { cause: error });
}

function isWorkerError(error: unknown, expectedCode: string): boolean {
  return workerErrorCode(error) === expectedCode;
}

function workerErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

function workerErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return String(error);
}
