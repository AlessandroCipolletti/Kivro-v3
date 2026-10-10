#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const ids = ["SELLERUX-036", "SELLERUX-037"];
const rows = loadCoverageFromRepo(root).filter((r) => ids.includes(r.id));
const open = rows.filter((r) => r.status !== "TESTED");

const criteria = [
  {
    id: "m33-regression-gate",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M33-exit-criteria.json"), "utf8"))
          .m33HarnessComplete
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "verify:m33 / M33-exit-criteria.json",
  },
  {
    id: "sellerux-m34-tested",
    status: open.length === 0 && rows.length === ids.length ? "PASS" : "FAIL",
    detail: `${rows.length - open.length}/${ids.length} M34 SELLERUX rows TESTED`,
  },
  {
    id: "sellerux-gold-019",
    status: (() => {
      const golden = JSON.parse(
        fs.readFileSync(path.join(root, "tests/fixtures/backend-conformance-golden.json"), "utf8"),
      );
      return golden.scenarios.some((s) => s.id === "SELLERUX-GOLD-019") ? "PASS" : "FAIL";
    })(),
    detail: "two-worker golden scenario",
  },
  {
    id: "m34-migration",
    status: fs.existsSync(
      path.join(root, "packages/database/prisma/migrations/20260410220000_m34_worker_routing/migration.sql"),
    )
      ? "PASS"
      : "FAIL",
    detail: "explicit worker routing policy",
  },
  {
    id: "seller-worker-routes",
    status: fs.existsSync(path.join(root, "apps/api/src/routes/seller-workers.ts")) ? "PASS" : "FAIL",
    detail: "list and assign Workers without singleton assumption",
  },
  {
    id: "verify-m34-script",
    status: JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts["verify:m34"]
      ? "PASS"
      : "FAIL",
    detail: "pnpm verify:m34 gate registered",
  },
  {
    id: "sellerux-spotcheck",
    status: (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M34-spotcheck.json"), "utf8")).pass
          ? "PASS"
          : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "M34 coverage evidence",
  },
];

const m34HarnessComplete = criteria.every((c) => c.status === "PASS");
fs.writeFileSync(
  path.join(root, "docs/audits/M34-exit-criteria.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), m34HarnessComplete, criteria }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(root, "docs/audits/M34-exit-criteria.md"),
  [
    "# M34 exit criteria — multi-Worker domain readiness",
    "",
    `- **M34 harness complete:** ${m34HarnessComplete}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...criteria.map((c) => `| ${c.id} | ${c.status} | ${c.detail} |`),
    "",
  ].join("\n"),
);
if (!m34HarnessComplete) {
  console.error("M34 exit criteria FAIL");
  process.exit(1);
}
console.log("M34 exit criteria OK");
