import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * House ESLint config — identical in every Next.js repository on github.com/mouminkam.
 *
 * Advisory rules are warnings, not errors: the React Compiler checks (set-state-in-effect,
 * preserve-manual-memoization) flag code that works today, and `any` marks typing debt.
 * Warnings stay visible in every run and are counted in each README's trade-offs.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // CommonJS config files and Jest tests (jest.mock factories) load modules with require().
    files: ["**/*.js", "**/*.cjs", "**/__tests__/**", "**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "playwright-report/**", "test-results/**", "next-env.d.ts"]),
]);
