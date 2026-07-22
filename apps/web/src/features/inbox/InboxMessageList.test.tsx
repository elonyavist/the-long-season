import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerPostaView } from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InboxMessageList } from "./InboxMessageList";

const labels: Partial<Record<MessageKey, string>> = {
  "career.inbox.source.technical_staff": "Technical staff",
  "career.inbox.subject.matchday": "Match preparation required",
  "career.inbox.preview.matchdayPreparation": "Complete the squad before kick-off.",
  "career.inbox.level.blocking": "Blocking",
  "career.inbox.unreadMarker": "Unread",
};
const text: Translator = (key) => labels[key] ?? key;

describe("InboxMessageList", () => {
  it("renders a dense selected unread row with source, date, subject, and preview", () => {
    const view = buildCareerPostaView({
      activeFilter: "all",
      messages: [{
        actionIds: ["prepare_match"],
        blockerKeys: ["missing_saved_lineup"],
        category: "matchday",
        dateIso: "2026-08-01",
      level: "blocking",
      continuePolicy: "until_resolved",
        lifecycle: { acknowledged: false, read: false, resolved: false },
        messageId: "inbox:matchday",
        source: "technical_staff",
      }],
    });

    const html = renderToStaticMarkup(
      <InboxMessageList messages={view.messages} emptyStateKey={view.emptyStateKey} text={text} onSelect={() => undefined} />,
    );

    expect(html).toContain('aria-current="true"');
    expect(html).toContain('data-level="blocking"');
    expect(html).toContain('data-to-handle="true"');
    expect(html).toContain("Technical staff");
    expect(html).toContain("2026-08-01");
    expect(html).toContain("Match preparation required");
    expect(html).toContain("Complete the squad before kick-off.");
    expect(html).toContain("Blocking. Unread");
  });

  it("disables every message row while the route command lock is active", () => {
    const view = buildCareerPostaView({
      activeFilter: "all",
      messages: [{
        actionIds: [],
        blockerKeys: [],
        category: "match_result",
        dateIso: "2026-08-01",
      level: "informational",
      continuePolicy: "never",
        lifecycle: { acknowledged: false, read: true, resolved: false },
        messageId: "inbox:result",
        source: "match_report",
      }],
    });

    const html = renderToStaticMarkup(
      <InboxMessageList disabled messages={view.messages} emptyStateKey={view.emptyStateKey} text={text} onSelect={() => undefined} />,
    );

    expect(html).toContain('disabled=""');
  });
});
