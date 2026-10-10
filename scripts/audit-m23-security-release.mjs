#!/usr/bin/env node
/** HARD-018 / §91 — run security release gate tests (sandbox, network, payment, CP routing, assets). */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");

const gatePath = path.join(root, "tests/fixtures/security-release-gate.json");
const gate = JSON.parse(fs.readFileSync(gatePath, "utf8"));

const hard018Extra = [
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/invariants.test.ts",
  "packages/worker-transport/src/multi-transport.test.ts",
];

const testFiles = new Set();
for (const row of gate.automated) {
  for (const rel of row.tests) {
    if (rel.endsWith(".test.ts")) {
      testFiles.add(rel);
    }
  }
}
for (const rel of hard018Extra) {
  testFiles.add(rel);
}

for (const rel of testFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`HARD-018 missing test file: ${rel}`);
    process.exit(1);
  }
}

const res = spawnSync(
  "pnpm",
  ["exec", "vitest", "run", ...[...testFiles].sort()],
  { cwd: root, stdio: "inherit" },
);
if (res.status !== 0) {
  process.exit(res.status ?? 1);
}

if (!fs.existsSync(path.join(root, "security/THREAT_MODEL.md"))) {
  console.error("HARD-017 missing security/THREAT_MODEL.md");
  process.exit(1);
}

console.log(
  `M23 security release audit OK (${testFiles.size} vitest files, ${gate.automated.length} §91 gate rows)`,
);
