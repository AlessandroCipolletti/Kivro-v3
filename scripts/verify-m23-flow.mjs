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
  "docs/audits/M23-mandatory-audit-matrix.md",
  "scripts/audit-m23-unified.mjs",
  "scripts/lib/compliance-audit-core.mjs",
  "scripts/lib/m23-mandatory-runs.mjs",
  "scripts/verify-m23-staging-bundle.mjs",
  "scripts/audit-m23-security-release.mjs",
  "scripts/audit-m23-exit-criteria.mjs",
  "scripts/audit-m23-master-spec-sampling.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["--filter", "@kivro/contracts", "run", "build"]);
run("pnpm", ["--filter", "@kivro/api", "run", "build"]);

run("node", ["scripts/generate-section-milestone-index.mjs"]);
run("node", ["scripts/apply-m17-schedule-notes.mjs"]);
run("node", ["scripts/apply-m23-schedule-notes.mjs"]);
run("node", ["scripts/audit-m23-unified.mjs"]);
run("node", ["scripts/audit-m23-master-spec-sampling.mjs"]);
run("node", ["scripts/audit-m23-exit-criteria.mjs"]);
run("node", ["scripts/audit-m17-compliance.mjs"]);
run("node", ["scripts/audit-m23-security-release.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m23.test.ts",
  "security/tests/conformance-unified-audit-m23.test.ts",
  "security/tests/acceptance-m17.test.ts",
  "security/tests/invariants.test.ts",
  "security/tests/acceptance-m08.test.ts",
]);

run("node", ["scripts/sync-m23-coverage.mjs"]);
run("node", ["scripts/verify-m23-staging-bundle.mjs"]);
run("pnpm", ["verify:m22"]);

console.log("M23 verify flow passed (unified compliance audit through M22 + verify:m22 regression)");
