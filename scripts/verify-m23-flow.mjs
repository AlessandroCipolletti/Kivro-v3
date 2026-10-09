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
  "docs/milestones/M23-closure.md",
  "docs/milestones/M23-manual-validation.md",
  "docs/audits/M23-readiness-checklist.md",
  "scripts/audit-m23-unified.mjs",
  "scripts/lib/compliance-audit-core.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/generate-section-milestone-index.mjs"]);
run("node", ["scripts/apply-m17-schedule-notes.mjs"]);
run("node", ["scripts/apply-m23-schedule-notes.mjs"]);
run("node", ["scripts/audit-m23-unified.mjs"]);
run("node", ["scripts/audit-m17-compliance.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m23.test.ts",
  "security/tests/acceptance-m17.test.ts",
]);

run("node", ["scripts/sync-m23-coverage.mjs"]);
run("pnpm", ["verify:m22"]);

console.log("M23 verify flow passed (unified compliance audit through M22 + verify:m22 regression)");
