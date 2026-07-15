import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["server/**/*.test.ts"],
    setupFiles: ["server/tests/setup.ts"],
  },
});
