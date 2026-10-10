#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const evidence =
  "packages/release-ops, packages/cloud-core/src/postgres-durable-work.ts, docs/audits/M27-performance-envelope.json   packages/release-ops/src/*.test.ts; security/tests/release-activation-m27.test.ts; security/tests/release-activation-rejection-m27.test.ts; security/tests/performance-envelope-m27.test.ts; scripts/check-bounded-runtime-vs-envelope.mjs; scripts/verify-m27-flow.mjs   docs/audits/M27-exit-criteria.json; docs/audits/M27-fitness-report.json; docs/milestones/M27-closure.md M27";

function formatLine(id, priority) {
  const [impl, tests, ...noteParts] = evidence.split("   ");
  const notes = noteParts.join("   ");
  return `  ${id}   ${priority}         TESTED   ${impl}   ${tests}   ${notes}`;
}

const ids = new Set(["HARD-019", "HARD-020", "HARD-027", "HARD-028"]);

const out = text.split("\n").map((line) => {
  const m = line.match(/^\s+(\S+)\s+(P\d+)\s+/);
  if (m && ids.has(m[1])) {
    return formatLine(m[1], m[2]);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md HARD-019/020/027/028 for M27");
