#!/usr/bin/env node
/** M27 — job-io / webhooks / transport / durable-work caps vs HARD-019 envelope. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const releaseOps = await import(path.join(root, "packages/release-ops/dist/index.js"));
const cloudCore = await import(path.join(root, "packages/cloud-core/dist/index.js"));
const jobIo = await import(path.join(root, "packages/job-io/dist/index.js"));
const buyerWebhooks = await import(path.join(root, "packages/buyer-webhooks/dist/index.js"));
const workerTransport = await import(path.join(root, "packages/worker-transport/dist/index.js"));

const envelope = releaseOps.parsePerformanceEnvelope(
  JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M27-performance-envelope.json"), "utf8")),
);

const check = releaseOps.assertProductLimitsWithinEnvelope({
  envelope,
  limits: {
    buyerWebhookMaxAttempts: buyerWebhooks.BUYER_WEBHOOK_MAX_TOTAL_ATTEMPTS,
    buyerWebhookRetryBatchLimit: buyerWebhooks.BUYER_WEBHOOK_RETRY_BATCH_LIMIT,
    jobIoDefaultMaxFileSizeBytes: jobIo.DEFAULT_MAX_FILE_SIZE_BYTES_PER_JOB,
    pollingTransportMaxAttempts: workerTransport.DEFAULT_POLLING_RETRY_POLICY.maxAttempts,
    durableWorkMaxAttempts: cloudCore.DURABLE_WORK_MAX_ATTEMPTS,
    durableWorkDefaultBatchLimit: cloudCore.DURABLE_WORK_DEFAULT_BATCH_LIMIT,
  },
});

if (!check.ok) {
  console.error("Product limits vs envelope failed:", check.reason);
  process.exit(1);
}

console.log("Product runtime limits vs envelope OK (uploads, webhooks, transport, durable work)");
