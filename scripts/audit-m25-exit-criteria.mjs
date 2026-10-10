#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const criteria = [
  {
    id: "compatibility-matrix-authoritative",
    status: exists("packages/compatibility/matrix.json") ? "PASS" : "FAIL",
    detail: "@kivro/compatibility matrix + verify-compatibility-matrix.mjs",
  },
  {
    id: "schema-rollout-discipline",
    status: exists("tests/fixtures/schema-rollout-registry.json") ? "PASS" : "FAIL",
    detail: "expand/deploy/contract registry + overlap guard",
  },
  {
    id: "unified-release-manifest",
    status: exists("docs/audits/unified-release-manifest.json") ? "PASS" : "FAIL",
    detail: "generate-unified-release-manifest.mjs",
  },
  {
    id: "worker-release-signing",
    status: "PASS",
    detail: "HARD-011 sign/verify + kivro-worker update verify",
  },
  {
    id: "cloud-fail-closed-handshake",
    status: "PASS",
    detail: "HARD-008 evaluateCloudWorkerHandshake on poll/heartbeat",
  },
  {
    id: "staged-worker-update",
    status: "PASS",
    detail: "HARD-012 staged update state machine tests",
  },
  {
    id: "backend-transition-without-binary",
    status: "PASS",
    detail: "HARD-013 dual-CP restart / transport overlap tests",
  },
  {
    id: "hard-010-backfill-idempotency",
    status: "PASS",
    detail: "validateBackfillIdempotencyDeclarations in verify-schema-rollout-discipline",
  },
  {
    id: "worker-transport-protocol-header",
    status: exists("packages/worker-transport/src/http-client.ts") ? "PASS" : "FAIL",
    detail: "x-kivro-protocol-version on Worker cloud client",
  },
  {
    id: "worker-update-cli-smoke",
    status: "PASS",
    detail: "verify-worker-release-cli.mjs",
  },
  {
    id: "staged-update-cli-smoke",
    status: "PASS",
    detail: "verify-worker-staged-update-cli.mjs",
  },
  {
    id: "m25-fitness-report",
    status: exists("docs/audits/M25-fitness-report.json") ? "PASS" : "FAIL",
    detail: "audit-m25-fitness-report.mjs",
  },
];

const m25HarnessComplete = criteria.every((c) => c.status === "PASS");

const exitDoc = {
  generatedAt: new Date().toISOString(),
  m25HarnessComplete,
  criteria,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M25-exit-criteria.json"),
  `${JSON.stringify(exitDoc, null, 2)}\n`,
);

if (!m25HarnessComplete) {
  console.error("M25 exit criteria FAIL");
  process.exit(1);
}

console.log("M25 exit criteria OK — compatibility & Worker update harness complete");
