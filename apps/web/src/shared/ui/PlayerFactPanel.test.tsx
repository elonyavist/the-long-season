import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { PlayerFactPanel } from "./PlayerFactPanel";
import type { SquadSelectionRow } from "./SquadSelectionTable";

const ROW: SquadSelectionRow = {
  player: {
    playerId: "player:midfielder",
    name: "Giorgio Mazza",
    roleKey: "midfielder",
    positionKey: "cm",
    fitness: 91,
  },
  age: 24,
  foot: "left",
  status: "bench",
};

describe("PlayerFactPanel", () => {
  it("renders compact localized facts for the selected player", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerFactPanel, {
        row: ROW,
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("Player detail");
    expect(markup).toContain("Giorgio Mazza");
    expect(markup).toContain("bench");
    expect(markup).toContain("midfielder");
    expect(markup).toContain("24");
    expect(markup).toContain("91%");
    expect(markup).toContain("left");
  });

  it("renders a stable empty state when no player is focused", () => {
    const markup = renderToStaticMarkup(
      React.createElement(PlayerFactPanel, {
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("Player detail");
    expect(markup).toContain("unknown");
  });
});
