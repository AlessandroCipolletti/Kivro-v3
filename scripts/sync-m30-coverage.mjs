#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const impl =
  "packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts";
const tests =
  "packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs";
const notes = "docs/milestones/M30-closure.md M30";

const m30Ids = [
  ...Array.from({ length: 14 }, (_, i) => `BUYERUX-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, i) => `BUYERUX-${String(i + 25).padStart(3, "0")}`),
  ...Array.from({ length: 11 }, (_, i) => `BUYERUX-${String(i + 35).padStart(3, "0")}`),
];

const p1 = new Set(["BUYERUX-009", "BUYERUX-011", "BUYERUX-013", "BUYERUX-029"]);

const out = text.split("\n").map((line) => {
  for (const id of m30Ids) {
    const m = line.match(new RegExp(`^\\s+${id}\\s+`));
    if (m) {
      const p = p1.has(id) ? "P1" : "P0";
      return `  ${id}   ${p}         TESTED   ${impl}   ${tests}   ${notes}`;
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log(`Updated COVERAGE.md ${m30Ids.length} BUYERUX rows for M30`);
