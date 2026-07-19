import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createWebTranslator } from "../../app/translation";
import { MatchdayPlaybackControls } from "./MatchdayPlaybackControls";

describe("MatchdayPlaybackControls", () => {
  it("renders one pause command and three accessible speed choices", () => {
    const markup = renderToStaticMarkup(
      <MatchdayPlaybackControls
        paused={false}
        speed={2}
        text={createWebTranslator("en")}
        onPausedChange={() => undefined}
        onSpeedChange={() => undefined}
      />,
    );

    expect(markup).toContain('aria-label="Playback controls"');
    expect(markup).toContain('data-paused="false"');
    expect(markup).toContain('data-speed="2x"');
    expect(markup.match(/data-motion-control=/g) ?? []).toHaveLength(4);
    expect(markup).toContain('data-motion-control="playback-toggle"');
    expect(markup.match(/data-motion-control="playback-speed"/g) ?? []).toHaveLength(3);
    expect(markup).toContain("Pause");
    expect(markup.match(/aria-pressed="true"/g) ?? []).toHaveLength(1);
    expect(markup).toContain('aria-label="Playback speed 1x"');
    expect(markup).toContain('aria-label="Playback speed 2x"');
    expect(markup).toContain('aria-label="Playback speed 4x"');
  });

  it("exposes resume while presentation is paused", () => {
    const markup = renderToStaticMarkup(
      <MatchdayPlaybackControls
        paused
        speed={1}
        text={createWebTranslator("en")}
        onPausedChange={() => undefined}
        onSpeedChange={() => undefined}
      />,
    );

    expect(markup).toContain('data-paused="true"');
    expect(markup).toContain("Resume");
  });
});
