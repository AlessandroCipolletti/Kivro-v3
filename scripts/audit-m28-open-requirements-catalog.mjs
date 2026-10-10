#!/usr/bin/env node
/** M28 — machine-readable catalog of remaining open P0/P1 (scheduled post-M27). */
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";
import { hasExplicitScheduleNote } from "./lib/m28-family-rules.mjs";

const root = path.resolve(import.meta.dirname, "..");
const rows = loadCoverageFromRepo(root).filter(
  (r) =>
    (r.priority === "P0" || r.priority === "P1" || r.priority === "P2") &&
    ["TODO", "PARTIAL", "BLOCKED"].includes(r.status),
);

const unexplained = rows.filter((r) => !hasExplicitScheduleNote(r.notes));
const byPriority = {
  P0: rows.filter((r) => r.priority === "P0"),
  P1: rows.filter((r) => r.priority === "P1"),
  P2: rows.filter((r) => r.priority === "P2"),
};

function scheduledTarget(notes) {
  const m = (notes ?? "").match(/scheduled:(M\d+|post-MVP)/i);
  return m ? m[1].toUpperCase() : "UNSPECIFIED";
}

const openByScheduledTarget = {};
for (const row of rows) {
  const target = scheduledTarget(row.notes);
  if (!openByScheduledTarget[target]) {
    openByScheduledTarget[target] = { P0: 0, P1: 0, P2: 0 };
  }
  openByScheduledTarget[target][row.priority] += 1;
}

const catalog = {
  generatedAt: new Date().toISOString(),
  milestone: "M28",
  openP0Count: byPriority.P0.length,
  openP1Count: byPriority.P1.length,
  openP2Count: byPriority.P2.length,
  openByScheduledTarget,
  unexplainedOpenCount: unexplained.length,
  pass: unexplained.length === 0,
  sampleOpenP0: byPriority.P0.slice(0, 25).map((r) => ({
    id: r.id,
    status: r.status,
    notes: r.notes.slice(0, 120),
  })),
};

fs.writeFileSync(
  path.join(root, "docs/audits/M28-open-requirements-catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
);

if (!catalog.pass) {
  console.error(`M28 open requirements catalog FAIL — ${unexplained.length} unexplained P0/P1 open rows`);
  process.exit(1);
}

console.log(
  `M28 open requirements catalog OK (P0 ${catalog.openP0Count}, P1 ${catalog.openP1Count}, P2 ${catalog.openP2Count}; all scheduled)`,
);
