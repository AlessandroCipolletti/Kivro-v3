#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const trace = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/happy-path-trace.json"), "utf8"),
);

let missing = 0;
for (const step of trace.steps) {
  for (const rel of step.evidence) {
    const full = path.join(root, rel);
    const ok = fs.existsSync(full);
    if (!ok) {
      console.error(`§88 step ${step.n} missing evidence: ${rel}`);
      missing += 1;
    }
  }
}
if (missing) process.exit(1);
console.log(`Happy-path trace OK (${trace.steps.length} steps)`);
