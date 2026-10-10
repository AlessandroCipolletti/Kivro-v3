#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const impl =
  "packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts";
const tests =
  "packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs";
const notes = "docs/milestones/M31-closure.md M31";

const m31Ids = [
  ...Array.from({ length: 10 }, (_, i) => `BUYERUX-${String(i + 15).padStart(3, "0")}`),
  "BUYERUX-032",
  "BUYERUX-033",
  "BUYERUX-034",
];

const p1 = new Set(["BUYERUX-015", "BUYERUX-016", "BUYERUX-019", "BUYERUX-021", "BUYERUX-032", "BUYERUX-033"]);

const out = text.split("\n").map((line) => {
  for (const id of m31Ids) {
    const m = line.match(new RegExp(`^\\s+${id}\\s+`));
    if (m) {
      const p = p1.has(id) ? "P1" : "P0";
      return `  ${id}   ${p}         TESTED   ${impl}   ${tests}   ${notes}`;
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log(`Updated COVERAGE.md ${m31Ids.length} BUYERUX rows for M31`);
