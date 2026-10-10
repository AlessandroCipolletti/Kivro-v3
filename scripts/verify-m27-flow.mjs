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
  "docs/milestones/M27-closure.md",
  "docs/milestones/M27-manual-validation.md",
  "docs/deploy/performance-envelope.md",
  "docs/audits/M27-performance-envelope.json",
  "docs/audits/M27-operational-alarms.json",
  "packages/release-ops/package.json",
  "scripts/verify-performance-envelope-load.mjs",
  "scripts/verify-release-activation-gate.mjs",
  "scripts/audit-m27-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["--filter", "@kivro/compatibility", "run", "build"]);
run("pnpm", ["--filter", "@kivro/release-ops", "run", "build"]);

run("pnpm", ["verify:m26"]);

run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-io", "run", "build"]);
run("pnpm", ["--filter", "@kivro/buyer-webhooks", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-transport", "run", "build"]);

run("node", ["scripts/sync-m27-performance-envelope-fixture.mjs"]);
run("node", ["scripts/verify-m27-envelope-fixture-drift.mjs"]);
run("node", ["scripts/generate-unified-release-manifest.mjs"]);
run("node", ["scripts/generate-provider-parity-report.mjs"]);
run("node", ["scripts/verify-unified-release-evidence.mjs"]);
run("node", ["scripts/check-bounded-runtime-vs-envelope.mjs"]);
run("node", ["scripts/check-envelope-product-limits.mjs"]);
run("node", ["scripts/verify-performance-envelope-load.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/release-ops/src/performance-envelope.test.ts",
  "packages/release-ops/src/load-simulation.test.ts",
  "packages/release-ops/src/release-activation.test.ts",
  "packages/release-ops/src/operational-alarms.test.ts",
  "packages/release-ops/src/bounded-runtime.test.ts",
  "packages/release-ops/src/envelope-product-limits.test.ts",
  "security/tests/performance-envelope-m27.test.ts",
  "security/tests/release-activation-m27.test.ts",
  "security/tests/release-activation-rejection-m27.test.ts",
  "security/tests/conformance-golden-m27.test.ts",
  "security/tests/acceptance-m27.test.ts",
]);

run("node", ["scripts/verify-golden-registry.mjs"]);

run("node", ["scripts/verify-release-activation-gate.mjs"]);

run("node", ["scripts/audit-m27-fitness-report.mjs"]);
run("node", ["scripts/audit-m27-exit-criteria.mjs"]);

run("pnpm", ["exec", "vitest", "run", "security/tests/acceptance-m27-exit.test.ts"]);

run("node", ["scripts/sync-m27-coverage.mjs"]);

console.log("M27 verify flow passed (performance envelope & unified release operations)");
