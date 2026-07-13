import type { MessageKey, Translator } from "@game/i18n";
import type { CareerShellNavigationItemView, CareerShellView } from "@game/ui";
import type React from "react";

import { AppShellPostaRail } from "./AppShellPostaRail";

/** One compact fact rendered in the persistent career shell context rail. */
export type AppShellContextItem = Readonly<{
  label: string;
  value: string;
}>;

/** Props for the reusable three-column career application shell. */
export type AppShellProps = Readonly<{
  shellView: CareerShellView;
  selectedClubName: string;
  contextItems?: readonly AppShellContextItem[];
  text: Translator;
  onBackToMenu: () => void;
  onContinueCareer: () => void;
  onInboxActionClick?: (actionId: string) => void;
  children: React.ReactNode;
}>;

type SidebarItem = Readonly<{
  key: string;
  labelKey: MessageKey;
  disabledReasonKey?: MessageKey;
  isCurrent: boolean;
  isInteractive: boolean;
}>;

const SIDEBAR_ORDER: readonly Readonly<{ key: string; labelKey: MessageKey }>[] = [
  { key: "dashboard", labelKey: "career.shell.nav.dashboard" },
  { key: "squad", labelKey: "career.shell.nav.squad" },
  { key: "tactics", labelKey: "career.shell.nav.tactics" },
  { key: "calendar", labelKey: "career.shell.nav.calendar" },
  { key: "fixtures", labelKey: "career.shell.nav.fixtures" },
  { key: "market", labelKey: "career.shell.nav.market" },
  { key: "finances", labelKey: "career.shell.nav.finances" },
  { key: "youth", labelKey: "career.shell.nav.youth" },
  { key: "staff", labelKey: "career.shell.nav.staff" },
  { key: "archive", labelKey: "career.shell.nav.archive" },
];

/**
 * Renders the first MVP career shell around the currently selected screen.
 *
 * The shell is intentionally navigation-light in this phase: inactive sections
 * are visible for orientation, but only real actions exposed by the current
 * career read model are interactive.
 */
export function AppShell({
  shellView,
  selectedClubName,
  contextItems = [],
  text,
  onBackToMenu,
  onContinueCareer,
  onInboxActionClick,
  children,
}: AppShellProps): React.JSX.Element {
  const sidebarItems = buildSidebarItems(shellView);
  const inboxView = shellView.inboxRail.inboxView;

  return (
    <div className="tls-app-shell" data-shell-mode={shellView.mode}>
      <aside className="tls-app-shell-sidebar" aria-label={text("career.shell.navigation")}>
        <div className="tls-app-shell-brand-block">
          <span className="tls-career-shell-crest" aria-hidden="true">
            {selectedClubName.slice(0, 1)}
          </span>
          <div className="tls-career-shell-brand">
            <p>{text("web.app.title")}</p>
            <strong>{selectedClubName}</strong>
          </div>
        </div>

        <nav className="tls-app-shell-nav" aria-label={text("career.shell.navigation")}>
          {sidebarItems.map((item) => (
            <SidebarNavItem item={item} key={item.key} text={text} />
          ))}
        </nav>

        <button className="tls-menu-button tls-app-shell-menu" type="button" onClick={onBackToMenu}>
          {text("web.navigation.mainMenu")}
        </button>
      </aside>

      <main className="tls-app-shell-main" aria-label={text("career.shell.content")}>
        {children}
      </main>

      <aside className="tls-app-shell-right-rail" aria-label={text("career.shell.rightRail")}>
        {shellView.showGlobalContinue ? (
          <button className="tls-menu-button tls-menu-button-primary tls-app-shell-continue" type="button" onClick={onContinueCareer}>
            {text("career.dashboard.continue")}
          </button>
        ) : null}

        {shellView.showInboxRail ? (
          <AppShellPostaRail
            inboxView={inboxView}
            showContinueHint={shellView.showGlobalContinue}
            text={text}
            {...(onInboxActionClick === undefined ? {} : { onActionClick: onInboxActionClick })}
          />
        ) : null}

        <section className="tls-app-shell-rail-card" aria-labelledby="tls-career-context-title">
          <h2 id="tls-career-context-title">{text("career.shell.careerContext")}</h2>
          <dl className="tls-app-shell-context-list">
            <div>
              <dt>{text("career.dashboard.selectedClub")}</dt>
              <dd>{selectedClubName}</dd>
            </div>
            {contextItems.map((item) => (
              <div key={`${item.label}:${item.value}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </aside>
    </div>
  );
}

function SidebarNavItem({ item, text }: Readonly<{ item: SidebarItem; text: Translator }>): React.JSX.Element {
  const label = text(item.labelKey);
  const disabledReason = item.disabledReasonKey === undefined ? undefined : text(item.disabledReasonKey);
  const ariaCurrent = item.isCurrent ? "page" : undefined;

  if (item.isCurrent) {
    return (
      <span
        className="tls-app-shell-nav-item"
        aria-current={ariaCurrent}
        data-current="true"
        data-status="current"
      >
        {label}
      </span>
    );
  }

  if (!item.isInteractive) {
    return (
      <span
        className="tls-app-shell-nav-item"
        aria-disabled="true"
        aria-label={disabledReason === undefined ? label : `${label} - ${disabledReason}`}
        data-current="false"
        data-status="disabled"
        title={disabledReason}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className="tls-app-shell-nav-item"
      data-current="false"
      data-status="available"
    >
      {label}
    </span>
  );
}

function buildSidebarItems(shellView: CareerShellView): readonly SidebarItem[] {
  const byKey = new Map<string, CareerShellNavigationItemView>();

  for (const item of shellView.navigationItems) {
    byKey.set(item.sectionKey, item);
  }

  return SIDEBAR_ORDER.map((item) => {
    const shellItem = byKey.get(item.key);
    const isCurrent = shellView.activeSectionKey === item.key;

    if (shellItem === undefined) {
      return {
        ...item,
        disabledReasonKey: "career.shell.disabled.futurePhase",
        isCurrent,
        isInteractive: false,
      };
    }

    return {
      key: item.key,
      labelKey: shellItem.labelKey as MessageKey,
      isCurrent,
      isInteractive: false,
      ...(shellItem.disabledReasonKey === undefined
        ? {}
        : { disabledReasonKey: shellItem.disabledReasonKey as MessageKey }),
    };
  });
}
