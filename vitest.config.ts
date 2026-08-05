import { defineConfig } from "vitest/config";
import { SIMULATION_WORKER_LIMIT } from "./packages/simulation-tools/src/simulation-execution-policy.ts";

/**
 * Vitest configuration for package-level deterministic unit tests.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "apps/**/*.test.tsx"],
    maxWorkers: SIMULATION_WORKER_LIMIT,
    /**
     * Explicit because this suite generates whole worlds and plays whole
     * matches, and the default `5000` is not a budget those tests were ever
     * measured against.
     *
     * The heaviest of them cost `1.1` to `1.4` seconds alone and roughly four
     * times that while `maxWorkers` of their peers run beside them, so the
     * default failed them at random: five different files timed out across two
     * runs of `pnpm check` here, every one of them passing on its own. A gate
     * whose result depends on how busy the machine was is not a gate, and the
     * failures it produced pointed at innocent files.
     *
     * `30_000` clears the worst observed run by a wide margin while still
     * catching a genuine hang in seconds rather than minutes. A test that needs
     * more than this states its own budget at the call site.
     */
    testTimeout: 30_000,
  },
});
