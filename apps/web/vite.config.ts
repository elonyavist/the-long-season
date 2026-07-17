import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

/**
 * Keeps the web shell deliberately small: Vite handles TSX through esbuild,
 * while Tailwind is available as styling infrastructure without changing the
 * current component layout.
 */
export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    headers: crossOriginIsolationHeaders(),
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    headers: crossOriginIsolationHeaders(),
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});

function crossOriginIsolationHeaders(): Record<string, string> {
  return {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
  };
}
