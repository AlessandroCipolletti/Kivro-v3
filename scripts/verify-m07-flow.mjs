#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

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
  "packages/domain/src/job-status.test.ts",
  "packages/job-control/src/pause-idempotency.test.ts",
  "packages/sandbox/src/supervisor.test.ts",
  "packages/contracts/src/job-control.test.ts",
  "security/tests/acceptance-m07.test.ts",
  "packages/job-control/src/payment-while-paused.test.ts",
  "packages/job-control/src/resume-readiness.test.ts",
  "packages/contracts/src/job-checkpoint.test.ts",
]);

run("node", ["scripts/sync-m07-coverage.mjs"]);

console.log("M07 verify flow passed");
