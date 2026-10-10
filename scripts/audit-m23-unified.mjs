#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { runComplianceAudit } from "./lib/compliance-audit-core.mjs";
import { runM23CompositionParityCheck, runM23MandatoryChecks } from "./lib/m23-mandatory-runs.mjs";

const root = path.resolve(import.meta.dirname, "..");

function check(id, pass, detail) {
  return { id, pass, detail };
}

const readiness = [];

readiness.push(
  check(
    "single-schema",
    fs.existsSync(path.join(root, "packages/database/prisma/schema.prisma")) &&
      fs.existsSync(path.join(root, "packages/database/prisma/migrations")),
    "packages/database/prisma",
  ),
);

readiness.push(
  check(
    "dual-composition-roots",
    fs.existsSync(path.join(root, "packages/cloud-netsons/src/composition.ts")) &&
      fs.existsSync(path.join(root, "packages/cloud-aws/src/composition.ts")),
    "cloud-netsons + cloud-aws",
  ),
);

readiness.push(
  check(
    "conformance-manifest",
    fs.existsSync(path.join(root, "tests/fixtures/backend-conformance-manifest.json")),
    "backend-conformance-manifest.json",
  ),
);

readiness.push(
  check(
    "verify-m22-gate",
    (() => {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      return Boolean(pkg.scripts["verify:m22"] && pkg.scripts["verify:m23"]);
    })(),
    "package.json verify:m22 + verify:m23",
  ),
);

const stagingOptional = [
  {
    id: "netsons-staging-e2e",
    env: ["KIVRO_NETSONS_STAGING_URL", "KIVRO_E2E_BUYER_EMAIL", "KIVRO_E2E_SELLER_EMAIL"],
  },
  {
    id: "aws-staging-e2e",
    env: ["KIVRO_AWS_STAGING_URL", "KIVRO_E2E_BUYER_EMAIL", "KIVRO_E2E_SELLER_EMAIL"],
  },
  {
    id: "dual-control-plane-staging",
    env: ["KIVRO_M22_STAGING_URL"],
  },
];

for (const item of stagingOptional) {
  const missing = item.env.filter((k) => !process.env[k]?.trim());
  readiness.push(
    check(
      item.id,
      true,
      missing.length > 0
        ? `SKIP (unset: ${missing.join(", ")})`
        : "env configured — run scripts/verify-m23-staging-bundle.mjs",
    ),
  );
}

const mandatoryRuns = [...runM23MandatoryChecks(root), runM23CompositionParityCheck(root)];

const readinessMd = [
  "## Unified readiness (M23 IMPLEMENTATION-PLAN)",
  "",
  ...readiness.map((r) => `- ${r.id}: ${r.pass ? "PASS/SKIP" : "FAIL"} — ${r.detail}`),
  "",
  "## Mandatory automated runs (code/tests, not COVERAGE trust)",
  "",
  ...mandatoryRuns.map((r) => `- ${r.id}: ${r.pass ? "PASS" : "FAIL"} — ${r.detail}`),
  "",
].join("\n");

const result = runComplianceAudit({
  auditId: "M23",
  maxClosedMilestone: 22,
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
    note: "Full P0/P1/P2 completion required at M28 terminal audit; M23 enforces traceability + automatable gates.",
  },
  terminalAuditNote:
    "Lossless Master Spec proof and staging paid E2E remain M28; M23 proves unified-backend audit harness through M22.",
};

fs.writeFileSync(
  path.join(root, "docs/audits/M23-compliance-report.json"),
  `${JSON.stringify(fullReport, null, 2)}\n`,
);

const hardFailReadiness = readiness.filter((r) => !r.pass);
const hardFailMandatory = mandatoryRuns.filter((r) => !r.pass);

if (hardFailReadiness.length > 0) {
  console.error("M23 unified readiness FAIL:");
  for (const r of hardFailReadiness) {
    console.error(`  ${r.id}: ${r.detail}`);
  }
  process.exit(1);
}

if (hardFailMandatory.length > 0) {
  console.error("M23 mandatory runs FAIL:");
  for (const r of hardFailMandatory) {
    console.error(`  ${r.id}: ${r.detail}`);
  }
  process.exit(1);
}

if (result.failed) process.exit(1);

console.log(
  `M23 unified audit OK — ${result.report.totalRequirements} requirements (${result.summary.TESTED} TESTED, P0 TODO ${result.report.p0OpenCount}, P1 TODO ${result.report.p1OpenCount})`,
);
