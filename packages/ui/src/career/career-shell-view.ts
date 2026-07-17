import type { CareerInboxView } from "./career-inbox-view.ts";

/** Stable section keys used by the top career navigation shell. */
export type CareerShellSectionKey =
  | "dashboard"
  | "inbox"
  | "squad"
  | "tactics"
  | "fixtures"
  | "market"
  | "finances"
  | "facilities"
  | "youth"
  | "staff"
  | "archive";

/** Availability status for a top navigation section. */
export type CareerShellNavigationStatus = "available" | "disabled";

/** Shell mode controls global chrome around focused manager workspaces. */
export type CareerShellMode = "standard" | "preparation" | "matchday";

/** Input shape for one top navigation item in the career shell. */
export interface CareerShellNavigationItemInput {
  /** Stable section key used by adapters to choose the central screen. */
  readonly sectionKey: CareerShellSectionKey;
  /** Localization key for the visible navigation label. */
  readonly labelKey: string;
  /** Whether the section can currently be opened. */
  readonly status: CareerShellNavigationStatus;
  /** Optional localization key explaining why a section is disabled. */
  readonly disabledReasonKey?: string;
}

/** UI-facing top navigation item with derived current-section state. */
export interface CareerShellNavigationItemView extends CareerShellNavigationItemInput {
  /** Whether this item is the active selected section. */
  readonly isCurrent: boolean;
  /** Whether the renderer should expose this item as an interactive control. */
  readonly isInteractive: boolean;
}

/** Compact Inbox/Posta rail state for the career shell. */
export interface CareerShellInboxRailView {
  /** Stable shell area key for tests and renderers. */
  readonly areaKey: "career.shell.inboxRail";
  /** Localization key for the rail accessible name. */
  readonly ariaLabelKey: string;
  /** Ordered Inbox/Posta messages for the rail. */
  readonly inboxView: CareerInboxView;
  /** Whether the rail contains unresolved action-required messages. */
  readonly hasActionRequiredMessages: boolean;
}

/** UI-facing career shell view consumed by browser adapters. */
export interface CareerShellView {
  /** Stable view key for the reusable career shell. */
  readonly viewKey: "career.shell";
  /** Top navigation items in renderer order. */
  readonly navigationItems: readonly CareerShellNavigationItemView[];
  /** Active selected section key. */
  readonly activeSectionKey: CareerShellSectionKey;
  /** Section currently rendered in the central content outlet. */
  readonly centralContentSectionKey: CareerShellSectionKey;
  /** Persistent left Inbox/Posta rail state. */
  readonly inboxRail: CareerShellInboxRailView;
  /** Current shell mode used to hide unrelated global chrome. */
  readonly mode: CareerShellMode;
  /** Whether the Inbox/Posta rail should be rendered. */
  readonly showInboxRail: boolean;
  /** Whether the global Continue action should be rendered. */
  readonly showGlobalContinue: boolean;
}

/** Input for building the framework-free career shell view. */
export interface BuildCareerShellViewInput {
  /** Section selected by the current screen state. */
  readonly activeSectionKey: CareerShellSectionKey;
  /** Inbox/Posta view already built from structured message input. */
  readonly inboxView: CareerInboxView;
  /** Optional shell mode. Defaults to the normal career dashboard shell. */
  readonly mode?: CareerShellMode;
  /** Optional custom navigation definition. Defaults to the current shell map. */
  readonly navigationItems?: readonly CareerShellNavigationItemInput[];
}

const DEFAULT_NAVIGATION_ITEMS: readonly CareerShellNavigationItemInput[] = [
  { sectionKey: "dashboard", labelKey: "career.shell.nav.dashboard", status: "available" },
  { sectionKey: "inbox", labelKey: "career.shell.nav.inbox", status: "available" },
  { sectionKey: "squad", labelKey: "career.shell.nav.squad", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "tactics", labelKey: "career.shell.nav.tactics", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "fixtures", labelKey: "career.shell.nav.fixtures", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "market", labelKey: "career.shell.nav.market", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "finances", labelKey: "career.shell.nav.finances", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "facilities", labelKey: "career.shell.nav.facilities", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "youth", labelKey: "career.shell.nav.youth", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "staff", labelKey: "career.shell.nav.staff", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
  { sectionKey: "archive", labelKey: "career.shell.nav.archive", status: "disabled", disabledReasonKey: "career.shell.disabled.futurePhase" },
];

/**
 * Builds the stable career shell read model used by web or future adapters.
 *
 * The shell builder keeps layout meaning out of React components: adapters get
 * ordered navigation, current-section state, and Inbox rail state as structured
 * keys without rendered prose.
 */
export function buildCareerShellView(input: BuildCareerShellViewInput): CareerShellView {
  const navigationItems = input.navigationItems ?? DEFAULT_NAVIGATION_ITEMS;
  const mode = input.mode ?? "standard";
  const modeConfig = shellModeConfig(mode);

  return {
    viewKey: "career.shell",
    navigationItems: navigationItems.map((item) => ({
      ...item,
      isCurrent: item.status === "available" && item.sectionKey === input.activeSectionKey,
      isInteractive: item.status === "available",
    })),
    activeSectionKey: input.activeSectionKey,
    centralContentSectionKey: input.activeSectionKey,
    inboxRail: {
      areaKey: "career.shell.inboxRail",
      ariaLabelKey: "career.inbox.title",
      inboxView: input.inboxView,
      hasActionRequiredMessages: input.inboxView.actionRequiredCount > 0,
    },
    mode,
    showInboxRail: modeConfig.showInboxRail,
    showGlobalContinue: modeConfig.showGlobalContinue,
  };
}

function shellModeConfig(mode: CareerShellMode): Readonly<{
  showInboxRail: boolean;
  showGlobalContinue: boolean;
}> {
  if (mode === "matchday") {
    return { showInboxRail: false, showGlobalContinue: false };
  }

  if (mode === "preparation") {
    return { showInboxRail: true, showGlobalContinue: false };
  }

  return { showInboxRail: true, showGlobalContinue: true };
}
