#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");

const m31Ids = [
  ...Array.from({ length: 10 }, (_, i) => `BUYERUX-${String(i + 15).padStart(3, "0")}`),
  "BUYERUX-032",
  "BUYERUX-033",
  "BUYERUX-034",
];

const rows = loadCoverageFromRepo(root).filter((r) => m31Ids.includes(r.id));
const open = rows.filter((r) => r.status !== "TESTED");

const criteria = [
  {
    id: "m30-regression-gate",
    status: (() => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/M30-exit-criteria.json"), "utf8"),
        ).m30HarnessComplete
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "verify:m30 / M30-exit-criteria.json",
  },
  {
    id: "buyerux-m31-tested",
    status: open.length === 0 ? "PASS" : "FAIL",
    detail: `${rows.length - open.length}/${rows.length} M31-scope BUYERUX rows TESTED`,
  },
  {
    id: "buyerux-gold-m31",
    status: (() => {
      const golden = JSON.parse(
        fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
      );
      const ids = golden.scenarios.map((s) => s.id);
      const required = [
        "BUYERUX-GOLD-007",
        "BUYERUX-GOLD-008",
        "BUYERUX-GOLD-009",
        "BUYERUX-GOLD-010",
        "BUYERUX-GOLD-014",
        "BUYERUX-GOLD-015",
      ];
      return required.every((id) => ids.includes(id)) ? "PASS" : "FAIL";
    })(),
    detail: "M31 exit BUYERUX-GOLD scenarios in golden registry",
  },
  {
    id: "m31-migration",
    status: fs.existsSync(
      path.join(root, "packages/database/prisma/migrations/20260410180000_m31_buyer_history/migration.sql"),
    )
      ? "PASS"
      : "FAIL",
    detail: "acknowledgement, problem reports, retention reminder schema",
  },
  {
    id: "buyer-job-history-routes",
    status: fs.existsSync(path.join(root, "apps/api/src/routes/buyer-job-history.ts")) ? "PASS" : "FAIL",
    detail: "reuse, acknowledge, problem-report, download-all API",
  },
  {
    id: "v1-m31-parity",
    status: fs.readFileSync(path.join(root, "apps/api/src/routes/v1-buyer-api.ts"), "utf8").includes(
      "/jobs/:jobId/assets/download-all",
    )
      ? "PASS"
      : "FAIL",
    detail: "v1 reuse/download-all/ack/problem-report parity",
  },
  {
    id: "plan-through-m31",
    status: fs.existsSync(path.join(root, "docs/audits/plan-through-M31.json")) ? "PASS" : "FAIL",
    detail: "IMPLEMENTATION-PLAN verify M03–M31 + M29–M31 harness snapshot",
  },
  {
    id: "buyerux-spotcheck",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M31-spotcheck.json"), "utf8")).pass
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "M31-scope BUYERUX COVERAGE rows with evidence paths",
  },
];

const m31HarnessComplete = criteria.every((c) => c.status === "PASS");

const exitDoc = { generatedAt: new Date().toISOString(), m31HarnessComplete, criteria };

fs.writeFileSync(path.join(root, "docs/audits/M31-exit-criteria.json"), `${JSON.stringify(exitDoc, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M31-exit-criteria.md"),
  [
    "# M31 exit criteria — buyer history & rich results",
    "",
    `- **M31 harness complete:** ${m31HarnessComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);

if (!m31HarnessComplete) {
  console.error("M31 exit criteria FAIL");
  process.exit(1);
}

console.log("M31 exit criteria OK");
