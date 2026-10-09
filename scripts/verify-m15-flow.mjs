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

for (const required of [
  "docs/TESTING-STRATEGY.md",
  "docs/legal/ALPHA-NOTICE.md",
  "docs/milestones/M15-closure.md",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/abuse-controls/src/denylist.test.ts",
  "packages/abuse-controls/src/triage.test.ts",
  "packages/capability-publish/src/native-plugin-gate.test.ts",
  "packages/job-failure/src/invariants.test.ts",
  "packages/job-io/src/result-safety.test.ts",
  "packages/marketplace/src/job-audit-summary.test.ts",
  "security/tests/acceptance-m15.test.ts",
  "security/tests/m15-abuse-db.test.ts",
]);

run("node", ["scripts/sync-m15-coverage.mjs"]);

run("pnpm", ["--filter", "@kivro/abuse-controls", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-failure", "run", "build"]);
run("pnpm", ["--filter", "@kivro/seller-health", "run", "build"]);
run("pnpm", ["--filter", "@kivro/observability", "run", "build"]);
run("pnpm", ["--filter", "@kivro/capability-publish", "run", "build"]);
run("pnpm", ["--filter", "@kivro/billing", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-control", "run", "build"]);
run("pnpm", ["--filter", "@kivro/job-io", "run", "build"]);
run("pnpm", ["--filter", "@kivro/marketplace", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/web", "run", "typecheck"]);

console.log("M15 verify flow passed (bounded — ML anomaly + full red-team CI deferred)");
