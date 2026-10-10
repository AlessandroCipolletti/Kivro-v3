#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

for (const required of [
  "docs/milestones/M25-closure.md",
  "docs/milestones/M25-manual-validation.md",
  "packages/compatibility/matrix.json",
  "tests/fixtures/schema-rollout-registry.json",
  "scripts/generate-unified-release-manifest.mjs",
  "scripts/verify-schema-rollout-discipline.mjs",
  "scripts/audit-m25-exit-criteria.mjs",
  "scripts/verify-worker-release-cli.mjs",
  "scripts/sync-compatibility-matrix-fixture.mjs",
  "scripts/audit-m25-fitness-report.mjs",
  "docs/deploy/schema-rollout-discipline.md",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["--filter", "@kivro/compatibility", "run", "build"]);
run("pnpm", ["--filter", "@kivro/contracts", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/seller-health", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-transport", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-store", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-protocol", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker", "run", "build"]);

run("node", ["scripts/sync-compatibility-matrix-fixture.mjs"]);
run("node", ["scripts/verify-compatibility-matrix.mjs"]);
run("node", ["scripts/verify-schema-rollout-discipline.mjs"]);
run("node", ["scripts/generate-unified-release-manifest.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/compatibility/src/worker-policy.test.ts",
  "packages/compatibility/src/worker-release-signing.test.ts",
  "packages/compatibility/src/staged-worker-update.test.ts",
  "packages/compatibility/src/schema-rollout.test.ts",
  "packages/compatibility/src/protocol-overlap.test.ts",
  "packages/compatibility/src/openclaw-range.test.ts",
  "packages/worker-store/src/staged-update.test.ts",
  "packages/worker-transport/src/http-client.test.ts",
  "packages/job-protocol/src/application.test.ts",
  "apps/api/src/services/worker-compatibility-gate.test.ts",
  "packages/seller-health/src/security-warnings.test.ts",
  "security/tests/compatibility-fail-closed-m25.test.ts",
  "security/tests/worker-backend-transition-m25.test.ts",
  "security/tests/conformance-dual-control-plane-restart-m25.test.ts",
  "security/tests/acceptance-m25.test.ts",
  "security/tests/conformance-golden-m25.test.ts",
]);

run("node", ["scripts/verify-worker-release-cli.mjs"]);
run("node", ["scripts/verify-worker-staged-update-cli.mjs"]);

run("node", ["scripts/audit-m25-fitness-report.mjs"]);
run("node", ["scripts/audit-m25-exit-criteria.mjs"]);

run("pnpm", ["exec", "vitest", "run", "security/tests/acceptance-m25-exit.test.ts"]);

run("node", ["scripts/sync-m25-coverage.mjs"]);
run("pnpm", ["verify:m24"]);

console.log("M25 verify flow passed (compatibility matrix + Worker update hardening)");
