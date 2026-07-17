import type { MessageKey, Translator } from "@game/i18n";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalendarAdvanceTransition } from "./CalendarAdvanceTransition";

const text: Translator = (key, params) => {
  if (key === "career.calendarAdvance.label") return "Advancing calendar";
  if (key === "career.calendarAdvance.complete") return `Career advanced to ${String(params?.date)}.`;
  return key satisfies MessageKey;
};

describe("CalendarAdvanceTransition", () => {
  it("shows the current visual date without announcing every frame", () => {
    const html = renderToStaticMarkup(
      <CalendarAdvanceTransition
        transition={{ visibleDateIso: "2026-08-03", stopDateIso: "2026-08-05", status: "advancing" }}
        text={text}
      />,
    );

    expect(html).toContain("Advancing calendar");
    expect(html).toContain('dateTime="2026-08-03"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("Career advanced to");
  });

  it("leaves completion announcements to the existing command live region", () => {
    const html = renderToStaticMarkup(
      <CalendarAdvanceTransition
        transition={{ visibleDateIso: "2026-08-05", stopDateIso: "2026-08-05", status: "complete" }}
        text={text}
      />,
    );

    expect(html).toBe("");
  });
});
