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
  "docs/RELEASE-GATES.md",
  "docs/API-CONTRACT-MVP.md",
  "docs/MVP-SUCCESS-CHECKLIST.md",
  "tests/fixtures/catalog.json",
  "docs/milestones/M16-closure.md",
  "docs/testing/HAPPY-PATH-TRACE.md",
  "docs/testing/PRODUCT-RELEASE-GATE.md",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/verify-fixtures-catalog.mjs"]);
run("node", ["scripts/verify-api-contract-mvp.mjs"]);
run("node", ["scripts/verify-repo-structure.mjs"]);
run("node", ["scripts/verify-happy-path-trace.mjs"]);
run("node", ["scripts/verify-failure-path-trace.mjs"]);
run("node", ["scripts/verify-integration-matrix.mjs"]);
run("node", ["scripts/verify-release-gate-evidence.mjs"]);
run("node", ["scripts/verify-code-quality-gate.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/acceptance-m16.test.ts",
  "security/tests/e2e-fixtures-m16.test.ts",
  "security/tests/fixture-ad-m06.test.ts",
  "security/tests/invariants.test.ts",
]);

run("node", ["scripts/sync-m16-coverage.mjs"]);

run("pnpm", ["exec", "node", "scripts/check-architecture.mjs"]);

run("pnpm", ["--filter", "@kivro/api", "run", "typecheck"]);
run("pnpm", ["--filter", "@kivro/web", "run", "typecheck"]);

console.log("M16 verify flow passed (§573 full paid local E2E → M18 test:e2e:local)");
