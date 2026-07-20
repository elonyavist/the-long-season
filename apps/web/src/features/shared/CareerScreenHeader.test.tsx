import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CareerScreenHeader } from "./CareerScreenHeader";

describe("CareerScreenHeader", () => {
  it("keeps screen identity, supporting facts, and the progression command in one boundary", () => {
    const html = renderToStaticMarkup(
      <CareerScreenHeader
        command={<button type="button">Continue</button>}
        eyebrow="Career command centre"
        supporting={<p>Round 3</p>}
        title="Dashboard"
        titleId="dashboard-title"
      />,
    );

    expect(html).toContain('class="tls-career-screen-header"');
    expect(html).toContain('id="dashboard-title"');
    expect(html).toContain("Career command centre");
    expect(html).toContain("Round 3");
    expect(html).toContain("Continue");
  });
});
