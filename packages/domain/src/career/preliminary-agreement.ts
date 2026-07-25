import type { GameState } from "../state/game-state.ts";
import type { Brand } from "../types/brand.ts";
import type { ClubId, PlayerContractId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import {
  assertValidContractOfferTerms,
  type ContractDemandSnapshot,
  type ContractOfferEvaluation,
  type ContractOfferTerms,
} from "./contract-negotiation.ts";
import type { NegotiationStageClock } from "./negotiation-stage-clock.ts";
import type { SeniorSquadState } from "./senior-squad.ts";

/** Stable identifier for one future-contract discussion. */
export type PreliminaryAgreementId = Brand<string, "PreliminaryAgreementId">;

/** Creates a validated future-agreement identifier. */
export function preliminaryAgreementId(value: string): PreliminaryAgreementId {
  if (!value.startsWith("preliminary-agreement:") || value.length === "preliminary-agreement:".length) {
    throw new Error(`Preliminary agreement ID must use its namespace: ${value}`);
  }
  return value as PreliminaryAgreementId;
}

interface PreliminaryAgreementBase {
  readonly id: PreliminaryAgreementId;
  readonly playerId: PlayerId;
  readonly currentClubId: ClubId;
  readonly offeringClubId: ClubId;
  readonly currentContractId: PlayerContractId;
  readonly createdOn: GameDate;
  /** Exact first day on which the future contract may become active. */
  readonly futureStartsOn: GameDate;
}

/** Future offer waiting for its deterministic player response. */
export interface SubmittedPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "offer_submitted";
  readonly offeredTerms: ContractOfferTerms;
  readonly demand: ContractDemandSnapshot;
  readonly clock: NegotiationStageClock;
}

/** Future offer waiting for an explicit club response to the player's counter. */
export interface CounteredPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "countered";
  readonly offeredTerms: ContractOfferTerms;
  readonly counterTerms: ContractOfferTerms;
  readonly counterIssuedOn: GameDate;
  readonly evaluation: ContractOfferEvaluation;
  readonly clock: NegotiationStageClock;
}

/** Accepted future terms that have not yet changed ownership or registration. */
export interface AgreedPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "agreed";
  readonly agreedOn: GameDate;
  readonly agreedTerms: ContractOfferTerms;
  readonly acceptedSource: "submitted_offer" | "counter_offer";
  readonly evaluation: ContractOfferEvaluation;
}

/** Player rejection of a submitted future offer. */
export interface RejectedPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "rejected";
  readonly rejectedOn: GameDate;
  readonly reason: "player_unwilling" | "contract_terms_rejected" | "club_terms_unaffordable";
  readonly evaluation?: ContractOfferEvaluation;
}

/** Offering club withdrew the future-contract discussion. */
export interface WithdrawnPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "withdrawn";
  readonly withdrawnOn: GameDate;
}

/** A submitted offer or counter passed its immutable three-day deadline. */
export interface ExpiredPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "expired";
  readonly expiredOn: GameDate;
  readonly reason: "negotiation_deadline" | "current_contract_expired";
}

/** Stable reason a previously agreed future arrival could not be activated. */
export type PreliminaryAgreementActivationCancellationReason =
  | "current_contract_changed"
  | "player_ownership_changed"
  | "destination_unavailable"
  | "registration_unavailable"
  | "unaffordable"
  | "contract_overlap";

/** Durable failed activation fact; no partial ownership change accompanies it. */
export interface CancelledPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "activation_cancelled";
  readonly cancelledOn: GameDate;
  readonly agreedOn: GameDate;
  readonly agreedTerms: ContractOfferTerms;
  readonly acceptedSource: "submitted_offer" | "counter_offer";
  readonly evaluation: ContractOfferEvaluation;
  readonly reason: PreliminaryAgreementActivationCancellationReason;
}

/** Future agreement that became one real active contract. */
export interface ActivatedPreliminaryAgreement extends PreliminaryAgreementBase {
  readonly status: "activated";
  readonly agreedOn: GameDate;
  readonly agreedTerms: ContractOfferTerms;
  readonly acceptedSource: "submitted_offer" | "counter_offer";
  readonly evaluation: ContractOfferEvaluation;
  readonly activatedOn: GameDate;
  readonly activatedContractId: PlayerContractId;
}

/** Complete durable future-contract state machine. */
export type PreliminaryAgreement =
  | SubmittedPreliminaryAgreement
  | CounteredPreliminaryAgreement
  | AgreedPreliminaryAgreement
  | RejectedPreliminaryAgreement
  | WithdrawnPreliminaryAgreement
  | ExpiredPreliminaryAgreement
  | CancelledPreliminaryAgreement
  | ActivatedPreliminaryAgreement;

/** Ordered durable collection of future-contract discussions and outcomes. */
export interface PreliminaryAgreementState {
  readonly agreements: Readonly<Record<PreliminaryAgreementId, PreliminaryAgreement>>;
  readonly agreementIds: readonly PreliminaryAgreementId[];
}

/** Creates the empty collection used before the first future-contract approach. */
export function createEmptyPreliminaryAgreementState(): PreliminaryAgreementState {
  return { agreements: {}, agreementIds: [] };
}

/** Returns whether an agreement still prevents another future deal for the player. */
export function isLivePreliminaryAgreement(agreement: PreliminaryAgreement): boolean {
  return agreement.status === "offer_submitted"
    || agreement.status === "countered"
    || agreement.status === "agreed";
}

/** Validates and copies the complete future-agreement collection. */
export function createPreliminaryAgreementState(
  gameState: Pick<GameState, "players" | "clubs">,
  seniorSquadState: SeniorSquadState | undefined,
  input: PreliminaryAgreementState,
): PreliminaryAgreementState {
  if (seniorSquadState === undefined && input.agreementIds.length > 0) {
    throw new Error("Preliminary agreements require senior-squad state.");
  }
  const agreements: Record<PreliminaryAgreementId, PreliminaryAgreement> = {};
  const seen = new Set<PreliminaryAgreementId>();
  const livePlayers = new Set<PlayerId>();

  for (const id of input.agreementIds) {
    if (seen.has(id)) throw new Error(`Duplicate preliminary agreement ID: ${id}`);
    const agreement = input.agreements[id];
    if (agreement === undefined || agreement.id !== id) {
      throw new Error(`Preliminary agreement not found: ${id}`);
    }
    if (gameState.players[agreement.playerId] === undefined) {
      throw new Error(`Preliminary-agreement player not found: ${agreement.playerId}`);
    }
    if (
      gameState.clubs[agreement.currentClubId] === undefined
      || gameState.clubs[agreement.offeringClubId] === undefined
    ) {
      throw new Error(`Preliminary-agreement club not found: ${id}`);
    }
    if (agreement.currentClubId === agreement.offeringClubId) {
      throw new Error(`A club cannot sign a preliminary agreement with its own player: ${id}`);
    }
    const currentContract = seniorSquadState?.contracts[agreement.currentContractId];
    if (
      currentContract === undefined
      || currentContract.playerId !== agreement.playerId
      || currentContract.clubId !== agreement.currentClubId
    ) {
      throw new Error(`Preliminary agreement does not match its current contract: ${id}`);
    }
    if (agreement.futureStartsOn !== currentContract.endsOn) {
      throw new Error(`Preliminary agreement must start when the current contract ends: ${id}`);
    }
    validateAgreementDatesAndTerms(agreement);
    if (isLivePreliminaryAgreement(agreement)) {
      if (livePlayers.has(agreement.playerId)) {
        throw new Error(`Player has multiple live preliminary agreements: ${agreement.playerId}`);
      }
      livePlayers.add(agreement.playerId);
    }
    if (agreement.status === "activated") {
      const activated = seniorSquadState?.contracts[agreement.activatedContractId];
      if (
        activated === undefined
        || activated.playerId !== agreement.playerId
        || activated.clubId !== agreement.offeringClubId
        || activated.startsOn !== agreement.futureStartsOn
      ) {
        throw new Error(`Activated contract does not match preliminary agreement: ${id}`);
      }
    }
    agreements[id] = copyAgreement(agreement);
    seen.add(id);
  }

  return { agreements, agreementIds: [...input.agreementIds] };
}

/** Appends or replaces one agreement through the aggregate validator. */
export function publishPreliminaryAgreement(
  gameState: Pick<GameState, "players" | "clubs">,
  seniorSquadState: SeniorSquadState | undefined,
  state: PreliminaryAgreementState,
  agreement: PreliminaryAgreement,
  append = false,
): PreliminaryAgreementState {
  const current = createPreliminaryAgreementState(gameState, seniorSquadState, state);
  const existing = current.agreements[agreement.id];
  if (append && existing !== undefined) throw new Error(`Duplicate preliminary agreement ID: ${agreement.id}`);
  if (!append && existing === undefined) throw new Error(`Preliminary agreement not found: ${agreement.id}`);
  return createPreliminaryAgreementState(gameState, seniorSquadState, {
    agreements: { ...current.agreements, [agreement.id]: agreement },
    agreementIds: append ? [...current.agreementIds, agreement.id] : current.agreementIds,
  });
}

function validateAgreementDatesAndTerms(agreement: PreliminaryAgreement): void {
  if (agreement.createdOn >= agreement.futureStartsOn) invalidDates(agreement);
  if (agreement.status === "offer_submitted") {
    assertValidContractOfferTerms(agreement.offeredTerms);
    validateClock(agreement);
    return;
  }
  if (agreement.status === "countered") {
    assertValidContractOfferTerms(agreement.offeredTerms);
    assertValidContractOfferTerms(agreement.counterTerms);
    validateClock(agreement);
    if (agreement.counterIssuedOn < agreement.clock.responseDueOn) invalidDates(agreement);
    return;
  }
  if (agreement.status === "rejected") {
    if (agreement.rejectedOn < agreement.createdOn) invalidDates(agreement);
    return;
  }
  if (agreement.status === "withdrawn") {
    if (agreement.withdrawnOn < agreement.createdOn) invalidDates(agreement);
    return;
  }
  if (agreement.status === "expired") {
    if (agreement.expiredOn < agreement.createdOn) invalidDates(agreement);
    return;
  }

  assertValidContractOfferTerms(agreement.agreedTerms);
  if (agreement.agreedOn < agreement.createdOn || agreement.agreedOn >= agreement.futureStartsOn) {
    invalidDates(agreement);
  }
  if (agreement.status === "activation_cancelled" && agreement.cancelledOn < agreement.futureStartsOn) {
    invalidDates(agreement);
  }
  if (agreement.status === "activated" && agreement.activatedOn !== agreement.futureStartsOn) {
    invalidDates(agreement);
  }
}

function validateClock(
  agreement: SubmittedPreliminaryAgreement | CounteredPreliminaryAgreement,
): void {
  if (
    agreement.clock.submittedOn !== agreement.createdOn
    || agreement.clock.responseDueOn < agreement.clock.submittedOn
    || agreement.clock.responseDueOn > agreement.clock.deadline
    || agreement.clock.deadline >= agreement.futureStartsOn
  ) invalidDates(agreement);
}

function invalidDates(agreement: PreliminaryAgreement): never {
  throw new Error(`Invalid preliminary-agreement dates: ${agreement.id}`);
}

function copyAgreement(agreement: PreliminaryAgreement): PreliminaryAgreement {
  if (agreement.status === "offer_submitted") {
    return {
      ...agreement,
      offeredTerms: copyTerms(agreement.offeredTerms),
      demand: copyDemand(agreement.demand),
      clock: { ...agreement.clock },
    };
  }
  if (agreement.status === "countered") {
    return {
      ...agreement,
      offeredTerms: copyTerms(agreement.offeredTerms),
      counterTerms: copyTerms(agreement.counterTerms),
      evaluation: copyEvaluation(agreement.evaluation),
      clock: { ...agreement.clock },
    };
  }
  if (agreement.status === "rejected") {
    return {
      ...agreement,
      ...(agreement.evaluation === undefined ? {} : { evaluation: copyEvaluation(agreement.evaluation) }),
    };
  }
  if (
    agreement.status === "agreed"
    || agreement.status === "activation_cancelled"
    || agreement.status === "activated"
  ) {
    return {
      ...agreement,
      agreedTerms: copyTerms(agreement.agreedTerms),
      evaluation: copyEvaluation(agreement.evaluation),
    };
  }
  return { ...agreement };
}

function copyTerms(terms: ContractOfferTerms): ContractOfferTerms {
  return { ...terms, bonuses: { ...terms.bonuses } };
}

function copyDemand(demand: ContractDemandSnapshot): ContractDemandSnapshot {
  return {
    ...demand,
    preferredTerms: copyTerms(demand.preferredTerms),
    minimumTerms: copyTerms(demand.minimumTerms),
  };
}

function copyEvaluation(evaluation: ContractOfferEvaluation): ContractOfferEvaluation {
  return { ...evaluation, reasons: [...evaluation.reasons], demand: copyDemand(evaluation.demand) };
}
