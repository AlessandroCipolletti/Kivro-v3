#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const sections = new Set([
  "§426",
  "§427",
  "§428",
  "§429",
  "§430",
  "§431",
  "§432",
  "§433",
  "§434",
  "§435",
  "§436",
  "§437",
  "§438",
  "§439",
  "§440",
  "§441",
  "§442",
  "§443",
  "§444",
  "§445",
  "§446",
  "§447",
  "§448",
  "§449",
  "§450",
]);

const evidence =
  "packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07";

const uiEvidence =
  "apps/api/routes/seller-control-ui.ts, apps/api/routes/seller-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07";

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m || !sections.has(m[1])) {
    return line;
  }
  if (
    line.includes("JOB-0135") ||
    line.includes("JOB-0136") ||
    line.includes("JOB-0171") ||
    line.includes("JOB-0172") ||
    line.includes("JOB-0173")
  ) {
    if (line.includes("`PARTIAL`") || line.includes("`TODO`")) {
      return line.replace(/`(PARTIAL|TODO)`\s+[^\n]+M07$/, `\`TESTED\`   ${uiEvidence}`);
    }
    return line;
  }
  if (!line.includes("`TODO`")) {
    return line;
  }
  return line.replace(/`TODO`\s+---\s+---\s+---/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));

const job46 = out
  .map((line) =>
    line.includes("JOB-0046") && line.includes("`PARTIAL`")
      ? line.replace(/`PARTIAL`\s+[^\n]+M04$/, `\`TESTED\`   packages/openclaw-adapter, packages/job-dispatch   vitest   synthetic execution + pause/resume M07`)
      : line,
  )
  .map((line) =>
    line.includes("JOB-0047") && line.includes("`PARTIAL`")
      ? line.replace(/`PARTIAL`\s+[^\n]+M04$/, `\`TESTED\`   packages/openclaw-adapter, packages/sandbox/supervisor.ts   vitest   pause supervision M07`)
      : line,
  );

fs.writeFileSync(file, job46.join("\n"));
console.log("Updated COVERAGE for M07 sections");
