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
  "docs/milestones/M26-closure.md",
  "docs/milestones/M26-manual-validation.md",
  "docs/deploy/backup-restore-runbook.md",
  "packages/resilience/fault-injection-matrix.json",
  "docs/audits/M26-rpo-rto.json",
  "scripts/verify-fault-injection-matrix.mjs",
  "scripts/check-redis-non-authoritative.mjs",
  "scripts/verify-isolated-restore-evidence.mjs",
  "scripts/verify-backup-automation-evidence.mjs",
  "scripts/audit-m26-exit-criteria.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["--filter", "@kivro/resilience", "run", "build"]);
run("pnpm", ["--filter", "@kivro/billing", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-dispatch", "run", "build"]);

run("node", ["scripts/sync-fault-injection-fixture.mjs"]);
run("node", ["scripts/check-redis-non-authoritative.mjs"]);
run("node", ["scripts/verify-isolated-restore-evidence.mjs"]);
run("node", ["scripts/verify-backup-automation-evidence.mjs"]);
run("node", ["scripts/verify-fault-injection-matrix.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/resilience/src/convergence.test.ts",
  "packages/billing/src/job-completion-idempotency.test.ts",
  "packages/billing/src/ledger-idempotency.test.ts",
  "packages/billing/src/stripe-webhook-idempotency.test.ts",
  "packages/job-dispatch/src/worker-reconcile.test.ts",
  "packages/resilience/src/cache-loss-recovery.test.ts",
  "security/tests/fault-injection-convergence-m26.test.ts",
  "security/tests/fault-injection-control-plane-m26.test.ts",
  "security/tests/acceptance-m26.test.ts",
  "security/tests/fault-injection-transport-ack-m26.test.ts",
]);

run("node", ["scripts/audit-m26-fitness-report.mjs"]);
run("node", ["scripts/audit-m26-exit-criteria.mjs"]);

run("pnpm", ["exec", "vitest", "run", "security/tests/acceptance-m26-exit.test.ts"]);

run("node", ["scripts/sync-m26-coverage.mjs"]);
run("pnpm", ["verify:m25"]);

console.log("M26 verify flow passed (fault injection, recovery & DR readiness)");
