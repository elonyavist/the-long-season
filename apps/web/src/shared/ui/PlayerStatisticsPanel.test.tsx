import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlayerStatisticsPanel } from "./PlayerStatisticsPanel";

describe("PlayerStatisticsPanel", () => {
  it("renders current and career totals with independent visible coverage", () => {
    const markup = renderToStaticMarkup(
      <PlayerStatisticsPanel
        ariaLabel="Player statistics"
        periods={[
          {
            periodId: "currentSeason",
            label: "Current season",
            metrics: [
              { metricId: "appearances", label: "Appearances", value: "14" },
              { metricId: "averageRating", label: "Average rating", value: "7.21" },
            ],
            coverage: [
              {
                sourceId: "participation",
                label: "Participation coverage",
                status: "complete",
                statusLabel: "Complete",
              },
              {
                sourceId: "events",
                label: "Event coverage",
                status: "partial",
                statusLabel: "Partial",
              },
            ],
          },
          {
            periodId: "career",
            label: "Career",
            metrics: [
              { metricId: "appearances", label: "Appearances", value: "—" },
            ],
            coverage: [
              {
                sourceId: "participation",
                label: "Participation coverage",
                status: "unavailable",
                statusLabel: "Unavailable",
              },
            ],
          },
        ]}
      />,
    );

    expect(markup).toContain('aria-label="Player statistics"');
    expect(markup.match(/tls-player-statistics-period"/g) ?? []).toHaveLength(2);
    expect(markup).toContain("Current season");
    expect(markup).toContain("Career");
    expect(markup).toContain("<dd>14</dd>");
    expect(markup).toContain("<dd>7.21</dd>");
    expect(markup).toContain("<dd>—</dd>");
    expect(markup).toContain('data-coverage="complete"');
    expect(markup).toContain('data-coverage="partial"');
    expect(markup).toContain('data-coverage="unavailable"');
    expect(markup).toContain("Participation coverage");
    expect(markup).toContain("Event coverage");
  });

  it("does not invent unsupported statistics or implicit zeroes", () => {
    const markup = renderToStaticMarkup(
      <PlayerStatisticsPanel
        ariaLabel="Player statistics"
        periods={[
          {
            periodId: "career",
            label: "Career",
            metrics: [],
            coverage: [
              {
                sourceId: "events",
                label: "Event coverage",
                status: "unavailable",
                statusLabel: "Unavailable",
              },
            ],
          },
        ]}
      />,
    );

    expect(markup).not.toContain("Goals");
    expect(markup).not.toContain("<dd>0</dd>");
    expect(markup).toContain("Unavailable");
  });
});
