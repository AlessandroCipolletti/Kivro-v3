#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
const text = fs.readFileSync(file, "utf8");

const impl =
  "packages/job-scheduling/src/worker-routing.ts, packages/job-scheduling/src/worker-assignment.ts, packages/job-scheduling/src/availability-service.ts, packages/job-dispatch/src/dispatch-service.ts, apps/api/src/routes/seller-workers.ts, apps/web/src/app/seller/workers/page.tsx";
const tests =
  "packages/job-scheduling/src/worker-routing.test.ts; security/tests/conformance-sellerux-gold-m34.test.ts; security/tests/seller-workers-auth-m34.test.ts; scripts/verify-m34-flow.mjs";
const notes = "docs/milestones/M34-closure.md M34";

const ids = ["SELLERUX-036", "SELLERUX-037"];
const out = text.split("\n").map((line) => {
  for (const id of ids) {
    if (new RegExp(`^\\s+${id}\\s+`).test(line)) {
      return `  ${id}   P0         TESTED   ${impl}   ${tests}   ${notes}`;
    }
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md SELLERUX-036/037 for M34");
