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
  "packages/cloud-core/src/composition.ts",
  "packages/worker-transport/src/polling-adapter.ts",
  "packages/worker-transport/src/wss-adapter.ts",
  "packages/cloud-netsons/src/composition.ts",
  "packages/cloud-aws/src/composition.ts",
  "apps/api/src/cloud-composition.ts",
  "docs/milestones/M19-closure.md",
  "spec/CONFORMANCE.md",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-architecture.mjs"]);

run("pnpm", [
  "--filter",
  "@kivro/cloud-core",
  "run",
  "build",
]);
run("pnpm", ["--filter", "@kivro/worker-transport", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-netsons", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-aws", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/run-backend-conformance.mjs"]);
run("node", ["scripts/sync-m19-coverage.mjs"]);
run("pnpm", ["verify:m18"]);

console.log("M19 verify flow passed (unified backend composition + dual-root conformance)");
