import { brand, type Brand } from "../types/brand.ts";
import type { ClubId, FixtureId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { CareerInboxPriority } from "./inbox.ts";

/** Stable identifier for one career attention event. */
export type CareerAttentionEventId = Brand<string, "CareerAttentionEventId">;

/** Current attention categories implemented by the continue foundation. */
export type CareerAttentionCategory = "match_preparation_required" | "matchday_reached";

/** Machine-readable reason why `Continue` stopped. */
export type CareerAttentionReason = "missing_match_preparation" | "ready_for_matchday";

/** Structured blocker keys that explain unresolved manager work. */
export type CareerAttentionBlockerKey = "missing_saved_lineup" | "missing_saved_tactic";

/** Related domain entities that contextualize an attention event. */
export interface CareerAttentionRelatedEntities {
  /** Fixture that caused the attention event. */
  readonly fixtureId?: FixtureId;
  /** Club controlled by the manager for this event. */
  readonly clubId?: ClubId;
  /** Player related to the event when future systems need it. */
  readonly playerId?: PlayerId;
}

/** Input accepted by the career attention event constructor. */
export interface CareerAttentionEventInput {
  /** Stable namespaced attention event ID. */
  readonly id: CareerAttentionEventId;
  /** In-world date where career advancement stops. */
  readonly date: GameDate;
  /** Structured category for the stop. */
  readonly category: CareerAttentionCategory;
  /** Priority used by callers that convert events into Inbox messages. */
  readonly priority: CareerInboxPriority;
  /** Whether the manager must act before continuation can proceed. */
  readonly actionRequired: boolean;
  /** Machine-readable reason key. */
  readonly reason: CareerAttentionReason;
  /** Optional related entities for adapters and future persistence. */
  readonly related?: CareerAttentionRelatedEntities;
  /** Structured blockers, for example missing saved lineup or tactic. */
  readonly blockerKeys?: readonly CareerAttentionBlockerKey[];
}

/** Language-agnostic career event that can stop calendar continuation. */
export interface CareerAttentionEvent {
  /** Stable namespaced attention event ID. */
  readonly id: CareerAttentionEventId;
  /** In-world date where career advancement stops. */
  readonly date: GameDate;
  /** Structured category for the stop. */
  readonly category: CareerAttentionCategory;
  /** Priority used by callers that convert events into Inbox messages. */
  readonly priority: CareerInboxPriority;
  /** Whether the manager must act before continuation can proceed. */
  readonly actionRequired: boolean;
  /** Machine-readable reason key. */
  readonly reason: CareerAttentionReason;
  /** Optional related entities for adapters and future persistence. */
  readonly related: CareerAttentionRelatedEntities;
  /** Structured blockers, for example missing saved lineup or tactic. */
  readonly blockerKeys: readonly CareerAttentionBlockerKey[];
}

const INTEGER_LIKE_ID = /^(0|[1-9][0-9]*)$/;

/**
 * Builds a stable career attention event ID.
 *
 * Attention IDs use the `attention:` namespace so callers can persist or
 * cross-reference stop events without colliding with Inbox messages.
 */
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

/** Creates a validated language-agnostic attention event. */
export function createCareerAttentionEvent(input: CareerAttentionEventInput): CareerAttentionEvent {
  if (input.actionRequired && (input.blockerKeys?.length ?? 0) === 0 && input.category === "match_preparation_required") {
    throw new Error("Match-preparation attention events must include blocker keys");
  }

  return {
    id: input.id,
    date: input.date,
    category: input.category,
    priority: input.priority,
    actionRequired: input.actionRequired,
    reason: input.reason,
    related: input.related ?? {},
    blockerKeys: input.blockerKeys ?? [],
  };
}

/** Creates the attention event used when a manager must prepare a fixture. */
export function createMatchPreparationRequiredEvent(input: {
  readonly fixtureId: FixtureId;
  readonly clubId: ClubId;
  readonly date: GameDate;
  readonly blockerKeys: readonly CareerAttentionBlockerKey[];
}): CareerAttentionEvent {
  return createCareerAttentionEvent({
    id: careerAttentionEventId(`attention:${input.fixtureId}:preparation`),
    date: input.date,
    category: "match_preparation_required",
    priority: "urgent",
    actionRequired: true,
    reason: "missing_match_preparation",
    related: {
      fixtureId: input.fixtureId,
      clubId: input.clubId,
    },
    blockerKeys: input.blockerKeys,
  });
}

/** Creates the attention event used when the prepared fixture reaches matchday. */
export function createMatchdayReachedEvent(input: {
  readonly fixtureId: FixtureId;
  readonly clubId: ClubId;
  readonly date: GameDate;
}): CareerAttentionEvent {
  return createCareerAttentionEvent({
    id: careerAttentionEventId(`attention:${input.fixtureId}:matchday`),
    date: input.date,
    category: "matchday_reached",
    priority: "important",
    actionRequired: true,
    reason: "ready_for_matchday",
    related: {
      fixtureId: input.fixtureId,
      clubId: input.clubId,
    },
  });
}

/** Sorts attention events by date and stable ID for deterministic processing. */
export function compareCareerAttentionEvents(left: CareerAttentionEvent, right: CareerAttentionEvent): number {
  if (left.date !== right.date) {
    return left.date - right.date;
  }

  return String(left.id).localeCompare(String(right.id));
}

/** Returns true when an attention event still blocks career continuation. */
export function isUnresolvedCareerAttentionEvent(event: CareerAttentionEvent): boolean {
  return event.actionRequired;
}
