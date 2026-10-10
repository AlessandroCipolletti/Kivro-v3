#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const m32Ids = [
  ...Array.from({ length: 12 }, (_, i) => `SELLERUX-${String(i + 1).padStart(3, "0")}`),
  "SELLERUX-022",
  "SELLERUX-023",
  "SELLERUX-031",
  "SELLERUX-032",
  "SELLERUX-033",
  "SELLERUX-034",
  "SELLERUX-035",
  "SELLERUX-039",
];

const rows = loadCoverageFromRepo(root).filter((r) => m32Ids.includes(r.id));
const notTested = rows.filter((r) => r.status !== "TESTED");
const missingEvidence = rows.filter((r) => !r.tests || r.tests.includes("---"));

const pass = notTested.length === 0 && missingEvidence.length === 0;
const out = {
  generatedAt: new Date().toISOString(),
  pass,
  checked: rows.length,
  notTested: notTested.map((r) => r.id),
  missingEvidence: missingEvidence.map((r) => r.id),
};

fs.writeFileSync(path.join(root, "docs/audits/M32-spotcheck.json"), `${JSON.stringify(out, null, 2)}\n`);

if (!pass) {
  console.error(
    `M32 SELLERUX spotcheck FAIL — notTested=${notTested.length} missingEvidence=${missingEvidence.length}`,
  );
  process.exit(1);
}

console.log(`M32 SELLERUX spotcheck OK (${rows.length} rows)`);
