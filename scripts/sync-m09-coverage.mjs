#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const sections = new Set(["§26"]);
for (let n = 396; n <= 419; n++) {
  sections.add(`§${n}`);
}
for (let n = 462; n <= 472; n++) {
  sections.add(`§${n}`);
}

const evidence =
  "packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09";

const deferredUi = new Set(["§400", "§405", "§407"]);

const avlCore =
  "packages/job-scheduling/src/availability-status.ts, packages/job-scheduling/src/availability-service.ts, packages/job-scheduling/src/submission-gate.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09";

const out = text.split("\n").map((line) => {
  if (line.includes("`AVL-0001`") && line.includes("`PARTIAL`")) {
    return line.replace(/`PARTIAL`\s+[^\n]+/, `\`TESTED\`   ${avlCore}`);
  }
  if (line.includes("`AVL-0002`") && line.includes("`PARTIAL`")) {
    return line.replace(/`PARTIAL`\s+[^\n]+/, `\`TESTED\`   ${avlCore}`);
  }
  const m = line.match(/(§\d+)\s+/);
  if (!m || !sections.has(m[1])) {
    return line;
  }
  if (line.includes("`TODO`")) {
    if (deferredUi.has(m[1])) {
      return line.replace(
        /`TODO`\s+---\s+---\s+---/,
        `\`PARTIAL\`   ${evidence}   product UI deferred M10+; core API/semantics implemented`,
      );
    }
    return line.replace(/`TODO`\s+---\s+---\s+---/, `\`TESTED\`   ${evidence}`);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M09 sections");
