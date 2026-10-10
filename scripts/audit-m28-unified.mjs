#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { runComplianceAudit } from "./lib/compliance-audit-core.mjs";
import { runM28MandatoryChecks } from "./lib/m28-mandatory-runs.mjs";

const root = path.resolve(import.meta.dirname, "..");

function check(id, pass, detail) {
  return { id, pass, detail };
}

const readiness = [
  check(
    "verify-m28-gate",
    Boolean(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts["verify:m28"]),
    "package.json verify:m28",
  ),
  check(
    "verify-m27-chain",
    Boolean(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts["verify:m27"]),
    "M27 regression gate present",
  ),
  check(
    "master-spec-authoritative",
    fs.existsSync(path.join(root, "spec/MASTER-SPEC.md")),
    "spec/MASTER-SPEC.md",
  ),
  check(
    "coverage-catalog",
    fs.existsSync(path.join(root, "spec/COVERAGE.md")),
    "spec/COVERAGE.md",
  ),
];

const mandatoryRuns = runM28MandatoryChecks(root);

const readinessMd = [
  "## M28 terminal readiness",
  "",
  ...readiness.map((r) => `- ${r.id}: ${r.pass ? "PASS" : "FAIL"} — ${r.detail}`),
  "",
  "## Mandatory terminal runs",
  "",
  ...mandatoryRuns.map((r) => `- ${r.id}: ${r.pass ? "PASS" : "FAIL"} — ${r.detail}`),
  "",
].join("\n");

const result = runComplianceAudit({
  auditId: "M28",
  maxClosedMilestone: 27,
  markdownFooter: readinessMd,
});

const fullReport = {
  ...result.report,
  unifiedReadiness: readiness,
  mandatoryRuns,
  masterSpecCompletion: {
    p0: {
      tested: result.rows.filter((r) => r.priority === "P0" && r.status === "TESTED").length,
      todo: result.report.p0OpenCount,
    },
    p1: {
      tested: result.rows.filter((r) => r.priority === "P1" && r.status === "TESTED").length,
      todo: result.report.p1OpenCount,
    },
    p2: {
      tested: result.rows.filter((r) => r.priority === "P2" && r.status === "TESTED").length,
      todo: result.report.p2OpenCount,
    },
    productMasterSpecComplete:
      result.report.p0OpenCount === 0 &&
      result.report.p1OpenCount === 0 &&
      result.report.p2OpenCount === 0,
    note: "M28 terminal audit executed; remaining P0/P1/P2 TODO rows are scheduled M29+ unless counts are zero.",
  },
  requirementFamiliesArtifact: "docs/audits/M28-requirement-families.json",
  terminalSampleArtifact: "docs/audits/M28-master-spec-sample-audit.json",
};

fs.writeFileSync(
  path.join(root, "docs/audits/M28-compliance-report.json"),
  `${JSON.stringify(fullReport, null, 2)}\n`,
);

const hardFailReadiness = readiness.filter((r) => !r.pass);
const hardFailMandatory = mandatoryRuns.filter((r) => !r.pass);

if (hardFailReadiness.length > 0) {
  console.error("M28 unified readiness FAIL:");
  for (const r of hardFailReadiness) console.error(`  ${r.id}: ${r.detail}`);
  process.exit(1);
}

if (hardFailMandatory.length > 0) {
  console.error("M28 mandatory runs FAIL:");
  for (const r of hardFailMandatory) console.error(`  ${r.id}: ${r.detail}`);
  process.exit(1);
}

if (result.failed) process.exit(1);

console.log(
  `M28 unified audit OK — ${result.report.totalRequirements} requirements (${result.summary.TESTED} TESTED, P0 TODO ${result.report.p0OpenCount})`,
);
