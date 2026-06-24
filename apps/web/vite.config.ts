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
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
