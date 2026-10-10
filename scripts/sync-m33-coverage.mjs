#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const impl =
  "packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx";
const tests =
  "packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs";
const notes = "docs/milestones/M33-closure.md M33";

const m33Ids = [
  ...Array.from({ length: 9 }, (_, i) => `SELLERUX-${String(i + 13).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, i) => `SELLERUX-${String(i + 24).padStart(3, "0")}`),
  "SELLERUX-038",
  "SELLERUX-040",
  "SELLERUX-041",
];

const p1 = new Set(["SELLERUX-017", "SELLERUX-021", "SELLERUX-038"]);

const out = text.split("\n").map((line) => {
  for (const id of m33Ids) {
    const m = line.match(new RegExp(`^\\s+${id}\\s+`));
    if (m) {
      const p = p1.has(id) ? "P1" : "P0";
      return `  ${id}   ${p}         TESTED   ${impl}   ${tests}   ${notes}`;
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log(`Updated COVERAGE.md ${m33Ids.length} SELLERUX rows for M33`);
