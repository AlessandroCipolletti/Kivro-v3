#!/usr/bin/env node
/**
 * Master Spec §94 — repo-level quality gates (names only in .env.example, lockfile present).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const required = [
  ".env.example",
  "pnpm-lock.yaml",
  ".github/workflows/ci.yml",
  "security/SECURITY_INVARIANTS.md",
];

let missing = 0;
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`§94 missing: ${rel}`);
    missing += 1;
  }
}

const example = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (/sk_live_|AKIA[0-9A-Z]{16}/.test(example)) {
  console.error("§94 .env.example must not contain secret-like values");
  missing += 1;
}

if (missing) process.exit(1);
console.log("Code quality gate §94 OK");
