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
  "docker-compose.yml",
  "docs/DEV-LOCAL.md",
  "docs/testing/LOCAL-DEV-E2E-CHECKLIST.md",
  "docs/milestones/M18-closure.md",
  "scripts/dev-setup.mjs",
  "scripts/dev-demo.mjs",
  "scripts/worker-dev.mjs",
  "scripts/run-local-e2e.mjs",
  "scripts/local-dev-doctor.mjs",
  "scripts/wait-for-redis.mjs",
  "scripts/wait-for-minio.mjs",
  "apps/api/src/startup-guards.ts",
  "packages/billing/src/fake-payment-adapter.ts",
  "tests/fixtures/local-e2e-failure-matrix.json",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

const compose = fs.readFileSync(path.join(root, "docker-compose.yml"), "utf8");
for (const svc of ["postgres:", "redis:", "minio:"]) {
  if (!compose.includes(svc)) {
    console.error(`docker-compose.yml missing ${svc}`);
    process.exit(1);
  }
}

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m18.test.ts",
  "security/tests/acceptance-m18-local-failures.test.ts",
  "packages/billing/src/fake-payment-adapter.test.ts",
  "packages/job-delivery/src/worker-deliverables.test.ts",
  "packages/sandbox/src/docker-fixture-run.test.ts",
  "apps/api/src/startup-guards.test.ts",
]);

run("node", ["scripts/verify-m18-s573-checklist.mjs"]);
run("node", ["scripts/verify-dev-clone-contract.mjs"]);
run("node", ["scripts/sync-m18-coverage.mjs"]);
run("pnpm", ["verify:m17"]);

console.log("M18 verify flow passed (local dev perimeter + §573 checklist evidence)");
