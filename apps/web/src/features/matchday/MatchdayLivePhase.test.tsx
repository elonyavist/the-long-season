import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { MatchdayLiveMomentView } from "./career-matchday-presenter";
import { MatchdayLiveCommentary } from "./MatchdayLivePhase";

describe("MatchdayLiveCommentary", () => {
  it("renders one goal moment as the only polite live region", () => {
    const moment: MatchdayLiveMomentView = {
      visualPriority: "goal",
      event: {
        event: {
        eventId: "event:goal",
        sequence: 0,
        minute: 22,
        kind: "goal",
        club: homeClub,
        playerName: "Filippo Costa",
        labelKey: "career.matchday.event.goal",
        cardPriority: "major",
        },
        visualPriority: "goal",
      },
    };
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayLiveCommentary, {
        line: "22' Goal: U.S. Pisa - Filippo Costa",
        moment,
        playbackStage: "event",
      }),
    );

    expect(markup).toContain('data-playback-stage="event"');
    expect(markup).toContain('data-commentary-priority="goal"');
    expect(markup).toContain('data-event-id="event:goal"');
    expect(markup).toContain('data-motion-commentary-key="event:goal"');
    expect(markup).toContain('data-motion-category="narrative"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup.match(/22&#x27; Goal: U\.S\. Pisa - Filippo Costa/g) ?? []).toHaveLength(1);
    expect(markup).not.toContain("tls-match-centre-live-event");
  });

  it("keeps an intentional transition readable without stale event markup", () => {
    const markup = renderToStaticMarkup(
      React.createElement(MatchdayLiveCommentary, {
        line: "The second half is under way.",
        moment: { visualPriority: "transition" },
        playbackStage: "opening",
      }),
    );

    expect(markup).toContain('data-playback-stage="opening"');
    expect(markup).toContain('data-commentary-priority="transition"');
    expect(markup).toContain('data-motion-category="transition"');
    expect(markup).not.toContain("data-event-id");
    expect(markup).toContain('data-motion-commentary-key="opening:The second half is under way."');
    expect(markup).toContain("The second half is under way.");
  });
});

const homeClub = { clubId: "club:home", name: "U.S. Pisa" };
