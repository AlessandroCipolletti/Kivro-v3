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
  "docs/deploy/aws/README.md",
  "docs/deploy/aws/DEPLOYMENT-GUIDE.md",
  "apps/api/src/aws-production-guards.ts",
  "docs/milestones/M21-closure.md",
  "docs/milestones/M21-manual-validation.md",
  "packages/cloud-aws/src/aws-event-tick.ts",
  "packages/cloud-aws/src/aws-runtime-config.ts",
  "packages/cloud-core/src/postgres-durable-work.ts",
  "apps/api/src/routes/platform-cron.ts",
  "apps/api/src/services/cloud-dispatch-hook.ts",
  "scripts/aws-unified-start.mjs",
  "scripts/aws-deploy-preflight.mjs",
  "docs/deploy/aws/Dockerfile",
  "packages/storage/src/storage-health.ts",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-architecture.mjs"]);
run("node", ["scripts/check-composition-thinness.mjs"]);
run("node", ["scripts/check-no-bullmq-production.mjs"]);

run("pnpm", ["--filter", "@kivro/contracts", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-netsons", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-aws", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-transport", "run", "build"]);
run("pnpm", ["--filter", "@kivro/storage", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-dispatch", "run", "build"]);
run("pnpm", ["--filter", "@kivro/database", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/verify-api-contract-mvp.mjs"]);
run("node", ["scripts/aws-deploy-preflight.mjs"], {
  env: {
    ...process.env,
    KIVRO_CLOUD_PROFILE: "aws",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://kivro:kivro@localhost:5433/kivro",
  },
});

run("pnpm", ["db:up"]);
run("pnpm", ["db:wait"]);
run("pnpm", ["db:migrate"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m21.test.ts",
  "security/tests/host-aws-production-m21.test.ts",
  "security/tests/conformance-aws-profile-m21.test.ts",
  "security/tests/aws-wss-reconcile-m21.test.ts",
  "packages/cloud-aws/src/durable-work-port.test.ts",
  "packages/cloud-aws/src/composition.test.ts",
  "packages/cloud-aws/src/aws-runtime-config.test.ts",
  "packages/storage/src/config.test.ts",
  "packages/storage/src/storage-health.test.ts",
  "security/tests/aws-production-guards-m21.test.ts",
  "security/tests/platform-cron-aws-m21.test.ts",
  "packages/database/src/pool.test.ts",
]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/verify-both-composition-roots.mjs"]);

run("node", ["scripts/aws-staging-smoke.mjs"]);
run("node", ["scripts/aws-staging-e2e.mjs"]);
run("node", ["scripts/sync-m21-coverage.mjs"]);
run("pnpm", ["verify:m20"]);

console.log("M21 verify flow passed (AWS deployment profile + shared PostgreSQL/SQS durable work)");
