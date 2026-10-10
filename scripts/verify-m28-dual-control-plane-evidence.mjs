#!/usr/bin/env node
/** M28 — dual control-plane transition evidence (M22/M25/M26), not COVERAGE claims alone. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const required = [
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/conformance-dual-control-plane-restart-m25.test.ts",
  "security/tests/fault-injection-control-plane-m26.test.ts",
  "docs/milestones/M22-closure.md",
  "packages/cloud-core/src/control-plane-policy.ts",
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`M28 dual control-plane evidence missing: ${rel}`);
    process.exit(1);
  }
}

console.log("M28 dual control-plane transition evidence OK (M22/M25/M26 tests + policy source)");
