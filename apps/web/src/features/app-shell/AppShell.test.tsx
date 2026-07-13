import type { MessageKey, Translator } from "@game/i18n";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";

const LABELS: Partial<Record<MessageKey, string>> = {
  "web.app.title": "The Long Season",
  "web.navigation.mainMenu": "Main menu",
  "career.dashboard.selectedClub": "Selected club",
  "career.dashboard.continue": "Continue",
  "career.inbox.title": "Inbox",
  "career.inbox.unreadCount": "Unread",
  "career.inbox.actionRequiredCount": "Action required",
  "career.inbox.empty": "No messages",
  "career.inbox.title.matchPreparationRequired": "Match preparation required",
  "career.inbox.summary.matchPreparationRequired": "Save a lineup and tactic before advancing.",
  "career.inbox.action.prepare_match": "Prepare match",
  "career.shell.navigation": "Career navigation",
  "career.shell.content": "Selected career screen",
  "career.shell.nav.dashboard": "Dashboard",
  "career.shell.nav.squad": "Squad",
  "career.shell.nav.tactics": "Tactics",
  "career.shell.nav.calendar": "Calendar",
  "career.shell.nav.fixtures": "Fixtures",
  "career.shell.nav.market": "Market",
  "career.shell.nav.finances": "Finances",
  "career.shell.nav.youth": "Youth",
  "career.shell.nav.staff": "Staff",
  "career.shell.nav.archive": "Archive",
  "career.shell.disabled.futurePhase": "Available later",
  "career.shell.rightRail": "Career actions and attention",
  "career.shell.careerContext": "Career context",
  "career.shell.managerAttention": "Manager attention",
  "career.shell.nextAction": "Next action",
  "career.shell.continueToNextStop": "Continue advances to the next stop.",
};

const text: Translator = (key) => LABELS[key] ?? key;

describe("AppShell", () => {
  it("renders the persistent MVP career sections without fake future navigation", () => {
    const html = renderShell();

    for (const label of ["Dashboard", "Squad", "Tactics", "Calendar", "Fixtures", "Market", "Finances", "Youth", "Staff", "Archive"]) {
      expect(html).toContain(label);
    }

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-status="current"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Available later");
    expect(html).toContain("Career actions and attention");
  });

  it("keeps Continue and Posta attention in the right rail", () => {
    const html = renderShell();

    expect(html).toContain("Continue");
    expect(html).toContain("Continue advances to the next stop.");
    expect(html).toContain("Inbox");
    expect(html).toContain("Match preparation required");
    expect(html).toContain("Prepare match");
  });

  it("hides the global Continue in focused preparation mode while keeping Posta", () => {
    const html = renderShell("preparation");

    expect(html).not.toContain(">Continue</button>");
    expect(html).not.toContain("Continue advances to the next stop.");
    expect(html).toContain("Inbox");
    expect(html).toContain("Match preparation required");
  });
});

function renderShell(mode?: "standard" | "preparation"): string {
  const inboxView = buildCareerInboxView([
    {
      actionRequired: true,
      actions: [{ actionId: "prepare-match", labelKey: "career.inbox.action.prepare_match" }],
      category: "match_preparation_required",
      dateIso: "2026-08-01",
      messageId: "message:match-prep",
      priority: "urgent",
      status: "unread",
      summaryKey: "career.inbox.summary.matchPreparationRequired",
      titleKey: "career.inbox.title.matchPreparationRequired",
    },
  ]);
  const shellView = buildCareerShellView({
    activeSectionKey: "dashboard",
    inboxView,
    ...(mode === undefined ? {} : { mode }),
  });

  return renderToStaticMarkup(
    <AppShell
      contextItems={[{ label: "Season", value: "2026" }]}
      selectedClubName="S.S. Perugia"
      shellView={shellView}
      text={text}
      onBackToMenu={vi.fn()}
      onContinueCareer={vi.fn()}
    >
      <section>Dashboard body</section>
    </AppShell>,
  );
}
