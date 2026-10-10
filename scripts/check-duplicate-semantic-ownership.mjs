#!/usr/bin/env node
/** M24 / CONFORMANCE architecture fitness — provider adapters must not own shared domain logic. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const providerRoots = ["packages/cloud-netsons/src", "packages/cloud-aws/src"];

const forbiddenPatterns = [
  { re: /\bfrom\s+["']@kivro\/job-dispatch["']/, label: "job-dispatch import" },
  { re: /\bfrom\s+["']@kivro\/billing["']/, label: "billing import" },
  { re: /\bfrom\s+["']@kivro\/job-control["']/, label: "job-control import" },
  { re: /\bdispatchJobToWorker\b/, label: "dispatchJobToWorker call" },
  { re: /\bassertJobTransition\b/, label: "assertJobTransition call" },
  { re: /\bmarkJobDeliveredAndSettle\b/, label: "markJobDeliveredAndSettle call" },
  { re: /\bprisma\.job\./, label: "direct prisma.job access" },
];

const violations = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name.endsWith(".test.ts")) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    if (!name.endsWith(".ts")) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const { re, label } of forbiddenPatterns) {
      if (re.test(text)) {
        violations.push(`${full}: ${label}`);
      }
    }
  }
}

for (const rel of providerRoots) {
  walk(path.join(root, rel));
}

if (violations.length > 0) {
  console.error("Duplicate semantic ownership check failed:");
  for (const v of violations) {
    console.error(`  ${v}`);
  }
  process.exit(1);
}

console.log("Duplicate semantic ownership check passed (provider packages stay thin)");
