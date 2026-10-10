#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const maintenance = fs.readFileSync(
  path.join(root, "packages/cloud-core/src/cloud-maintenance-sweeps.ts"),
  "utf8",
);
if (!maintenance.includes("expireJobsPastHardDeadline")) {
  console.error("maintenance missing hard deadline sweep");
  process.exit(1);
}
if (!maintenance.includes("processDueScheduledJobReminders")) {
  console.error("maintenance missing scheduled job reminders");
  process.exit(1);
}

const v1 = fs.readFileSync(path.join(root, "apps/api/src/routes/v1-buyer-api.ts"), "utf8");
if (!v1.includes("/capabilities/:id/quote") || !v1.includes("/capabilities/:id/preflight")) {
  console.error("v1 buyer API missing quote/preflight routes");
  process.exit(1);
}

const agent = fs.readFileSync(path.join(root, "apps/api/src/routes/marketplace-agent.ts"), "utf8");
if (!agent.includes("planStepEstimatedMinutes")) {
  console.error("marketplace agent must enforce plan hard deadlines");
  process.exit(1);
}

const worker = fs.readFileSync(path.join(root, "apps/api/src/routes/worker-jobs.ts"), "utf8");
if (!worker.includes("buildMinimizedWorkerExecutionBundle")) {
  console.error("worker execution bundle must be minimized");
  process.exit(1);
}

console.log("M30 buyer experience evidence OK");
