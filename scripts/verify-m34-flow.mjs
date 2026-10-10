#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

for (const required of [
  "docs/milestones/M34-closure.md",
  "packages/job-scheduling/src/worker-routing.ts",
  "scripts/audit-m34-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["db:migrate"]);
run("pnpm", ["db:generate"]);
run("pnpm", ["--filter", "@kivro/job-scheduling", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-dispatch", "run", "build"]);
run("pnpm", ["verify:m33"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);
run("node", ["scripts/sync-m34-coverage.mjs"]);
run("node", ["scripts/audit-m34-spotcheck.mjs"]);
run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/job-scheduling/src/worker-routing.test.ts",
  "packages/seller-experience/src/onboarding-worker-pool.test.ts",
  "security/tests/conformance-sellerux-gold-m34.test.ts",
  "security/tests/seller-workers-auth-m34.test.ts",
  "security/tests/acceptance-m34.test.ts",
]);
run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/verify-m34-evidence.mjs"]);
run("node", ["scripts/audit-m34-exit-criteria.mjs"]);
run("node", ["scripts/audit-m34-fitness-report.mjs"]);
run("node", ["scripts/audit-plan-through-m34.mjs"]);
run("pnpm", ["exec", "vitest", "run", "security/tests/acceptance-m34-exit.test.ts"]);
console.log("M34 verify flow passed (multi-Worker domain readiness)");
