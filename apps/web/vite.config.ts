import { defineConfig } from "vite";

/**
 * Keeps the first web shell deliberately small: Vite handles TSX through
 * esbuild, so React can run without an extra framework plugin in this phase.
 */
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
