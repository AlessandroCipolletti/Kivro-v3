#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

/** Master Spec §40 suggested layout (adapted to this monorepo). */
const requiredDirs = [
  "apps/web",
  "apps/api",
  "apps/worker",
  "packages/contracts",
  "packages/openclaw-adapter",
  "packages/policy-engine",
  "packages/billing",
  "packages/observability",
  "security",
  "docs/architecture",
  "tests/fixtures",
];

let missing = 0;
for (const rel of requiredDirs) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`§40 missing directory: ${rel}`);
    missing += 1;
  }
}

const independentlyTestable = [
  "packages/job-protocol",
  "packages/policy-engine",
  "packages/openclaw-adapter",
];
for (const pkg of independentlyTestable) {
  const pkgJson = path.join(root, pkg, "package.json");
  if (!fs.existsSync(pkgJson)) {
    console.error(`§40 missing independently testable package: ${pkg}`);
    missing += 1;
  }
}

if (missing) process.exit(1);
console.log("Repository structure §40 OK");
