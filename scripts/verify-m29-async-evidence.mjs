#!/usr/bin/env node
/** M29 — direct evidence checks (maintenance sweeps, OpenAPI download parity, migration). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const maintenance = fs.readFileSync(
  path.join(root, "packages/cloud-core/src/cloud-maintenance-sweeps.ts"),
  "utf8",
);
if (!maintenance.includes("purgeExpiredJobDeliverables")) {
  console.error("cloud-maintenance-sweeps missing retention cleanup");
  process.exit(1);
}
if (!maintenance.includes("processPendingJobTerminalEmailNotifications")) {
  console.error("cloud-maintenance-sweeps missing terminal email processing");
  process.exit(1);
}
if (!maintenance.includes("sampleCompletedJobIntegrity")) {
  console.error("cloud-maintenance-sweeps missing completed integrity sample (ASYNC-028)");
  process.exit(1);
}

for (const rel of [
  "packages/cloud-netsons/src/netsons-maintenance-sweeps.ts",
  "packages/cloud-aws/src/aws-maintenance-sweeps.ts",
]) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  if (!src.includes("runCloudMaintenanceSweeps")) {
    console.error(`${rel} must delegate to shared runCloudMaintenanceSweeps`);
    process.exit(1);
  }
}

const openapi = fs.readFileSync(
  path.join(root, "apps/api/src/openapi/v1-buyer-api.spec.ts"),
  "utf8",
);
if (!openapi.includes("/jobs/{jobId}/assets/{assetRef}/download")) {
  console.error("v1 OpenAPI missing asset download route");
  process.exit(1);
}

if (
  !fs.existsSync(
    path.join(root, "packages/database/prisma/migrations/20260410150000_m29_async_retention/migration.sql"),
  )
) {
  console.error("Missing M29 migration");
  process.exit(1);
}

const workerDaemon = fs.readFileSync(path.join(root, "apps/worker/src/start-daemon.ts"), "utf8");
if (!workerDaemon.includes("structuredOutput") || !workerDaemon.includes("synthetic")) {
  console.error("Worker synthetic complete must send structuredOutput deliverables (M29)");
  process.exit(1);
}

const jobPayment = fs.readFileSync(path.join(root, "packages/billing/src/job-payment.ts"), "utf8");
if (!jobPayment.includes("jobInput.create")) {
  console.error("submitPaidJob must persist JobInput");
  process.exit(1);
}

console.log(
  "M29 async evidence OK (maintenance sweeps, v1 OpenAPI, migration, worker synthetic deliverables)",
);
