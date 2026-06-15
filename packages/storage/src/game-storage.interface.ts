import type { GameState, SaveId } from "@game/domain";

import type { SaveMetadata } from "./save-metadata.ts";

/**
 * Storage error categories exposed by persistence implementations.
 */
export type StorageErrorCode =
  | "save_not_found"
  | "save_unreadable"
  | "save_unwritable"
  | "unsupported_schema_version";

/**
 * Typed error thrown by storage implementations.
 *
 * @example
 * if (error instanceof StorageError && error.code === "save_not_found") {
 *   // Tell the UI that the save has disappeared.
 * }
 */
export class StorageError extends Error {
  /** Machine-readable reason for the storage failure. */
  public readonly code: StorageErrorCode;

  /** Optional original error for debugging filesystem or JSON failures. */
  public readonly cause?: unknown;

  /**
   * Creates a typed storage error with an optional original cause.
   */
  public constructor(code: StorageErrorCode, message: string, options?: { readonly cause?: unknown }) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    this.cause = options?.cause;
  }
}

/**
 * Input required to persist one full game snapshot.
 */
export interface SaveGameInput {
  /** Stable namespaced save ID. */
  readonly saveId: SaveId;
  /** Human-readable save name. */
  readonly name: string;
  /** Authoritative game state snapshot to persist. */
  readonly state: GameState;
}

/**
 * Persistence boundary used by apps and tooling.
 *
 * Engine code must not depend on this interface or know which implementation is
 * underneath it.
 */
export interface GameStorage {
  /**
   * Persists or replaces one game snapshot and returns its resulting metadata.
   */
  saveGame(input: SaveGameInput): Promise<SaveMetadata>;

  /**
   * Loads one game snapshot by save ID.
   */
  loadGame(saveId: SaveId): Promise<GameState>;

  /**
   * Lists save metadata in deterministic order.
   */
  listSaves(): Promise<readonly SaveMetadata[]>;

  /**
   * Deletes one saved snapshot by save ID.
   */
  deleteSave(saveId: SaveId): Promise<void>;
}
