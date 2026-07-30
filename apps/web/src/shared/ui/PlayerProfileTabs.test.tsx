import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  nextPlayerProfileTabIndex,
  PlayerProfileTabs,
  type PlayerProfileTabItem,
} from "./PlayerProfileTabs";

type ProfileTabId = "attributes" | "statistics" | "contract";

const tabs: readonly PlayerProfileTabItem<ProfileTabId>[] = [
  { tabId: "attributes", label: "Attributes", panel: <p>Exact attributes</p> },
  { tabId: "statistics", label: "Statistics", panel: <p>Career totals</p> },
  { tabId: "contract", label: "Contract", panel: <input defaultValue="draft wage" /> },
];

describe("PlayerProfileTabs", () => {
  it("links one selected tab to its panel and keeps every panel mounted", () => {
    const markup = renderToStaticMarkup(
      <PlayerProfileTabs
        activeTabId="statistics"
        ariaLabel="Player information"
        tabs={tabs}
        onActiveTabChange={() => undefined}
      />,
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Player information"');
    expect(markup.match(/role="tab"/g) ?? []).toHaveLength(3);
    expect(markup.match(/role="tabpanel"/g) ?? []).toHaveLength(3);
    expect(markup.match(/aria-selected="true"/g) ?? []).toHaveLength(1);
    expect(markup.match(/hidden=""/g) ?? []).toHaveLength(2);
    expect(markup).toContain("Exact attributes");
    expect(markup).toContain("Career totals");
    expect(markup).toContain('value="draft wage"');
    expect(markup).toMatch(
      /aria-controls="([^"]+)" aria-selected="true"[^>]*id="([^"]+)"/,
    );
    expect(markup).toMatch(/aria-labelledby="[^"]+"[^>]*role="tabpanel"/);
  });

  it("wraps arrows and supports Home and End without handling unrelated keys", () => {
    expect(nextPlayerProfileTabIndex(3, 0, "ArrowRight")).toBe(1);
    expect(nextPlayerProfileTabIndex(3, 2, "ArrowRight")).toBe(0);
    expect(nextPlayerProfileTabIndex(3, 0, "ArrowLeft")).toBe(2);
    expect(nextPlayerProfileTabIndex(3, 1, "Home")).toBe(0);
    expect(nextPlayerProfileTabIndex(3, 1, "End")).toBe(2);
    expect(nextPlayerProfileTabIndex(3, 1, "Enter")).toBeUndefined();
    expect(nextPlayerProfileTabIndex(0, 0, "ArrowRight")).toBeUndefined();
  });
});
