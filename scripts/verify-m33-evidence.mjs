#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "docs/milestones/M33-closure.md",
  "packages/seller-experience/src/seller-operations-summary.ts",
  "packages/seller-experience/src/maintenance-mode.ts",
  "apps/api/src/routes/seller-operations.ts",
  "apps/web/src/app/seller/operations/page.tsx",
  "apps/web/src/app/seller/economics/page.tsx",
  "security/tests/conformance-sellerux-gold-m33.test.ts",
  "security/tests/seller-operations-auth-m33.test.ts",
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`Missing M33 evidence: ${rel}`);
    process.exit(1);
  }
}

console.log("M33 evidence paths OK");
