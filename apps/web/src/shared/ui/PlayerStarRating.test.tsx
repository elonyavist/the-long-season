import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { PlayerStarRating } from "./PlayerStarRating";

describe("PlayerStarRating", () => {
  it("renders an accessible five-star half-rating without hidden ability data", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerStarRating, {
        rating: { stars: 3.5 },
        label: "Current level",
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain('aria-label="Current level: 3.5 out of 6 stars"');
    expect(markup).toContain('data-rating="3.5"');
    expect(markup.match(/data-fill=/g)).toHaveLength(5);
    expect(markup).toContain('data-fill="half"');
    expect(markup).not.toContain("sixth");
    expect(markup).not.toContain("Ability");
  });

  it("renders half and full dark-orange sixth stars for 5.5 and 6", () => {
    const halfMarkup = renderToStaticMarkup(
      React.createElement(PlayerStarRating, {
        rating: { stars: 5.5 },
        label: "Potenziale",
        text: createWebTranslator("it"),
      }),
    );
    const fullMarkup = renderToStaticMarkup(
      React.createElement(PlayerStarRating, {
        rating: { stars: 6 },
        label: "Potential",
        text: createWebTranslator("en"),
      }),
    );

    expect(halfMarkup).toContain(
      'aria-label="Potenziale: 5.5 stelle su 6"',
    );
    expect(halfMarkup).toContain('data-rating="5.5"');
    expect(halfMarkup).toContain('data-fill="half" data-sixth="true"');
    expect(halfMarkup.match(/<svg/g)).toHaveLength(12);
    expect(fullMarkup).toContain('aria-label="Potential: 6 out of 6 stars"');
    expect(fullMarkup).toContain('data-rating="6"');
    expect(fullMarkup).toContain('data-fill="full" data-sixth="true"');
  });
});
