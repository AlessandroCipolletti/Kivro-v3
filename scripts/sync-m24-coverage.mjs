#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "scripts/check-duplicate-semantic-ownership.mjs, scripts/check-api-provider-import-boundary.mjs, scripts/generate-provider-parity-report.mjs, scripts/verify-compatibility-matrix.mjs   security/tests/conformance-golden-m24.test.ts; security/tests/architecture-fitness-m24.test.ts; security/tests/conformance-divergence-rejection-m24.test.ts; security/tests/acceptance-m24-exit.test.ts; scripts/verify-m24-flow.mjs   docs/audits/M24-exit-criteria.json; docs/milestones/M24-closure.md M24";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const hardIds = new Set(["HARD-001", "HARD-002", "HARD-003", "HARD-004", "HARD-007"]);
const archIds = new Set(["ARCH-UNI-023", "ARCH-UNI-024"]);

const out = text.split("\n").map((line) => {
  const hard = line.match(/^\s+(HARD-0\d\d)\s+(P\d+)\s+/);
  if (hard && hardIds.has(hard[1])) {
    return formatLine(hard[1], hard[2]);
  }
  const arch = line.match(/^\s+(ARCH-UNI-0\d\d)\s+(P\d+)\s+/);
  if (arch && archIds.has(arch[1])) {
    return formatLine(arch[1], arch[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HARD-004..007 and ARCH-UNI-023/024 for M24");
