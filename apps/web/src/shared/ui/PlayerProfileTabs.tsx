import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type PlayerProfileTabOrientation = "horizontal" | "vertical";

/** One localized panel in the shared Squad and Market player workspace. */
export interface PlayerProfileTabItem<TabId extends string> {
  /** Stable presentation identifier used by the controlled parent. */
  readonly tabId: TabId;
  /** Localized visible tab label. */
  readonly label: string;
  /** Panel content. Every panel stays mounted so form drafts survive tab changes. */
  readonly panel: ReactNode;
}

/** Props for the controlled, presentation-only player workspace tabs. */
export interface PlayerProfileTabsProps<TabId extends string> {
  /** Currently visible tab. */
  readonly activeTabId: TabId;
  /** Localized accessible name for the tab list. */
  readonly ariaLabel: string;
  /** Ordered tabs exposed by the current player workspace. */
  readonly tabs: readonly PlayerProfileTabItem<TabId>[];
  /** Called after pointer or keyboard activation selects another tab. */
  readonly onActiveTabChange: (tabId: TabId) => void;
}

/**
 * Renders controlled WAI-ARIA tabs while keeping every panel mounted.
 *
 * Arrow keys wrap through the ordered tabs and activate on focus. Home and End
 * jump to the first and last tab respectively.
 */
export function PlayerProfileTabs<TabId extends string>({
  activeTabId,
  ariaLabel,
  tabs,
  onActiveTabChange,
}: PlayerProfileTabsProps<TabId>): React.JSX.Element {
  const instanceId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const orientation = usePlayerProfileTabOrientation();
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.tabId === activeTabId));
  const activeTab = tabs[activeIndex];

  if (activeTab === undefined) {
    throw new Error("PlayerProfileTabs requires at least one tab");
  }

  const activateAndFocus = (index: number): void => {
    const tab = tabs[index];
    if (tab === undefined) return;

    onActiveTabChange(tab.tabId);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ): void => {
    const nextIndex = nextPlayerProfileTabIndex(
      tabs.length,
      currentIndex,
      event.key,
      orientation,
    );
    if (nextIndex === undefined) return;

    event.preventDefault();
    activateAndFocus(nextIndex);
  };

  return (
    <div className="tls-player-profile-tabs">
      <div
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className="tls-player-profile-tab-list"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const tabDomId = `${instanceId}-player-tab-${index}`;
          const panelDomId = `${instanceId}-player-panel-${index}`;

          return (
            <button
              aria-controls={panelDomId}
              aria-selected={isActive}
              className="tls-player-profile-tab"
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            aria-labelledby={`${instanceId}-player-tab-${index}`}
            className="tls-player-profile-tab-panel"
            hidden={!isActive}
            id={`${instanceId}-player-panel-${index}`}
            key={tab.tabId}
            role="tabpanel"
            tabIndex={isActive ? 0 : undefined}
          >
            {tab.panel}
          </div>
        );
      })}
    </div>
  );
}

/** Returns the next tab index for the supported WAI-ARIA keyboard commands. */
export function nextPlayerProfileTabIndex(
  tabCount: number,
  currentIndex: number,
  key: string,
  orientation: PlayerProfileTabOrientation = "horizontal",
): number | undefined {
  if (!Number.isSafeInteger(tabCount) || tabCount <= 0) return undefined;
  if (key === "Home") return 0;
  if (key === "End") return tabCount - 1;
  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  if (key !== previousKey && key !== nextKey) return undefined;

  const safeCurrentIndex = currentIndex >= 0 && currentIndex < tabCount
    ? currentIndex
    : 0;
  const direction = key === nextKey ? 1 : -1;
  return (safeCurrentIndex + direction + tabCount) % tabCount;
}

/**
 * Mirrors the CSS breakpoint so the tab keyboard model matches its layout.
 *
 * Server-side test rendering keeps the desktop default; the browser then
 * follows viewport changes through the same 620 px media query as the styles.
 */
function usePlayerProfileTabOrientation(): PlayerProfileTabOrientation {
  const query = "(max-width: 620px)";
  const [orientation, setOrientation] = useState<PlayerProfileTabOrientation>(
    () => (
      typeof window !== "undefined" && window.matchMedia(query).matches
        ? "vertical"
        : "horizontal"
    ),
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const synchronize = (): void => {
      setOrientation(media.matches ? "vertical" : "horizontal");
    };
    synchronize();
    media.addEventListener("change", synchronize);
    return () => media.removeEventListener("change", synchronize);
  }, []);

  return orientation;
}
