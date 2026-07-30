import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { PlayerPotentialRangeRating } from "./PlayerPotentialRangeRating";

describe("PlayerPotentialRangeRating", () => {
  it("renders six stable slots with half-star conservative and patterned uncertainty states", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        range: { lowerStars: 3.5, upperStars: 5 },
        language: "it",
        text: createWebTranslator("it"),
      }),
    );

    expect(markup).toContain(
      "Potenziale stimato da 3,5 a 5 stelle. Fascia incerta: 1,5 stelle.",
    );
    expect(markup).toContain('data-lower="3.5"');
    expect(markup).toContain('data-upper="5"');
    expect(markup.match(/class="tls-player-potential-star"/g)).toHaveLength(6);
    expect(markup).toContain('data-conservative="half" data-uncertain="half"');
    expect(markup).toContain('data-uncertain="full"');
    expect(markup).toContain('data-sixth="true" data-within-ceiling="false"');
    expect(markup).not.toContain("ability");
  });

  it("renders a singular assessment without an empty uncertainty claim", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        range: { lowerStars: 5.5, upperStars: 5.5 },
        language: "en",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("Estimated potential: 5.5 out of 6 stars.");
    expect(markup).not.toContain("Uncertain band");
    expect(markup).not.toContain('data-uncertain="half"');
    expect(markup).toContain('data-sixth="true" data-within-ceiling="true"');
  });

  it("keeps uncertain exceptional upside distinct in DOM state", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerPotentialRangeRating, {
        range: { lowerStars: 4, upperStars: 6 },
        language: "en",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain(
      "Estimated potential from 4 to 6 stars. Uncertain band: 2 stars.",
    );
    expect(markup).toContain('data-sixth="true" data-within-ceiling="true"');
    expect(markup.match(/data-uncertain="full"/g)).toHaveLength(2);
  });
});
