#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const gate = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/security-release-gate.json"), "utf8"),
);

let missing = 0;
for (const row of gate.automated) {
  for (const rel of row.tests) {
    if (!fs.existsSync(path.join(root, rel))) {
      console.error(`§91 gate missing test: ${rel} (${row.item})`);
      missing += 1;
    }
  }
}
if (missing) process.exit(1);
console.log(`Security release gate evidence OK (${gate.automated.length} automated rows)`);
