import { describe, expect, it } from "vitest";

import { createWebTranslator, translateWebLabel } from "./translation";

describe("web translation adapter", () => {
  it("translates visible shell labels through @game/i18n", () => {
    const italian = createWebTranslator("it");

    expect(italian("web.preferences.language")).toBe("Lingua");
    expect(translateWebLabel("en", "web.preferences.currency")).toBe("Currency");
  });
});
