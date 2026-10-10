#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";
import { looksLikeRepoPath, pathExists } from "./lib/evidence-path.mjs";

const root = path.resolve(import.meta.dirname, "..");
const m30Ids = [
  ...Array.from({ length: 14 }, (_, i) => `BUYERUX-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, i) => `BUYERUX-${String(i + 25).padStart(3, "0")}`),
  ...Array.from({ length: 11 }, (_, i) => `BUYERUX-${String(i + 35).padStart(3, "0")}`),
];

const rows = loadCoverageFromRepo(root).filter((r) => m30Ids.includes(r.id));
const notTested = rows.filter((r) => r.status !== "TESTED");
const missingEvidence = [];

for (const row of rows.filter((r) => r.status === "TESTED")) {
  const impl = row.implementation.split(";")[0]?.trim();
  if (impl && looksLikeRepoPath(impl.split(",")[0]?.trim() ?? "")) {
    const p = impl.split(",")[0].trim();
    if (!p.includes("*") && !pathExists(root, p)) {
      missingEvidence.push({ id: row.id, path: p });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  buyeruxRowCount: rows.length,
  notTestedCount: notTested.length,
  missingEvidenceCount: missingEvidence.length,
  pass: notTested.length === 0 && missingEvidence.length === 0,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M30-spotcheck.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (!report.pass) {
  console.error(
    `M30 BUYERUX spotcheck FAIL — notTested=${notTested.length} missingEvidence=${missingEvidence.length}`,
  );
  process.exit(1);
}

console.log(`M30 BUYERUX spotcheck OK (${rows.length} rows)`);
