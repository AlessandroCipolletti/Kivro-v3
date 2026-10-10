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
  "docs/milestones/M33-closure.md",
  "packages/seller-experience/src/seller-operations-summary.ts",
  "scripts/audit-m33-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["db:migrate"]);
run("pnpm", ["db:generate"]);
run("pnpm", ["--filter", "@kivro/seller-experience", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-scheduling", "run", "build"]);
run("pnpm", ["verify:m32"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/sync-m33-coverage.mjs"]);
run("node", ["scripts/audit-m33-spotcheck.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/job-scheduling/src/accepting-jobs.test.ts",
  "packages/seller-experience/src/explain-unavailability.test.ts",
  "packages/seller-experience/src/provider-cost-view.test.ts",
  "packages/seller-experience/src/rollback-readiness.test.ts",
  "packages/seller-experience/src/seller-job-execution-view.test.ts",
  "security/tests/seller-operations-auth-m33.test.ts",
  "security/tests/conformance-sellerux-gold-m33.test.ts",
  "security/tests/acceptance-m33.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/verify-m33-evidence.mjs"]);
run("node", ["scripts/audit-m33-exit-criteria.mjs"]);
run("node", ["scripts/audit-m33-fitness-report.mjs"]);
run("node", ["scripts/audit-plan-through-m33.mjs"]);

run("pnpm", ["exec", "vitest", "run", "security/tests/acceptance-m33-exit.test.ts"]);

console.log("M33 verify flow passed (seller operations, economics & reliability)");
