import assert from "node:assert/strict";
import { test } from "vitest";

import { buildCareerInboxView } from "./career-inbox-view.ts";

test("buildCareerInboxView derives counts and empty state", () => {
  const view = buildCareerInboxView([]);

  assert.equal(view.viewKey, "career.inbox");
  assert.equal(view.unreadCount, 0);
  assert.equal(view.actionRequiredCount, 0);
  assert.equal(view.highestPriority, undefined);
  assert.equal(view.emptyStateKey, "career.inbox.empty");
});

test("buildCareerInboxView sorts action-required urgent messages first", () => {
  const view = buildCareerInboxView([
    {
      messageId: "inbox:later-routine",
      dateIso: "2026-08-02",
      category: "matchday_reached",
      priority: "routine",
      status: "unread",
      titleKey: "career.inbox.title.matchdayReached",
      summaryKey: "career.inbox.summary.matchdayReached",
      actionRequired: false,
    },
    {
      messageId: "inbox:prep",
      dateIso: "2026-08-01",
      category: "match_preparation_required",
      priority: "urgent",
      status: "unread",
      titleKey: "career.inbox.title.matchPreparationRequired",
      summaryKey: "career.inbox.summary.matchPreparationRequired",
      actionRequired: true,
      actions: [{ actionId: "prepare_match", labelKey: "career.inbox.action.prepareMatch" }],
    },
  ]);

  assert.equal(view.messages[0]?.messageId, "inbox:prep");
  assert.equal(view.unreadCount, 2);
  assert.equal(view.actionRequiredCount, 1);
  assert.equal(view.highestPriority, "urgent");
  assert.deepEqual(view.messages[0]?.actions, [
    { actionId: "prepare_match", labelKey: "career.inbox.action.prepareMatch" },
  ]);
});

test("buildCareerInboxView uses date and ID as deterministic tie-breakers", () => {
  const view = buildCareerInboxView([
    messageFixture("inbox:beta", "2026-08-02"),
    messageFixture("inbox:alpha", "2026-08-02"),
    messageFixture("inbox:earlier", "2026-08-01"),
  ]);

  assert.deepEqual(
    view.messages.map((message) => message.messageId),
    ["inbox:earlier", "inbox:alpha", "inbox:beta"],
  );
});

function messageFixture(messageId: string, dateIso: string) {
  return {
    messageId,
    dateIso,
    category: "matchday_reached" as const,
    priority: "important" as const,
    status: "unread" as const,
    titleKey: "career.inbox.title.matchdayReached",
    summaryKey: "career.inbox.summary.matchdayReached",
    actionRequired: true,
  };
}
