import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";

/** One current Matchday view exposed by the phase-local tab shell. */
export interface MatchdayPhaseTabItem<TabId extends string> {
  /** Stable presentation-only identifier. */
  readonly tabId: TabId;
  /** Localized visible label. */
  readonly label: string;
  /** Small semantic icon that reinforces the visible label without replacing it. */
  readonly icon?: LucideIcon;
  /** Current panel content. */
  readonly panel: ReactNode;
  /** Temporarily unavailable views remain discoverable but cannot receive focus. */
  readonly disabled?: boolean;
}

/** Props for the accessible, controlled Matchday tab composition. */
export interface MatchdayPhaseTabsProps<TabId extends string> {
  readonly activeTabId: TabId;
  readonly ariaLabel: string;
  readonly tabs: readonly MatchdayPhaseTabItem<TabId>[];
  readonly onActiveTabChange: (tabId: TabId) => void;
}

/**
 * Renders one phase-local tab list without owning gameplay or durable state.
 * Arrow, Home, and End keys use automatic activation so the focused panel and
 * the visible panel cannot diverge.
 */
export function MatchdayPhaseTabs<TabId extends string>({
  activeTabId,
  ariaLabel,
  tabs,
  onActiveTabChange,
}: MatchdayPhaseTabsProps<TabId>): React.JSX.Element {
  const instanceId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTab = tabs.find((tab) => tab.tabId === activeTabId && tab.disabled !== true)
    ?? tabs.find((tab) => tab.disabled !== true);
  const reducedMotion = useReducedMotion();
  const previousActiveTabId = useRef<TabId | undefined>(activeTab?.tabId);
  const tabChanged = activeTab !== undefined
    && previousActiveTabId.current !== activeTab.tabId;

  useEffect(() => {
    previousActiveTabId.current = activeTab?.tabId;
  }, [activeTab?.tabId]);

  if (activeTab === undefined) {
    throw new Error("MatchdayPhaseTabs requires at least one enabled tab");
  }

  const activateAndFocus = (index: number): void => {
    const tab = tabs[index];
    if (tab === undefined || tab.disabled === true) return;

    onActiveTabChange(tab.tabId);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const nextIndex = nextMatchdayPhaseTabIndex(tabs, index, event.key);
    if (nextIndex === undefined) return;

    event.preventDefault();
    activateAndFocus(nextIndex);
  };

  return (
    <div className="tls-match-phase-tabs">
      <div className="tls-match-phase-tab-list" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => {
          const isActive = tab.tabId === activeTab.tabId;
          const TabIcon = tab.icon;
          const tabDomId = `${instanceId}-tab-${tab.tabId}`;
          const panelDomId = `${instanceId}-panel-${tab.tabId}`;

          return (
            <button
              aria-controls={panelDomId}
              aria-selected={isActive}
              className="tls-match-phase-tab"
              disabled={tab.disabled}
              id={tabDomId}
              key={tab.tabId}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => activateAndFocus(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {TabIcon === undefined ? null : (
                <TabIcon
                  aria-hidden="true"
                  className="tls-match-phase-tab-icon"
                  focusable="false"
                  size={15}
                  strokeWidth={1.8}
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <m.div
        animate={webMotionTargets.rest}
        aria-labelledby={`${instanceId}-tab-${activeTab.tabId}`}
        className="tls-match-phase-tab-panel"
        data-motion-active={tabChanged && !reducedMotion}
        data-motion-tab-panel={activeTab.tabId}
        id={`${instanceId}-panel-${activeTab.tabId}`}
        initial={tabChanged && !reducedMotion ? webMotionTargets.matchTabPanelEnter : false}
        key={activeTab.tabId}
        role="tabpanel"
        tabIndex={0}
        transition={webMotion.transition}
      >
        {activeTab.panel}
      </m.div>
    </div>
  );
}

/** Returns the next enabled tab index for the supported tab-list keys. */
export function nextMatchdayPhaseTabIndex<TabId extends string>(
  tabs: readonly MatchdayPhaseTabItem<TabId>[],
  currentIndex: number,
  key: string,
): number | undefined {
  const enabledIndices = tabs.flatMap((tab, index) => tab.disabled === true ? [] : [index]);
  if (enabledIndices.length === 0) return undefined;

  if (key === "Home") return enabledIndices[0];
  if (key === "End") return enabledIndices.at(-1);
  if (key !== "ArrowLeft" && key !== "ArrowRight") return undefined;

  const currentEnabledIndex = Math.max(0, enabledIndices.indexOf(currentIndex));
  const direction = key === "ArrowRight" ? 1 : -1;
  const nextEnabledIndex = (currentEnabledIndex + direction + enabledIndices.length) % enabledIndices.length;
  return enabledIndices[nextEnabledIndex];
}
