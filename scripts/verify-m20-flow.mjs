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
  "docs/deploy/netsons/README.md",
  "docs/deploy/netsons/DEPLOYMENT-GUIDE.md",
  "apps/api/src/netsons-production-guards.ts",
  "packages/job-dispatch/src/worker-reconcile.ts",
  "docs/milestones/M20-closure.md",
  "docs/milestones/M20-manual-validation.md",
  "apps/api/src/services/netsons-dispatch-hook.ts",
  "packages/cloud-netsons/src/durable-work-db-port.ts",
  "packages/cloud-netsons/src/netsons-cron-tick.ts",
  "apps/api/src/routes/platform-cron.ts",
  "packages/database/prisma/migrations/20260410120000_m20_durable_work/migration.sql",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-architecture.mjs"]);
run("node", ["scripts/check-no-bullmq-production.mjs"]);

run("pnpm", ["--filter", "@kivro/contracts", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-netsons", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-aws", "run", "build"]);
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
  "security/tests/acceptance-m20.test.ts",
  "security/tests/host-net-production-m20.test.ts",
  "packages/cloud-netsons/src/durable-work-db-port.test.ts",
  "packages/job-dispatch/src/worker-reconcile.test.ts",
  "packages/database/src/pool.test.ts",
]);

run("node", ["scripts/netsons-staging-smoke.mjs"]);
run("node", ["scripts/netsons-staging-e2e.mjs"]);
run("node", ["scripts/sync-m20-coverage.mjs"]);
run("pnpm", ["verify:m19"]);

console.log("M20 verify flow passed (Netsons deployment profile + durable PostgreSQL work)");
