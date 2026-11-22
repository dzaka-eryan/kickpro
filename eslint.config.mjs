import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/lib/**",
      "**/.next/**",
      "**/coverage/**",
      "**/next-env.d.ts",
      "**/*.config.mjs",
      "**/*.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [
      "packages/shared/src/**/*.ts",
      "functions/src/**/*.ts",
      "apps/web/src/**/*.{ts,tsx}",
      "scripts/**/*.ts",
      "tests/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
);
