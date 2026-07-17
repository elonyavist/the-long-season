import { describe, expect, it, vi } from "vitest";

import { createCareerCommandRunner } from "./use-career-command-runner";

describe("createCareerCommandRunner", () => {
  it("publishes pending synchronously, blocks conflicts, and clears after snapshot publication", async () => {
    let active = false;
    let resolveCommand!: (value: string) => void;
    const order: string[] = [];
    const execute = new Promise<string>((resolve) => { resolveCommand = resolve; });
    const runner = createCareerCommandRunner({
      begin: () => {
        if (active) return false;
        active = true;
        order.push("pending");
        return true;
      },
      complete: () => {
        active = false;
        order.push("clear");
      },
      fail: vi.fn(),
      exposeFailure: vi.fn(),
    });

    const first = runner({
      commandId: "continue_career",
      statusLabelKey: "career.dashboard.continue",
      failureScope: "current_career",
      execute: () => execute,
      onSuccess: () => order.push("publish"),
    });
    const duplicate = await runner({
      commandId: "manual_save",
      statusLabelKey: "career.saveControl.saving",
      failureScope: "current_career",
      execute: async () => "duplicate",
      onSuccess: vi.fn(),
    });

    expect(order).toEqual(["pending"]);
    expect(duplicate).toBe(false);
    resolveCommand("done");
    await expect(first).resolves.toBe(true);
    expect(order).toEqual(["pending", "publish", "clear"]);
  });

  it("releases pending state and exposes one bounded failure", async () => {
    const fail = vi.fn();
    const exposeFailure = vi.fn();
    const runner = createCareerCommandRunner({
      begin: () => true,
      complete: vi.fn(),
      fail,
      exposeFailure,
    });

    await expect(runner({
      commandId: "manual_save",
      statusLabelKey: "career.saveControl.saving",
      failureScope: "current_career",
      execute: async () => { throw { code: "save_unwritable" }; },
      onSuccess: vi.fn(),
    })).resolves.toBe(false);

    expect(fail).toHaveBeenCalledWith("manual_save", { code: "save_unwritable" });
    expect(exposeFailure).toHaveBeenCalledWith({ code: "save_unwritable" }, "current_career");
  });

  it("publishes an Inbox lifecycle snapshot through the same mutation lock", async () => {
    const published: string[] = [];
    const runner = createCareerCommandRunner({
      begin: () => true,
      complete: () => published.push("complete"),
      fail: vi.fn(),
      exposeFailure: vi.fn(),
    });

    await expect(runner({
      commandId: "open_inbox_message",
      statusLabelKey: "career.inbox.subject.matchday",
      failureScope: "current_career",
      execute: async () => "opened",
      onSuccess: (result) => published.push(result),
    })).resolves.toBe(true);

    expect(published).toEqual(["opened", "complete"]);
  });
});
