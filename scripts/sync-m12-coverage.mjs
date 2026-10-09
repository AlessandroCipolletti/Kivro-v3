#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const healthEvidence =
  "packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation";

const emergencyEvidence =
  "apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI";

const cliHealthEvidence =
  "apps/worker/src/cli.ts, apps/api/src/routes/worker-health.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md kivro-worker health";

const m12Sections = new Map([
  ["§373", healthEvidence],
  ["§374", healthEvidence],
  ["§375", healthEvidence],
  ["§376", healthEvidence],
  ["§377", healthEvidence],
  ["§378", healthEvidence],
  ["§379", cliHealthEvidence],
  ["§382", emergencyEvidence],
  ["§383", emergencyEvidence],
  ["§384", emergencyEvidence],
  ["§385", emergencyEvidence],
]);

const out = text.split("\n").map((line) => {
  const m = line.match(/(§\d+)\s+/);
  if (!m || !m12Sections.has(m[1])) {
    return line;
  }
  if (!line.includes("`TODO`") && !line.includes("`PARTIAL`")) {
    return line;
  }
  const evidence = m12Sections.get(m[1]);
  return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M12 (bounded §373–§379, §382–§385 subset)");
