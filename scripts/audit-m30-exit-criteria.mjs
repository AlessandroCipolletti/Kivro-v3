#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");

const m30Ids = [
  ...Array.from({ length: 14 }, (_, i) => `BUYERUX-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 7 }, (_, i) => `BUYERUX-${String(i + 25).padStart(3, "0")}`),
  ...Array.from({ length: 11 }, (_, i) => `BUYERUX-${String(i + 35).padStart(3, "0")}`),
];

const rows = loadCoverageFromRepo(root).filter((r) => m30Ids.includes(r.id));
const open = rows.filter((r) => r.status !== "TESTED");

const criteria = [
  {
    id: "m29-regression-gate",
    status: (() => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/M29-exit-criteria.json"), "utf8"),
        ).m29HarnessComplete
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "verify:m29 / M29-exit-criteria.json",
  },
  {
    id: "buyerux-m30-tested",
    status: open.length === 0 ? "PASS" : "FAIL",
    detail: `${rows.length - open.length}/${rows.length} M30-scope BUYERUX rows TESTED`,
  },
  {
    id: "buyerux-gold-m30",
    status: (() => {
      const golden = JSON.parse(
        fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
      );
      const ids = golden.scenarios.map((s) => s.id);
      const required = [
        "BUYERUX-GOLD-001",
        "BUYERUX-GOLD-002",
        "BUYERUX-GOLD-003",
        "BUYERUX-GOLD-004",
        "BUYERUX-GOLD-005",
        "BUYERUX-GOLD-006",
        "BUYERUX-GOLD-011",
        "BUYERUX-GOLD-012",
        "BUYERUX-GOLD-013",
        "BUYERUX-GOLD-016",
        "BUYERUX-GOLD-017",
        "BUYERUX-GOLD-018",
      ];
      return required.every((id) => ids.includes(id)) ? "PASS" : "FAIL";
    })(),
    detail: "M30 exit BUYERUX-GOLD scenarios in golden registry",
  },
  {
    id: "buyer-experience-package",
    status: fs.existsSync(path.join(root, "packages/buyer-experience/src/index.ts")) ? "PASS" : "FAIL",
    detail: "shared @kivro/buyer-experience Core semantics",
  },
  {
    id: "m30-migration",
    status: fs.existsSync(
      path.join(root, "packages/database/prisma/migrations/20260410160000_m30_buyer_experience/migration.sql"),
    )
      ? "PASS"
      : "FAIL",
    detail: "quotes, deadlines, notification preferences schema",
  },
  {
    id: "buyerux-spotcheck",
    status: (() => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/M30-spotcheck.json"), "utf8"),
        ).pass
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "M30-scope BUYERUX COVERAGE rows with evidence paths",
  },
  {
    id: "v1-quote-preflight",
    status: fs.readFileSync(path.join(root, "apps/api/src/routes/v1-buyer-api.ts"), "utf8").includes(
      "/capabilities/:id/quote",
    )
      ? "PASS"
      : "FAIL",
    detail: "REST v1 quote + preflight parity",
  },
];

const m30HarnessComplete = criteria.every((c) => c.status === "PASS");

const exitDoc = {
  generatedAt: new Date().toISOString(),
  m30HarnessComplete,
  criteria,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M30-exit-criteria.json"),
  `${JSON.stringify(exitDoc, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M30-exit-criteria.md"),
  [
    "# M30 exit criteria — buyer predictability",
    "",
    `- **M30 harness complete:** ${m30HarnessComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);

if (!m30HarnessComplete) {
  console.error("M30 exit criteria FAIL");
  process.exit(1);
}

console.log("M30 exit criteria OK");
