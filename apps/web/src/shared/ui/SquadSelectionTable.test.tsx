import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import {
  filterSquadSelectionRows,
  sortSquadSelectionRows,
  SquadSelectionTable,
  type SquadSelectionRow,
} from "./SquadSelectionTable";

const ROWS: readonly SquadSelectionRow[] = [
  {
    player: {
      playerId: "player:keeper",
      name: "Davide Valentini",
      roleKey: "goalkeeper",
      positionKey: "gk",
      number: 1,
      fitness: 100,
    },
    age: 28,
    foot: "right",
    status: "selected",
  },
  {
    player: {
      playerId: "player:defender",
      name: "Luca Franchi",
      roleKey: "defender",
      positionKey: "cb",
      number: 4,
    },
    age: 23,
    foot: "left",
    status: "bench",
  },
  {
    player: {
      playerId: "player:midfielder",
      name: "Giorgio Mazza",
      roleKey: "midfielder",
      positionKey: "cm",
      number: 8,
      fitness: 80,
    },
    status: "available",
  },
  {
    player: {
      playerId: "player:striker",
      name: "Nico Rinaldi",
      roleKey: "attacker",
      positionKey: "st",
      number: 9,
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
    expect(markup).toContain("tls-visually-hidden");
    expect(markup).toContain("Davide Valentini");
    expect(markup).toContain("Nico Rinaldi");
    expect(markup).toContain("Luca Franchi");
    expect(markup).toContain("POR");
    expect(markup).toContain("DC");
    expect(markup).toContain("CC");
    expect(markup).toContain("ATT");
    expect(markup).toContain("100%");
    expect(markup).toContain("94%");
    expect(markup).toContain("data-selected=\"true\"");
    expect(markup).toContain("data-status=\"selected\"");
    expect(markup).toContain("aria-label=\"selected\"");
    expect(markup).toContain("aria-label=\"bench\"");
    expect(markup).toContain("tls-preparation-squad-status-glyph");
    expect(markup).not.toContain(">XI<");
    expect(markup).not.toContain(">S<");
    expect(markup).toContain("Filter squad by department");
    expect(markup).toContain("aria-label=\"Name\"");
    expect(markup).toContain("aria-label=\"Status\"");
    expect(markup).toContain("unknown");
    expect(markup).not.toContain(">Foot<");
    expect(markup).not.toContain(">available<");
    expect(markup).toContain("aria-sort=\"ascending\"");
  });

  it("filters by football department rather than translated role labels", () => {
    expect(filterSquadSelectionRows(ROWS, "all")).toHaveLength(4);
    expect(filterSquadSelectionRows(ROWS, "goalkeeper").map((row) => row.player.playerId)).toEqual([
      "player:keeper",
    ]);
    expect(filterSquadSelectionRows(ROWS, "defender").map((row) => row.player.playerId)).toEqual([
      "player:defender",
    ]);
    expect(filterSquadSelectionRows(ROWS, "midfielder").map((row) => row.player.playerId)).toEqual([
      "player:midfielder",
    ]);
    expect(filterSquadSelectionRows(ROWS, "attacker").map((row) => row.player.playerId)).toEqual([
      "player:striker",
    ]);
  });

  it("sorts all five visible facts deterministically", () => {
    expect(
      sortSquadSelectionRows(ROWS, { key: "name", direction: "ascending" }).map((row) => row.player.playerId),
    ).toEqual(["player:keeper", "player:midfielder", "player:defender", "player:striker"]);
    expect(
      sortSquadSelectionRows(ROWS, { key: "role", direction: "ascending" }).map((row) => row.player.playerId),
    ).toEqual(["player:keeper", "player:defender", "player:midfielder", "player:striker"]);
    expect(
      sortSquadSelectionRows(ROWS, { key: "age", direction: "ascending" }).map((row) => row.player.playerId),
    ).toEqual(["player:defender", "player:striker", "player:keeper", "player:midfielder"]);
    expect(
      sortSquadSelectionRows(ROWS, { key: "fitness", direction: "ascending" }).map(
        (row) => row.player.playerId,
      ),
    ).toEqual(["player:midfielder", "player:striker", "player:keeper", "player:defender"]);
    expect(
      sortSquadSelectionRows(ROWS, { key: "status", direction: "ascending" }).map(
        (row) => row.player.playerId,
      ),
    ).toEqual(["player:keeper", "player:defender", "player:midfielder", "player:striker"]);
    expect(
      sortSquadSelectionRows(ROWS, { key: "fitness", direction: "descending" }).map(
        (row) => row.player.playerId,
      ),
    ).toEqual(["player:defender", "player:keeper", "player:striker", "player:midfielder"]);
  });
});
