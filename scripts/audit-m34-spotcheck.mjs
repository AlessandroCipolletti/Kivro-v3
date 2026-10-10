#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const ids = ["SELLERUX-036", "SELLERUX-037"];
const rows = loadCoverageFromRepo(root).filter((r) => ids.includes(r.id));
const notTested = rows.filter((r) => r.status !== "TESTED");
const missingEvidence = rows.filter((r) => !r.tests || r.tests.includes("---"));
const pass = notTested.length === 0 && missingEvidence.length === 0 && rows.length === ids.length;
const out = {
  generatedAt: new Date().toISOString(),
  pass,
  checked: rows.length,
  notTested: notTested.map((r) => r.id),
  missingEvidence: missingEvidence.map((r) => r.id),
};
fs.writeFileSync(path.join(root, "docs/audits/M34-spotcheck.json"), `${JSON.stringify(out, null, 2)}\n`);
if (!pass) {
  console.error("M34 SELLERUX spotcheck FAIL");
  process.exit(1);
}
console.log("M34 SELLERUX spotcheck OK");
