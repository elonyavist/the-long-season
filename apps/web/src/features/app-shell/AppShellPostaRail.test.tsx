import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView } from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppShellPostaRail } from "./AppShellPostaRail";

const labels: Partial<Record<MessageKey, string>> = {
  "career.inbox.title": "Posta",
  "career.inbox.unreadCount": "Unread",
  "career.inbox.actionRequiredCount": "Action required",
  "career.inbox.empty": "No messages",
  "career.inbox.subject.matchday": "Matchday",
};
const text: Translator = (key) => labels[key] ?? key;

describe("AppShellPostaRail", () => {
  it("shows compact awareness without duplicating football actions", () => {
    const view = buildCareerInboxView([{
      actionRequired: true,
      actions: [{ actionId: "prepare_match", labelKey: "career.inbox.action.prepare_match" }],
      category: "matchday",
      dateIso: "2026-08-01",
      messageId: "message:match-prep",
      priority: "urgent",
      status: "unread",
      summaryKey: "career.inbox.preview.matchdayPreparation",
      titleKey: "career.inbox.subject.matchday",
    }]);

    const html = renderToStaticMarkup(<AppShellPostaRail inboxView={view} text={text} onOpen={() => undefined} />);

    expect(html).toContain("Posta");
    expect(html).toContain("Matchday");
    expect(html).toContain("Unread");
    expect(html).toContain("Action required");
    expect(html.match(/Action required/g)).toHaveLength(1);
    expect(html).not.toContain("Prepare match");
    expect(html).not.toContain("Save a lineup");
  });

  it("renders an explicit calm empty state", () => {
    const html = renderToStaticMarkup(
      <AppShellPostaRail inboxView={buildCareerInboxView([])} text={text} />,
    );

    expect(html).toContain("No messages");
    expect(html).toContain(">0<");
  });
});
