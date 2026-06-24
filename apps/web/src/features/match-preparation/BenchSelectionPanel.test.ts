import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildDemoMatchPreparationView,
  createInitialDemoMatchPreparationState,
} from "./match-preparation-demo";
import { BenchSelectionPanel } from "./BenchSelectionPanel";

describe("BenchSelectionPanel", () => {
  it("renders ordered substitute slots with player selects", () => {
    const view = buildDemoMatchPreparationView(createInitialDemoMatchPreparationState());
    const markup = renderToStaticMarkup(
      React.createElement(BenchSelectionPanel, {
        slots: view.bench.slots,
        selectedSlotCount: view.bench.selectedSlotCount,
        requiredSlotCount: view.bench.requiredSlotCount,
        text: createWebTranslator("en"),
        onBenchPlayerChange: () => undefined,
      }),
    );

    expect(markup).toContain("Substitutes");
    expect(markup).toContain("Selected substitutes: 0/8");
    expect(markup.split("class=\"tls-preparation-bench-slot\"").length - 1).toBe(8);
    expect(markup).toContain("Select player");
  });
});
