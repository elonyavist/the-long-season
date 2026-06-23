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

  it("emits structured action clicks", () => {
    let clickedActionId: string | undefined;
    const element = CareerInboxPanel({
      text: createWebTranslator("en"),
      onActionClick: (actionId) => {
        clickedActionId = actionId;
      },
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
    const list = element.props.children[1];
    const firstMessage = list.props.children[0];
    const actions = firstMessage.props.children[3];
    const button = actions.props.children[0];

    button.props.onClick();

    expect(clickedActionId).toBe("prepare_match");
  });
});
