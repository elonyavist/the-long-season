import assert from "node:assert/strict";
import { test } from "vitest";

import { buildCareerInboxView } from "./career-inbox-view.ts";
import { buildCareerShellView } from "./career-shell-view.ts";

test("buildCareerShellView exposes the default navigation order and active section", () => {
  const view = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView: buildCareerInboxView([]),
  });

  assert.equal(view.viewKey, "career.shell");
  assert.deepEqual(
    view.navigationItems.map((item) => item.sectionKey),
    [
      "dashboard",
      "squad",
      "tactics",
      "fixtures",
      "market",
      "finances",
      "facilities",
      "youth",
      "staff",
      "archive",
    ],
  );
  assert.equal(view.navigationItems[0]?.isCurrent, true);
  assert.equal(view.centralContentSectionKey, "dashboard");
});

test("buildCareerShellView preserves disabled future sections with label keys", () => {
  const view = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView: buildCareerInboxView([]),
  });

  const squad = view.navigationItems.find((item) => item.sectionKey === "squad");

  assert.equal(squad?.status, "disabled");
  assert.equal(squad?.labelKey, "career.shell.nav.squad");
  assert.equal(squad?.disabledReasonKey, "career.shell.disabled.futurePhase");
});

test("buildCareerShellView derives Inbox rail action-required state", () => {
  const view = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView: buildCareerInboxView([
      {
        messageId: "inbox:prep",
        dateIso: "2026-08-01",
        category: "match_preparation_required",
        priority: "urgent",
        status: "unread",
        titleKey: "career.inbox.title.matchPreparationRequired",
        summaryKey: "career.inbox.summary.matchPreparationRequired",
        actionRequired: true,
      },
    ]),
  });

  assert.equal(view.inboxRail.areaKey, "career.shell.inboxRail");
  assert.equal(view.inboxRail.ariaLabelKey, "career.inbox.title");
  assert.equal(view.inboxRail.hasActionRequiredMessages, true);
  assert.equal(view.inboxRail.inboxView.actionRequiredCount, 1);
});

test("buildCareerShellView accepts explicit navigation for later phases", () => {
  const view = buildCareerShellView({
    activeSectionKey: "squad",
    inboxView: buildCareerInboxView([]),
    navigationItems: [
      { sectionKey: "dashboard", labelKey: "career.shell.nav.dashboard", status: "available" },
      { sectionKey: "squad", labelKey: "career.shell.nav.squad", status: "available" },
    ],
  });

  assert.deepEqual(
    view.navigationItems.map((item) => [item.sectionKey, item.isCurrent]),
    [
      ["dashboard", false],
      ["squad", true],
    ],
  );
  assert.equal(view.centralContentSectionKey, "squad");
});
