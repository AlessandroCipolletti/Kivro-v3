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
  "docs/milestones/M30-closure.md",
  "packages/buyer-experience/src/execution-quote.ts",
  "scripts/audit-m30-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["db:migrate"]);
run("pnpm", ["db:generate"]);
run("pnpm", ["--filter", "@kivro/buyer-experience", "run", "build"]);
run("pnpm", ["verify:m29"]);
run("pnpm", ["--filter", "@kivro/billing", "run", "build"]);
run("pnpm", ["--filter", "@kivro/marketplace", "run", "build"]);
run("pnpm", ["--filter", "@kivro/marketplace-agent", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/sync-m30-coverage.mjs"]);
run("node", ["scripts/audit-m30-spotcheck.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/buyer-experience/src/deadline-feasibility.test.ts",
  "packages/buyer-experience/src/buyer-eta.test.ts",
  "packages/job-scheduling/src/buyer-scheduled-cancel.test.ts",
  "packages/buyer-experience/src/worker-payload.test.ts",
  "packages/buyer-experience/src/buyer-progress.test.ts",
  "packages/marketplace/src/buyer-constraints.test.ts",
  "packages/marketplace-agent/src/purchase-authorization.test.ts",
  "packages/buyer-experience/src/scheduled-reminders.test.ts",
  "packages/buyer-experience/src/plan-deadline.test.ts",
  "security/tests/conformance-buyerux-gold-m30.test.ts",
  "security/tests/acceptance-m30.test.ts",
  "security/tests/acceptance-m30-exit.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/verify-m30-evidence.mjs"]);
run("node", ["scripts/audit-m30-exit-criteria.mjs"]);
run("node", ["scripts/audit-m30-fitness-report.mjs"]);

console.log("M30 verify flow passed (buyer predictability)");
