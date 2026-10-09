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

const designDoc = path.join(root, "docs/design-system.md");
if (!fs.existsSync(designDoc)) {
  console.error("Missing docs/design-system.md");
  process.exit(1);
}

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "apps/web/src/lib/status-ui.test.ts",
  "security/tests/acceptance-m14.test.ts",
]);

run("node", ["scripts/sync-m14-coverage.mjs"]);

run("pnpm", ["--filter", "@kivro/web", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);

console.log("M14 verify flow passed (bounded — Playwright visual regression deferred)");
