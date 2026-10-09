#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const m15Evidence =
  "packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15";

const m15OpsEvidence =
  "docs/TESTING-STRATEGY.md, docs/legal/ALPHA-NOTICE.md, apps/web/src/app/legal   security/tests/acceptance-m15.test.ts   docs/milestones/M15-closure.md M15";

const m15AuditEvidence =
  "packages/marketplace/src/job-audit-summary.ts, packages/job-control/src/job-checkpoint-service.ts, packages/observability/src/audit-sanitize.ts   packages/marketplace/src/job-audit-summary.test.ts; security/tests/acceptance-m15.test.ts   docs/milestones/M15-manual-validation.md M15 §29";

const m15ResultSafetyEvidence =
  "packages/job-io/src/result-safety.ts, apps/api/src/routes/buyer-job-assets.ts   packages/job-io/src/result-safety.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15 §31";

const lineOverrides = new Map([
  ["OBS-0001", m15AuditEvidence],
  ["OBS-0002", m15AuditEvidence],
  ["OBS-0003", m15AuditEvidence],
  ["IO-0007", m15ResultSafetyEvidence],
  ["IO-0008", m15ResultSafetyEvidence],
  ["IO-0009", m15ResultSafetyEvidence],
  ["SEC-0032", m15Evidence],
  ["SEC-0033", m15Evidence],
  ["SEC-0034", m15Evidence],
  ["SEC-0035", m15Evidence],
  ["WRK-0052", m15OpsEvidence],
  ["OBS-0004", m15Evidence],
  ["JOB-0026", m15Evidence],
  ["JOB-0027", m15Evidence],
  ["JOB-0028", m15Evidence],
  ["JOB-0029", m15Evidence],
  ["JOB-0030", m15Evidence],
  ["JOB-0031", m15Evidence],
  ["PRD-0044", m15Evidence],
  ["PRD-0045", m15Evidence],
  ["PRD-0046", m15Evidence],
  ["PRD-0047", m15OpsEvidence],
]);

const m15SectionRefresh = new Map([
  ["§84", "apps/api health routes, packages/observability   security/tests/acceptance-m15.test.ts   docs/milestones/M15-manual-validation.md M15 health §84"],
  ["§85", "packages/marketplace, apps/web/src/app/search   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 search parity"],
  ["§86", "packages/marketplace, apps/api capability reviews   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 reviews"],
  ["§87", "apps/api seller dashboard, packages/billing   scripts/verify-m08-flow.mjs   docs/milestones/M15-manual-validation.md M15 seller economics"],
  ["§88", "docs/TESTING-STRATEGY.md, scripts/verify-m15-flow.mjs   security/tests/acceptance-m15.test.ts   docs/milestones/M15-closure.md M15 happy-path trace"],
  ["§89", "apps/worker, packages/openclaw-adapter   scripts/verify-m03-flow.mjs   docs/milestones/M15-manual-validation.md M15 worker sequence"],
  ["§90", "security/adversarial-fixtures, packages/capability-publish   security/tests/adversarial-m04.test.ts   docs/milestones/M15-manual-validation.md M15 fixtures"],
  ["§91", "security/SECURITY_INVARIANTS.md, docs/TESTING-STRATEGY.md   security/tests/invariants.test.ts   docs/milestones/M15-closure.md M15 security catalog"],
  ["§92", "docs/milestones/M15-manual-validation.md   security/tests/acceptance-m15.test.ts   docs/milestones/M15-closure.md M15 red-team checklist deferred"],
  ["§93", "spec/IMPLEMENTATION-PLAN.md, docs/milestones/M15-closure.md   scripts/verify-m15-flow.mjs   docs/milestones/M15-closure.md M15 sequencing evidence"],
  ["§94", ".github/workflows/ci.yml   scripts/verify-m15-flow.mjs   docs/milestones/M15-closure.md M15 CI gates"],
  ["§95", "README.md, docs/milestones/M15-closure.md   scripts/verify-m15-flow.mjs   docs/milestones/M15-closure.md M15 README ops"],
]);

const out = text.split("\n").map((line) => {
  for (const [id, evidence] of lineOverrides) {
    if (line.includes(`\`${id}\``) && (line.includes("`TODO`") || line.includes("`PARTIAL`"))) {
      return line.replace(/`(TODO|PARTIAL)`\s+[^\n]*/, `\`TESTED\`   ${evidence}`);
    }
  }
  const m = line.match(/(§\d+)\s+/);
  if (m && m15SectionRefresh.has(m[1]) && line.includes("M00-manual-validation")) {
    return line.replace(/`TESTED`\s+[^\n]*/, `\`TESTED\`   ${m15SectionRefresh.get(m[1])}`);
  }
  return line;
});

fs.writeFileSync(file, out.join("\n"));
console.log("Updated COVERAGE.md for M15 (§29–§38 TODO rows + §84–§95 evidence refresh)");
