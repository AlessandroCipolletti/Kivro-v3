#!/usr/bin/env node
/** HARD-016 — shared packages must not treat Redis as authoritative job/payment store. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sharedDir = path.join(root, "packages");
const forbiddenPatterns = [
  /redis.*authoritative/i,
  /primary.*job.*state.*redis/i,
  /ledger.*redis/i,
];

let violations = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walk(full);
      continue;
    }
    if (!name.endsWith(".ts")) continue;
    const rel = path.relative(root, full);
    if (rel.includes("redis-policy.ts")) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(text)) {
        violations.push(`${rel}: ${pattern}`);
      }
    }
  }
}

for (const pkg of fs.readdirSync(sharedDir)) {
  const src = path.join(sharedDir, pkg, "src");
  if (fs.existsSync(src)) walk(src);
}

if (violations.length) {
  console.error("Redis authoritative violations:\n" + violations.join("\n"));
  process.exit(1);
}

console.log("Redis non-authoritative policy check OK (HARD-016)");
