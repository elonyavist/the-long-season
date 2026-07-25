import type { ClubId, PlayerId } from "../types/ids.ts";
import type { Money } from "../value-objects/money.ts";
import type { ClubFinanceState } from "../career/club-finance.ts";

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
  | "insufficient_wage_budget"
  | "insufficient_cash"
  | "player_unwilling"
  | "outside_transfer_window"
  | "senior_squad_state_missing"
  | "seller_contract_not_found"
  | "registration_unavailable";

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
  /** Club finances after the preview, or the original state when rejected. */
  readonly clubFinanceState: ClubFinanceState;
}

/** Error categories exposed by market-domain helpers. */
export type TransferContractErrorCode = "same_club";

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
