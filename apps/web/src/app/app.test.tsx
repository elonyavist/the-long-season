import { describe, expect, it } from "vitest";

import { App } from "./App";
import { continueDemoCareer } from "../features/dashboard/continue-demo-career";

describe("App", () => {
  it("exposes a React component for the web shell", () => {
    expect(typeof App).toBe("function");
  });

  it("stops the demo career immediately when preparation is missing", () => {
    const result = continueDemoCareer();

    expect(result.stopReason).toBe("match_preparation_required");
    expect(result.daysAdvanced).toBe(0);
    expect(result.titleKey).toBe("career.inbox.title.matchPreparationRequired");
    expect(result.inboxMessages).toHaveLength(1);
  });
});
