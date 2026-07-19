import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  MatchdayPhaseTabs,
  nextMatchdayPhaseTabIndex,
  type MatchdayPhaseTabItem,
} from "./MatchdayPhaseTabs";

const tabs: readonly MatchdayPhaseTabItem<"summary" | "tactics" | "team" | "opponent">[] = [
  { tabId: "summary", label: "Summary", panel: <p>Summary facts</p> },
  { tabId: "tactics", label: "Tactics", panel: <p>Tactical plan</p> },
  { tabId: "team", label: "Your team", panel: <p>Team ratings</p> },
  { tabId: "opponent", label: "Opponent", panel: <p>Opponent ratings</p> },
];

describe("MatchdayPhaseTabs", () => {
  it("renders one labelled tab list and only the active panel", () => {
    const markup = renderToStaticMarkup(
      <MatchdayPhaseTabs
        activeTabId="summary"
        ariaLabel="Half-time views"
        tabs={tabs}
        onActiveTabChange={() => undefined}
      />,
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Half-time views"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(4);
    expect(markup.match(/aria-selected="true"/g) ?? []).toHaveLength(1);
    expect(markup.match(/role="tabpanel"/g) ?? []).toHaveLength(1);
    expect(markup).toContain('data-motion-active="false"');
    expect(markup).toContain('data-motion-tab-panel="summary"');
    expect(markup).toContain("Summary facts");
    expect(markup).not.toContain("Tactical plan");
  });

  it("cycles enabled tabs and skips unavailable views deterministically", () => {
    const withDisabledTeam = tabs.map((tab) => tab.tabId === "team" ? { ...tab, disabled: true } : tab);

    expect(nextMatchdayPhaseTabIndex(withDisabledTeam, 0, "ArrowRight")).toBe(1);
    expect(nextMatchdayPhaseTabIndex(withDisabledTeam, 1, "ArrowRight")).toBe(3);
    expect(nextMatchdayPhaseTabIndex(withDisabledTeam, 0, "ArrowLeft")).toBe(3);
    expect(nextMatchdayPhaseTabIndex(withDisabledTeam, 1, "Home")).toBe(0);
    expect(nextMatchdayPhaseTabIndex(withDisabledTeam, 1, "End")).toBe(3);
    expect(nextMatchdayPhaseTabIndex(withDisabledTeam, 1, "Enter")).toBeUndefined();
  });
});
