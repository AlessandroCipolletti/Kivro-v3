#!/usr/bin/env node
/** M24 — golden scenario registry must map to executable tests (both-provider neutral). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registryPath = path.join(root, "tests/fixtures/backend-conformance-golden.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const testCorpus = [
  "security/tests/conformance-golden-m19.test.ts",
  "security/tests/conformance-golden-m24.test.ts",
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/architecture-uni-023-m19.test.ts",
  "security/tests/conformance-both-roots-m19.test.ts",
]
  .map((rel) => fs.readFileSync(path.join(root, rel), "utf8"))
  .join("\n");

let missing = 0;
for (const scenario of registry.scenarios) {
  if (!scenario.id) {
    console.error("Scenario missing id");
    missing += 1;
    continue;
  }
  if (!testCorpus.includes(scenario.id)) {
    console.error(`Golden registry ${scenario.id} not referenced in conformance test suites`);
    missing += 1;
  }
}

if (missing > 0) {
  process.exit(1);
}

console.log(`Golden registry OK (${registry.scenarios.length} scenarios wired to tests)`);
