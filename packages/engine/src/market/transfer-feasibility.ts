import {
  addMoney,
  compareMoney,
  findClubFinanceAccount,
  nonNegativeMoney,
  subtractMoney,
  type Club,
  type ClubFinanceState,
  type ContractOfferTerms,
  type GameState,
  type MarketBehaviorCalibrationConfig,
  type Money,
  type PermanentTransferIntent,
  type Player,
  type PlayerContract,
  type TransferRejectionReason,
} from "@game/domain";

import {
  derivePlayerValuation,
  type PlayerValuation,
  type PlayerValuationConfig,
} from "./player-valuation.ts";
import { derivePlayerWillingness, type PlayerWillingness } from "./player-willingness.ts";
import { derivePublicPlayerAssessment } from "../squad/public-player-assessment.ts";

/** Inputs needed to evaluate one permanent transfer. */
export interface EvaluatePermanentTransferInput {
  /** Current immutable game state. */
  readonly gameState: GameState;
  /** Canonical club cash and budget state. */
  readonly clubFinanceState: ClubFinanceState;
  /** Manager-declared move. */
  readonly intent: PermanentTransferIntent;
  /** Explicit versioned content for the shared valuation/willingness assessment. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Seller agreement used by valuation and player willingness. */
  readonly currentContract?: PlayerContract;
  /** Accepted annual terms used by willingness and affordability. */
  readonly proposedTerms?: ContractOfferTerms;
  /** Explicit fee already accepted by both clubs in an interactive negotiation. */
  readonly agreedTransferFee?: Money;
  /**
   * Confirms the player stage already accepted `proposedTerms`.
   *
   * The willingness projection is still returned for inspection, but it cannot
   * reject terms which the player has already accepted.
   */
  readonly playerAgreementConfirmed?: boolean;
  /** Exact version-selected willingness and affordability policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}

/** Feasibility output before applying a preview. */
export interface PermanentTransferFeasibility {
  /** Original manager request. */
  readonly intent: PermanentTransferIntent;
  /** Final feasibility status. */
  readonly status: "accepted" | "rejected";
  /** Empty when accepted; populated when rejected. */
  readonly reasons: readonly TransferRejectionReason[];
  /** Valuation when the player and selling club are known. */
  readonly valuation?: PlayerValuation;
  /** Transfer fee used for affordability checks when valuation exists. */
  readonly transferFee?: Money;
  /** Buyer's available transfer budget before this pure evaluation. */
  readonly buyerBudgetBefore?: Money;
  /** Derived budget after an accepted move; no finance state is mutated. */
  readonly buyerBudgetAfter?: Money;
  /** Player willingness when player and both clubs are known. */
  readonly willingness?: PlayerWillingness;
}

/**
 * Evaluates ownership, canonical club finances, valuation, and willingness.
 *
 * The function returns structured reasons instead of throwing for gameplay
 * rejections, so presentation layers can localize the outcome.
 */
export function evaluatePermanentTransfer(input: EvaluatePermanentTransferInput): PermanentTransferFeasibility {
  const buyingClub = input.gameState.clubs[input.intent.buyingClubId];
  const sellingClub = input.gameState.clubs[input.intent.sellingClubId];
  const player = input.gameState.players[input.intent.playerId];
  const reasons: TransferRejectionReason[] = [];

  collectIdentityReasons(input.intent, buyingClub, sellingClub, player, reasons);

  if (buyingClub !== undefined && buyingClub.playerIds.includes(input.intent.playerId)) {
    reasons.push({
      code: "player_already_owned_by_buying_club",
      clubId: buyingClub.id,
      playerId: input.intent.playerId,
    });
  }

  if (sellingClub !== undefined && !sellingClub.playerIds.includes(input.intent.playerId)) {
    reasons.push({
      code: "player_not_owned_by_selling_club",
      clubId: sellingClub.id,
      playerId: input.intent.playerId,
    });
  }

  if (player === undefined || buyingClub === undefined || sellingClub === undefined) {
    return rejected(input.intent, reasons);
  }

  const primaryPosition = player.naturalPositions[0];
  if (primaryPosition === undefined) {
    throw new Error(`Player has no primary position: ${String(player.id)}`);
  }
  const assessment = derivePublicPlayerAssessment({
    player,
    currentDate: input.gameState.calendar.currentDate,
    potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
    ratingScale: input.valuationConfig.ratingScale,
  });
  const valuation = derivePlayerValuation({
    assessment,
    primaryPosition,
    config: input.valuationConfig,
  });
  const transferFee = input.agreedTransferFee ?? valuation.value;
  const buyingAccount = findClubFinanceAccount(input.clubFinanceState, input.intent.buyingClubId);

  if (buyingAccount === undefined) {
    reasons.push({ code: "missing_buying_budget", clubId: input.intent.buyingClubId, requiredBudget: transferFee });
  } else if (compareMoney(
    percentageMoney(
      buyingAccount.availableTransferBudget,
      input.marketBehaviorPolicy.affordability.maximumTransferBudgetUseBasisPoints,
    ),
    transferFee,
  ) < 0) {
    reasons.push({
      code: "insufficient_transfer_budget",
      clubId: input.intent.buyingClubId,
      requiredBudget: transferFee,
      availableBudget: percentageMoney(
        buyingAccount.availableTransferBudget,
        input.marketBehaviorPolicy.affordability.maximumTransferBudgetUseBasisPoints,
      ),
    });
  } else if (
    input.proposedTerms !== undefined
    && addMoney(buyingAccount.committedAnnualWage, input.proposedTerms.annualWage)
      > percentageMoney(
        buyingAccount.annualWageBudget,
        input.marketBehaviorPolicy.affordability.maximumWageBudgetUseBasisPoints,
      )
  ) {
    const maximumCommittedWage = percentageMoney(
      buyingAccount.annualWageBudget,
      input.marketBehaviorPolicy.affordability.maximumWageBudgetUseBasisPoints,
    );
    reasons.push({
      code: "insufficient_wage_budget",
      clubId: input.intent.buyingClubId,
      requiredBudget: input.proposedTerms.annualWage,
      availableBudget: nonNegativeMoney(
        Math.max(0, maximumCommittedWage - buyingAccount.committedAnnualWage),
      ),
    });
  } else if (compareMoney(
    nonNegativeMoney(Math.max(
      0,
      buyingAccount.cashBalance - percentageMoney(
        buyingAccount.annualWageBudget,
        input.marketBehaviorPolicy.affordability.minimumCashReserveBasisPoints,
      ),
    )),
    addMoney(transferFee, input.proposedTerms?.bonuses.signingBonus ?? nonNegativeMoney(0)),
  ) < 0) {
    const requiredCash = addMoney(transferFee, input.proposedTerms?.bonuses.signingBonus ?? nonNegativeMoney(0));
    reasons.push({
      code: "insufficient_cash",
      clubId: input.intent.buyingClubId,
      requiredBudget: requiredCash,
      availableBudget: buyingAccount.cashBalance,
    });
  }

  const willingness = derivePlayerWillingness({
    publicAssessment: assessment,
    sellingClub,
    buyingClub,
    currentTier: sellingClub.category,
    destinationTier: buyingClub.category,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    ...(input.currentContract === undefined ? {} : { currentContract: input.currentContract }),
    ...(input.proposedTerms === undefined ? {} : { proposedTerms: input.proposedTerms }),
  });

  if (willingness.status === "rejected" && input.playerAgreementConfirmed !== true) {
    reasons.push({ code: "player_unwilling", playerId: input.intent.playerId });
  }

  const status = reasons.length === 0 ? "accepted" : "rejected";

  return {
    intent: input.intent,
    status,
    reasons,
    valuation,
    transferFee,
    willingness,
    ...(buyingAccount === undefined ? {} : { buyerBudgetBefore: buyingAccount.availableTransferBudget }),
    ...(status === "accepted" && buyingAccount !== undefined
      ? { buyerBudgetAfter: subtractMoney(buyingAccount.availableTransferBudget, transferFee) }
      : {}),
  };
}

function percentageMoney(value: Money, basisPoints: number): Money {
  return nonNegativeMoney(Number(
    (BigInt(value) * BigInt(basisPoints)) / 10_000n,
  ));
}

function collectIdentityReasons(
  intent: PermanentTransferIntent,
  buyingClub: Club | undefined,
  sellingClub: Club | undefined,
  player: Player | undefined,
  reasons: TransferRejectionReason[],
): void {
  if (intent.buyingClubId === intent.sellingClubId) {
    reasons.push({ code: "same_club", clubId: intent.buyingClubId });
  }

  if (buyingClub === undefined) {
    reasons.push({ code: "unknown_buying_club", clubId: intent.buyingClubId });
  }

  if (sellingClub === undefined) {
    reasons.push({ code: "unknown_selling_club", clubId: intent.sellingClubId });
  }

  if (player === undefined) {
    reasons.push({ code: "unknown_player", playerId: intent.playerId });
  }
}

function rejected(
  intent: PermanentTransferIntent,
  reasons: readonly TransferRejectionReason[],
): PermanentTransferFeasibility {
  return {
    intent,
    status: "rejected",
    reasons,
  };
}
