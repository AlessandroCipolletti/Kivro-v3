import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@kivro/contracts": path.resolve("packages/contracts/src/index.ts"),
      "@kivro/policy-engine": path.resolve("packages/policy-engine/src/index.ts"),
      "@kivro/observability": path.resolve("packages/observability/src/index.ts"),
    },
  },
  test: {
    include: [
      "packages/**/*.test.ts",
      "apps/**/*.test.ts",
      "security/tests/**/*.test.ts",
    ],
  },
});
