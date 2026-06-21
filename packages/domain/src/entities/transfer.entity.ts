import type { ClubId, PlayerId } from "../types/ids.ts";
import type { Money } from "../value-objects/money.ts";

/**
 * Temporary transfer funds for one club in the market MVP.
 *
 * The first market step is command-local and serializable. It tracks only the
 * amount available for permanent fees, using `Money` so later economy work does
 * not need to migrate plain numbers.
 */
export interface ClubTransferBudget {
  /** Club owning this available fee amount. */
  readonly clubId: ClubId;
  /** Available minor-unit amount for permanent fees. */
  readonly transferBudget: Money;
}

/**
 * Explicit market data used by the first transfer MVP.
 *
 * The ordered club list is the traversal source. The record is only a lookup
 * table and must not be enumerated by simulation code.
 */
export interface MarketState {
  /** Lookup table of transfer funds by club ID. */
  readonly clubBudgets: Readonly<Record<ClubId, ClubTransferBudget>>;
  /** Deterministic traversal order for budgeted clubs. */
  readonly clubBudgetIds: readonly ClubId[];
}

/**
 * Manager-declared permanent transfer request.
 *
 * Domain records the intended buyer, seller, and player. Ownership validation,
 * valuation, player willingness, and application previews live in engine code.
 */
export interface PermanentTransferIntent {
  /** Club trying to buy the player. */
  readonly buyingClubId: ClubId;
  /** Club currently selling the player. */
  readonly sellingClubId: ClubId;
  /** Player targeted by the manager. */
  readonly playerId: PlayerId;
}

/** Coarse feasibility status for one permanent-transfer preview. */
export type TransferFeasibilityStatus = "accepted" | "rejected";

/**
 * Stable machine codes explaining why a permanent transfer cannot proceed.
 *
 * Presentation layers translate these codes through localization. Domain and
 * engine must keep them language-agnostic.
 */
export type TransferRejectionReasonCode =
  | "unknown_buying_club"
  | "unknown_selling_club"
  | "same_club"
  | "unknown_player"
  | "player_not_owned_by_selling_club"
  | "player_already_owned_by_buying_club"
  | "missing_buying_budget"
  | "insufficient_transfer_budget"
  | "player_unwilling";

/**
 * Structured feasibility failure detail.
 *
 * Optional IDs and amounts let CLI/UI render useful context without parsing
 * prose from domain or engine errors.
 */
export interface TransferRejectionReason {
  /** Stable language-agnostic reason code. */
  readonly code: TransferRejectionReasonCode;
  /** Club connected to the reason, when useful. */
  readonly clubId?: ClubId;
  /** Player connected to the reason, when useful. */
  readonly playerId?: PlayerId;
  /** Required amount for budget-related failures. */
  readonly requiredBudget?: Money;
  /** Available amount for budget-related failures. */
  readonly availableBudget?: Money;
}

/**
 * Minimal domain preview shape for a permanent transfer.
 *
 * Engine code can add valuation and copied game-state context around this
 * shape, but the core status/reason/market data stays dependency-free here.
 */
export interface PermanentTransferPreview {
  /** Original manager request. */
  readonly intent: PermanentTransferIntent;
  /** Fee used by the preview. */
  readonly transferFee: Money;
  /** Final feasibility status. */
  readonly status: TransferFeasibilityStatus;
  /** Empty when status is `accepted`; populated when status is `rejected`. */
  readonly reasons: readonly TransferRejectionReason[];
  /** Market data after the preview is applied, or the original data when rejected. */
  readonly marketState: MarketState;
}

/** Error categories exposed by market-domain helpers. */
export type TransferContractErrorCode =
  | "same_club"
  | "duplicate_budget_club"
  | "missing_budget_entry"
  | "budget_entry_mismatch"
  | "unknown_budget_club";

/**
 * Typed error thrown when a market-domain shape is ambiguous.
 *
 * @example
 * if (error instanceof TransferContractError && error.code === "same_club") {
 *   // The caller can ask the manager to choose different clubs.
 * }
 */
export class TransferContractError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TransferContractErrorCode;

  /** Creates a transfer shape error. */
  public constructor(code: TransferContractErrorCode, message: string) {
    super(message);
    this.name = "TransferContractError";
    this.code = code;
  }
}

/**
 * Builds a validated permanent-transfer intent.
 *
 * This helper validates only the domain-level ambiguity rule: buyer and seller
 * must be different. It does not check ownership or affordability.
 *
 * @example
 * const intent = createPermanentTransferIntent({
 *   buyingClubId: clubId("club:pro01"),
 *   sellingClubId: clubId("club:pro18"),
 *   playerId: playerId("player:001234"),
 * });
 */
export function createPermanentTransferIntent(input: PermanentTransferIntent): PermanentTransferIntent {
  if (input.buyingClubId === input.sellingClubId) {
    throw new TransferContractError("same_club", "buying and selling clubs must be different");
  }

  return {
    buyingClubId: input.buyingClubId,
    sellingClubId: input.sellingClubId,
    playerId: input.playerId,
  };
}

/**
 * Builds a validated market state while preserving explicit budget order.
 *
 * The helper checks duplicate ordered IDs, missing lookup entries, and lookup
 * entries whose embedded club ID does not match the ordered key.
 *
 * @example
 * const market = createMarketState({
 *   clubBudgets: {
 *     [clubId("club:pro01")]: {
 *       clubId: clubId("club:pro01"),
 *       transferBudget: nonNegativeMoney(1_000_000_00),
 *     },
 *   },
 *   clubBudgetIds: [clubId("club:pro01")],
 * });
 */
export function createMarketState(input: MarketState): MarketState {
  const seenClubIds = new Set<ClubId>();
  const clubBudgetIds: ClubId[] = [];
  const clubBudgets: Record<ClubId, ClubTransferBudget> = {};

  for (const clubId of input.clubBudgetIds) {
    if (seenClubIds.has(clubId)) {
      throw new TransferContractError("duplicate_budget_club", `duplicate transfer budget club: ${clubId}`);
    }

    const budget = input.clubBudgets[clubId];
    if (budget === undefined) {
      throw new TransferContractError("missing_budget_entry", `missing transfer budget for club: ${clubId}`);
    }

    if (budget.clubId !== clubId) {
      throw new TransferContractError("budget_entry_mismatch", `transfer budget entry mismatch: ${clubId}`);
    }

    seenClubIds.add(clubId);
    clubBudgetIds.push(clubId);
    clubBudgets[clubId] = {
      clubId: budget.clubId,
      transferBudget: budget.transferBudget,
    };
  }

  return {
    clubBudgets,
    clubBudgetIds,
  };
}

/**
 * Finds a club transfer budget by explicit ordered traversal.
 *
 * This avoids deriving simulation order from a record lookup.
 */
export function findClubTransferBudget(state: MarketState, clubId: ClubId): ClubTransferBudget | undefined {
  for (const budgetClubId of state.clubBudgetIds) {
    if (budgetClubId === clubId) {
      return state.clubBudgets[budgetClubId];
    }
  }

  return undefined;
}

/**
 * Replaces one club budget and returns a fresh market state.
 *
 * The target club must already exist in the ordered market state so callers
 * cannot silently append a new club at an order-sensitive point.
 */
export function replaceClubTransferBudget(state: MarketState, budget: ClubTransferBudget): MarketState {
  const clubBudgets: Record<ClubId, ClubTransferBudget> = {};
  let replaced = false;

  for (const clubId of state.clubBudgetIds) {
    const currentBudget = state.clubBudgets[clubId];
    if (currentBudget === undefined) {
      throw new TransferContractError("missing_budget_entry", `missing transfer budget for club: ${clubId}`);
    }

    if (clubId === budget.clubId) {
      clubBudgets[clubId] = {
        clubId: budget.clubId,
        transferBudget: budget.transferBudget,
      };
      replaced = true;
    } else {
      clubBudgets[clubId] = currentBudget;
    }
  }

  if (!replaced) {
    throw new TransferContractError("unknown_budget_club", `unknown transfer budget club: ${budget.clubId}`);
  }

  return {
    clubBudgets,
    clubBudgetIds: [...state.clubBudgetIds],
  };
}
