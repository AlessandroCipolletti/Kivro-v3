#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "packages/cloud-netsons, apps/api/src/routes/platform-cron.ts, docs/deploy/netsons   security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20 Netsons adapter+shared";

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
