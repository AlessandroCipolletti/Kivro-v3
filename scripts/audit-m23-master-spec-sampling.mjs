#!/usr/bin/env node
/** Spot-check TESTED COVERAGE claims (M23: do not trust COVERAGE without code/tests). */
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";
import { evidencePaths, looksLikeRepoPath, pathExists } from "./lib/evidence-path.mjs";

const root = path.resolve(import.meta.dirname, "..");
const rows = loadCoverageFromRepo(root).filter((r) => r.status === "TESTED" && r.priority === "P0");

const sampleSize = Math.min(40, rows.length);
const step = Math.max(1, Math.floor(rows.length / sampleSize));
const sample = [];
for (let i = 0; i < rows.length && sample.length < sampleSize; i += step) {
  sample.push(rows[i]);
}

let missing = 0;
for (const row of sample) {
  const paths = [...evidencePaths(row.implementation), ...evidencePaths(row.tests)].filter((p) =>
    looksLikeRepoPath(p),
  );
  for (const p of paths) {
    if (p.includes("*")) continue;
    if (!pathExists(root, p)) {
      console.error(`Sample miss ${row.id}: ${p}`);
      missing += 1;
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  p0TestedPopulation: rows.length,
  sampleSize: sample.length,
  sampleMissingPaths: missing,
  pass: missing === 0,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M23-master-spec-sample-audit.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (missing > 0) {
  console.error(`M23 master spec sample audit FAIL (${missing} missing paths in sample)`);
  process.exit(1);
}

console.log(`M23 master spec sample audit OK (${sample.length} P0 TESTED rows spot-checked)`);
