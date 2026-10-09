#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const m17AuditEvidence =
  "docs/audits/M17-compliance-report.md, spec/compliance/section-milestone-index.json   scripts/audit-m17-compliance.mjs; security/tests/acceptance-m17.test.ts   docs/milestones/M17-closure.md M17";

const out = text.split("\n").map((line) => {
  if (line.includes("`HARD-018`") && line.includes("`TODO`")) {
    return line.replace(/`TODO`\s+[^\n]*/, `\`TESTED\`   ${m17AuditEvidence}`);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M17 audit evidence (HARD-018 if present)");
