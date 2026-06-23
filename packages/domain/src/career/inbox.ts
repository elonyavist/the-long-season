import { brand, type Brand } from "../types/brand.ts";
import type { ClubId, FixtureId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";

/** Stable identifier for one durable career Inbox / Posta message. */
export type CareerInboxMessageId = Brand<string, "CareerInboxMessageId">;

/** Priority controls Inbox ordering and visual emphasis without rendering text. */
export type CareerInboxPriority = "routine" | "important" | "urgent";

/** Read/resolution state for one career Inbox / Posta message. */
export type CareerInboxMessageStatus = "unread" | "read" | "resolved" | "expired";

/** Current career message categories implemented by the continue foundation. */
export type CareerInboxCategory = "match_preparation_required" | "matchday_reached";

/** Stable manager action exposed by an Inbox / Posta message. */
export type CareerInboxActionId = "prepare_match" | "open_matchday";

/** Related domain entities that can help adapters build useful labels. */
export interface CareerInboxRelatedEntities {
  /** Fixture that caused or contextualizes the message. */
  readonly fixtureId?: FixtureId;
  /** Club that owns the manager-facing decision. */
  readonly clubId?: ClubId;
  /** Player related to the message when future systems need it. */
  readonly playerId?: PlayerId;
}

/** Input accepted by the Inbox message constructor. */
export interface CareerInboxMessageInput {
  /** Stable namespaced message ID. */
  readonly id: CareerInboxMessageId;
  /** In-world date when the message becomes visible. */
  readonly date: GameDate;
  /** Structured message category. */
  readonly category: CareerInboxCategory;
  /** Message priority used for sorting and visual emphasis. */
  readonly priority: CareerInboxPriority;
  /** Message lifecycle status. */
  readonly status: CareerInboxMessageStatus;
  /** Localization key for the visible title. */
  readonly titleKey: string;
  /** Localization key for the visible body or compact summary. */
  readonly summaryKey: string;
  /** Whether the manager must act before career advancement can continue. */
  readonly actionRequired: boolean;
  /** Optional related entities for adapters and future persistence. */
  readonly related?: CareerInboxRelatedEntities;
  /** Stable action IDs available from this message. */
  readonly actionIds?: readonly CareerInboxActionId[];
}

/** Durable language-agnostic message shown in the career Inbox / Posta. */
export interface CareerInboxMessage {
  /** Stable namespaced message ID. */
  readonly id: CareerInboxMessageId;
  /** In-world date when the message becomes visible. */
  readonly date: GameDate;
  /** Structured message category. */
  readonly category: CareerInboxCategory;
  /** Message priority used for sorting and visual emphasis. */
  readonly priority: CareerInboxPriority;
  /** Message lifecycle status. */
  readonly status: CareerInboxMessageStatus;
  /** Localization key for the visible title. */
  readonly titleKey: string;
  /** Localization key for the visible body or compact summary. */
  readonly summaryKey: string;
  /** Whether the manager must act before career advancement can continue. */
  readonly actionRequired: boolean;
  /** Optional related entities for adapters and future persistence. */
  readonly related: CareerInboxRelatedEntities;
  /** Stable action IDs available from this message. */
  readonly actionIds: readonly CareerInboxActionId[];
}

const INTEGER_LIKE_ID = /^(0|[1-9][0-9]*)$/;

/**
 * Builds a stable career Inbox / Posta message ID.
 *
 * Message IDs follow the project-wide `type:value` convention and use the
 * `inbox:` namespace so they can be persisted later without colliding with
 * fixtures, players, or saves.
 */
export function careerInboxMessageId(value: string): CareerInboxMessageId {
  if (value.length === 0) {
    throw new Error("Career inbox message ID must not be empty");
  }

  if (INTEGER_LIKE_ID.test(value)) {
    throw new Error(`Career inbox message ID must not be integer-like: ${value}`);
  }

  if (!value.startsWith("inbox:")) {
    throw new Error(`Career inbox message ID must start with "inbox:": ${value}`);
  }

  if (value.length === "inbox:".length) {
    throw new Error('Career inbox message ID must include a value after "inbox:"');
  }

  return brand<string, "CareerInboxMessageId">(value);
}

/**
 * Creates a validated language-agnostic Inbox / Posta message.
 *
 * The constructor deliberately accepts localization keys, not rendered prose.
 * Presentation adapters decide how those keys become visible text.
 */
export function createCareerInboxMessage(input: CareerInboxMessageInput): CareerInboxMessage {
  if (input.titleKey.trim().length === 0) {
    throw new Error("Career inbox message titleKey must not be empty");
  }

  if (input.summaryKey.trim().length === 0) {
    throw new Error("Career inbox message summaryKey must not be empty");
  }

  if (input.actionRequired && (input.actionIds?.length ?? 0) === 0) {
    throw new Error("Action-required inbox messages must expose at least one action");
  }

  return {
    id: input.id,
    date: input.date,
    category: input.category,
    priority: input.priority,
    status: input.status,
    titleKey: input.titleKey,
    summaryKey: input.summaryKey,
    actionRequired: input.actionRequired,
    related: input.related ?? {},
    actionIds: input.actionIds ?? [],
  };
}

/** Returns true when a message still blocks career continuation. */
export function isActionRequiredInboxMessage(message: CareerInboxMessage): boolean {
  return message.actionRequired && message.status !== "resolved" && message.status !== "expired";
}
