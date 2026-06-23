import {
  careerInboxMessageId,
  createCareerInboxMessage,
  createMatchPreparationRequiredEvent,
  createMatchdayReachedEvent,
  isUnresolvedCareerAttentionEvent,
  type CareerAttentionBlockerKey,
  type CareerAttentionEvent,
  type CareerInboxMessage,
  type ClubId,
  type Fixture,
  type FixtureId,
  type GameDate,
} from "@game/domain";

/** Machine-readable reason why career continuation stopped. */
export type CareerContinueStopReason =
  | "existing_attention"
  | "match_preparation_required"
  | "matchday_reached"
  | "no_attention";

/** Saved preparation facts for the next selected-club fixture. */
export interface ContinueCareerPreparationInput {
  /** Whether the manager has saved a lineup for the fixture. */
  readonly hasSavedLineup: boolean;
  /** Whether the manager has saved a tactic for the fixture. */
  readonly hasSavedTactic: boolean;
  /** Fixture targeted by the saved preparation when known. */
  readonly targetFixtureId?: FixtureId;
}

/** Explicit input facts used by the pure career continuation function. */
export interface ContinueCareerUntilAttentionInput {
  /** Current in-world date before pressing Continue. */
  readonly currentDate: GameDate;
  /** Club controlled by the manager. */
  readonly selectedClubId: ClubId;
  /** Next selected-club fixture when one exists. */
  readonly nextFixture?: Fixture;
  /** Saved preparation facts for the next selected-club fixture. */
  readonly preparation?: ContinueCareerPreparationInput;
  /** Existing unresolved stop events that should prevent any advancement. */
  readonly existingAttentionEvents?: readonly CareerAttentionEvent[];
}

/** Result returned by career continuation without mutating career state. */
export interface ContinueCareerUntilAttentionResult {
  /** Date where the continuation attempt started. */
  readonly startDate: GameDate;
  /** Date where the career stopped. */
  readonly stopDate: GameDate;
  /** Number of days moved forward by this continuation attempt. */
  readonly daysAdvanced: number;
  /** Machine-readable reason why the career stopped. */
  readonly stopReason: CareerContinueStopReason;
  /** Attention events produced or reused by this attempt. */
  readonly attentionEvents: readonly CareerAttentionEvent[];
  /** Inbox / Posta messages produced for the returned attention events. */
  readonly inboxMessages: readonly CareerInboxMessage[];
}

/**
 * Advances career time conceptually until the next manager attention stop.
 *
 * The function is pure: callers provide explicit fixture/preparation facts and
 * receive structured stop data. It does not simulate fixtures, write saves,
 * select lineups, resolve tactics, or use the real clock.
 */
export function continueCareerUntilAttention(
  input: ContinueCareerUntilAttentionInput,
): ContinueCareerUntilAttentionResult {
  const unresolvedEvents = (input.existingAttentionEvents ?? []).filter(isUnresolvedCareerAttentionEvent);

  if (unresolvedEvents.length > 0) {
    return result({
      startDate: input.currentDate,
      stopDate: input.currentDate,
      stopReason: "existing_attention",
      attentionEvents: unresolvedEvents,
    });
  }

  if (input.nextFixture === undefined) {
    return result({
      startDate: input.currentDate,
      stopDate: input.currentDate,
      stopReason: "no_attention",
      attentionEvents: [],
    });
  }

  const stopDate = input.nextFixture.date < input.currentDate ? input.currentDate : input.nextFixture.date;
  const preparation = input.preparation ?? { hasSavedLineup: false, hasSavedTactic: false };
  const blockerKeys = missingPreparationBlockers(preparation);

  if (blockerKeys.length > 0) {
    const event = createMatchPreparationRequiredEvent({
      fixtureId: input.nextFixture.id,
      clubId: input.selectedClubId,
      date: stopDate,
      blockerKeys,
    });

    return result({
      startDate: input.currentDate,
      stopDate,
      stopReason: "match_preparation_required",
      attentionEvents: [event],
    });
  }

  const event = createMatchdayReachedEvent({
    fixtureId: input.nextFixture.id,
    clubId: input.selectedClubId,
    date: stopDate,
  });

  return result({
    startDate: input.currentDate,
    stopDate,
    stopReason: "matchday_reached",
    attentionEvents: [event],
  });
}

function result(input: {
  readonly startDate: GameDate;
  readonly stopDate: GameDate;
  readonly stopReason: CareerContinueStopReason;
  readonly attentionEvents: readonly CareerAttentionEvent[];
}): ContinueCareerUntilAttentionResult {
  return {
    startDate: input.startDate,
    stopDate: input.stopDate,
    daysAdvanced: Math.max(0, input.stopDate - input.startDate),
    stopReason: input.stopReason,
    attentionEvents: input.attentionEvents,
    inboxMessages: input.attentionEvents.map(createInboxMessageForAttentionEvent),
  };
}

function missingPreparationBlockers(
  preparation: ContinueCareerPreparationInput,
): readonly CareerAttentionBlockerKey[] {
  return [
    ...(preparation.hasSavedLineup ? [] : ["missing_saved_lineup" as const]),
    ...(preparation.hasSavedTactic ? [] : ["missing_saved_tactic" as const]),
  ];
}

function createInboxMessageForAttentionEvent(event: CareerAttentionEvent): CareerInboxMessage {
  if (event.category === "match_preparation_required") {
    return createCareerInboxMessage({
      id: careerInboxMessageId(`inbox:${event.related.fixtureId}:preparation`),
      date: event.date,
      category: "match_preparation_required",
      priority: event.priority,
      status: "unread",
      titleKey: "career.inbox.title.matchPreparationRequired",
      summaryKey: "career.inbox.summary.matchPreparationRequired",
      actionRequired: event.actionRequired,
      related: event.related,
      actionIds: ["prepare_match"],
    });
  }

  return createCareerInboxMessage({
    id: careerInboxMessageId(`inbox:${event.related.fixtureId}:matchday`),
    date: event.date,
    category: "matchday_reached",
    priority: event.priority,
    status: "unread",
    titleKey: "career.inbox.title.matchdayReached",
    summaryKey: "career.inbox.summary.matchdayReached",
    actionRequired: event.actionRequired,
    related: event.related,
    actionIds: ["open_matchday"],
  });
}
