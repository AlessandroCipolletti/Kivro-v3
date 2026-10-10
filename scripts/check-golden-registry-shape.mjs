#!/usr/bin/env node
/** M24 — golden registry must stay provider-neutral and versioned. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(
  fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
);

if (!registry.version || registry.version < 2) {
  console.error("Golden registry must be version >= 2");
  process.exit(1);
}

const ids = new Set();
for (const scenario of registry.scenarios ?? []) {
  if (!/^(M\d{2}-GOLD-\d{3}|ASYNC-GOLD-\d{3})$/.test(scenario.id)) {
    console.error(`Invalid golden id format: ${scenario.id}`);
    process.exit(1);
  }
  if (ids.has(scenario.id)) {
    console.error(`Duplicate golden id: ${scenario.id}`);
    process.exit(1);
  }
  ids.add(scenario.id);
  if (scenario.profileSpecific === true) {
    console.error(`Forbidden profileSpecific golden: ${scenario.id}`);
    process.exit(1);
  }
}

const forbiddenGoldenFiles = [];
function walkTests(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walkTests(full);
      continue;
    }
    if (!name.endsWith(".test.ts")) continue;
    const lower = name.toLowerCase();
    if (
      (lower.includes("netsons") || lower.includes("aws")) &&
      lower.includes("golden")
    ) {
      forbiddenGoldenFiles.push(full);
    }
  }
}
walkTests(path.join(root, "security/tests"));

if (forbiddenGoldenFiles.length > 0) {
  console.error("Provider-specific golden test files forbidden:");
  for (const f of forbiddenGoldenFiles) {
    console.error(`  ${f}`);
  }
  process.exit(1);
}

console.log(`Golden registry shape OK (${ids.size} neutral scenarios)`);
