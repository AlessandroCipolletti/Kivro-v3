#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const portIds = new Set([
  "PORT-001",
  "PORT-002",
  "PORT-003",
  "PORT-004",
  "PORT-005",
  "PORT-006",
  "PORT-007",
  "PORT-008",
  "PORT-009",
  "PORT-010",
  "PORT-012",
  "PORT-013",
  "PORT-015",
  "PORT-016",
  "PORT-018",
]);

const archUniM22 = new Set([
  "ARCH-UNI-017",
  "ARCH-UNI-018",
  "ARCH-UNI-019",
  "ARCH-UNI-020",
  "ARCH-UNI-021",
  "ARCH-UNI-022",
]);

const archEvidence =
  "packages/cloud-core, packages/job-dispatch, apps/api, apps/worker   security/tests/conformance-dual-control-plane-m22.test.ts; scripts/verify-m22-flow.mjs   docs/milestones/M22-closure.md M22 dual-CP";

function formatArchLine(id, priority) {
  const [impl, tests, ...noteParts] = archEvidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const out = text.split("\n").map((line) => {
  const port = line.match(/^\s+(PORT-0\d\d)\s+(P\d+)\s+/);
  if (port && portIds.has(port[1])) {
    return formatLine(port[1], port[2]);
  }
  const arch = line.match(/^\s+(ARCH-UNI-0\d\d)\s+(P\d+)\s+/);
  if (arch && archUniM22.has(arch[1])) {
    return formatArchLine(arch[1], arch[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md PORT-* and ARCH-UNI-* rows for M22");
