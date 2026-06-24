import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../../app/translation";
import { TacticalBoardMenu } from "./TacticalBoardMenu";

describe("TacticalBoardMenu", () => {
  it("renders assignment candidates with the shared player candidate row", () => {
    const markup = renderToStaticMarkup(
      React.createElement(TacticalBoardMenu, {
        candidates: [
          {
            player: {
              playerId: "player:one",
              number: 9,
              surname: "Rinaldi",
              formTrend: "flat",
              roleKey: "attacker",
              foot: "right",
            },
            suitability: "natural",
            fitness: 94,
          },
        ],
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("tls-player-candidate-row");
    expect(markup).toContain("data-suitability=\"natural\"");
    expect(markup).toContain("Rinaldi");
    expect(markup).toContain("attacker");
    expect(markup).toContain("94%");
    expect(markup).toContain("right");
    expect(markup).toContain("Natural");
  });

  it("renders a caller-specific remove action without role options", () => {
    const markup = renderToStaticMarkup(
      React.createElement(TacticalBoardMenu, {
        removeLabelKey: "career.tacticalBench.removeFromBench",
        text: createWebTranslator("en"),
        onRemove: () => {},
      }),
    );

    expect(markup).toContain("Remove from bench");
    expect(markup).not.toContain("Change role");
  });
});
