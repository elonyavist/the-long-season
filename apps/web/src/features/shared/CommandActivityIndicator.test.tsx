import type { Translator } from "@game/i18n";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  CommandActivityIndicator,
  CommandActivityLiveRegion,
  isMatchingPendingCommand,
} from "./CommandActivityIndicator";

const text: Translator = (key) => key === "career.command.advancingCareer"
  ? "Advancing career..."
  : key;

describe("CommandActivityIndicator", () => {
  const activity = {
    commandId: "continue_career",
    status: "pending",
    statusLabelKey: "career.command.advancingCareer",
  } as const;

  it("renders specific pending copy and a non-verbal progress mark", () => {
    const html = renderToStaticMarkup(
      <CommandActivityIndicator
        activity={activity}
        commandIds={["continue_career"]}
        idleLabel="Continue"
        text={text}
      />,
    );

    expect(html).toContain("Advancing career...");
    expect(html).toContain("tls-command-activity-spinner");
    expect(html).toContain("tls-command-activity-copy");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-state="pending"');
  });

  it("keeps the idle label when another command owns the lock", () => {
    const html = renderToStaticMarkup(
      <CommandActivityIndicator
        activity={activity}
        commandIds={["manual_save"]}
        idleLabel="Save game"
        text={text}
      />,
    );

    expect(html).toContain("Save game");
    expect(html).toContain('data-state="idle"');
    expect(html).not.toContain("tls-command-activity-spinner");
    expect(isMatchingPendingCommand(activity, ["manual_save"])).toBe(false);
  });

  it("publishes one polite atomic status message", () => {
    const html = renderToStaticMarkup(<CommandActivityLiveRegion activity={activity} text={text} />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Advancing career...");
  });

  it("uses the same polite region for the final command result", () => {
    const html = renderToStaticMarkup(
      <CommandActivityLiveRegion
        activity={undefined}
        completionMessage="Career advanced to 2026-08-05."
        text={text}
      />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain("Career advanced to 2026-08-05.");
  });
});
