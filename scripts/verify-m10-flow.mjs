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
  "packages/marketplace/src/capability-listing.test.ts",
  "packages/marketplace/src/reviews.test.ts",
  "packages/marketplace/src/agent-discovery.test.ts",
  "security/tests/acceptance-m09.test.ts",
  "security/tests/acceptance-m10.test.ts",
]);

run("node", ["scripts/sync-m10-coverage.mjs"]);

run("pnpm", ["--filter", "@kivro/marketplace", "run", "build"]);
run("pnpm", ["--filter", "@kivro/storage", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/web", "run", "typecheck"]);

console.log("M10 verify flow passed (bounded — UI smoke via next dev)");
