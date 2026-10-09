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
  "packages/buyer-api/src/idempotency.test.ts",
  "packages/buyer-webhooks/src/url-validation.test.ts",
  "packages/buyer-webhooks/src/signing.test.ts",
  "security/tests/acceptance-m13.test.ts",
]);

run("node", ["scripts/sync-m13-coverage.mjs"]);

run("pnpm", ["--filter", "@kivro/buyer-api", "run", "build"]);
run("pnpm", ["--filter", "@kivro/buyer-webhooks", "run", "build"]);
run("pnpm", ["--filter", "@kivro/database", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);

console.log("M13 verify flow passed (bounded — buyer API UI §349 and v1 asset intents deferred)");
