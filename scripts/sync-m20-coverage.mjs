#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(HOST-NET-\d+)\s+(P\d+)\s+/);
  if (m) {
    return formatLine(m[1], m[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HOST-NET-* for M20");
