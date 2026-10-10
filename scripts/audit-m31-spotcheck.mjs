#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const m31Ids = [
  ...Array.from({ length: 10 }, (_, i) => `BUYERUX-${String(i + 15).padStart(3, "0")}`),
  "BUYERUX-032",
  "BUYERUX-033",
  "BUYERUX-034",
];

const rows = loadCoverageFromRepo(root).filter((r) => m31Ids.includes(r.id));
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

fs.writeFileSync(path.join(root, "docs/audits/M31-spotcheck.json"), `${JSON.stringify(out, null, 2)}\n`);

if (!pass) {
  console.error(
    `M31 BUYERUX spotcheck FAIL — notTested=${notTested.length} missingEvidence=${missingEvidence.length}`,
  );
  process.exit(1);
}

console.log(`M31 BUYERUX spotcheck OK (${rows.length} rows)`);
