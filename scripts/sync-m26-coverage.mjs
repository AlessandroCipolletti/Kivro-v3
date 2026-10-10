#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "packages/resilience, packages/billing/src/job-completion.ts, docs/deploy/backup-restore-runbook.md   packages/resilience/src/convergence.test.ts; packages/billing/src/job-completion-idempotency.test.ts; security/tests/fault-injection-convergence-m26.test.ts; security/tests/fault-injection-control-plane-m26.test.ts; scripts/verify-m26-flow.mjs   docs/audits/M26-exit-criteria.json; docs/audits/M26-rpo-rto.json; docs/milestones/M26-closure.md M26";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const ids = new Set(["HARD-005", "HARD-006", "HARD-014", "HARD-015", "HARD-016"]);

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(\S+)\s+(P\d+)\s+/);
  if (m && ids.has(m[1])) {
    return formatLine(m[1], m[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HARD-005/006/014/015/016 for M26");
