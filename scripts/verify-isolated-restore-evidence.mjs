#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const resilience = await import(path.join(root, "packages/resilience/dist/index.js"));

for (const required of [
  "docs/deploy/backup-restore-runbook.md",
  "docs/audits/M26-rpo-rto.json",
  "docs/audits/M26-reconciliation-alerts.json",
  "packages/resilience/fault-injection-matrix.json",
]) {
  if (!fs.existsSync(path.join(root, required))) {
    console.error(`Missing restore evidence artifact: ${required}`);
    process.exit(1);
  }
}

const clean = resilience.assertPostRestoreInvariants({
  jobsTotal: 100,
  terminalJobs: 40,
  ledgerEntries: 250,
  duplicateLedgerKeys: 0,
  openReservationsOnTerminal: 0,
});
if (!clean.ok) {
  console.error("Restore invariant harness failed on clean fixture");
  process.exit(1);
}

const dirty = resilience.assertPostRestoreInvariants({
  jobsTotal: 100,
  terminalJobs: 40,
  ledgerEntries: 250,
  duplicateLedgerKeys: 0,
  openReservationsOnTerminal: 2,
});
if (dirty.ok) {
  console.error("Expected open reservation violation to fail");
  process.exit(1);
}

console.log("Isolated restore evidence harness OK (HARD-015)");
