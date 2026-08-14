import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for package-level deterministic unit tests.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "apps/**/*.test.tsx"],
    // Report tests can each run their own bounded simulation workers. File-level
    // concurrency therefore multiplies, rather than shares, the canonical
    // simulation limit. L6.36 measured four report files timing out under a
    // four-file pool; the same files were then measured alone. Keep Vitest
    // serial while simulation-report checkpoints retain their seven internal
    // workers.
    maxWorkers: 1,
    /**
     * Explicit because this suite generates whole worlds and plays whole
     * matches, and the default `5000` is not a budget those tests were ever
     * measured against.
     *
     * L6.36 remeasured the active report suite after whole-career evidence grew:
     * one deterministic replay needed `60.8` seconds alone and a file containing
     * several real multi-world runs needed about `15` minutes. Its individual
     * simulations legitimately exceed the former `60_000` default.
     *
     * `360_000` is the single owner of the per-test budget. Heavy tests do not
     * restate shorter local limits, so future engine cost cannot make the gate
     * fail according to whichever stale call-site number it reaches first.
     */
    testTimeout: 360_000,
  },
});
