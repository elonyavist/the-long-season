import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CareerMatchdayPhasePlayerView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { MatchdayTeamRatings } from "./MatchdayTeamRatings";

describe("MatchdayTeamRatings", () => {
  it("renders observed team facts in one responsive list with compact signals", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayTeamRatings, {
        clubName: "S.S. Perugia",
        rows: [playerRow()],
        signalsByPlayerId: { "player:one": "watch" },
        text: createWebTranslator("en"),
      }),
    );

    expect(markup).toContain("S.S. Perugia ratings");
    expect(markup).toContain("Nico Rinaldi");
    expect(markup).toContain("6.2");
    expect(markup).toContain("72%");
    expect(markup).toContain("attacker");
    expect(markup).toContain("G 1");
    expect(markup).toContain('data-signal="watch"');
    expect(markup).not.toContain("potential");
    expect(markup).not.toContain("suitability");
  });

  it("uses final-match guidance without changing the shared row language", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayTeamRatings, {
        clubName: "U.S. Pisa",
        rows: [playerRow()],
        text: createWebTranslator("en"),
        variant: "final",
      }),
    );

    expect(markup).toContain("Final rating, condition, role, contribution, and match status.");
    expect(markup).not.toContain("Live rating");
  });
});

function playerRow(): CareerMatchdayPhasePlayerView {
  return {
    playerId: "player:one",
    playerName: "Nico Rinaldi",
    club: { clubId: "club:selected", name: "S.S. Perugia" },
    roleKey: "attacker",
    rating: 6.2,
    condition: 72,
    status: "on_pitch",
    goals: 1,
    assists: 0,
    shots: 2,
    shotsOnTarget: 1,
    saves: 0,
    blocks: 0,
    impactScore: 4,
  };
}
