import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { SquadSelectionTable, type SquadSelectionRow } from "./SquadSelectionTable";

const ROWS: readonly SquadSelectionRow[] = [
  {
    player: {
      playerId: "player:keeper",
      name: "Davide Valentini",
      roleKey: "goalkeeper",
      positionKey: "gk",
      fitness: 100,
    },
    age: 28,
    foot: "right",
    status: "selected",
  },
  {
    player: {
      playerId: "player:striker",
      name: "Nico Rinaldi",
      roleKey: "attacker",
      positionKey: "st",
      fitness: 94,
    },
    age: 25,
    foot: "right",
    status: "available",
  },
];

describe("SquadSelectionTable", () => {
  it("renders the reusable sortable squad table", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SquadSelectionTable, {
        rows: ROWS,
        selectedPlayerId: "player:keeper",
        text: createWebTranslator("en"),
        onPlayerSelect: () => undefined,
      }),
    );

    expect(markup).toContain("tls-preparation-squad-table");
    expect(markup).toContain("Davide Valentini");
    expect(markup).toContain("Nico Rinaldi");
    expect(markup).toContain("aria-sort=\"ascending\"");
  });
});
