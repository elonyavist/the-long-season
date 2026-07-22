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
      "inbox",
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
  assert.equal(view.navigationItems[0]?.isInteractive, true);
  assert.equal(view.centralContentSectionKey, "dashboard");
  assert.equal(view.mode, "standard");
  assert.equal(view.showInboxRail, true);
});

test("buildCareerShellView exposes Posta as a real central destination", () => {
  const view = buildCareerShellView({
    activeSectionKey: "inbox",
    inboxView: buildCareerInboxView([]),
  });

  assert.equal(view.centralContentSectionKey, "inbox");
  assert.equal(view.navigationItems.find((item) => item.sectionKey === "inbox")?.isCurrent, true);
  assert.equal(view.navigationItems.find((item) => item.sectionKey === "inbox")?.isInteractive, true);
});

test("buildCareerShellView exposes Squad as a real central destination", () => {
  const view = buildCareerShellView({
    activeSectionKey: "squad",
    inboxView: buildCareerInboxView([]),
  });

  const squad = view.navigationItems.find((item) => item.sectionKey === "squad");

  assert.equal(view.centralContentSectionKey, "squad");
  assert.equal(squad?.status, "available");
  assert.equal(squad?.isCurrent, true);
  assert.equal(squad?.isInteractive, true);
});

test("buildCareerShellView exposes Tactics while preserving later disabled sections", () => {
  const view = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView: buildCareerInboxView([]),
  });

  const tactics = view.navigationItems.find((item) => item.sectionKey === "tactics");
  const fixtures = view.navigationItems.find((item) => item.sectionKey === "fixtures");

  assert.equal(tactics?.status, "available");
  assert.equal(tactics?.isCurrent, false);
  assert.equal(tactics?.isInteractive, true);
  assert.equal(tactics?.labelKey, "career.shell.nav.tactics");
  assert.equal(tactics?.disabledReasonKey, undefined);
  assert.equal(fixtures?.status, "disabled");
  assert.equal(fixtures?.disabledReasonKey, "career.shell.disabled.futurePhase");
});

test("buildCareerShellView keeps Inbox visible during preparation", () => {
  const view = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView: buildCareerInboxView([]),
    mode: "preparation",
  });

  assert.equal(view.mode, "preparation");
  assert.equal(view.showInboxRail, true);
});

test("buildCareerShellView hides Inbox during matchday", () => {
  const view = buildCareerShellView({
    activeSectionKey: "fixtures",
    inboxView: buildCareerInboxView([]),
    mode: "matchday",
  });

  assert.equal(view.mode, "matchday");
  assert.equal(view.showInboxRail, false);
  assert.equal(view.navigationItems.find((item) => item.sectionKey === "fixtures")?.isCurrent, false);
});

test("buildCareerShellView derives Inbox rail action-required state", () => {
  const view = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView: buildCareerInboxView([
      {
        messageId: "inbox:prep",
        dateIso: "2026-08-01",
        category: "matchday",
        priority: "urgent",
        status: "unread",
        titleKey: "career.inbox.subject.matchday",
        summaryKey: "career.inbox.preview.matchdayPreparation",
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
