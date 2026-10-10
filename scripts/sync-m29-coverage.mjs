#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const impl =
  "packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts";
const tests =
  "packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs";
const notes = "docs/milestones/M29-closure.md M29";

const rows = {};
for (let i = 1; i <= 30; i += 1) {
  const id = `ASYNC-${String(i).padStart(3, "0")}`;
  const p = i === 18 || i === 20 ? "P1" : "P0";
  rows[id] = { p };
}

const out = text.split("\n").map((line) => {
  for (const [id, meta] of Object.entries(rows)) {
    const m = line.match(new RegExp(`^\\s+${id}\\s+`));
    if (m) {
      return `  ${id}   ${meta.p}         TESTED   ${impl}   ${tests}   ${notes}`;
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md ASYNC-001..030 for M29 durable async delivery");
