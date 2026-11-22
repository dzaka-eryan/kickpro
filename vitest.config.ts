import { defineConfig } from "vitest/config";

export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    include: [
      "packages/**/src/**/*.test.ts",
      "functions/src/**/*.test.ts",
      "apps/web/src/**/*.test.ts",
    ],
    environment: "node",
  },
});
