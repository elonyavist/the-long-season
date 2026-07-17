/** Priority keys mirrored from domain without importing domain into `@game/ui`. */
export type CareerInboxViewPriority = "routine" | "important" | "urgent";

/** Message status keys mirrored from domain without importing domain into `@game/ui`. */
export type CareerInboxViewStatus = "unread" | "read" | "resolved" | "expired";

/** Canonical current-season Inbox category keys consumed by career surfaces. */
export type CareerInboxViewCategory =
  | "matchday"
  | "match_result"
  | "season_rollover";

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

/** Filters available in the current-season Posta workspace. */
export type CareerPostaFilter = "all" | "to_handle" | "unread";

/** Attention levels mirrored at the UI boundary without importing domain. */
export type CareerPostaAttentionLevel = "blocking" | "important" | "informational";

/** Durable lifecycle facts consumed by the framework-free Posta builder. */
export interface CareerPostaLifecycleInput {
  readonly read: boolean;
  readonly acknowledged: boolean;
  readonly resolved: boolean;
}

/** Fixture facts already resolved by the application presenter. */
export interface CareerPostaFixtureInput {
  readonly opponentName: string;
  readonly competitionName: string;
  readonly roundNumber: number;
  readonly venue: "home" | "away";
  readonly readiness?: {
    readonly lineup: boolean;
    readonly bench: boolean;
    readonly tactic: boolean;
  };
  readonly score?: {
    readonly selectedClubGoals: number;
    readonly opponentGoals: number;
  };
}

/** Structured facts persisted by the completed-season archive. */
export interface CareerPostaSeasonInput {
  readonly sequenceNumber: number;
  readonly selectedClubPosition: number;
  readonly championClubName: string;
  readonly fixtureCount: number;
  readonly totalGoals: number;
}

/** One language-agnostic current-season message accepted by Posta. */
export interface CareerPostaMessageInput {
  readonly messageId: string;
  readonly dateIso: string;
  readonly category: "matchday" | "match_result" | "season_rollover";
  readonly source: "technical_staff" | "match_report" | "competition_office";
  readonly level: CareerPostaAttentionLevel;
  readonly lifecycle: CareerPostaLifecycleInput;
  readonly blockerKeys: readonly string[];
  readonly actionIds: readonly string[];
  readonly fixture?: CareerPostaFixtureInput;
  readonly season?: CareerPostaSeasonInput;
}

/** Dense row used by the Posta message list. */
export interface CareerPostaListItemView {
  readonly messageId: string;
  readonly dateIso: string;
  readonly subjectKey: string;
  readonly previewKey: string;
  readonly sourceKey: string;
  readonly level: CareerPostaAttentionLevel;
  readonly unread: boolean;
  readonly toHandle: boolean;
  readonly selected: boolean;
}

/** One structured football fact shown in the selected-message detail. */
export type CareerPostaFactRowView =
  | { readonly labelKey: string; readonly value: string; readonly valueKey?: never }
  | { readonly labelKey: string; readonly valueKey: string; readonly value?: never };

/** Primary manager destination attached to the selected message. */
export interface CareerPostaPrimaryActionView {
  readonly actionId: string;
  readonly labelKey: string;
}

/** Full selected-message detail derived without localized prose. */
export interface CareerPostaDetailView {
  readonly messageId: string;
  readonly dateIso: string;
  readonly subjectKey: string;
  readonly previewKey: string;
  readonly sourceKey: string;
  readonly statusKey: string;
  readonly level: CareerPostaAttentionLevel;
  readonly factRows: readonly CareerPostaFactRowView[];
  readonly blockerLabelKeys: readonly string[];
  readonly primaryAction?: CareerPostaPrimaryActionView;
}

/** Complete list/detail projection for the current-season Posta screen. */
export interface CareerPostaView {
  readonly viewKey: "career.posta";
  readonly activeFilter: CareerPostaFilter;
  readonly filters: readonly CareerPostaFilter[];
  readonly messages: readonly CareerPostaListItemView[];
  readonly selectedMessage?: CareerPostaDetailView;
  readonly selectedMessageId?: string;
  readonly totalCount: number;
  readonly unreadCount: number;
  readonly toHandleCount: number;
  readonly emptyStateKey: string;
}

/** Input for building one deterministic Posta list/detail projection. */
export interface BuildCareerPostaViewInput {
  readonly messages: readonly CareerPostaMessageInput[];
  readonly activeFilter: CareerPostaFilter;
  readonly selectedMessageId?: string;
}

const POSTA_FILTERS: readonly CareerPostaFilter[] = ["all", "to_handle", "unread"];
const POSTA_LEVEL_RANK: Readonly<Record<CareerPostaAttentionLevel, number>> = {
  blocking: 0,
  important: 1,
  informational: 2,
};

/** Builds the canonical current-season Posta list and selected detail. */
export function buildCareerPostaView(input: BuildCareerPostaViewInput): CareerPostaView {
  const ordered = [...input.messages].sort(comparePostaMessages);
  const filtered = ordered.filter((message) => matchesPostaFilter(message, input.activeFilter));
  const selectedInput = filtered.find((message) => message.messageId === input.selectedMessageId)
    ?? filtered[0];
  const selectedMessageId = selectedInput?.messageId;

  return {
    viewKey: "career.posta",
    activeFilter: input.activeFilter,
    filters: POSTA_FILTERS,
    messages: filtered.map((message) => toPostaListItem(message, message.messageId === selectedMessageId)),
    ...(selectedInput === undefined ? {} : { selectedMessage: toPostaDetail(selectedInput) }),
    ...(selectedMessageId === undefined ? {} : { selectedMessageId }),
    totalCount: ordered.length,
    unreadCount: ordered.filter((message) => !message.lifecycle.read).length,
    toHandleCount: ordered.filter(isPostaToHandle).length,
    emptyStateKey: ordered.length === 0
      ? "career.inbox.empty"
      : "career.inbox.filter.empty",
  };
}

function toPostaListItem(
  message: CareerPostaMessageInput,
  selected: boolean,
): CareerPostaListItemView {
  return {
    messageId: message.messageId,
    dateIso: message.dateIso,
    subjectKey: subjectKey(message),
    previewKey: previewKey(message),
    sourceKey: sourceKey(message),
    level: message.level,
    unread: !message.lifecycle.read,
    toHandle: isPostaToHandle(message),
    selected,
  };
}

function toPostaDetail(message: CareerPostaMessageInput): CareerPostaDetailView {
  const actionId = message.lifecycle.resolved ? undefined : message.actionIds[0];
  const factRows = buildPostaFactRows(message);

  return {
    messageId: message.messageId,
    dateIso: message.dateIso,
    subjectKey: subjectKey(message),
    previewKey: previewKey(message),
    sourceKey: sourceKey(message),
    statusKey: message.lifecycle.resolved
      ? "career.inbox.status.resolved"
      : message.lifecycle.read
        ? "career.inbox.status.read"
        : "career.inbox.status.unread",
    level: message.level,
    factRows,
    blockerLabelKeys: message.blockerKeys.map((key) => `career.inbox.blocker.${key}`),
    ...(actionId === undefined
      ? {}
      : { primaryAction: { actionId, labelKey: `career.inbox.action.${actionId}` } }),
  };
}

function buildPostaFactRows(message: CareerPostaMessageInput): CareerPostaFactRowView[] {
  const rows: CareerPostaFactRowView[] = [];

  if (message.fixture !== undefined) {
    rows.push(
      { labelKey: "career.inbox.fact.opponent", value: message.fixture.opponentName },
      { labelKey: "career.inbox.fact.competition", value: message.fixture.competitionName },
      { labelKey: "career.inbox.fact.round", value: String(message.fixture.roundNumber) },
      { labelKey: "career.inbox.fact.venue", valueKey: `career.inbox.venue.${message.fixture.venue}` },
    );

    if (message.fixture.score !== undefined) {
      rows.push({
        labelKey: "career.inbox.fact.finalScore",
        value: `${message.fixture.score.selectedClubGoals} - ${message.fixture.score.opponentGoals}`,
      });
    }

    if (message.fixture.readiness !== undefined) {
      rows.push(
        {
          labelKey: "career.inbox.fact.lineup",
          valueKey: readinessKey(message.fixture.readiness.lineup),
        },
        {
          labelKey: "career.inbox.fact.bench",
          valueKey: readinessKey(message.fixture.readiness.bench),
        },
        {
          labelKey: "career.inbox.fact.tactic",
          valueKey: readinessKey(message.fixture.readiness.tactic),
        },
      );
    }
  }

  if (message.season !== undefined) {
    rows.push(
      { labelKey: "career.inbox.fact.seasonNumber", value: String(message.season.sequenceNumber) },
      { labelKey: "career.inbox.fact.selectedClubPosition", value: String(message.season.selectedClubPosition) },
      { labelKey: "career.inbox.fact.champion", value: message.season.championClubName },
      { labelKey: "career.inbox.fact.matches", value: String(message.season.fixtureCount) },
      { labelKey: "career.inbox.fact.goals", value: String(message.season.totalGoals) },
    );
  }

  return rows;
}

function readinessKey(ready: boolean): string {
  return ready ? "career.inbox.readiness.ready" : "career.inbox.readiness.needsAttention";
}

function subjectKey(message: CareerPostaMessageInput): string {
  return `career.inbox.subject.${message.category}`;
}

function previewKey(message: CareerPostaMessageInput): string {
  if (message.category === "matchday") {
    return message.blockerKeys.length > 0
      ? "career.inbox.preview.matchdayPreparation"
      : "career.inbox.preview.matchdayReady";
  }

  return `career.inbox.preview.${message.category}`;
}

function sourceKey(message: CareerPostaMessageInput): string {
  return `career.inbox.source.${message.source}`;
}

function matchesPostaFilter(
  message: CareerPostaMessageInput,
  filter: CareerPostaFilter,
): boolean {
  if (filter === "to_handle") return isPostaToHandle(message);
  if (filter === "unread") return !message.lifecycle.read;
  return true;
}

function isPostaToHandle(message: CareerPostaMessageInput): boolean {
  if (message.level === "blocking") return !message.lifecycle.resolved;
  return message.level === "important" && !message.lifecycle.acknowledged;
}

function comparePostaMessages(left: CareerPostaMessageInput, right: CareerPostaMessageInput): number {
  const handleDelta = Number(isPostaToHandle(right)) - Number(isPostaToHandle(left));
  if (handleDelta !== 0) return handleDelta;
  const levelDelta = POSTA_LEVEL_RANK[left.level] - POSTA_LEVEL_RANK[right.level];
  if (levelDelta !== 0) return levelDelta;
  const dateDelta = right.dateIso.localeCompare(left.dateIso);
  return dateDelta !== 0 ? dateDelta : left.messageId.localeCompare(right.messageId);
}
