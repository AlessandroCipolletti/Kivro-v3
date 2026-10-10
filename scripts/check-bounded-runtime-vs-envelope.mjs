#!/usr/bin/env node
/** M27 — durable work retry/batch limits must stay within HARD-019 envelope. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const releaseOps = await import(path.join(root, "packages/release-ops/dist/index.js"));
const cloudCore = await import(path.join(root, "packages/cloud-core/dist/index.js"));

const envelope = releaseOps.parsePerformanceEnvelope(
  JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M27-performance-envelope.json"), "utf8")),
);

const check = releaseOps.assertRuntimeWithinEnvelope({
  envelope,
  durableWorkMaxAttempts: cloudCore.DURABLE_WORK_MAX_ATTEMPTS,
  durableWorkDefaultBatchLimit: cloudCore.DURABLE_WORK_DEFAULT_BATCH_LIMIT,
});

if (!check.ok) {
  console.error("Bounded runtime check failed:", check.reason);
  process.exit(1);
}

console.log("Bounded runtime vs envelope OK (cloud-core durable work within M27 limits)");
