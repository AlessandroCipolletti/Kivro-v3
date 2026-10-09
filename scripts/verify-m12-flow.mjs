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
  "packages/seller-health/src/security-warnings.test.ts",
  "packages/seller-health/src/job-metrics.test.ts",
  "security/tests/acceptance-m12.test.ts",
]);

run("node", ["scripts/sync-m12-coverage.mjs"]);

run("pnpm", ["--filter", "@kivro/seller-health", "run", "build"]);
run("pnpm", ["--filter", "@kivro/worker-store", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-scheduling", "run", "build"]);
run("pnpm", ["--filter", "@kivro/database", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/web", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/worker", "run", "typecheck"]);

console.log("M12 verify flow passed (bounded — full §369–§393 polish deferred)");
