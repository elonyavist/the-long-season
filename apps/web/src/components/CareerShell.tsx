import type { MessageKey, Translator } from "@game/i18n";
import type { CareerShellView } from "@game/ui";

import { CareerInboxPanel } from "./CareerInboxPanel";

/** Props for the reusable career browser shell. */
export type CareerShellProps = Readonly<{
  shellView: CareerShellView;
  selectedClubName: string;
  text: Translator;
  onBackToMenu: () => void;
  onContinueCareer: () => void;
  onInboxActionClick?: (actionId: string) => void;
  children: React.ReactNode;
}>;

/** Renders the career shell with top navigation and central content outlet. */
export function CareerShell({
  shellView,
  selectedClubName,
  text,
  onBackToMenu,
  onContinueCareer,
  onInboxActionClick,
  children,
}: CareerShellProps): React.JSX.Element {
  return (
    <div className="tls-career-shell" data-testid="career-shell">
      <header className="tls-career-shell-header">
        <div className="tls-career-shell-brand">
          <p>{text("web.app.title")}</p>
          <strong>{selectedClubName}</strong>
        </div>

        <nav className="tls-career-shell-nav" aria-label={text("career.shell.navigation")}>
          {shellView.navigationItems.map((item) => {
            const disabledReason = item.disabledReasonKey === undefined
              ? undefined
              : text(item.disabledReasonKey as MessageKey);

            return (
              <button
                aria-current={item.isCurrent ? "page" : undefined}
                className="tls-career-shell-nav-item"
                disabled={item.status === "disabled"}
                key={item.sectionKey}
                title={disabledReason}
                type="button"
              >
                {text(item.labelKey as MessageKey)}
              </button>
            );
          })}
        </nav>

        <div className="tls-career-shell-actions" aria-label={text("career.dashboard.actions")} role="group">
          <button className="tls-menu-button tls-career-shell-menu" type="button" onClick={onBackToMenu}>
            {text("web.navigation.mainMenu")}
          </button>
          <button
            className="tls-menu-button tls-menu-button-primary tls-career-shell-continue"
            type="button"
            onClick={onContinueCareer}
          >
            {text("career.dashboard.continue")}
          </button>
        </div>
      </header>

      <div className="tls-career-shell-body">
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
