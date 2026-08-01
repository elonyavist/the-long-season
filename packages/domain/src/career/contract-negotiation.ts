import type { GameState } from "../state/game-state.ts";
import type { Brand } from "../types/brand.ts";
import type { ClubId, PlayerContractId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney, type Money } from "../value-objects/money.ts";
import type { PlayerRole } from "../entities/player.entity.ts";
import type { AgreedSquadStatus, PlayerContractBonuses, SeniorSquadState } from "./senior-squad.ts";

/** Stable identifier for one contract-negotiation lifecycle. */
export type ContractNegotiationId = Brand<string, "ContractNegotiationId">;

/** Creates a validated contract-negotiation identifier. */
export function contractNegotiationId(value: string): ContractNegotiationId {
  if (!value.startsWith("contract-negotiation:") || value.length === "contract-negotiation:".length) {
    throw new Error(`Contract negotiation ID must use the contract-negotiation namespace: ${value}`);
  }
  return value as ContractNegotiationId;
}

/** Every financial and sporting term supported by the current contract lifecycle. */
export interface ContractOfferTerms {
  readonly durationYears: number;
  readonly annualWage: Money;
  readonly squadStatus: AgreedSquadStatus;
  readonly bonuses: PlayerContractBonuses;
}

/**
 * Validates the one canonical set of contract terms shared by every signing flow.
 *
 * Negotiation aggregates may attach their own error code and context, but they
 * must not duplicate duration, wage, or bonus validation rules.
 */
export function assertValidContractOfferTerms(terms: ContractOfferTerms): void {
  if (!Number.isSafeInteger(terms.durationYears) || terms.durationYears < 1 || terms.durationYears > 5) {
    throw new Error(`Contract duration must be a whole number from one to five years: ${terms.durationYears}`);
  }
  nonNegativeMoney(terms.annualWage);
  nonNegativeMoney(terms.bonuses.signingBonus);
  nonNegativeMoney(terms.bonuses.appearanceBonus);
  if (terms.bonuses.goalBonus !== undefined) nonNegativeMoney(terms.bonuses.goalBonus);
  if (terms.bonuses.cleanSheetBonus !== undefined) nonNegativeMoney(terms.bonuses.cleanSheetBonus);
}

/** Editable offer before the club commits it to a delayed player response. */
export interface ContractOfferDraft {
  readonly createdOn: GameDate;
  readonly terms: ContractOfferTerms;
}

/** Immutable offer submitted to the player with a deterministic response date. */
export interface SubmittedContractOffer {
  readonly submittedOn: GameDate;
  readonly responseDueOn: GameDate;
  readonly terms: ContractOfferTerms;
}

/** Objective facts captured when an offer is evaluated. */
export interface ContractDemandSnapshot {
  readonly evaluatedOn: GameDate;
  readonly age: number;
  readonly currentAbility: number;
  /** Public median development outcome used when these terms were derived. */
  readonly publicPotentialP50Ability: number;
  readonly role: PlayerRole;
  readonly expectedSquadStatus: AgreedSquadStatus;
  readonly currentAnnualWage: Money;
  readonly remainingContractDays: number;
  readonly clubReputation: number;
  readonly clubCategory: GameState["clubs"][ClubId]["category"];
  readonly freeAgentLeverageBasisPoints: number;
  readonly preferredTerms: ContractOfferTerms;
  readonly minimumTerms: ContractOfferTerms;
}

/** Stable facts explaining why the player accepted, rejected, or countered. */
export type ContractOfferEvaluationReason =
  | "meets_all_demands"
  | "annual_wage_below_demand"
  | "squad_status_below_expectation"
  | "duration_below_demand"
  | "duration_above_veteran_preference"
  | "signing_bonus_below_demand"
  | "appearance_bonus_below_demand"
  | "goal_bonus_below_demand"
  | "clean_sheet_bonus_below_demand"
  | "club_terms_unaffordable"
  | "current_contract_expired";

/** Deterministic evaluation attached to one player response. */
export interface ContractOfferEvaluation {
  readonly decision: "accepted" | "countered" | "rejected";
  readonly scoreBasisPoints: number;
  readonly reasons: readonly ContractOfferEvaluationReason[];
  readonly demand: ContractDemandSnapshot;
}

/** Player counteroffer that remains actionable until its explicit expiry. */
export interface PlayerContractCounterOffer {
  readonly issuedOn: GameDate;
  readonly expiresOn: GameDate;
  readonly terms: ContractOfferTerms;
  readonly evaluation: ContractOfferEvaluation;
}

interface ContractNegotiationBase {
  readonly id: ContractNegotiationId;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly currentContractId: PlayerContractId;
  readonly createdOn: GameDate;
}

/** Negotiation whose offer is still editable and has not reached the player. */
export interface DraftContractNegotiation extends ContractNegotiationBase {
  readonly status: "draft";
  readonly draft: ContractOfferDraft;
}

/** Negotiation waiting for its deterministic player-response date. */
export interface AwaitingContractNegotiation extends ContractNegotiationBase {
  readonly status: "awaiting_response";
  readonly submittedOffer: SubmittedContractOffer;
}

/** Negotiation waiting for the club to accept or reject the player's counter. */
export interface CounteredContractNegotiation extends ContractNegotiationBase {
  readonly status: "countered";
  readonly submittedOffer: SubmittedContractOffer;
  readonly counterOffer: PlayerContractCounterOffer;
}

/** Negotiation completed with one active replacement contract. */
export interface AcceptedContractNegotiation extends ContractNegotiationBase {
  readonly status: "accepted";
  readonly submittedOffer: SubmittedContractOffer;
  readonly acceptedOn: GameDate;
  readonly acceptedTerms: ContractOfferTerms;
  readonly acceptedSource: "submitted_offer" | "counter_offer";
  readonly evaluation: ContractOfferEvaluation;
  readonly activatedContractId: PlayerContractId;
}

/** Negotiation explicitly rejected by the player or club. */
export interface RejectedContractNegotiation extends ContractNegotiationBase {
  readonly status: "rejected";
  readonly submittedOffer: SubmittedContractOffer;
  readonly rejectedOn: GameDate;
  readonly rejectedBy: "player" | "club";
  readonly evaluation?: ContractOfferEvaluation;
}

/** Negotiation stopped by the offering club before completion. */
export interface WithdrawnContractNegotiation extends ContractNegotiationBase {
  readonly status: "withdrawn";
  readonly withdrawnOn: GameDate;
}

/** Negotiation whose current contract or counteroffer reached its deadline. */
export interface ExpiredContractNegotiation extends ContractNegotiationBase {
  readonly status: "expired";
  readonly expiredOn: GameDate;
  readonly reason: "counter_offer_expired" | "current_contract_expired";
}

/** Explicit manager instruction to let the current agreement expire naturally. */
export interface ReleaseAtExpiryContractNegotiation extends ContractNegotiationBase {
  readonly status: "release_at_expiry";
  readonly decidedOn: GameDate;
}

/** Complete durable state machine for one renewal discussion. */
export type ContractNegotiation =
  | DraftContractNegotiation
  | AwaitingContractNegotiation
  | CounteredContractNegotiation
  | AcceptedContractNegotiation
  | RejectedContractNegotiation
  | WithdrawnContractNegotiation
  | ExpiredContractNegotiation
  | ReleaseAtExpiryContractNegotiation;

/** Ordered durable collection of contract negotiations. */
export interface ContractNegotiationState {
  readonly negotiations: Readonly<Record<ContractNegotiationId, ContractNegotiation>>;
  readonly negotiationIds: readonly ContractNegotiationId[];
}

/** One append or replacement committed inside an atomic negotiation publication. */
export interface ContractNegotiationPublication {
  readonly negotiation: ContractNegotiation;
  readonly append?: boolean;
}

/** Machine-readable invariant failures for negotiation state. */
export type ContractNegotiationStateErrorCode =
  | "duplicate_negotiation_id"
  | "negotiation_not_found"
  | "negotiation_player_not_found"
  | "negotiation_club_not_found"
  | "negotiation_contract_not_found"
  | "negotiation_contract_mismatch"
  | "duplicate_open_negotiation"
  | "invalid_negotiation_dates"
  | "invalid_offer_terms"
  | "accepted_contract_not_found"
  | "accepted_contract_not_active"
  | "accepted_contract_mismatch";

/** Error thrown when durable contract-negotiation state is inconsistent. */
export class ContractNegotiationStateError extends Error {
  public readonly code: ContractNegotiationStateErrorCode;

  public constructor(code: ContractNegotiationStateErrorCode, message: string) {
    super(message);
    this.name = "ContractNegotiationStateError";
    this.code = code;
  }
}

// Negotiations are immutable career facts. Canonical copies can therefore be
// shared by later snapshots; current contract references and collection-wide
// uniqueness are still checked on every validation pass.
const validatedNegotiations = new WeakSet<ContractNegotiation>();
const validatedNegotiationRecords = new WeakSet<object>();
const validatedNegotiationOrders = new WeakSet<readonly unknown[]>();
const validatedNegotiationStates = new WeakMap<ContractNegotiationState, {
  readonly players: GameState["players"];
  readonly clubs: GameState["clubs"];
  readonly seniorSquadState: SeniorSquadState | undefined;
}>();

/** Returns an empty negotiation collection for new careers. */
export function createEmptyContractNegotiationState(): ContractNegotiationState {
  return { negotiations: {}, negotiationIds: [] };
}

/** Validates and copies the ordered durable negotiation collection. */
export function createContractNegotiationState(
  gameState: Pick<GameState, "players" | "clubs">,
  seniorSquadState: SeniorSquadState | undefined,
  input: ContractNegotiationState,
): ContractNegotiationState {
  const previousContext = validatedNegotiationStates.get(input);
  if (
    previousContext?.players === gameState.players
    && previousContext.clubs === gameState.clubs
    && previousContext.seniorSquadState === seniorSquadState
  ) return input;

  const reuseRecord = validatedNegotiationRecords.has(input.negotiations);
  const negotiations: Record<ContractNegotiationId, ContractNegotiation> = reuseRecord
    ? input.negotiations as Record<ContractNegotiationId, ContractNegotiation>
    : {};
  const seenIds = new Set<ContractNegotiationId>();
  const openPlayers = new Set<string>();
  const activeContractIds = new Set(seniorSquadState?.activeContractIds ?? []);

  for (const id of input.negotiationIds) {
    if (seenIds.has(id)) fail("duplicate_negotiation_id", `duplicate negotiation ID: ${id}`);
    const negotiation = input.negotiations[id];
    if (negotiation === undefined || negotiation.id !== id) {
      fail("negotiation_not_found", `negotiation not found: ${id}`);
    }
    if (gameState.players[negotiation.playerId] === undefined) {
      fail("negotiation_player_not_found", `negotiation player not found: ${negotiation.playerId}`);
    }
    if (gameState.clubs[negotiation.clubId] === undefined) {
      fail("negotiation_club_not_found", `negotiation club not found: ${negotiation.clubId}`);
    }
    if (seniorSquadState === undefined) {
      fail("negotiation_contract_not_found", `negotiation requires senior-squad state: ${id}`);
    }
    const currentContract = seniorSquadState.contracts[negotiation.currentContractId];
    if (currentContract === undefined) {
      fail("negotiation_contract_not_found", `negotiation contract not found: ${negotiation.currentContractId}`);
    }
    if (currentContract.playerId !== negotiation.playerId || currentContract.clubId !== negotiation.clubId) {
      fail("negotiation_contract_mismatch", `negotiation contract does not match player and club: ${id}`);
    }
    validateNegotiation(
      negotiation,
      seniorSquadState,
      activeContractIds,
      validatedNegotiations.has(negotiation),
    );

    if (isOpenContractNegotiation(negotiation)) {
      const openKey = `${negotiation.clubId}|${negotiation.playerId}`;
      if (openPlayers.has(openKey)) {
        fail("duplicate_open_negotiation", `player has multiple open negotiations with one club: ${negotiation.playerId}`);
      }
      openPlayers.add(openKey);
    }

    seenIds.add(id);
    if (!reuseRecord) {
      const canonical = validatedNegotiations.has(negotiation)
        ? negotiation
        : copyNegotiation(negotiation);
      validatedNegotiations.add(canonical);
      negotiations[id] = canonical;
    }
  }

  validatedNegotiationRecords.add(negotiations);
  const result: ContractNegotiationState = {
    negotiations,
    negotiationIds: validatedNegotiationOrder(input.negotiationIds),
  };
  validatedNegotiationStates.set(result, {
    players: gameState.players,
    clubs: gameState.clubs,
    seniorSquadState,
  });
  return result;
}

/**
 * Appends or replaces one negotiation in an already valid career aggregate.
 *
 * This command validates the changed row and collection-wide open-discussion
 * uniqueness while sharing every untouched immutable negotiation. It avoids
 * rescanning historic completed talks for each delayed lifecycle transition.
 */
export function publishContractNegotiation(
  gameState: Pick<GameState, "players" | "clubs">,
  seniorSquadState: SeniorSquadState | undefined,
  state: ContractNegotiationState,
  negotiation: ContractNegotiation,
  append = false,
): ContractNegotiationState {
  return publishContractNegotiations(
    gameState,
    seniorSquadState,
    state,
    [{ negotiation, append }],
  );
}

/**
 * Appends or replaces several negotiations through one immutable publication.
 *
 * Calendar automation can start many independent club discussions on one day.
 * Validating the base aggregate, cloning its record, and indexing open talks
 * once keeps that operation proportional to the batch instead of repeatedly
 * copying the complete negotiation history. Any invalid row rejects the whole
 * publication and leaves the input snapshot untouched.
 */
export function publishContractNegotiations(
  gameState: Pick<GameState, "players" | "clubs">,
  seniorSquadState: SeniorSquadState | undefined,
  state: ContractNegotiationState,
  publications: readonly ContractNegotiationPublication[],
): ContractNegotiationState {
  const current = createContractNegotiationState(gameState, seniorSquadState, state);
  if (publications.length === 0) return current;
  if (seniorSquadState === undefined) {
    fail("negotiation_contract_not_found", "negotiation publication requires senior-squad state");
  }

  const negotiations: Record<ContractNegotiationId, ContractNegotiation> = {
    ...current.negotiations,
  };
  const appendedIds: ContractNegotiationId[] = [];
  const publicationIds = new Set<ContractNegotiationId>();
  const activeContractIds = new Set(seniorSquadState.activeContractIds);
  const openKeys = new Set<string>();
  for (const id of current.negotiationIds) {
    const negotiation = current.negotiations[id];
    if (negotiation !== undefined && isOpenContractNegotiation(negotiation)) {
      openKeys.add(contractNegotiationOpenKey(negotiation));
    }
  }

  for (const publication of publications) {
    const negotiation = publication.negotiation;
    const append = publication.append ?? false;
    if (publicationIds.has(negotiation.id)) {
      fail("duplicate_negotiation_id", `negotiation published more than once: ${negotiation.id}`);
    }
    publicationIds.add(negotiation.id);

    const existing = negotiations[negotiation.id];
    if (append && existing !== undefined) {
      fail("duplicate_negotiation_id", `duplicate negotiation ID: ${negotiation.id}`);
    }
    if (!append && existing === undefined) {
      fail("negotiation_not_found", `negotiation not found: ${negotiation.id}`);
    }
    if (gameState.players[negotiation.playerId] === undefined) {
      fail("negotiation_player_not_found", `negotiation player not found: ${negotiation.playerId}`);
    }
    if (gameState.clubs[negotiation.clubId] === undefined) {
      fail("negotiation_club_not_found", `negotiation club not found: ${negotiation.clubId}`);
    }
    const currentContract = seniorSquadState.contracts[negotiation.currentContractId];
    if (currentContract === undefined) {
      fail("negotiation_contract_not_found", `negotiation contract not found: ${negotiation.currentContractId}`);
    }
    if (currentContract.playerId !== negotiation.playerId || currentContract.clubId !== negotiation.clubId) {
      fail("negotiation_contract_mismatch", `negotiation contract does not match player and club: ${negotiation.id}`);
    }
    validateNegotiation(
      negotiation,
      seniorSquadState,
      activeContractIds,
      validatedNegotiations.has(negotiation),
    );

    if (existing !== undefined && isOpenContractNegotiation(existing)) {
      openKeys.delete(contractNegotiationOpenKey(existing));
    }
    if (isOpenContractNegotiation(negotiation)) {
      const openKey = contractNegotiationOpenKey(negotiation);
      if (openKeys.has(openKey)) {
        fail("duplicate_open_negotiation", `player has multiple open negotiations with one club: ${negotiation.playerId}`);
      }
      openKeys.add(openKey);
    }

    const canonical = validatedNegotiations.has(negotiation)
      ? negotiation
      : copyNegotiation(negotiation);
    validatedNegotiations.add(canonical);
    negotiations[canonical.id] = canonical;
    if (append) appendedIds.push(canonical.id);
  }

  const negotiationIds = appendedIds.length === 0
    ? current.negotiationIds
    : [...current.negotiationIds, ...appendedIds];
  validatedNegotiationRecords.add(negotiations);
  if (appendedIds.length > 0) validatedNegotiationOrders.add(negotiationIds);

  const result: ContractNegotiationState = { negotiations, negotiationIds };
  validatedNegotiationStates.set(result, {
    players: gameState.players,
    clubs: gameState.clubs,
    seniorSquadState,
  });
  return result;
}

function contractNegotiationOpenKey(
  negotiation: Pick<ContractNegotiation, "clubId" | "playerId">,
): string {
  return `${negotiation.clubId}|${negotiation.playerId}`;
}

/** Returns whether a negotiation can still receive a manager or player action. */
export function isOpenContractNegotiation(negotiation: ContractNegotiation): boolean {
  return negotiation.status === "draft"
    || negotiation.status === "awaiting_response"
    || negotiation.status === "countered";
}

function validateNegotiation(
  negotiation: ContractNegotiation,
  seniorSquadState: SeniorSquadState,
  activeContractIds: ReadonlySet<PlayerContractId>,
  intrinsicFactsAlreadyValidated: boolean,
): void {
  if (!intrinsicFactsAlreadyValidated) {
    if (negotiation.status === "draft") {
      if (negotiation.draft.createdOn < negotiation.createdOn) invalidDates(negotiation.id);
      validateOfferTerms(negotiation.draft.terms, negotiation.id);
      return;
    }
    if (negotiation.status === "withdrawn" || negotiation.status === "release_at_expiry") {
      const decidedOn = negotiation.status === "withdrawn" ? negotiation.withdrawnOn : negotiation.decidedOn;
      if (decidedOn < negotiation.createdOn) invalidDates(negotiation.id);
      return;
    }
    if (negotiation.status === "expired") {
      if (negotiation.expiredOn < negotiation.createdOn) invalidDates(negotiation.id);
      return;
    }

    validateSubmittedOffer(negotiation.submittedOffer, negotiation);
    if (negotiation.status === "awaiting_response" || negotiation.status === "rejected") {
      if (negotiation.status === "rejected" && negotiation.rejectedOn < negotiation.submittedOffer.responseDueOn) {
        invalidDates(negotiation.id);
      }
      return;
    }
    if (negotiation.status === "countered") {
      if (
        negotiation.counterOffer.issuedOn < negotiation.submittedOffer.responseDueOn
        || negotiation.counterOffer.expiresOn <= negotiation.counterOffer.issuedOn
      ) invalidDates(negotiation.id);
      validateOfferTerms(negotiation.counterOffer.terms, negotiation.id);
      return;
    }

    if (negotiation.acceptedOn < negotiation.submittedOffer.responseDueOn) invalidDates(negotiation.id);
    validateOfferTerms(negotiation.acceptedTerms, negotiation.id);
  } else if (negotiation.status !== "accepted") {
    return;
  }

  const activated = seniorSquadState.contracts[negotiation.activatedContractId];
  if (activated === undefined) fail("accepted_contract_not_found", `accepted contract not found: ${negotiation.activatedContractId}`);
  if (!activeContractIds.has(negotiation.activatedContractId)) {
    fail("accepted_contract_not_active", `accepted contract is not active: ${negotiation.activatedContractId}`);
  }
  if (activated.playerId !== negotiation.playerId || activated.clubId !== negotiation.clubId) {
    fail("accepted_contract_mismatch", `accepted contract does not match negotiation: ${negotiation.id}`);
  }
}

function validatedNegotiationOrder<T>(input: readonly T[]): readonly T[] {
  if (validatedNegotiationOrders.has(input)) return input;
  const result = [...input];
  validatedNegotiationOrders.add(result);
  return result;
}

function validateSubmittedOffer(offer: SubmittedContractOffer, negotiation: ContractNegotiationBase): void {
  if (offer.submittedOn < negotiation.createdOn || offer.responseDueOn <= offer.submittedOn) {
    invalidDates(negotiation.id);
  }
  validateOfferTerms(offer.terms, negotiation.id);
}

function validateOfferTerms(terms: ContractOfferTerms, id: ContractNegotiationId): void {
  try {
    assertValidContractOfferTerms(terms);
  } catch {
    fail("invalid_offer_terms", `invalid contract offer terms: ${id}`);
  }
}

function copyTerms(terms: ContractOfferTerms): ContractOfferTerms {
  return { ...terms, bonuses: { ...terms.bonuses } };
}

function copyNegotiation(negotiation: ContractNegotiation): ContractNegotiation {
  switch (negotiation.status) {
    case "draft": return { ...negotiation, draft: { ...negotiation.draft, terms: copyTerms(negotiation.draft.terms) } };
    case "awaiting_response": return { ...negotiation, submittedOffer: { ...negotiation.submittedOffer, terms: copyTerms(negotiation.submittedOffer.terms) } };
    case "countered": return {
      ...negotiation,
      submittedOffer: { ...negotiation.submittedOffer, terms: copyTerms(negotiation.submittedOffer.terms) },
      counterOffer: {
        ...negotiation.counterOffer,
        terms: copyTerms(negotiation.counterOffer.terms),
        evaluation: copyEvaluation(negotiation.counterOffer.evaluation),
      },
    };
    case "accepted": return {
      ...negotiation,
      submittedOffer: { ...negotiation.submittedOffer, terms: copyTerms(negotiation.submittedOffer.terms) },
      acceptedTerms: copyTerms(negotiation.acceptedTerms),
      evaluation: copyEvaluation(negotiation.evaluation),
    };
    case "rejected": return {
      ...negotiation,
      submittedOffer: { ...negotiation.submittedOffer, terms: copyTerms(negotiation.submittedOffer.terms) },
      ...(negotiation.evaluation === undefined ? {} : { evaluation: copyEvaluation(negotiation.evaluation) }),
    };
    case "withdrawn":
    case "release_at_expiry":
    case "expired": return { ...negotiation };
  }
}

function copyEvaluation(evaluation: ContractOfferEvaluation): ContractOfferEvaluation {
  return {
    ...evaluation,
    reasons: [...evaluation.reasons],
    demand: {
      ...evaluation.demand,
      preferredTerms: copyTerms(evaluation.demand.preferredTerms),
      minimumTerms: copyTerms(evaluation.demand.minimumTerms),
    },
  };
}

function invalidDates(id: ContractNegotiationId): never {
  fail("invalid_negotiation_dates", `invalid negotiation dates: ${id}`);
}

function fail(code: ContractNegotiationStateErrorCode, message: string): never {
  throw new ContractNegotiationStateError(code, message);
}
