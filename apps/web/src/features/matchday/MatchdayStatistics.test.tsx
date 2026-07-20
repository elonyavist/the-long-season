import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import type { MatchdayStatisticsView } from "./career-matchday-presenter";
import { MatchdayStatistics } from "./MatchdayStatistics";

const view: MatchdayStatisticsView = {
  homeClubName: "U.S. Pisa",
  awayClubName: "S.S. Perugia",
  metrics: [
    {
      metricId: "possessionShare",
      labelKey: "career.matchday.statistics.possessionShare",
      format: "percent",
      homeValue: 0.58,
      awayValue: 0.42,
      homeBarPercent: 58,
      awayBarPercent: 42,
      compact: true,
    },
    {
      metricId: "yellowCards",
      labelKey: "career.matchday.statistics.yellowCards",
      format: "integer",
      homeValue: 1,
      awayValue: 2,
      homeBarPercent: 33.333,
      awayBarPercent: 66.667,
      compact: false,
    },
  ],
};

describe("MatchdayStatistics", () => {
  it("renders accessible comparative bars without a wide table", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayStatistics, {
        view,
        text: createWebTranslator("en"),
        mode: "complete",
      }),
    );

    expect(markup).toContain('aria-label="Match statistics"');
    expect(markup).toContain("U.S. Pisa");
    expect(markup).toContain("S.S. Perugia");
    expect(markup).toContain("tls-match-statistics-versus");
    expect(markup.match(/tls-match-statistic-row/g) ?? []).toHaveLength(2);
    expect(markup).toContain("58%");
    expect(markup).toContain("42%");
    expect(markup).toContain('aria-label="Possession: 58% home, 42% away"');
    expect(markup).toContain("Yellow cards");
    expect(markup).not.toContain("<table");
  });

  it("keeps only the documented compact metrics in the live summary", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayStatistics, {
        view,
        text: createWebTranslator("en"),
        mode: "compact",
      }),
    );

    expect(markup).toContain("Possession");
    expect(markup).not.toContain("Yellow cards");
    expect(markup).not.toContain("tls-match-statistics-clubs");
  });
});
