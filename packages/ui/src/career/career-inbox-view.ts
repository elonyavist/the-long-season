/** Priority keys mirrored from domain without importing domain into `@game/ui`. */
export type CareerInboxViewPriority = "routine" | "important" | "urgent";

/** Message status keys mirrored from domain without importing domain into `@game/ui`. */
export type CareerInboxViewStatus = "unread" | "read" | "resolved" | "expired";

/** Inbox category keys currently consumed by the career dashboard. */
export type CareerInboxViewCategory = "match_preparation_required" | "matchday_reached";

/** Input action attached to an Inbox / Posta message. */
export interface CareerInboxActionInput {
  /** Stable action identifier. */
  readonly actionId: string;
  /** Localization key for the action label. */
  readonly labelKey: string;
}

/** Input message shape accepted by the UI read-model builder. */
export interface CareerInboxMessageInput {
  /** Stable message identifier. */
  readonly messageId: string;
  /** In-world date as an ISO-like display key prepared by the caller. */
  readonly dateIso: string;
  /** Structured category key. */
  readonly category: CareerInboxViewCategory;
  /** Priority key used for ordering and emphasis. */
  readonly priority: CareerInboxViewPriority;
  /** Read/resolution status key. */
  readonly status: CareerInboxViewStatus;
  /** Localization key for the visible title. */
  readonly titleKey: string;
  /** Localization key for the visible summary. */
  readonly summaryKey: string;
  /** Whether the manager must act on this message. */
  readonly actionRequired: boolean;
  /** Optional already-known display labels for related entities. */
  readonly relatedLabels?: readonly string[];
  /** Structured message actions prepared by the caller. */
  readonly actions?: readonly CareerInboxActionInput[];
}

/** UI-facing action shown inside an Inbox / Posta message summary. */
export interface CareerInboxMessageActionView {
  /** Stable action identifier. */
  readonly actionId: string;
  /** Localization key for the action label. */
  readonly labelKey: string;
}

/** One UI-facing Inbox / Posta message summary. */
export interface CareerInboxMessageView {
  /** Stable message identifier. */
  readonly messageId: string;
  /** In-world date as an ISO-like display key prepared by the caller. */
  readonly dateIso: string;
  /** Structured category key. */
  readonly category: CareerInboxViewCategory;
  /** Priority key used for ordering and emphasis. */
  readonly priority: CareerInboxViewPriority;
  /** Read/resolution status key. */
  readonly status: CareerInboxViewStatus;
  /** Localization key for the visible title. */
  readonly titleKey: string;
  /** Localization key for the visible summary. */
  readonly summaryKey: string;
  /** Whether the manager must act on this message. */
  readonly actionRequired: boolean;
  /** Optional already-known display labels for related entities. */
  readonly relatedLabels: readonly string[];
  /** Structured message actions prepared by the caller. */
  readonly actions: readonly CareerInboxMessageActionView[];
}

/** UI-facing Inbox / Posta panel view. */
export interface CareerInboxView {
  /** Stable screen area key for renderers and tests. */
  readonly viewKey: "career.inbox";
  /** Ordered message summaries. */
  readonly messages: readonly CareerInboxMessageView[];
  /** Number of unread messages. */
  readonly unreadCount: number;
  /** Number of unresolved action-required messages. */
  readonly actionRequiredCount: number;
  /** Highest priority currently present, if any message exists. */
  readonly highestPriority?: CareerInboxViewPriority;
  /** Localization key used when the Inbox / Posta is empty. */
  readonly emptyStateKey: string;
}

const PRIORITY_RANK: Readonly<Record<CareerInboxViewPriority, number>> = {
  urgent: 0,
  important: 1,
  routine: 2,
};

/**
 * Builds a framework-free Inbox / Posta view from structured message input.
 *
 * The builder does not import domain or localize text. It only orders messages
 * and derives counts so web/CLI renderers can stay simple.
 */
export function buildCareerInboxView(messages: readonly CareerInboxMessageInput[]): CareerInboxView {
  const orderedMessages = messages.map(toMessageView).sort(compareMessageViews);
  const highestPriority = orderedMessages[0]?.priority;

  return {
    viewKey: "career.inbox",
    messages: orderedMessages,
    unreadCount: orderedMessages.filter((message) => message.status === "unread").length,
    actionRequiredCount: orderedMessages.filter(isActionRequiredMessageView).length,
    ...(highestPriority === undefined ? {} : { highestPriority }),
    emptyStateKey: "career.inbox.empty",
  };
}

function toMessageView(message: CareerInboxMessageInput): CareerInboxMessageView {
  return {
    messageId: message.messageId,
    dateIso: message.dateIso,
    category: message.category,
    priority: message.priority,
    status: message.status,
    titleKey: message.titleKey,
    summaryKey: message.summaryKey,
    actionRequired: message.actionRequired,
    relatedLabels: message.relatedLabels ?? [],
    actions: message.actions ?? [],
  };
}

function compareMessageViews(left: CareerInboxMessageView, right: CareerInboxMessageView): number {
  const actionDelta = Number(right.actionRequired) - Number(left.actionRequired);

  if (actionDelta !== 0) {
    return actionDelta;
  }

  const priorityDelta = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];

  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const dateDelta = left.dateIso.localeCompare(right.dateIso);

  if (dateDelta !== 0) {
    return dateDelta;
  }

  return left.messageId.localeCompare(right.messageId);
}

function isActionRequiredMessageView(message: CareerInboxMessageView): boolean {
  return message.actionRequired && message.status !== "resolved" && message.status !== "expired";
}
