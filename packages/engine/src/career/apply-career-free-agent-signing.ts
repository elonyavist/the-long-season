import {
  nonNegativeMoney,
  nextTransferHistorySequence,
  type AskingPriceCurvesConfig,
  type CareerState,
  type ClubId,
  type ContractOfferTerms,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type PlayerContractId,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type SeasonTransferWindows,
} from "@game/domain";

import { evaluateMarketActionEligibility } from "../market/market-eligibility.ts";
import {
  applyContractActivationFinance,
  type CareerFinanceRejectionReason,
} from "./career-finance-lifecycle.ts";
import { evaluateCareerContractCapacity } from "./career-contract-capacity.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import { prepareSeniorSquadSigning } from "./senior-squad-transfer.ts";
import {
  derivePlayerValuation,
  type PlayerValuationConfig,
} from "../market/player-valuation.ts";
import { derivePublicPlayerAssessment } from "../squad/public-player-assessment.ts";

/** Stable reason why a free-agent signing could not be committed. */
export type CareerFreeAgentSigningRejectionReason =
  | "senior_squad_state_missing"
  | "finance_state_missing"
  | "player_not_found"
  | "club_not_found"
  | "player_not_free_agent"
  | "outside_transfer_window"
  | "invalid_signing_transition"
  | CareerFinanceRejectionReason;

/** Input for one already-agreed free-agent registration and contract. */
export interface ApplyCareerFreeAgentSigningInput {
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  /** Current competition windows; registration is illegal while they are closed. */
  readonly transferWindows: SeasonTransferWindows;
  readonly acceptedTerms: ContractOfferTerms;
  /** Explicit public-value content used for the zero-fee history snapshot. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Explicit asking-price content that owns the free-agent zero-fee rule. */
  readonly askingPriceConfig: AskingPriceCurvesConfig;
  /** Explicit wage policy used by the final annual-capacity check. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Exact version-selected reserve and affordability policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly preferredShirtNumber?: number;
}

/** Applied free-agent signing with its canonical active contract. */
export interface CareerFreeAgentSigningApplied {
  readonly status: "applied";
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly activatedContractId: PlayerContractId;
  readonly publicValue: ReturnType<typeof nonNegativeMoney>;
  readonly completedFee: ReturnType<typeof nonNegativeMoney>;
}

/** Rejected signing that preserves the exact input career reference. */
export interface CareerFreeAgentSigningRejected {
  readonly status: "rejected";
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly reason: CareerFreeAgentSigningRejectionReason;
}

/** Result of one atomic ownership, registration, contract, and finance change. */
export type ApplyCareerFreeAgentSigningResult =
  | CareerFreeAgentSigningApplied
  | CareerFreeAgentSigningRejected;

/**
 * Commits one accepted free-agent agreement across every canonical boundary.
 *
 * Rejections publish none of the proposed ownership, registration, contract,
 * signing-bonus, or annual-wage changes. Negotiation policy remains outside
 * this use case: callers must supply terms that the player already accepted.
 */
export function applyCareerFreeAgentSigning(
  input: ApplyCareerFreeAgentSigningInput,
): ApplyCareerFreeAgentSigningResult {
  const eligibility = evaluateMarketActionEligibility({
    action: "external_free_agent_registration",
    windows: input.transferWindows,
    asOf: input.occurredOn,
  });
  if (eligibility.status === "blocked") {
    return rejected(input, "outside_transfer_window");
  }
  if (input.careerState.seniorSquadState === undefined) {
    return rejected(input, "senior_squad_state_missing");
  }
  if (input.careerState.clubFinanceState === undefined) {
    return rejected(input, "finance_state_missing");
  }
  const player = input.careerState.gameState.players[input.playerId];
  if (player === undefined) {
    return rejected(input, "player_not_found");
  }
  if (input.careerState.gameState.clubs[input.clubId] === undefined) {
    return rejected(input, "club_not_found");
  }
  if (!selectFreeAgentPlayerIds(input.careerState).includes(input.playerId)) {
    return rejected(input, "player_not_free_agent");
  }
  const primaryPosition = player.naturalPositions[0];
  if (primaryPosition === undefined) {
    throw new Error(`Free-agent player has no primary position: ${String(player.id)}`);
  }
  const assessment = derivePublicPlayerAssessment({
    player,
    currentDate: input.occurredOn,
    potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
    ratingScale: input.valuationConfig.ratingScale,
  });
  const publicValue = derivePlayerValuation({
    assessment,
    primaryPosition,
    config: input.valuationConfig,
  }).value;
  const completedFee = nonNegativeMoney(
    input.askingPriceConfig.freeAgentTransferFeeMinorUnits,
  );

  const capacity = evaluateCareerContractCapacity({
    careerState: input.careerState,
    clubId: input.clubId,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    addedAnnualWage: input.acceptedTerms.annualWage,
    addedSigningBonus: input.acceptedTerms.bonuses.signingBonus,
  });
  if (capacity.status === "unaffordable") return rejected(input, capacity.reason);

  try {
    const prepared = prepareSeniorSquadSigning({
      gameState: input.careerState.gameState,
      seniorSquadState: input.careerState.seniorSquadState,
      playerId: input.playerId,
      clubId: input.clubId,
      occurredOn: input.occurredOn,
      transitionSequence: nextContractHistorySequence(input.careerState),
      acceptedTerms: input.acceptedTerms,
      ...(input.preferredShirtNumber === undefined
        ? {}
        : { preferredShirtNumber: input.preferredShirtNumber }),
    });
    const financed = applyContractActivationFinance({
      careerState: input.careerState,
      proposedGameState: prepared.gameState,
      seniorSquadState: prepared.seniorSquadState,
      activatedContractIds: [prepared.activatedContractId],
      occurredOn: input.occurredOn,
    });
    if (financed.status === "rejected") return rejected(input, financed.reason);

    return {
      status: "applied",
      careerState: {
        ...financed.careerState,
        transferHistory: [
          ...financed.careerState.transferHistory,
          {
            kind: "free_agent_signing",
            sequenceNumber: nextTransferHistorySequence(financed.careerState),
            occurredOn: input.occurredOn,
            buyingClubId: input.clubId,
            playerId: input.playerId,
            publicValue,
            completedFee,
          },
        ],
      },
      playerId: input.playerId,
      clubId: input.clubId,
      activatedContractId: prepared.activatedContractId,
      publicValue,
      completedFee,
    };
  } catch {
    return rejected(input, "invalid_signing_transition");
  }
}

function nextContractHistorySequence(careerState: CareerState): number {
  return (careerState.seniorSquadState?.contractHistoryEntryIds.length ?? 0) + 1;
}

function rejected(
  input: ApplyCareerFreeAgentSigningInput,
  reason: CareerFreeAgentSigningRejectionReason,
): CareerFreeAgentSigningRejected {
  return {
    status: "rejected",
    careerState: input.careerState,
    playerId: input.playerId,
    clubId: input.clubId,
    reason,
  };
}
