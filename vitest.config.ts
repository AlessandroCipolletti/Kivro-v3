import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@kivro/contracts": path.resolve("packages/contracts/src/index.ts"),
      "@kivro/policy-engine": path.resolve("packages/policy-engine/src/index.ts"),
      "@kivro/sandbox": path.resolve("packages/sandbox/src/index.ts"),
      "@kivro/resource-broker": path.resolve("packages/resource-broker/src/index.ts"),
      "@kivro/egress-proxy": path.resolve("packages/egress-proxy/src/index.ts"),
      "@kivro/platform-policy": path.resolve("packages/platform-policy/src/index.ts"),
      "@kivro/provider-broker": path.resolve("packages/provider-broker/src/index.ts"),
      "@kivro/job-io": path.resolve("packages/job-io/src/index.ts"),
      "@kivro/research-broker": path.resolve("packages/research-broker/src/index.ts"),
      "@kivro/capability-publish": path.resolve("packages/capability-publish/src/index.ts"),
      "@kivro/observability": path.resolve("packages/observability/src/index.ts"),
      "@kivro/domain": path.resolve("packages/domain/src/index.ts"),
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
