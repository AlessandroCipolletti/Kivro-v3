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
  "docs/milestones/M28-closure.md",
  "docs/milestones/M28-manual-validation.md",
  "docs/audits/M28-mandatory-audit-matrix.md",
  "docs/audits/M28-readiness-checklist.md",
  "scripts/audit-m28-unified.mjs",
  "scripts/audit-m28-exit-criteria.mjs",
  "scripts/audit-m28-open-requirements-catalog.mjs",
  "scripts/verify-m28-dual-control-plane-evidence.mjs",
  "scripts/verify-m28-threat-control-evidence.mjs",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("pnpm", ["verify:m27"]);

run("node", ["scripts/generate-section-milestone-index.mjs"]);
run("node", ["scripts/sync-m28-coverage.mjs"]);
run("node", ["scripts/audit-m28-open-requirements-catalog.mjs"]);
run("node", ["scripts/audit-m28-requirement-families.mjs"]);
run("node", ["scripts/audit-m28-master-spec-sampling.mjs"]);
run("node", ["scripts/audit-m28-unified.mjs"]);
run("node", ["scripts/audit-m23-security-release.mjs"]);
run("node", ["scripts/audit-m28-readiness-checklist.mjs"]);
run("node", ["scripts/audit-m28-refresh-m23-terminal.mjs"]);

run("node", ["scripts/audit-m28-exit-criteria.mjs"]);
run("node", ["scripts/audit-m28-fitness-report.mjs"]);
run("node", ["scripts/verify-golden-registry.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/conformance-unified-audit-m28.test.ts",
  "security/tests/acceptance-m28.test.ts",
  "security/tests/acceptance-m28-exit.test.ts",
  "security/tests/conformance-golden-m28.test.ts",
]);

console.log("M28 verify flow passed (terminal lossless compliance audit harness)");
