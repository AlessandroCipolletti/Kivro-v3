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
  "docs/milestones/M24-closure.md",
  "docs/milestones/M24-manual-validation.md",
  "scripts/check-duplicate-semantic-ownership.mjs",
  "scripts/verify-golden-registry.mjs",
  "scripts/generate-provider-parity-report.mjs",
  "tests/fixtures/backend-conformance-golden.json",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing ${required}`);
    process.exit(1);
  }
}

run("node", ["scripts/check-architecture.mjs"]);
run("node", ["scripts/check-composition-thinness.mjs"]);
run("node", ["scripts/check-duplicate-semantic-ownership.mjs"]);

run("pnpm", ["--filter", "@kivro/cloud-core", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-netsons", "run", "build"]);
run("pnpm", ["--filter", "@kivro/cloud-aws", "run", "build"]);
run("node", ["scripts/generate-provider-parity-report.mjs"]);

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "security/tests/architecture-fitness-m24.test.ts",
  "security/tests/conformance-golden-m24.test.ts",
  "security/tests/conformance-golden-m19.test.ts",
  "security/tests/architecture-uni-023-m19.test.ts",
  "security/tests/conformance-both-roots-m19.test.ts",
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/acceptance-m24.test.ts",
]);

run("node", ["scripts/verify-golden-registry.mjs"]);
run("node", ["scripts/sync-m24-coverage.mjs"]);
run("pnpm", ["verify:m23"]);

console.log("M24 verify flow passed (architecture fitness + golden conformance hardening)");
