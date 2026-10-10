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
  "docs/milestones/M31-closure.md",
  "packages/buyer-experience/src/job-reuse.ts",
  "scripts/audit-m31-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["db:migrate"]);
run("pnpm", ["db:generate"]);
run("pnpm", ["--filter", "@kivro/storage", "run", "build"]);
run("pnpm", ["--filter", "@kivro/buyer-experience", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-delivery", "run", "build"]);
run("pnpm", ["verify:m30"]);
run("pnpm", ["--filter", "@kivro/marketplace", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/sync-m31-coverage.mjs"]);
run("node", ["scripts/audit-m31-spotcheck.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/buyer-experience/src/semantic-result.test.ts",
  "packages/buyer-experience/src/download-bundle-plan.test.ts",
  "packages/buyer-experience/src/input-snapshot.test.ts",
  "packages/buyer-experience/src/buyer-asset-validation.test.ts",
  "packages/buyer-experience/src/job-problem-report.test.ts",
  "packages/buyer-experience/src/retention-ux.test.ts",
  "packages/job-delivery/src/result-bundle.test.ts",
  "security/tests/conformance-buyerux-gold-m31.test.ts",
  "security/tests/acceptance-m31.test.ts",
  "security/tests/acceptance-m31-exit.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/verify-m31-evidence.mjs"]);
run("node", ["scripts/audit-plan-through-m31.mjs"]);
run("node", ["scripts/audit-m31-exit-criteria.mjs"]);
run("node", ["scripts/audit-m31-fitness-report.mjs"]);

console.log("M31 verify flow passed (buyer history & rich results)");
