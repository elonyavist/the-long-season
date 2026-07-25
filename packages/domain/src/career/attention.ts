import { brand, type Brand } from "../types/brand.ts";
import type { ClubId, FixtureId, PlayerContractId, PlayerId } from "../types/ids.ts";
import type { ContractNegotiationId } from "./contract-negotiation.ts";
import type { PreliminaryAgreementId } from "./preliminary-agreement.ts";
import type { TransferNegotiationId } from "./transfer-negotiation.ts";
import type { GameDate } from "../value-objects/game-date.ts";

/** Stable identifier for one career attention event. */
export type CareerAttentionEventId = Brand<string, "CareerAttentionEventId">;

/** Product-level effect that one attention fact has on career advancement. */
export type CareerAttentionLevel = "blocking" | "important" | "informational";

/** Current attention categories backed by real career workflows. */
export type CareerAttentionCategory = "matchday" | "contract" | "market";

/** Machine-readable reason why the manager receives attention. */
export type CareerAttentionReason =
  | "matchday_decision"
  | "contract_reminder"
  | "contract_counteroffer"
  | "contract_accepted"
  | "contract_rejected"
  | "contract_expiry_decision"
  | "market_club_accepted"
  | "market_club_counteroffer"
  | "market_club_rejected"
  | "market_player_counteroffer"
  | "market_player_rejected"
  | "market_offer_expired"
  | "market_transfer_completed"
  | "market_agreement_failed"
  | "market_offer_withdrawn"
  | "market_preliminary_agreed"
  | "market_preliminary_activated";

/** Explicit advancement effect, independent from visual message importance. */
export type CareerAttentionContinuePolicy = "never" | "until_acknowledged" | "until_resolved";

/** Structured preparation facts that prevent entry into a fixture. */
export type CareerAttentionBlockerKey =
  | "missing_saved_lineup"
  | "missing_bench_slot"
  | "missing_bench_goalkeeper"
  | "missing_saved_tactic";

/** Related domain entities that contextualize an attention event. */
export interface CareerAttentionRelatedEntities {
  readonly fixtureId?: FixtureId;
  readonly clubId?: ClubId;
  readonly playerId?: PlayerId;
  readonly contractId?: PlayerContractId;
  readonly contractNegotiationId?: ContractNegotiationId;
  readonly transferNegotiationId?: TransferNegotiationId;
  readonly preliminaryAgreementId?: PreliminaryAgreementId;
}

/** Input accepted by the language-agnostic attention constructor. */
export interface CareerAttentionEventInput {
  readonly id: CareerAttentionEventId;
  readonly date: GameDate;
  readonly category: CareerAttentionCategory;
  readonly level: CareerAttentionLevel;
  readonly reason: CareerAttentionReason;
  readonly continuePolicy?: CareerAttentionContinuePolicy;
  readonly related?: CareerAttentionRelatedEntities;
  readonly blockerKeys?: readonly CareerAttentionBlockerKey[];
}

/** Ephemeral structured fact evaluated by the deterministic Continue use case. */
export interface CareerAttentionEvent {
  readonly id: CareerAttentionEventId;
  readonly date: GameDate;
  readonly category: CareerAttentionCategory;
  readonly level: CareerAttentionLevel;
  readonly reason: CareerAttentionReason;
  readonly continuePolicy: CareerAttentionContinuePolicy;
  readonly related: CareerAttentionRelatedEntities;
  readonly blockerKeys: readonly CareerAttentionBlockerKey[];
}

const INTEGER_LIKE_ID = /^(0|[1-9][0-9]*)$/;

/** Builds a validated ID in the `attention:` namespace. */
export function careerAttentionEventId(value: string): CareerAttentionEventId {
  if (value.length === 0) {
    throw new Error("Career attention event ID must not be empty");
  }

  if (INTEGER_LIKE_ID.test(value)) {
    throw new Error(`Career attention event ID must not be integer-like: ${value}`);
  }

  if (!value.startsWith("attention:")) {
    throw new Error(`Career attention event ID must start with "attention:": ${value}`);
  }

  if (value.length === "attention:".length) {
    throw new Error('Career attention event ID must include a value after "attention:"');
  }

  return brand<string, "CareerAttentionEventId">(value);
}

/** Creates a validated attention fact without rendered prose. */
export function createCareerAttentionEvent(input: CareerAttentionEventInput): CareerAttentionEvent {
  if (input.category === "matchday" && input.related?.fixtureId === undefined) {
    throw new Error("Matchday attention must reference a fixture");
  }

  if (
    input.category === "contract"
    && input.related?.contractId === undefined
    && input.related?.contractNegotiationId === undefined
  ) {
    throw new Error("Contract attention must reference a contract or negotiation");
  }

  if (
    input.category === "market"
    && input.related?.transferNegotiationId === undefined
    && input.related?.preliminaryAgreementId === undefined
  ) {
    throw new Error("Market attention must reference a transfer negotiation or preliminary agreement");
  }

  return {
    id: input.id,
    date: input.date,
    category: input.category,
    level: input.level,
    reason: input.reason,
    continuePolicy:
      input.continuePolicy
      ?? (input.level === "blocking"
        ? "until_resolved"
        : input.level === "important"
          ? "until_acknowledged"
          : "never"),
    related: input.related ?? {},
    blockerKeys: [...new Set(input.blockerKeys ?? [])],
  };
}

/**
 * Creates the single blocking attention fact for a selected-club fixture.
 *
 * Readiness changes only `blockerKeys`; identity and category remain stable.
 */
export function createMatchdayAttentionEvent(input: {
  readonly fixtureId: FixtureId;
  readonly clubId: ClubId;
  readonly date: GameDate;
  readonly blockerKeys?: readonly CareerAttentionBlockerKey[];
}): CareerAttentionEvent {
  return createCareerAttentionEvent({
    id: careerAttentionEventId(`attention:matchday:${input.fixtureId}`),
    date: input.date,
    category: "matchday",
    level: "blocking",
    reason: "matchday_decision",
    related: {
      fixtureId: input.fixtureId,
      clubId: input.clubId,
    },
    ...(input.blockerKeys === undefined ? {} : { blockerKeys: input.blockerKeys }),
  });
}

/** Creates one stable contract attention identity from authoritative entities. */
export function createContractAttentionEvent(input: {
  readonly contractId: PlayerContractId;
  readonly contractNegotiationId?: ContractNegotiationId;
  readonly clubId: ClubId;
  readonly playerId: PlayerId;
  readonly date: GameDate;
  readonly level: CareerAttentionLevel;
  readonly reason: Exclude<CareerAttentionReason, "matchday_decision" | `market_${string}`>;
  readonly continuePolicy: CareerAttentionContinuePolicy;
}): CareerAttentionEvent {
  const identity = input.contractNegotiationId ?? input.contractId;
  return createCareerAttentionEvent({
    id: careerAttentionEventId(`attention:contract:${input.reason}:${identity}`),
    date: input.date,
    category: "contract",
    level: input.level,
    reason: input.reason,
    continuePolicy: input.continuePolicy,
    related: {
      contractId: input.contractId,
      ...(input.contractNegotiationId === undefined
        ? {}
        : { contractNegotiationId: input.contractNegotiationId }),
      clubId: input.clubId,
      playerId: input.playerId,
    },
  });
}

/** Creates one stable market attention identity from authoritative entities. */
export function createMarketAttentionEvent(input: {
  readonly transferNegotiationId?: TransferNegotiationId;
  readonly preliminaryAgreementId?: PreliminaryAgreementId;
  readonly clubId: ClubId;
  readonly playerId: PlayerId;
  readonly date: GameDate;
  readonly level: CareerAttentionLevel;
  readonly reason: Extract<CareerAttentionReason, `market_${string}`>;
  readonly continuePolicy: CareerAttentionContinuePolicy;
}): CareerAttentionEvent {
  const identity = input.transferNegotiationId ?? input.preliminaryAgreementId;
  if (identity === undefined) {
    throw new Error("Market attention event must specify a transfer negotiation or preliminary agreement ID");
  }
  return createCareerAttentionEvent({
    id: careerAttentionEventId(`attention:market:${input.reason}:${identity}`),
    date: input.date,
    category: "market",
    level: input.level,
    reason: input.reason,
    continuePolicy: input.continuePolicy,
    related: {
      ...(input.transferNegotiationId === undefined ? {} : { transferNegotiationId: input.transferNegotiationId }),
      ...(input.preliminaryAgreementId === undefined ? {} : { preliminaryAgreementId: input.preliminaryAgreementId }),
      clubId: input.clubId,
      playerId: input.playerId,
    },
  });
}

/** Sorts attention facts by date, level, and stable ID. */
export function compareCareerAttentionEvents(left: CareerAttentionEvent, right: CareerAttentionEvent): number {
  if (left.date !== right.date) {
    return left.date - right.date;
  }

  const levelDifference = attentionLevelRank(left.level) - attentionLevelRank(right.level);
  return levelDifference !== 0 ? levelDifference : String(left.id).localeCompare(String(right.id));
}

/** Returns whether a newly produced attention fact requires a Continue stop. */
export function isUnresolvedCareerAttentionEvent(event: CareerAttentionEvent): boolean {
  return event.continuePolicy !== "never";
}

function attentionLevelRank(level: CareerAttentionLevel): number {
  return { blocking: 0, important: 1, informational: 2 }[level];
}
