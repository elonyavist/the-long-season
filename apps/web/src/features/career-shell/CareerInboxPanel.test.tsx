import { describe, expect, it } from "vitest";
import { buildCareerInboxView } from "@game/ui";
import type React from "react";
import { createWebTranslator } from "../../app/translation";
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
    const button = findButtonWithClick(element);

    button.props.onClick();

    expect(clickedActionId).toBe("prepare_match");
  });
});

type TestElementProps = Readonly<{
  children?: unknown;
  onClick?: () => void;
}>;

function findButtonWithClick(element: React.ReactElement<TestElementProps>): React.ReactElement<{ onClick: () => void }> {
  if (element.type === "button" && typeof element.props.onClick === "function") {
    return element as React.ReactElement<{ onClick: () => void }>;
  }

  const button = findButtonInChildren(element.props.children);

  if (button !== undefined) {
    return button;
  }

  throw new Error("Expected Inbox action button.");
}

function findButtonInChildren(children: unknown): React.ReactElement<{ onClick: () => void }> | undefined {
  const childElements = Array.isArray(children) ? children : [children];

  for (const child of childElements) {
    if (Array.isArray(child)) {
      const button = findButtonInChildren(child);

      if (button !== undefined) {
        return button;
      }
    } else if (isReactElement(child)) {
      try {
        return findButtonWithClick(child);
      } catch {
        continue;
      }
    }
  }

  return undefined;
}

function isReactElement(value: unknown): value is React.ReactElement<TestElementProps> {
  return typeof value === "object" && value !== null && "type" in value && "props" in value;
}
