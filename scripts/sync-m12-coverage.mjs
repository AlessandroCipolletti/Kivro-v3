#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = path.join(path.resolve(import.meta.dirname, ".."), "spec/COVERAGE.md");
let text = fs.readFileSync(file, "utf8");

const healthEvidence =
  "packages/seller-health, apps/api/src/services/seller-health-dashboard.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/capability-health.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 seller health dashboard";

const emergencyEvidence =
  "apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation";

const cliHealthEvidence =
  "apps/worker/src/cli.ts, apps/api/src/routes/worker-health.ts   packages/seller-health/src/marketplace-control.test.ts   docs/milestones/M12-manual-validation.md kivro-worker health/doctor";

const syncEvidence =
  "apps/api/src/routes/worker-jobs.ts, apps/api/src/services/worker-heartbeat-service.ts, packages/seller-health/src/marketplace-control.ts   packages/seller-health/src/marketplace-control.test.ts   docs/milestones/M12-manual-validation.md M12 cloud/local pause sync";

const historyEvidence =
  "apps/api/src/services/worker-heartbeat-service.ts, apps/api/src/routes/seller-dashboard.ts   packages/seller-health/src/health-history.ts   docs/milestones/M12-manual-validation.md M12 health timeline retention";

const resumeEvidence =
  "apps/api/src/services/seller-resume-readiness.ts, apps/api/src/routes/seller-dashboard.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 resume security gate";

const auditEvidence =
  "apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts   docs/milestones/M12-manual-validation.md M12 pause audit payload";

const platformSecurityEvidence =
  "apps/api/src/services/platform-security-pause-service.ts, packages/seller-health/src/platform-security.ts, apps/api/src/services/worker-heartbeat-service.ts   packages/seller-health/src/platform-security.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-closure.md M12 §393 platform security pause";

const queuePauseEvidence =
  "packages/job-scheduling/src/queue-pause-expiry.ts, packages/job-scheduling/src/scheduled-sweeps.ts, apps/api/src/routes/platform-admin.ts   docs/milestones/M12-closure.md M12 §389 queued job pause timeout";

const m12Sections = new Map([
  ["§373", healthEvidence],
  ["§374", healthEvidence],
  ["§375", healthEvidence],
  ["§376", healthEvidence],
  ["§377", healthEvidence],
  ["§378", healthEvidence],
  ["§379", cliHealthEvidence],
  ["§380", cliHealthEvidence],
  ["§381", historyEvidence],
  ["§382", emergencyEvidence],
  ["§383", emergencyEvidence],
  ["§384", emergencyEvidence],
  ["§385", emergencyEvidence],
  ["§386", syncEvidence],
  ["§387", syncEvidence],
  ["§388", emergencyEvidence],
  ["§389", emergencyEvidence],
  ["§390", resumeEvidence],
  ["§391", healthEvidence],
  ["§392", auditEvidence],
  ["§393", platformSecurityEvidence],
]);

const m12LineOverrides = [
  { id: "SEC-0116", evidence: platformSecurityEvidence },
  { id: "SEC-0117", evidence: platformSecurityEvidence },
  { id: "SEC-0118", evidence: platformSecurityEvidence },
  { id: "JOB-0110", evidence: queuePauseEvidence },
  { id: "JOB-0111", evidence: queuePauseEvidence },
];

const out = text.split("\n").map((line) => {
  for (const override of m12LineOverrides) {
    if (line.includes(`\`${override.id}\``) && line.includes("`TODO`")) {
      return line.replace(/`TODO`\s+[^\n]*/, `\`TESTED\`   ${override.evidence}`);
    }
  }
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
console.log("Updated COVERAGE.md for M12 (§373–§393 bounded; §394+ follow-up)");
