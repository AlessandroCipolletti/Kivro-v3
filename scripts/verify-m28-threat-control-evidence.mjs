#!/usr/bin/env node
/** M28 / HARD-017 — threat model doc references evidence chain (not doc-only). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const threatPath = path.join(root, "security/THREAT_MODEL.md");
const doc = fs.readFileSync(threatPath, "utf8");

for (const token of ["SECURITY-EVIDENCE", "§91", "release gate"]) {
  if (!doc.includes(token)) {
    console.error(`THREAT_MODEL.md missing reference: ${token}`);
    process.exit(1);
  }
}

if (!fs.existsSync(path.join(root, "spec/SECURITY-EVIDENCE.md"))) {
  console.error("Missing spec/SECURITY-EVIDENCE.md");
  process.exit(1);
}

if (!fs.existsSync(path.join(root, "scripts/verify-release-gate-evidence.mjs"))) {
  console.error("Missing scripts/verify-release-gate-evidence.mjs");
  process.exit(1);
}

const securityTests = [
  "security/tests/adversarial-m04.test.ts",
  "security/tests/adversarial-m06.test.ts",
  "security/tests/fault-injection-convergence-m26.test.ts",
];
for (const rel of securityTests) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`Missing threat-control test evidence: ${rel}`);
    process.exit(1);
  }
}

console.log(
  "M28 threat-control evidence chain OK (THREAT_MODEL → SECURITY-EVIDENCE → release gate + adversarial/fault tests)",
);
