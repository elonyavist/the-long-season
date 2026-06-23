import { describe, expect, it } from "vitest";
import { buildCareerInboxView } from "@game/ui";
import { createWebTranslator } from "../app/translation";
import { CareerInboxPanel } from "./CareerInboxPanel";

describe("CareerInboxPanel", () => {
  it("returns the compact Inbox panel element", () => {
    const element = CareerInboxPanel({
      text: createWebTranslator("en"),
      view: buildCareerInboxView([
        {
          messageId: "inbox:fixture-000003-prep",
          dateIso: "2026-08-01",
          category: "match_preparation_required",
          priority: "urgent",
          status: "unread",
          titleKey: "career.inbox.title.matchPreparationRequired",
          summaryKey: "career.inbox.summary.matchPreparationRequired",
          actionRequired: true,
          actions: [{ actionId: "prepare_match", labelKey: "career.inbox.action.prepare_match" }],
        },
      ]),
    });

    expect(element.props["data-testid"]).toBe("career-inbox-panel");
  });
});
