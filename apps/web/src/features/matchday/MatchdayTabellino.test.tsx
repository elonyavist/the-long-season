import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CareerMatchdayPhaseEventView } from "@game/ui";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import type { MatchdayTabellinoView } from "./career-matchday-presenter";
import { MatchdayTabellino } from "./MatchdayTabellino";

const homeClub = { clubId: "club:home", name: "U.S. Pisa" };
const awayClub = { clubId: "club:away", name: "S.S. Perugia" };

describe("MatchdayTabellino", () => {
  it("renders newest-first home and away incidents with stronger goal hierarchy", () => {
    const markup = render(view([
      incident(
        event("event:sub", 62, "substitution", awayClub, "Marco Esposito", "Nico Pavoni"),
        "away",
        "secondary",
      ),
      incident(event("event:goal", 14, "goal", homeClub, "Filippo Costa"), "home", "goal"),
    ]));

    expect(markup).toContain("Match tabellino");
    expect(markup).toContain("U.S. Pisa");
    expect(markup).toContain("S.S. Perugia");
    expect(markup).toContain('class="tls-match-tabellino-incident is-goal"');
    expect(markup).toContain('data-motion-category="narrative"');
    expect(markup).toContain('data-motion-incident="event:goal"');
    expect(markup).toContain('data-side="home"');
    expect(markup).toContain('class="tls-match-tabellino-incident is-secondary"');
    expect(markup).toContain('data-motion-category="transition"');
    expect(markup).toContain('data-motion-incident="event:sub"');
    expect(markup).toContain('data-side="away"');
    expect(markup).toContain('data-incident-kind="goal"');
    expect(markup).toContain('data-incident-kind="substitution"');
    expect(markup).toContain("In: Marco Esposito · Out: Nico Pavoni");
    expect(markup.indexOf("62&#x27;")).toBeLessThan(markup.indexOf("14&#x27;"));
    expect(markup).toContain('aria-label="14&#x27; Goal U.S. Pisa Filippo Costa"');
    expect(markup).not.toContain('tabindex="0"');
  });

  it("omits an empty record instead of rendering an empty match panel", () => {
    expect(render(view([]))).toBe("");
  });

  it("makes an event-rich bounded record keyboard reachable", () => {
    const incidents = Array.from({ length: 7 }, (_, index) => incident(
      event(`event:goal-${index}`, index + 1, "goal", homeClub, `Player ${index + 1}`),
      "home",
      "goal",
    ));
    const markup = render(view(incidents));

    expect(markup).toContain('data-has-overflow="true"');
    expect(markup).toContain('class="tls-match-tabellino-list" aria-label="Match tabellino" tabindex="0"');
  });

  it("renders a scored penalty as one goal row without a secondary player", () => {
    const penaltyGoal = {
      ...event("event:penalty-outcome", 57, "penalty_goal", homeClub, "Matteo Moro"),
      labelKey: "career.matchday.event.penalty_goal_record",
    };
    const markup = render(view([incident(penaltyGoal, "home", "goal")]));

    expect(markup).toContain('class="tls-match-tabellino-incident is-goal"');
    expect(markup).toContain('data-incident-kind="penalty_goal"');
    expect(markup).toContain("●");
    expect(markup).toContain("Goal (penalty)");
    expect(markup).toContain("Matteo Moro");
    expect(markup).not.toContain("Penalty scored");
    expect(markup).not.toContain("Giorgio Trevisan");
  });
});

function render(tabellino: MatchdayTabellinoView): string {
  return renderToStaticMarkup(
    React.createElement(MatchdayTabellino, {
      view: tabellino,
      text: createWebTranslator("en"),
    }),
  );
}

function view(
  incidents: MatchdayTabellinoView["incidents"],
): MatchdayTabellinoView {
  return {
    homeClubName: homeClub.name,
    awayClubName: awayClub.name,
    incidents,
  };
}

function incident(
  matchEvent: CareerMatchdayPhaseEventView,
  side: "home" | "away",
  visualPriority: "goal" | "secondary",
): MatchdayTabellinoView["incidents"][number] {
  return { event: matchEvent, side, visualPriority };
}

function event(
  eventId: string,
  minute: number,
  kind: "goal" | "penalty_goal" | "substitution",
  club: typeof homeClub,
  playerName: string,
  secondaryPlayerName?: string,
): CareerMatchdayPhaseEventView {
  return {
    eventId,
    sequence: minute,
    minute,
    kind,
    club,
    playerName,
    ...(secondaryPlayerName === undefined ? {} : { secondaryPlayerName }),
    labelKey: `career.matchday.event.${kind}`,
    cardPriority: kind === "goal" ? "major" : "normal",
  };
}
