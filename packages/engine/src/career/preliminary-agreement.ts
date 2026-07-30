import {
  createCareerState,
  createEmptyPreliminaryAgreementState,
  createNegotiationStageClock,
  gameDate,
  isLivePreliminaryAgreement,
  isNegotiationStageExpired,
  nonNegativeMoney,
  preliminaryAgreementId,
  publishPreliminaryAgreement,
  type AgreedPreliminaryAgreement,
  type CareerState,
  type ContractOfferEvaluation,
  type ContractOfferTerms,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type PlayerContract,
  type PlayerWagePolicyConfig,
  type PreliminaryAgreement,
  type PreliminaryAgreementActivationCancellationReason,
  type PreliminaryAgreementId,
  type SeasonTransferWindows,
} from "@game/domain";

import { evaluateMarketActionEligibility } from "../market/market-eligibility.ts";
import { derivePlayerWillingness } from "../market/player-willingness.ts";
import { applyContractActivationFinance } from "./career-finance-lifecycle.ts";
import { evaluateCareerContractCapacity } from "./career-contract-capacity.ts";
import { reconcileClosedContractNegotiations } from "./contract-negotiation.ts";
import { deriveContractDemand, evaluateContractOffer } from "./contract-negotiation-demand.ts";
import { deriveNegotiationStageResponseDelayDays } from "./negotiation-response-delay.ts";
import { reconcileSelectedClubDeparturesFromMatchPreparation } from "./selected-match-preparation.ts";
import {
  prepareSeniorSquadDeparture,
  prepareSeniorSquadSigning,
  SeniorSquadTransferError,
} from "./senior-squad-transfer.ts";

/** Stable reasons an explicit future-contract command can be refused. */
export type PreliminaryAgreementCommandRejectionReason =
  | "agreement_not_found"
  | "agreement_already_exists"
  | "player_contract_not_found"
  | "not_in_final_six_months"
  | "counter_required"
  | "decision_after_deadline";

/** Applied or refused result of one explicit preliminary-agreement command. */
export type PreliminaryAgreementCommandResult =
  | {
      readonly status: "applied";
      readonly careerState: CareerState;
      readonly agreement: PreliminaryAgreement;
    }
  | {
      readonly status: "rejected";
      readonly reason: PreliminaryAgreementCommandRejectionReason;
      readonly agreementId: PreliminaryAgreementId;
    };

/** Input for submitting one future-contract offer to an externally owned player. */
export interface SubmitPreliminaryAgreementOfferInput {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly agreementId: PreliminaryAgreementId;
  readonly playerId: PlayerContract["playerId"];
  readonly offeringClubId: PlayerContract["clubId"];
  readonly submittedOn: GameDate;
  readonly terms: ContractOfferTerms;
  readonly transferWindows: SeasonTransferWindows;
}

/**
 * Starts one future-contract discussion without changing ownership or finance.
 *
 * The registration-window catalog is supplied to the canonical eligibility
 * query, but preliminary agreements remain legal outside those windows.
 */
export function submitPreliminaryAgreementOffer(
  input: SubmitPreliminaryAgreementOfferInput,
): PreliminaryAgreementCommandResult {
  const state = input.careerState.preliminaryAgreementState;
  if (state?.agreements[input.agreementId] !== undefined) {
    return rejected(input.agreementId, "agreement_already_exists");
  }
  if (
    state?.agreementIds.some((id) => {
      const agreement = state.agreements[id];
      return agreement?.playerId === input.playerId && isLivePreliminaryAgreement(agreement);
    })
  ) {
    return rejected(input.agreementId, "agreement_already_exists");
  }

  const currentContract = activeContractForPlayer(input.careerState, input.playerId);
  if (
    currentContract === undefined
    || currentContract.clubId === input.offeringClubId
    || currentContract.endsOn <= input.submittedOn
  ) {
    return rejected(input.agreementId, "player_contract_not_found");
  }
  const eligibility = evaluateMarketActionEligibility({
    action: "preliminary_agreement",
    windows: input.transferWindows,
    asOf: input.submittedOn,
    targetContractRemainingDays: currentContract.endsOn - input.submittedOn,
  });
  if (eligibility.status === "blocked") {
    return rejected(input.agreementId, "not_in_final_six_months");
  }

  const demand = deriveContractDemand({
    careerState: input.careerState,
    wagePolicy: input.wagePolicy,
    playerId: input.playerId,
    clubId: input.offeringClubId,
    evaluatedOn: input.submittedOn,
    currentContract,
    isFreeAgent: false,
  });
  const agreement: PreliminaryAgreement = {
    id: input.agreementId,
    playerId: input.playerId,
    currentClubId: currentContract.clubId,
    offeringClubId: input.offeringClubId,
    currentContractId: currentContract.id,
    createdOn: input.submittedOn,
    futureStartsOn: currentContract.endsOn,
    status: "offer_submitted",
    offeredTerms: input.terms,
    demand,
    clock: createNegotiationStageClock({
      submittedOn: input.submittedOn,
      responseDelayDays: responseDelayDays(
        input.careerState,
        input.agreementId,
        input.submittedOn,
      ),
      mustResolveBy: gameDate(currentContract.endsOn - 1),
    }),
  };
  return applied(input.careerState, agreement, true);
}

/** One durable preliminary-agreement result emitted during date advancement. */
export interface PreliminaryAgreementLifecycleFact {
  readonly agreementId: PreliminaryAgreementId;
  readonly playerId: PlayerContract["playerId"];
  readonly offeringClubId: PlayerContract["clubId"];
  readonly occurredOn: GameDate;
  readonly event:
    | "offer_rejected"
    | "countered"
    | "agreed"
    | "expired"
    | "activated"
    | "activation_cancelled";
  readonly reason?: string;
}

/** Result of resolving and activating every due future agreement. */
export interface AdvancePreliminaryAgreementLifecycleResult {
  readonly careerState: CareerState;
  readonly facts: readonly PreliminaryAgreementLifecycleFact[];
}

/**
 * Resolves due offers and activates agreed future contracts in stable ID order.
 *
 * Replaying the same date is idempotent: terminal agreements are retained as
 * facts and never repost finance or ownership transitions.
 */
export function advancePreliminaryAgreementLifecycle(input: {
  readonly careerState: CareerState;
  readonly throughDate: GameDate;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): AdvancePreliminaryAgreementLifecycleResult {
  const state = input.careerState.preliminaryAgreementState;
  if (state === undefined) return { careerState: input.careerState, facts: [] };

  let careerState = input.careerState;
  const facts: PreliminaryAgreementLifecycleFact[] = [];
  const dueAgreementIds = state.agreementIds
    .filter((agreementId) => {
      const agreement = state.agreements[agreementId];
      return agreement?.status === "offer_submitted" || agreement?.status === "countered";
    })
    .sort((leftId, rightId) => {
      const left = state.agreements[leftId];
      const right = state.agreements[rightId];
      if (left === undefined || right === undefined) return String(leftId).localeCompare(String(rightId));
      return left.createdOn - right.createdOn || String(leftId).localeCompare(String(rightId));
    });
  for (const agreementId of dueAgreementIds) {
    const agreement = careerState.preliminaryAgreementState?.agreements[agreementId];
    if (agreement?.status === "countered") {
      if (
        input.throughDate >= agreement.futureStartsOn
        || isNegotiationStageExpired(agreement.clock, input.throughDate)
      ) {
        const expired = expireAgreement(
          agreement,
          input.throughDate >= agreement.futureStartsOn
            ? "current_contract_expired"
            : "negotiation_deadline",
        );
        careerState = publish(careerState, expired);
        facts.push(fact(expired, "expired", expired.expiredOn, expired.reason));
      }
      continue;
    }
    if (agreement?.status === "offer_submitted") {
      if (
        input.throughDate >= agreement.futureStartsOn
        || isNegotiationStageExpired(agreement.clock, input.throughDate)
      ) {
        const expired = expireAgreement(
          agreement,
          input.throughDate >= agreement.futureStartsOn
            ? "current_contract_expired"
            : "negotiation_deadline",
        );
        careerState = publish(careerState, expired);
        facts.push(fact(expired, "expired", expired.expiredOn, expired.reason));
        continue;
      }
      if (input.throughDate < agreement.clock.responseDueOn) continue;
      const resolution = resolveSubmittedAgreement(
        careerState,
        agreement,
        input.wagePolicy,
        input.marketBehaviorPolicy,
      );
      careerState = resolution.careerState;
      facts.push(resolution.fact);
    }
  }

  const activationState = careerState.preliminaryAgreementState;
  const activationIds = (activationState?.agreementIds ?? [])
    .filter((agreementId) => activationState?.agreements[agreementId]?.status === "agreed")
    .sort((leftId, rightId) => {
      const left = activationState?.agreements[leftId];
      const right = activationState?.agreements[rightId];
      if (left?.status !== "agreed" || right?.status !== "agreed") {
        return String(leftId).localeCompare(String(rightId));
      }
      return left.createdOn - right.createdOn || String(leftId).localeCompare(String(rightId));
    });
  for (const agreementId of activationIds) {
    const agreement = careerState.preliminaryAgreementState?.agreements[agreementId];
    if (agreement?.status !== "agreed" || agreement.futureStartsOn > input.throughDate) continue;
    const activation = activateAgreement(careerState, agreement);
    careerState = activation.careerState;
    facts.push(activation.fact);
  }

  return facts.length === 0
    ? { careerState: input.careerState, facts: [] }
    : { careerState, facts };
}

/** Accepts one live player counter after rechecking future affordability. */
export function acceptPreliminaryAgreementCounter(input: {
  readonly careerState: CareerState;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly agreementId: PreliminaryAgreementId;
  readonly decidedOn: GameDate;
}): PreliminaryAgreementCommandResult {
  const agreement = findAgreement(input.careerState, input.agreementId);
  if (agreement === undefined) return rejected(input.agreementId, "agreement_not_found");
  if (agreement.status !== "countered") return rejected(input.agreementId, "counter_required");
  if (input.decidedOn > agreement.clock.deadline) {
    return rejected(input.agreementId, "decision_after_deadline");
  }
  if (!futureTermsAreAffordable(
    input.careerState,
    agreement,
    agreement.counterTerms,
    input.wagePolicy,
    input.marketBehaviorPolicy,
  )) {
    const rejectedAgreement: PreliminaryAgreement = {
      ...base(agreement),
      status: "rejected",
      rejectedOn: input.decidedOn,
      reason: "club_terms_unaffordable",
      evaluation: agreement.evaluation,
    };
    return applied(input.careerState, rejectedAgreement);
  }
  const agreed = agreedAgreement(
    agreement,
    agreement.counterTerms,
    "counter_offer",
    agreement.evaluation,
    input.decidedOn,
  );
  return applied(input.careerState, agreed);
}

/** Rejects one player counter without mutating ownership or finance. */
export function rejectPreliminaryAgreementCounter(input: {
  readonly careerState: CareerState;
  readonly agreementId: PreliminaryAgreementId;
  readonly decidedOn: GameDate;
}): PreliminaryAgreementCommandResult {
  const agreement = findAgreement(input.careerState, input.agreementId);
  if (agreement === undefined) return rejected(input.agreementId, "agreement_not_found");
  if (agreement.status !== "countered") return rejected(input.agreementId, "counter_required");
  const withdrawn: PreliminaryAgreement = {
    ...base(agreement),
    status: "withdrawn",
    withdrawnOn: input.decidedOn,
  };
  return applied(input.careerState, withdrawn);
}

/** Withdraws any submitted or countered future-contract discussion. */
export function withdrawPreliminaryAgreement(input: {
  readonly careerState: CareerState;
  readonly agreementId: PreliminaryAgreementId;
  readonly withdrawnOn: GameDate;
}): PreliminaryAgreementCommandResult {
  const agreement = findAgreement(input.careerState, input.agreementId);
  if (agreement === undefined) return rejected(input.agreementId, "agreement_not_found");
  if (agreement.status !== "offer_submitted" && agreement.status !== "countered") {
    return rejected(input.agreementId, "counter_required");
  }
  return applied(input.careerState, {
    ...base(agreement),
    status: "withdrawn",
    withdrawnOn: input.withdrawnOn,
  });
}

function resolveSubmittedAgreement(
  careerState: CareerState,
  agreement: Extract<PreliminaryAgreement, { readonly status: "offer_submitted" }>,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): {
  readonly careerState: CareerState;
  readonly fact: PreliminaryAgreementLifecycleFact;
} {
  const decidedOn = agreement.clock.responseDueOn;
  const player = careerState.gameState.players[agreement.playerId];
  const currentClub = careerState.gameState.clubs[agreement.currentClubId];
  const offeringClub = careerState.gameState.clubs[agreement.offeringClubId];
  const currentContract = activeContractForPlayer(careerState, agreement.playerId);
  if (
    player === undefined
    || currentClub === undefined
    || offeringClub === undefined
    || currentContract?.id !== agreement.currentContractId
  ) {
    const expired = expireAgreement(agreement, "current_contract_expired", decidedOn);
    const next = publish(careerState, expired);
    return { careerState: next, fact: fact(expired, "expired", expired.expiredOn, expired.reason) };
  }

  const willingness = derivePlayerWillingness({
    player,
    sellingClub: currentClub,
    buyingClub: offeringClub,
    currentTier: currentClub.category,
    destinationTier: offeringClub.category,
    currentDate: decidedOn,
    currentContract,
    proposedTerms: agreement.offeredTerms,
    marketBehaviorPolicy,
    ratingScale: wagePolicy.ratingScale,
  });
  if (willingness.status === "rejected") {
    const rejectedAgreement: PreliminaryAgreement = {
      ...base(agreement),
      status: "rejected",
      rejectedOn: decidedOn,
      reason: "player_unwilling",
    };
    return {
      careerState: publish(careerState, rejectedAgreement),
      fact: fact(rejectedAgreement, "offer_rejected", decidedOn, "player_unwilling"),
    };
  }

  const evaluation = evaluateContractOffer({
    worldSeed: careerState.gameState.meta.seed,
    negotiationId: agreement.id,
    evaluatedOn: decidedOn,
    offer: agreement.offeredTerms,
    demand: agreement.demand,
  });
  if (evaluation.decision === "rejected") {
    const rejectedAgreement: PreliminaryAgreement = {
      ...base(agreement),
      status: "rejected",
      rejectedOn: decidedOn,
      reason: "contract_terms_rejected",
      evaluation,
    };
    return {
      careerState: publish(careerState, rejectedAgreement),
      fact: fact(rejectedAgreement, "offer_rejected", decidedOn, "contract_terms_rejected"),
    };
  }
  if (evaluation.decision === "countered") {
    const countered: PreliminaryAgreement = {
      ...base(agreement),
      status: "countered",
      offeredTerms: agreement.offeredTerms,
      counterTerms: agreement.demand.preferredTerms,
      counterIssuedOn: decidedOn,
      evaluation,
      clock: agreement.clock,
    };
    return {
      careerState: publish(careerState, countered),
      fact: fact(countered, "countered", decidedOn),
    };
  }
  if (!futureTermsAreAffordable(
    careerState,
    agreement,
    agreement.offeredTerms,
    wagePolicy,
    marketBehaviorPolicy,
  )) {
    const rejectedAgreement: PreliminaryAgreement = {
      ...base(agreement),
      status: "rejected",
      rejectedOn: decidedOn,
      reason: "club_terms_unaffordable",
      evaluation,
    };
    return {
      careerState: publish(careerState, rejectedAgreement),
      fact: fact(rejectedAgreement, "offer_rejected", decidedOn, "club_terms_unaffordable"),
    };
  }
  const agreed = agreedAgreement(
    agreement,
    agreement.offeredTerms,
    "submitted_offer",
    evaluation,
    decidedOn,
  );
  return {
    careerState: publish(careerState, agreed),
    fact: fact(agreed, "agreed", decidedOn),
  };
}

function activateAgreement(
  careerState: CareerState,
  agreement: AgreedPreliminaryAgreement,
): {
  readonly careerState: CareerState;
  readonly fact: PreliminaryAgreementLifecycleFact;
} {
  const cancellationReason = activationPreflight(careerState, agreement);
  if (cancellationReason !== undefined) {
    return cancelledActivation(careerState, agreement, cancellationReason);
  }
  const senior = careerState.seniorSquadState!;
  const registration = senior.registrationIds
    .map((id) => senior.registrations[id])
    .find((candidate) => candidate?.playerId === agreement.playerId);

  try {
    const departure = prepareSeniorSquadDeparture({
      gameState: careerState.gameState,
      seniorSquadState: senior,
      playerId: agreement.playerId,
      occurredOn: agreement.futureStartsOn,
      transitionSequence: senior.contractHistoryEntryIds.length + 1,
      event: "expired",
    });
    const signing = prepareSeniorSquadSigning({
      gameState: departure.gameState,
      seniorSquadState: departure.seniorSquadState,
      playerId: agreement.playerId,
      clubId: agreement.offeringClubId,
      occurredOn: agreement.futureStartsOn,
      transitionSequence: departure.seniorSquadState.contractHistoryEntryIds.length + 1,
      acceptedTerms: agreement.agreedTerms,
      ...(registration === undefined ? {} : { preferredShirtNumber: registration.shirtNumber }),
    });
    const contractNegotiationState = reconcileClosedContractNegotiations({
      gameState: signing.gameState,
      seniorSquadState: signing.seniorSquadState,
      contractNegotiationState: careerState.contractNegotiationState,
      closedContractIds: [agreement.currentContractId],
    });
    const matchPreparation = reconcileSelectedClubDeparturesFromMatchPreparation({
      careerState,
      departingClubId: agreement.currentClubId,
      playerIds: new Set([agreement.playerId]),
    });
    const {
      contractNegotiationState: _previousContractNegotiationState,
      matchPreparation: _previousMatchPreparation,
      ...careerWithoutDependentState
    } = careerState;
    const financeBaseState = createCareerState({
      ...careerWithoutDependentState,
      ...(contractNegotiationState === undefined ? {} : { contractNegotiationState }),
      ...(matchPreparation === undefined ? {} : { matchPreparation }),
    });
    const financed = applyContractActivationFinance({
      careerState: financeBaseState,
      proposedGameState: signing.gameState,
      seniorSquadState: signing.seniorSquadState,
      activatedContractIds: [signing.activatedContractId],
      occurredOn: agreement.futureStartsOn,
    });
    if (financed.status === "rejected") {
      return cancelledActivation(
        careerState,
        agreement,
        financed.reason === "wage_budget_exceeded" || financed.reason === "insufficient_cash"
          ? "unaffordable"
          : "destination_unavailable",
      );
    }
    const activated: PreliminaryAgreement = {
      ...agreement,
      status: "activated",
      activatedOn: agreement.futureStartsOn,
      activatedContractId: signing.activatedContractId,
    };
    const activatedCareerState = publish(financed.careerState, activated);
    return {
      careerState: activatedCareerState,
      fact: fact(activated, "activated", agreement.futureStartsOn),
    };
  } catch (error) {
    if (!(error instanceof SeniorSquadTransferError)) throw error;
    return cancelledActivation(careerState, agreement, "registration_unavailable");
  }
}

function activationPreflight(
  careerState: CareerState,
  agreement: AgreedPreliminaryAgreement,
): PreliminaryAgreementActivationCancellationReason | undefined {
  const senior = careerState.seniorSquadState;
  if (senior === undefined || careerState.gameState.clubs[agreement.offeringClubId] === undefined) {
    return "destination_unavailable";
  }
  const current = senior.contracts[agreement.currentContractId];
  if (
    current === undefined
    || current.playerId !== agreement.playerId
    || current.clubId !== agreement.currentClubId
    || current.endsOn !== agreement.futureStartsOn
  ) {
    return "current_contract_changed";
  }
  const active = activeContractForPlayer(careerState, agreement.playerId);
  if (active?.id !== agreement.currentContractId) return "contract_overlap";
  if (!careerState.gameState.clubs[agreement.currentClubId]?.playerIds.includes(agreement.playerId)) {
    return "player_ownership_changed";
  }
  if (careerState.gameState.clubs[agreement.offeringClubId]?.playerIds.includes(agreement.playerId)) {
    return "contract_overlap";
  }
  return undefined;
}

function cancelledActivation(
  careerState: CareerState,
  agreement: AgreedPreliminaryAgreement,
  reason: PreliminaryAgreementActivationCancellationReason,
): {
  readonly careerState: CareerState;
  readonly fact: PreliminaryAgreementLifecycleFact;
} {
  const cancelled: PreliminaryAgreement = {
    ...agreement,
    status: "activation_cancelled",
    cancelledOn: agreement.futureStartsOn,
    reason,
  };
  return {
    careerState: publish(careerState, cancelled),
    fact: fact(cancelled, "activation_cancelled", agreement.futureStartsOn, reason),
  };
}

function futureTermsAreAffordable(
  careerState: CareerState,
  agreement: Pick<PreliminaryAgreement, "id" | "offeringClubId">,
  terms: ContractOfferTerms,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): boolean {
  let agreedAnnualWage = 0;
  let agreedSigningBonus = 0;
  const state = careerState.preliminaryAgreementState;
  for (const id of state?.agreementIds ?? []) {
    if (id === agreement.id) continue;
    const existing = state?.agreements[id];
    if (existing?.status !== "agreed" || existing.offeringClubId !== agreement.offeringClubId) {
      continue;
    }
    agreedAnnualWage += existing.agreedTerms.annualWage;
    agreedSigningBonus += existing.agreedTerms.bonuses.signingBonus;
  }
  return evaluateCareerContractCapacity({
    careerState,
    clubId: agreement.offeringClubId,
    wagePolicy,
    marketBehaviorPolicy,
    addedAnnualWage: nonNegativeMoney(agreedAnnualWage + terms.annualWage),
    addedSigningBonus: nonNegativeMoney(agreedSigningBonus + terms.bonuses.signingBonus),
  }).status === "affordable";
}

function agreedAgreement(
  agreement: PreliminaryAgreement,
  terms: ContractOfferTerms,
  acceptedSource: AgreedPreliminaryAgreement["acceptedSource"],
  evaluation: ContractOfferEvaluation,
  agreedOn: GameDate,
): AgreedPreliminaryAgreement {
  return {
    ...base(agreement),
    status: "agreed",
    agreedOn,
    agreedTerms: terms,
    acceptedSource,
    evaluation,
  };
}

function expireAgreement(
  agreement: Extract<
    PreliminaryAgreement,
    { readonly status: "offer_submitted" | "countered" }
  >,
  reason: "negotiation_deadline" | "current_contract_expired",
  expiredOn?: GameDate,
): Extract<PreliminaryAgreement, { readonly status: "expired" }> {
  return {
    ...base(agreement),
    status: "expired",
    expiredOn: expiredOn ?? (reason === "current_contract_expired"
      ? agreement.futureStartsOn
      : agreement.clock.deadline),
    reason,
  };
}

function activeContractForPlayer(
  careerState: CareerState,
  playerId: PlayerContract["playerId"],
): PlayerContract | undefined {
  const senior = careerState.seniorSquadState;
  for (const contractId of senior?.activeContractIds ?? []) {
    const contract = senior?.contracts[contractId];
    if (contract?.playerId === playerId) return contract;
  }
  return undefined;
}

function responseDelayDays(
  careerState: CareerState,
  agreementId: PreliminaryAgreementId,
  submittedOn: GameDate,
): number {
  return deriveNegotiationStageResponseDelayDays({
    seed: careerState.gameState.meta.seed,
    streamKey: "preliminary-agreement-response-delay",
    negotiationId: agreementId,
    submittedOn,
  });
}

function findAgreement(
  careerState: CareerState,
  agreementId: PreliminaryAgreementId,
): PreliminaryAgreement | undefined {
  return careerState.preliminaryAgreementState?.agreements[agreementId];
}

function base(agreement: PreliminaryAgreement) {
  return {
    id: agreement.id,
    playerId: agreement.playerId,
    currentClubId: agreement.currentClubId,
    offeringClubId: agreement.offeringClubId,
    currentContractId: agreement.currentContractId,
    createdOn: agreement.createdOn,
    futureStartsOn: agreement.futureStartsOn,
  };
}

function publish(
  careerState: CareerState,
  agreement: PreliminaryAgreement,
  append = false,
): CareerState {
  const state = careerState.preliminaryAgreementState ?? createEmptyPreliminaryAgreementState();
  const preliminaryAgreementState = publishPreliminaryAgreement(
    careerState.gameState,
    careerState.seniorSquadState,
    state,
    agreement,
    append,
  );
  return createCareerState({ ...careerState, preliminaryAgreementState });
}

function applied(
  careerState: CareerState,
  agreement: PreliminaryAgreement,
  append = false,
): Extract<PreliminaryAgreementCommandResult, { readonly status: "applied" }> {
  return { status: "applied", careerState: publish(careerState, agreement, append), agreement };
}

function rejected(
  agreementId: PreliminaryAgreementId,
  reason: PreliminaryAgreementCommandRejectionReason,
): Extract<PreliminaryAgreementCommandResult, { readonly status: "rejected" }> {
  return { status: "rejected", agreementId, reason };
}

function fact(
  agreement: PreliminaryAgreement,
  event: PreliminaryAgreementLifecycleFact["event"],
  occurredOn: GameDate,
  reason?: string,
): PreliminaryAgreementLifecycleFact {
  return {
    agreementId: agreement.id,
    playerId: agreement.playerId,
    offeringClubId: agreement.offeringClubId,
    occurredOn,
    event,
    ...(reason === undefined ? {} : { reason }),
  };
}

/** Creates deterministic IDs for AI or adapter-owned future approaches. */
export function createPreliminaryAgreementId(
  playerId: PlayerContract["playerId"],
  offeringClubId: PlayerContract["clubId"],
  sequence: number,
): PreliminaryAgreementId {
  return preliminaryAgreementId(
    `preliminary-agreement:${String(playerId).slice(7)}:${String(offeringClubId).slice(5)}:${sequence}`,
  );
}
