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
  "docs/milestones/M29-closure.md",
  "docs/milestones/M29-manual-validation.md",
  "packages/job-delivery/src/cloud-finalization.ts",
  "scripts/audit-m29-exit-criteria.mjs",
  "scripts/verify-m29-async-evidence.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["verify:m28"]);

run("pnpm", ["db:migrate"]);

run("pnpm", ["--filter", "@kivro/job-delivery", "run", "build"]);
run("pnpm", ["--filter", "@kivro/billing", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/marketplace", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/sync-m29-coverage.mjs"]);
run("node", ["scripts/audit-m29-async-spotcheck.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/job-delivery/src/cloud-finalization.test.ts",
  "packages/billing/src/job-completion-idempotency.test.ts",
  "packages/billing/src/job-completion-barrier-m29.test.ts",
  "packages/job-delivery/src/retention.test.ts",
  "packages/job-delivery/src/reconcile-result-integrity.test.ts",
  "packages/job-delivery/src/terminal-notifications.test.ts",
  "packages/job-delivery/src/retention-cleanup.test.ts",
  "packages/job-delivery/src/completed-integrity-sample.test.ts",
  "packages/billing/src/job-payment-submit-persistence-m29.test.ts",
  "security/tests/conformance-async-gold-m29.test.ts",
  "security/tests/buyer-result-auth-m29.test.ts",
  "security/tests/acceptance-m29.test.ts",
  "security/tests/acceptance-m29-exit.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/verify-m29-async-evidence.mjs"]);
run("node", ["scripts/audit-m29-exit-criteria.mjs"]);
run("node", ["scripts/audit-m29-fitness-report.mjs"]);

console.log("M29 verify flow passed (durable asynchronous buyer delivery)");
