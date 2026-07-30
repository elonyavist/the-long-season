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
  },
});
