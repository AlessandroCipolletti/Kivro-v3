#!/usr/bin/env node
import { spawnSync } from "node:child_process";
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
  "packages/job-scheduling/src/weekly-schedule.test.ts",
  "packages/job-scheduling/src/accepting-jobs.test.ts",
  "packages/job-scheduling/src/next-available.test.ts",
  "packages/job-scheduling/src/schedule-validation.test.ts",
  "packages/job-scheduling/src/buyer-job-scheduling-view.test.ts",
  "packages/job-scheduling/src/scheduled-run-validation.test.ts",
  "packages/job-scheduling/src/submission-gate.test.ts",
  "security/tests/acceptance-m09.test.ts",
  "packages/domain/src/job-status.test.ts",
  "packages/job-dispatch/src/dispatch-payment-gate.test.ts",
  "security/tests/m09-scheduling-db.test.ts",
]);

run("node", ["scripts/sync-m09-coverage.mjs"]);

console.log("M09 verify flow passed");
