#!/usr/bin/env node
/** M27 — docs envelope must match synced test fixture (no silent drift). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = JSON.parse(
  fs.readFileSync(path.join(root, "docs/audits/M27-performance-envelope.json"), "utf8"),
);
const fixture = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/m27-performance-envelope.json"), "utf8"),
);

if (JSON.stringify(source) !== JSON.stringify(fixture)) {
  console.error("M27 performance envelope fixture drift — run sync-m27-performance-envelope-fixture.mjs");
  process.exit(1);
}

console.log("M27 performance envelope fixture OK (matches docs/audits artifact)");
