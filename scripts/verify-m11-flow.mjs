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
  "packages/marketplace-agent/src/orchestration-planner.test.ts",
  "security/tests/acceptance-m11.test.ts",
]);

run("node", ["scripts/sync-m11-coverage.mjs"]);

run("pnpm", ["--filter", "@kivro/marketplace-agent", "run", "build"]);
run("pnpm", ["--filter", "@kivro/database", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/web", "run", "typecheck"]);

console.log("M11 verify flow passed (bounded — full orchestration E2E staging §160 deferred)");
