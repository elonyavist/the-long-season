import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlayerCandidateRow } from "./PlayerCandidateRow";

describe("PlayerCandidateRow", () => {
  it("renders the compact candidate facts and suitability tone", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerCandidateRow, {
        number: 9,
        surname: "Rinaldi",
        roleLabel: "attacker",
        fitnessText: "94%",
        footLabel: "right",
        suitabilityLabel: "Natural",
        suitabilityTone: "natural",
      }),
    );

    expect(markup).toContain("tls-player-candidate-row");
    expect(markup).toContain("data-suitability=\"natural\"");
    expect(markup).toContain("tls-player-candidate-fitness");
    expect(markup).toContain("tls-player-candidate-foot");
    expect(markup).toContain(">9<");
    expect(markup).toContain("Rinaldi");
    expect(markup).toContain("attacker");
    expect(markup).toContain("94%");
    expect(markup).toContain("right");
    expect(markup).toContain("Natural");
    expect(markup).toContain("aria-label=\"9 Rinaldi attacker 94% right Natural\"");
  });
});
