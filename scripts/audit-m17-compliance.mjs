#!/usr/bin/env node
import { runComplianceAudit } from "./lib/compliance-audit-core.mjs";

const result = runComplianceAudit({ auditId: "M17", maxClosedMilestone: 16 });
if (result.failed) process.exit(1);
console.log(
  `M17 audit OK — ${result.report.totalRequirements} requirements accounted (${result.summary.TESTED} TESTED, ${result.p0p1OpenCount} P0/P1 scheduled open)`,
);
