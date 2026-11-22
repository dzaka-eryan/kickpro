import { defineConfig } from "vitest/config";

export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    include: ["tests/**/*.rules.test.ts"],
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
