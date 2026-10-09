#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/integration-test-matrix.json"), "utf8"),
);

let missing = 0;
for (const flow of matrix.flows) {
  const script = path.join(root, flow.verify);
  if (!fs.existsSync(script)) {
    console.error(`§34.2 missing verify script for "${flow.name}": ${flow.verify}`);
    missing += 1;
  }
}
if (missing) process.exit(1);
console.log(`Integration test matrix OK (${matrix.flows.length} flows)`);
