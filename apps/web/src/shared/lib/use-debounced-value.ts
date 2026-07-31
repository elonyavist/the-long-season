import { useEffect, useState } from "react";

/** Minimal scheduler seam that keeps debounce timing deterministic in tests. */
export interface DebouncedValueScheduler {
  schedule: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  cancel: (handle: ReturnType<typeof setTimeout>) => void;
}

const DEFAULT_SCHEDULER: DebouncedValueScheduler = {
  schedule: (callback, delayMs) => setTimeout(callback, delayMs),
  cancel: (handle) => clearTimeout(handle),
};

/**
 * Schedules one delayed value commit and returns the matching cleanup.
 *
 * The hook and its unit test share this seam, so stale typed values are always
 * cancelled before a newer value is applied.
 */
export function scheduleDebouncedValue<T>(
  value: T,
  delayMs: number,
  commit: (value: T) => void,
  scheduler: DebouncedValueScheduler = DEFAULT_SCHEDULER,
): () => void {
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new Error("Debounce delay must be a finite non-negative number");
  }
  const handle = scheduler.schedule(() => commit(value), delayMs);
  return () => scheduler.cancel(handle);
}

/** Returns the latest value only after it has remained unchanged for `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => scheduleDebouncedValue(value, delayMs, setDebouncedValue),
    [delayMs, value],
  );

  return debouncedValue;
}
