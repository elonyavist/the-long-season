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
  type Money,
  type PermanentTransferIntent,
  type Player,
  type PlayerContract,
  type TransferRejectionReason,
} from "@game/domain";

import {
  DEFAULT_PLAYER_VALUATION_CONFIG,
  derivePlayerValuation,
  type PlayerValuation,
  type PlayerValuationConfig,
} from "./player-valuation.ts";
import { derivePlayerWillingness, type PlayerWillingness } from "./player-willingness.ts";

/** Inputs needed to evaluate one permanent transfer. */
export interface EvaluatePermanentTransferInput {
  /** Current immutable game state. */
  readonly gameState: GameState;
  /** Canonical club cash and budget state. */
  readonly clubFinanceState: ClubFinanceState;
  /** Manager-declared move. */
  readonly intent: PermanentTransferIntent;
  /** Optional valuation tuning; defaults to the MVP config. */
  readonly valuationConfig?: PlayerValuationConfig;
  /** Seller agreement used by valuation and player willingness. */
  readonly currentContract?: PlayerContract;
  /** Accepted annual terms used by willingness and affordability. */
  readonly proposedTerms?: ContractOfferTerms;
  /** Current supported form on the canonical 0-100 scale. */
  readonly currentForm?: number;
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

  const valuation = derivePlayerValuation({
    player,
    club: sellingClub,
    currentDate: input.gameState.calendar.currentDate,
    config: input.valuationConfig ?? DEFAULT_PLAYER_VALUATION_CONFIG,
    ...(input.currentContract === undefined ? {} : { contract: input.currentContract }),
    ...(input.currentForm === undefined ? {} : { currentForm: input.currentForm }),
  });
  const transferFee = valuation.value;
  const buyingAccount = findClubFinanceAccount(input.clubFinanceState, input.intent.buyingClubId);

  if (buyingAccount === undefined) {
    reasons.push({ code: "missing_buying_budget", clubId: input.intent.buyingClubId, requiredBudget: transferFee });
  } else if (compareMoney(buyingAccount.availableTransferBudget, transferFee) < 0) {
    reasons.push({
      code: "insufficient_transfer_budget",
      clubId: input.intent.buyingClubId,
      requiredBudget: transferFee,
      availableBudget: buyingAccount.availableTransferBudget,
    });
  } else if (
    input.proposedTerms !== undefined
    && compareMoney(
      nonNegativeMoney(Math.max(0, buyingAccount.annualWageBudget - buyingAccount.committedAnnualWage)),
      input.proposedTerms.annualWage,
    ) < 0
  ) {
    reasons.push({
      code: "insufficient_wage_budget",
      clubId: input.intent.buyingClubId,
      requiredBudget: input.proposedTerms.annualWage,
      availableBudget: nonNegativeMoney(Math.max(0, buyingAccount.annualWageBudget - buyingAccount.committedAnnualWage)),
    });
  } else if (compareMoney(
    buyingAccount.cashBalance,
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
    player,
    sellingClub,
    buyingClub,
    currentDate: input.gameState.calendar.currentDate,
    ...(input.currentContract === undefined ? {} : { currentContract: input.currentContract }),
    ...(input.proposedTerms === undefined ? {} : { proposedTerms: input.proposedTerms }),
  });

  if (willingness.status === "rejected") {
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
