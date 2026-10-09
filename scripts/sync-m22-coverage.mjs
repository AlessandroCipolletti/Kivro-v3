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

const portIds = new Set(["PORT-005", "PORT-008", "PORT-012", "PORT-016"]);

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(PORT-0\d\d)\s+(P\d+)\s+/);
  if (m && portIds.has(m[1])) {
    return formatLine(m[1], m[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md PORT-* rows for M22");
