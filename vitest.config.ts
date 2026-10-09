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
      "@kivro/job-control": path.resolve("packages/job-control/src/index.ts"),
      "@kivro/job-dispatch": path.resolve("packages/job-dispatch/src/index.ts"),
      "@kivro/billing": path.resolve("packages/billing/src/index.ts"),
      "@kivro/job-scheduling": path.resolve("packages/job-scheduling/src/index.ts"),
      "@kivro/marketplace": path.resolve("packages/marketplace/src/index.ts"),
      "@kivro/marketplace-agent": path.resolve("packages/marketplace-agent/src/index.ts"),
      "@kivro/seller-health": path.resolve("packages/seller-health/src/index.ts"),
      "@kivro/buyer-api": path.resolve("packages/buyer-api/src/index.ts"),
      "@kivro/buyer-webhooks": path.resolve("packages/buyer-webhooks/src/index.ts"),
      "@kivro/abuse-controls": path.resolve("packages/abuse-controls/src/index.ts"),
      "@kivro/job-failure": path.resolve("packages/job-failure/src/index.ts"),
      "@kivro/database": path.resolve("packages/database/src/index.ts"),
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
