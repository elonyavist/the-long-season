import type { ClubId, PlayerId, SaveId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { Money } from "../value-objects/money.ts";
import { createMarketState, type MarketState } from "../entities/transfer.entity.ts";
import type { GameState } from "./game-state.ts";

/** Current schema version for durable career-state snapshots. */
export const CAREER_STATE_SCHEMA_VERSION = 1;

/**
 * One completed permanent transfer stored in the career timeline.
 *
 * The first durable history keeps only facts already supported by the market
 * MVP: buyer, seller, player, fee, and date. Loans, wages, clauses, agents, and
 * negotiations are future systems and are intentionally absent.
 */
export interface PermanentTransferHistoryEntry {
  /** Deterministic 1-based history order inside the career save. */
  readonly sequenceNumber: number;
  /** In-world date when the transfer became durable. */
  readonly occurredOn: GameDate;
  /** Club receiving the player. */
  readonly buyingClubId: ClubId;
  /** Club losing the player. */
  readonly sellingClubId: ClubId;
  /** Player moved by this permanent transfer. */
  readonly playerId: PlayerId;
  /** Permanent transfer fee in minor units. */
  readonly transferFee: Money;
}

/**
 * Minimal durable state for one manager career.
 *
 * `CareerState` wraps the current `GameState` instead of duplicating world data.
 * It adds only the manager-facing persistence slice needed after the market MVP:
 * selected club, transfer funds, and permanent-transfer history.
 */
export interface CareerState {
  /** Stable save/career identifier, for example `save:career-demo`. */
  readonly saveId: SaveId;
  /** Career snapshot schema version for future migrations. */
  readonly schemaVersion: number;
  /** Club controlled by the manager. */
  readonly selectedClubId: ClubId;
  /** Current playable world snapshot. */
  readonly gameState: GameState;
  /** Durable transfer funds for the current market MVP. */
  readonly marketState: MarketState;
  /** Ordered permanent-transfer decisions already applied to this career. */
  readonly transferHistory: readonly PermanentTransferHistoryEntry[];
}

/** Machine-readable career-state validation failure. */
export type CareerStateContractErrorCode =
  | "unsupported_schema_version"
  | "selected_club_not_found"
  | "selected_club_not_ordered"
  | "budget_club_not_found"
  | "invalid_money"
  | "invalid_history_sequence"
  | "duplicate_history_sequence"
  | "history_buying_club_not_found"
  | "history_selling_club_not_found"
  | "history_player_not_found";

/**
 * Typed error thrown when a career-state snapshot is inconsistent.
 *
 * @example
 * if (error instanceof CareerStateContractError && error.code === "selected_club_not_found") {
 *   // Ask the caller to rebuild the save from a valid game snapshot.
 * }
 */
export class CareerStateContractError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: CareerStateContractErrorCode;

  /** Creates a career-state validation error. */
  public constructor(code: CareerStateContractErrorCode, message: string) {
    super(message);
    this.name = "CareerStateContractError";
    this.code = code;
  }
}

/**
 * Builds a validated career-state snapshot.
 *
 * This helper validates only durable state shape and references. It does not
 * evaluate transfers, advance time, write files, or infer manager decisions.
 *
 * @example
 * const career = createCareerState({
 *   saveId: saveId("save:career-demo"),
 *   schemaVersion: CAREER_STATE_SCHEMA_VERSION,
 *   selectedClubId: clubId("club:pro01"),
 *   gameState,
 *   marketState,
 *   transferHistory: [],
 * });
 */
export function createCareerState(input: CareerState): CareerState {
  if (input.schemaVersion !== CAREER_STATE_SCHEMA_VERSION) {
    throw new CareerStateContractError(
      "unsupported_schema_version",
      `unsupported career-state schema version: ${input.schemaVersion}`,
    );
  }

  assertClubExists(input.gameState, input.selectedClubId, "selected_club_not_found");

  if (!hasClubInOrder(input.gameState, input.selectedClubId)) {
    throw new CareerStateContractError("selected_club_not_ordered", `selected club is not ordered: ${input.selectedClubId}`);
  }

  const marketState = createMarketState(input.marketState);
  for (const clubId of marketState.clubBudgetIds) {
    assertClubExists(input.gameState, clubId, "budget_club_not_found");
    assertNonNegativeMoney(marketState.clubBudgets[clubId]?.transferBudget);
  }

  const seenHistorySequences = new Set<number>();
  const transferHistory: PermanentTransferHistoryEntry[] = [];

  for (const entry of input.transferHistory) {
    if (!Number.isSafeInteger(entry.sequenceNumber) || entry.sequenceNumber <= 0) {
      throw new CareerStateContractError("invalid_history_sequence", `invalid transfer history sequence: ${entry.sequenceNumber}`);
    }

    if (seenHistorySequences.has(entry.sequenceNumber)) {
      throw new CareerStateContractError("duplicate_history_sequence", `duplicate transfer history sequence: ${entry.sequenceNumber}`);
    }

    assertClubExists(input.gameState, entry.buyingClubId, "history_buying_club_not_found");
    assertClubExists(input.gameState, entry.sellingClubId, "history_selling_club_not_found");
    assertPlayerExists(input.gameState, entry.playerId);
    assertNonNegativeMoney(entry.transferFee);

    seenHistorySequences.add(entry.sequenceNumber);
    transferHistory.push({ ...entry });
  }

  return {
    saveId: input.saveId,
    schemaVersion: input.schemaVersion,
    selectedClubId: input.selectedClubId,
    gameState: input.gameState,
    marketState,
    transferHistory,
  };
}

/**
 * Returns the next 1-based permanent-transfer sequence number.
 *
 * The helper uses explicit history order and never enumerates object keys.
 */
export function nextTransferHistorySequence(careerState: CareerState): number {
  let highestSequence = 0;

  for (const entry of careerState.transferHistory) {
    if (entry.sequenceNumber > highestSequence) {
      highestSequence = entry.sequenceNumber;
    }
  }

  return highestSequence + 1;
}

function assertClubExists(
  gameState: GameState,
  clubId: ClubId,
  code: Extract<CareerStateContractErrorCode, `${string}_club_not_found`>,
): void {
  if (gameState.clubs[clubId] === undefined) {
    throw new CareerStateContractError(code, `club does not exist in career game state: ${clubId}`);
  }
}

function assertPlayerExists(gameState: GameState, playerId: PlayerId): void {
  if (gameState.players[playerId] === undefined) {
    throw new CareerStateContractError("history_player_not_found", `player does not exist in career game state: ${playerId}`);
  }
}

function hasClubInOrder(gameState: GameState, clubId: ClubId): boolean {
  for (const orderedClubId of gameState.clubIds) {
    if (orderedClubId === clubId) {
      return true;
    }
  }

  return false;
}

function assertNonNegativeMoney(amount: Money | undefined): void {
  if (amount === undefined || !Number.isSafeInteger(amount) || amount < 0) {
    throw new CareerStateContractError("invalid_money", `money must be a non-negative safe integer: ${amount}`);
  }
}
