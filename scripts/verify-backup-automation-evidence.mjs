#!/usr/bin/env node
/** M26 / HARD-014 — backup expectations documented for both profiles (not config-only claims). */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const runbookPath = path.join(root, "docs/deploy/backup-restore-runbook.md");
const runbook = fs.readFileSync(runbookPath, "utf8");

for (const token of ["Netsons", "AWS", "PostgreSQL", "isolated"]) {
  if (!runbook.includes(token)) {
    console.error(`backup-restore-runbook.md missing required token: ${token}`);
    process.exit(1);
  }
}

const rpo = JSON.parse(
  fs.readFileSync(path.join(root, "docs/audits/M26-rpo-rto.json"), "utf8"),
);
if (rpo.postgresql?.rpoMinutes == null || rpo.objectStorage?.rpoMinutes == null) {
  console.error("M26-rpo-rto.json must declare PostgreSQL and object-storage RPO");
  process.exit(1);
}

console.log("Backup automation evidence OK (both profiles + declared RPO)");
