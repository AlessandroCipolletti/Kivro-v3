#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root, ...opts });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

for (const required of [
  "packages/cloud-core/src/control-plane-policy.ts",
  "packages/database/prisma/migrations/20260410140000_m22_execution_control_plane/migration.sql",
  "apps/api/src/services/worker-control-plane-context.ts",
  "docs/milestones/M22-closure.md",
  "docs/milestones/M22-manual-validation.md",
  "docs/deploy/dual-control-plane-transition.md",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-architecture.mjs"]);

run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-transport", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-dispatch", "run", "build"]);
run("pnpm", ["--filter", "@kivro/database", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("pnpm", ["db:up"]);
run("pnpm", ["db:wait"]);
run("pnpm", ["db:migrate"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/cloud-core/src/control-plane-policy.test.ts",
  "packages/cloud-core/src/worker-discovery.test.ts",
  "apps/api/src/services/worker-discovery-document.test.ts",
  "packages/job-dispatch/src/control-plane-guard.test.ts",
  "security/tests/acceptance-m22.test.ts",
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/conformance-dual-transport-m19.test.ts",
  "security/tests/conformance-both-roots-m19.test.ts",
  "packages/worker-transport/src/http-client.test.ts",
  "packages/worker-transport/src/multi-transport.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);

run("node", ["scripts/sync-m22-coverage.mjs"]);
run("node", ["scripts/verify-m22-dual-staging.mjs"]);
run("pnpm", ["verify:m21"]);

console.log("M22 verify flow passed (dual control-plane continuity + switch readiness)");
