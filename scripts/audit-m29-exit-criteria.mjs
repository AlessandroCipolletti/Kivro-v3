#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const asyncRows = loadCoverageFromRepo(root).filter((r) => r.id.startsWith("ASYNC-"));
const open = asyncRows.filter((r) => r.status !== "TESTED");

const criteria = [
  {
    id: "m28-regression-gate",
    status: (() => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/M28-exit-criteria.json"), "utf8"),
        ).m28HarnessComplete
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "verify:m28 / M28-exit-criteria.json",
  },
  {
    id: "async-requirements-tested",
    status: open.length === 0 ? "PASS" : "FAIL",
    detail: `${asyncRows.length - open.length}/${asyncRows.length} ASYNC rows TESTED`,
  },
  {
    id: "async-gold-registry",
    status: (() => {
      const golden = JSON.parse(
        fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
      );
      const ids = golden.scenarios.map((s) => s.id);
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) =>
        ids.includes(`ASYNC-GOLD-${String(n).padStart(3, "0")}`),
      )
        ? "PASS"
        : "FAIL";
    })(),
    detail: "ASYNC-GOLD-001..010 in golden registry",
  },
  {
    id: "cloud-finalization-barrier",
    status: fs.existsSync(path.join(root, "packages/job-delivery/src/cloud-finalization.ts"))
      ? "PASS"
      : "FAIL",
    detail: "COMPLETED requires cloud finalization barrier",
  },
  {
    id: "async-evidence-script",
    status: fs.existsSync(path.join(root, "scripts/verify-m29-async-evidence.mjs")) ? "PASS" : "FAIL",
    detail: "maintenance + OpenAPI + migration evidence",
  },
  {
    id: "v1-download-openapi",
    status: (() => {
      try {
        const spec = fs.readFileSync(
          path.join(root, "apps/api/src/openapi/v1-buyer-api.spec.ts"),
          "utf8",
        );
        return spec.includes("/jobs/{jobId}/assets/{assetRef}/download") ? "PASS" : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "REST v1 presigned download documented",
  },
  {
    id: "async-spotcheck",
    status: (() => {
      try {
        return readJson("docs/audits/M29-async-spotcheck.json").pass ? "PASS" : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "ASYNC-* COVERAGE rows TESTED with evidence paths",
  },
  {
    id: "dual-profile-maintenance",
    status: (() => {
      const paths = [
        "packages/cloud-netsons/src/netsons-maintenance-sweeps.ts",
        "packages/cloud-aws/src/aws-maintenance-sweeps.ts",
      ];
      return paths.every((rel) => {
        try {
          return fs.readFileSync(path.join(root, rel), "utf8").includes("runCloudMaintenanceSweeps");
        } catch {
          return false;
        }
      })
        ? "PASS"
        : "FAIL";
    })(),
    detail: "Netsons + AWS cron ticks run shared async maintenance sweeps",
  },
];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const m29HarnessComplete = criteria.every((c) => c.status === "PASS");

const exitDoc = {
  generatedAt: new Date().toISOString(),
  m29HarnessComplete,
  criteria,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M29-exit-criteria.json"),
  `${JSON.stringify(exitDoc, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M29-exit-criteria.md"),
  [
    "# M29 exit criteria — durable async buyer delivery",
    "",
    `- **M29 harness complete:** ${m29HarnessComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);

if (!m29HarnessComplete) {
  console.error("M29 exit criteria FAIL");
  process.exit(1);
}

console.log("M29 exit criteria OK — durable async buyer delivery harness complete");
