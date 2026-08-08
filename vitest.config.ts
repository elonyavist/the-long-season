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
     * The Phase 81A report migration measured real-world files at up to `21.79`
     * seconds alone and `34.3` seconds while `maxWorkers` peers ran beside
     * them. The previous `30_000` therefore failed three innocent files in one
     * full gate even though all three passed alone. A gate whose result depends
     * on how busy the machine was is not a gate.
     *
     * `60_000` gives the measured contended maximum a declared margin while
     * still catching a genuine hang within one minute. A test that intentionally
     * needs more than this states its own budget at the call site.
     */
    testTimeout: 60_000,
  },
});
