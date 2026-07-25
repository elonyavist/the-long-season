import { brand, type Brand } from "../types/brand.ts";
import type { ClubId, FixtureId, PlayerContractId, PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type {
  CareerAttentionBlockerKey,
  CareerAttentionContinuePolicy,
  CareerAttentionLevel,
} from "./attention.ts";
import type { ContractNegotiationId } from "./contract-negotiation.ts";
import type { PreliminaryAgreementId } from "./preliminary-agreement.ts";
import type { TransferNegotiationId } from "./transfer-negotiation.ts";

/** Stable identifier for one durable career Posta message. */
export type CareerInboxMessageId = Brand<string, "CareerInboxMessageId">;

/** Current message categories backed by complete production workflows. */
export type CareerInboxCategory =
  | "matchday"
  | "match_result"
  | "season_rollover"
  | "injury_diagnosis"
  | "suspension"
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

/** Functional sender used by presentation without inventing a staff identity. */
export type CareerInboxSource =
  | "technical_staff"
  | "match_report"
  | "competition_office"
  | "medical_team"
  | "contract_office"
  | "transfer_office";

/** Stable manager destinations exposed by current Posta messages. */
export type CareerInboxActionId =
  | "prepare_match"
  | "open_matchday"
  | "open_contract_negotiation"
  | "release_player_at_expiry"
  | "open_market_negotiation";

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
  readonly contractId?: PlayerContractId;
  readonly contractNegotiationId?: ContractNegotiationId;
  readonly transferNegotiationId?: TransferNegotiationId;
  readonly preliminaryAgreementId?: PreliminaryAgreementId;
}

/** Input accepted by the durable message constructor. */
export interface CareerInboxMessageInput {
  readonly id: CareerInboxMessageId;
  readonly date: GameDate;
  readonly category: CareerInboxCategory;
  readonly source: CareerInboxSource;
  readonly level: CareerAttentionLevel;
  readonly continuePolicy?: CareerAttentionContinuePolicy;
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
  readonly continuePolicy: CareerAttentionContinuePolicy;
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
    input.category.startsWith("contract_")
    && input.related?.contractId === undefined
    && input.related?.contractNegotiationId === undefined
  ) {
    throw new Error(`${input.category} inbox messages must reference a contract or negotiation`);
  }

  if (
    input.category.startsWith("market_")
    && input.related?.transferNegotiationId === undefined
    && input.related?.preliminaryAgreementId === undefined
  ) {
    throw new Error(`${input.category} inbox messages must reference a transfer negotiation or preliminary agreement`);
  }

  if (input.category.startsWith("market_") && input.related?.playerId === undefined) {
    throw new Error(`${input.category} inbox messages must reference a player`);
  }

  if (
    (input.category === "contract_counteroffer"
      || input.category === "contract_accepted"
      || input.category === "contract_rejected")
    && input.related?.contractNegotiationId === undefined
  ) {
    throw new Error(`${input.category} inbox messages must reference a contract negotiation`);
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

  const expectedSource: CareerInboxSource = input.category.startsWith("contract_")
    ? "contract_office"
    : input.category.startsWith("market_")
    ? "transfer_office"
    : input.category === "matchday"
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
    continuePolicy:
      input.continuePolicy
      ?? (input.level === "blocking"
        ? "until_resolved"
        : input.level === "important"
          ? "until_acknowledged"
          : "never"),
    lifecycle: { ...input.lifecycle },
    related: input.related ?? {},
    blockerKeys: [...new Set(input.blockerKeys ?? [])],
    actionIds: [...new Set(input.actionIds ?? [])],
  };
}

/** Returns whether this lifecycle state must stop career advancement. */
export function doesCareerInboxMessageStopContinue(message: CareerInboxMessage): boolean {
  if (message.continuePolicy === "until_resolved") {
    return !message.lifecycle.resolved;
  }

  return message.continuePolicy === "until_acknowledged" && !message.lifecycle.acknowledged;
}
