#!/usr/bin/env node
/** ARCH-UNI-009 — execute provider-neutral conformance against both composition roots. */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const res = spawnSync(
  "pnpm",
  [
    "exec",
    "vitest",
    "run",
    "packages/worker-transport/src/conformance.test.ts",
    "security/tests/acceptance-m19.test.ts",
    "security/tests/conformance-golden-m19.test.ts",
    "security/tests/conformance-golden-m24.test.ts",
    "security/tests/conformance-divergence-rejection-m24.test.ts",
    "security/tests/compatibility-matrix-m24.test.ts",
    "security/tests/compatibility-fail-closed-m25.test.ts",
    "security/tests/worker-backend-transition-m25.test.ts",
    "security/tests/conformance-dual-control-plane-restart-m25.test.ts",
    "security/tests/conformance-golden-m25.test.ts",
    "security/tests/conformance-dual-transport-m19.test.ts",
    "security/tests/conformance-dual-control-plane-m22.test.ts",
    "security/tests/conformance-both-roots-m19.test.ts",
    "security/tests/architecture-uni-023-m19.test.ts",
    "security/tests/architecture-fitness-m24.test.ts",
    "security/tests/fault-injection-convergence-m26.test.ts",
    "security/tests/fault-injection-control-plane-m26.test.ts",
    "packages/billing/src/job-completion-idempotency.test.ts",
    "packages/resilience/src/convergence.test.ts",
    "packages/resilience/src/cache-loss-recovery.test.ts",
    "packages/billing/src/ledger-idempotency.test.ts",
    "packages/billing/src/stripe-webhook-idempotency.test.ts",
    "packages/job-dispatch/src/worker-reconcile.test.ts",
    "security/tests/conformance-manifest-m19.test.ts",
    "packages/cloud-netsons/src/composition.test.ts",
    "packages/cloud-aws/src/composition.test.ts",
    "packages/worker-transport/src/multi-transport.test.ts",
    "packages/worker-transport/src/retry-backoff.test.ts",
  ],
  { cwd: root, stdio: "inherit" },
);
process.exit(res.status ?? 1);
