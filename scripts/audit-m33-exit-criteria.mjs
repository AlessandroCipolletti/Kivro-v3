#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");

const m33Ids = [
  ...Array.from({ length: 9 }, (_, i) => `SELLERUX-${String(i + 13).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, i) => `SELLERUX-${String(i + 24).padStart(3, "0")}`),
  "SELLERUX-038",
  "SELLERUX-040",
  "SELLERUX-041",
];

const rows = loadCoverageFromRepo(root).filter((r) => m33Ids.includes(r.id));
const open = rows.filter((r) => r.status !== "TESTED");

const criteria = [
  {
    id: "m32-regression-gate",
    status: (() => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/M32-exit-criteria.json"), "utf8"),
        ).m32HarnessComplete
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "verify:m32 / M32-exit-criteria.json",
  },
  {
    id: "sellerux-m33-tested",
    status: open.length === 0 ? "PASS" : "FAIL",
    detail: `${rows.length - open.length}/${rows.length} M33-scope SELLERUX rows TESTED`,
  },
  {
    id: "sellerux-gold-m33",
    status: (() => {
      const golden = JSON.parse(
        fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
      );
      const ids = golden.scenarios.map((s) => s.id);
      const required = [
        "SELLERUX-GOLD-007",
        "SELLERUX-GOLD-008",
        "SELLERUX-GOLD-009",
        "SELLERUX-GOLD-010",
        "SELLERUX-GOLD-011",
        "SELLERUX-GOLD-013",
        "SELLERUX-GOLD-014",
        "SELLERUX-GOLD-015",
      ];
      return required.every((id) => ids.includes(id)) ? "PASS" : "FAIL";
    })(),
    detail: "M33 exit SELLERUX-GOLD scenarios in golden registry",
  },
  {
    id: "m33-migration",
    status: fs.existsSync(
      path.join(root, "packages/database/prisma/migrations/20260410200000_m33_seller_operations/migration.sql"),
    )
      ? "PASS"
      : "FAIL",
    detail: "seller maintenance, concurrency, provider cost schema",
  },
  {
    id: "seller-operations-routes",
    status: fs.existsSync(path.join(root, "apps/api/src/routes/seller-operations.ts")) ? "PASS" : "FAIL",
    detail: "operations, economics, maintenance, notifications API",
  },
  {
    id: "seller-web-operations",
    status: fs.existsSync(path.join(root, "apps/web/src/app/seller/operations/page.tsx")) ? "PASS" : "FAIL",
    detail: "seller operations & economics UI",
  },
  {
    id: "verify-m33-script",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts["verify:m33"]
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "pnpm verify:m33 gate registered",
  },
  {
    id: "sellerux-spotcheck",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M33-spotcheck.json"), "utf8")).pass
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "M33-scope SELLERUX COVERAGE rows with evidence paths",
  },
];

const m33HarnessComplete = criteria.every((c) => c.status === "PASS");

const exitDoc = { generatedAt: new Date().toISOString(), m33HarnessComplete, criteria };

fs.writeFileSync(path.join(root, "docs/audits/M33-exit-criteria.json"), `${JSON.stringify(exitDoc, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M33-exit-criteria.md",
  ),
  [
    "# M33 exit criteria — seller operations, economics & reliability",
    "",
    `- **M33 harness complete:** ${m33HarnessComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);

if (!m33HarnessComplete) {
  console.error("M33 exit criteria FAIL");
  process.exit(1);
}

console.log("M33 exit criteria OK");
