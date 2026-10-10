#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");

const m32Ids = [
  ...Array.from({ length: 12 }, (_, i) => `SELLERUX-${String(i + 1).padStart(3, "0")}`),
  "SELLERUX-022",
  "SELLERUX-023",
  "SELLERUX-031",
  "SELLERUX-032",
  "SELLERUX-033",
  "SELLERUX-034",
  "SELLERUX-035",
  "SELLERUX-039",
];

const rows = loadCoverageFromRepo(root).filter((r) => m32Ids.includes(r.id));
const open = rows.filter((r) => r.status !== "TESTED");

const criteria = [
  {
    id: "m31-regression-gate",
    status: (() => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/M31-exit-criteria.json"), "utf8"),
        ).m31HarnessComplete
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "verify:m31 / M31-exit-criteria.json",
  },
  {
    id: "sellerux-m32-tested",
    status: open.length === 0 ? "PASS" : "FAIL",
    detail: `${rows.length - open.length}/${rows.length} M32-scope SELLERUX rows TESTED`,
  },
  {
    id: "sellerux-gold-m32",
    status: (() => {
      const golden = JSON.parse(
        fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
      );
      const ids = golden.scenarios.map((s) => s.id);
      const required = [
        "SELLERUX-GOLD-001",
        "SELLERUX-GOLD-002",
        "SELLERUX-GOLD-003",
        "SELLERUX-GOLD-004",
        "SELLERUX-GOLD-005",
        "SELLERUX-GOLD-006",
        "SELLERUX-GOLD-012",
        "SELLERUX-GOLD-016",
        "SELLERUX-GOLD-017",
        "SELLERUX-GOLD-018",
      ];
      return required.every((id) => ids.includes(id)) ? "PASS" : "FAIL";
    })(),
    detail: "M32 exit SELLERUX-GOLD scenarios in golden registry",
  },
  {
    id: "m32-migration",
    status: fs.existsSync(
      path.join(root, "packages/database/prisma/migrations/20260410190000_m32_seller_onboarding/migration.sql"),
    )
      ? "PASS"
      : "FAIL",
    detail: "seller identity + first publish tracking schema",
  },
  {
    id: "seller-onboarding-routes",
    status: fs.existsSync(path.join(root, "apps/api/src/routes/seller-onboarding.ts")) ? "PASS" : "FAIL",
    detail: "onboarding, readiness, preview, identity API",
  },
  {
    id: "seller-web-onboarding",
    status: fs.existsSync(path.join(root, "apps/web/src/app/seller/onboarding/page.tsx")) ? "PASS" : "FAIL",
    detail: "guided seller UI entry",
  },
  {
    id: "verify-m32-script",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts["verify:m32"]
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "pnpm verify:m32 gate registered",
  },
  {
    id: "sellerux-spotcheck",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M32-spotcheck.json"), "utf8")).pass
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "M32-scope SELLERUX COVERAGE rows with evidence paths",
  },
];

const m32HarnessComplete = criteria.every((c) => c.status === "PASS");

const exitDoc = { generatedAt: new Date().toISOString(), m32HarnessComplete, criteria };

fs.writeFileSync(path.join(root, "docs/audits/M32-exit-criteria.json"), `${JSON.stringify(exitDoc, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M32-exit-criteria.md"),
  [
    "# M32 exit criteria — seller onboarding & safe publication",
    "",
    `- **M32 harness complete:** ${m32HarnessComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);

if (!m32HarnessComplete) {
  console.error("M32 exit criteria FAIL");
  process.exit(1);
}

console.log("M32 exit criteria OK");
