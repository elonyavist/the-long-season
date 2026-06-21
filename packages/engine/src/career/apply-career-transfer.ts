import {
  createCareerState,
  nextTransferHistorySequence,
  type CareerState,
  type Money,
  type PermanentTransferIntent,
  type TransferRejectionReason,
} from "@game/domain";

import { previewPermanentTransfer } from "../market/transfer-feasibility.ts";
import type { PlayerValuation, PlayerValuationConfig } from "../market/player-valuation.ts";
import type { PlayerWillingness } from "../market/player-willingness.ts";

/** Inputs needed to apply one permanent transfer to durable career state. */
export interface ApplyCareerPermanentTransferInput {
  /** Current durable career state. */
  readonly careerState: CareerState;
  /** Manager-declared permanent transfer request. */
  readonly intent: PermanentTransferIntent;
  /** Optional valuation tuning; defaults to the market MVP config. */
  readonly valuationConfig?: PlayerValuationConfig;
}

/** Result of applying or rejecting one durable permanent-transfer attempt. */
export interface ApplyCareerPermanentTransferResult {
  /** Original manager request. */
  readonly intent: PermanentTransferIntent;
  /** Final transfer application status. */
  readonly status: "accepted" | "rejected";
  /** Empty when accepted; populated when rejected. */
  readonly reasons: readonly TransferRejectionReason[];
  /** Transfer fee used by the market evaluation when available. */
  readonly transferFee?: Money;
  /** Valuation details when the target player and selling club are known. */
  readonly valuation?: PlayerValuation;
  /** Player willingness details when both clubs and the player are known. */
  readonly willingness?: PlayerWillingness;
  /** Original career state when rejected; copied updated state when accepted. */
  readonly careerState: CareerState;
}

/**
 * Applies an accepted permanent transfer to a copied durable career state.
 *
 * Rejected transfer attempts return the original `CareerState` reference. This
 * keeps save-writing callers simple: only accepted results should be persisted.
 */
export function applyCareerPermanentTransfer(
  input: ApplyCareerPermanentTransferInput,
): ApplyCareerPermanentTransferResult {
  const preview = previewPermanentTransfer({
    gameState: input.careerState.gameState,
    marketState: input.careerState.marketState,
    intent: input.intent,
    ...(input.valuationConfig === undefined ? {} : { valuationConfig: input.valuationConfig }),
  });

  if (preview.status === "rejected" || preview.transferFee === undefined) {
    return {
      intent: preview.intent,
      status: "rejected",
      reasons: preview.reasons,
      ...(preview.transferFee === undefined ? {} : { transferFee: preview.transferFee }),
      ...(preview.valuation === undefined ? {} : { valuation: preview.valuation }),
      ...(preview.willingness === undefined ? {} : { willingness: preview.willingness }),
      careerState: input.careerState,
    };
  }

  const nextCareerState = createCareerState({
    ...input.careerState,
    gameState: preview.gameState,
    marketState: preview.marketState,
    transferHistory: [
      ...input.careerState.transferHistory,
      {
        sequenceNumber: nextTransferHistorySequence(input.careerState),
        occurredOn: input.careerState.gameState.calendar.currentDate,
        buyingClubId: preview.intent.buyingClubId,
        sellingClubId: preview.intent.sellingClubId,
        playerId: preview.intent.playerId,
        transferFee: preview.transferFee,
      },
    ],
  });

  return {
    intent: preview.intent,
    status: "accepted",
    reasons: [],
    transferFee: preview.transferFee,
    ...(preview.valuation === undefined ? {} : { valuation: preview.valuation }),
    ...(preview.willingness === undefined ? {} : { willingness: preview.willingness }),
    careerState: nextCareerState,
  };
}
