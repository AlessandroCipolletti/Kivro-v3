#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const m33Ids = [
  ...Array.from({ length: 9 }, (_, i) => `SELLERUX-${String(i + 13).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, i) => `SELLERUX-${String(i + 24).padStart(3, "0")}`),
  "SELLERUX-038",
  "SELLERUX-040",
  "SELLERUX-041",
];

const rows = loadCoverageFromRepo(root).filter((r) => m33Ids.includes(r.id));
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

fs.writeFileSync(path.join(root, "docs/audits/M33-spotcheck.json"), `${JSON.stringify(out, null, 2)}\n`);

if (!pass) {
  console.error(
    `M33 SELLERUX spotcheck FAIL — notTested=${notTested.length} missingEvidence=${missingEvidence.length}`,
  );
  process.exit(1);
}

console.log(`M33 SELLERUX spotcheck OK (${rows.length} rows)`);
