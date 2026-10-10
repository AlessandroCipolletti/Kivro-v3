#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "packages/compatibility, scripts/generate-unified-release-manifest.mjs, scripts/verify-schema-rollout-discipline.mjs   packages/compatibility/src/*.test.ts; security/tests/compatibility-fail-closed-m25.test.ts; security/tests/worker-backend-transition-m25.test.ts; security/tests/conformance-dual-control-plane-restart-m25.test.ts; scripts/verify-m25-flow.mjs   docs/audits/M25-exit-criteria.json; docs/milestones/M25-closure.md M25";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const ids = new Set([
  "HARD-007",
  "HARD-008",
  "HARD-009",
  "HARD-010",
  "HARD-011",
  "HARD-012",
  "HARD-013",
  "WRK-0046",
]);

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(\S+)\s+(P\d+)\s+/);
  if (m && ids.has(m[1])) {
    return formatLine(m[1], m[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HARD-007..013 and WRK-0046 for M25");
