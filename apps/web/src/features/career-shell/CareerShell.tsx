import type { MessageKey, Translator } from "@game/i18n";
import type { CareerShellView } from "@game/ui";
import type React from "react";

import { CareerInboxPanel } from "./CareerInboxPanel";

/** Props for the reusable career browser shell. */
export type CareerShellProps = Readonly<{
  shellView: CareerShellView;
  selectedClubName: string;
  contextItems?: readonly CareerShellContextItem[];
  text: Translator;
  onBackToMenu: () => void;
  onContinueCareer: () => void;
  onInboxActionClick?: (actionId: string) => void;
  children: React.ReactNode;
}>;

/** Localized facts shown in the shell operations header. */
export type CareerShellContextItem = Readonly<{
  label: string;
  value: string;
}>;

/** Renders the career shell with top navigation and central content outlet. */
export function CareerShell({
  shellView,
  selectedClubName,
  contextItems = [],
  text,
  onBackToMenu,
  onContinueCareer,
  onInboxActionClick,
  children,
}: CareerShellProps): React.JSX.Element {
  const bodyStyle = shellView.showInboxRail ? undefined : { gridTemplateColumns: "minmax(0, 1fr)" };

  return (
    <div className="tls-career-shell" data-shell-mode={shellView.mode} data-testid="career-shell">
      <header className="tls-career-shell-header">
        <div className="tls-career-shell-operations">
          <div className="tls-career-shell-crest" aria-hidden="true">
            {selectedClubName.slice(0, 2).toUpperCase()}
          </div>
          <div className="tls-career-shell-brand">
            <p>{text("web.app.title")}</p>
            <strong>{selectedClubName}</strong>
          </div>
          {contextItems.length === 0 ? null : (
            <dl className="tls-career-shell-context" aria-label={text("career.dashboard.selectedClub")}>
              {contextItems.map((item) => (
                <div key={`${item.label}:${item.value}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <nav className="tls-career-shell-nav" aria-label={text("career.shell.navigation")}>
          {shellView.navigationItems.map((item) => {
            const disabledReason = item.disabledReasonKey === undefined
              ? undefined
              : text(item.disabledReasonKey as MessageKey);
            const label = text(item.labelKey as MessageKey);

            if (!item.isInteractive) {
              return (
                <span
                  aria-disabled="true"
                  aria-label={disabledReason === undefined ? label : `${label} - ${disabledReason}`}
                  className="tls-career-shell-nav-item"
                  data-status="disabled"
                  key={item.sectionKey}
                  style={{ cursor: "not-allowed", opacity: 0.55, pointerEvents: "none" }}
                  title={disabledReason}
                >
                  {label}
                </span>
              );
            }

            return (
              <button
                aria-current={item.isCurrent ? "page" : undefined}
                className="tls-career-shell-nav-item"
                key={item.sectionKey}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="tls-career-shell-actions" aria-label={text("career.dashboard.actions")} role="group">
          <button className="tls-menu-button tls-career-shell-menu" type="button" onClick={onBackToMenu}>
            {text("web.navigation.mainMenu")}
          </button>
          {shellView.showGlobalContinue ? (
            <button
              className="tls-menu-button tls-menu-button-primary tls-career-shell-continue"
              type="button"
              onClick={onContinueCareer}
            >
              {text("career.dashboard.continue")}
            </button>
          ) : null}
        </div>
      </header>

      <div className="tls-career-shell-body" style={bodyStyle}>
        {shellView.showInboxRail ? (
          <aside
            aria-label={text(shellView.inboxRail.ariaLabelKey as MessageKey)}
            className="tls-career-shell-inbox-rail"
            data-action-required={shellView.inboxRail.hasActionRequiredMessages}
          >
            <CareerInboxPanel
              view={shellView.inboxRail.inboxView}
              text={text}
              {...(onInboxActionClick === undefined ? {} : { onActionClick: onInboxActionClick })}
            />
          </aside>
        ) : null}

        <main
          aria-label={text("career.shell.content")}
          className="tls-career-shell-content"
          data-section={shellView.centralContentSectionKey}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
