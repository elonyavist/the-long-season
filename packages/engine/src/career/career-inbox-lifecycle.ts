import {
  careerInboxMessageId,
  createCareerInboxMessage,
  createCareerState,
  type ClubId,
  type CareerInboxMessage,
  type CareerInboxMessageId,
  type CareerState,
  type FixtureId,
  type GameDate,
  type SeasonId,
} from "@game/domain";

/** Stable failures exposed by the narrow Inbox lifecycle use cases. */
export type CareerInboxLifecycleErrorCode =
  | "message_not_found"
  | "message_not_important"
  | "message_not_opened";

/** Domain-facing error that keeps lifecycle failures machine-readable. */
export class CareerInboxLifecycleError extends Error {
  public constructor(
    public readonly code: CareerInboxLifecycleErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CareerInboxLifecycleError";
  }
}

/**
 * Delivers or refreshes a deterministic batch while preserving lifecycle facts.
 *
 * A producer may rebuild the same stable message with fresher blockers or a
 * different destination. Read, acknowledgement, and resolution remain owned
 * by the career session and can never be reset by redelivery.
 */
export function deliverCareerInboxMessages(
  careerState: CareerState,
  messages: readonly CareerInboxMessage[],
): CareerState {
  const incomingById = uniqueMessagesById(messages);
  if (incomingById.size === 0) return careerState;

  const existingById = new Map(
    (careerState.currentSeasonInbox ?? []).map((message) => [message.id, message]),
  );
  let changed = false;

  for (const [messageId, incoming] of incomingById) {
    const existing = existingById.get(messageId);
    const delivered = existing === undefined
      ? incoming
      : createCareerInboxMessage({
          ...incoming,
          lifecycle: existing.lifecycle,
        });
    if (existing === undefined || !equalInboxMessage(existing, delivered)) changed = true;
    existingById.set(messageId, delivered);
  }

  if (!changed) return careerState;
  return withInbox(careerState, [...existingById.values()].sort(compareInboxMessages));
}

/** Marks one message read without acknowledging or resolving it. */
export function openCareerInboxMessage(
  careerState: CareerState,
  messageId: CareerInboxMessageId,
): CareerState {
  const message = requiredMessage(careerState, messageId);
  if (message.lifecycle.read) return careerState;

  return replaceMessage(careerState, createCareerInboxMessage({
    ...message,
    lifecycle: { ...message.lifecycle, read: true },
  }));
}

/** Acknowledges important attention only after the manager has opened it. */
export function acknowledgeImportantCareerInboxMessage(
  careerState: CareerState,
  messageId: CareerInboxMessageId,
): CareerState {
  const message = requiredMessage(careerState, messageId);
  if (message.level !== "important") {
    throw new CareerInboxLifecycleError(
      "message_not_important",
      `Career inbox message is not important: ${messageId}`,
    );
  }
  if (!message.lifecycle.read) {
    throw new CareerInboxLifecycleError(
      "message_not_opened",
      `Career inbox message must be opened before acknowledgement: ${messageId}`,
    );
  }
  if (message.lifecycle.acknowledged) return careerState;

  return replaceMessage(careerState, createCareerInboxMessage({
    ...message,
    lifecycle: { ...message.lifecycle, acknowledged: true },
  }));
}

/** Builds one informational summary from an authoritative played fixture. */
export function createPlayedFixtureResultInboxMessage(
  careerState: CareerState,
  fixtureId: FixtureId,
): CareerInboxMessage | undefined {
  const fixture = careerState.gameState.fixtures[fixtureId];
  if (fixture?.result?.played !== true) return undefined;

  return createCareerInboxMessage({
    id: careerInboxMessageId(`inbox:match-result:${fixture.id}`),
    date: fixture.date,
    category: "match_result",
    source: "match_report",
    level: "informational",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: { fixtureId: fixture.id, clubId: careerState.selectedClubId },
  });
}

/** Builds one important current-season summary from a completed rollover. */
export function createSeasonRolloverInboxMessage(input: {
  readonly nextSeasonId: SeasonId;
  readonly date: GameDate;
  readonly selectedClubId: ClubId;
}): CareerInboxMessage {
  return createCareerInboxMessage({
    id: careerInboxMessageId(`inbox:season-rollover:${input.nextSeasonId}`),
    date: input.date,
    category: "season_rollover",
    source: "competition_office",
    level: "important",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: { clubId: input.selectedClubId },
  });
}

/**
 * Resolves blocking messages exclusively from canonical career facts.
 *
 * Matchday attention remains active through preparation and the live match;
 * the linked played fixture is the only current resolution predicate.
 */
export function reconcileCareerInboxResolution(careerState: CareerState): CareerState {
  let changed = false;
  const messages = (careerState.currentSeasonInbox ?? []).map((message) => {
    if (message.level !== "blocking" || message.lifecycle.resolved) return message;
    const fixtureId = message.related.fixtureId;
    const isResolved = fixtureId !== undefined
      && careerState.gameState.fixtures[fixtureId]?.result?.played === true;
    if (!isResolved) return message;

    changed = true;
    return createCareerInboxMessage({
      ...message,
      lifecycle: { ...message.lifecycle, resolved: true },
    });
  });

  const reconciled = changed ? withInbox(careerState, messages) : careerState;
  const resultMessages = messages.flatMap((message) => {
    if (message.category !== "matchday") return [];
    const fixtureId = message.related.fixtureId;
    if (fixtureId === undefined) return [];
    const resultMessage = createPlayedFixtureResultInboxMessage(reconciled, fixtureId);
    return resultMessage === undefined ? [] : [resultMessage];
  });

  return deliverCareerInboxMessages(reconciled, resultMessages);
}

function requiredMessage(
  careerState: CareerState,
  messageId: CareerInboxMessageId,
): CareerInboxMessage {
  const message = (careerState.currentSeasonInbox ?? []).find((candidate) => candidate.id === messageId);
  if (message === undefined) {
    throw new CareerInboxLifecycleError(
      "message_not_found",
      `Career inbox message does not exist: ${messageId}`,
    );
  }
  return message;
}

function replaceMessage(careerState: CareerState, replacement: CareerInboxMessage): CareerState {
  const messages = (careerState.currentSeasonInbox ?? []).map((message) =>
    message.id === replacement.id ? replacement : message,
  );
  return withInbox(careerState, messages);
}

function withInbox(careerState: CareerState, currentSeasonInbox: readonly CareerInboxMessage[]): CareerState {
  return createCareerState({ ...careerState, currentSeasonInbox });
}

function uniqueMessagesById(
  messages: readonly CareerInboxMessage[],
): ReadonlyMap<CareerInboxMessageId, CareerInboxMessage> {
  const unique = new Map<CareerInboxMessageId, CareerInboxMessage>();
  for (const message of messages) {
    const previous = unique.get(message.id);
    if (previous !== undefined && !equalInboxMessage(previous, message)) {
      throw new Error(`Conflicting career inbox delivery: ${message.id}`);
    }
    unique.set(message.id, message);
  }
  return unique;
}

function compareInboxMessages(left: CareerInboxMessage, right: CareerInboxMessage): number {
  if (left.date !== right.date) return left.date - right.date;
  const levelRank = { blocking: 0, important: 1, informational: 2 } as const;
  const levelDifference = levelRank[left.level] - levelRank[right.level];
  return levelDifference !== 0
    ? levelDifference
    : String(left.id).localeCompare(String(right.id));
}

function equalInboxMessage(left: CareerInboxMessage, right: CareerInboxMessage): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
