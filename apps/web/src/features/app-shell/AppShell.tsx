import type { MessageKey, Translator } from "@game/i18n";
import type {
  CareerShellNavigationItemView,
  CareerShellSectionKey,
  CareerShellView,
} from "@game/ui";
import * as m from "motion/react-m";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { AppShellPostaRail } from "./AppShellPostaRail";
import { useCareerSaveLifecycle } from "./CareerSaveControl";
import { CareerSaveDialog } from "./CareerSaveDialog";
import { CareerCurrentDate } from "./CareerCurrentDate";
import type { WebCareerPersistenceFailure } from "../../runtime/web-career-runtime";
import { CommandActivityLiveRegion } from "../shared/CommandActivityIndicator";
import { useCareerUiStore } from "../../stores/career-ui-store";
import { webMotion } from "../../shared/motion/web-motion";

type StorageRecoveryContextValue = Readonly<{
  failure: WebCareerPersistenceFailure | undefined;
  onRetry: () => void;
}>;

const StorageRecoveryContext = createContext<StorageRecoveryContextValue | undefined>(undefined);

/** Stable target used by the shell skip link and top-level screen focus owner. */
export const CAREER_MAIN_FOCUS_ID = "tls-career-main";

/** Moves keyboard focus to the visible title of the current career task. */
export function focusCurrentCareerTask(preventScroll = false): boolean {
  const main = document.getElementById(CAREER_MAIN_FOCUS_ID);
  const heading = main?.querySelector<HTMLElement>("h1");
  if (heading === undefined || heading === null) return false;
  heading.tabIndex = -1;
  heading.focus({ preventScroll });
  return true;
}

/** Supplies current-career persistence recovery without coupling the shell to Zustand. */
export function AppShellStorageRecoveryProvider({
  failure,
  onRetry,
  children,
}: Readonly<StorageRecoveryContextValue & { children: ReactNode }>): React.JSX.Element {
  return (
    <StorageRecoveryContext.Provider value={{ failure, onRetry }}>
      {children}
    </StorageRecoveryContext.Provider>
  );
}

/** Props for the reusable career application shell. */
export type AppShellProps = Readonly<{
  shellView: CareerShellView;
  selectedClubName: string;
  currentDateIso: string;
  text: Translator;
  onBackToMenu: () => void;
  /**
   * Opens another career section.
   *
   * Navigation is its own typed command: the section key is a domain union, so
   * adding a shell section without handling it fails typecheck instead of
   * rendering an enabled control that silently does nothing.
   */
  onNavigate?: (sectionKey: CareerShellSectionKey) => void;
  /** Resolves one Inbox/Posta message action. Never used for navigation. */
  onInboxActionClick?: (actionId: string) => void;
  children: ReactNode;
}>;

type SidebarItem = Readonly<{
  key: CareerShellSectionKey;
  labelKey: MessageKey;
  disabledReasonKey?: MessageKey;
  isCurrent: boolean;
  isInteractive: boolean;
}>;

/**
 * Renderer order for the shell sections.
 *
 * Keys are canonical `CareerShellSectionKey` values, so this list cannot drift
 * from the read model that decides which sections exist.
 */
const SIDEBAR_ORDER: readonly Readonly<{
  key: CareerShellSectionKey;
  labelKey: MessageKey;
}>[] = [
  { key: "dashboard", labelKey: "career.shell.nav.dashboard" },
  { key: "inbox", labelKey: "career.shell.nav.inbox" },
  { key: "squad", labelKey: "career.shell.nav.squad" },
  { key: "tactics", labelKey: "career.shell.nav.tactics" },
  { key: "fixtures", labelKey: "career.shell.nav.fixtures" },
  { key: "market", labelKey: "career.shell.nav.market" },
  { key: "finances", labelKey: "career.shell.nav.finances" },
  { key: "facilities", labelKey: "career.shell.nav.facilities" },
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
  currentDateIso,
  text,
  onBackToMenu,
  onNavigate,
  onInboxActionClick,
  children,
}: AppShellProps): React.JSX.Element {
  const sidebarItems = buildSidebarItems(shellView);
  const inboxView = shellView.inboxRail.inboxView;
  const storageRecovery = useContext(StorageRecoveryContext);
  const saveLifecycle = useCareerSaveLifecycle();
  const recoveryRef = useRef<HTMLElement>(null);
  const commandActivity = useCareerUiStore((state) => state.commandActivity);
  const calendarAdvanceTransition = useCareerUiStore((state) => state.calendarAdvanceTransition);
  const commandPending = commandActivity?.status === "pending";
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const visibleDateIso = calendarAdvanceTransition?.visibleDateIso ?? currentDateIso;

  const handleCompactNavigation = (event: ChangeEvent<HTMLSelectElement>): void => {
    const sectionKey = sidebarItems.find(
      (item) => item.key === event.currentTarget.value,
    )?.key;
    if (sectionKey === undefined || sectionKey === shellView.activeSectionKey) return;
    onNavigate?.(sectionKey);
  };

  const handleSkipToContent = (event: ReactMouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    focusCurrentCareerTask();
  };

  useEffect(() => {
    if (storageRecovery?.failure !== undefined) recoveryRef.current?.focus();
  }, [storageRecovery?.failure]);

  return (
    <div
      className="tls-app-shell"
      data-active-section={shellView.activeSectionKey}
      data-shell-mode={shellView.mode}
      aria-busy={commandPending}
    >
      <a
        className="tls-skip-link"
        href={`#${CAREER_MAIN_FOCUS_ID}`}
        onClick={handleSkipToContent}
      >
        {text("career.shell.skipToContent")}
      </a>
      <CommandActivityLiveRegion
        activity={commandActivity}
        text={text}
        {...(calendarAdvanceTransition?.status === "complete"
          ? { completionMessage: text("career.calendarAdvance.complete", { date: calendarAdvanceTransition.stopDateIso }) }
          : {})}
      />
      <aside className="tls-app-shell-sidebar" aria-label={text("career.shell.navigation")}>
        <div className="tls-app-shell-brand-block">
          <span className="tls-career-shell-crest" aria-hidden="true">
          </span>
          <div className="tls-career-shell-brand">
            <p>{text("web.app.title")}</p>
            <strong>{selectedClubName}</strong>
            <CareerCurrentDate
              advancing={calendarAdvanceTransition?.status === "advancing"}
              dateIso={visibleDateIso}
              label={text("career.currentDate")}
            />
          </div>
        </div>

        <nav className="tls-app-shell-nav" aria-label={text("career.shell.navigation")}>
          {sidebarItems.map((item) => (
            <SidebarNavItem
              item={item}
              key={item.key}
              text={text}
              onActivate={() => onNavigate?.(item.key)}
            />
          ))}
        </nav>

        <label className="tls-app-shell-compact-nav">
          <span className="tls-visually-hidden">{text("career.shell.navigation")}</span>
          <select
            aria-label={text("career.shell.navigation")}
            data-state={commandPending ? "disabled" : "idle"}
            disabled={commandPending}
            value={shellView.activeSectionKey}
            onChange={handleCompactNavigation}
          >
            {sidebarItems.map((item) => (
              <option
                disabled={!item.isCurrent && !item.isInteractive}
                key={item.key}
                value={item.key}
              >
                {text(item.labelKey)}
              </option>
            ))}
          </select>
        </label>

        {shellView.showInboxRail && shellView.activeSectionKey !== "inbox" ? (
          <div inert={commandPending ? true : undefined}>
            <AppShellPostaRail
              inboxView={inboxView}
              text={text}
              {...(onNavigate === undefined
                ? {}
                : { onOpen: () => onNavigate("inbox") })}
            />
          </div>
        ) : null}

        <div className="tls-app-shell-utilities">
          {saveLifecycle === undefined ? null : (
            <button
              aria-haspopup="dialog"
              className="tls-menu-button tls-app-shell-save"
              data-dirty={saveLifecycle.sessionStatus.dirty}
              data-state={commandPending ? "disabled" : "idle"}
              disabled={commandPending}
              type="button"
              onClick={() => setSaveDialogOpen(true)}
            >
              <span>{text("career.saveControl.title")}</span>
              <span className="tls-app-shell-save-state" aria-hidden="true" />
            </button>
          )}

          <button className="tls-menu-button tls-app-shell-menu" data-state={commandPending ? "disabled" : "idle"} disabled={commandPending} type="button" onClick={onBackToMenu}>
            {text("web.navigation.mainMenu")}
          </button>
        </div>
      </aside>

      <main
        className="tls-app-shell-main"
        data-content-layout={shellView.mode === "matchday" ? "full-width" : "standard"}
        id={CAREER_MAIN_FOCUS_ID}
        aria-label={text("career.shell.content")}
      >
        {storageRecovery?.failure === undefined ? null : (
          <section
            className="tls-storage-recovery"
            data-state="recovery"
            ref={recoveryRef}
            role="alert"
            tabIndex={-1}
          >
            <strong>{text("web.app.storage.error")}</strong>
            <p>{text(storageFailureLabelKey(storageRecovery.failure.code))}</p>
            <button className="tls-menu-button" data-state={commandPending ? "disabled" : "recovery"} disabled={commandPending} type="button" onClick={storageRecovery.onRetry}>
              {text("web.app.storage.retry")}
            </button>
          </section>
        )}
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="tls-app-shell-screen-transition"
          data-screen-key={`${shellView.activeSectionKey}:${shellView.mode}`}
          initial={{ opacity: 0.86, y: 4 }}
          key={`${shellView.activeSectionKey}:${shellView.mode}`}
          transition={webMotion.transition}
        >
          {children}
        </m.div>
      </main>

      {saveLifecycle === undefined ? null : (
        <CareerSaveDialog
          lifecycle={saveLifecycle}
          open={saveDialogOpen}
          text={text}
          onClose={() => setSaveDialogOpen(false)}
        />
      )}
    </div>
  );
}

/** Resolves one bounded persistence failure to localized recovery guidance. */
function storageFailureLabelKey(code: WebCareerPersistenceFailure["code"]): MessageKey {
  return `web.app.storage.error.${code}` as MessageKey;
}

function SidebarNavItem({
  item,
  text,
  onActivate,
}: Readonly<{
  item: SidebarItem;
  text: Translator;
  onActivate: () => void;
}>): React.JSX.Element {
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
    <button
      className="tls-app-shell-nav-item"
      data-current="false"
      data-status="available"
      type="button"
      onClick={onActivate}
    >
      {label}
    </button>
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
      isInteractive: shellItem.isInteractive,
      ...(shellItem.disabledReasonKey === undefined
        ? {}
        : { disabledReasonKey: shellItem.disabledReasonKey as MessageKey }),
    };
  });
}
