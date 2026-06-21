import {
  addMoney,
  compareMoney,
  findClubTransferBudget,
  replaceClubTransferBudget,
  subtractMoney,
  type Club,
  type ClubId,
  type GameState,
  type MarketState,
  type Money,
  type PermanentTransferIntent,
  type Player,
  type PlayerId,
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
  /** Current command-local market data. */
  readonly marketState: MarketState;
  /** Manager-declared move. */
  readonly intent: PermanentTransferIntent;
  /** Optional valuation tuning; defaults to the MVP config. */
  readonly valuationConfig?: PlayerValuationConfig;
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
  /** Player willingness when player and both clubs are known. */
  readonly willingness?: PlayerWillingness;
}

/** Preview output with copied state snapshots. */
export interface PermanentTransferApplyPreview extends PermanentTransferFeasibility {
  /** Original game state when rejected; copied game state when accepted. */
  readonly gameState: GameState;
  /** Original market state when rejected; copied market state when accepted. */
  readonly marketState: MarketState;
}

/**
 * Evaluates ownership, temporary fee funds, valuation, and player willingness.
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
  });
  const transferFee = valuation.value;
  const buyingBudget = findClubTransferBudget(input.marketState, input.intent.buyingClubId);

  if (buyingBudget === undefined) {
    reasons.push({ code: "missing_buying_budget", clubId: input.intent.buyingClubId, requiredBudget: transferFee });
  } else if (compareMoney(buyingBudget.transferBudget, transferFee) < 0) {
    reasons.push({
      code: "insufficient_transfer_budget",
      clubId: input.intent.buyingClubId,
      requiredBudget: transferFee,
      availableBudget: buyingBudget.transferBudget,
    });
  }

  const willingness = derivePlayerWillingness({
    player,
    sellingClub,
    buyingClub,
    currentDate: input.gameState.calendar.currentDate,
  });

  if (willingness.status === "rejected") {
    reasons.push({ code: "player_unwilling", playerId: input.intent.playerId });
  }

  return {
    intent: input.intent,
    status: reasons.length === 0 ? "accepted" : "rejected",
    reasons,
    valuation,
    transferFee,
    willingness,
  };
}

/**
 * Applies an accepted permanent transfer to copied game and market data.
 *
 * Rejected previews return the original state references plus the structured
 * rejection reasons. Accepted previews move the player from seller to buyer and
 * move the fee between available transfer funds when both club budgets exist.
 */
export function previewPermanentTransfer(input: EvaluatePermanentTransferInput): PermanentTransferApplyPreview {
  const feasibility = evaluatePermanentTransfer(input);

  if (feasibility.status === "rejected" || feasibility.transferFee === undefined) {
    return {
      ...feasibility,
      gameState: input.gameState,
      marketState: input.marketState,
    };
  }

  return {
    ...feasibility,
    gameState: applyPlayerOwnershipPreview(input.gameState, input.intent),
    marketState: applyMarketBudgetPreview(input.marketState, input.intent, feasibility.transferFee),
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

function applyPlayerOwnershipPreview(gameState: GameState, intent: PermanentTransferIntent): GameState {
  const buyingClub = gameState.clubs[intent.buyingClubId];
  const sellingClub = gameState.clubs[intent.sellingClubId];

  if (buyingClub === undefined || sellingClub === undefined) {
    return gameState;
  }

  const clubs: Readonly<Record<ClubId, Club>> = {
    ...gameState.clubs,
    [buyingClub.id]: {
      ...buyingClub,
      playerIds: [...buyingClub.playerIds, intent.playerId],
    },
    [sellingClub.id]: {
      ...sellingClub,
      playerIds: removePlayerId(sellingClub.playerIds, intent.playerId),
    },
  };

  return {
    ...gameState,
    clubs,
  };
}

function applyMarketBudgetPreview(
  marketState: MarketState,
  intent: PermanentTransferIntent,
  transferFee: Money,
): MarketState {
  const buyingBudget = findClubTransferBudget(marketState, intent.buyingClubId);
  const sellingBudget = findClubTransferBudget(marketState, intent.sellingClubId);

  if (buyingBudget === undefined) {
    return marketState;
  }

  const buyerUpdated = replaceClubTransferBudget(marketState, {
    clubId: buyingBudget.clubId,
    transferBudget: subtractMoney(buyingBudget.transferBudget, transferFee),
  });

  if (sellingBudget === undefined) {
    return buyerUpdated;
  }

  return replaceClubTransferBudget(buyerUpdated, {
    clubId: sellingBudget.clubId,
    transferBudget: addMoney(sellingBudget.transferBudget, transferFee),
  });
}

function removePlayerId(playerIds: readonly PlayerId[], playerId: PlayerId): readonly PlayerId[] {
  return playerIds.filter((candidateId) => candidateId !== playerId);
}
