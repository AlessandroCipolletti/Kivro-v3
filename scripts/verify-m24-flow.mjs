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
  "docs/milestones/M24-closure.md",
  "docs/milestones/M24-manual-validation.md",
  "scripts/check-duplicate-semantic-ownership.mjs",
  "scripts/verify-golden-registry.mjs",
  "scripts/generate-provider-parity-report.mjs",
  "tests/fixtures/backend-conformance-golden.json",
  "tests/fixtures/compatibility-matrix.json",
  "scripts/audit-m24-fitness-report.mjs",
  "scripts/check-api-provider-import-boundary.mjs",
  "scripts/verify-compatibility-matrix.mjs",
  "scripts/check-golden-registry-shape.mjs",
  "scripts/audit-m24-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-architecture.mjs"]);
run("node", ["scripts/check-composition-thinness.mjs"]);
run("node", ["scripts/check-duplicate-semantic-ownership.mjs"]);
run("node", ["scripts/check-api-provider-import-boundary.mjs"]);
run("node", ["scripts/check-golden-registry-shape.mjs"]);

run("pnpm", ["--filter", "@kivro/contracts", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-netsons", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-aws", "run", "build"]);
run("node", ["scripts/generate-provider-parity-report.mjs"]);
run("node", ["scripts/verify-compatibility-matrix.mjs"]);

run("pnpm", ["--filter", "@kivro/api", "run", "build"]);
run("node", ["scripts/verify-both-composition-roots.mjs"]);
run("node", ["scripts/check-no-bullmq-production.mjs"]);
run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/audit-m24-fitness-report.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/architecture-fitness-m24.test.ts",
  "security/tests/conformance-golden-m24.test.ts",
  "security/tests/conformance-golden-m19.test.ts",
  "security/tests/architecture-uni-023-m19.test.ts",
  "security/tests/conformance-both-roots-m19.test.ts",
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/acceptance-m24.test.ts",
  "security/tests/compatibility-matrix-m24.test.ts",
  "security/tests/conformance-divergence-rejection-m24.test.ts",
]);

run("node", ["scripts/audit-m24-exit-criteria.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m24-exit.test.ts",
]);

run("node", ["scripts/sync-m24-coverage.mjs"]);
run("pnpm", ["verify:m23"]);

console.log("M24 verify flow passed (architecture fitness + golden conformance hardening)");
