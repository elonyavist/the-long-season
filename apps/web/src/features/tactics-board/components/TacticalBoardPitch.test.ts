import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../../app/translation";
import { assignTacticalBoardPlayer, createTacticalBoardDraft } from "../tactical-board-state";
import { TacticalBoardMenu } from "./TacticalBoardMenu";
import { TacticalBoardPitch } from "./TacticalBoardPitch";

describe("TacticalBoardPitch", () => {
  it("renders a vertical pitch with eleven board slots", () => {
    const draft = createTacticalBoardDraft("4-4-2");
    const markup = renderToStaticMarkup(
      React.createElement(TacticalBoardPitch, {
        currentShape: "4-4-2",
        players: [],
        slots: draft.slots,
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("tls-tactical-board-svg");
    expect(markup).toContain("tls-tactical-board-grass-texture");
    expect(markup.split("class=\"tls-tactical-board-empty-slot\"").length - 1).toBe(11);
    expect(markup.match(/data-motion-slot-key=/g)).toHaveLength(11);
    expect(markup).toContain("Tactical board");
    expect(markup).toContain("Current shape");
    expect(markup).not.toContain("Base formation");
  });

  it("renders assigned player tokens with number surname role and suitability", () => {
    const draft = assignTacticalBoardPlayer(createTacticalBoardDraft("4-4-2"), "gk", "player:gk");
    const markup = renderToStaticMarkup(
      React.createElement(TacticalBoardPitch, {
        currentShape: "4-4-2",
        players: [
          {
            playerId: "player:gk",
            number: 1,
            surname: "Valentini",
            formTrend: "up",
            suitabilityBySlotId: { gk: "natural" },
          },
        ],
        slots: draft.slots,
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("Valentini");
    expect(markup).toContain(">1<");
    expect(markup).toContain(">POR<");
    expect(markup).toContain("data-suitability=\"natural\"");
    expect(markup.split("class=\"tls-tactical-board-token\"").length - 1).toBe(1);
    expect(markup).toContain('data-motion-slot-key="gk:player:gk:POR"');
  });

  it("renders the menu shell with localized actions and suitability labels", () => {
    const markup = renderToStaticMarkup(
      React.createElement(TacticalBoardMenu, {
        candidates: [
          {
            player: { playerId: "player:one", number: 9, surname: "Rinaldi", formTrend: "flat", roleKey: "attacker" },
            suitability: "accomplished",
            fitness: 88,
          },
        ],
        roleOptions: [{ role: "AD", suitability: "competent", isCurrent: false }],
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("Change role");
    expect(markup).toContain("Remove from lineup");
    expect(markup).toContain("Assign player");
    expect(markup).toContain("Rinaldi");
    expect(markup).toContain("Strong");
  });
});
