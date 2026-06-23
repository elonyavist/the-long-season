import { describe, expect, it } from "vitest";
import { buildCareerInboxView, buildCareerShellView } from "@game/ui";

import { createWebTranslator } from "../app/translation";
import { CareerShell } from "./CareerShell";

describe("CareerShell", () => {
  it("returns the career shell element with central content", () => {
    const element = CareerShell({
      shellView: buildCareerShellView({
        activeSectionKey: "dashboard",
        inboxView: buildCareerInboxView([]),
      }),
      selectedClubName: "S.S. Perugia",
      text: createWebTranslator("en"),
      onBackToMenu: () => undefined,
      onContinueCareer: () => undefined,
      children: "central",
    });

    expect(element.props["data-testid"]).toBe("career-shell");
  });
});
