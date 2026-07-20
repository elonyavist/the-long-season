import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CareerCurrentDate } from "./CareerCurrentDate";

describe("CareerCurrentDate", () => {
  it("renders a stable semantic date with an explicit advancing motion state", () => {
    const html = renderToStaticMarkup(
      <CareerCurrentDate advancing dateIso="2026-08-08" label="Current date" />,
    );

    expect(html).toContain('dateTime="2026-08-08"');
    expect(html).toContain('data-advancing="true"');
    expect(html).toContain('data-motion-calendar-date="true"');
    expect(html).toContain("Current date:");
    expect(html).toContain("2026-08-08");
  });
});
