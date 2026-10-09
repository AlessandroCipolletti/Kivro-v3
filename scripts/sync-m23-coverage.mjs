#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs   security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const hardIds = new Set(["HARD-018", "HARD-019", "HARD-020"]);

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(HARD-0\d\d)\s+(P\d+)\s+/);
  if (m && hardIds.has(m[1])) {
    return formatLine(m[1], m[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HARD-* audit rows for M23 (where present)");
