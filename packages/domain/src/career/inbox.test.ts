import assert from "node:assert/strict";
import { test } from "vitest";

import { fixtureId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import {
  careerInboxMessageId,
  createCareerInboxMessage,
  isActionRequiredInboxMessage,
} from "./inbox.ts";

test("careerInboxMessageId validates namespaced message IDs", () => {
  assert.equal(careerInboxMessageId("inbox:fixture-000003-prep"), "inbox:fixture-000003-prep");
  assert.throws(() => careerInboxMessageId(""), /must not be empty/);
  assert.throws(() => careerInboxMessageId("42"), /integer-like/);
  assert.throws(() => careerInboxMessageId("message:fixture-000003"), /inbox:/);
  assert.throws(() => careerInboxMessageId("inbox:"), /include a value/);
});

test("createCareerInboxMessage keeps messages structured and language agnostic", () => {
  const message = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:fixture-000003-prep"),
    date: gameDate(20_000),
    category: "match_preparation_required",
    priority: "urgent",
    status: "unread",
    titleKey: "career.inbox.title.matchPreparationRequired",
    summaryKey: "career.inbox.summary.matchPreparationRequired",
    actionRequired: true,
    related: {
      fixtureId: fixtureId("fixture:000003"),
    },
    actionIds: ["prepare_match"],
  });

  assert.equal(message.id, "inbox:fixture-000003-prep");
  assert.equal(message.category, "match_preparation_required");
  assert.equal(message.related.fixtureId, "fixture:000003");
  assert.deepEqual(message.actionIds, ["prepare_match"]);
});

test("createCareerInboxMessage rejects empty localization keys", () => {
  const base = {
    id: careerInboxMessageId("inbox:fixture-000003-prep"),
    date: gameDate(20_000),
    category: "match_preparation_required" as const,
    priority: "urgent" as const,
    status: "unread" as const,
    actionRequired: true,
    actionIds: ["prepare_match" as const],
  };

  assert.throws(
    () => createCareerInboxMessage({ ...base, titleKey: "", summaryKey: "career.inbox.summary" }),
    /titleKey/,
  );
  assert.throws(
    () => createCareerInboxMessage({ ...base, titleKey: "career.inbox.title", summaryKey: " " }),
    /summaryKey/,
  );
});

test("action-required messages must expose a manager action", () => {
  assert.throws(
    () =>
      createCareerInboxMessage({
        id: careerInboxMessageId("inbox:fixture-000003-prep"),
        date: gameDate(20_000),
        category: "match_preparation_required",
        priority: "urgent",
        status: "unread",
        titleKey: "career.inbox.title.matchPreparationRequired",
        summaryKey: "career.inbox.summary.matchPreparationRequired",
        actionRequired: true,
      }),
    /at least one action/,
  );
});

test("isActionRequiredInboxMessage ignores resolved or expired messages", () => {
  const unreadMessage = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:fixture-000003-prep"),
    date: gameDate(20_000),
    category: "match_preparation_required",
    priority: "urgent",
    status: "unread",
    titleKey: "career.inbox.title.matchPreparationRequired",
    summaryKey: "career.inbox.summary.matchPreparationRequired",
    actionRequired: true,
    actionIds: ["prepare_match"],
  });
  const resolvedMessage = createCareerInboxMessage({
    ...unreadMessage,
    id: careerInboxMessageId("inbox:fixture-000003-prep-resolved"),
    status: "resolved",
  });

  assert.equal(isActionRequiredInboxMessage(unreadMessage), true);
  assert.equal(isActionRequiredInboxMessage(resolvedMessage), false);
});
