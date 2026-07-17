import assert from "node:assert/strict";
import { test } from "vitest";

import {
  careerInboxMessageId,
  clubId,
  createCareerInboxMessage,
  fixtureId,
  gameDate,
  type CareerAttentionLevel,
  type CareerInboxMessage,
} from "@game/domain";

import { continueCareerUntilAttention, createMatchdayAttention } from "./continue-career.ts";

test("prepared and incomplete fixtures produce one stable matchday stop identity", () => {
  const base = {
    fixtureId: fixtureId("fixture:000003"),
    clubId: clubId("club:perugia"),
    date: gameDate(20_007),
  };
  const incomplete = createMatchdayAttention({
    ...base,
    preparation: {
      hasSavedLineup: false,
      hasCompleteBench: false,
      hasBenchGoalkeeper: false,
      hasSavedTactic: true,
    },
  });
  const ready = createMatchdayAttention({
    ...base,
    preparation: {
      hasSavedLineup: true,
      hasCompleteBench: true,
      hasBenchGoalkeeper: true,
      hasSavedTactic: true,
    },
  });

  assert.equal(incomplete.event.id, ready.event.id);
  assert.equal(incomplete.message.id, ready.message.id);
  assert.deepEqual(incomplete.message.actionIds, ["prepare_match"]);
  assert.deepEqual(ready.message.actionIds, ["open_matchday"]);

  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    boundaryDate: base.date,
    messages: [incomplete.message],
  });
  assert.equal(result.stopReason, "attention");
  assert.equal(result.stopDate, base.date);
  assert.equal(result.daysAdvanced, 7);
});

test("Continue delivers informational messages before stopping on a later day", () => {
  const info = message("info", gameDate(20_001), "informational");
  const important = message("important", gameDate(20_003), "important");
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    boundaryDate: gameDate(20_010),
    messages: [important, info],
  });

  assert.equal(result.stopDate, gameDate(20_003));
  assert.deepEqual(result.inboxMessages.map((item) => item.id), [info.id, important.id]);
  assert.deepEqual(result.stopDateMessages.map((item) => item.id), [important.id]);
});

test("same-date messages form one complete ordered stop batch", () => {
  const info = message("c-info", gameDate(20_002), "informational");
  const important = message("b-important", gameDate(20_002), "important");
  const blocking = message("a-blocking", gameDate(20_002), "blocking");
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    boundaryDate: gameDate(20_005),
    messages: [info, important, blocking],
  });

  assert.deepEqual(result.stopDateMessages.map((item) => item.id), [blocking.id, important.id, info.id]);
  assert.equal(result.selectedMessageId, blocking.id);
  assert.equal(result.daysAdvanced, 2);
});

test("resolved blocking and acknowledged important messages do not stop Continue", () => {
  const resolved = message("resolved", gameDate(20_001), "blocking", { resolved: true, read: true });
  const acknowledged = message("acknowledged", gameDate(20_002), "important", {
    acknowledged: true,
    read: true,
  });
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    boundaryDate: gameDate(20_004),
    messages: [acknowledged, resolved],
  });

  assert.equal(result.stopReason, "no_attention");
  assert.equal(result.stopDate, gameDate(20_004));
  assert.deepEqual(result.inboxMessages.map((item) => item.id), [resolved.id, acknowledged.id]);
});

test("unresolved current-date attention is reused without advancement or duplication", () => {
  const blocking = message("current", gameDate(20_000), "blocking");
  const result = continueCareerUntilAttention({
    currentDate: gameDate(20_000),
    boundaryDate: gameDate(20_006),
    messages: [blocking],
  });

  assert.equal(result.daysAdvanced, 0);
  assert.deepEqual(result.stopDateMessages, [blocking]);
  assert.throws(
    () => continueCareerUntilAttention({
      currentDate: gameDate(20_000),
      boundaryDate: gameDate(20_006),
      messages: [blocking, blocking],
    }),
    /Duplicate career inbox message ID/,
  );
});

test("equal inputs produce equal ordering and stop output", () => {
  const input = {
    currentDate: gameDate(20_000),
    boundaryDate: gameDate(20_003),
    messages: [
      message("z", gameDate(20_003), "blocking"),
      message("a", gameDate(20_003), "blocking"),
    ],
  };

  assert.deepEqual(continueCareerUntilAttention(input), continueCareerUntilAttention(input));
});

function message(
  suffix: string,
  date: ReturnType<typeof gameDate>,
  level: CareerAttentionLevel,
  lifecycle: Partial<CareerInboxMessage["lifecycle"]> = {},
): CareerInboxMessage {
  return createCareerInboxMessage({
    id: careerInboxMessageId(`inbox:matchday:fixture:${suffix}`),
    date,
    category: "matchday",
    source: "technical_staff",
    level,
    lifecycle: { read: false, acknowledged: false, resolved: false, ...lifecycle },
    related: { fixtureId: fixtureId(`fixture:${suffix}`) },
    actionIds: level === "blocking" ? ["open_matchday"] : [],
  });
}
