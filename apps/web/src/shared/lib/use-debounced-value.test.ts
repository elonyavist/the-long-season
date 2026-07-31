import assert from "node:assert/strict";
import { test } from "vitest";

import {
  scheduleDebouncedValue,
  type DebouncedValueScheduler,
} from "./use-debounced-value";

test("commits the latest scheduled value after the requested delay", () => {
  let scheduledCallback: (() => void) | undefined;
  let scheduledDelay = -1;
  let cancelledHandle: ReturnType<typeof setTimeout> | undefined;
  const handle = 7 as unknown as ReturnType<typeof setTimeout>;
  const scheduler: DebouncedValueScheduler = {
    schedule(callback, delayMs) {
      scheduledCallback = callback;
      scheduledDelay = delayMs;
      return handle;
    },
    cancel(cancelled) {
      cancelledHandle = cancelled;
    },
  };
  let committed = "";

  const cancel = scheduleDebouncedValue(
    "typed value",
    250,
    (value) => {
      committed = value;
    },
    scheduler,
  );

  assert.equal(scheduledDelay, 250);
  assert.equal(committed, "");
  scheduledCallback?.();
  assert.equal(committed, "typed value");
  cancel();
  assert.equal(cancelledHandle, handle);
});

test("rejects invalid debounce delays before scheduling work", () => {
  assert.throws(
    () => scheduleDebouncedValue("value", -1, () => undefined),
    /finite non-negative/,
  );
});
