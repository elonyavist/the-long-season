import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WebMotionProvider } from "./WebMotionProvider";
import { webMotion } from "./web-motion";

describe("WebMotionProvider", () => {
  it("preserves application content behind the shared configuration boundary", () => {
    const html = renderToStaticMarkup(
      <WebMotionProvider>
        <main data-testid="motion-child">Career</main>
      </WebMotionProvider>,
    );

    expect(html).toContain('data-testid="motion-child"');
    expect(html).toContain("Career");
  });

  it("exposes bounded semantic timings and one pending-only repeat", () => {
    expect(webMotion.micro.duration).toBeLessThan(webMotion.transition.duration);
    expect(webMotion.transition.duration).toBeLessThan(webMotion.narrative.duration);
    expect(webMotion.commandPending.repeat).toBe(Infinity);
  });
});
