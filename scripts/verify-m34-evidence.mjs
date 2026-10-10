#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
for (const rel of [
  "docs/milestones/M34-closure.md",
  "packages/job-scheduling/src/worker-routing.ts",
  "packages/job-scheduling/src/worker-assignment.ts",
  "apps/api/src/routes/seller-workers.ts",
  "apps/web/src/app/seller/workers/page.tsx",
  "security/tests/conformance-sellerux-gold-m34.test.ts",
]) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`Missing M34 evidence: ${rel}`);
    process.exit(1);
  }
}
console.log("M34 evidence paths OK");
