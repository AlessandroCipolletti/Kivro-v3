#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(root, "tests/fixtures/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

let missing = 0;
for (const entry of catalog.entries) {
  const full = path.join(root, entry.path);
  if (!fs.existsSync(full)) {
    console.error(`Missing fixture: ${entry.id} → ${entry.path}`);
    missing += 1;
  }
}
if (missing > 0) {
  process.exit(1);
}
console.log(`Fixture catalog OK (${catalog.entries.length} entries)`);
