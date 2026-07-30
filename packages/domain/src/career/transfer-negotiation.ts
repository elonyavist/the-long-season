import type { Brand } from "../types/brand.ts";
import type { ClubId, PlayerContractId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { Money } from "../value-objects/money.ts";
import type {
  ContractDemandSnapshot,
  ContractOfferEvaluation,
  ContractOfferTerms,
} from "./contract-negotiation.ts";
import type { NegotiationStageClock } from "./negotiation-stage-clock.ts";

/** Stable identifier for one club-to-club transfer-negotiation lifecycle. */
export type TransferNegotiationId = Brand<string, "TransferNegotiationId">;

const TRANSFER_NEGOTIATION_NAMESPACE = "transfer-negotiation:";

/** Creates a validated transfer-negotiation identifier. */
export function transferNegotiationId(value: string): TransferNegotiationId {
  if (!value.startsWith(TRANSFER_NEGOTIATION_NAMESPACE) || value.length === TRANSFER_NEGOTIATION_NAMESPACE.length) {
    throw new Error(`Transfer negotiation ID must use the transfer-negotiation namespace: ${value}`);
  }
  return value as TransferNegotiationId;
}

/**
 * Parties, target, and immutable commercial snapshot shared by every stage.
 *
 * These amounts intentionally survive rejection, withdrawal, acceptance, and
 * completion so persistence and presentation never have to reinterpret one
 * ambiguous "fee" field after the negotiation advances.
 */
export interface TransferNegotiationParties {
  readonly id: TransferNegotiationId;
  readonly buyingClubId: ClubId;
  readonly sellingClubId: ClubId;
  readonly playerId: PlayerId;
  readonly publicValue: Money;
  readonly initialAskingPrice: Money;
  readonly currentAskingPrice: Money;
  readonly offeredFee: Money;
  readonly counterFee?: Money;
}

/** Stable reason a club-stage transfer negotiation ended without agreement. */
export type TransferNegotiationRejectionReason =
  | "fee_below_valuation"
  | "player_not_for_sale";

/** Buyer-side offer awaiting the selling club's deterministic reply. */
export interface SubmittedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "submitted";
  readonly submittedOn: GameDate;
  readonly clock: NegotiationStageClock;
}

/** Selling club's single counteroffer; the stage deadline never resets. */
export interface CounteredTransferNegotiation extends TransferNegotiationParties {
  readonly status: "countered";
  readonly submittedOn: GameDate;
  readonly counterFee: Money;
  readonly counterIssuedOn: GameDate;
  readonly clock: NegotiationStageClock;
}

/**
 * Provisional club agreement on a fee.
 *
 * Acceptance transfers no ownership and spends no money; it only unlocks the
 * player-contract stage (Step 06). Ownership and finance stay unchanged.
 */
export interface AcceptedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "accepted";
  readonly agreedFee: Money;
  readonly acceptedOn: GameDate;
  /** Original club-stage clock; acceptance does not extend the stage deadline. */
  readonly clock: NegotiationStageClock;
}

/** Contract offer awaiting the player's deterministic response. */
export interface PlayerOfferSubmittedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "player_offer_submitted";
  readonly agreedFee: Money;
  readonly clubAcceptedOn: GameDate;
  readonly submittedOn: GameDate;
  readonly offeredTerms: ContractOfferTerms;
  readonly demand: ContractDemandSnapshot;
  readonly clock: NegotiationStageClock;
}

/** Player's counteroffer; accepting it does not extend the original deadline. */
export interface PlayerCounteredTransferNegotiation extends TransferNegotiationParties {
  readonly status: "player_countered";
  readonly agreedFee: Money;
  readonly clubAcceptedOn: GameDate;
  readonly submittedOn: GameDate;
  readonly offeredTerms: ContractOfferTerms;
  readonly counterIssuedOn: GameDate;
  readonly counterTerms: ContractOfferTerms;
  readonly evaluation: ContractOfferEvaluation;
  readonly clock: NegotiationStageClock;
}

/** Stable reason the player stage ended without an agreement. */
export type TransferPlayerRejectionReason = "player_unwilling" | "contract_terms_rejected";

/** Player refused the move or the submitted terms. */
export interface PlayerRejectedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "player_rejected";
  readonly agreedFee: Money;
  readonly rejectedOn: GameDate;
  readonly reason: TransferPlayerRejectionReason;
  readonly evaluation?: ContractOfferEvaluation;
}

/** Player-contract stage passed its immutable three-day deadline. */
export interface PlayerExpiredTransferNegotiation extends TransferNegotiationParties {
  readonly status: "player_expired";
  readonly agreedFee: Money;
  readonly expiredOn: GameDate;
}

/** Stable final-recheck failure that leaves ownership and finance unchanged. */
export type TransferCompletionFailureReason =
  | "outside_transfer_window"
  | "stale_ownership"
  | "stale_contract"
  | "registration_unavailable"
  | "unaffordable";

/** Accepted player terms could not pass the final atomic recheck. */
export interface CompletionFailedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "completion_failed";
  readonly agreedFee: Money;
  readonly failedOn: GameDate;
  readonly reason: TransferCompletionFailureReason;
}

/** Entire two-table transfer completed exactly once. */
export interface CompletedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "completed";
  readonly agreedFee: Money;
  readonly completedFee: Money;
  readonly completedOn: GameDate;
  readonly acceptedTerms: ContractOfferTerms;
  readonly acceptedSource: "submitted_offer" | "counter_offer";
  readonly evaluation: ContractOfferEvaluation;
  readonly activatedContractId: PlayerContractId;
  readonly transferHistorySequence: number;
}

/** Selling club refused the offer. */
export interface RejectedTransferNegotiation extends TransferNegotiationParties {
  readonly status: "rejected";
  readonly rejectedOn: GameDate;
  readonly reason: TransferNegotiationRejectionReason;
}

/** Buyer withdrew before resolution. */
export interface WithdrawnTransferNegotiation extends TransferNegotiationParties {
  readonly status: "withdrawn";
  readonly withdrawnOn: GameDate;
}

/** Stage passed its three-day deadline or its window closed unresolved. */
export interface ExpiredTransferNegotiation extends TransferNegotiationParties {
  readonly status: "expired";
  readonly expiredOn: GameDate;
}

/** Buyer could no longer afford the agreed fee at the club-acceptance boundary. */
export interface UnaffordableTransferNegotiation extends TransferNegotiationParties {
  readonly status: "unaffordable";
  readonly cancelledOn: GameDate;
}

/** One club-to-club transfer negotiation in any lifecycle state. */
export type TransferNegotiation =
  | SubmittedTransferNegotiation
  | CounteredTransferNegotiation
  | AcceptedTransferNegotiation
  | PlayerOfferSubmittedTransferNegotiation
  | PlayerCounteredTransferNegotiation
  | PlayerRejectedTransferNegotiation
  | PlayerExpiredTransferNegotiation
  | CompletionFailedTransferNegotiation
  | CompletedTransferNegotiation
  | RejectedTransferNegotiation
  | WithdrawnTransferNegotiation
  | ExpiredTransferNegotiation
  | UnaffordableTransferNegotiation;

/** Ordered durable collection of transfer negotiations. */
export interface TransferNegotiationState {
  readonly negotiations: Readonly<Record<TransferNegotiationId, TransferNegotiation>>;
  readonly negotiationIds: readonly TransferNegotiationId[];
}

/** Machine-readable invariant failures for transfer-negotiation state. */
export type TransferNegotiationStateErrorCode =
  | "duplicate_negotiation_id"
  | "invalid_offer_fee"
  | "invalid_commercial_snapshot"
  | "completed_fee_mismatch"
  | "same_club"
  | "duplicate_open_negotiation";

/** Error thrown when durable transfer-negotiation state is inconsistent. */
export class TransferNegotiationStateError extends Error {
  public readonly code: TransferNegotiationStateErrorCode;

  public constructor(code: TransferNegotiationStateErrorCode, message: string) {
    super(message);
    this.name = "TransferNegotiationStateError";
    this.code = code;
  }
}

/** Projects the parties and target shared by every stage of one negotiation. */
export function transferNegotiationParties(
  negotiation: TransferNegotiation,
): TransferNegotiationParties {
  return {
    id: negotiation.id,
    buyingClubId: negotiation.buyingClubId,
    sellingClubId: negotiation.sellingClubId,
    playerId: negotiation.playerId,
    publicValue: negotiation.publicValue,
    initialAskingPrice: negotiation.initialAskingPrice,
    currentAskingPrice: negotiation.currentAskingPrice,
    offeredFee: negotiation.offeredFee,
    ...(negotiation.counterFee === undefined ? {} : { counterFee: negotiation.counterFee }),
  };
}

/** Reports whether a negotiation is still awaiting a reply or resolution. */
export function isOpenTransferNegotiation(negotiation: TransferNegotiation): boolean {
  return negotiation.status === "submitted"
    || negotiation.status === "countered"
    || negotiation.status === "accepted"
    || negotiation.status === "player_offer_submitted"
    || negotiation.status === "player_countered";
}

/**
 * Builds one validated transfer-negotiation collection.
 *
 * Enforces unique IDs, buyer/seller distinctness, positive integer-minor-unit
 * offered fees, and at most one open negotiation per buyer/player pair. Semantic
 * ownership and window checks live in the engine use case, not here.
 */
export function createTransferNegotiationState(
  input: TransferNegotiationState,
): TransferNegotiationState {
  const seenIds = new Set<TransferNegotiationId>();
  const openByPair = new Set<string>();

  for (const id of input.negotiationIds) {
    if (seenIds.has(id)) {
      throw new TransferNegotiationStateError("duplicate_negotiation_id", `Duplicate transfer negotiation ID: ${id}`);
    }
    seenIds.add(id);
    const negotiation = input.negotiations[id];
    if (negotiation === undefined) continue;

    if (negotiation.buyingClubId === negotiation.sellingClubId) {
      throw new TransferNegotiationStateError("same_club", `Transfer negotiation buyer and seller must differ: ${id}`);
    }
    if (
      !isPositiveMoney(negotiation.publicValue)
      || !isPositiveMoney(negotiation.initialAskingPrice)
      || !isPositiveMoney(negotiation.currentAskingPrice)
      || (negotiation.counterFee !== undefined && !isPositiveMoney(negotiation.counterFee))
    ) {
      throw new TransferNegotiationStateError(
        "invalid_commercial_snapshot",
        `Transfer negotiation commercial amounts must be positive integer minor units: ${id}`,
      );
    }
    if (!isPositiveMoney(negotiation.offeredFee)) {
      throw new TransferNegotiationStateError(
        "invalid_offer_fee",
        `Transfer offer fee must be positive: ${id}`,
      );
    }
    if (
      negotiation.status === "accepted"
      || negotiation.status === "player_offer_submitted"
      || negotiation.status === "player_countered"
      || negotiation.status === "player_rejected"
      || negotiation.status === "player_expired"
      || negotiation.status === "completion_failed"
      || negotiation.status === "completed"
    ) {
      if (negotiation.agreedFee <= 0) {
        throw new TransferNegotiationStateError("invalid_offer_fee", `Agreed transfer fee must be positive: ${id}`);
      }
    }
    if (
      negotiation.status === "completed"
      && negotiation.completedFee !== negotiation.agreedFee
    ) {
      throw new TransferNegotiationStateError(
        "completed_fee_mismatch",
        `Completed transfer fee must equal the agreed fee: ${id}`,
      );
    }
    if (isOpenTransferNegotiation(negotiation)) {
      const pairKey = `${negotiation.buyingClubId}=>${negotiation.playerId}`;
      if (openByPair.has(pairKey)) {
        throw new TransferNegotiationStateError(
          "duplicate_open_negotiation",
          `One buyer may have only one open transfer negotiation per player: ${pairKey}`,
        );
      }
      openByPair.add(pairKey);
    }
  }

  return { negotiations: input.negotiations, negotiationIds: input.negotiationIds };
}

/** Checks the shared positive-integer money invariant without rebranding. */
function isPositiveMoney(value: Money): boolean {
  return Number.isSafeInteger(value) && value > 0;
}
