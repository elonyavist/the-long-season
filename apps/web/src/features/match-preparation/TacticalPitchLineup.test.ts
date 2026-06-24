import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  buildDemoMatchPreparationView,
  createInitialDemoMatchPreparationState,
  selectDemoMatchPreparationFormation,
} from "./match-preparation-demo";
import { TacticalPitchLineup } from "./TacticalPitchLineup";

describe("TacticalPitchLineup", () => {
  it("renders one reusable pitch slot per lineup slot", () => {
    const view = buildDemoMatchPreparationView(createInitialDemoMatchPreparationState());
    const markup = renderToStaticMarkup(
      React.createElement(TacticalPitchLineup, {
        slots: view.lineup.slots,
        text: createWebTranslator("en"),
        onLineupPlayerChange: () => undefined,
      }),
    );

    expect(markup.split("class=\"tls-preparation-slot\"").length - 1).toBe(view.lineup.slots.length);
    expect(markup).toContain("tls-preparation-pitch");
    expect(markup).toContain("data-pitch-asset=\"campo-calcio.svg\"");
    expect(markup).not.toContain("tls-preparation-pitch-markings");
    expect(markup).toContain("Player");
  });

  it("renders alternate formation slots with reusable pitch coordinates", () => {
    const state = selectDemoMatchPreparationFormation(createInitialDemoMatchPreparationState(), "4-2-3-1");
    const view = buildDemoMatchPreparationView(state);
    const markup = renderToStaticMarkup(
      React.createElement(TacticalPitchLineup, {
        slots: view.lineup.slots,
        text: createWebTranslator("en"),
        onLineupPlayerChange: () => undefined,
      }),
    );

    expect(markup).toContain("data-slot=\"dm-right\"");
    expect(markup).toContain("data-slot=\"rw\"");
    expect(markup).toContain("--tls-slot-column");
    expect(markup.split("class=\"tls-preparation-slot\"").length - 1).toBe(11);
  });

  it("renders the three-six-one shape without local screen-specific slot logic", () => {
    const state = selectDemoMatchPreparationFormation(createInitialDemoMatchPreparationState(), "3-6-1");
    const view = buildDemoMatchPreparationView(state);
    const markup = renderToStaticMarkup(
      React.createElement(TacticalPitchLineup, {
        slots: view.lineup.slots,
        text: createWebTranslator("en"),
        onLineupPlayerChange: () => undefined,
      }),
    );

    expect(markup).toContain("data-slot=\"dm\"");
    expect(markup).toContain("data-slot=\"rm\"");
    expect(markup).toContain("data-slot=\"lm\"");
    expect(markup.split("class=\"tls-preparation-slot\"").length - 1).toBe(11);
  });
});
