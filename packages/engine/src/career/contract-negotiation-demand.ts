import {
  deriveCalibratedAnnualWage,
  deriveCalibratedContractBonuses,
  deriveContinuousPlayerWageRating,
  derivePreferredContractDurationYears,
  nonNegativeMoney,
  type AgreedSquadStatus,
  type CareerState,
  type ClubCategory,
  type ClubId,
  type ContractDemandSnapshot,
  type ContractOfferEvaluation,
  type ContractOfferEvaluationReason,
  type ContractOfferTerms,
  type GameDate,
  type Money,
  type PlayerContract,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type PlayerRole,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { derivePlayerMarketAbility } from "../market/player-valuation.ts";

/** Missing fact that prevents a credible contract demand from being derived. */
export type ContractDemandErrorCode = "player_not_found" | "club_not_found" | "player_role_missing";

/** Typed error for invalid demand inputs. */
export class ContractDemandError extends Error {
  public readonly code: ContractDemandErrorCode;

  public constructor(code: ContractDemandErrorCode, message: string) {
    super(message);
    this.name = "ContractDemandError";
    this.code = code;
  }
}

/** Input facts for one objective player-demand calculation. */
export interface DeriveContractDemandInput {
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly evaluatedOn: GameDate;
  /** Validated, version-linked wage and contract policy. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Existing agreement retained as leverage when the destination club differs. */
  readonly currentContract?: PlayerContract;
  /** Allows Step 08 free-agent scenarios to reuse this policy before signing. */
  readonly isFreeAgent?: boolean;
}

/** Input for deterministic evaluation of one submitted offer. */
export interface EvaluateContractOfferInput {
  readonly worldSeed: string;
  /** Stable lifecycle key used only to seed the deterministic decision. */
  readonly negotiationId: string;
  readonly evaluatedOn: GameDate;
  readonly offer: ContractOfferTerms;
  readonly demand: ContractDemandSnapshot;
}

/**
 * Derives one coherent demand from sporting, contract, and club facts.
 *
 * This policy deliberately exposes all inputs that influence the result. It
 * has no personality roll, agent multiplier, or rendered explanation.
 */
export function deriveContractDemand(input: DeriveContractDemandInput): ContractDemandSnapshot {
  const player = input.careerState.gameState.players[input.playerId];
  if (player === undefined) throw new ContractDemandError("player_not_found", `player not found: ${input.playerId}`);
  const club = input.careerState.gameState.clubs[input.clubId];
  if (club === undefined) throw new ContractDemandError("club_not_found", `club not found: ${input.clubId}`);
  const role = player.primaryRole;
  if (role === undefined) throw new ContractDemandError("player_role_missing", `player role missing: ${input.playerId}`);

  const currentContract = input.currentContract
    ?? activeContractFor(input.careerState, input.playerId, input.clubId);
  const isFreeAgent = input.isFreeAgent ?? currentContract === undefined;
  const ability = derivePlayerMarketAbility(player);
  const age = Math.max(15, Math.floor((input.evaluatedOn - player.birthDate) / 365.2425));
  const expectedSquadStatus = expectedStatus({
    careerState: input.careerState,
    playerId: input.playerId,
    clubId: input.clubId,
    age,
    currentAbility: ability.currentAbility,
    potentialRoom: ability.potentialAbility - ability.currentAbility,
  });
  const currentAnnualWage = isFreeAgent
    ? nonNegativeMoney(0)
    : currentContract?.annualWage ?? nonNegativeMoney(0);
  const remainingContractDays = isFreeAgent || currentContract === undefined
    ? 0
    : Math.max(0, currentContract.endsOn - input.evaluatedOn);
  const potentialGapStars = Math.max(
    0,
    deriveContinuousPlayerWageRating(ability.potentialAbility, input.wagePolicy.ratingScale)
      - deriveContinuousPlayerWageRating(ability.currentAbility, input.wagePolicy.ratingScale),
  );
  const durationYears = derivePreferredContractDurationYears({
    policy: input.wagePolicy,
    age,
    potentialGapStars,
  });
  const preferredAnnualWage = deriveCalibratedAnnualWage({
    policy: input.wagePolicy,
    category: club.category,
    currentAbility: ability.currentAbility,
    potentialAbility: ability.potentialAbility,
    age,
    status: expectedSquadStatus,
    currentAnnualWage,
    remainingContractDays,
    isFreeAgent,
  });
  const preferredTerms = termsFor(
    input.wagePolicy,
    role,
    preferredAnnualWage,
    expectedSquadStatus,
    durationYears,
    10_000,
  );
  const termsPolicy = input.wagePolicy.wageFinanceCalibration.contractTermsPolicy;
  const minimumTerms = termsFor(
    input.wagePolicy,
    role,
    nonNegativeMoney(roundMoney(
      (preferredAnnualWage * termsPolicy.minimumWageMultiplierBasisPoints) / 10_000,
      input.wagePolicy.wageFinanceCalibration.annualWagePolicy.roundingMinorUnits,
    )),
    expectedSquadStatus,
    Math.max(1, durationYears - termsPolicy.preferredDuration.minimumDurationReductionYears),
    termsPolicy.minimumBonusMultiplierBasisPoints,
  );

  return {
    evaluatedOn: input.evaluatedOn,
    age,
    currentAbility: roundAbility(ability.currentAbility),
    reachablePotential: roundAbility(ability.potentialAbility),
    role,
    expectedSquadStatus,
    currentAnnualWage,
    remainingContractDays,
    clubReputation: club.reputation,
    clubCategory: club.category,
    freeAgentLeverageBasisPoints: isFreeAgent ? 1_200 : 0,
    preferredTerms,
    minimumTerms,
  };
}

/** Evaluates every supported term and returns a stable player decision. */
export function evaluateContractOffer(input: EvaluateContractOfferInput): ContractOfferEvaluation {
  const reasons = evaluationReasons(input.offer, input.demand);
  const scoreBasisPoints = offerScore(input.offer, input.demand);
  const statusGap = statusRank(input.offer.squadStatus) - statusRank(input.demand.expectedSquadStatus);
  const wageRatio = ratio(input.offer.annualWage, input.demand.preferredTerms.annualWage);
  const belowHardFloor = wageRatio < 0.65
    || statusGap <= -2
    || input.offer.durationYears < input.demand.minimumTerms.durationYears;
  const meetsMinimum = termsMeetMinimum(input.offer, input.demand.minimumTerms);
  const rng = deriveRng(
    input.worldSeed,
    "contract-offer-evaluation",
    input.negotiationId,
    input.evaluatedOn,
  );
  const marginalAcceptanceThreshold = Math.max(0, Math.min(0.85, (scoreBasisPoints - 8_800) / 1_200));
  const decision = belowHardFloor || scoreBasisPoints < 6_800
    ? "rejected"
    : meetsMinimum && (scoreBasisPoints >= 9_650 || rng.nextFloat() < marginalAcceptanceThreshold)
      ? "accepted"
      : "countered";

  return {
    decision,
    scoreBasisPoints,
    reasons: reasons.length === 0 ? ["meets_all_demands"] : reasons,
    demand: input.demand,
  };
}

function activeContractFor(
  careerState: CareerState,
  playerId: PlayerId,
  clubId: ClubId,
): PlayerContract | undefined {
  const senior = careerState.seniorSquadState;
  if (senior === undefined) return undefined;
  for (const contractId of senior.activeContractIds) {
    const contract = senior.contracts[contractId];
    if (contract?.playerId === playerId && contract.clubId === clubId) return contract;
  }
  return undefined;
}

function expectedStatus(input: {
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly age: number;
  readonly currentAbility: number;
  readonly potentialRoom: number;
}): AgreedSquadStatus {
  const club = input.careerState.gameState.clubs[input.clubId];
  if (club === undefined) return "squad_player";
  const ranked = club.playerIds
    .map((playerId, order) => ({
      playerId,
      order,
      ability: input.careerState.gameState.players[playerId] === undefined
        ? 0
        : derivePlayerMarketAbility(input.careerState.gameState.players[playerId]!).currentAbility,
    }))
    .concat(club.playerIds.includes(input.playerId)
      ? []
      : [{ playerId: input.playerId, order: club.playerIds.length, ability: input.currentAbility }])
    .sort((left, right) => right.ability - left.ability || left.order - right.order);
  const rank = Math.max(1, ranked.findIndex((candidate) => candidate.playerId === input.playerId) + 1);
  if (rank <= 3) return "key_player";
  if (input.age <= 21 && input.potentialRoom >= 2 && rank > 8) return "prospect";
  if (rank <= 11) return "regular_starter";
  if (rank <= 17) return "squad_player";
  return "fringe_player";
}

function termsFor(
  policy: PlayerWagePolicyConfig,
  role: PlayerRole,
  annualWage: Money,
  squadStatus: AgreedSquadStatus,
  durationYears: number,
  bonusBasisPoints: number,
): ContractOfferTerms {
  const bonuses = deriveCalibratedContractBonuses({
    policy,
    role,
    annualWage,
    status: squadStatus,
    scaleBasisPoints: bonusBasisPoints,
  });
  return { durationYears, annualWage, squadStatus, bonuses };
}

const STATUS_ORDER: readonly AgreedSquadStatus[] = [
  "prospect",
  "fringe_player",
  "squad_player",
  "regular_starter",
  "key_player",
];

function evaluationReasons(
  offer: ContractOfferTerms,
  demand: ContractDemandSnapshot,
): ContractOfferEvaluationReason[] {
  const reasons: ContractOfferEvaluationReason[] = [];
  if (offer.annualWage < demand.preferredTerms.annualWage) reasons.push("annual_wage_below_demand");
  if (statusRank(offer.squadStatus) < statusRank(demand.expectedSquadStatus)) reasons.push("squad_status_below_expectation");
  if (offer.durationYears < demand.preferredTerms.durationYears) reasons.push("duration_below_demand");
  if (demand.age >= 33 && offer.durationYears > 2) reasons.push("duration_above_veteran_preference");
  if (offer.bonuses.signingBonus < demand.preferredTerms.bonuses.signingBonus) reasons.push("signing_bonus_below_demand");
  if (offer.bonuses.appearanceBonus < demand.preferredTerms.bonuses.appearanceBonus) reasons.push("appearance_bonus_below_demand");
  if ((offer.bonuses.goalBonus ?? 0) < (demand.preferredTerms.bonuses.goalBonus ?? 0)) reasons.push("goal_bonus_below_demand");
  if ((offer.bonuses.cleanSheetBonus ?? 0) < (demand.preferredTerms.bonuses.cleanSheetBonus ?? 0)) reasons.push("clean_sheet_bonus_below_demand");
  return reasons;
}

function offerScore(offer: ContractOfferTerms, demand: ContractDemandSnapshot): number {
  const durationRatio = Math.min(1, offer.durationYears / demand.preferredTerms.durationYears);
  const statusRatio = Math.max(0, Math.min(1, 1 + 0.25 * (
    statusRank(offer.squadStatus) - statusRank(demand.expectedSquadStatus)
  )));
  const score =
    Math.min(1, ratio(offer.annualWage, demand.preferredTerms.annualWage)) * 5_000
    + Math.min(1, ratio(offer.bonuses.signingBonus, demand.preferredTerms.bonuses.signingBonus)) * 1_200
    + Math.min(1, ratio(offer.bonuses.appearanceBonus, demand.preferredTerms.bonuses.appearanceBonus)) * 800
    + Math.min(1, ratio(offer.bonuses.goalBonus ?? 0, demand.preferredTerms.bonuses.goalBonus ?? 0)) * 500
    + Math.min(1, ratio(offer.bonuses.cleanSheetBonus ?? 0, demand.preferredTerms.bonuses.cleanSheetBonus ?? 0)) * 500
    + durationRatio * 800
    + statusRatio * 1_200;
  return Math.max(0, Math.min(10_000, Math.round(score)));
}

function termsMeetMinimum(offer: ContractOfferTerms, minimum: ContractOfferTerms): boolean {
  return offer.annualWage >= minimum.annualWage
    && statusRank(offer.squadStatus) >= statusRank(minimum.squadStatus)
    && offer.durationYears >= minimum.durationYears
    && offer.bonuses.signingBonus >= minimum.bonuses.signingBonus
    && offer.bonuses.appearanceBonus >= minimum.bonuses.appearanceBonus
    && (offer.bonuses.goalBonus ?? 0) >= (minimum.bonuses.goalBonus ?? 0)
    && (offer.bonuses.cleanSheetBonus ?? 0) >= (minimum.bonuses.cleanSheetBonus ?? 0);
}

function statusRank(status: AgreedSquadStatus): number {
  return STATUS_ORDER.indexOf(status);
}

function ratio(value: number, target: number): number {
  return target <= 0 ? 1 : value / target;
}

function roundMoney(value: number, precision: number): number {
  return Math.max(0, Math.round(value / precision) * precision);
}

function roundAbility(value: number): number {
  return Math.round(value * 100) / 100;
}
