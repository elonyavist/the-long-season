import {
  careerInboxMessageId,
  createCareerInboxMessage,
  createMatchdayAttentionEvent,
  doesCareerInboxMessageStopContinue,
  type CareerAttentionBlockerKey,
  type CareerAttentionEvent,
  type CareerInboxMessage,
  type CareerInboxMessageId,
  type CareerState,
  type ClubId,
  type FixtureId,
  type GameDate,
} from "@game/domain";
import {
  findNextCareerFixture,
  type NextCareerFixtureInvalidReason,
} from "./next-fixture.ts";

/** Machine-readable outcome of deterministic daily career evaluation. */
export type CareerContinueStopReason = "attention" | "no_attention";

/** Saved preparation facts used to describe one matchday decision. */
export interface ContinueCareerPreparationInput {
  readonly hasSavedLineup: boolean;
  readonly hasSavedTactic: boolean;
  readonly hasCompleteBench?: boolean;
  readonly hasBenchGoalkeeper?: boolean;
  readonly targetFixtureId?: FixtureId;
}

/** One fixture-scoped attention fact and its durable-message projection. */
export interface CareerMatchdayAttention {
  readonly event: CareerAttentionEvent;
  readonly message: CareerInboxMessage;
}

/** Result of resolving the next selected-club fixture into Continue attention. */
export type NextCareerMatchdayAttentionResult =
  | { readonly status: "found"; readonly attention: CareerMatchdayAttention }
  | { readonly status: "none" }
  | {
      readonly status: "invalid";
      readonly reason: NextCareerFixtureInvalidReason;
      readonly fixtureId?: FixtureId;
    };

/** Explicit dated facts consumed by the pure Continue use case. */
export interface ContinueCareerUntilAttentionInput {
  readonly currentDate: GameDate;
  readonly boundaryDate: GameDate;
  readonly messages: readonly CareerInboxMessage[];
}

/** Pure continuation result used by runtime and later persistence use cases. */
export interface ContinueCareerUntilAttentionResult {
  readonly startDate: GameDate;
  readonly stopDate: GameDate;
  readonly daysAdvanced: number;
  readonly stopReason: CareerContinueStopReason;
  /** Every message encountered from the start date through the stop date. */
  readonly inboxMessages: readonly CareerInboxMessage[];
  /** Complete ordered batch on the date that stopped advancement. */
  readonly stopDateMessages: readonly CareerInboxMessage[];
  /** Deterministic default selection for the stop-date batch. */
  readonly selectedMessageId?: CareerInboxMessageId;
}

/**
 * Builds the single matchday event/message identity for one fixture.
 *
 * Preparation changes blocker details and destination only. The identity,
 * category, level, and source remain stable.
 */
export function createMatchdayAttention(input: {
  readonly fixtureId: FixtureId;
  readonly clubId: ClubId;
  readonly date: GameDate;
  readonly preparation: ContinueCareerPreparationInput;
}): CareerMatchdayAttention {
  const blockerKeys = missingPreparationBlockers(input.preparation);
  const event = createMatchdayAttentionEvent({
    fixtureId: input.fixtureId,
    clubId: input.clubId,
    date: input.date,
    blockerKeys,
  });
  const message = createCareerInboxMessage({
    id: careerInboxMessageId(`inbox:matchday:${input.fixtureId}`),
    date: input.date,
    category: "matchday",
    source: "technical_staff",
    level: "blocking",
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: event.related,
    blockerKeys,
    actionIds: [blockerKeys.length > 0 ? "prepare_match" : "open_matchday"],
  });

  return { event, message };
}

/**
 * Builds Continue attention from the competition-aware next-fixture selector.
 *
 * This keeps matchday identity scoped to the globally unique fixture ID and
 * prevents callers from selecting an arbitrary fixture object key.
 */
export function createNextCareerMatchdayAttention(input: {
  readonly careerState: CareerState;
  readonly preparation: ContinueCareerPreparationInput;
}): NextCareerMatchdayAttentionResult {
  const nextFixture = findNextCareerFixture(input.careerState);
  if (nextFixture.status === "none") return { status: "none" };
  if (nextFixture.status === "invalid") {
    return {
      status: "invalid",
      reason: nextFixture.reason,
      ...(nextFixture.fixtureId === undefined ? {} : { fixtureId: nextFixture.fixtureId }),
    };
  }
  return {
    status: "found",
    attention: createMatchdayAttention({
      fixtureId: nextFixture.fixtureId,
      clubId: input.careerState.selectedClubId,
      date: nextFixture.fixture.date,
      preparation: input.preparation,
    }),
  };
}

/**
 * Evaluates canonical game days and stops once for the first attention date.
 *
 * The function is deterministic and side-effect free. Informational messages
 * are delivered while scanning but never stop advancement.
 */
export function continueCareerUntilAttention(
  input: ContinueCareerUntilAttentionInput,
): ContinueCareerUntilAttentionResult {
  const boundaryDate = input.boundaryDate < input.currentDate ? input.currentDate : input.boundaryDate;
  const orderedMessages = uniqueOrderedMessages(input.messages);
  const delivered: CareerInboxMessage[] = [];

  for (let day = input.currentDate; day <= boundaryDate; day = (day + 1) as GameDate) {
    const dueToday = orderedMessages.filter((message) =>
      day === input.currentDate ? message.date <= day : message.date === day,
    );
    delivered.push(...dueToday);

    if (dueToday.some(doesCareerInboxMessageStopContinue)) {
      const selectedMessage = dueToday[0];
      if (selectedMessage === undefined) {
        throw new Error("Stopping attention date must contain at least one message");
      }
      return {
        startDate: input.currentDate,
        stopDate: day,
        daysAdvanced: day - input.currentDate,
        stopReason: "attention",
        inboxMessages: delivered,
        stopDateMessages: dueToday,
        selectedMessageId: selectedMessage.id,
      };
    }
  }

  return {
    startDate: input.currentDate,
    stopDate: boundaryDate,
    daysAdvanced: boundaryDate - input.currentDate,
    stopReason: "no_attention",
    inboxMessages: delivered,
    stopDateMessages: [],
  };
}

function uniqueOrderedMessages(messages: readonly CareerInboxMessage[]): readonly CareerInboxMessage[] {
  const ids = new Set<CareerInboxMessageId>();
  for (const message of messages) {
    if (ids.has(message.id)) {
      throw new Error(`Duplicate career inbox message ID: ${message.id}`);
    }
    ids.add(message.id);
  }

  return [...messages].sort(compareMessages);
}

function compareMessages(left: CareerInboxMessage, right: CareerInboxMessage): number {
  if (left.date !== right.date) return left.date - right.date;
  const levelDifference = levelRank(left.level) - levelRank(right.level);
  return levelDifference !== 0 ? levelDifference : String(left.id).localeCompare(String(right.id));
}

function levelRank(level: CareerInboxMessage["level"]): number {
  return { blocking: 0, important: 1, informational: 2 }[level];
}

function missingPreparationBlockers(
  preparation: ContinueCareerPreparationInput,
): readonly CareerAttentionBlockerKey[] {
  return [
    ...(preparation.hasSavedLineup ? [] : ["missing_saved_lineup" as const]),
    ...(preparation.hasCompleteBench === false ? ["missing_bench_slot" as const] : []),
    ...(preparation.hasBenchGoalkeeper === false ? ["missing_bench_goalkeeper" as const] : []),
    ...(preparation.hasSavedTactic ? [] : ["missing_saved_tactic" as const]),
  ];
}
