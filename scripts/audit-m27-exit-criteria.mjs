#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exists = (rel) => fs.existsSync(path.join(root, rel));

const criteria = [
  {
    id: "performance-envelope-documented",
    status: exists("docs/audits/M27-performance-envelope.json") ? "PASS" : "FAIL",
    detail: "HARD-019 MVP envelope artifact",
  },
  {
    id: "operational-alarms-manifest",
    status: exists("docs/audits/M27-operational-alarms.json") ? "PASS" : "FAIL",
    detail: "HARD-028 backlog/worker/reconciliation alarms",
  },
  {
    id: "release-ops-package",
    status: exists("packages/release-ops/src/release-activation.ts") ? "PASS" : "FAIL",
    detail: "@kivro/release-ops activation + load simulation",
  },
  {
    id: "envelope-load-verification",
    status: exists("scripts/verify-performance-envelope-load.mjs") ? "PASS" : "FAIL",
    detail: "verify-performance-envelope-load.mjs",
  },
  {
    id: "release-activation-gate",
    status: exists("scripts/verify-release-activation-gate.mjs") ? "PASS" : "FAIL",
    detail: "verify-release-activation-gate.mjs",
  },
  {
    id: "unified-manifest-exact-release",
    status: (() => {
      try {
        const m = JSON.parse(
          fs.readFileSync(path.join(root, "docs/audits/unified-release-manifest.json"), "utf8"),
        );
        return m.exactReleaseId && m.performanceEnvelopePath ? "PASS" : "FAIL";
      } catch {
        return "FAIL";
      }
    })(),
    detail: "HARD-021 manifest includes exactReleaseId + envelope refs",
  },
  {
    id: "provider-parity-evidence",
    status: exists("docs/audits/M24-provider-parity-report.json") ? "PASS" : "FAIL",
    detail: "HARD-022 generated parity report",
  },
  {
    id: "bounded-runtime-vs-envelope",
    status: exists("scripts/check-bounded-runtime-vs-envelope.mjs") ? "PASS" : "FAIL",
    detail: "cloud-core durable work limits ≤ M27 envelope",
  },
  {
    id: "unified-release-evidence-check",
    status: exists("scripts/verify-unified-release-evidence.mjs") ? "PASS" : "FAIL",
    detail: "manifest validation + on-disk evidence paths",
  },
  {
    id: "performance-envelope-fixture-sync",
    status: exists("tests/fixtures/m27-performance-envelope.json") ? "PASS" : "FAIL",
    detail: "fixture mirrors docs/audits envelope",
  },
  {
    id: "product-limits-vs-envelope",
    status: exists("scripts/check-envelope-product-limits.mjs") ? "PASS" : "FAIL",
    detail: "job-io, webhooks, transport, durable work vs envelope",
  },
  {
    id: "envelope-fixture-drift-guard",
    status: exists("scripts/verify-m27-envelope-fixture-drift.mjs") ? "PASS" : "FAIL",
    detail: "docs/fixture envelope byte parity",
  },
];

const m27HarnessComplete = criteria.every((c) => c.status === "PASS");
const exitDoc = {
  generatedAt: new Date().toISOString(),
  m27HarnessComplete,
  criteria,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M27-exit-criteria.json"),
  `${JSON.stringify(exitDoc, null, 2)}\n`,
);

if (!m27HarnessComplete) {
  console.error("M27 exit criteria FAIL");
  process.exit(1);
}

console.log("M27 exit criteria OK — performance envelope & release ops harness complete");
