#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { runComplianceAudit } from "./lib/compliance-audit-core.mjs";

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
    "architecture-lint",
    fs.existsSync(path.join(root, "scripts/check-architecture.mjs")),
    "check-architecture.mjs",
  ),
);

readiness.push(
  check(
    "verify-m22-gate",
    (() => {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      return Boolean(pkg.scripts["verify:m22"]);
    })(),
    "package.json verify:m22",
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
        : "env configured — run verify:m20/m21/m22 staging scripts",
    ),
  );
}

const result = runComplianceAudit({ auditId: "M23", maxClosedMilestone: 22 });

const fullReport = {
  ...result.report,
  unifiedReadiness: readiness,
  terminalAuditNote:
    "Full P0/P1/P2 completion and lossless Master Spec proof remain M28; M23 extends traceability through M22 and records unified-backend readiness.",
};

fs.writeFileSync(
  path.join(root, "docs/audits/M23-compliance-report.json"),
  `${JSON.stringify(fullReport, null, 2)}\n`,
);

const readinessMd = readiness
  .map((r) => `- ${r.id}: ${r.pass ? "PASS/SKIP" : "FAIL"} — ${r.detail}`)
  .join("\n");

fs.appendFileSync(
  path.join(root, "docs/audits/M23-compliance-report.md"),
  ["", "## Unified readiness (M23 IMPLEMENTATION-PLAN)", "", readinessMd, ""].join("\n"),
);

const hardFail = readiness.filter((r) => !r.pass);
if (hardFail.length > 0) {
  console.error("M23 unified readiness FAIL:");
  for (const r of hardFail) {
    console.error(`  ${r.id}: ${r.detail}`);
  }
  process.exit(1);
}

if (result.failed) process.exit(1);

console.log(
  `M23 unified audit OK — ${result.report.totalRequirements} requirements (${result.summary.TESTED} TESTED, P0 TODO ${result.report.p0OpenCount}, P1 TODO ${result.report.p1OpenCount})`,
);
