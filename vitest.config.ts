import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for package-level deterministic unit tests.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "apps/**/*.test.tsx"],
  },
});
