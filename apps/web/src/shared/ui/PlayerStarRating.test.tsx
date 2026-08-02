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

  // The generated world decides which ratings a screen actually shows, so the
  // browser suite can only assert that rendered glyphs agree with their own
  // `data-rating`. The complete per-value table is owned here instead.
  it.each([
    [1, ["full", "empty", "empty", "empty", "empty"]],
    [1.5, ["full", "half", "empty", "empty", "empty"]],
    [2, ["full", "full", "empty", "empty", "empty"]],
    [2.5, ["full", "full", "half", "empty", "empty"]],
    [3, ["full", "full", "full", "empty", "empty"]],
    [3.5, ["full", "full", "full", "half", "empty"]],
    [4, ["full", "full", "full", "full", "empty"]],
    [4.5, ["full", "full", "full", "full", "half"]],
    [5, ["full", "full", "full", "full", "full"]],
    [5.5, ["full", "full", "full", "full", "full", "half"]],
    [6, ["full", "full", "full", "full", "full", "full"]],
  ] as const)("renders %s as its exact glyph sequence", (stars, expectedFills) => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerStarRating, {
        rating: { stars },
        label: "Current level",
        text: createWebTranslator("en"),
      }),
    );

    const fills = [...markup.matchAll(/data-fill="(empty|half|full)"/g)].map((match) => match[1]);
    const sixthSlots = [...markup.matchAll(/data-sixth="true"/g)];

    expect(fills).toEqual([...expectedFills]);
    expect(sixthSlots).toHaveLength(stars > 5 ? 1 : 0);
    expect(markup).toContain(`data-rating="${Number.isInteger(stars) ? stars : stars.toFixed(1)}"`);
    expect(markup).toContain(
      `aria-label="Current level: ${Number.isInteger(stars) ? stars : stars.toFixed(1)} out of 6 stars"`,
    );
  });
});
