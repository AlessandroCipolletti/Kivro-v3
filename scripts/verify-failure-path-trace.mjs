#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const trace = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/failure-path-trace.json"), "utf8"),
);

let missing = 0;
for (const rel of trace.evidence) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`§89 missing evidence: ${rel}`);
    missing += 1;
  }
}
if (missing) process.exit(1);
console.log(`Failure-path trace OK (${trace.sequence.length} stages)`);
