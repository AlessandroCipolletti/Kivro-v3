#!/usr/bin/env node
/** M29 — spot-check ASYNC-* COVERAGE rows are TESTED with evidence paths. */
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";
import { looksLikeRepoPath, pathExists } from "./lib/evidence-path.mjs";

const root = path.resolve(import.meta.dirname, "..");
const rows = loadCoverageFromRepo(root).filter((r) => r.id.startsWith("ASYNC-"));
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
  asyncRowCount: rows.length,
  notTestedCount: notTested.length,
  missingEvidenceCount: missingEvidence.length,
  pass: notTested.length === 0 && missingEvidence.length === 0,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M29-async-spotcheck.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (!report.pass) {
  console.error(
    `M29 ASYNC spotcheck FAIL — notTested=${notTested.length} missingEvidence=${missingEvidence.length}`,
  );
  process.exit(1);
}

console.log(`M29 ASYNC spotcheck OK (${rows.length} rows TESTED with primary evidence)`);
