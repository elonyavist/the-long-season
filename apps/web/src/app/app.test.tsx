import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("exposes a React component for the web shell", () => {
    expect(typeof App).toBe("function");
  });
});
