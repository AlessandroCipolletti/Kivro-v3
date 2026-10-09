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
  "docs/milestones/M17-closure.md",
  "spec/compliance/section-milestone-index.json",
  "docs/audits/M17-compliance-report.json",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/generate-section-milestone-index.mjs"]);
run("node", ["scripts/apply-m17-schedule-notes.mjs"]);
run("node", ["scripts/audit-m17-compliance.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m17.test.ts",
  "security/tests/acceptance-m16.test.ts",
]);

run("node", ["scripts/sync-m17-coverage.mjs"]);

run("pnpm", ["verify:m16"]);

console.log("M17 verify flow passed (full spec compliance tracking — implementation continues M18+)");
