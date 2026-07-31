import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { PlayerPotentialRangeRating } from "./PlayerPotentialRangeRating";

describe("PlayerPotentialRangeRating", () => {
  it("renders six stable slots with half-star conservative and patterned uncertainty states", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        currentRating: { stars: 3 },
        range: { lowerStars: 3.5, upperStars: 5 },
        language: "it",
        text: createWebTranslator("it"),
      }),
    );

    expect(markup).toContain(
      "Livello attuale: 3 stelle. Potenziale stimato da 3,5 a 5 stelle. Fascia incerta: 1,5 stelle.",
    );
    expect(markup).toContain('data-current="3"');
    expect(markup).toContain('data-lower="3.5"');
    expect(markup).toContain('data-upper="5"');
    expect(markup.match(/class="tls-player-potential-star"/g)).toHaveLength(6);
    expect(markup).toContain(
      'data-achieved="full" data-conservative-future="none" data-uncertain-future="none"',
    );
    expect(markup).toContain(
      'data-achieved="none" data-conservative-future="half" data-uncertain-future="half"',
    );
    expect(markup).toContain('data-uncertain-future="full"');
    expect(markup).toContain('data-sixth="true" data-within-ceiling="false"');
    expect(markup).not.toContain("ability");
  });

  it("renders a singular assessment without an empty uncertainty claim", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        currentRating: { stars: 5.5 },
        range: { lowerStars: 5.5, upperStars: 5.5 },
        language: "en",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain(
      "Current level: 5.5 stars. Estimated potential: 5.5 out of 6 stars.",
    );
    expect(markup).not.toContain("Uncertain band");
    expect(markup).not.toContain('data-uncertain-future="half"');
    expect(markup).toContain('data-sixth="true" data-within-ceiling="true"');
  });

  it("keeps uncertain exceptional upside distinct in DOM state", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        currentRating: { stars: 4 },
        range: { lowerStars: 4, upperStars: 6 },
        language: "en",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain(
      "Current level: 4 stars. Estimated potential from 4 to 6 stars. Uncertain band: 2 stars.",
    );
    expect(markup).toContain('data-sixth="true" data-within-ceiling="true"');
    expect(markup.match(/data-uncertain-future="full"/g)).toHaveLength(2);
    expect(markup).toContain("tls-player-potential-star-achieved");
    expect(markup).toContain("tls-player-potential-star-uncertain-future-base");
    expect(markup).toContain("tls-player-potential-star-uncertain-future");
    expect(
      markup.indexOf("tls-player-potential-star-outline"),
    ).toBeLessThan(markup.indexOf("tls-player-potential-star-achieved"));
  });
});
