#!/usr/bin/env node
/** M24 — golden scenario registry must map to executable tests (both-provider neutral). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registryPath = path.join(root, "tests/fixtures/backend-conformance-golden.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const testCorpus = [
  "security/tests/conformance-golden-m19.test.ts",
  "security/tests/conformance-golden-m24.test.ts",
  "security/tests/conformance-dual-control-plane-m22.test.ts",
  "security/tests/architecture-uni-023-m19.test.ts",
  "security/tests/conformance-both-roots-m19.test.ts",
  "security/tests/compatibility-matrix-m24.test.ts",
  "security/tests/m08-payment-db.test.ts",
  "scripts/verify-m08-flow.mjs",
  "security/tests/conformance-manifest-m19.test.ts",
  "security/tests/conformance-divergence-rejection-m24.test.ts",
  "scripts/check-golden-registry-shape.mjs",
  "security/tests/compatibility-fail-closed-m25.test.ts",
  "security/tests/worker-backend-transition-m25.test.ts",
  "security/tests/conformance-dual-control-plane-restart-m25.test.ts",
  "packages/compatibility/src/worker-release-signing.test.ts",
  "packages/compatibility/src/protocol-overlap.test.ts",
  "packages/worker-transport/src/http-client.test.ts",
  "packages/worker-store/src/staged-update.test.ts",
  "security/tests/conformance-golden-m25.test.ts",
  "apps/api/src/services/worker-compatibility-gate.test.ts",
  "security/tests/fault-injection-convergence-m26.test.ts",
  "security/tests/fault-injection-control-plane-m26.test.ts",
  "packages/billing/src/job-completion-idempotency.test.ts",
  "packages/resilience/src/convergence.test.ts",
  "packages/resilience/src/cache-loss-recovery.test.ts",
  "packages/billing/src/ledger-idempotency.test.ts",
  "packages/billing/src/stripe-webhook-idempotency.test.ts",
  "packages/job-dispatch/src/worker-reconcile.test.ts",
  "security/tests/fault-injection-transport-ack-m26.test.ts",
  "packages/release-ops/src/performance-envelope.test.ts",
  "packages/release-ops/src/load-simulation.test.ts",
  "packages/release-ops/src/release-activation.test.ts",
  "packages/release-ops/src/operational-alarms.test.ts",
  "security/tests/performance-envelope-m27.test.ts",
  "security/tests/release-activation-m27.test.ts",
  "security/tests/release-activation-rejection-m27.test.ts",
  "security/tests/conformance-golden-m27.test.ts",
  "packages/release-ops/src/bounded-runtime.test.ts",
  "packages/release-ops/src/envelope-product-limits.test.ts",
  "security/tests/conformance-unified-audit-m28.test.ts",
  "security/tests/acceptance-m28-exit.test.ts",
  "security/tests/conformance-golden-m28.test.ts",
  "security/tests/conformance-async-gold-m29.test.ts",
  "packages/job-delivery/src/cloud-finalization.test.ts",
  "security/tests/buyer-result-auth-m29.test.ts",
  "packages/billing/src/job-completion-barrier-m29.test.ts",
]
  .map((rel) => fs.readFileSync(path.join(root, rel), "utf8"))
  .join("\n");

let missing = 0;
for (const scenario of registry.scenarios) {
  if (!scenario.id) {
    console.error("Scenario missing id");
    missing += 1;
    continue;
  }
  if (!testCorpus.includes(scenario.id)) {
    console.error(`Golden registry ${scenario.id} not referenced in conformance test suites`);
    missing += 1;
  }
}

if (missing > 0) {
  process.exit(1);
}

console.log(`Golden registry OK (${registry.scenarios.length} scenarios wired to tests)`);
