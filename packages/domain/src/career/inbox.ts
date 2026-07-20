import { brand, type Brand } from "../types/brand.ts";
import type { ClubId, FixtureId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { CareerAttentionBlockerKey, CareerAttentionLevel } from "./attention.ts";

/** Stable identifier for one durable career Posta message. */
export type CareerInboxMessageId = Brand<string, "CareerInboxMessageId">;

/** Current message categories backed by complete production workflows. */
export type CareerInboxCategory = "matchday" | "match_result" | "season_rollover" | "injury_diagnosis" | "suspension";

/** Functional sender used by presentation without inventing a staff identity. */
export type CareerInboxSource = "technical_staff" | "match_report" | "competition_office" | "medical_team";

/** Stable manager destinations exposed by current Posta messages. */
export type CareerInboxActionId = "prepare_match" | "open_matchday";

/** Independent durable lifecycle facts for one message. */
export interface CareerInboxMessageLifecycle {
  readonly read: boolean;
  readonly acknowledged: boolean;
  readonly resolved: boolean;
}

/** Related domain entities used to rebuild football-specific details. */
export interface CareerInboxRelatedEntities {
  readonly fixtureId?: FixtureId;
  readonly clubId?: ClubId;
  readonly playerId?: PlayerId;
}

/** Input accepted by the durable message constructor. */
export interface CareerInboxMessageInput {
  readonly id: CareerInboxMessageId;
  readonly date: GameDate;
  readonly category: CareerInboxCategory;
  readonly source: CareerInboxSource;
  readonly level: CareerAttentionLevel;
  readonly lifecycle: CareerInboxMessageLifecycle;
  readonly related?: CareerInboxRelatedEntities;
  readonly blockerKeys?: readonly CareerAttentionBlockerKey[];
  readonly actionIds?: readonly CareerInboxActionId[];
}

/** Durable, language-agnostic Posta message facts. */
export interface CareerInboxMessage {
  readonly id: CareerInboxMessageId;
  readonly date: GameDate;
  readonly category: CareerInboxCategory;
  readonly source: CareerInboxSource;
  readonly level: CareerAttentionLevel;
  readonly lifecycle: CareerInboxMessageLifecycle;
  readonly related: CareerInboxRelatedEntities;
  readonly blockerKeys: readonly CareerAttentionBlockerKey[];
  readonly actionIds: readonly CareerInboxActionId[];
}

const INTEGER_LIKE_ID = /^(0|[1-9][0-9]*)$/;

/** Builds a validated ID in the `inbox:` namespace. */
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

/** Creates a validated message and rejects impossible lifecycle combinations. */
export function createCareerInboxMessage(input: CareerInboxMessageInput): CareerInboxMessage {
  if (input.lifecycle.acknowledged && !input.lifecycle.read) {
    throw new Error("Acknowledged inbox messages must also be read");
  }

  if (input.level !== "important" && input.lifecycle.acknowledged) {
    throw new Error("Only important inbox messages can be acknowledged");
  }

  if (!input.lifecycle.resolved && input.level === "blocking" && (input.actionIds?.length ?? 0) === 0) {
    throw new Error("Unresolved blocking inbox messages must expose an action");
  }

  if (
    (input.category === "matchday" || input.category === "match_result" || input.category === "injury_diagnosis" || input.category === "suspension")
    && input.related?.fixtureId === undefined
  ) {
    throw new Error(`${input.category} inbox messages must reference a fixture`);
  }

  if (input.category === "season_rollover" && input.related?.clubId === undefined) {
    throw new Error("Season rollover inbox messages must reference the selected club");
  }

  if ((input.category === "injury_diagnosis" || input.category === "suspension") && input.related?.playerId === undefined) {
    throw new Error(`${input.category} inbox messages must reference a player`);
  }

  const expectedSource: CareerInboxSource = input.category === "matchday"
    ? "technical_staff"
    : input.category === "match_result"
      ? "match_report"
      : input.category === "injury_diagnosis"
        ? "medical_team"
        : "competition_office";
  if (input.source !== expectedSource) {
    throw new Error(`${input.category} inbox messages must use source ${expectedSource}`);
  }

  return {
    id: input.id,
    date: input.date,
    category: input.category,
    source: input.source,
    level: input.level,
    lifecycle: { ...input.lifecycle },
    related: input.related ?? {},
    blockerKeys: [...new Set(input.blockerKeys ?? [])],
    actionIds: [...new Set(input.actionIds ?? [])],
  };
}

/** Returns whether this lifecycle state must stop career advancement. */
export function doesCareerInboxMessageStopContinue(message: CareerInboxMessage): boolean {
  if (message.level === "blocking") {
    return !message.lifecycle.resolved;
  }

  return message.level === "important" && !message.lifecycle.acknowledged;
}
