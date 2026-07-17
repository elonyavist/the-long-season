import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerPostaView } from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InboxMessageDetail } from "./InboxMessageDetail";

const labels: Partial<Record<MessageKey, string>> = {
  "career.inbox.source.technical_staff": "Technical staff",
  "career.inbox.subject.matchday": "Match preparation required",
  "career.inbox.preview.matchdayPreparation": "Complete the squad before kick-off.",
  "career.inbox.level.blocking": "Blocking",
  "career.inbox.status.unread": "Unread",
  "career.inbox.backToMessages": "Back to messages",
  "career.inbox.matchFacts": "Match facts",
  "career.inbox.fact.opponent": "Opponent",
  "career.inbox.fact.competition": "Competition",
  "career.inbox.fact.round": "Round",
  "career.inbox.fact.venue": "Venue",
  "career.inbox.fact.lineup": "Starting XI",
  "career.inbox.fact.bench": "Bench",
  "career.inbox.fact.tactic": "Tactic",
  "career.inbox.venue.away": "Away",
  "career.inbox.readiness.ready": "Ready",
  "career.inbox.readiness.needsAttention": "Needs attention",
  "career.inbox.blockers": "Needs attention",
  "career.inbox.blocker.missing_saved_lineup": "Complete the starting XI",
  "career.inbox.action.prepare_match": "Prepare match",
};
const text: Translator = (key) => labels[key] ?? key;

describe("InboxMessageDetail", () => {
  it("presents resolved football facts, blockers, and one primary destination", () => {
    const view = buildCareerPostaView({
      activeFilter: "all",
      messages: [{
        actionIds: ["prepare_match"],
        blockerKeys: ["missing_saved_lineup"],
        category: "matchday",
        dateIso: "2026-08-01",
        fixture: {
          opponentName: "U.S. Pisa",
          competitionName: "Demo Third Division",
          roundNumber: 1,
          venue: "away",
          readiness: { lineup: false, bench: true, tactic: true },
        },
        level: "blocking",
        lifecycle: { acknowledged: false, read: false, resolved: false },
        messageId: "inbox:matchday:fixture:technical-id",
        source: "technical_staff",
      }],
    });

    const html = renderToStaticMarkup(
      <InboxMessageDetail message={view.selectedMessage} text={text} onBack={() => undefined} onPrimaryAction={() => undefined} />,
    );

    expect(html).toContain("Back to messages");
    expect(html).toContain("U.S. Pisa");
    expect(html).toContain("Demo Third Division");
    expect(html).toContain("Away");
    expect(html).toContain("Needs attention");
    expect(html).toContain("Ready");
    expect(html).toContain("Complete the starting XI");
    expect(html).toContain("Prepare match");
    expect(html).toContain('data-status-key="career.inbox.status.unread"');
    expect(html).toContain('data-inbox-detail-title="true" tabindex="-1"');
    expect(html).not.toContain("technical-id");
  });

  it("keeps the sole manager destination disabled during a pending command", () => {
    const view = buildCareerPostaView({
      activeFilter: "all",
      messages: [{
        actionIds: ["prepare_match"],
        blockerKeys: ["missing_saved_lineup"],
        category: "matchday",
        dateIso: "2026-08-01",
        level: "blocking",
        lifecycle: { acknowledged: false, read: false, resolved: false },
        messageId: "inbox:matchday",
        source: "technical_staff",
      }],
    });

    const html = renderToStaticMarkup(
      <InboxMessageDetail disabled message={view.selectedMessage} text={text} onBack={() => undefined} onPrimaryAction={() => undefined} />,
    );

    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
});
