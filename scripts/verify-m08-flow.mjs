#!/usr/bin/env node
import { spawnSync } from "node:child_process";
// db:migrate best-effort so optional DB tests can run when Postgres is up
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

spawnSync("pnpm", ["db:migrate"], { stdio: "ignore", cwd: root });

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/billing/src/price-tiers.test.ts",
  "packages/billing/src/tier-validation.test.ts",
  "packages/billing/src/connect-eligibility.test.ts",
  "packages/billing/src/job-payment-idempotency.test.ts",
  "packages/billing/src/job-payment-hooks.test.ts",
  "packages/billing/src/pricing-principle.test.ts",
  "packages/billing/src/job-card-payment.test.ts",
  "security/tests/acceptance-m08.test.ts",
  "packages/job-dispatch/src/dispatch-payment-gate.test.ts",
  "security/tests/m08-payment-db.test.ts",
]);

run("node", ["scripts/sync-m08-coverage.mjs"]);

console.log("M08 verify flow passed");
