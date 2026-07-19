import type { MessageKey, Translator } from "@game/i18n";
import { fromISO } from "@game/shared";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppShell, AppShellStorageRecoveryProvider } from "./AppShell";
import { CareerSaveLifecycleProvider } from "./CareerSaveControl";
import type { CareerSessionStatus } from "../../runtime/career-session";

const LABELS: Partial<Record<MessageKey, string>> = {
  "web.app.title": "The Long Season",
  "web.navigation.mainMenu": "Main menu",
  "career.saveControl.title": "Save",
  "career.saveControl.close": "Close save menu",
  "career.saveControl.saveGame": "Save game",
  "career.saveControl.saving": "Saving...",
  "career.saveControl.unsaved": "Unsaved changes",
  "career.saveControl.savedThrough": "Saved through",
  "career.saveControl.autosave": "Autosave",
  "career.saveControl.autosave7": "Every 7 days",
  "career.saveControl.autosave15": "Every 15 days",
  "career.saveControl.manualOnly": "Manual only",
  "career.saveControl.disabledDuringMatch": "Saving is unavailable while the match is in progress.",
  "career.dashboard.selectedClub": "Selected club",
  "career.dashboard.continue": "Continue",
  "career.currentDate": "Current date",
  "career.calendarAdvance.label": "Calendar advancing",
  "career.calendarAdvance.complete": "Career advanced to {date}.",
  "career.inbox.title": "Inbox",
  "career.inbox.unreadCount": "Unread",
  "career.inbox.actionRequiredCount": "Action required",
  "career.inbox.empty": "No messages",
  "career.inbox.subject.matchday": "Matchday",
  "career.inbox.preview.matchdayPreparation": "Prepare the team before kick-off.",
  "career.inbox.action.prepare_match": "Prepare match",
  "career.shell.navigation": "Career navigation",
  "career.shell.skipToContent": "Skip to current task",
  "career.shell.content": "Selected career screen",
  "career.shell.nav.dashboard": "Dashboard",
  "career.shell.nav.inbox": "Posta",
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
  "web.app.storage.error": "Career storage needs attention.",
  "web.app.storage.error.save_unwritable": "The career could not be saved. Check storage access, then try the command again.",
  "web.app.storage.retry": "Try again",
};

const text: Translator = (key) => LABELS[key] ?? key;

describe("AppShell", () => {
  it("exposes one localized keyboard bypass and stable main focus target", () => {
    const html = renderShell();

    expect(html).toContain('href="#tls-career-main"');
    expect(html).toContain("Skip to current task");
    expect(html).toContain('id="tls-career-main"');
    expect(html).not.toContain('id="tls-career-main" tabindex="-1"');
    expect(html).toContain('class="tls-app-shell-screen-transition"');
    expect(html).toContain('data-screen-key="dashboard:standard"');
  });

  it("offers a compact navigation control without enabling future sections", () => {
    const html = renderShell();

    expect(html).toContain('class="tls-app-shell-compact-nav"');
    expect(html).toContain('<select aria-label="Career navigation"');
    expect(html).toContain('<option disabled="" value="squad">Squad</option>');
  });

  it("renders the persistent MVP career sections without fake future navigation", () => {
    const html = renderShell();

    for (const label of ["Dashboard", "Posta", "Squad", "Tactics", "Calendar", "Fixtures", "Market", "Finances", "Youth", "Staff", "Archive"]) {
      expect(html).toContain(label);
    }

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-status="current"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('data-status="disabled"');
    expect(html).toContain("Available later");
    expect(html).toContain("2026-08-01");
    expect(html).not.toContain("Career context");
  });

  it("keeps Continue, save access, and compact Posta awareness in the sidebar", () => {
    const html = renderShell();

    expect(html).toContain("Continue");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain(">Save</span>");
    expect(html).toContain("Inbox");
    expect(html).toContain("Matchday");
    expect(html).not.toContain("Prepare match");
    expect(html).not.toContain('class="tls-app-shell-right-rail"');
  });

  it("hides the global Continue in focused preparation mode while keeping Posta", () => {
    const html = renderShell("preparation");

    expect(html).not.toContain(">Continue</button>");
    expect(html).toContain("Inbox");
    expect(html).toContain("Matchday");
  });

  it("announces current-career failures while keeping the shell available", () => {
    const html = renderShell(undefined, true);

    expect(html).toContain('role="alert"');
    expect(html).toContain('data-state="recovery"');
    expect(html).toContain("The career could not be saved");
    expect(html).toContain("Try again");
    expect(html).toContain("Dashboard body");
  });

  it("removes duplicated awareness and the third rail from the dedicated Posta workspace", () => {
    const html = renderShell(undefined, false, "inbox");

    expect(html).toContain('data-active-section="inbox"');
    expect(html).not.toContain('class="tls-app-shell-posta"');
    expect(html).not.toContain('class="tls-app-shell-right-rail"');
  });

  it("gives focused Matchday content the complete shell outlet without adding another rail", () => {
    const html = renderShell("matchday");

    expect(html).toContain('data-shell-mode="matchday"');
    expect(html).toContain('class="tls-app-shell-main" data-content-layout="full-width"');
    expect(html).not.toContain('class="tls-app-shell-right-rail"');
  });

});

function renderShell(
  mode?: "standard" | "preparation" | "matchday",
  withStorageFailure = false,
  activeSectionKey: "dashboard" | "inbox" = "dashboard",
): string {
  const inboxView = buildCareerInboxView([
    {
      actionRequired: true,
      actions: [{ actionId: "prepare-match", labelKey: "career.inbox.action.prepare_match" }],
      category: "matchday",
      dateIso: "2026-08-01",
      messageId: "message:match-prep",
      priority: "urgent",
      status: "unread",
      summaryKey: "career.inbox.preview.matchdayPreparation",
      titleKey: "career.inbox.subject.matchday",
    },
  ]);
  const shellView = buildCareerShellView({
    activeSectionKey,
    inboxView,
    ...(mode === undefined ? {} : { mode }),
  });

  const shell = (
    <CareerSaveLifecycleProvider value={{
      sessionStatus: {
        dirty: false,
        autosaveIntervalDays: 7,
        lastPersistedGameDate: fromISO("2026-08-01") as CareerSessionStatus["lastPersistedGameDate"],
        autosavePostponed: false,
      },
      canSave: true,
      pending: false,
      onSave: vi.fn(),
      onPolicyChange: vi.fn(),
    }}>
      <AppShell
        currentDateIso="2026-08-01"
        selectedClubName="S.S. Perugia"
        shellView={shellView}
        text={text}
        onBackToMenu={vi.fn()}
        onContinueCareer={vi.fn()}
      >
        <section>Dashboard body</section>
      </AppShell>
    </CareerSaveLifecycleProvider>
  );

  return renderToStaticMarkup(withStorageFailure ? (
    <AppShellStorageRecoveryProvider failure={{ code: "save_unwritable" }} onRetry={vi.fn()}>
      {shell}
    </AppShellStorageRecoveryProvider>
  ) : shell);
}
