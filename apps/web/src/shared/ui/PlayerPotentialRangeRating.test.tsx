import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { PlayerPotentialRangeRating } from "./PlayerPotentialRangeRating";

describe("PlayerPotentialRangeRating", () => {
  it("renders six stable slots with half-star probable and patterned uncertainty states", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        currentRating: { stars: 3 },
        range: { p50Stars: 3.5, upperStars: 5 },
        language: "it",
        text: createWebTranslator("it"),
      }),
    );

    expect(markup).toContain(
      "Livello attuale: 3 su una scala di 6 stelle. Stima mediana del potenziale (P50, non garantita): 3,5 su 6. Limite superiore raggiungibile stimato: 5 su 6. Crescita incerta oltre il P50: 1,5 sulla scala a 6 stelle.",
    );
    expect(markup).toContain('data-current="3"');
    expect(markup).toContain('data-p50="3.5"');
    expect(markup).toContain('data-upper="5"');
    expect(markup.match(/class="tls-player-potential-star"/g)).toHaveLength(6);
    expect(markup).toContain(
      'data-achieved="full" data-probable-future="none" data-uncertain-future="none"',
    );
    expect(markup).toContain(
      'data-achieved="none" data-probable-future="half" data-uncertain-future="half"',
    );
    expect(markup).toContain('data-uncertain-future="full"');
    expect(markup).toContain('data-sixth="true" data-within-upper="false"');
    expect(markup).not.toContain("ability");
  });

  it("renders a singular assessment without an empty uncertainty claim", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        currentRating: { stars: 5.5 },
        range: { p50Stars: 5.5, upperStars: 5.5 },
        language: "en",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain(
      "Current level: 5.5 out of 6 stars. Median potential estimate (P50, not guaranteed): 5.5 out of 6. Estimated reachable upper: 5.5 out of 6.",
    );
    expect(markup).not.toContain("Uncertain band");
    expect(markup).not.toContain('data-uncertain-future="half"');
    expect(markup).toContain('data-sixth="true" data-within-upper="true"');
  });

  it("keeps uncertain exceptional upside distinct in DOM state", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        currentRating: { stars: 4 },
        range: { p50Stars: 5, upperStars: 6 },
        language: "en",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain(
      "Current level: 4 out of 6 stars. Median potential estimate (P50, not guaranteed): 5 out of 6. Estimated reachable upper: 6 out of 6. Uncertain upside above P50: 1 on the six-star scale.",
    );
    expect(markup).toContain('data-sixth="true" data-within-upper="true"');
    expect(markup.match(/data-probable-future="full"/g)).toHaveLength(1);
    expect(markup.match(/data-uncertain-future="full"/g)).toHaveLength(1);
    expect(markup).toContain("tls-player-potential-star-achieved");
    expect(markup).toContain("tls-player-potential-star-probable-future");
    expect(markup).toContain("tls-player-potential-star-uncertain-future-base");
    expect(markup).toContain("tls-player-potential-star-uncertain-future");
    expect(
      markup.indexOf("tls-player-potential-star-outline"),
    ).toBeLessThan(markup.indexOf("tls-player-potential-star-achieved"));
  });
});
